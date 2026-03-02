@echo off
echo Starting Next.js Frontend...
echo.
cd ui
echo Installing dependencies if needed...
call npm install
echo.
echo Starting Next.js dev server on http://localhost:3000
echo Press Ctrl+C to stop the server
echo.
call npm run dev
