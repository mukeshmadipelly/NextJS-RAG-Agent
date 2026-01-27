export async function POST(request: Request) {
  const { message } = await request.json();

  const upstream = await fetch("http://127.0.0.1:8000/stream", {
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
}
