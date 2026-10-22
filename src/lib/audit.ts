/**
 * The trail of who changed what. GoHead writes a revision for every create,
 * update, publish, delete and restore, in the same transaction as the change
 * itself, and keeps who made it. This reads that trail (`GET /api/revisions`),
 * one entry's history, the difference between two versions, and puts an old
 * version back — which also brings deleted entries back.
 *
 * It needs an account that may change content: GoHead refuses history to
 * read-only roles, because revisions can hold unpublished data.
 */
import "server-only";

import { isGoHeadError } from "@gohead-cms/client";

import { withSession } from "@/lib/session";

export type RevisionAction = "create" | "update" | "publish" | "unpublish" | "delete" | "restore" | "baseline";
export type ActorKind = "user" | "token" | "agent" | "system";

export interface Revision {
  id: number;
  entityType: "item" | "singleton";
  entityId: number;
  typeName: string;
  version: number;
  action: RevisionAction;
  status?: "draft" | "published";
  actorKind: ActorKind;
  actorName?: string;
  agentRunId?: number;
  restoredFrom?: number;
  createdAt: string;
  data?: Record<string, unknown>;
}

export interface FieldChange {
  field: string;
  change: "added" | "removed" | "changed";
  before?: unknown;
  after?: unknown;
}

export interface RevisionDetail extends Revision {
  comparedTo?: number | "current";
  changes?: FieldChange[];
}

export interface Pagination {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

export interface FeedFilter {
  collection?: string;
  action?: RevisionAction;
  actorKind?: ActorKind;
  actor?: string;
  page?: number;
  pageSize?: number;
}

/** The studio's own types, in the order the filter offers them. */
export const AUDITED = ["devices", "cables", "bookings", "clients", "rooms", "locations", "maintenance"] as const;

export const TYPE_LABEL: Record<string, string> = {
  devices: "Asset",
  cables: "Cable",
  bookings: "Booking",
  clients: "Client",
  rooms: "Room",
  locations: "Location",
  maintenance: "Maintenance",
};

export const ACTION_LABEL: Record<RevisionAction, { label: string; tone: "ok" | "warn" | "bad" | "info" | "muted" }> = {
  create: { label: "Created", tone: "ok" },
  update: { label: "Changed", tone: "info" },
  publish: { label: "Published", tone: "ok" },
  unpublish: { label: "Unpublished", tone: "warn" },
  delete: { label: "Deleted", tone: "bad" },
  restore: { label: "Restored", tone: "warn" },
  baseline: { label: "Before history", tone: "muted" },
};

/** Where an entry of this type is shown in the app. */
export function entryHref(typeName: string, id: number): string | undefined {
  switch (typeName) {
    case "devices":
      return `/assets/${id}`;
    case "cables":
      return `/cables/${id}`;
    case "bookings":
      return `/bookings/${id}`;
    case "clients":
      return "/clients";
    case "rooms":
    case "locations":
      return "/places";
    default:
      return undefined;
  }
}

/** True when GoHead refused because the account may not read history. */
export const isForbidden = (err: unknown) => isGoHeadError(err) && (err.status === 403 || err.status === 401);

function query(filter: FeedFilter): string {
  const q = new URLSearchParams();
  if (filter.collection) q.set("collection", filter.collection);
  if (filter.action) q.set("action", filter.action);
  if (filter.actorKind) q.set("actorKind", filter.actorKind);
  if (filter.actor) q.set("actor", filter.actor);
  q.set("page", String(filter.page ?? 1));
  q.set("pageSize", String(filter.pageSize ?? 50));
  return `?${q}`;
}

/** The change feed across every entry, newest first. */
export async function getFeed(filter: FeedFilter = {}): Promise<{ revisions: Revision[]; pagination?: Pagination; forbidden?: boolean }> {
  return withSession(async (g) => {
    try {
      const res = await g.request<Revision[]>("GET", `/api/revisions${query(filter)}`);
      return { revisions: res.data ?? [], pagination: (res as { meta?: { pagination?: Pagination } }).meta?.pagination };
    } catch (err) {
      if (isForbidden(err)) return { revisions: [], forbidden: true };
      throw err;
    }
  });
}

/** One entry's history, newest first. */
export async function getHistory(collection: string, id: number): Promise<{ revisions: Revision[]; forbidden?: boolean }> {
  return withSession(async (g) => {
    try {
      const res = await g.request<Revision[]>("GET", `/api/collections/${encodeURIComponent(collection)}/${id}/revisions?pageSize=100`);
      return { revisions: res.data ?? [] };
    } catch (err) {
      if (isForbidden(err)) return { revisions: [], forbidden: true };
      throw err;
    }
  });
}

/** One version with what it changed, against the previous one or against the entry as it stands. */
export async function getRevision(collection: string, id: number, version: number, compare: "previous" | "current" = "previous"): Promise<RevisionDetail | null> {
  return withSession(async (g) => {
    try {
      const q = compare === "current" ? "?compare=current" : "";
      const res = await g.request<RevisionDetail>("GET", `/api/collections/${encodeURIComponent(collection)}/${id}/revisions/${version}${q}`);
      return res.data ?? null;
    } catch (err) {
      if (isGoHeadError(err) && err.status === 404) return null;
      if (isForbidden(err)) return null;
      throw err;
    }
  });
}

export interface RestoreResult {
  /** Attributes the content model no longer has, left out of the restore. */
  dropped?: string[];
  /** The entry had been deleted and is back. */
  undeleted?: boolean;
  /** The entry already held this content. */
  unchanged?: boolean;
}

/** Puts a version back. A deleted entry comes back under the same id. */
export async function restoreRevision(collection: string, id: number, version: number): Promise<RestoreResult> {
  return withSession(async (g) => {
    const res = await g.request<Record<string, unknown>>("POST", `/api/collections/${encodeURIComponent(collection)}/${id}/revisions/${version}/restore`);
    const meta = (res as { meta?: RestoreResult }).meta ?? {};
    return { dropped: meta.dropped, undeleted: meta.undeleted, unchanged: meta.unchanged };
  });
}

/** A short description of an entry, from the data a revision carries. */
export function describeData(typeName: string, data: Record<string, unknown> | undefined): string | undefined {
  if (!data) return undefined;
  const s = (k: string) => (typeof data[k] === "string" && data[k] ? (data[k] as string) : undefined);
  switch (typeName) {
    case "devices":
      return [s("code"), s("name")].filter(Boolean).join(" · ") || undefined;
    case "cables":
      return s("code");
    case "bookings":
      return s("title");
    case "clients":
      return s("artist_name") ?? s("name");
    default:
      return s("name") ?? s("title") ?? s("code");
  }
}
