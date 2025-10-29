from fastapi import APIRouter, File, UploadFile, HTTPException, Depends, Request
from typing import List
import pandas as pd
import io
from db import get_db_connection
from users import get_current_user
import datetime

router = APIRouter(prefix="/upload", tags=["Upload"])

@router.post("/transactions")
async def upload_transactions(
    file: UploadFile = File(...),
    request: Request = Request,
    account_id: int | None = None, # Optional account_id as a query parameter
    current_user: dict = Depends(get_current_user)
):
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required to upload transactions")

    user_id = current_user["id"]

    # Validate file type
    if file.content_type not in ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/vnd.ms-excel", "application/pdf"]:
        raise HTTPException(status_code=400, detail="Invalid file type. Only Excel (.xlsx, .xls) or PDF files are allowed.")

    contents = await file.read()
    
    transactions_to_insert = []

    if file.content_type in ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/vnd.ms-excel"]:
        # Process Excel file
        try:
            df = pd.read_excel(io.BytesIO(contents))
            for index, row in df.iterrows():
                try:
                    # Use account_id from query parameter if provided, otherwise try to get from Excel
                    transaction_account_id = account_id if account_id is not None else int(row['account_id'])
                    date = pd.to_datetime(row['Date']).date()
                    descr = str(row['Merchant'])
                    amount = float(row['Amount ($)'])
                    transactions_to_insert.append((user_id, transaction_account_id, date, descr, amount))
                except KeyError as e:
                    if account_id is None: # Only raise error if account_id was not provided as query param
                        raise HTTPException(status_code=400, detail=f"Missing column in Excel: {e}. Please ensure your Excel file contains the following columns: 'account_id', 'Date', 'Merchant', 'Amount ($') or provide an account_id as a query parameter.")
                    else: # If account_id was provided as query param, but other expected columns are missing
                        raise HTTPException(status_code=400, detail=f"Missing column in Excel: {e}. Please ensure your Excel file contains the following columns: 'Date', 'Merchant', 'Amount ($').")
                except ValueError as e:
                    raise HTTPException(status_code=400, detail=f"Data type error in Excel row {index + 2}: {e}. Ensure 'Date' is valid date, 'Amount ($') is numeric.")
                except ValueError as e:
                    raise HTTPException(status_code=400, detail=f"Data type error in Excel row {index + 2}: {e}. Ensure 'account_id' is integer, 'date' is valid date, 'amount' is numeric.")
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error processing Excel file: {e}")
    elif file.content_type == "application/pdf":
        # Basic Placeholder for PDF processing
        # In a real-world scenario, this would involve advanced PDF parsing libraries
        # (e.g., pdfminer.six, PyPDF2, or commercial APIs) and potentially AI/ML
        # to extract structured data from various PDF layouts.
        # For this example, we'll simulate extraction and raise an error for complexity.
        # A more robust solution would attempt to parse the PDF content for transaction details.
        # For now, we'll just indicate that it's not fully implemented for practical data extraction.
        raise HTTPException(status_code=501, detail="PDF processing is not yet fully implemented for practical data extraction. Please use Excel for now.")

    if not transactions_to_insert:
        raise HTTPException(status_code=400, detail="No valid transactions found in the uploaded file.")

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # Check if account_id belongs to the user
        account_ids = [t[1] for t in transactions_to_insert]
        unique_account_ids = list(set(account_ids))
        
        cursor.execute(f"SELECT id FROM user_accounts WHERE user_id = %s AND id IN ({','.join(['%s']*len(unique_account_ids))})", (user_id, *unique_account_ids))
        valid_account_ids = {row[0] for row in cursor.fetchall()}

        for user_id, account_id, date, descr, amount in transactions_to_insert:
            if account_id not in valid_account_ids:
                raise HTTPException(status_code=403, detail=f"Account ID {account_id} does not belong to the current user or does not exist.")
            cursor.execute(
                "INSERT INTO user_transactions (user_id, account_id, date, descr, amount) VALUES (%s, %s, %s, %s, %s)",
                (user_id, account_id, date, descr, amount)
            )
        conn.commit()
        return {"message": f"Successfully uploaded and processed {len(transactions_to_insert)} transactions."}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {e}")
    finally:
        cursor.close()
        conn.close()


@router.post("/investments")
async def upload_investments(
    file: UploadFile = File(...),
    request: Request = Request,
    current_user: dict = Depends(get_current_user)
):
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required to upload investments")

    user_id = current_user["id"]

    # Validate file type
    if file.content_type not in ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/vnd.ms-excel", "application/pdf"]:
        raise HTTPException(status_code=400, detail="Invalid file type. Only Excel (.xlsx, .xls) or PDF files are allowed.")

    contents = await file.read()
    
    investments_to_insert = []

    if file.content_type in ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/vnd.ms-excel"]:
        # Process Excel file
        try:
            df = pd.read_excel(io.BytesIO(contents))
            # Assuming Excel has columns: 'investment_type', 'name', 'quantity', 'purchase_price', 'current_price', 'purchase_date'
            # You might need to adjust column names based on actual Excel structure
            for index, row in df.iterrows():
                try:
                    investment_type = str(row['investment_type'])
                    name = str(row['name'])
                    quantity = float(row['quantity'])
                    purchase_price = float(row['purchase_price'])
                    current_price = float(row['current_price']) if 'current_price' in row and pd.notna(row['current_price']) else None
                    purchase_date = pd.to_datetime(row['purchase_date']).date() if 'purchase_date' in row and pd.notna(row['purchase_date']) else None
                    investments_to_insert.append((user_id, investment_type, name, quantity, purchase_price, current_price, purchase_date))
                except KeyError as e:
                    raise HTTPException(status_code=400, detail=f"Missing column in Excel: {e}. Required columns: 'investment_type', 'name', 'quantity', 'purchase_price', 'current_price', 'purchase_date'.")
                except ValueError as e:
                    raise HTTPException(status_code=400, detail=f"Data type error in Excel row {index + 2}: {e}. Ensure numeric fields are numbers and dates are valid.")
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error processing Excel file: {e}")
    elif file.content_type == "application/pdf":
        # Basic Placeholder for PDF processing
        # Similar to transactions, robust PDF parsing for investments would require
        # advanced libraries and potentially AI/ML to extract structured data.
        # For now, we'll just indicate that it's not fully implemented for practical data extraction.
        raise HTTPException(status_code=501, detail="PDF processing is not yet fully implemented for practical data extraction. Please use Excel for now.")

    if not investments_to_insert:
        raise HTTPException(status_code=400, detail="No valid investments found in the uploaded file.")

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        for user_id, investment_type, name, quantity, purchase_price, current_price, purchase_date in investments_to_insert:
            cursor.execute(
                "INSERT INTO user_investments (user_id, investment_type, name, quantity, purchase_price, current_price, purchase_date) VALUES (%s, %s, %s, %s, %s, %s, %s)",
                (user_id, investment_type, name, quantity, purchase_price, current_price, purchase_date)
            )
        conn.commit()
        return {"message": f"Successfully uploaded and processed {len(investments_to_insert)} investments."}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {e}")
    finally:
        cursor.close()
        conn.close()

