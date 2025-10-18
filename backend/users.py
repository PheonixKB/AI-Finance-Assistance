# backend/users.py
import os
from fastapi import APIRouter, HTTPException, Depends
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import User, Base
import datetime
import sqlalchemy

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))

# Database: use DATABASE_URL env or default to local SQLite for convenience
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./users.db")

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
# Create tables if they don't exist
Base.metadata.create_all(bind=engine)

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.getenv("SECRET_KEY", "changeme")
ALGORITHM = "HS256"


class UserCreate(BaseModel):
    username: str
    password: str


@router.post("/register")
def register(user: UserCreate):
    """Register a new user (accepts JSON)."""
    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.username == user.username).first()
        if existing:
            raise HTTPException(status_code=400, detail="Username already exists")
        hashed = pwd_context.hash(user.password)
        new_user = User(username=user.username, password_hash=hashed, created_at=datetime.datetime.utcnow())
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return {"message": "registered", "username": new_user.username}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")
    finally:
        db.close()


@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    Login expects form-encoded body (application/x-www-form-urlencoded)
    with fields 'username' and 'password' (this is how OAuth2PasswordRequestForm works).
    Returns a simple JWT-like token string (signed with SECRET_KEY) for simplicity.
    """
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.username == form_data.username).first()
        if not user or not pwd_context.verify(form_data.password, user.password_hash):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        # Create a simple token payload (for demo only)
        from jose import jwt
        token = jwt.encode({"sub": user.username}, SECRET_KEY, algorithm=ALGORITHM)
        return {"access_token": token, "token_type": "bearer"}
    finally:
        db.close()
