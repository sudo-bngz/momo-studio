"use client";

/**
 * A form posting to a Server Action, with the action's error shown above the
 * buttons. Submitting goes through startTransition rather than the form's
 * `action` attribute so that a refused save keeps everything typed in the
 * fields (React resets uncontrolled forms after an `action`).
 */
import { startTransition, useActionState, useEffect, useRef, type ReactNode } from "react";

import type { FormState } from "@/lib/form";
import { useI18n } from "@/lib/i18n/client";

type Action = (prev: FormState, form: FormData) => Promise<FormState>;

export function ActionForm({
  action,
  children,
  submit,
  className = "",
  footer,
}: {
  action: Action;
  children: ReactNode;
  submit?: string;
  className?: string;
  footer?: ReactNode;
}) {
  const { t } = useI18n();
  const [state, run, pending] = useActionState(action, {});
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.ok) ref.current?.reset();
  }, [state]);
  return (
    <form
      ref={ref}
      className={className}
      encType="multipart/form-data"
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(() => run(data));
      }}
    >
      {children}
      {state.error ? (
        <p role="alert" data-form-error className="mt-4 rounded-md border border-bad/40 bg-bad/10 px-3 py-2 text-sm text-bad">
          {state.error}
        </p>
      ) : null}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-amber px-4 py-2 text-sm font-medium text-amber-ink hover:brightness-110 disabled:opacity-60"
        >
          {pending ? t("action.saving") : (submit ?? t("action.save"))}
        </button>
        {footer}
      </div>
    </form>
  );
}

/** A delete button that asks first. */
export function DeleteForm({
  action,
  id,
  label,
  confirm,
  extra,
}: {
  action: Action;
  id: number;
  label?: string;
  confirm: string;
  extra?: Record<string, string>;
}) {
  const { t } = useI18n();
  const [state, run, pending] = useActionState(action, {});
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!window.confirm(confirm)) return;
        const data = new FormData(e.currentTarget);
        startTransition(() => run(data));
      }}
      className="inline-flex flex-col items-start gap-2"
    >
      <input type="hidden" name="id" value={id} />
      {Object.entries(extra ?? {}).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      <button type="submit" disabled={pending} className="rounded-md border border-bad/40 px-3 py-1.5 text-sm text-bad hover:bg-bad/10 disabled:opacity-60">
        {pending ? t("action.deleting") : (label ?? t("action.delete"))}
      </button>
      {state.error ? <p className="max-w-md text-sm text-bad">{state.error}</p> : null}
    </form>
  );
}
