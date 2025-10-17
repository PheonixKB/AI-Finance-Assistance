from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json

app = FastAPI()

# Allow frontend (React) to call backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, put your frontend URL here
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----- Models -----
class QueryModel(BaseModel):
    query: str
    permissions: dict

# ----- Load Mock Data -----
# Place your mock data in /data/mock_financial_data.json
with open("./data/mock_financial_data.json", "r") as f:
    mock_data = json.load(f)

# ----- Helper Functions -----
def filter_data_by_permissions(data, permissions):
    return {key: val for key, val in data.items() if permissions.get(key)}

# ----- API Routes -----
@app.post("/api/ask")
async def ask_finance_assistant(request: Request, item: QueryModel):
    # 1. Filter data based on user permissions
    filtered_data = filter_data_by_permissions(mock_data, item.permissions)

    # 2. Prepare a prompt for the AI model (pseudo-code here)
    # prompt = f"User Question: {item.query}\nData: {filtered_data}"
    # response = call_your_ai_api(prompt)   # Placeholder

    # 3. For now, fake response & insights
    fake_answer = "This is where the AI assistant's answer will appear."
    fake_insights = [f"Example insight about {k}" for k in filtered_data.keys()]

    return {"answer": fake_answer, "insights": fake_insights}

@app.get("/api/ping")
async def ping():
    return {"message": "Finance assistant backend running."}