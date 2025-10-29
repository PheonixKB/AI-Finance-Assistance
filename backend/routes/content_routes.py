from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from users import get_current_user
from db import get_db_connection
from datetime import date

router = APIRouter()

class InvestmentCreate(BaseModel):
    investment_type: str
    name: str
    quantity: float
    purchase_price: float
    current_price: float | None = None
    purchase_date: date | None = None

class InvestmentUpdate(BaseModel):
    investment_type: str | None = None
    name: str | None = None
    quantity: float | None = None
    purchase_price: float | None = None
    current_price: float | None = None
    purchase_date: date | None = None

class AccountCreate(BaseModel):
    account_name: str
    bank_name: str
    account_number: str
    bank_number: str
    account_type: str
    balance: float = 0.0

class AccountUpdate(BaseModel):
    account_name: str | None = None
    bank_name: str | None = None
    account_number: str | None = None
    bank_number: str | None = None
    account_type: str | None = None
    balance: float | None = None

class SummaryFinanceUpdate(BaseModel):
    credit_score: int | None = None
    epf_balance: int | None = None

class TransactionCreate(BaseModel):
    account_id: int
    date: str # YYYY-MM-DD
    descr: str
    amount: float

class TransactionUpdate(BaseModel):
    date: str | None = None
    descr: str | None = None
    amount: float | None = None

class UserFinanceProfileCreate(BaseModel):
    salary: float | None = None
    monthly_debt_payments: float | None = None
    housing_cost: float | None = None
    transportation_cost: float | None = None
    food_cost: float | None = None
    other_expenses: float | None = None
    savings_goal: float | None = None
    risk_tolerance: str | None = None
    investment_experience: str | None = None

class UserFinanceProfileUpdate(BaseModel):
    salary: float | None = None
    monthly_debt_payments: float | None = None
    housing_cost: float | None = None
    transportation_cost: float | None = None
    food_cost: float | None = None
    other_expenses: float | None = None
    savings_goal: float | None = None
    risk_tolerance: str | None = None
    investment_experience: str | None = None

@router.get("/stats")
async def get_stats():
    stats = [
        {
            "icon": "Users",
            "number": "50K+",
            "label": "Active Users",
            "description": "Trusting our AI assistant"
        },
        {
            "icon": "DollarSign",
            "number": "$2.5M+",
            "label": "Money Saved",
            "description": "By our users last month"
        },
        {
            "icon": "TrendingUp",
            "number": "15%",
            "label": "Average ROI",
            "description": "Improvement with AI insights"
        },
        {
            "icon": "Award",
            "number": "98%",
            "label": "Satisfaction Rate",
            "description": "From our happy users"
        }
    ]
    return stats

@router.get("/testimonials")
async def get_testimonials():
    testimonials = [
        {
            "name": "Sarah Johnson",
            "role": "Marketing Director",
            "company": "Tech Innovations Inc.",
            "content": "FinanceAI has completely transformed how I manage my money. The AI insights helped me save an extra $800 per month!",
            "rating": 5,
            "avatar": "SJ"
        },
        {
            "name": "Michael Chen",
            "role": "Software Engineer",
            "company": "StartupXYZ",
            "content": "The investment recommendations are incredibly accurate. I've seen a 22% return on my portfolio since using this app.",
            "rating": 5,
            "avatar": "MC"
        },
        {
            "name": "Emily Rodriguez",
            "role": "Small Business Owner",
            "company": "Local Boutique",
            "content": "As a business owner, keeping track of both personal and business finances was overwhelming. This AI assistant makes it seamless.",
            "rating": 5,
            "avatar": "ER"
        }
    ]
    return testimonials

@router.put("/summary_finance")
async def update_summary_finance(request: Request, data: SummaryFinanceUpdate):
    user = get_current_user(request)
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

@router.get("/summary_finance")
async def get_summary_finance(request: Request):
    user = get_current_user(request)
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

@router.post("/investments")
async def create_investment(request: Request, investment: InvestmentCreate):
    user = get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required to create investment.")
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

@router.put("/investments/{investment_id}")
async def update_investment(investment_id: int, request: Request, investment: InvestmentUpdate):
    user = get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required to update investment.")
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

@router.delete("/investments/{investment_id}")
async def delete_investment(investment_id: int, request: Request):
    user = get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required to delete investment.")
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

@router.get("/investments")
async def get_investments(request: Request):
    user = get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required to access investments.")
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT id, investment_type, name, quantity, purchase_price, current_price, purchase_date FROM user_investments WHERE user_id = %s", (user["id"],))
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

@router.post("/accounts")
async def create_account(request: Request, account: AccountCreate):
    user = get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required to create account.")
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

@router.put("/accounts/{account_id}")
async def update_account(account_id: int, request: Request, account: AccountUpdate):
    user = get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required to update account.")
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

@router.delete("/accounts/{account_id}")
async def delete_account(account_id: int, request: Request):
    user = get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required to delete account.")
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

@router.get("/accounts")
async def get_accounts(request: Request):
    user = get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required to access accounts.")
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT id, account_name, bank_name, account_type, balance FROM user_accounts WHERE user_id = %s", (user["id"],))
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

@router.post("/transactions")
async def create_transaction(request: Request, transaction: TransactionCreate):
    user = get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required to create transaction.")
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

@router.put("/transactions/{transaction_id}")
async def update_transaction(transaction_id: int, request: Request, transaction: TransactionUpdate):
    user = get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required to update transaction.")
    
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # Verify transaction belongs to current user
        cursor.execute("SELECT id FROM user_transactions WHERE id = %s AND user_id = %s", (transaction_id, user["id"]))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Transaction not found or not authorized")

        # Convert TransactionUpdate (Pydantic) → dict
        raw_data = transaction.dict(exclude_unset=True)

        # Normalize and auto-map possible bank column names to internal schema
        field_map = {
            "date": ["date", "Date", "Transaction Date", "Txn Date"],
            "description": ["description", "Description", "Merchant", "Narration", "Particulars", "Details"],
            "amount": ["amount", "Amount ($)", "Credit ($)", "Debit ($)", "Cr Amount", "Dr Amount", "Deposit", "Withdrawal"],
            "card_number": ["card_number", "Card Number", "Account No", "Account Number"]
        }

        normalized = {}
        for key, synonyms in field_map.items():
            for alt in synonyms:
                if alt in raw_data and raw_data[alt] is not None:
                    normalized[key] = raw_data[alt]
                    break  # stop at first match

        # Compute amount if debit/credit pattern is detected
        debit = raw_data.get("Debit ($)") or raw_data.get("Dr Amount") or raw_data.get("Withdrawal")
        credit = raw_data.get("Credit ($)") or raw_data.get("Cr Amount") or raw_data.get("Deposit")
        if debit or credit:
            normalized["amount"] = float(credit or 0) - float(debit or 0)

        # If nothing valid was found, bail early
        if not normalized:
            raise HTTPException(status_code=400, detail="No valid transaction fields detected for update.")

        # Prepare dynamic SQL SET clause
        set_clauses = ", ".join([f"{k} = %s" for k in normalized.keys()])
        values = list(normalized.values()) + [transaction_id]

        cursor.execute(f"UPDATE user_transactions SET {set_clauses} WHERE id = %s", tuple(values))
        conn.commit()

        return {"status": "ok", "message": "Transaction updated successfully", "updated_fields": list(normalized.keys())}

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Update failed: {str(e)}")

    finally:
        cursor.close()
        conn.close()


@router.get("/accounts/{account_id}/transactions")
async def get_account_transactions(account_id: int, request: Request):
    user = get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required to access transactions.")
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

@router.get("/transactions")
async def get_all_transactions(request: Request):
    user = get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required to access transactions.")
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT id, account_id, date, descr, amount FROM user_transactions WHERE user_id = %s ORDER BY date ASC", (user["id"],))
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

@router.post("/finance_profile")
async def create_finance_profile(request: Request, profile: UserFinanceProfileCreate):
    user = get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required to create finance profile.")
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # Check if profile already exists
        cursor.execute("SELECT user_id FROM user_finance_profile WHERE user_id = %s", (user["id"],))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Finance profile already exists for this user. Use PUT to update.")

        fields_to_insert = ["user_id"]
        values_to_insert = [user["id"]]

        profile_data = profile.dict(exclude_unset=True)
        print(f"Profile data from frontend: {profile_data}")
        for key, value in profile_data.items():
            if isinstance(value, str) and value.strip() == '':
                value = None
            fields_to_insert.append(key)
            values_to_insert.append(value)

        print(f"Fields to insert: {fields_to_insert}")
        print(f"Values to insert: {values_to_insert}")

        if len(fields_to_insert) == 1: # Only user_id is present, meaning no other data was provided
            # Insert only user_id, other fields will be NULL by default
            cursor.execute("INSERT INTO user_finance_profile (user_id) VALUES (%s)", (user["id"],))
        else:
            set_fields = ", ".join(fields_to_insert)
            placeholders = ", ".join(["%s"] * len(values_to_insert))

            cursor.execute(
                f"INSERT INTO user_finance_profile ({set_fields}) VALUES ({placeholders})",
                tuple(values_to_insert)
            )
        conn.commit()
        return {"message": "Finance profile created successfully!"}
    finally:
        cursor.close()
        conn.close()

@router.put("/finance_profile")
async def update_finance_profile(request: Request, profile: UserFinanceProfileUpdate):
    user = get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required to update finance profile.")
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        updates = {}
        profile_data = profile.dict(exclude_unset=True)
        for key, value in profile_data.items():
            if isinstance(value, str) and value.strip() == '':
                updates[key] = None
            else:
                updates[key] = value

        if not updates:
            return {"message": "No fields to update"}

        set_clauses = ", ".join([f"{k} = %s" for k in updates.keys()])
        values = list(updates.values())
        values.append(user["id"])

        cursor.execute("INSERT INTO user_finance_profile (user_id) VALUES (%s) ON DUPLICATE KEY UPDATE " + set_clauses, tuple(values))
        conn.commit()
        return {"message": "Finance profile updated successfully!"}
    finally:
        cursor.close()
        conn.close()

@router.get("/finance_profile")
async def get_finance_profile(request: Request):
    user = get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required to access finance profile.")
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM user_finance_profile WHERE user_id = %s", (user["id"],))
        profile_data = cursor.fetchone()
        return profile_data if profile_data else {}
    finally:
        cursor.close()
        conn.close()
