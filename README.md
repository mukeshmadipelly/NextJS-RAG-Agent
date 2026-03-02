# NextJS RAG Agent

A sophisticated RAG (Retrieval-Augmented Generation) chatbot built with Next.js frontend and FastAPI backend, featuring real-time streaming responses, multi-chat sessions, and persistent memory.

## 🚀 Features

### Frontend (Next.js + React)
- **Modern UI**: Clean, responsive interface with TailwindCSS v4
- **Dark/Light Theme**: Toggle between themes with localStorage persistence
- **Multi-Chat Sessions**: Create, manage, and switch between multiple conversations
- **Real-time Streaming**: Token-by-token streaming responses from the backend
- **Markdown Rendering**: Beautifully formatted assistant responses with syntax highlighting
- **Chat Management**: Clear chat, new chat, and delete chat with confirmation dialogs
- **Responsive Design**: Works seamlessly on desktop and mobile devices

### Backend (FastAPI + Python)
- **RAG Architecture**: Retrieves relevant context from ChromaDB vector store
- **Streaming API**: FastAPI streaming endpoint for real-time responses
- **Memory System**: Episodic memory for conversation context retention
- **Vector Database**: ChromaDB for efficient document retrieval
- **Ollama Integration**: Uses Mistral model for intelligent responses
- **Health Monitoring**: Built-in health check endpoint

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **Python** (v3.8 or higher)
- **Ollama** with Mistral model installed
- **Git**

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/mukeshmadipelly/NextJS-RAG-Agent.git
cd NextJS-RAG-Agent
```

### 2. Backend Setup

```bash
# Create virtual environment
python -m venv .venv

# Activate virtual environment
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd ui

# Install Node.js dependencies
npm install
```

### 4. Ollama Setup

Make sure Ollama is installed and running:

```bash
# Install Mistral model
ollama pull mistral

# Start Ollama server
ollama serve
```

## 🚀 Running the Application

### Step 1: Start Ollama Server
```bash
ollama serve
```

### Step 2: Start FastAPI Backend
Open a new terminal and run:

```bash
# From the project root directory
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

The backend will be available at: `http://localhost:8000`

### Step 3: Start Next.js Frontend
Open another terminal and run:

```bash
# Navigate to frontend directory
cd ui

# Start development server
npm run dev
```

The frontend will be available at: `http://localhost:3000`

## 📁 Project Structure

```
NextJS-RAG-Agent/
├── backend/                    # FastAPI backend
│   └── main.py                # Main FastAPI application
├── ui/                        # Next.js frontend
│   ├── src/
│   │   └── app/
│   │       ├── api/stream/     # API route for streaming
│   │       ├── ChatLayout.tsx  # Main chat layout
│   │       ├── ChatWindow.tsx  # Chat interface
│   │       ├── Sidebar.tsx     # Chat sidebar
│   │       ├── MessageList.tsx # Message rendering
│   │       ├── MessageInput.tsx # Input component
│   │       ├── ThemeToggle.tsx # Theme switcher
│   │       ├── chat-context.tsx # Chat state management
│   │       └── theme-context.tsx # Theme state management
│   ├── package.json
│   └── tailwind.config.js
├── agent.py                   # Agent conversation logic
├── version3.py               # RAG model implementation
├── requirements.txt           # Python dependencies
├── chroma_store/            # ChromaDB vector database
└── rag_pdf.pdf              # Source documentation
```

## 🔧 Configuration

### Environment Variables

The application uses sensible defaults, but for production you should use environment variables.
Sample env files are provided:

- `example.env` (backend)
- `ui/example.env` (frontend)

Copy them to `.env` / `ui/.env.local` and adjust values as needed.

- **Backend**
  - `RAG_BOT_DB_URL`: database URL (defaults to local SQLite: `sqlite:///./ragbot.sqlite3`)
  - `OLLAMA_URL`: Ollama base URL (defaults to `http://localhost:11434`)
  - `OLLAMA_MODEL`: model name (defaults to `mistral`)
  - `CHROMA_PATH`: Chroma storage path (defaults to `./chroma_store`)
  - `EMBEDDING_MODEL`: sentence-transformer model (defaults vary by script)

- **Frontend**
  - `BACKEND_URL`: FastAPI backend URL used by Next.js API route handlers (defaults to `http://127.0.0.1:8000`)

### Customization

- **Theme**: Modify `ui/src/app/globals.css` for custom styling
- **Model**: Change the Ollama model in `version3.py` and `agent.py`
- **Vector Store**: Configure ChromaDB settings in `version3.py`

## 📚 How It Works

### 1. Document Ingestion
- Source PDF (`rag_pdf.pdf`) is processed and chunked
- Chunks are embedded using Sentence Transformers
- Embeddings stored in ChromaDB vector store

### 2. Query Processing
- User query is embedded using the same model
- Relevant documents retrieved from ChromaDB
- Conversation memory retrieved for context

### 3. Response Generation
- Retrieved context and memory formatted into prompt
- Prompt sent to Ollama Mistral model
- Response streamed back token by token

### 4. Memory Management
- Each conversation is summarized and stored
- Future queries can reference past interactions
- Memory helps maintain conversation context

## 🌐 API Endpoints

### Backend (FastAPI)
- `GET /health` - Health check endpoint
- `POST /stream` - Streaming chat endpoint
- `GET /chats` - List chats (with messages)
- `POST /chats` - Create a chat
- `PUT /chats/{chat_id}` - Rename a chat
- `DELETE /chats/{chat_id}` - Delete a chat
- `POST /chats/{chat_id}/messages` - Add a message to a chat (user/agent)
- `DELETE /chats/{chat_id}/messages` - Clear messages for a chat

### Frontend (Next.js API Routes)
- `POST /api/stream` - Proxy to backend streaming endpoint

## 🎯 Usage Examples

### Basic Chat
1. Open `http://localhost:3000` in your browser
2. Type your question in the input field
3. Press Enter or click the send button
4. Watch the response stream in real-time

### Managing Chats
- **New Chat**: Click "New chat" button in header
- **Clear Chat**: Click "Clear chat" button to reset current conversation
- **Delete Chat**: Click the trash icon in sidebar (with confirmation)
- **Switch Chats**: Click on any chat in the sidebar

### Theme Toggle
- Click the theme toggle button (sun/moon icon) in the top-right corner
- Theme preference is automatically saved and persisted

## 🔍 Troubleshooting

### Common Issues

1. **Ollama Connection Error**
   - Ensure Ollama is running: `ollama serve`
   - Verify Mistral model is installed: `ollama list`

2. **Backend Connection Error**
   - Check if FastAPI server is running on port 8000
   - Verify no firewall blocking the connection

3. **ChromaDB Errors**
   - Ensure `chroma_store` directory exists and has proper permissions
   - Delete `chroma_store` and restart if corrupted

4. **Frontend Build Errors**
   - Clear node_modules: `rm -rf node_modules package-lock.json`
   - Reinstall dependencies: `npm install`

### Performance Tips

- **First Load**: Initial model loading may take 30-60 seconds
- **Memory Usage**: ChromaDB can use significant RAM with large document sets
- **Streaming**: Responses may appear slow on first interaction due to model warmup

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m "Add feature"`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Ollama** for the local LLM infrastructure
- **ChromaDB** for the vector database
- **Next.js** for the frontend framework
- **FastAPI** for the backend framework
- **TailwindCSS** for the styling framework

## 📞 Support

For issues and questions:
- Create an issue on GitHub
- Check the troubleshooting section above
- Review the code comments for additional context

---

**Built with ❤️ using modern web technologies**
