# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import routers
from ai import router as ai_router
from users import router as users_router

app = FastAPI(title="AI Finance Assistant")

# Allow frontend (React) to call backend (dev only: allow all origins)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
# Mount the ai router under /api so router.post("/ask") becomes POST /api/ask
app.include_router(ai_router, prefix="/api")
# Mount the users router under /api so /login and /register become /api/login and /api/register
app.include_router(users_router, prefix="/api")


@app.get("/api/ping")
async def ping():
    """Health check endpoint."""
    return {"message": "Finance assistant backend running."}
