const BACKEND_URL = process.env.BACKEND_URL ?? "http://127.0.0.1:8000";

function proxyHeaders(upstream: Response) {
  const contentType = upstream.headers.get("content-type") ?? "application/json; charset=utf-8";
  return {
    "Content-Type": contentType,
    "Cache-Control": "no-store",
  };
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const upstream = await fetch(`${BACKEND_URL}/chats/${id}`, { cache: "no-store" });
    const body = await upstream.text();
    return new Response(body, { status: upstream.status, headers: proxyHeaders(upstream) });
  } catch (error) {
    console.error("Fetch error in GET /api/chats/[id]:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch from backend" }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.text();
    const upstream = await fetch(`${BACKEND_URL}/chats/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body,
      cache: "no-store",
    });
    const upstreamBody = await upstream.text();
    return new Response(upstreamBody, { status: upstream.status, headers: proxyHeaders(upstream) });
  } catch (error) {
    console.error("Fetch error in PUT /api/chats/[id]:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch from backend" }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const upstream = await fetch(`${BACKEND_URL}/chats/${id}`, { method: "DELETE", cache: "no-store" });
    const upstreamBody = await upstream.text();
    return new Response(upstreamBody, { status: upstream.status, headers: proxyHeaders(upstream) });
  } catch (error) {
    console.error("Fetch error in DELETE /api/chats/[id]:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch from backend" }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }
}

