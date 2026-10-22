"use client";

import { useI18n } from "@/lib/i18n/client";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { t } = useI18n();
  return (
    <div className="mx-auto max-w-lg py-20 text-center">
      <h1 className="text-xl font-semibold">{t("ops.error.title")}</h1>
      <p className="mt-2 text-sm text-dim">
        {error.message.includes("cannot reach") || error.message.includes("no answer")
          ? t("ops.error.unreachable")
          : error.message.includes("404")
            ? t("ops.error.unknownType")
            : t("ops.error.logged")}
      </p>
      <button onClick={reset} className="mt-6 rounded-md border border-line-strong px-3 py-1.5 text-sm hover:bg-raised">
        {t("ops.error.retry")}
      </button>
    </div>
  );
}
