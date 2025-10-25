from fastapi import APIRouter, HTTPException, Request, Depends
from database.db import get_db_connection
from api.users import get_current_user
from schemas.chat_schemas import CreateChatSession, AddMessage, UpdateChatTitle
import os
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"

router = APIRouter(prefix="/chat", tags=["Chat"])

# Create session (user inferred from token)
@router.post("/create_session")
def create_chat_session(payload: CreateChatSession, current_user: dict = Depends(get_current_user)):
    print(f"Creating chat session for user_id: {current_user['id']} with title: {payload.title}")
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            "INSERT INTO chat_sessions (user_id, title, created_at) VALUES (%s, %s, NOW())",
            (current_user["id"], payload.title)
        )
        conn.commit()
        session_id = cursor.lastrowid
        print(f"Chat session created with id: {session_id}")
        # Always send as {id, title}
        return {"id": session_id, "title": payload.title}
    except Exception as e:
        print(f"Error creating chat session: {e}")
        raise HTTPException(status_code=500, detail=f"Error creating chat session: {e}")
    finally:
        cursor.close()
        conn.close()

# Add message
@router.post("/add_message")
def add_message(payload: AddMessage, current_user: dict = Depends(get_current_user)):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT id FROM chat_sessions WHERE id = %s AND user_id = %s", (payload.session_id, current_user["id"])
        )
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Session not found or not authorized")

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
def get_session_messages(session_id: int, current_user: dict = Depends(get_current_user)):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT id FROM chat_sessions WHERE id = %s AND user_id = %s", (session_id, current_user["id"])
        )
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Session not found or not authorized")

        cursor.execute(
            "SELECT sender, text, created_at FROM chat_messages WHERE session_id = %s ORDER BY created_at ASC",
            (session_id,)
        )
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

# Fetch sessions for current user
@router.get("/sessions/user")
def get_user_sessions(current_user: dict = Depends(get_current_user)):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        print(f"Fetching sessions for user_id: {current_user['id']}")
        cursor.execute(
            "SELECT id, title, created_at FROM chat_sessions WHERE user_id = %s ORDER BY created_at DESC",
            (current_user["id"],)
        )
        sessions = cursor.fetchall()
        print(f"Fetched sessions: {sessions}")
        return sessions
    finally:
        cursor.close()
        conn.close()

# Update session title
@router.put("/sessions/{session_id}/title")
def update_chat_title(session_id: int, payload: UpdateChatTitle, current_user: dict = Depends(get_current_user)):
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
def delete_chat_session(session_id: int, current_user: dict = Depends(get_current_user)):
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
