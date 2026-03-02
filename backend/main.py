from __future__ import annotations

from typing import Generator, List

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlmodel import Session, select

import version3
from backend.db import get_session, init_db
from backend.models import ChatMessage, ChatSession, utcnow
from backend.schemas import ChatCreate, ChatMessageCreate, ChatRead, ChatUpdate

app = FastAPI(title="RAG Bot Backend", version="0.1.0")

# Configure CORS to allow Next.js frontend to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class StreamRequest(BaseModel):
    message: str


@app.get("/health")
def health() -> dict:
    return {"ok": True}


@app.on_event("startup")
def _startup() -> None:
    init_db()


def _chat_or_404(session: Session, chat_id: str) -> ChatSession:
    chat = session.get(ChatSession, chat_id)
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    return chat


def _chat_read(session: Session, chat: ChatSession) -> ChatRead:
    msgs = session.exec(
        select(ChatMessage).where(ChatMessage.chat_id == chat.id).order_by(ChatMessage.created_at.asc())
    ).all()
    return ChatRead(
        id=chat.id,
        title=chat.title,
        created_at=chat.created_at,
        updated_at=chat.updated_at,
        messages=[m for m in msgs],  # pydantic from_attributes
    )


@app.get("/chats", response_model=List[ChatRead])
def list_chats(session: Session = Depends(get_session)) -> List[ChatRead]:
    chats = session.exec(select(ChatSession).order_by(ChatSession.updated_at.desc())).all()
    return [_chat_read(session, c) for c in chats]


@app.post("/chats", response_model=ChatRead)
def create_chat(payload: ChatCreate, session: Session = Depends(get_session)) -> ChatRead:
    title = (payload.title or "").strip() or "New chat"
    chat = ChatSession(title=title)
    session.add(chat)
    session.commit()
    session.refresh(chat)
    return _chat_read(session, chat)


@app.get("/chats/{chat_id}", response_model=ChatRead)
def get_chat(chat_id: str, session: Session = Depends(get_session)) -> ChatRead:
    chat = _chat_or_404(session, chat_id)
    return _chat_read(session, chat)


@app.put("/chats/{chat_id}", response_model=ChatRead)
def update_chat(chat_id: str, payload: ChatUpdate, session: Session = Depends(get_session)) -> ChatRead:
    chat = _chat_or_404(session, chat_id)
    chat.title = payload.title.strip() or chat.title
    chat.updated_at = utcnow()
    session.add(chat)
    session.commit()
    session.refresh(chat)
    return _chat_read(session, chat)


@app.delete("/chats/{chat_id}")
def delete_chat(chat_id: str, session: Session = Depends(get_session)) -> dict:
    chat = _chat_or_404(session, chat_id)
    # delete messages first
    msgs = session.exec(select(ChatMessage).where(ChatMessage.chat_id == chat_id)).all()
    for m in msgs:
        session.delete(m)
    session.delete(chat)
    session.commit()
    return {"ok": True}


@app.post("/chats/{chat_id}/messages", response_model=ChatRead)
def add_message(chat_id: str, payload: ChatMessageCreate, session: Session = Depends(get_session)) -> ChatRead:
    chat = _chat_or_404(session, chat_id)

    msg = ChatMessage(chat_id=chat.id, sender=payload.sender, text=payload.text)
    session.add(msg)

    chat.updated_at = utcnow()
    session.add(chat)

    session.commit()
    session.refresh(chat)
    return _chat_read(session, chat)


@app.delete("/chats/{chat_id}/messages", response_model=ChatRead)
def clear_messages(chat_id: str, session: Session = Depends(get_session)) -> ChatRead:
    chat = _chat_or_404(session, chat_id)
    msgs = session.exec(select(ChatMessage).where(ChatMessage.chat_id == chat_id)).all()
    for m in msgs:
        session.delete(m)
    chat.updated_at = utcnow()
    session.add(chat)
    session.commit()
    session.refresh(chat)
    return _chat_read(session, chat)


@app.post("/stream")
def stream(req: StreamRequest):
    def token_generator() -> Generator[bytes, None, None]:
        for event in version3.agent_response_stream(req.message):
            event_type = event.get("type")
            text = event.get("text", "")

            if event_type == "token":
                yield text.encode("utf-8")
            elif event_type in {"refusal", "error"}:
                if text:
                    yield text.encode("utf-8")
                return
            elif event_type == "complete":
                return

    return StreamingResponse(
        token_generator(),
        media_type="text/plain; charset=utf-8",
        headers={"Cache-Control": "no-store"},
    )
