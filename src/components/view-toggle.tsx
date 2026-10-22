/**
 * Gallery or table on the assets page, keeping the filters.
 *
 * Its own file because it reads the language on the server, and ui.tsx has to
 * stay importable from client components.
 */
import Link from "next/link";

import { getI18n } from "@/lib/i18n";

/** Switch the assets page between the gallery and the table, keeping the filters. */
export async function ViewToggle({ search, gallery }: { search: Record<string, string | undefined>; gallery: boolean }) {
  const { t } = await getI18n();
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
        {t("view.gallery")}
      </Link>
      <Link href={href("table")} className={`px-3 py-1.5 text-sm ${gallery ? "text-dim hover:text-ink" : "bg-raised text-amber"}`}>
        {t("view.table")}
      </Link>
    </span>
  );
}
