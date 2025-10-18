from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from users import router as users_router
from ai import router as ai_router

app = FastAPI()

# Update CORS setup:
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # <-- restrict to your frontend port!
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/ping")
async def ping():
    return {"message": "Finance assistant backend running."}

app.include_router(users_router, prefix="/api")
app.include_router(ai_router, prefix="/api")
