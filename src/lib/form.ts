/**
 * Reading form fields into GoHead input. GoHead rejects null or empty values
 * for typed attributes (an enum, a date…), and an update replaces the whole
 * entry, so an empty field is simply left out: that clears it.
 */
import { isGoHeadError } from "@gohead-cms/client";

import type { T } from "@/lib/i18n/translate";
import { fromLocal } from "@/lib/time";

export interface FormState {
  error?: string;
  /** The write went through and the form can be cleared (forms that stay on the page). */
  ok?: boolean;
}

export class Fields {
  constructor(private readonly form: FormData) {}

  str(name: string): string | undefined {
    const v = this.form.get(name);
    if (typeof v !== "string") return undefined;
    const t = v.trim();
    return t === "" ? undefined : t;
  }

  required(name: string, label = name): string {
    const v = this.str(name);
    if (v === undefined) throw new FieldError(`${label} is required`);
    return v;
  }

  num(name: string): number | undefined {
    const v = this.str(name)?.replace(",", ".");
    if (v === undefined) return undefined;
    const n = Number(v);
    if (!Number.isFinite(n)) throw new FieldError(`${name.replace(/_/g, " ")} must be a number`);
    return n;
  }

  int(name: string): number | undefined {
    const n = this.num(name);
    return n === undefined ? undefined : Math.round(n);
  }

  id(name: string): number | undefined {
    const n = this.int(name);
    return n !== undefined && n > 0 ? n : undefined;
  }

  ids(name: string): number[] {
    return this.form
      .getAll(name)
      .map((v) => (typeof v === "string" ? Number(v) : NaN))
      .filter((n) => Number.isInteger(n) && n > 0);
  }

  bool(name: string): boolean {
    const v = this.form.get(name);
    return v === "on" || v === "true" || v === "1";
  }

  oneOf<K extends string>(name: string, record: Record<K, unknown>): K | undefined {
    const v = this.str(name);
    if (v === undefined) return undefined;
    if (!Object.prototype.hasOwnProperty.call(record, v)) throw new FieldError(`${name.replace(/_/g, " ")}: unknown value "${v}"`);
    return v as K;
  }

  file(name: string): File | undefined {
    const v = this.form.get(name);
    return v instanceof File && v.size > 0 ? v : undefined;
  }

  files(name: string): File[] {
    return this.form.getAll(name).filter((v): v is File => v instanceof File && v.size > 0);
  }

  /** A comma-separated list of ids, in the order given. */
  idList(name: string): number[] {
    return (this.str(name) ?? "")
      .split(",")
      .map((v) => Number(v.trim()))
      .filter((n) => Number.isInteger(n) && n > 0);
  }

  /** A datetime-local value ("2026-10-26T10:00") in the studio's time zone, as UTC ISO 8601. */
  datetime(name: string): string | undefined {
    const v = this.str(name);
    if (v === undefined) return undefined;
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(v)) throw new FieldError(`${name.replace(/_/g, " ")}: not a date and time`);
    return fromLocal(v).toISOString().replace(/\.\d{3}Z$/, "Z");
  }
}

/** A field the user has to fix: its message is shown as is. */
export class FieldError extends Error {}

/** Leaves out undefined values. */
export function compact<T extends Record<string, unknown>>(values: T): T {
  return Object.fromEntries(Object.entries(values).filter(([, v]) => v !== undefined)) as T;
}

/**
 * What to tell the user when a write fails. A FieldError carries a message
 * that is already in the reader's language; GoHead's own messages are not
 * translatable, so they are shown as they come.
 */
export function failure(t: T, err: unknown): FormState {
  if (err instanceof FieldError) return { error: err.message };
  if (isGoHeadError(err)) {
    if (err.status === 403) return { error: t("error.role.forbidden") };
    if (err.status === 0) return { error: t("error.unreachable", { message: err.message }) };
    return { error: err.message };
  }
  // Next.js redirects and notFound() are thrown: let them through.
  throw err;
}
