# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.chat_routes import router as chat_router
from users import router as user_router
from ai import router as ai_router
from finance_data import upload_router

app = FastAPI(title="AI Finance Assistant")

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user_router, prefix="/api")
app.include_router(chat_router)
app.include_router(ai_router, prefix="/api")
app.include_router(upload_router, prefix="/api")
