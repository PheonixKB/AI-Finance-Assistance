import os
import datetime
import bleach
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from dotenv import load_dotenv
from users import get_current_user
from permissions import get_user_permissions
from db import get_db_connection

try:
    from openai import OpenAI, APIError
except ImportError:
    OpenAI = None
    APIError = None

# -------------------------------------------------------------------
# Load API key
# -------------------------------------------------------------------
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "").strip()
openai_client = OpenAI(api_key=OPENAI_API_KEY)
router = APIRouter()

# -------------------------------------------------------------------
# Limits
# -------------------------------------------------------------------
free_ai_requests = {}
FREE_AI_LIMIT = 5
AUTHENTICATED_AI_LIMIT = 50

# -------------------------------------------------------------------
# Schema
# -------------------------------------------------------------------
class QueryModel(BaseModel):
    query: str


# -------------------------------------------------------------------
# Utility: Fetch user finance data
# -------------------------------------------------------------------
def get_user_finance_data(user_id: int, permissions: dict):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    finance_data = {}
    try:
        # Fetch assets
        if permissions.get("assets"):
            cursor.execute("SELECT * FROM assets WHERE user_id = %s", (user_id,))
            finance_data["assets"] = cursor.fetchall()

        # Fetch liabilities
        if permissions.get("liabilities"):
            cursor.execute("SELECT * FROM liabilities WHERE user_id = %s", (user_id,))
            finance_data["liabilities"] = cursor.fetchall()

        # Fetch transactions
        if permissions.get("transactions"):
            cursor.execute("SELECT * FROM transactions WHERE user_id = %s ORDER BY date DESC LIMIT 10", (user_id,))
            finance_data["transactions"] = cursor.fetchall()

        # Fetch investments
        if permissions.get("investments"):
            cursor.execute("SELECT * FROM investments WHERE user_id = %s", (user_id,))
            finance_data["investments"] = cursor.fetchall()

        # Fetch EPF
        if permissions.get("epf"):
            cursor.execute("SELECT * FROM epf WHERE user_id = %s", (user_id,))
            finance_data["epf"] = cursor.fetchall()

        # Fetch credit score
        cursor.execute("SELECT credit_score FROM user_summary WHERE user_id = %s", (user_id,))
        row = cursor.fetchone()
        finance_data["credit_score"] = row["credit_score"] if row else None

    finally:
        cursor.close()
        conn.close()

    return finance_data


# -------------------------------------------------------------------
# Route: AI Chat
# -------------------------------------------------------------------
@router.post("/ask")
async def ask_finance_assistant(item: QueryModel, request: Request):
    query = bleach.clean(item.query.strip())
    user = get_current_user(request)
    user_id = user["id"] if user else None
    today = datetime.date.today().isoformat()

    # -------------------- FREE LIMIT --------------------
    if not user_id:
        client_ip = request.client.host
        if client_ip not in free_ai_requests:
            free_ai_requests[client_ip] = {"count": 0, "last_reset": today}

        if free_ai_requests[client_ip]["last_reset"] != today:
            free_ai_requests[client_ip]["count"] = 0
            free_ai_requests[client_ip]["last_reset"] = today

        if free_ai_requests[client_ip]["count"] >= FREE_AI_LIMIT:
            raise HTTPException(status_code=429, detail="Free AI limit exceeded. Sign in for more access.")
        free_ai_requests[client_ip]["count"] += 1
    # -------------------- AUTH LIMIT --------------------
    else:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        try:
            cursor.execute("SELECT ai_query_count, last_query_date FROM users WHERE id = %s", (user_id,))
            data = cursor.fetchone()
            count = data["ai_query_count"]
            last_date = data["last_query_date"]

            if last_date and last_date.isoformat() != today:
                count = 0

            if count >= AUTHENTICATED_AI_LIMIT:
                raise HTTPException(status_code=429, detail="Daily AI query limit exceeded.")

            cursor.execute(
                "UPDATE users SET ai_query_count = %s, last_query_date = %s WHERE id = %s",
                (count + 1, today, user_id),
            )
            conn.commit()
        finally:
            cursor.close()
            conn.close()

    # -------------------- GET PERMISSIONS + DATA --------------------
    permissions = get_user_permissions(user_id)
    finance_data = get_user_finance_data(user_id, permissions)

    # -------------------- OPENAI CHAT --------------------
    if OpenAI is not None and OPENAI_API_KEY:
        try:
            system_prompt = (
                "You are an AI personal finance assistant.\n"
                f"User financial data: {finance_data}\n"
                f"Data permissions: {permissions}\n"
                "Answer clearly, give insights and simple explanations."
            )
            client = OpenAI(api_key=OPENAI_API_KEY)
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": query},
                ],
            )
            answer = response.choices[0].message.content
            return {"answer": answer, "insights": finance_data}
        except APIError as e:
            raise HTTPException(status_code=502, detail=f"AI API error: {str(e)}")

    # Fallback if API key not set
    return {
        "answer": f"[MOCK RESPONSE] Finance data: {finance_data}",
        "insights": finance_data,
    }
