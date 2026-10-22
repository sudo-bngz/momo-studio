import { cookies } from "next/headers";

import { GOHEAD_URL, SESSION_COOKIE } from "@/lib/session";

/** Streams GoHead's local uploads to signed-in users. */
export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  if (!(await cookies()).has(SESSION_COOKIE)) return new Response("sign in first", { status: 401 });
  const { path } = await params;
  if (path[0] !== "uploads" || path.some((p) => p === ".." || p.includes("/"))) return new Response("not found", { status: 404 });
  const upstream = await fetch(`${GOHEAD_URL}/${path.map(encodeURIComponent).join("/")}`, { cache: "no-store" });
  if (!upstream.ok || !upstream.body) return new Response("not found", { status: upstream.status === 404 ? 404 : 502 });
  return new Response(upstream.body, {
    headers: {
      "Content-Type": upstream.headers.get("Content-Type") ?? "application/octet-stream",
      "Cache-Control": "private, max-age=86400",
    },
  });
}
