from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class ChatMessage(BaseModel):
    id: int
    session_id: int
    sender: str
    text: str
    created_at: datetime

class ChatSession(BaseModel):
    id: int
    user_id: int
    title: str
    created_at: datetime
    messages: Optional[List[ChatMessage]] = None

class CreateChatSession(BaseModel):
    title: str  # Only title required!

class AddMessage(BaseModel):
    session_id: int
    sender: str
    text: str

class UpdateChatTitle(BaseModel):
    title: str