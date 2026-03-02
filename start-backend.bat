@echo off
echo Starting FastAPI Backend...
echo.
call .venv\Scripts\activate
echo Virtual environment activated
echo.
echo Starting uvicorn server on http://localhost:8000
echo Press Ctrl+C to stop the server
echo.
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
