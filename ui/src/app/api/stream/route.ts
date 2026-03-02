export async function POST(request: Request) {
  try {
    const { message } = await request.json();
    const backendUrl = process.env.BACKEND_URL ?? "http://127.0.0.1:8000";

    const upstream = await fetch(`${backendUrl}/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
      cache: "no-store",
    });

    if (!upstream.body) {
      return new Response("No stream", { status: 502 });
    }

    return new Response(upstream.body, {
      status: upstream.status,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Fetch error in POST /api/stream:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch from backend" }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }
}
