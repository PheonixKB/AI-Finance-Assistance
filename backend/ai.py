import os
from fastapi import APIRouter, Request, HTTPException, Depends
from jose import jwt, JWTError
from dotenv import load_dotenv
from openai import OpenAI

# Load environment variables
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))

router = APIRouter()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
print("AI SECRET_KEY:", SECRET_KEY)
# Initialize OpenAI client once
client = OpenAI(api_key=OPENAI_API_KEY)


# ✅ Extract token from request header
def get_token(request: Request):
    token = request.headers.get("authorization")
    if token and token.startswith("Bearer "):
        return token.split()[1]
    raise HTTPException(status_code=401, detail="Missing token")


# ✅ Decode JWT and get user info
def get_current_user(token: str = Depends(get_token)):
    try:
        print("Received token:", token)  # Debug
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        print("Decoded payload:", payload)
    except JWTError as e:
        print("JWT decode failed:", e)
        raise HTTPException(status_code=401, detail="Invalid token")
    return payload.get("sub")



# ✅ Main route to ask the AI assistant
@router.post("/ask")
async def ask_finance_assistant(request: Request, user: str = Depends(get_current_user)):
    body = await request.json()
    query = body.get("query", "")
    permissions = body.get("permissions", {})

    if not query:
        raise HTTPException(status_code=400, detail="Query is required")

    # Create a chat completion
    response = client.chat.completions.create(
        model="gpt-4o-mini",  # ⚡ newer, faster, and cheaper than gpt-3.5
        messages=[
            {"role": "system", "content": f"You are an AI personal finance assistant. Data permissions: {permissions}."},
            {"role": "user", "content": query}
        ],
    )

    answer = response.choices[0].message.content

    return {"answer": answer, "insights": []}