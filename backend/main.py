# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import routers for different API sections
from routes.chat_routes import router as chat_router
from users import router as user_router
from ai import router as ai_router
from finance_data import upload_router
from permissions import router as permissions_router

# Initialize the FastAPI application with a title
app = FastAPI(title="AI Finance Assistant")

# Define allowed origins for CORS (Cross-Origin Resource Sharing)
# This list specifies which frontend domains are allowed to make requests to this backend.
origins = [
    "http://localhost:3000",  # Example frontend development server
    "http://127.0.0.1:3000",  # Another common local development address
    "http://localhost:5173",  # Frontend development server for Vite
]

# Add CORS middleware to the FastAPI application
# This enables cross-origin requests from the specified origins.
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,          # Allow requests from the defined origins
    allow_credentials=True,         # Allow cookies to be included in cross-origin requests
    allow_methods=["*"],            # Allow all HTTP methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],            # Allow all headers in cross-origin requests
)

# Include API routers into the main application
# Each router handles a specific set of endpoints, prefixed with "/api".
app.include_router(user_router, prefix="/api")        # Routes for user authentication and management
app.include_router(chat_router, prefix="/api")        # Routes for chat functionalities
app.include_router(ai_router, prefix="/api")          # Routes for AI-related operations
app.include_router(upload_router, prefix="/api")      # Routes for data upload functionalities
app.include_router(permissions_router, prefix="/api")  # Routes for managing user permissions
