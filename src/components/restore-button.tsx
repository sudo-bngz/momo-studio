"use client";

/** Puts an old version back, after asking. */
import { useRouter } from "next/navigation";
import { startTransition, useActionState, useEffect } from "react";

import { restoreVersion } from "@/app/actions";

export function RestoreButton({
  collection,
  entry,
  version,
  label = "Restore this version",
  confirm,
  primary = false,
}: {
  collection: string;
  entry: number;
  version: number;
  label?: string;
  confirm?: string;
  primary?: boolean;
}) {
  const [state, run, pending] = useActionState(restoreVersion, {});
  const router = useRouter();
  // The entry is back (or changed): show the page as it now stands.
  useEffect(() => {
    if (state.ok) router.refresh();
  }, [state, router]);
  return (
    <form
      className="inline-flex flex-col items-start gap-1"
      onSubmit={(e) => {
        e.preventDefault();
        if (confirm && !window.confirm(confirm)) return;
        const data = new FormData(e.currentTarget);
        startTransition(() => run(data));
      }}
    >
      <input type="hidden" name="collection" value={collection} />
      <input type="hidden" name="entry" value={entry} />
      <input type="hidden" name="version" value={version} />
      <button
        type="submit"
        disabled={pending}
        className={
          primary
            ? "rounded-md bg-amber px-3 py-1.5 text-sm font-medium text-amber-ink hover:brightness-110 disabled:opacity-60"
            : "rounded-md border border-line-strong px-2.5 py-1 text-xs hover:bg-raised disabled:opacity-60"
        }
      >
        {pending ? "Restoring…" : label}
      </button>
      {state.error ? <span className="text-xs text-bad">{state.error}</span> : null}
    </form>
  );
}
