from fastapi import APIRouter, HTTPException, Request
from models.models import CreateChatSession, AddMessage, UpdateChatTitle
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
def add_message(payload: AddMessage, request: Request):
    current_user = get_current_user(request)
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT id FROM chat_sessions WHERE id = %s AND user_id = %s",
            (payload.session_id, current_user["id"])
        )
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Session not found or permission denied")

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
def get_session_messages(session_id: int, request: Request):
    current_user = get_current_user(request)
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT id FROM chat_sessions WHERE id = %s AND user_id = %s",
            (session_id, current_user["id"])
        )
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Session not found or permission denied")

        cursor.execute(
            "SELECT sender, text, created_at FROM chat_messages WHERE session_id = %s ORDER BY created_at ASC",
            (session_id,)
        )
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

# Fetch sessions for current user
@router.get("/sessions")
def get_user_sessions(request: Request):
    current_user = get_current_user(request)
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT id, title, created_at FROM chat_sessions WHERE user_id = %s",
            (current_user["id"],)
        )
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

# Update session title
@router.put("/sessions/{session_id}/title")
def update_chat_title(session_id: int, payload: UpdateChatTitle, request: Request):
    current_user = get_current_user(request)
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        # Check if session exists and belongs to the user
        cursor.execute(
            "SELECT id FROM chat_sessions WHERE id = %s AND user_id = %s",
            (session_id, current_user["id"])
        )
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Session not found or permission denied")

        # Update title
        cursor.execute(
            "UPDATE chat_sessions SET title = %s WHERE id = %s",
            (payload.title, session_id)
        )
        conn.commit()
        return {"success": True, "title": payload.title}
    finally:
        cursor.close()
        conn.close()

# Delete session
@router.delete("/sessions/{session_id}")
def delete_chat_session(session_id: int, request: Request):
    current_user = get_current_user(request)
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        # Check if session exists and belongs to the user
        cursor.execute(
            "SELECT id FROM chat_sessions WHERE id = %s AND user_id = %s",
            (session_id, current_user["id"])
        )
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Session not found or permission denied")

        # Delete messages associated with the session
        cursor.execute(
            "DELETE FROM chat_messages WHERE session_id = %s",
            (session_id,)
        )
        # Delete the session itself
        cursor.execute(
            "DELETE FROM chat_sessions WHERE id = %s",
            (session_id,)
        )
        conn.commit()
        return {"success": True}
    finally:
        cursor.close()
        conn.close()
