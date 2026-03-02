const BACKEND_URL = process.env.BACKEND_URL ?? "http://127.0.0.1:8000";

function proxyHeaders(upstream: Response) {
  const contentType = upstream.headers.get("content-type") ?? "application/json; charset=utf-8";
  return {
    "Content-Type": contentType,
    "Cache-Control": "no-store",
  };
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.text();
    const upstream = await fetch(`${BACKEND_URL}/chats/${id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      cache: "no-store",
    });
    const upstreamBody = await upstream.text();
    return new Response(upstreamBody, { status: upstream.status, headers: proxyHeaders(upstream) });
  } catch (error) {
    console.error("Fetch error in POST /api/chats/[id]/messages:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch from backend" }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const upstream = await fetch(`${BACKEND_URL}/chats/${id}/messages`, {
      method: "DELETE",
      cache: "no-store",
    });
    const upstreamBody = await upstream.text();
    return new Response(upstreamBody, { status: upstream.status, headers: proxyHeaders(upstream) });
  } catch (error) {
    console.error("Fetch error in DELETE /api/chats/[id]/messages:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch from backend" }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }
}

