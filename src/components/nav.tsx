"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useI18n } from "@/lib/i18n/client";
import type { MessageKey } from "@/lib/i18n/messages";

const LINKS: Array<{ href: string; label: MessageKey }> = [
  { href: "/", label: "nav.overview" },
  { href: "/map", label: "nav.map" },
  { href: "/assets", label: "nav.assets" },
  { href: "/racks", label: "nav.racks" },
  { href: "/cables", label: "nav.cables" },
  { href: "/patchbays", label: "nav.patchbays" },
  { href: "/consoles", label: "nav.consoles" },
  { href: "/plan", label: "nav.plan" },
  { href: "/bookings", label: "nav.bookings" },
  { href: "/clients", label: "nav.clients" },
  { href: "/activity", label: "nav.activity" },
  { href: "/people", label: "nav.people" },
  { href: "/guide", label: "nav.guide" },
];

export function Nav() {
  const path = usePathname();
  const { t } = useI18n();
  const active = (href: string) => (href === "/" ? path === "/" : path === href || path.startsWith(`${href}/`));
  return (
    <nav className="flex gap-1 overflow-x-auto md:flex-col">
      {LINKS.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className={`whitespace-nowrap rounded-md px-3 py-2 text-sm ${
            active(l.href) ? "bg-raised font-medium text-amber" : "text-dim hover:bg-raised hover:text-ink"
          }`}
        >
          {t(l.label)}
        </Link>
      ))}
    </nav>
  );
}
