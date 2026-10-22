import type { ReactNode } from "react";

import { logout } from "@/app/actions";
import { Logo } from "@/components/logo";
import { Nav } from "@/components/nav";

export default function StudioLayout({ children }: { children: ReactNode }) {
  return (
    <div className="md:flex">
      <aside className="no-print border-b border-line bg-panel md:sticky md:top-0 md:h-dvh md:w-56 md:shrink-0 md:border-r md:border-b-0">
        <div className="flex items-center gap-3 px-4 py-4">
          <Logo />
          <span className="font-semibold">Studio</span>
        </div>
        <div className="px-2 pb-3">
          <Nav />
        </div>
        <form action={logout} className="px-4 pb-3 md:absolute md:bottom-4 md:pb-0">
          <button className="text-xs text-faint hover:text-ink">Sign out</button>
        </form>
      </aside>
      <main className="print-sheet min-w-0 flex-1 px-4 py-6 md:px-8">{children}</main>
    </div>
  );
}
