# backend/permissions.py
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from database.db import get_db_connection
from .users import get_current_user

router = APIRouter(prefix="/permissions", tags=["Permissions"])

class PermissionsModel(BaseModel):
    assets: bool
    liabilities: bool
    transactions: bool
    investments: bool
    epf: bool
    creditScore: bool

def get_user_permissions(user_id: int):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM user_permissions WHERE user_id = %s", (user_id,))
    permissions = cursor.fetchone()
    cursor.close()
    conn.close()
    if not permissions:
        return {
            "assets": True,
            "liabilities": True,
            "transactions": True,
            "investments": True,
            "epf": True,
            "creditScore": True,
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
            REPLACE INTO user_permissions (user_id, assets, liabilities, transactions, investments, epf, creditScore)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (
            current_user["id"],
            permissions.assets,
            permissions.liabilities,
            permissions.transactions,
            permissions.investments,
            permissions.epf,
            permissions.creditScore
        ))
        conn.commit()
        return {"message": "Permissions updated successfully"}
    finally:
        cursor.close()
        conn.close()
