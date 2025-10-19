# backend/finance_data.py

from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from users import get_current_user
from db import get_db_connection

upload_router = APIRouter()

FINANCE_CATEGORIES = {
    "assets": ["cash", "bank"],
    "liabilities": ["loans", "credit_card"],
    "investments": ["mutual_funds", "stocks"],
    "epf": ["epf_balance"],
    "creditScore": ["credit_score"],
}

class FinanceUpload(BaseModel):
    cash: int = 0
    bank: int = 0
    loans: int = 0
    credit_card: int = 0
    mutual_funds: int = 0
    stocks: int = 0
    epf_balance: int = 0
    credit_score: int = 0

def get_user_finance(user_id, permissions):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    # Get summary row
    cursor.execute("SELECT * FROM user_finance WHERE user_id = %s", (user_id,))
    finance_row = cursor.fetchone() or {}

    # Transactions (if permitted)
    transactions = []
    if permissions.get("transactions"):
        cursor.execute("SELECT date, descr, amount FROM user_transactions WHERE user_id = %s ORDER BY date ASC", (user_id,))
        transactions = cursor.fetchall()

    cursor.close()
    conn.close()

    data = {}
    for cat, fields in FINANCE_CATEGORIES.items():
        if permissions.get(cat):
            # assets/liabilities/investments/epf/creditScore
            if cat == "creditScore" and "credit_score" in finance_row:
                data[cat] = finance_row.get("credit_score")
            elif cat == "epf" and "epf_balance" in finance_row:
                data[cat] = {"balance": finance_row.get("epf_balance")}
            else:
                data[cat] = {f: finance_row.get(f) for f in fields if f in finance_row}
    if permissions.get("transactions"):
        data["transactions"] = transactions
    return data

@upload_router.post("/upload_finance")
async def upload_finance(request: Request, data: FinanceUpload):
    user = get_current_user(request)
    user_id = user["id"]
    values = data.dict()
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        REPLACE INTO user_finance (user_id, cash, bank, loans, credit_card, mutual_funds, stocks, epf_balance, credit_score)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)
    """, (
        user_id,
        values["cash"],
        values["bank"],
        values["loans"],
        values["credit_card"],
        values["mutual_funds"],
        values["stocks"],
        values["epf_balance"],
        values["credit_score"]
    ))
    conn.commit()
    cursor.close()
    conn.close()
    return {"status": "ok", "message": "Finance data uploaded"}
