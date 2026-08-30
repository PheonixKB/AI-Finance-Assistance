# backend/main.py
import logging
import uuid
from contextvars import ContextVar

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

request_id_var: ContextVar[str] = ContextVar("request_id", default="-")

# Import routers for different API sections
from routes.chat_routes import router as chat_router
from users import router as user_router
from ai import router as ai_router
from routes.upload_routes import router as upload_router
from routes.content_routes import router as content_router # Import content router
from permissions import router as permissions_router
from finance_data import router as finance_router

# Configure logging with correlation ID
class CorrelationFilter(logging.Filter):
    def filter(self, record):
        record.correlation_id = request_id_var.get()
        return True

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(correlation_id)s] %(levelname)s %(name)s: %(message)s",
)
for handler in logging.root.handlers:
    handler.addFilter(CorrelationFilter())

# Initialize the FastAPI application with a title
app = FastAPI(title="AI Finance Assistant")

@app.middleware("http")
async def correlation_id_middleware(request: Request, call_next):
    correlation_id = request.headers.get("X-Correlation-ID", str(uuid.uuid4()))
    request_id_var.set(correlation_id)
    response = await call_next(request)
    response.headers["X-Correlation-ID"] = correlation_id
    return response

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
# Each router handles a specific set of endpoints, prefixed with "/api/v1".
app.include_router(user_router, prefix="/api/v1")        # Routes for user authentication and management
app.include_router(chat_router, prefix="/api/v1")        # Routes for chat functionalities
app.include_router(ai_router, prefix="/api/v1")          # Routes for AI-related operations
app.include_router(upload_router, prefix="/api/v1")      # Routes for data upload functionalities
app.include_router(content_router, prefix="/api/v1")     # Routes for general content and finance data
app.include_router(permissions_router, prefix="/api/v1")  # Routes for managing user permissions
app.include_router(finance_router, prefix="/api/v1")    # Routes for finance data retrieval