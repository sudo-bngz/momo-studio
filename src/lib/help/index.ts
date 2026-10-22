/**
 * The in-app manual, in the reader's language.
 *
 * The English is the source; French falls back to it per field, so a chapter
 * that has not been translated yet shows in English rather than blank.
 */
import type { Locale } from "@/lib/i18n/locales";

import { en } from "./en";
import { fr } from "./fr";
import type { HelpContent } from "./types";

const CONTENT: Record<Locale, HelpContent> = { en, fr };

export const getHelp = (locale: Locale): HelpContent => CONTENT[locale] ?? en;

export { GUIDE_ORDER, GLOSSARY_IDS, PART_TOPICS, isTopic } from "./types";
export type { GlossaryId, HelpContent, HelpPoint, HelpTopic, PartId, TopicId } from "./types";
