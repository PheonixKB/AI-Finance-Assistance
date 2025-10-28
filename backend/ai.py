# backend/ai.py
import os
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from dotenv import load_dotenv
from users import get_current_user
from permissions import get_user_permissions
from finance_data import get_db_connection # Import get_db_connection for direct DB access if needed

import bleach

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
    user_id = user["id"]
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


