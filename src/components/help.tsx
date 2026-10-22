"use client";

/**
 * In-app help. `Help` is the panel at the top of a page: its first sentence is
 * always on screen, and opening it explains what everything on the page means.
 * Open or shut is remembered per topic in this browser — read after hydration
 * so the server's markup and the client's agree, and in a try/catch because
 * storage can be blocked or empty.
 *
 * `Tip` is an inline term with its explanation from the glossary.
 *
 * Both read the manual in the reader's language.
 */
import Link from "next/link";
import { useEffect, useRef, type ReactNode } from "react";

import { RichText } from "@/components/rich-text";
import { getHelp, type GlossaryId, type TopicId } from "@/lib/help";
import { useI18n, useLocale } from "@/lib/i18n/client";

export function Help({ topic, children }: { topic: TopicId; children?: ReactNode }) {
  const { t } = useI18n();
  const locale = useLocale();
  const help = getHelp(locale);
  const topics = help.topics;
  const current = topics[topic];
  const ref = useRef<HTMLDetailsElement>(null);
  const key = `help:${topic}`;

  useEffect(() => {
    try {
      if (ref.current && localStorage.getItem(key) === "open") ref.current.open = true;
    } catch {
      // Blocked or unavailable storage: the panel simply starts shut.
    }
  }, [key]);

  const remember = (open: boolean) => {
    try {
      localStorage.setItem(key, open ? "open" : "shut");
    } catch {
      // Nothing to do: the panel still works, it just won't be remembered.
    }
  };

  const hasMore = !!(current.points?.length || current.steps?.length || children);

  return (
    <details
      ref={ref}
      data-help={topic}
      className="no-print group mb-6 rounded-lg border border-line bg-panel/70"
      onToggle={(e) => remember(e.currentTarget.open)}
    >
      <summary
        className={`flex list-none items-start gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden ${hasMore ? "cursor-pointer" : "cursor-default"}`}
      >
        <span aria-hidden className="mt-px grid size-5 shrink-0 place-items-center rounded-full border border-amber/40 text-[11px] font-semibold text-amber">
          ?
        </span>
        <span className="text-sm leading-relaxed text-dim">
          <RichText>{current.lede}</RichText>
        </span>
        {hasMore ? (
          <span className="ml-auto flex shrink-0 items-center gap-1.5 whitespace-nowrap pt-0.5 text-xs text-faint group-hover:text-dim">
            <span className="hidden sm:inline">{t("help.details")}</span>
            <svg viewBox="0 0 10 10" className="size-2.5 transition-transform group-open:rotate-90" aria-hidden>
              <path d="M2 1l5 4-5 4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        ) : null}
      </summary>

      {hasMore ? (
        <div className="border-t border-line px-4 pb-4 pt-3.5">
          {current.points?.length ? (
            <dl className="grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
              {current.points.map((pt) => (
                <div key={pt.term} className="text-sm">
                  <dt className="font-medium text-ink">{pt.term}</dt>
                  <dd className="mt-0.5 leading-relaxed text-dim">
                    <RichText>{pt.text}</RichText>
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}

          {current.steps?.length ? (
            <>
              <h3 className="mb-1.5 mt-4 text-xs font-semibold uppercase tracking-wider text-faint">{t("help.doingIt")}</h3>
              <ol className="list-decimal space-y-1 pl-5 text-sm text-dim">
                {current.steps.map((s) => (
                  <li key={s} className="leading-relaxed">
                    <RichText>{s}</RichText>
                  </li>
                ))}
              </ol>
            </>
          ) : null}

          {children}

          <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-line pt-3 text-xs">
            <Link href={`/guide#${topic}`} className="text-amber hover:underline">
              {t("help.inTheGuide", { title: current.title })}
            </Link>
            {current.see?.map((s) => (
              <Link key={s} href={`/guide#${s}`} className="text-faint hover:text-dim">
                {topics[s].title}
              </Link>
            ))}
          </p>
        </div>
      ) : null}
    </details>
  );
}

/**
 * A term with its meaning a hover or a tap away. `label` overrides the word
 * shown; the explanation always comes from the glossary, so it reads the same
 * everywhere the term appears.
 */
export function Tip({ term, label }: { term: GlossaryId; label?: string }) {
  const g = getHelp(useLocale()).glossary[term];
  return (
    <span className="group/tip relative inline-block">
      <button
        type="button"
        aria-label={`${g.term}: ${g.text}`}
        className="cursor-help border-b border-dotted border-faint text-left hover:border-amber hover:text-amber focus-visible:border-amber focus-visible:text-amber focus-visible:outline-none"
      >
        {label ?? g.term}
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-0 z-30 mb-1.5 hidden w-64 rounded-md border border-line-strong bg-raised p-2.5 text-xs font-normal leading-relaxed text-dim shadow-lg group-focus-within/tip:block group-hover/tip:block"
      >
        <span className="mb-0.5 block font-medium text-ink">{g.term}</span>
        {g.text}
      </span>
    </span>
  );
}
