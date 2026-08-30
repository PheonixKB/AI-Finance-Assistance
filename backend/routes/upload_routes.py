# backend/routes/upload_routes.py

from fastapi import APIRouter, File, UploadFile, HTTPException, Depends, Request
import pandas as pd
import io
from db import get_db_connection
from users import get_current_user
import datetime
from ai import get_openai_client

router = APIRouter(prefix="/upload", tags=["Upload"])

MAX_UPLOAD_SIZE = 10 * 1024 * 1024  # 10 MB

@router.post("/transactions")
async def upload_transactions(
    file: UploadFile = File(...),
    account_id: int = None,
    current_user: dict = Depends(get_current_user)
):
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required to upload transactions")

    user_id = current_user["id"]

    # Validate file type
    allowed_types = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel"
    ]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Invalid file type. Only .xlsx or .xls allowed.")

    # Check file size before reading into memory
    file.file.seek(0, 2)
    size = file.file.tell()
    file.file.seek(0)
    if size > MAX_UPLOAD_SIZE:
        raise HTTPException(status_code=413, detail=f"File too large. Maximum size is {MAX_UPLOAD_SIZE // (1024*1024)}MB.")

    # Read file
    contents = await file.read()
    try:
        df = pd.read_excel(io.BytesIO(contents))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not read Excel file: {str(e)}")

    # Normalize column names
    df.columns = [str(c).strip().lower() for c in df.columns]

    # Possible column mappings
    col_map = {
        "date": ["date", "transaction date", "txn date"],
        "description": ["description", "narration", "merchant", "details", "descr", "particulars"],
        "debit": ["debit", "debit ($)", "withdrawal", "dr amount"],
        "credit": ["credit", "credit ($)", "deposit", "cr amount"],
        "amount": ["amount", "amount ($)", "transaction amount", "amt"],
        "account": ["account_id", "account number", "account no", "card number"]
    }

    def detect_column(possible_names):
        for name in possible_names:
            if name in df.columns:
                return name
        return None

    # Detect usable columns
    date_col = detect_column(col_map["date"])
    descr_col = detect_column(col_map["description"])
    debit_col = detect_column(col_map["debit"])
    credit_col = detect_column(col_map["credit"])
    amount_col = detect_column(col_map["amount"])
    account_col = detect_column(col_map["account"])

    # Validate minimum requirements
    if not date_col:
        raise HTTPException(status_code=400, detail="No valid date column found in Excel.")
    if not (amount_col or (debit_col or credit_col)):
        raise HTTPException(status_code=400, detail="No valid amount/debit/credit columns found in Excel.")
    if not (account_id or account_col):
        raise HTTPException(status_code=400, detail="No account ID or account number column found in Excel.")

    # Start DB connection
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # Build account mapping (account_number -> id) for current user
        cursor.execute("SELECT id, account_number FROM user_accounts WHERE user_id = %s", (user_id,))
        account_map = {str(row[1]): row[0] for row in cursor.fetchall() if row[1]}

        transactions_to_insert = []

        # Parse rows
        for index, row in df.iterrows():
            try:
                # Resolve account_id
                resolved_acc_id = account_id  # Default if passed as query param
                if not resolved_acc_id and account_col:
                    acc_num = str(row[account_col]).strip()
                    resolved_acc_id = account_map.get(acc_num)
                    if not resolved_acc_id:
                        raise HTTPException(status_code=400, detail=f"Account number {acc_num} not found for this user.")

                # Parse date
                date_val = pd.to_datetime(row[date_col], errors='coerce')
                if pd.isna(date_val):
                    continue

                # Description
                description = str(row.get(descr_col, "")).strip() if descr_col else "No Description"

                # Use OpenAI to categorize the transaction
                prompt = f"Categorize this transaction: '{description}' into one of these: Food, Housing, Transportation, Utilities, Entertainment, Others."
                client = get_openai_client()
                if client:
                    response = client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[
                        {"role": "system", "content": "You are a helpful assistant that categorizes financial transactions."},
                        {"role": "user", "content": prompt}
                    ]
                )
                category = response.choices[0].message.content.strip()

                # Amount logic
                if amount_col:
                    amount = float(row[amount_col])
                else:
                    debit = float(row.get(debit_col, 0) or 0)
                    credit = float(row.get(credit_col, 0) or 0)
                    amount = credit - debit  # inflow positive, outflow negative

                transactions_to_insert.append((user_id, resolved_acc_id, date_val.date(), description, amount, category))

            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Row {index + 2} error: {str(e)}")

        if not transactions_to_insert:
            raise HTTPException(status_code=400, detail="No valid transactions found in the uploaded file.")

        # Insert all transactions
        for user_id, acc_id, date, description, amount, category in transactions_to_insert:
            cursor.execute(
                "INSERT INTO user_transactions (user_id, account_id, date, description, amount, category) VALUES (%s, %s, %s, %s, %s, %s)",
                (user_id, acc_id, date, description, amount, category)
            )
            # If the transaction is a saving, update the goal progress
            if category.lower() == 'savings':
                cursor.execute(
                    "UPDATE user_goals SET current_progress = current_progress + %s WHERE user_id = %s",
                    (amount, user_id)
                )

        conn.commit()
        return {"message": f"Successfully uploaded {len(transactions_to_insert)} transactions."}

    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    finally:
        cursor.close()
        conn.close()



@router.post("/investments")
async def upload_investments(
    file: UploadFile,
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required to upload investments")

    user_id = current_user["id"]

    # Validate file type
    if file.content_type not in [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
        "application/pdf"
    ]:
        raise HTTPException(
            status_code=400,
            detail="Invalid file type. Only Excel (.xlsx, .xls) or PDF files are allowed."
        )

    # Check file size before reading into memory
    file.file.seek(0, 2)
    size = file.file.tell()
    file.file.seek(0)
    if size > MAX_UPLOAD_SIZE:
        raise HTTPException(status_code=413, detail=f"File too large. Maximum size is {MAX_UPLOAD_SIZE // (1024*1024)}MB.")

    contents = await file.read()
    investments_to_insert = []

    # --- Excel processing ---
    if file.content_type in [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel"
    ]:
        try:
            df = pd.read_excel(io.BytesIO(contents))
            df.columns = df.columns.str.strip().str.lower()

            # Auto map human-readable headers to database columns
            column_map = {
                'investment type': 'investment_type',
                'type': 'investment_type',
                'investment': 'investment_type',

                'amount invested (₹)': 'purchase_price',
                'amount invested ($)': 'purchase_price',
                'amount invested': 'purchase_price',
                'investment amount': 'purchase_price',

                'current value (₹)': 'current_price',
                'current value ($)': 'current_price',
                'current value': 'current_price',
                'value now': 'current_price',

                'date': 'purchase_date',
                'purchase date': 'purchase_date',
                'buy date': 'purchase_date',

                'quantity': 'quantity',
                'units': 'quantity',
                'shares': 'quantity',

                'name': 'name',
                'asset name': 'name'
            }

            # Apply mapping
            df.rename(columns=lambda c: column_map.get(c, c), inplace=True)

            required_cols = [
                'investment_type', 'name', 'quantity',
                'purchase_price', 'current_price', 'purchase_date'
            ]

            missing_cols = [col for col in required_cols if col not in df.columns and col != 'quantity']
            if missing_cols:
                raise HTTPException(
                    status_code=400,
                    detail=f"Missing columns after normalization: {missing_cols}. "
                           f"Your Excel must have headers similar to: {required_cols}. "
                           f"Found columns: {list(df.columns)}"
                )

            # Parse rows
            for index, row in df.iterrows():
                try:
                    investment_type = str(row['investment_type'])
                    name = str(row['name'])
                    quantity = float(row['quantity']) if 'quantity' in row and pd.notna(row['quantity']) else 1.0
                    purchase_price = float(row['purchase_price'])
                    current_price = float(row['current_price']) if pd.notna(row['current_price']) else None
                    purchase_date = pd.to_datetime(row['purchase_date']).date() if pd.notna(row['purchase_date']) else None

                    investments_to_insert.append((
                        user_id, investment_type, name,
                        quantity, purchase_price, current_price, purchase_date
                    ))

                except Exception as e:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Data error in Excel row {index + 2}: {e}. "
                               "Ensure numeric fields are valid and dates are proper."
                    )

        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error processing Excel file: {e}")

    elif file.content_type == "application/pdf":
        raise HTTPException(
            status_code=501,
            detail="PDF processing for investments not yet implemented. Please use Excel."
        )

    if not investments_to_insert:
        raise HTTPException(status_code=400, detail="No valid investments found in uploaded file.")

    # --- Database Insertion ---
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        for investment in investments_to_insert:
            cursor.execute(
                """
                INSERT INTO user_investments 
                (user_id, investment_type, name, quantity, purchase_price, current_price, purchase_date)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                """,
                investment
            )
        conn.commit()
        return {"message": f"Successfully uploaded and processed {len(investments_to_insert)} investments."}

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {e}")

    finally:
        cursor.close()
        conn.close()
