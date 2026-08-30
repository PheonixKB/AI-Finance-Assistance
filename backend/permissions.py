# backend/permissions.py
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from db import get_db_connection
from users import get_current_user

router = APIRouter(prefix="/permissions", tags=["Permissions"])

class PermissionsModel(BaseModel):
    assets: bool
    liabilities: bool
    transactions: bool
    investments: bool
    epf: bool
    credit_score: bool

def get_user_permissions(user_id: int):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM user_permissions WHERE user_id = %s", (user_id,))
    permissions = cursor.fetchone()
    cursor.close()
    conn.close()
    if not permissions:
        return {
            "user_id": user_id,
            "assets": True,
            "liabilities": True,
            "transactions": True,
            "investments": True,
            "epf": True,
            "credit_score": True,
        }
    return permissions

@router.get("/")
def get_permissions(current_user: dict = Depends(get_current_user)):
    return get_user_permissions(current_user["id"])

@router.post("/")
def update_permissions(permissions: PermissionsModel, current_user: dict = Depends(get_current_user)):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            REPLACE INTO user_permissions (user_id, assets, liabilities, transactions, investments, epf, credit_score)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (
            current_user["id"],
            permissions.assets,
            permissions.liabilities,
            permissions.transactions,
            permissions.investments,
            permissions.epf,
            permissions.credit_score
        ))
        conn.commit()
        return {"message": "Permissions updated successfully"}
    finally:
        cursor.close()
        conn.close()

@router.put("/")
def update_permissions_put(permissions: PermissionsModel, current_user: dict = Depends(get_current_user)):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            REPLACE INTO user_permissions (user_id, assets, liabilities, transactions, investments, epf, credit_score)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (
            current_user["id"],
            permissions.assets,
            permissions.liabilities,
            permissions.transactions,
            permissions.investments,
            permissions.epf,
            permissions.credit_score
        ))
        conn.commit()
        return {"message": "Permissions updated successfully"}
    finally:
        cursor.close()
        conn.close()
