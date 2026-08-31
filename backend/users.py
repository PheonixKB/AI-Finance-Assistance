import os
import datetime
import secrets
import hashlib
import logging
from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr, validator
from passlib.context import CryptContext
from dotenv import load_dotenv
from jose import jwt, JWTError
from rate_limiter import check_rate_limit
from db import get_db_connection

logger = logging.getLogger(__name__)

# SendGrid Imports for email functionality
try:
    import sendgrid
    from sendgrid.helpers.mail import Mail
except ImportError:
    sendgrid = None
    Mail = None

load_dotenv() # Load environment variables from .env file

router = APIRouter() # Initialize FastAPI router for user-related routes
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto") # Password hashing context

LOGIN_RATE_LIMIT = 5
LOGIN_RATE_LIMIT_WINDOW = 5 * 60

UPLOAD_RATE_LIMIT = 5
UPLOAD_RATE_LIMIT_WINDOW = 60

# Configuration for JWT (JSON Web Token)
SECRET_KEY = os.environ.get("SECRET_KEY")
if not SECRET_KEY:
    raise RuntimeError("SECRET_KEY environment variable is required")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 15
REFRESH_SECRET_KEY = os.environ.get("REFRESH_SECRET_KEY", SECRET_KEY)
REFRESH_TOKEN_EXPIRE_DAYS = 7

def set_auth_cookies(response, access_token: str, refresh_token: str):
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=os.environ.get("COOKIE_SECURE", "false").lower() == "true",
        samesite="lax",
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=os.environ.get("COOKIE_SECURE", "false").lower() == "true",
        samesite="lax",
        max_age=REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
    )

# Configuration for SendGrid email service
SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")
SENDER_EMAIL = os.getenv("SENDER_EMAIL")

# Pydantic models for request body validation
class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str

    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        if not any(c.isupper() for c in v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain at least one number')
        if not any(c in '!@#$%^&*()_+-=[]{}|;:,.<>?' for c in v):
            raise ValueError('Password must contain at least one special character')
        return v

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    username: str

class RefreshRequest(BaseModel):
    refresh_token: str

# Dependency to decode JWT and return the current user
def get_current_user(request: Request):
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        return None

    scheme, _, token = auth_header.partition(" ")
    if scheme.lower() != "bearer":
        return None

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
            return None
        return user
    except JWTError:
        return None
    except Exception:
        return None

def hash_refresh_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()

def create_refresh_token(user_id: int) -> str:
    raw_token = secrets.token_urlsafe(32)
    token_hash = hash_refresh_token(raw_token)
    expires_at = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (%s, %s, %s)",
            (user_id, token_hash, expires_at)
        )
        conn.commit()
    finally:
        cursor.close()
        conn.close()

    return raw_token

def verify_refresh_token(raw_token: str) -> dict | None:
    token_hash = hash_refresh_token(raw_token)
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT id, user_id, expires_at FROM refresh_tokens WHERE token_hash=%s",
            (token_hash,)
        )
        row = cursor.fetchone()
        if not row:
            return None
        if datetime.datetime.now(datetime.timezone.utc) > row["expires_at"].replace(tzinfo=datetime.timezone.utc):
            return None
        return row
    finally:
        cursor.close()
        conn.close()

def revoke_refresh_token(raw_token: str):
    token_hash = hash_refresh_token(raw_token)
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM refresh_tokens WHERE token_hash=%s", (token_hash,))
        conn.commit()
    finally:
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
        logger.info("Updating username to: %s for user ID: %s", user_update.username, current_user['id'])
        cursor.execute("UPDATE users SET username=%s WHERE id=%s", (user_update.username, current_user['id']))
        conn.commit()

        # Re-encode JWT token with the updated username
        new_token = jwt.encode({
            "sub": current_user["email"],
            "username": user_update.username,
            "exp": datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        }, SECRET_KEY, algorithm=ALGORITHM)

        # Return the updated user information and the new token
        return {"message": "Username updated successfully", "username": user_update.username, "access_token": new_token, "token_type": "bearer"}
    finally:
        cursor.close()
        conn.close()

@router.delete("/me")
async def delete_user_me(current_user: dict = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required to delete account.")
    
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM users WHERE id = %s", (current_user["id"],))
        conn.commit()
        return {"message": "Account deleted successfully."}
    finally:
        cursor.close()
        conn.close()

# Helper function to send welcome email using SendGrid
async def send_welcome_email(recipient_email: str, username: str):
    if not SENDGRID_API_KEY or not SENDER_EMAIL:
        logger.warning("SendGrid API key or sender email not configured. Skipping welcome email.")
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
        logger.info("Welcome email sent to %s. Status Code: %s", recipient_email, response.status_code)
    except Exception as e:
        logger.error("Error sending welcome email to %s: %s", recipient_email, e)

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

        # Encode JWT token with user's email and username
        token = jwt.encode({
            "sub": user.email,
            "username": user.username,
            "exp": datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        }, SECRET_KEY, algorithm=ALGORITHM)

        refresh_token = create_refresh_token(user_id)

        response = JSONResponse({
            "message": "registered",
            "email": user.email,
            "username": user.username,
            "token_type": "bearer"
        })
        set_auth_cookies(response, token, refresh_token)
        return response
    finally:
        cursor.close()
        conn.close()

# API endpoint for user login
@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), request: Request = None):
    client_ip = request.client.host if request else "unknown"
    login_key = f"login:{client_ip}"

    if not check_rate_limit(login_key, LOGIN_RATE_LIMIT, LOGIN_RATE_LIMIT_WINDOW):
        raise HTTPException(
            status_code=429,
            detail="Too many login attempts. Please try again later.",
        )

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
        token = jwt.encode({
            "sub": user["email"],
            "username": user["username"],
            "exp": datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        }, SECRET_KEY, algorithm=ALGORITHM)

        refresh_token = create_refresh_token(user["id"])

        response = JSONResponse({
            "token_type": "bearer"
        })
        set_auth_cookies(response, token, refresh_token)
        return response
    finally:
        cursor.close()
        conn.close()

# API endpoint to refresh access token
class RefreshRequest(BaseModel):
    refresh_token: str

@router.post("/refresh")
async def refresh_token_endpoint(payload: RefreshRequest):
    token_row = verify_refresh_token(payload.refresh_token)
    if not token_row:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT email, username FROM users WHERE id=%s", (token_row["user_id"],))
        user = cursor.fetchone()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
    finally:
        cursor.close()
        conn.close()

    new_access_token = jwt.encode({
        "sub": user["email"],
        "username": user["username"],
        "exp": datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    }, SECRET_KEY, algorithm=ALGORITHM)

    new_refresh_token = create_refresh_token(user["id"])
    revoke_refresh_token(payload.refresh_token)

    response = JSONResponse({
        "token_type": "bearer"
    })
    set_auth_cookies(response, new_access_token, new_refresh_token)
    return response

@router.post("/logout")
async def logout(request: Request):
    access_token = request.cookies.get("access_token")
    refresh_token = request.cookies.get("refresh_token")
    if refresh_token:
        revoke_refresh_token(refresh_token)
    response = JSONResponse({"message": "Logged out successfully"})
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    return response
