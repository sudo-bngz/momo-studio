"use client";

/**
 * One channel of the desk, drawn the way the GS3 lays it out and working the
 * way it works: an input stage, three bands of EQ with two swept frequencies,
 * four post-fade auxes on two dual-concentric spindles, a pre-fade cue, the
 * routing matrix, PFL, mute and the fader.
 *
 * The desk has no recall of its own, so this is the recall sheet: what you
 * set here is what the channel was doing, saved with the session.
 *
 * Next to it, `RoutingSchema` draws the path this channel's signal actually
 * takes with those settings — which is the part that is hard to see on an
 * in-line desk.
 */
import { DualKnob, Fader, Knob, Switch } from "@/components/knob";
import type { StripView } from "@/lib/console";
import { useI18n } from "@/lib/i18n/client";
import type { T } from "@/lib/i18n/translate";

export interface Recall {
  number: number;
  label: string;
  source: "" | "mic" | "line" | "tape";
  gain: number;
  phantom: boolean;
  input_reverse: boolean;
  eq_in: boolean;
  hf: number;
  mid: number;
  mid_freq: number;
  lf: number;
  lf_freq: number;
  aux1: number;
  aux2: number;
  aux3: number;
  aux4: number;
  aux34_path: "channel" | "monitor";
  cue: number;
  route: string;
  direct: boolean;
  pan: number;
  fader: number;
  pfl: boolean;
  mute: boolean;
  color: string;
  note: string;
}

/** A channel nobody has touched: everything flat, the fader off. */
export const NEUTRAL: Omit<Recall, "number"> = {
  label: "",
  source: "",
  gain: 0,
  phantom: false,
  input_reverse: false,
  eq_in: false,
  hf: 0,
  mid: 0,
  mid_freq: 1000,
  lf: 0,
  lf_freq: 100,
  aux1: 0,
  aux2: 0,
  aux3: 0,
  aux4: 0,
  aux34_path: "channel",
  cue: 0,
  route: "",
  direct: false,
  pan: 0,
  fader: 0,
  pfl: false,
  mute: false,
  color: "",
  note: "",
};

export const emptyRecall = (number: number): Recall => ({ number, ...NEUTRAL });

/** A send counts as open once its knob is off the stop. */
export const auxOpen = (s: Pick<Recall, "aux1" | "aux2" | "aux3" | "aux4">): number[] =>
  [s.aux1, s.aux2, s.aux3, s.aux4].map((v, i) => (v > 0 ? i + 1 : 0)).filter(Boolean);

export const auxText = (s: Pick<Recall, "aux1" | "aux2" | "aux3" | "aux4">) => auxOpen(s).join(",");

/**
 * Setting the sends from "1,3" — what a pasted sheet says. A send named there
 * and still at the stop is opened to a usable level; one left out is closed.
 */
export const DEFAULT_SEND = 7;
export function auxFromText(current: Pick<Recall, "aux1" | "aux2" | "aux3" | "aux4">, text: string): Partial<Recall> {
  const want = new Set((text.match(/\d+/g) ?? []).map(Number));
  const at = [current.aux1, current.aux2, current.aux3, current.aux4];
  return {
    aux1: want.has(1) ? at[0] || DEFAULT_SEND : 0,
    aux2: want.has(2) ? at[1] || DEFAULT_SEND : 0,
    aux3: want.has(3) ? at[2] || DEFAULT_SEND : 0,
    aux4: want.has(4) ? at[3] || DEFAULT_SEND : 0,
  };
}

/** Whether a channel is still untouched, so it needn't be stored at all. */
export const isNeutral = (s: Recall) =>
  (Object.keys(NEUTRAL) as Array<keyof typeof NEUTRAL>).every((k) => s[k] === NEUTRAL[k]);

const SECTION_COLOR = {
  input: "var(--color-amber)",
  hf: "#7aa7d9",
  mid: "#8fc79a",
  lf: "#e9c46a",
  aux: "var(--color-info)",
  cue: "#a78bfa",
  pan: "var(--color-dim)",
};

/** 1 234 Hz / 12.0 kHz, the way the panel prints it. */
const hz = (v: number) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : `${Math.round(v)}`);
const dB = (v: number) => `${v > 0 ? "+" : ""}${Number(v.toFixed(1))}`;
const panText = (v: number, t: T) =>
  v === 0 ? t("console.recall.centre") : `${v < 0 ? t("console.recall.left") : t("console.recall.right")}${Math.abs(Number(v.toFixed(1)))}`;

function Band({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-line px-2 py-2">
      <div className="mb-1.5 text-[8px] font-semibold uppercase tracking-[0.12em] text-faint">{title}</div>
      {children}
    </div>
  );
}

export function ConsoleStrip({
  value,
  onChange,
  groups,
  auxes,
}: {
  value: Recall;
  onChange: (patch: Partial<Recall>) => void;
  groups: number;
  auxes: number;
}) {
  const { t } = useI18n();
  const set = <K extends keyof Recall>(k: K) => (v: Recall[K]) => onChange({ [k]: v } as Partial<Recall>);
  const pairs: string[] = [];
  for (let g = 1; g <= groups; g += 2) pairs.push(g + 1 <= groups ? `${g}-${g + 1}` : `${g}`);
  const routed = (p: string) => value.route.split(/[\s,+]+/).includes(p);
  const toggleRoute = (p: string) => {
    const parts = value.route.split(/[\s,+]+/).filter(Boolean);
    onChange({ route: (routed(p) ? parts.filter((x) => x !== p) : [...parts, p]).join(" + ") });
  };
  const toMix = /mix/i.test(value.route);

  return (
    <div className="w-[154px] shrink-0 overflow-hidden rounded-md border border-line bg-[#17181b]">
      {/* Input */}
      <div className="px-2 py-2">
        <div className="mb-1.5 flex gap-1">
          {(["mic", "line", "tape"] as const).map((s) => (
            <Switch key={s} on={value.source === s} onChange={() => onChange({ source: value.source === s ? "" : s })} wide>
              {t(`console.role.${s}`)}
            </Switch>
          ))}
        </div>
        <div className="mb-1.5 flex gap-1">
          <Switch on={value.phantom} onChange={set("phantom")} color="var(--color-bad)" title={t("console.recall.phantom.help")} wide>
            48V
          </Switch>
          <Switch on={value.input_reverse} onChange={set("input_reverse")} title={t("console.recall.reverse.help")} wide>
            {t("console.recall.reverse")}
          </Switch>
        </div>
        <div className="flex justify-center">
          <Knob
            value={value.gain}
            onChange={set("gain")}
            min={0}
            max={10}
            step={0.1}
            label={t("console.recall.gain")}
            color={SECTION_COLOR.input}
          />
        </div>
      </div>

      {/* EQ: HF shelf at 12 kHz, swept mid, swept LF */}
      <Band title={t("console.recall.eq")}>
        <Switch on={value.eq_in} onChange={set("eq_in")} title={t("console.recall.eqIn.help")} wide>
          {t("console.recall.eqIn")}
        </Switch>
        <div className={`mt-2 grid grid-cols-2 gap-x-1 gap-y-2 ${value.eq_in ? "" : "opacity-50"}`}>
          <Knob value={value.hf} onChange={set("hf")} min={-14} max={14} step={0.5} detent label={t("console.recall.hf")} format={dB} color={SECTION_COLOR.hf} size={34} />
          <div className="flex items-end justify-center pb-3 text-[8px] text-faint">12k</div>
          <Knob value={value.mid} onChange={set("mid")} min={-14} max={14} step={0.5} detent label={t("console.recall.mid")} format={dB} color={SECTION_COLOR.mid} size={34} />
          <Knob value={value.mid_freq} onChange={set("mid_freq")} min={300} max={12000} step={10} label={t("console.recall.freq")} format={hz} color={SECTION_COLOR.mid} size={34} />
          <Knob value={value.lf} onChange={set("lf")} min={-14} max={14} step={0.5} detent label={t("console.recall.lf")} format={dB} color={SECTION_COLOR.lf} size={34} />
          <Knob value={value.lf_freq} onChange={set("lf_freq")} min={20} max={600} step={5} label={t("console.recall.freq")} format={hz} color={SECTION_COLOR.lf} size={34} />
        </div>
      </Band>

      {/* Sends: two dual-concentric spindles and the pre-fade cue */}
      <Band title={t("console.recall.sends")}>
        <div className="flex items-start justify-around">
          {auxes >= 2 ? (
            <DualKnob
              label="1 / 2"
              outer={{ name: t("console.recall.aux", { n: 1 }), value: value.aux1, onChange: set("aux1"), min: 0, max: 10, step: 0.1, color: SECTION_COLOR.aux }}
              inner={{ name: t("console.recall.aux", { n: 2 }), value: value.aux2, onChange: set("aux2"), min: 0, max: 10, step: 0.1 }}
            />
          ) : null}
          {auxes >= 4 ? (
            <DualKnob
              label="3 / 4"
              outer={{ name: t("console.recall.aux", { n: 3 }), value: value.aux3, onChange: set("aux3"), min: 0, max: 10, step: 0.1, color: SECTION_COLOR.aux }}
              inner={{ name: t("console.recall.aux", { n: 4 }), value: value.aux4, onChange: set("aux4"), min: 0, max: 10, step: 0.1 }}
            />
          ) : null}
        </div>
        {auxes >= 4 ? (
          <div className="mt-1.5">
            <Switch
              on={value.aux34_path === "monitor"}
              onChange={(on) => onChange({ aux34_path: on ? "monitor" : "channel" })}
              title={t("console.recall.auxPath.help")}
              wide
            >
              {value.aux34_path === "monitor" ? t("console.recall.auxPath.monitor") : t("console.recall.auxPath.channel")}
            </Switch>
          </div>
        ) : null}
        <div className="mt-2 flex justify-center">
          <Knob value={value.cue} onChange={set("cue")} min={0} max={10} step={0.1} label={t("console.recall.cue")} color={SECTION_COLOR.cue} size={34} />
        </div>
      </Band>

      {/* The routing matrix, beside the top of the fader travel on the desk */}
      <Band title={t("console.recall.route")}>
        <div className="mb-2 flex justify-center">
          <Knob value={value.pan} onChange={set("pan")} min={-5} max={5} step={0.5} detent label={t("console.recall.pan")} format={(v) => panText(v, t)} color={SECTION_COLOR.pan} size={34} />
        </div>
        <div className="grid grid-cols-2 gap-1">
          {pairs.map((p) => (
            <Switch key={p} on={routed(p)} onChange={() => toggleRoute(p)} wide>
              {p}
            </Switch>
          ))}
          <Switch on={toMix} onChange={() => toggleRoute("mix")} wide>
            {t("console.recall.mix")}
          </Switch>
          <Switch on={value.direct} onChange={set("direct")} title={t("console.recall.direct.help")} wide>
            {t("console.recall.direct")}
          </Switch>
        </div>
      </Band>

      {/* PFL, mute, fader */}
      <Band title="">
        <div className="mb-2 flex gap-1">
          <Switch on={value.pfl} onChange={set("pfl")} color="var(--color-info)" title={t("console.recall.pfl.help")} wide>
            PFL
          </Switch>
          <Switch on={value.mute} onChange={set("mute")} color="var(--color-bad)" title={t("console.recall.mute.help")} wide>
            {t("console.recall.mute")}
          </Switch>
        </div>
        <div className="flex justify-center">
          <Fader value={value.fader} onChange={set("fader")} label={t("console.recall.fader")} />
        </div>
      </Band>

      {/* The scribble strip, where it is on the desk: under the fader */}
      <div
        className="border-t border-line px-1.5 py-1.5 text-center"
        style={{ background: value.color ? `color-mix(in srgb, ${value.color} 35%, #17181b)` : "#1f2125" }}
      >
        <input
          value={value.label}
          onChange={(e) => onChange({ label: e.target.value })}
          aria-label={t("console.aria.label", { n: value.number })}
          placeholder={t("console.label.placeholder")}
          className="w-full bg-transparent text-center text-[11px] font-semibold text-ink outline-none placeholder:text-faint"
        />
      </div>
      <div className="border-t border-line py-0.5 text-center font-mono text-[10px] text-dim">{value.number}</div>
    </div>
  );
}

// ---- The schema ----

const LIT = "var(--color-amber)";
const DEAD = "var(--color-line-strong)";

/**
 * Where this channel's signal goes, given what the knobs say. The lit path is
 * the one it actually takes; `outputs` is what the app worked out from the
 * routing and the desk's shape, so a group shows the track outs it lands on.
 */
export function RoutingSchema({ value, view, inline }: { value: Recall; view?: StripView; inline: boolean }) {
  const { t } = useI18n();
  const open = value.fader > -70;
  const live = open && !value.mute;
  const insert = view?.sockets.find((s) => s.role === "insert");
  const inserted = !!insert?.ends.length;
  const openAux = auxOpen(value);
  const toMix = /mix/i.test(value.route) || (!value.direct && !/\d/.test(value.route));
  const groupsOn = [...new Set((value.route.match(/\d+/g) ?? []).map(Number))];

  // One lane per stage, left to right; the ways out stack on the right.
  const ROW = 100;
  const stage = (x: number, label: string, on: boolean, sub?: string) => (
    <g>
      <rect x={x} y={ROW - 13} width={62} height={26} rx={4} fill="var(--color-raised)" stroke={on ? LIT : DEAD} />
      <text x={x + 31} y={sub ? ROW - 1 : ROW + 3.5} textAnchor="middle" fontSize={9} fill={on ? "var(--color-ink)" : "var(--color-faint)"}>
        {label}
      </text>
      {sub ? (
        <text x={x + 31} y={ROW + 8} textAnchor="middle" fontSize={7} fill="var(--color-faint)">
          {sub}
        </text>
      ) : null}
    </g>
  );
  const wire = (x1: number, x2: number, on: boolean) => (
    <path d={`M${x1} ${ROW} H${x2}`} fill="none" stroke={on ? LIT : DEAD} markerEnd={on ? "url(#rs-lit)" : "url(#rs-dead)"} />
  );

  // The PFL tap is not a way out of the desk: it only changes what the
  // control room hears, so it is drawn dashed and in its own colour.
  const ways: Array<{ key: string; label: string; on: boolean; sub?: string; dashed?: boolean; color?: string }> = [
    { key: "pfl", label: t("console.schema.pfl"), on: value.pfl, sub: t("console.schema.pflSub"), dashed: true, color: "var(--color-info)" },
    { key: "direct", label: t("console.recall.direct"), on: live && value.direct, sub: t("console.schema.ownTrackOut") },
    {
      key: "group",
      label: groupsOn.length ? t("console.schema.groupN", { n: groupsOn.join("-") }) : t("console.schema.groups"),
      on: live && groupsOn.length > 0,
      sub: inline ? t("console.schema.ontoTrackOuts") : undefined,
    },
    { key: "mix", label: t("console.recall.mix"), on: live && toMix },
    { key: "aux", label: openAux.length ? t("console.schema.auxN", { n: openAux.join(", ") }) : t("console.schema.aux"), on: live && openAux.length > 0 },
  ];

  return (
    <div className="rounded-lg border border-line bg-panel p-3">
      <svg viewBox="0 0 560 196" className="w-full" role="img" aria-label={t("console.schema.aria", { n: value.number })}>
        <defs>
          <marker id="rs-lit" viewBox="0 0 8 8" refX={7} refY={4} markerWidth={5} markerHeight={5} orient="auto">
            <path d="M0 0.5 L8 4 L0 7.5 z" fill={LIT} />
          </marker>
          <marker id="rs-dead" viewBox="0 0 8 8" refX={7} refY={4} markerWidth={5} markerHeight={5} orient="auto">
            <path d="M0 0.5 L8 4 L0 7.5 z" fill={DEAD} />
          </marker>
          <marker id="rs-pfl" viewBox="0 0 8 8" refX={7} refY={4} markerWidth={5} markerHeight={5} orient="auto">
            <path d="M0 0.5 L8 4 L0 7.5 z" fill="var(--color-info)" />
          </marker>
        </defs>

        {stage(2, value.source ? t(`console.role.${value.source}`) : t("console.schema.noSource"), !!value.source)}
        {wire(64, 76, !!value.source)}
        {stage(78, t("console.recall.gain"), !!value.source, value.gain ? value.gain.toFixed(1) : undefined)}
        {wire(140, 152, !!value.source)}
        {stage(154, t("console.recall.insert"), inserted, inserted ? insert!.ends[0]!.deviceName : t("console.schema.open"))}
        {wire(216, 228, !!value.source)}
        {stage(230, t("console.recall.eq"), value.eq_in, value.eq_in ? t("console.schema.inCircuit") : t("console.schema.bypassed"))}
        {wire(292, 304, !!value.source)}
        {stage(306, t("console.recall.fader"), open, open ? `${dB(value.fader)} dB` : t("console.schema.off"))}

        {/* Pre-fade: the tap PFL listens on, before the fader and the mute. */}
        <path
          d={`M299 ${ROW} V34 H404`}
          fill="none"
          stroke={value.pfl ? "var(--color-info)" : DEAD}
          strokeDasharray="3 3"
          markerEnd={value.pfl ? "url(#rs-pfl)" : "url(#rs-dead)"}
        />

        {/* Muted: the signal stops after the fader. */}
        {value.mute ? (
          <>
            <path d={`M372 ${ROW - 7} L384 ${ROW + 7} M372 ${ROW + 7} L384 ${ROW - 7}`} stroke="var(--color-bad)" strokeWidth={1.5} />
            <text x={378} y={ROW + 21} textAnchor="middle" fontSize={8} fill="var(--color-bad)">
              {t("console.recall.mute")}
            </text>
          </>
        ) : (
          wire(368, 390, live)
        )}

        <path d={`M392 ${ROW} H404`} fill="none" stroke={live ? LIT : DEAD} />
        <path d={`M404 70 V178`} fill="none" stroke={live ? LIT : DEAD} opacity={0.45} />
        {ways.map((w, i) => {
          const cy = 34 + i * 36;
          const color = w.on ? w.color ?? LIT : DEAD;
          return (
            <g key={w.key}>
              {w.dashed ? null : <path d={`M404 ${cy} H418`} fill="none" stroke={color} markerEnd={w.on ? "url(#rs-lit)" : "url(#rs-dead)"} />}
              {w.dashed ? <path d={`M404 ${cy} H418`} fill="none" stroke={color} strokeDasharray="3 3" /> : null}
              <rect
                x={420}
                y={cy - 13}
                width={138}
                height={26}
                rx={4}
                fill="var(--color-raised)"
                stroke={color}
                strokeDasharray={w.dashed ? "3 3" : undefined}
              />
              <text x={489} y={w.sub ? cy - 1 : cy + 3.5} textAnchor="middle" fontSize={9} fill={w.on ? (w.color ?? "var(--color-ink)") : "var(--color-faint)"}>
                {w.label}
              </text>
              {w.sub ? (
                <text x={489} y={cy + 8} textAnchor="middle" fontSize={7} fill="var(--color-faint)">
                  {w.sub}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>

      {view?.outputs.length ? (
        <p className="mt-2 border-t border-line pt-2 text-xs text-dim">
          {t("console.schema.leavesBy")} <span className="text-ink">{view.outputs.join(", ")}</span>
          {inline && view.outputs.length > 1 ? <span className="mt-1 block text-faint">{t("console.schema.whyMany")}</span> : null}
        </p>
      ) : null}
    </div>
  );
}
