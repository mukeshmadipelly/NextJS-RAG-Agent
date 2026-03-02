import os
import chromadb
from chromadb.utils import embedding_functions
import requests
import json
from datetime import datetime, timezone

# ----------------------------------------
# 1. Setup Embeddings
# ----------------------------------------
embedding_fn = embedding_functions.SentenceTransformerEmbeddingFunction(
    model_name=os.getenv("EMBEDDING_MODEL", "all-mpnet-base-v2")
)

client = chromadb.PersistentClient(path=os.getenv("CHROMA_PATH", "./chroma_store"))

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434").rstrip("/")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "mistral")

# ----------------------------------------
# 2. Load Knowledge Memory (RAG documents)
# ----------------------------------------
doc_collection = client.get_collection(
    name="nextjs_rag",
    embedding_function=embedding_fn
)

# ----------------------------------------
# 3. Load Agent Episodic Memory
# ----------------------------------------
memory_collection = client.get_or_create_collection(
    name="agent_memory",
    embedding_function=embedding_fn
)

print("\n🤖 Next.js RAG Agent started (type 'exit' to quit)")

# ----------------------------------------
# 4. Conversation Loop (AGENT CORE)
# ----------------------------------------
while True:
    question = input("\n🧑 You: ").strip()

    if not question:
        continue

    if question.lower() in ["exit", "quit"]:
        print("👋 Agent stopped.")
        break

    # ----------------------------------------
    # 5. Retrieve DOCUMENT context (RAG)
    # ----------------------------------------
    doc_results = doc_collection.query(
        query_texts=[question],
        n_results=2
    )

    doc_context = "\n\n---\n\n".join(
        d[:1500] for d in doc_results["documents"][0]
    )

    # ----------------------------------------
    # 6. Retrieve EPISODIC MEMORY
    # ----------------------------------------
    memory_results = memory_collection.query(
        query_texts=[question],
        n_results=3
    )

    memory_context = "\n".join(
        m[:500] for m in memory_results["documents"][0]
    )

    # ----------------------------------------
    # 7. Build AGENT PROMPT (SAFE + EXPLANATORY)
    # ----------------------------------------
    agent_prompt = f"""
You are a senior Next.js documentation assistant with long-term memory.

STRICT RULES:
- Use ONLY the provided context.
- Do NOT use outside knowledge.
- You MAY summarize and combine information across the context.
- Do NOT introduce new facts.
- If the answer cannot be derived, say exactly: "I don't know".

ANSWER RULES:
- Be detailed and developer-friendly.
- If the question asks for features, benefits, or overview:
  - Answer using bullet points on separate lines.
  - CRITICAL: Each bullet point MUST start with "- " (dash and space) on a NEW LINE.
  - Use **bold** for feature names by wrapping them in double asterisks.
  - Example format:
  
The main features are:

- **Server-side Rendering**: Description here.
- **Static Generation**: Description here.

- Include code examples ONLY if they appear in the context.

Conversation Memory:
{memory_context}

Documentation Context:
{doc_context}

User Question:
{question}

Answer:
"""

    # ----------------------------------------
    # 8. Call Ollama (Streaming Response)
    # ----------------------------------------
    print("\n🤖 Agent:\n")

    response = requests.post(
        f"{OLLAMA_URL}/api/generate",
        json={
            "model": OLLAMA_MODEL,
            "prompt": agent_prompt,
            "stream": True
        },
        stream=True,
        timeout=None
    )

    answer_text = ""

    for line in response.iter_lines():
        if line:
            data = json.loads(line.decode("utf-8"))
            if "response" in data:
                print(data["response"], end="", flush=True)
                answer_text += data["response"]

    print("\n")

    if not answer_text.strip():
        print("I don't know")
        continue

    # ----------------------------------------
    # 9. MEMORY SUMMARIZATION (CRITICAL)
    # ----------------------------------------
    memory_prompt = f"""
Summarize the following interaction into ONE short memory.

RULES:
- One or two sentences only
- Capture the user's intent
- Capture the key takeaway
- Do NOT include code
- Do NOT include unnecessary detail

Interaction:
User question: {question}
Agent answer: {answer_text}

Memory:
"""

    memory_response = requests.post(
        f"{OLLAMA_URL}/api/generate",
        json={
            "model": OLLAMA_MODEL,
            "prompt": memory_prompt,
            "stream": False
        },
        timeout=None
    )

    memory_summary = memory_response.json()["response"].strip()

    # ----------------------------------------
    # 10. Store EPISODIC MEMORY
    # ----------------------------------------
    if memory_summary:
        memory_collection.upsert(
            ids=[f"mem_{datetime.now(timezone.utc).isoformat()}"],
            documents=[memory_summary],
            metadatas=[{"type": "episodic"}]
        )
