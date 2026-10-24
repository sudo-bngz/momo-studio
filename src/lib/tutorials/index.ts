/**
 * The walkthroughs, in the reader's language. English is the source and the
 * fallback, same arrangement as src/lib/help.
 */
import type { Locale } from "@/lib/i18n/locales";

import { en } from "./en";
import { fr } from "./fr";
import type { Tutorials } from "./types";

const CONTENT: Record<Locale, Tutorials> = { en, fr };

export const getTutorials = (locale: Locale): Tutorials => CONTENT[locale] ?? en;

export { TUTORIAL_ORDER, isTutorial } from "./types";
export type { Tutorial, TutorialId, TutorialStep, Tutorials } from "./types";
