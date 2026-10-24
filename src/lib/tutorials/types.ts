/**
 * Walkthroughs: the guide tells you what a thing is, a walkthrough takes you
 * through doing it once, start to finish, with real gear in the example.
 *
 * Separate from src/lib/help on purpose. A help topic is a page's own
 * documentation and shows in the panel beside it; a walkthrough spans pages
 * and is read once, in order, before you touch anything.
 */
import type { TopicId } from "@/lib/help";

export const TUTORIAL_ORDER = ["gs3", "patchbay"] as const;

export type TutorialId = (typeof TUTORIAL_ORDER)[number];

export const isTutorial = (v: string): v is TutorialId => (TUTORIAL_ORDER as readonly string[]).includes(v);

export interface TutorialStep {
  /** The heading, in the imperative: "Set the gain with PFL". */
  title: string;
  /** The explanation, in paragraphs. */
  body: string[];
  /** What to click, in order, when there is something to click. */
  doThis?: string[];
  /** The bit people get wrong, or the reason it works this way. */
  aside?: { kind: "why" | "watch"; text: string };
}

export interface Tutorial {
  title: string;
  /** One line, for the list of walkthroughs. */
  blurb: string;
  /** "About 20 minutes at the desk." */
  time: string;
  /** What has to be true before step one makes sense. */
  needs: string[];
  steps: TutorialStep[];
  /** Where you've got to, and what to read next. */
  wrap: string;
  see?: TopicId[];
}

/** One language's walkthroughs. */
export type Tutorials = Record<TutorialId, Tutorial>;
