import os
from fastapi import APIRouter, HTTPException, Depends
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import jwt
from pydantic import BaseModel
from dotenv import load_dotenv
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from models import User, Base
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
print("Users SECRET_KEY:", SECRET_KEY)
DB_URL = (
    f"mysql+pymysql://{os.getenv('DB_USERNAME')}:{os.getenv('DB_PASSWORD')}"
    f"@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}"
)
engine = create_engine(DB_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create tables if they don't exist
Base.metadata.create_all(bind=engine)

class UserCreate(BaseModel):
    username: str
    password: str

@router.post("/register")
def register(user: UserCreate):
    try:
        db = SessionLocal()
        print("DB connection successful")
        
        existing = db.query(User).filter(User.username == user.username).first()
        if existing:
            db.close()
            raise HTTPException(status_code=400, detail="Username already exists")
        print(f"Password received: '{user.password}', length: {len(user.password)}")
        if len(user.password) > 72:
            raise HTTPException(status_code=400, detail="Password must be ≤72 characters")

        hashed_pwd = pwd_context.hash(user.password)

        print(f"Password hashed: {hashed_pwd[:20]}...")
        
        db_user = User(username=user.username, password_hash=hashed_pwd)
        db.add(db_user)
        print("User added to session")
        
        db.commit()
        print("User committed to database")
        
        db.close()
        return {"msg": "Registered!"}
    except Exception as e:
        print(f"Registration error: {e}")
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")


@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    db = SessionLocal()
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not pwd_context.verify(form_data.password, user.password_hash):
        db.close()
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = jwt.encode({"sub": user.username}, SECRET_KEY, algorithm=ALGORITHM)
    db.close()
    return {"access_token": token, "token_type": "bearer"}
