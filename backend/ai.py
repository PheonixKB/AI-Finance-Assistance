# backend/ai.py
import os
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from dotenv import load_dotenv
from finance_data import get_user_finance
from users import get_current_user
from permissions import get_user_permissions

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
            except (KeyError, IndexError):
                answer = getattr(response, "text", None) or str(response)
            return {"answer": answer, "insights": []}
        except APIError as e:
            raise HTTPException(status_code=502, detail=f"AI provider error: {str(e)}")

    answer = "[FAKE ANSWER] "
    found = False
    query_lower = query.lower()

    # Make a mapping from permitted key to display name
    field_name_map = {
        "assets": "assets",
        "liabilities": "liabilities",
        "transactions": "transactions",
        "investments": "investments",
        "epf": "EPF balance",
        "creditScore": "credit score"
    }

    for key, display_name in field_name_map.items():
        if permissions.get(key) and display_name in query_lower:
            # For EPF/creditScore, data is a value; others are dicts
            data_val = finance_data.get(key)
            if isinstance(data_val, dict):
                answer += f"Your {display_name}: {data_val}.\n"
            else:
                answer += f"Your {display_name} is {data_val}.\n"
            found = True

    if not found:
        # If no direct field match, still mention permitted categories
        answer += f"Categories you granted: {list(finance_data.keys())}"

    insights = [f"Data for {k}: {v}" for k, v in finance_data.items()]
    return {"answer": answer, "insights": insights}


