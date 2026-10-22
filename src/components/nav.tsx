"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Overview" },
  { href: "/gear", label: "Gear" },
  { href: "/racks", label: "Racks & places" },
  { href: "/cables", label: "Cables" },
  { href: "/plan", label: "Patch plan" },
  { href: "/bookings", label: "Bookings" },
  { href: "/clients", label: "Clients" },
];

export function Nav() {
  const path = usePathname();
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
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
