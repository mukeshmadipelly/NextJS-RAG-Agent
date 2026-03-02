# Quick Start Guide

## ✅ Backend is Now Running!

The FastAPI backend is currently running on http://localhost:8000

## Current Status:
- ✅ Backend: Running on port 8000
- ⏳ Frontend: Needs to be started or restarted

## Next Steps:

### Option 1: Use the Batch Scripts (Easiest)

**For Backend (already running, but for future reference):**
```bash
start-backend.bat
```

**For Frontend:**
```bash
start-frontend.bat
```

### Option 2: Manual Start

**Start/Restart the Frontend:**
```bash
cd ui
npm run dev
```

The frontend will be available at: http://localhost:3000

## Verify Everything is Working:

1. **Check Backend Health:**
   - Open http://localhost:8000/health in your browser
   - You should see: `{"ok": true}`

2. **Check Frontend:**
   - Open http://localhost:3000
   - The chat interface should load without errors
   - Check browser console (F12) - no "Failed to fetch" errors

## Common Issues:

### Backend won't start:
- Make sure virtual environment is activated
- Check if port 8000 is already in use
- Verify all dependencies are installed: `pip install -r requirements.txt`

### Frontend shows "Failed to fetch from backend":
- Verify backend is running on port 8000
- Check ui/.env.local exists with correct BACKEND_URL
- Restart the Next.js dev server after creating .env.local

### CORS errors:
- The backend now has CORS middleware configured
- If you still see CORS errors, verify backend/main.py has the CORSMiddleware import and configuration

### Database errors:
- The SQLite database will be created automatically
- If you see database errors, delete `ragbot.sqlite3` and restart the backend

## Environment Variables:

### Backend (.env in root):
```
RAG_BOT_DB_URL=sqlite:///./ragbot.sqlite3
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=mistral
CHROMA_PATH=./chroma_store
EMBEDDING_MODEL=all-MiniLM-L6-v2
```

### Frontend (ui/.env.local):
```
BACKEND_URL=http://127.0.0.1:8000
```

## Testing the Fix:

1. Start both backend and frontend as described above
2. Open http://localhost:3000
3. The app should load without console errors
4. Try creating a new chat - it should work
5. Try sending a message - it should stream the response

If you still encounter issues, check:
- Both servers are running
- No firewall blocking localhost connections
- Browser console for specific error messages
