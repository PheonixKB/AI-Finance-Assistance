# backend/ai.py
import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv

# Optional: use OpenAI client if available
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
async def ask_finance_assistant(item: QueryModel):
    """
    Accepts JSON: { "query": "...", "permissions": {...} }
    If OPENAI_API_KEY is set and OpenAI client is available, attempt a chat completion.
    Otherwise, return a safe fake answer for local testing.
    """
    query = item.query.strip()
    permissions = item.permissions or {}

    if not query:
        raise HTTPException(status_code=400, detail="Query is required")

    # If OpenAI client is available and API key is present, call it
    if OpenAI is not None and OPENAI_API_KEY:
        try:
            client = OpenAI(api_key=OPENAI_API_KEY)
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "system",
                        "content": f"You are an AI personal finance assistant. Data permissions: {permissions}."
                    },
                    {"role": "user", "content": query},
                ],
            )
            # Depending on client library shape; handle gracefully
            answer = ""
            try:
                answer = response.choices[0].message.content
            except Exception:
                # If the response shape is different, try alternative keys
                answer = getattr(response, "text", None) or str(response)
            return {"answer": answer, "insights": []}
        except Exception as e:
            # don't leak provider internals to clients; return an error message
            raise HTTPException(status_code=502, detail=f"AI provider error: {str(e)}")

    # Fallback for local testing: return a canned answer + simple insights
    fake_answer = f"[FAKE ANSWER] I received your query: {query}"
    fake_insights = [f"Example insight for permission key: {k}" for k in permissions.keys()]
    return {"answer": fake_answer, "insights": fake_insights}
