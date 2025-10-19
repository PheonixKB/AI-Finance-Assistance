# backend/finance_data.py

from db import get_db_connection
import sys

FINANCE_CATEGORIES = {
    "assets": ["cash", "bank"],
    "liabilities": ["loans", "credit_card"],
    "investments": ["mutual_funds", "stocks"],
    "epf": ["epf_balance"],
    "creditScore": ["credit_score"],
}

def get_user_finance(user_id, permissions):
    # print("DEBUG: get_user_finance called with user_id:", user_id, " permissions:", permissions,flush=True)
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    # Get summary row
    cursor.execute("SELECT * FROM user_finance WHERE user_id = %s", (user_id,))
    finance_row = cursor.fetchone() or {}
    # print("DEBUG: finance_row for user_id", user_id, finance_row,flush=True)  # <--- Add this
    

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
