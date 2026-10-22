/**
 * Sign-in and the GoHead client of the current request.
 *
 * The app has no accounts of its own: people sign in with their GoHead user
 * (POST /auth/login), and the JWT GoHead returns is kept in an httpOnly
 * cookie. Every read and write then goes to GoHead as that user, so GoHead's
 * roles decide who may do what (an admin, or the `studio-staff` role created
 * by `npm run gohead:access`).
 */
import "server-only";

import { createClient, isGoHeadError, type GoHeadClient } from "@gohead-cms/client";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Where GoHead is, as this server reaches it. On Render, the blueprint sets
 * GOHEAD_HOSTPORT from the CMS service's private address, so the two talk
 * over the private network and GOHEAD_URL stays unset.
 */
export const GOHEAD_URL = (
  process.env.GOHEAD_URL ||
  (process.env.GOHEAD_HOSTPORT ? `http://${process.env.GOHEAD_HOSTPORT}` : "") ||
  "http://localhost:8080"
).replace(/\/+$/, "");
export const SESSION_COOKIE = "studio_session";
/** GoHead's tokens live 72 hours. */
const SESSION_MAX_AGE = 72 * 60 * 60;

const base = createClient({ url: GOHEAD_URL, level: 1, timeoutMs: 15_000, init: { cache: "no-store" } });

export async function signIn(username: string, password: string): Promise<void> {
  const token = await base.login(username, password);
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function signOut(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}

/** The GoHead client of the signed-in user; redirects to /login without a session. */
export async function gohead(): Promise<GoHeadClient> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) redirect("/login");
  return base.with({ token });
}

/**
 * Runs a GoHead call; an expired or revoked session sends the user back to
 * the sign-in page instead of an error page.
 */
export async function withSession<T>(fn: (client: GoHeadClient) => Promise<T>): Promise<T> {
  const client = await gohead();
  try {
    return await fn(client);
  } catch (err) {
    if (isGoHeadError(err) && err.status === 401) redirect("/login?expired=1");
    throw err;
  }
}
