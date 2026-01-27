from __future__ import annotations

from typing import Generator

from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

import version3

app = FastAPI(title="RAG Bot Backend", version="0.1.0")


class StreamRequest(BaseModel):
    message: str


@app.get("/health")
def health() -> dict:
    return {"ok": True}


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
