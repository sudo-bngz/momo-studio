import { Card } from "@/components/ui";
import { getI18n } from "@/lib/i18n";
import { issueMessage } from "@/lib/issues";
import type { Issue } from "@/lib/patch";
import { PATCH_MODES, patchModeLabel, type PatchMode } from "@/lib/vocab";

export async function ModeLegend() {
  const { t } = await getI18n();
  return (
    <div className="mb-6 flex flex-wrap gap-x-6 gap-y-2 text-xs text-dim">
      {(Object.keys(PATCH_MODES) as PatchMode[]).map((mode) => {
        const m = patchModeLabel(t, mode);
        return (
          <span key={mode} className="flex max-w-sm items-start gap-2">
            <span className="rounded px-1 font-mono font-bold" style={{ color: m.color, background: `color-mix(in srgb, ${m.color} 20%, transparent)` }}>
              {m.short}
            </span>
            <span>
              <b className="font-medium text-ink">{m.label}</b>: {m.help}
            </span>
          </span>
        );
      })}
    </div>
  );
}

export async function LoopWarnings({ loops }: { loops: Issue[] }) {
  const { t } = await getI18n();
  return (
    <Card className="mb-6 border-bad/50">
      <p className="mb-2 font-semibold text-bad">{t("patchbay.loopWarning")}</p>
      <ul className="space-y-1 text-sm text-bad">
        {loops.map((l, i) => (
          <li key={i}>{issueMessage(t, l)}</li>
        ))}
      </ul>
    </Card>
  );
}
