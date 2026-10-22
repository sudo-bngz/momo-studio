/** Small building blocks shared by every page (server components). */
import Link from "next/link";
import type { ReactNode } from "react";

import type { Tone } from "@/lib/vocab";

const TONES: Record<Tone, string> = {
  ok: "text-ok border-ok/30 bg-ok/10",
  warn: "text-warn border-warn/30 bg-warn/10",
  bad: "text-bad border-bad/30 bg-bad/10",
  info: "text-info border-info/30 bg-info/10",
  muted: "text-dim border-line-strong bg-raised",
};

export function Badge({ tone = "muted", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded border px-1.5 py-0.5 text-[11px] font-medium ${TONES[tone]}`}>
      {children}
    </span>
  );
}

export function SignalDot({ color, label }: { color: string; label?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
      <span className="inline-block size-2 rounded-full" style={{ background: color }} aria-hidden />
      {label}
    </span>
  );
}

export function Code({ children }: { children: ReactNode }) {
  return <span className="whitespace-nowrap font-mono text-[12px] tracking-wide text-amber">{children}</span>;
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: ReactNode; actions?: ReactNode }) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-dim">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}

export function Card({ title, actions, children, className = "" }: { title?: ReactNode; actions?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-lg border border-line bg-panel ${className}`}>
      {title ? (
        <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
          <h2 className="text-sm font-semibold">{title}</h2>
          {actions}
        </div>
      ) : null}
      <div className="p-4">{children}</div>
    </section>
  );
}

export function Stat({ label, value, hint, tone }: { label: string; value: ReactNode; hint?: ReactNode; tone?: Tone }) {
  const color = tone === "bad" ? "text-bad" : tone === "warn" ? "text-warn" : "text-ink";
  return (
    <div className="rounded-lg border border-line bg-panel px-4 py-3">
      <div className="text-[11px] uppercase tracking-wider text-faint">{label}</div>
      <div className={`mt-1 text-2xl font-semibold tabular-nums ${color}`}>{value}</div>
      {hint ? <div className="mt-0.5 text-xs text-dim">{hint}</div> : null}
    </div>
  );
}

export function ButtonLink({ href, children, primary = false }: { href: string; children: ReactNode; primary?: boolean }) {
  return (
    <Link
      href={href}
      className={
        primary
          ? "rounded-md bg-amber px-3 py-1.5 text-sm font-medium text-amber-ink hover:brightness-110"
          : "rounded-md border border-line-strong px-3 py-1.5 text-sm text-ink hover:bg-raised"
      }
    >
      {children}
    </Link>
  );
}

/** Looks like ButtonLink but is a plain link: for files and other sites, which Next.js must not prefetch. */
export function FileLink({ href, children, ...rest }: { href: string; children: ReactNode } & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a href={href} {...rest} className="rounded-md border border-line-strong px-3 py-1.5 text-sm text-ink hover:bg-raised">
      {children}
    </a>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="rounded-md border border-dashed border-line-strong px-4 py-6 text-center text-sm text-dim">{children}</p>;
}

// ---- Form fields ----

export function Field({ label, hint, children, className = "" }: { label: string; hint?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-xs font-medium text-dim">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-[11px] text-faint">{hint}</span> : null}
    </label>
  );
}

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;
export function Input(props: InputProps) {
  return <input {...props} className={`control ${props.className ?? ""}`} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea rows={3} {...props} className={`control ${props.className ?? ""}`} />;
}

export function Select({
  options,
  empty,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { options: Array<{ value: string | number; label: string }>; empty?: string }) {
  return (
    <select {...props} className={`control ${props.className ?? ""}`}>
      {empty !== undefined ? <option value="">{empty}</option> : null}
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function Checkbox({ name, label, defaultChecked }: { name: string; label: ReactNode; defaultChecked?: boolean }) {
  return (
    <label className="inline-flex items-center gap-2 text-sm">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="size-4 accent-amber" />
      {label}
    </label>
  );
}

/** Switch the assets page between the gallery and the table, keeping the filters. */
export function ViewToggle({ search, gallery }: { search: Record<string, string | undefined>; gallery: boolean }) {
  const href = (view: "gallery" | "table") => {
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries(search)) if (v && k !== "view") q.set(k, v);
    if (view === "table") q.set("view", "table");
    const s = q.toString();
    return `/assets${s ? `?${s}` : ""}`;
  };
  return (
    <span className="inline-flex overflow-hidden rounded-md border border-line-strong">
      <Link href={href("gallery")} className={`px-3 py-1.5 text-sm ${gallery ? "bg-raised text-amber" : "text-dim hover:text-ink"}`}>
        Gallery
      </Link>
      <Link href={href("table")} className={`px-3 py-1.5 text-sm ${gallery ? "text-dim hover:text-ink" : "bg-raised text-amber"}`}>
        Table
      </Link>
    </span>
  );
}
