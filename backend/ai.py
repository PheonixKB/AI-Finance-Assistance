# backend/ai.py
import os
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from dotenv import load_dotenv
from users import get_current_user
from permissions import get_user_permissions
from db import get_db_connection

import bleach
import datetime

# In-memory storage for free AI requests per IP address, including a timestamp for daily resets
free_ai_requests = {}
FREE_AI_LIMIT = 5 # Example daily limit for free users
AUTHENTICATED_AI_LIMIT = 50 # Example daily limit for authenticated users

try:
    from openai import OpenAI, APIError
except ImportError:
    OpenAI = None
    APIError = None

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))
router = APIRouter()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "").strip()

class QueryModel(BaseModel):
    query: str

@router.post("/ask")
async def ask_finance_assistant(item: QueryModel, request: Request):
    query = bleach.clean(item.query.strip())
    user = get_current_user(request)
    user_id = user["id"] if user else None
    today = datetime.date.today().isoformat()

    # Implement free AI input limits for unauthenticated users
    if not user_id:
        client_ip = request.client.host
        if client_ip not in free_ai_requests:
            free_ai_requests[client_ip] = {"count": 0, "last_reset_day": today}
        
        # Reset count if the day has changed
        if free_ai_requests[client_ip]["last_reset_day"] != today:
            free_ai_requests[client_ip]["count"] = 0
            free_ai_requests[client_ip]["last_reset_day"] = today
        
        if free_ai_requests[client_ip]["count"] >= FREE_AI_LIMIT:
            raise HTTPException(status_code=429, detail=f"Free AI input limit ({FREE_AI_LIMIT}) exceeded. Please sign in for unlimited access.")
        
        free_ai_requests[client_ip]["count"] += 1
    else: # Authenticated user
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        try:
            cursor.execute("SELECT ai_query_count, last_query_date FROM users WHERE id = %s", (user_id,))
            user_data = cursor.fetchone()

            current_count = user_data["ai_query_count"]
            last_query_date = user_data["last_query_date"]

            if last_query_date and last_query_date.isoformat() != today:
                current_count = 0 # Reset count for a new day
            
            if current_count >= AUTHENTICATED_AI_LIMIT:
                raise HTTPException(status_code=429, detail=f"Daily AI input limit ({AUTHENTICATED_AI_LIMIT}) exceeded. Please upgrade your plan for more access.")
            
            # Increment count and update last query date
            new_count = current_count + 1
            cursor.execute("UPDATE users SET ai_query_count = %s, last_query_date = %s WHERE id = %s", (new_count, today, user_id))
            conn.commit()
        finally:
            cursor.close()
            conn.close()

    permissions = get_user_permissions(user_id)

    # Fetch summary finance data directly
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    summary_finance_data = {}
    try:
        cursor.execute("SELECT credit_score, epf_balance FROM user_summary WHERE user_id = %s", (user_id,))
        summary_finance_data = cursor.fetchone() or {}
    finally:
        cursor.close()
        conn.close()

    # Step 2: Pass finance_data to AI if available
    if OpenAI is not None and OPENAI_API_KEY:
        # System prompt contains user data
        system_message = (
            "You are an AI personal finance assistant.\n"
            f"User summary data: {summary_finance_data}\n"
            f"Data permissions: {permissions}."
        )

        try:
            client = OpenAI(api_key=OPENAI_API_KEY)
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_message},
                    {"role": "user", "content": query},
                ],
            )
            answer = ""
            try:
                answer = response.choices[0].message.content
            except (KeyError, IndexError):
                answer = getattr(response, "text", None) or str(response)
            return {"answer": answer, "insights": []}
        except APIError as e:
            raise HTTPException(status_code=502, detail=f"AI provider error: {str(e)}")

    answer = "[FAKE ANSWER] "
    answer += f"User summary data: {summary_finance_data}. "
    answer += f"Data permissions: {permissions}."

    insights = [f"Credit Score: {summary_finance_data.get('credit_score')}", f"EPF Balance: {summary_finance_data.get('epf_balance')}"]
    return {"answer": answer, "insights": insights}


