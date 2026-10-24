import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { RichText } from "@/components/rich-text";
import { PageHeader } from "@/components/ui";
import { getHelp } from "@/lib/help";
import { getI18n } from "@/lib/i18n";
import type { T } from "@/lib/i18n/translate";
import { getTutorials, isTutorial, TUTORIAL_ORDER, type Tutorial, type TutorialStep } from "@/lib/tutorials";

// No generateStaticParams: like every page here, this one reads the locale
// cookie, so it is rendered per request anyway.

export async function generateMetadata({ params }: { params: Promise<{ tutorial: string }> }): Promise<Metadata> {
  const { locale } = await getI18n();
  const id = (await params).tutorial;
  if (!isTutorial(id)) return {};
  return { title: getTutorials(locale)[id].title };
}

export default async function TutorialPage({ params }: { params: Promise<{ tutorial: string }> }) {
  const { t, locale } = await getI18n();
  const id = (await params).tutorial;
  if (!isTutorial(id)) notFound();

  const tutorials = getTutorials(locale);
  const tutorial: Tutorial = tutorials[id];
  const help = getHelp(locale);
  const other = TUTORIAL_ORDER.find((o) => o !== id);

  return (
    <>
      <p className="mb-3 text-xs">
        <Link href="/guide" className="text-faint hover:text-amber">
          {t("tutorial.backToGuide")}
        </Link>
      </p>

      <PageHeader title={tutorial.title} subtitle={tutorial.blurb} />

      <div className="max-w-3xl">
        <p className="text-xs text-faint">{tutorial.time}</p>

        {/* What has to be true first */}
        <section className="mt-6 rounded-lg border border-line bg-panel p-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-faint">{t("tutorial.before")}</h2>
          <ul className="mt-3 space-y-2">
            {tutorial.needs.map((need) => (
              <li key={need.slice(0, 40)} className="flex gap-2.5 text-sm leading-relaxed text-dim">
                <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-faint" />
                <span>
                  <RichText>{need}</RichText>
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* Contents */}
        <nav className="mt-6">
          <ol className="space-y-1 text-sm">
            {tutorial.steps.map((step, i) => (
              <li key={step.title}>
                <Link href={`#step-${i + 1}`} className="text-dim hover:text-amber">
                  <span className="mr-2 font-mono text-xs text-faint">{i + 1}</span>
                  {step.title}
                </Link>
              </li>
            ))}
          </ol>
        </nav>

        {/* The steps */}
        {tutorial.steps.map((step, i) => (
          <Step key={step.title} step={step} n={i + 1} total={tutorial.steps.length} t={t} />
        ))}

        {/* Where that leaves you */}
        <section className="mt-12 rounded-lg border border-amber/30 bg-amber/5 p-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-amber">{t("tutorial.wrap")}</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-dim">
            <RichText>{tutorial.wrap}</RichText>
          </p>
        </section>

        {/* Where to go next */}
        <section className="mt-8 border-t border-line pt-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-faint">{t("tutorial.readNext")}</h2>
          <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
            {other ? (
              <Link href={`/guide/${other}`} className="text-amber hover:underline">
                {tutorials[other].title}
              </Link>
            ) : null}
            {tutorial.see?.map((topic) => (
              <Link key={topic} href={`/guide#${topic}`} className="text-dim hover:text-amber">
                {help.topics[topic].title}
              </Link>
            ))}
          </p>
        </section>
      </div>
    </>
  );
}

function Step({ step, n, total, t }: { step: TutorialStep; n: number; total: number; t: T }) {
  return (
    <article id={`step-${n}`} className="mt-10 scroll-mt-6 border-t border-line pt-6">
      <p className="font-mono text-xs text-faint">{t("tutorial.step", { n, total })}</p>
      <h2 className="mt-1 text-lg font-semibold text-ink">{step.title}</h2>

      {step.body.map((para) => (
        <p key={para.slice(0, 40)} className="mt-3 text-[15px] leading-relaxed text-dim">
          <RichText>{para}</RichText>
        </p>
      ))}

      {step.doThis?.length ? (
        <div className="mt-4 rounded-lg border border-line bg-raised/40 p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-faint">{t("tutorial.doThis")}</h3>
          <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm text-dim">
            {step.doThis.map((d) => (
              <li key={d.slice(0, 40)} className="leading-relaxed">
                <RichText>{d}</RichText>
              </li>
            ))}
          </ol>
        </div>
      ) : null}

      {step.aside ? (
        <aside
          className={`mt-4 border-l-2 pl-4 text-sm leading-relaxed ${
            step.aside.kind === "watch" ? "border-bad/50 text-dim" : "border-line text-dim"
          }`}
        >
          <span className={`mr-2 text-xs font-semibold uppercase tracking-wider ${step.aside.kind === "watch" ? "text-bad" : "text-faint"}`}>
            {t(step.aside.kind === "watch" ? "tutorial.watch" : "tutorial.why")}
          </span>
          <RichText>{step.aside.text}</RichText>
        </aside>
      ) : null}
    </article>
  );
}
