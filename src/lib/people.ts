/**
 * The accounts that can sign in. They are GoHead users, so everything here
 * goes through GoHead's admin API and only an administrator may use it —
 * which is also what makes the trail in /activity honest: every change is
 * recorded against the person who made it, not a shared token.
 */
import "server-only";

import { isGoHeadError } from "@gohead-cms/client";

import { withSession } from "@/lib/session";

export interface Person {
  id: number;
  username: string;
  email?: string;
  role: string;
  createdAt?: string;
}

export interface Role {
  name: string;
  description?: string;
  builtIn?: boolean;
}

/** GoHead's own roles, and what they mean here. */
export const ROLE_NOTE: Record<string, string> = {
  admin: "Everything, including accounts, the content model and this page",
  editor: "Every kind of content, and the media library",
  viewer: "Reads content, changes nothing — too little for this app",
  "studio-staff": "The studio's content: assets, cables, bookings, clients",
};

export interface Me {
  username: string;
  role: string;
  kind: "user" | "token";
  isAdmin: boolean;
}

/** Who is signed in, and whether they may manage accounts. */
export async function getMe(): Promise<Me> {
  return withSession(async (g) => {
    const me = await g.me();
    return { username: me.username, role: me.role, kind: me.kind, isAdmin: me.role === "admin" };
  });
}

export async function getPeople(): Promise<{ people: Person[]; roles: Role[]; forbidden?: boolean }> {
  return withSession(async (g) => {
    try {
      // GET /admin/users answers { data: { users: [...] } }.
      const res = await g.request<{ users?: Person[] } | Person[]>("GET", "/admin/users");
      const payload = res.data as { users?: Person[] } | Person[] | undefined;
      const people = Array.isArray(payload) ? payload : (payload?.users ?? []);
      const rolesRes = await g.request<Role[]>("GET", "/admin/roles");
      return { people, roles: rolesRes.data ?? [] };
    } catch (err) {
      if (isGoHeadError(err) && (err.status === 403 || err.status === 401)) return { people: [], roles: [], forbidden: true };
      throw err;
    }
  });
}

export interface NewPerson {
  username: string;
  email: string;
  password: string;
  role_name: string;
}

export const createPerson = (person: NewPerson) => withSession((g) => g.request("POST", "/admin/users", { body: person }));

export const updatePerson = (id: number, changes: Partial<NewPerson>) =>
  withSession((g) => g.request("PUT", `/admin/users/${id}`, { body: changes }));

export const deletePerson = (id: number) => withSession((g) => g.request("DELETE", `/admin/users/${id}`));

/** A readable password that is still hard to guess, shown once when an account is made. */
export function suggestPassword(): string {
  const words = ["amber", "patch", "cable", "studio", "reverb", "analog", "tempo", "signal", "filter", "console", "ribbon", "monitor"];
  const pick = () => words[Math.floor(Math.random() * words.length)]!;
  const digits = String(Math.floor(Math.random() * 9000) + 1000);
  return `${pick()}-${pick()}-${digits}`;
}
