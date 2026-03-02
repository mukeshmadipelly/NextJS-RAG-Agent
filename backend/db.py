from __future__ import annotations

import os
from typing import Generator

from sqlmodel import Session, SQLModel, create_engine


def _default_db_url() -> str:
    # A local SQLite file is the simplest "production-ready enough" starting point.
    # You can swap this to Postgres later by setting RAG_BOT_DB_URL.
    return "sqlite:///./ragbot.sqlite3"


DB_URL = os.getenv("RAG_BOT_DB_URL", _default_db_url())

# Needed for SQLite in multithreaded FastAPI/Uvicorn.
connect_args = {"check_same_thread": False} if DB_URL.startswith("sqlite:///") else {}
engine = create_engine(DB_URL, connect_args=connect_args)


def init_db() -> None:
    SQLModel.metadata.create_all(engine)


def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session

