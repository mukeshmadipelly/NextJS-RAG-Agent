from datetime import datetime, timezone
from typing import List, Optional
from uuid import uuid4

from sqlmodel import Field, Relationship, SQLModel


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class ChatSession(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid4()), primary_key=True)
    title: str = Field(default="New chat", index=True)
    created_at: datetime = Field(default_factory=utcnow)
    updated_at: datetime = Field(default_factory=utcnow, index=True)

    messages: List["ChatMessage"] = Relationship(back_populates="chat")


class ChatMessage(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid4()), primary_key=True)
    chat_id: str = Field(foreign_key="chatsession.id", index=True)

    # Keep this aligned with the UI ("user" | "agent")
    sender: str = Field(index=True)
    text: str

    created_at: datetime = Field(default_factory=utcnow, index=True)

    chat: Optional[ChatSession] = Relationship(back_populates="messages")

