# backend/finance_data.py

from fastapi import APIRouter, Request, HTTPException, Depends
from database.db import get_db_connection
from datetime import date
from .users import get_current_user
from schemas.finance_schemas import (
    InvestmentCreate,
    InvestmentUpdate,
    AccountCreate,
    AccountUpdate,
    SummaryFinanceUpdate,
    TransactionCreate,
    TransactionUpdate,
)

upload_router = APIRouter()

@upload_router.put("/summary_finance")
async def update_summary_finance(data: SummaryFinanceUpdate, user: dict = Depends(get_current_user)):
    user_id = user["id"]
    updates = {k: v for k, v in data.dict(exclude_unset=True).items() if v is not None}
    if not updates:
        return {"message": "No fields to update"}

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        set_clauses = ", ".join([f"{k} = %s" for k in updates.keys()])
        values = list(updates.values())
        values.append(user_id)
        
        # Check if a row exists for the user_id, if not, insert a new one
        cursor.execute("INSERT IGNORE INTO user_summary (user_id) VALUES (%s)", (user_id,))
        conn.commit()

        cursor.execute(f"UPDATE user_summary SET {set_clauses} WHERE user_id = %s", tuple(values))
        conn.commit()
        return {"status": "ok", "message": "Summary finance data updated"}
    finally:
        cursor.close()
        conn.close()

@upload_router.get("/summary_finance")
async def get_summary_finance(user: dict = Depends(get_current_user)):
    user_id = user["id"]
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT credit_score, epf_balance FROM user_summary WHERE user_id = %s", (user_id,))
        finance_data = cursor.fetchone()
        return finance_data if finance_data else {"credit_score": None, "epf_balance": None}
    finally:
        cursor.close()
        conn.close()

@upload_router.post("/investments")
async def create_investment(investment: InvestmentCreate, user: dict = Depends(get_current_user)):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO user_investments (user_id, investment_type, name, quantity, purchase_price, current_price, purchase_date) VALUES (%s, %s, %s, %s, %s, %s, %s)",
            (user["id"], investment.investment_type, investment.name, investment.quantity, investment.purchase_price, investment.current_price, investment.purchase_date)
        )
        conn.commit()
        return {"id": cursor.lastrowid, **investment.dict()}
    finally:
        cursor.close()
        conn.close()

@upload_router.put("/investments/{investment_id}")
async def update_investment(investment_id: int, investment: InvestmentUpdate, user: dict = Depends(get_current_user)):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT id FROM user_investments WHERE id = %s AND user_id = %s", (investment_id, user["id"]))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Investment not found or not authorized")

        updates = {k: v for k, v in investment.dict(exclude_unset=True).items() if v is not None}
        if not updates:
            return {"message": "No fields to update"}

        set_clauses = ", ".join([f"{k} = %s" for k in updates.keys()])
        values = list(updates.values())
        values.append(investment_id)

        cursor.execute(f"UPDATE user_investments SET {set_clauses} WHERE id = %s", tuple(values))
        conn.commit()
        return {"status": "ok", "message": "Investment updated"}
    finally:
        cursor.close()
        conn.close()

@upload_router.delete("/investments/{investment_id}")
async def delete_investment(investment_id: int, user: dict = Depends(get_current_user)):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT id FROM user_investments WHERE id = %s AND user_id = %s", (investment_id, user["id"]))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Investment not found or not authorized")

        cursor.execute("DELETE FROM user_investments WHERE id = %s", (investment_id,))
        conn.commit()
        return {"status": "ok", "message": "Investment deleted"}
    finally:
        cursor.close()
        conn.close()

@upload_router.get("/investments")
async def get_investments(user: dict = Depends(get_current_user)):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT id, investment_type, name, quantity, purchase_price, current_price, purchase_date FROM user_investments WHERE user_id = %s", (user["id"],))
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

@upload_router.post("/accounts")
async def create_account(account: AccountCreate, user: dict = Depends(get_current_user)):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO user_accounts (user_id, account_name, bank_name, account_type, balance) VALUES (%s, %s, %s, %s, %s)",
            (user["id"], account.account_name, account.bank_name, account.account_type, account.balance)
        )
        conn.commit()
        return {"id": cursor.lastrowid, **account.dict()}
    finally:
        cursor.close()
        conn.close()

@upload_router.put("/accounts/{account_id}")
async def update_account(account_id: int, account: AccountUpdate, user: dict = Depends(get_current_user)):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # Check if account belongs to user
        cursor.execute("SELECT id FROM user_accounts WHERE id = %s AND user_id = %s", (account_id, user["id"]))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Account not found or not authorized")

        updates = {k: v for k, v in account.dict(exclude_unset=True).items() if v is not None}
        if not updates:
            return {"message": "No fields to update"}

        set_clauses = ", ".join([f"{k} = %s" for k in updates.keys()])
        values = list(updates.values())
        values.append(account_id)

        cursor.execute(f"UPDATE user_accounts SET {set_clauses} WHERE id = %s", tuple(values))
        conn.commit()
        return {"status": "ok", "message": "Account updated"}
    finally:
        cursor.close()
        conn.close()

@upload_router.delete("/accounts/{account_id}")
async def delete_account(account_id: int, user: dict = Depends(get_current_user)):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # Check if account belongs to user
        cursor.execute("SELECT id FROM user_accounts WHERE id = %s AND user_id = %s", (account_id, user["id"]))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Account not found or not authorized")

        cursor.execute("DELETE FROM user_accounts WHERE id = %s", (account_id,))
        conn.commit()
        return {"status": "ok", "message": "Account deleted"}
    finally:
        cursor.close()
        conn.close()

@upload_router.get("/accounts")
async def get_accounts(user: dict = Depends(get_current_user)):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT id, account_name, bank_name, account_type, balance FROM user_accounts WHERE user_id = %s", (user["id"],))
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

@upload_router.post("/transactions")
async def create_transaction(transaction: TransactionCreate, user: dict = Depends(get_current_user)):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # Check if account belongs to user
        cursor.execute("SELECT id FROM user_accounts WHERE id = %s AND user_id = %s", (transaction.account_id, user["id"]))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Account not found or not authorized")

        cursor.execute(
            "INSERT INTO user_transactions (user_id, account_id, date, descr, amount) VALUES (%s, %s, %s, %s, %s)",
            (user["id"], transaction.account_id, transaction.date, transaction.descr, transaction.amount)
        )
        conn.commit()
        return {"id": cursor.lastrowid, **transaction.dict()}
    finally:
        cursor.close()
        conn.close()

@upload_router.put("/transactions/{transaction_id}")
async def update_transaction(transaction_id: int, transaction: TransactionUpdate, user: dict = Depends(get_current_user)):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # Check if transaction belongs to user
        cursor.execute("SELECT id FROM user_transactions WHERE id = %s AND user_id = %s", (transaction_id, user["id"]))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Transaction not found or not authorized")

        updates = {k: v for k, v in transaction.dict(exclude_unset=True).items() if v is not None}
        if not updates:
            return {"message": "No fields to update"}

        set_clauses = ", ".join([f"{k} = %s" for k in updates.keys()])
        values = list(updates.values())
        values.append(transaction_id)

        cursor.execute(f"UPDATE user_transactions SET {set_clauses} WHERE id = %s", tuple(values))
        conn.commit()
        return {"status": "ok", "message": "Transaction updated"}
    finally:
        cursor.close()
        conn.close()

@upload_router.get("/accounts/{account_id}/transactions")
async def get_account_transactions(account_id: int, user: dict = Depends(get_current_user)):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        # Check if account belongs to user
        cursor.execute("SELECT id FROM user_accounts WHERE id = %s AND user_id = %s", (account_id, user["id"]))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Account not found or not authorized")

        cursor.execute("SELECT id, date, descr, amount FROM user_transactions WHERE account_id = %s ORDER BY date ASC", (account_id,))
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()
