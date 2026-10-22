import { NextResponse, type NextRequest } from "next/server";

/**
 * Everything but the sign-in page needs a session. Pages check the session
 * again (an expired token is only known once GoHead refuses it): this is the
 * quick path for visitors without any.
 */
export function proxy(request: NextRequest) {
  if (request.cookies.has("studio_session")) return NextResponse.next();
  const url = request.nextUrl.clone();
  const next = request.nextUrl.pathname + request.nextUrl.search;
  url.pathname = "/login";
  url.search = next === "/" ? "" : `?next=${encodeURIComponent(next)}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Not the sign-in page, Next.js internals or files.
  matcher: ["/((?!login|_next/|.*\\.).*)"],
};
