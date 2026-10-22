"use client";

import { useI18n } from "@/lib/i18n/client";

export function PrintButton() {
  const { t } = useI18n();
  return (
    <button type="button" onClick={() => window.print()} className="rounded-md bg-amber px-3 py-1.5 text-sm font-medium text-amber-ink hover:brightness-110">
      {t("action.print")}
    </button>
  );
}
