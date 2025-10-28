import os
import datetime
import secrets
from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from dotenv import load_dotenv
from jose import jwt, JWTError
from db import get_db_connection

# SendGrid Imports for email functionality
import sendgrid
from sendgrid.helpers.mail import Mail

load_dotenv() # Load environment variables from .env file

router = APIRouter() # Initialize FastAPI router for user-related routes
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto") # Password hashing context

# Configuration for JWT (JSON Web Token)
SECRET_KEY = os.getenv("SECRET_KEY", secrets.token_hex(32)) # Secret key for JWT encoding/decoding
ALGORITHM = "HS256" # Algorithm used for JWT signing

# Configuration for SendGrid email service
SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")
SENDER_EMAIL = os.getenv("SENDER_EMAIL")

# Pydantic models for request body validation
class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    username: str

# Dependency to decode JWT and return the current user
def get_current_user(request: Request):
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="Missing token")

    scheme, _, token = auth_header.partition(" ")
    if scheme.lower() != "bearer":
        raise HTTPException(status_code=401, detail="Invalid auth scheme")

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload["sub"]
        
        # Fetch user from database using the email from the token
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id, email, username FROM users WHERE email=%s", (email,))
        user = cursor.fetchone()
        cursor.close()
        conn.close()
        
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except JWTError: # Catch JWT specific errors
        raise HTTPException(status_code=401, detail="Invalid token")
    except Exception: # Catch any other unexpected errors
        raise HTTPException(status_code=401, detail="Invalid token")

        cursor.close()
        conn.close()

# API endpoint to update the current user's information
@router.put("/me")
async def update_user_me(user_update: UserUpdate, current_user: dict = Depends(get_current_user)):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        # Check if the new username already exists for another user
        cursor.execute("SELECT id FROM users WHERE username=%s AND id != %s", (user_update.username, current_user["id"]))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Username already taken")

        # Update the username in the database
        print(f"Updating username to: {user_update.username} for user ID: {current_user['id']}")
        cursor.execute("UPDATE users SET username=%s WHERE id=%s", (user_update.username, current_user['id']))
        conn.commit()

        # Re-encode JWT token with the updated username
        new_token = jwt.encode({"sub": current_user["email"], "username": user_update.username}, SECRET_KEY, algorithm=ALGORITHM)

        # Return the updated user information and the new token
        return {"message": "Username updated successfully", "username": user_update.username, "access_token": new_token, "token_type": "bearer"}
    finally:
        cursor.close()
        conn.close()

# Helper function to send welcome email using SendGrid
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

# API endpoint for user registration
@router.post("/register")
async def register(user: UserCreate):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        # Check if email is already registered
        cursor.execute("SELECT id FROM users WHERE email=%s", (user.email,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Email already registered")
        # Check if username already exists
        cursor.execute("SELECT id FROM users WHERE username=%s", (user.username,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Username already exists")

        hashed = pwd_context.hash(user.password) # Hash the user's password
        now = datetime.datetime.utcnow() # Get current UTC time
        
        # Insert new user into the database
        cursor.execute(
            "INSERT INTO users (email, username, password_hash, created_at) VALUES (%s, %s, %s, %s)",
            (user.email, user.username, hashed, now),
        )
        user_id = cursor.lastrowid # Get the ID of the newly created user
        # Insert default user permissions
        cursor.execute("INSERT INTO user_permissions (user_id) VALUES (%s)", (user_id,))
        conn.commit() # Commit the transaction

        # Send welcome email asynchronously
        await send_welcome_email(user.email, user.username)

        return {"message": "registered", "email": user.email, "username": user.username}
    finally:
        cursor.close()
        conn.close()

# API endpoint for user login
@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        # Retrieve user by email (username in OAuth2PasswordRequestForm refers to email here)
        cursor.execute(
            "SELECT id, email, username, password_hash FROM users WHERE email=%s",
            (form_data.username,),
        )
        user = cursor.fetchone()
        # Verify user existence and password
        if not user or not pwd_context.verify(form_data.password, user["password_hash"]):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        # Encode JWT token with user's email and username
        token = jwt.encode({"sub": user["email"], "username": user["username"]}, SECRET_KEY, algorithm=ALGORITHM)
        return {"access_token": token, "token_type": "bearer"}
    finally:
        cursor.close()
        conn.close()
