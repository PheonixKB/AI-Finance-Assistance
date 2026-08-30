# backend/routes/content_routes.py
from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from datetime import date
from openai import RateLimitError

from users import get_current_user
from db import get_db_connection
from ai import get_openai_client

router = APIRouter()

# ---------------------- MODELS ----------------------

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
    account_number: str | None = None
    account_type: str
    balance: float = 0.0

class AccountUpdate(BaseModel):
    account_name: str | None = None
    bank_name: str | None = None
    account_number: str | None = None
    account_type: str | None = None
    balance: float | None = None

class SummaryFinanceUpdate(BaseModel):
    credit_score: int | None = None
    epf_balance: int | None = None

class TransactionCreate(BaseModel):
    account_id: int
    date: str  # YYYY-MM-DD
    description: str
    amount: float

class TransactionUpdate(BaseModel):
    date: str | None = None
    description: str | None = None
    amount: float | None = None

class GoalCreate(BaseModel):
    goal_name: str
    target_amount: float
    deadline: date | None = None

class GoalUpdate(BaseModel):
    goal_name: str | None = None
    target_amount: float | None = None
    current_progress: float | None = None
    deadline: date | None = None

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

class UserFinanceProfileUpdate(UserFinanceProfileCreate):
    pass


# ---------------------- STATIC ENDPOINTS ----------------------

@router.get("/stats")
async def get_stats():
    return [
        {"icon": "Users", "number": "50K+", "label": "Active Users", "description": "Trusting our AI assistant"},
        {"icon": "DollarSign", "number": "$2.5M+", "label": "Money Saved", "description": "By our users last month"},
        {"icon": "TrendingUp", "number": "15%", "label": "Average ROI", "description": "Improvement with AI insights"},
        {"icon": "Award", "number": "98%", "label": "Satisfaction Rate", "description": "From our happy users"}
    ]


@router.get("/testimonials")
async def get_testimonials():
    return [
        {
            "name": "Sarah Johnson",
            "role": "Marketing Director",
            "company": "Tech Innovations Inc.",
            "content": "FinanceAI transformed how I manage my money. Saved $800/month!",
            "rating": 5,
            "avatar": "SJ"
        },
        {
            "name": "Michael Chen",
            "role": "Software Engineer",
            "company": "StartupXYZ",
            "content": "Investment recommendations are spot-on. 22% return in 6 months.",
            "rating": 5,
            "avatar": "MC"
        },
        {
            "name": "Emily Rodriguez",
            "role": "Small Business Owner",
            "company": "Local Boutique",
            "content": "Manages both personal and business finances effortlessly.",
            "rating": 5,
            "avatar": "ER"
        }
    ]

# ---------------------- SUMMARY FINANCE ----------------------

@router.put("/summary_finance")
async def update_summary_finance(request: Request, data: SummaryFinanceUpdate):
    user = get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized")

    user_id = user["id"]
    updates = {k: v for k, v in data.dict(exclude_unset=True).items() if v is not None}
    if not updates:
        return {"message": "No fields to update"}

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("INSERT IGNORE INTO user_summary (user_id) VALUES (%s)", (user_id,))
        conn.commit()

        set_clause = ", ".join(f"{k} = %s" for k in updates)
        values = list(updates.values()) + [user_id]
        cursor.execute(f"UPDATE user_summary SET {set_clause} WHERE user_id = %s", tuple(values))
        conn.commit()
        return {"status": "ok", "message": "Summary finance updated"}
    finally:
        cursor.close()
        conn.close()


@router.get("/summary_finance")
async def get_summary_finance(request: Request):
    user = get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized")

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT credit_score, epf_balance FROM user_summary WHERE user_id = %s", (user["id"],))
        data = cursor.fetchone()
        return data or {"credit_score": None, "epf_balance": None}
    finally:
        cursor.close()
        conn.close()

# ---------------------- INVESTMENTS, ACCOUNTS, TRANSACTIONS, GOALS ----------------------
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
            "INSERT INTO user_accounts (user_id, account_name, bank_name, account_number, account_type, balance) VALUES (%s, %s, %s, %s, %s, %s)",
            (user["id"], account.account_name, account.bank_name, account.account_number, account.account_type, account.balance)
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
        cursor.execute("SELECT id, account_name, bank_name, account_number, account_type, balance FROM user_accounts WHERE user_id = %s", (user["id"],))
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
            "INSERT INTO user_transactions (user_id, account_id, date, description, amount) VALUES (%s, %s, %s, %s, %s)",
            (user["id"], transaction.account_id, transaction.date, transaction.description, transaction.amount)
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

        cursor.execute("SELECT id, date, description, amount FROM user_transactions WHERE account_id = %s ORDER BY date ASC", (account_id,))
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
        cursor.execute("SELECT id, account_id, date, description, amount FROM user_transactions WHERE user_id = %s ORDER BY date ASC", (user["id"],))
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

@router.get("/budget-summary")
async def get_budget_summary(request: Request):
    user = get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required to access budget summary.")

    user_id = user["id"]
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute(
            "SELECT transaction_type as category, SUM(amount) as total_spent FROM user_transactions WHERE user_id = %s GROUP BY transaction_type",
            (user_id,)
        )
        categorized_expenses = cursor.fetchall()

        cursor.execute(
            "SELECT salary FROM user_finance_profile WHERE user_id = %s",
            (user_id,)
        )
        finance_profile = cursor.fetchone()
        salary = finance_profile["salary"] if finance_profile and finance_profile["salary"] else 0

        if salary > 0 and categorized_expenses:
            expenses_data = ", ".join([f"{exp['category']}: {exp['total_spent']}" for exp in categorized_expenses])
            prompt = f"""
            User's monthly income: {salary}.
            User's categorized monthly expenses: {expenses_data}.
            Suggest a personalized budget plan and identify areas for reduction.
            """

            try:
                openai_client = get_openai_client()
                if openai_client is None:
                    raise HTTPException(status_code=503, detail="OpenAI API key not configured")
                response = openai_client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[
                        {"role": "system", "content": "You are a helpful financial advisor that provides smart budgeting suggestions."},
                        {"role": "user", "content": prompt}
                    ]
                )
                suggestions = response.choices[0].message.content.strip()
            except RateLimitError:
                return JSONResponse(
                    status_code=429,
                    content={"error": "AI service unavailable: OpenAI quota exceeded. Please try again later."}
                )
        else:
            suggestions = "Please upload more transaction data and set your salary in the finance profile to get personalized budget suggestions."

        return {
            "categorized_expenses": categorized_expenses,
            "salary": salary,
            "suggestions": suggestions
        }

    finally:
        cursor.close()
        conn.close()


@router.get("/investment-insights")
async def get_investment_insights(request: Request):
    user = get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required to access investment insights.")

    user_id = user["id"]
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        # Fetch user's finance profile
        cursor.execute(
            "SELECT salary, risk_tolerance, investment_experience, savings_goal FROM user_finance_profile WHERE user_id = %s",
            (user_id,)
        )
        finance_profile = cursor.fetchone()

        if not finance_profile:
            raise HTTPException(status_code=400, detail="Finance profile not found. Please complete your finance profile first.")

        risk_tolerance = finance_profile.get("risk_tolerance", "medium")
        investment_experience = finance_profile.get("investment_experience", "none")
        salary = finance_profile.get("salary", 0.0)
        savings_goal = finance_profile.get("savings_goal", 0.0)

        # Fetch user's current investments
        cursor.execute(
            "SELECT investment_type, name, quantity, purchase_price, current_price FROM user_investments WHERE user_id = %s",
            (user_id,)
        )
        investments_data = cursor.fetchall()

        investments_str = "No current investments." if not investments_data else \
            "\n".join([f"- {inv['name']} ({inv['investment_type']}): Quantity {inv['quantity']}, Purchased at {inv['purchase_price']}, Current value {inv['current_price']}" for inv in investments_data])

        prompt = f"""
        User has a {risk_tolerance} risk tolerance and {investment_experience} experience.
        Current annual salary: {salary}.
        Current savings goal: {savings_goal}.
        Current investments:\n{investments_str}.
        
        Suggest an investment plan for the next 12 months, considering their risk tolerance, experience, and financial goals.
        Provide actionable advice and potential investment types.
        """

        openai_client = get_openai_client()
        if openai_client is None:
            raise HTTPException(status_code=503, detail="OpenAI API key not configured")
        response = openai_client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful financial advisor that provides personalized investment insights."},
                {"role": "user", "content": prompt}
            ]
        )
        insights = response.choices[0].message.content.strip()

        return {
            "risk_tolerance": risk_tolerance,
            "investment_experience": investment_experience,
            "salary": salary,
            "savings_goal": savings_goal,
            "investments_data": investments_data,
            "insights": insights
        }

    finally:
        cursor.close()
        conn.close()

        cursor.close()
        conn.close()

@router.post("/goals")
async def create_goal(request: Request, goal: GoalCreate):
    user = get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required to create a goal.")
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO user_goals (user_id, goal_name, target_amount, deadline) VALUES (%s, %s, %s, %s)",
            (user["id"], goal.goal_name, goal.target_amount, goal.deadline)
        )
        conn.commit()
        return {"id": cursor.lastrowid, **goal.dict()}
    finally:
        cursor.close()
        conn.close()

@router.get("/goals")
async def get_goals(request: Request):
    user = get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required to access goals.")
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT id, goal_name, target_amount, current_progress, deadline FROM user_goals WHERE user_id = %s", (user["id"],))
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

@router.put("/goals/{goal_id}")
async def update_goal(goal_id: int, request: Request, goal: GoalUpdate):
    user = get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required to update goal.")
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT id FROM user_goals WHERE id = %s AND user_id = %s", (goal_id, user["id"]))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Goal not found or not authorized")

        updates = {k: v for k, v in goal.dict(exclude_unset=True).items() if v is not None}
        if not updates:
            return {"message": "No fields to update"}

        set_clauses = ", ".join([f"{k} = %s" for k in updates.keys()])
        values = list(updates.values())
        values.append(goal_id)

        cursor.execute(f"UPDATE user_goals SET {set_clauses} WHERE id = %s", tuple(values))
        conn.commit()
        return {"status": "ok", "message": "Goal updated"}
    finally:
        cursor.close()
        conn.close()

@router.delete("/goals/{goal_id}")
async def delete_goal(goal_id: int, request: Request):
    user = get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required to delete goal.")
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT id FROM user_goals WHERE id = %s AND user_id = %s", (goal_id, user["id"]))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Goal not found or not authorized")

        cursor.execute("DELETE FROM user_goals WHERE id = %s", (goal_id,))
        conn.commit()
        return {"status": "ok", "message": "Goal deleted"}
    finally:
        cursor.close()
        conn.close()

        cursor.close()
        conn.close()

# ---------------------- GOAL PROGRESS ----------------------

@router.get("/goal-progress/{goal_id}")
async def get_goal_progress(goal_id: int, request: Request):
    user = get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized")

    user_id = user["id"]
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT goal_name, target_amount, current_progress, deadline FROM user_goals WHERE id = %s AND user_id = %s",
            (goal_id, user_id)
        )
        goal = cursor.fetchone()
        if not goal:
            raise HTTPException(status_code=404, detail="Goal not found or unauthorized")

        cursor.execute("SELECT savings_goal FROM user_finance_profile WHERE user_id = %s", (user_id,))
        finance_profile = cursor.fetchone()
        average_monthly_savings = (finance_profile["savings_goal"] or 0) / 12 if finance_profile else 0

        months_needed = None
        if average_monthly_savings > 0:
            remaining = goal["target_amount"] - goal["current_progress"]
            months_needed = remaining / average_monthly_savings if remaining > 0 else 0

        remaining_amount = goal["target_amount"] - goal["current_progress"]

        prompt = f"""
        User's goal: {goal['goal_name']} with a target of {goal['target_amount']}.
        Current progress: {goal['current_progress']}.
        Remaining amount: {remaining_amount}.
        Average monthly savings: {average_monthly_savings}.
        Deadline: {goal['deadline']}.
        Suggest actionable strategies to reach the goal faster.
        """

        try:
            openai_client = get_openai_client()
            if openai_client is None:
                raise HTTPException(status_code=503, detail="OpenAI API key not configured")
            response = openai_client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a financial planning assistant."},
                    {"role": "user", "content": prompt}
                ]
            )
            ai_suggestion = response.choices[0].message.content.strip()
        except RateLimitError:
            ai_suggestion = "AI service currently unavailable. Try again later."

        return {
            "goal": goal,
            "average_monthly_savings": average_monthly_savings,
            "months_needed": months_needed,
            "suggestions": ai_suggestion
        }
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
