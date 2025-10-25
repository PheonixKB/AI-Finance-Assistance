# backend/ai.py
import os
from fastapi import APIRouter, HTTPException, Request, Depends
from pydantic import BaseModel
from dotenv import load_dotenv
from .users import get_current_user
from .permissions import get_user_permissions
from database.db import get_db_connection # Import get_db_connection for direct DB access if needed

import bleach

try:
    from openai import OpenAI, APIError
except ImportError:
    OpenAI = None
    APIError = None

load_dotenv()
router = APIRouter()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "").strip()

class QueryModel(BaseModel):
    query: str

@router.post("/ask")
async def ask_finance_assistant(item: QueryModel, user: dict = Depends(get_current_user)):
    query = bleach.clean(item.query.strip())
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

    answer = "I am currently unable to connect to the AI service. Please try again later." 
    insights = []
    return {"answer": answer, "insights": insights}


