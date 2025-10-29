# backend/finance_data.py
from fastapi import APIRouter, Request, HTTPException
from users import get_current_user
from db import get_db_connection

router = APIRouter(prefix="/api")

@router.get("/finance-summary")
def get_finance_summary(request: Request):
    user = get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="User not authenticated")

    user_id = user["id"]
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)  # dictionary cursor, returns JSON-like rows

    try:
        cursor.execute("SELECT * FROM user_finance_summary WHERE user_id = %s LIMIT 1", (user_id,))
        summary = cursor.fetchone()

        if not summary:
            raise HTTPException(status_code=404, detail="Finance summary not found")

        # Optionally, add spending chart dummy data if not stored in DB
        summary["spending_chart"] = [60, 80, 45, 90]

        return summary
    finally:
        cursor.close()
        conn.close()
