# backend/ai.py
import os
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from dotenv import load_dotenv
from finance_data import get_user_finance
from users import get_current_user

try:
    from openai import OpenAI
except Exception:
    OpenAI = None

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))
router = APIRouter()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "").strip()

class QueryModel(BaseModel):
    query: str
    permissions: dict = {}

@router.post("/ask")
async def ask_finance_assistant(item: QueryModel, request: Request):
    query = item.query.strip()
    permissions = item.permissions or {}
    user = get_current_user(request)
    user_id = user["id"]

    # Step 1: Get finance data per permissions
    finance_data = get_user_finance(user_id, permissions)

    # Step 2: Pass finance_data to AI if available
    if OpenAI is not None and OPENAI_API_KEY:
        # System prompt contains user data
        system_message = (
            "You are an AI personal finance assistant.\n"
            f"User data (based on permissions): {finance_data}\n"
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
            except Exception:
                answer = getattr(response, "text", None) or str(response)
            return {"answer": answer, "insights": []}
        except Exception as e:
            raise HTTPException(status_code=502, detail=f"AI provider error: {str(e)}")

    # Fallback (local testing): canned answer using finance_data
    answer = "[FAKE ANSWER] "
    if "credit score" in query.lower() and permissions.get("creditScore"):
        cs = finance_data.get("creditScore")
        if cs:
            answer += f"Your credit score is {cs}."
        else:
            answer += "Credit score not found."
    else:
        answer += f"Categories you granted: {list(finance_data.keys())}"

    insights = [f"Data for {k}: {v}" for k, v in finance_data.items()]
    return {"answer": answer, "insights": insights}

