import os
import datetime
import secrets
from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from dotenv import load_dotenv
from jose import jwt, JWTError
from database.db import get_db_connection
from schemas.user_schemas import UserCreate, UserLogin, UserResponse, UserUpdate
import sendgrid
from sendgrid.helpers.mail import Mail

class LoginRequest(BaseModel):
    email: EmailStr
    password: str


load_dotenv()
SECRET_KEY= os.getenv("SECRET_KEY")
ALGORITHM= "HS256"
SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")
SENDER_EMAIL = os.getenv("SENDER_EMAIL")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/login")

# SendGrid Imports
def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload["sub"]
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id, email, username FROM users WHERE email=%s", (email,))
        user = cursor.fetchone()
        cursor.close()
        conn.close()
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Helper function to send email
async def send_welcome_email(recipient_email: str, username: str):
    if not SENDGRID_API_KEY or not SENDER_EMAIL:
        print("SendGrid API key or sender email not configured. Skipping welcome email.")
        return

    message = Mail(
        from_email=SENDER_EMAIL,
        to_emails=recipient_email,
        subject="Welcome to AI Finance Assistant!",
        html_content=f"<strong>Hello {username},</strong><br>Welcome to AI Finance Assistant! We are excited to have you on board."
    )
    try:
        sg = sendgrid.SendGridAPIClient(SENDGRID_API_KEY)
        response = sg.send(message)
        print(f"Welcome email sent to {recipient_email}. Status Code: {response.status_code}")
    except Exception as e:
        print(f"Error sending welcome email to {recipient_email}: {e}")

# Register
@router.post("/register")
async def register(user: UserCreate):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT id FROM users WHERE email=%s", (user.email,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Email already registered")
        cursor.execute("SELECT id FROM users WHERE username=%s", (user.username,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Username already exists")

        hashed = pwd_context.hash(user.password)
        now = datetime.datetime.utcnow()
        cursor.execute(
            "INSERT INTO users (email, username, password_hash, created_at) VALUES (%s, %s, %s, %s)",
            (user.email, user.username, hashed, now),
        )
        user_id = cursor.lastrowid
        cursor.execute("INSERT INTO user_permissions (user_id) VALUES (%s)", (user_id,))
        conn.commit()

        # Send welcome email asynchronously
        await send_welcome_email(user.email, user.username)

        return {"message": "registered", "email": user.email, "username": user.username}
    finally:
        cursor.close()
        conn.close()

# Login
@router.post("/login")
async def login(request: LoginRequest):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT id, email, username, password_hash FROM users WHERE email=%s",
            (request.email,),
        )
        user = cursor.fetchone()
        if not user or not pwd_context.verify(request.password, user["password_hash"]):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        token = jwt.encode({"sub": user["email"]}, SECRET_KEY, algorithm=ALGORITHM)
        return {"access_token": token, "token_type": "bearer"}
    finally:
        cursor.close()
        conn.close()

@router.get("/users/me", response_model=UserResponse)
def read_users_me(current_user: dict = Depends(get_current_user)):
    return current_user

@router.put("/users/me", response_model=UserResponse)
def update_users_me(user_update: UserUpdate, current_user: dict = Depends(get_current_user)):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        updates = []
        values = []
        if user_update.username is not None:
            updates.append("username = %s")
            values.append(user_update.username)

        if not updates:
            raise HTTPException(status_code=400, detail="No fields to update")

        values.append(current_user["id"])
        query = f"UPDATE users SET {', '.join(updates)} WHERE id = %s"
        cursor.execute(query, tuple(values))
        conn.commit()

        # Fetch updated user data
        cursor.execute("SELECT id, email, username FROM users WHERE id=%s", (current_user["id"],))
        updated_user = cursor.fetchone()
        return updated_user
    finally:
        cursor.close()
        conn.close()
