/**
 * Turning what the plan found into a sentence, in the reader's language.
 *
 * findIssues() reports what is wrong as data — a kind and the values involved
 * — and this is the only place that puts it into words, so the same finding
 * reads correctly in English and in French.
 */
import type { T } from "@/lib/i18n/translate";
import type { Issue, IssueKind } from "@/lib/patch";
import { signalLabel } from "@/lib/vocab";

import type { Signal } from "@/lib/vocab";

export function issueMessage(t: T, issue: Issue): string {
  const v = issue.vars;
  switch (issue.kind) {
    case "missing_device":
      return t("issue.missing_device", {
        ...v,
        side: t(v.side === "from" ? "issue.side.source" : "issue.side.destination"),
      });
    case "signal_mismatch":
      return t("issue.signal_mismatch", {
        ...v,
        cableSignal: signalLabel(t, v.cableSignal as Signal),
        portSignal: signalLabel(t, v.portSignal as Signal),
      });
    case "direction":
      return t(v.direction === "in" ? "issue.direction.inputs" : "issue.direction.outputs", v);
    case "loop":
      // Two shapes: a cycle in the cables, or an aux coming back on a desk.
      if (v.console !== undefined) {
        return t("issue.loop.aux", { ...v, label: v.label || t("issue.loop.unnamed") });
      }
      return (
        t(v.alone ? "issue.loop.alone" : "issue.loop.chain", v) +
        (v.through ? ` ${t("issue.loop.through", { through: whereNormalled(t, String(v.through)) })}` : "")
      );
    default:
      return t(`issue.${issue.kind}`, v);
  }
}

/** The short name of a kind, for the badge next to it. */
export const issueLabel = (t: T, kind: IssueKind) => t(`issue.${kind}.label`);

/** "Patchbay I\u0001 6\u0002Patchbay II\u00013" → "Patchbay I column 6, Patchbay II column 3". */
function whereNormalled(t: T, packed: string): string {
  return packed
    .split("\u0002")
    .map((pair) => {
      const [bay, column] = pair.split("\u0001");
      return t("issue.loop.column", { bay: bay ?? "?", column: column ?? "?" });
    })
    .join(", ");
}
