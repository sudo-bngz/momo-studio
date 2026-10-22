import { Card } from "@/components/ui";
import { PATCH_MODES } from "@/lib/vocab";

export function ModeLegend() {
  return (
    <div className="mb-6 flex flex-wrap gap-x-6 gap-y-2 text-xs text-dim">
      {Object.values(PATCH_MODES).map((m) => (
        <span key={m.short} className="flex max-w-sm items-start gap-2">
          <span className="rounded px-1 font-mono font-bold" style={{ color: m.color, background: `color-mix(in srgb, ${m.color} 20%, transparent)` }}>
            {m.short}
          </span>
          <span>
            <b className="font-medium text-ink">{m.label}</b>: {m.help}
          </span>
        </span>
      ))}
    </div>
  );
}

export function LoopWarnings({ loops }: { loops: { message: string }[] }) {
  return (
    <Card className="mb-6 border-bad/50">
      <p className="mb-2 font-semibold text-bad">⚠ Feedback loop: risk of frying a pedal</p>
      <ul className="space-y-1 text-sm text-bad">
        {loops.map((l, i) => (
          <li key={i}>{l.message}</li>
        ))}
      </ul>
    </Card>
  );
}
