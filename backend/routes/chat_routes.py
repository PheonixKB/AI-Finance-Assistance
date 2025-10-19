from fastapi import APIRouter, HTTPException, Request
from models.models import CreateChatSession, AddMessage
from db import get_db_connection
from users import get_current_user

router = APIRouter(prefix="/chat", tags=["Chat"])

# Create session (user inferred from token)
@router.post("/create_session")
def create_chat_session(payload: CreateChatSession, request: Request):
    current_user = get_current_user(request)
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            "INSERT INTO chat_sessions (user_id, title, created_at) VALUES (%s, %s, NOW())",
            (current_user["id"], payload.title)
        )
        conn.commit()
        session_id = cursor.lastrowid
        # Always send as {id, title}
        return {"id": session_id, "title": payload.title}
    finally:
        cursor.close()
        conn.close()

# Add message
@router.post("/add_message")
def add_message(payload: AddMessage):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT id FROM chat_sessions WHERE id = %s", (payload.session_id,)
        )
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Session not found")

        cursor.execute(
            "INSERT INTO chat_messages (session_id, sender, text, created_at) VALUES (%s, %s, %s, NOW())",
            (payload.session_id, payload.sender, payload.text)
        )
        conn.commit()
        return {"success": True}
    finally:
        cursor.close()
        conn.close()

# Fetch messages
@router.get("/messages/{session_id}")
def get_session_messages(session_id: int):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT sender, text, created_at FROM chat_messages WHERE session_id = %s ORDER BY created_at ASC",
            (session_id,)
        )
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

# Fetch sessions by username
@router.get("/sessions/{username}")
def get_user_sessions_by_username(username: str):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT id, title, created_at FROM chat_sessions WHERE user_id = (SELECT id FROM users WHERE username=%s)",
            (username,)
        )
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()
