"use client";

/**
 * A console drawn as its channel strips: for each channel, what is plugged
 * into its mic, line, tape and insert, what it is called, where it is routed
 * (direct, groups, mix, auxes) and which socket its signal leaves by. The
 * master section below lists groups, auxes, mix, returns, monitors with
 * what each socket is wired to. Click a strip to edit it; the table mode
 * edits every strip and takes rows pasted from a spreadsheet.
 */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useActionState, useEffect, useMemo, useState } from "react";

import { saveChannelStrips } from "@/app/actions";
import { useI18n } from "@/lib/i18n/client";
import type { MessageKey } from "@/lib/i18n/messages";
import type { T } from "@/lib/i18n/translate";
import { splitPasted } from "@/lib/patchbay";
import { auxFromText, auxOpen, auxText, ConsoleStrip, DEFAULT_SEND, emptyRecall, isNeutral, NEUTRAL, RoutingSchema, type Recall } from "@/components/console-strip";
import type { ConsoleView, Socket, SocketRole, StripView } from "@/lib/console";

type Editable = Recall;

/** The columns the paste-from-a-sheet table fills. */
type Field = "label" | "source" | "route" | "aux" | "color" | "note";
const SWATCHES = ["#e9c46a", "#f4a261", "#e76f51", "#d4a5c7", "#a78bfa", "#7aa7d9", "#5ec8d8", "#8fc79a", "#f0e68c", "#bdbdbd"];
const SOURCES = ["", "mic", "line", "tape"] as const;

const roleLabel = (t: T, role: SocketRole) => (role === "other" ? "" : t(`console.role.${role}`));
/** The same word drawn in a 71 px strip, where the long one does not fit. */
const roleShort = (t: T, role: SocketRole) => (role === "tape" ? t("console.role.tapeShort") : roleLabel(t, role));
const sourceLabel = (t: T, s: Editable["source"]) => (s === "" ? t("state.none") : t(`console.role.${s}`));

/** The master-section headings sectionOf() produces, as message keys. */
const SECTION_KEYS: Record<string, MessageKey> = {
  Groups: "console.section.groups",
  "Aux sends": "console.section.auxes",
  Cue: "console.section.cue",
  Mix: "console.section.mix",
  "FX returns": "console.section.fx",
  "2-Track": "console.section.twoTrack",
  Monitors: "console.section.monitors",
  Headphones: "console.section.headphones",
  MIDI: "console.section.midi",
  Power: "console.section.power",
  Other: "console.section.other",
};

const toEditable = (s: StripView): Editable => {
  const d = s.data;
  const n = <K extends keyof typeof NEUTRAL>(k: K, v: number | null | undefined) =>
    (typeof v === "number" ? v : NEUTRAL[k]) as number;
  return {
    ...emptyRecall(s.number),
    label: s.label,
    source: s.source ?? "",
    route: s.route,
    direct: s.direct,
    color: s.color,
    note: s.note,
    gain: n("gain", d?.gain),
    phantom: !!d?.phantom,
    input_reverse: !!d?.input_reverse,
    eq_in: !!d?.eq_in,
    hf: n("hf", d?.hf),
    mid: n("mid", d?.mid),
    mid_freq: n("mid_freq", d?.mid_freq),
    lf: n("lf", d?.lf),
    lf_freq: n("lf_freq", d?.lf_freq),
    // A desk filled in before the recall sheet existed knows which sends were
    // up but not how far: open those knobs to a usable level rather than
    // losing the information the first time someone saves.
    ...(() => {
      const stored = [d?.aux1, d?.aux2, d?.aux3, d?.aux4];
      const anySet = stored.some((v) => typeof v === "number" && v > 0);
      const up = new Set(s.aux);
      return {
        aux1: anySet ? n("aux1", d?.aux1) : up.has(1) ? DEFAULT_SEND : 0,
        aux2: anySet ? n("aux2", d?.aux2) : up.has(2) ? DEFAULT_SEND : 0,
        aux3: anySet ? n("aux3", d?.aux3) : up.has(3) ? DEFAULT_SEND : 0,
        aux4: anySet ? n("aux4", d?.aux4) : up.has(4) ? DEFAULT_SEND : 0,
      };
    })(),
    aux34_path: d?.aux34_path === "monitor" ? "monitor" : "channel",
    cue: n("cue", d?.cue),
    pan: n("pan", d?.pan),
    fader: n("fader", d?.fader),
    pfl: !!d?.pfl,
    mute: !!d?.mute,
  };
};
const empty = emptyRecall;

export function ConsoleBoard({ view, editable = false }: { view: ConsoleView; editable?: boolean }) {
  const { t, p } = useI18n();
  const router = useRouter();
  const initial = useMemo(() => view.strips.map(toEditable), [view]);
  const [channels, setChannels] = useState(view.channels || 16);
  const [strips, setStrips] = useState(initial);
  const [selected, setSelected] = useState<number | null>(null);
  const [table, setTable] = useState(false);
  const [state, run, pending] = useActionState(saveChannelStrips, {});
  const [shown, setShown] = useState(initial);
  if (shown !== initial) {
    setShown(initial);
    setStrips(initial);
    setChannels(view.channels || 16);
  }
  useEffect(() => {
    if (state.ok) router.refresh();
  }, [state, router]);

  const byNumber = new Map(strips.map((s) => [s.number, s]));
  const get = (n: number) => byNumber.get(n) ?? empty(n);
  const set = (n: number, patch: Partial<Editable>) =>
    setStrips((ss) => (ss.some((s) => s.number === n) ? ss.map((s) => (s.number === n ? { ...s, ...patch } : s)) : [...ss, { ...empty(n), ...patch }]));
  const views = new Map(view.strips.map((s) => [s.number, s]));
  const dirty = channels !== (view.channels || 16) || JSON.stringify(normalize(strips)) !== JSON.stringify(normalize(initial));
  const list = Array.from({ length: channels }, (_, i) => i + 1);
  // What the control room is hearing instead of the mix.
  const pflUp = strips.filter((s) => s.pfl && s.number <= channels).map((s) => s.number).sort((a, b) => a - b);

  const save = () => {
    const data = new FormData();
    data.set("id", String(view.id));
    data.set("channels", String(channels));
    data.set("strips", JSON.stringify(normalize(strips).filter((s) => s.number <= channels)));
    startTransition(() => run(data));
  };

  const groupNote =
    view.groupsOnTrackOuts && view.groups ? t("console.groupNote", { a: view.groups, b: view.groups * 2 }) : null;

  return (
    <div>
      <div className="overflow-x-auto rounded-lg border border-line bg-[#141517] p-3">
        <div className="flex gap-[3px]" style={{ minWidth: list.length * 74 }}>
          {list.map((n) => (
            <Strip key={n} n={n} value={get(n)} view={views.get(n)} active={selected === n} onClick={editable ? () => setSelected((s) => (s === n ? null : n)) : undefined} />
          ))}
        </div>
        {view.strips.some((s) => s.loop) ? <p className="mt-3 text-xs text-bad">{t("console.loopNote")}</p> : null}
        {pflUp.length ? <p className="mt-3 text-xs text-info">{p("console.pfl.active", pflUp.length, { list: pflUp.join(", ") })}</p> : null}
      </div>

      {editable ? (
        <>
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => setTable(false)} className={`rounded-md border px-3 py-1.5 text-sm ${!table ? "border-amber text-amber" : "border-line-strong text-dim hover:text-ink"}`}>
              {t("console.tab.one")}
            </button>
            <button type="button" onClick={() => setTable(true)} className={`rounded-md border px-3 py-1.5 text-sm ${table ? "border-amber text-amber" : "border-line-strong text-dim hover:text-ink"}`}>
              {t("console.tab.all")}
            </button>
            {groupNote ? (
              <span className="ml-auto text-xs text-faint">
                {groupNote}{" "}
                <Link href="/guide#console" className="text-dim hover:text-amber">
                  {t("console.why")}
                </Link>
              </span>
            ) : null}
          </div>
          <div className="mt-4">
            {table ? (
              <TableEditor channels={channels} setChannels={setChannels} list={list} get={get} set={set} views={views} setStrips={setStrips} groups={view.groups} auxes={view.auxes} />
            ) : selected && selected <= channels ? (
              <StripEditor
                n={selected}
                total={channels}
                value={get(selected)}
                view={views.get(selected)}
                consoleId={view.id}
                groups={view.groups}
                auxes={view.auxes}
                inline={view.groupsOnTrackOuts}
                onChange={(p) => set(selected, p)}
                onMove={setSelected}
              />
            ) : (
              <p className="rounded-md border border-dashed border-line-strong px-4 py-6 text-center text-sm text-dim">
                {t("console.pickChannel")}
              </p>
            )}
          </div>
          <div className={`sticky bottom-0 z-10 mt-6 flex flex-wrap items-center gap-3 border-t border-line bg-bg/95 py-3 backdrop-blur ${dirty || state.error ? "" : "hidden"}`}>
            <button type="button" onClick={save} disabled={pending} className="rounded-md bg-amber px-4 py-2 text-sm font-medium text-amber-ink hover:brightness-110 disabled:opacity-60">
              {pending ? t("action.saving") : t("console.save")}
            </button>
            <button type="button" onClick={() => { setStrips(initial); setChannels(view.channels || 16); }} className="rounded-md border border-line-strong px-3 py-2 text-sm hover:bg-raised">
              {t("action.discard")}
            </button>
            {state.error ? <span className="text-sm text-bad">{state.error}</span> : <span className="text-sm text-dim">{t("state.unsaved")}</span>}
          </div>
        </>
      ) : null}

      <MasterSection view={view} />
    </div>
  );
}

function normalize(strips: Editable[]) {
  return [...strips]
    .map((s) => ({ ...s, label: s.label.trim(), route: s.route.trim(), note: s.note.trim() }))
    .filter((s) => !isNeutral(s))
    .sort((a, b) => a.number - b.number);
}

// ---- One strip ----

function endText(k: Socket | undefined) {
  const e = k?.ends[0];
  if (!e) return null;
  return { main: e.deviceName, sub: e.port, many: (k?.ends.length ?? 0) > 1 };
}

function Strip({ n, value, view, active, onClick }: { n: number; value: Editable; view?: StripView; active: boolean; onClick?: () => void }) {
  const { t } = useI18n();
  const sock = (role: Socket["role"]) => view?.sockets.find((s) => s.role === role);
  const ins = (["mic", "line", "tape"] as const).map((r) => ({ role: r, s: sock(r), end: endText(sock(r)) }));
  const insert = sock("insert");
  const out = sock("out");
  const tint = value.color || "";
  const source = value.source || ins.find((i) => i.end)?.role || "";
  const routeText = [
    value.direct ? t("console.legend.direct") : "",
    value.route.toUpperCase(),
    auxOpen(value).length ? t("console.legend.aux", { list: auxText(value) }) : "",
  ]
    .filter(Boolean)
    .join(" · ");
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      data-strip={n}
      className={`flex w-[71px] shrink-0 flex-col rounded-sm border text-left ${view?.loop ? "border-bad" : active ? "border-amber" : "border-line"} ${onClick ? "hover:border-line-strong" : "cursor-default"}`}
      style={{ background: tint ? `color-mix(in srgb, ${tint} 16%, #1b1c1f)` : "#1b1c1f" }}
    >
      {/* Scribble strip */}
      <div className="flex h-9 items-center justify-center border-b border-line px-1 text-center" style={{ background: tint ? `color-mix(in srgb, ${tint} 40%, #1b1c1f)` : "#24262a" }}>
        <span className={`line-clamp-2 text-[10.5px] font-semibold leading-tight ${value.label ? "text-ink" : "text-faint"}`}>{value.label || t("state.none")}</span>
      </div>
      {/* Inputs */}
      <div className="space-y-px p-1">
        {ins.map(({ role, s, end }) =>
          s ? (
            <div key={role} className={`rounded px-1 py-0.5 ${source === role ? "bg-amber/15" : ""}`} title={end ? `${s.port} ← ${end.main} · ${end.sub}` : t("console.socket.free", { port: s.port })}>
              <div className="flex items-center justify-between text-[8.5px] uppercase tracking-wider text-faint">
                <span>{roleShort(t, role)}</span>
                {source === role ? <span className="text-amber">●</span> : null}
              </div>
              <div className={`truncate text-[9.5px] leading-tight ${end ? (end.many ? "text-warn" : "text-ink") : "text-faint"}`}>{end ? end.main : t("state.free")}</div>
              {end ? <div className="truncate text-[8.5px] leading-tight text-dim">{end.sub}</div> : null}
            </div>
          ) : null,
        )}
      </div>
      {/* Insert */}
      {insert ? (
        <div className="border-t border-line px-2 py-1 text-[9px]" title={insert.ends.map((e) => `${e.cableCode}: ${e.deviceName} · ${e.port}`).join("\n") || t("console.insert.none")}>
          <span className="uppercase tracking-wider text-faint">{t("console.role.insertShort")} </span>
          <span className={insert.ends.length ? "text-info" : "text-faint"}>{insert.ends.length ? insert.ends[0]!.deviceName : t("state.none")}</span>
        </div>
      ) : null}
      {/* Fader area: routing, with the two lamps you look for across a desk */}
      <div className="flex min-h-14 flex-1 flex-col items-center justify-end gap-1 border-t border-line px-1 py-1.5">
        {value.pfl || value.mute ? (
          <span className="flex gap-1">
            {value.pfl ? (
              <span className="rounded-sm bg-info/20 px-1 text-[7.5px] font-bold uppercase tracking-wider text-info" title={t("console.recall.pfl.help")}>
                {t("console.pfl.badge")}
              </span>
            ) : null}
            {value.mute ? (
              <span className="rounded-sm bg-bad/20 px-1 text-[7.5px] font-bold uppercase tracking-wider text-bad" title={t("console.recall.mute.help")}>
                {t("console.recall.mute")}
              </span>
            ) : null}
          </span>
        ) : null}
        <span className={`line-clamp-2 text-center font-mono text-[8.5px] leading-tight ${value.mute ? "text-faint line-through" : "text-amber"}`}>
          {routeText || t("console.legend.mix")}
        </span>
        <span
          className="w-1.5 rounded-sm bg-line-strong"
          style={{ height: `${6 + Math.max(0, Math.min(1, (value.fader + 70) / 80)) * 18}px` }}
          aria-hidden
        />
      </div>
      {/* Out */}
      {out ? (
        <div className="border-t border-line px-1 py-1 text-[9px]" title={`${out.port} → ${endText(out)?.main ?? t("state.free")} ${endText(out)?.sub ?? ""}`}>
          <div className="uppercase tracking-wider text-faint">{roleShort(t, "out")}</div>
          <div className={`truncate leading-tight ${endText(out) ? "text-ink" : "text-faint"}`}>{endText(out)?.main ?? t("state.free")}</div>
        </div>
      ) : null}
      <div className="border-t border-line py-0.5 text-center font-mono text-[10px] text-dim">{n}</div>
    </button>
  );
}

// ---- Editing one strip ----

function SocketLine({ s, consoleId }: { s: Socket; consoleId: number }) {
  const { t } = useI18n();
  const href = s.direction === "out" ? `/cables/new?from=${encodeURIComponent(`${consoleId}::${s.port}`)}` : `/cables/new?to=${encodeURIComponent(`${consoleId}::${s.port}`)}`;
  return (
    <li className="flex flex-wrap items-baseline gap-x-2 text-xs">
      <span className="w-24 shrink-0 text-dim">{s.port.replace(/^Ch\s+\d+\s+/i, "")}</span>
      {s.ends.length ? (
        <span className={s.ends.length > 1 ? "text-warn" : ""}>
          {s.ends.map((e, i) => (
            <span key={e.cableId}>
              {i ? " + " : ""}
              <Link href={`/cables/${e.cableId}`} className="font-mono text-amber hover:underline">
                {e.cableCode}
              </Link>{" "}
              {e.deviceId ? (
                <Link href={`/assets/${e.deviceId}`} className="hover:text-amber">
                  {e.deviceName}
                </Link>
              ) : (
                e.deviceName
              )}{" "}
              · {e.port}
            </span>
          ))}
        </span>
      ) : (
        <Link href={href} className="text-faint hover:text-amber">
          {t("action.patchIt")}
        </Link>
      )}
    </li>
  );
}

function StripEditor({
  n,
  total,
  value,
  view,
  consoleId,
  groups,
  auxes,
  inline,
  onChange,
  onMove,
}: {
  n: number;
  total: number;
  value: Editable;
  view?: StripView;
  consoleId: number;
  groups: number;
  auxes: number;
  /** An in-line desk: groups leave by the channels' track outs, not their own sockets. */
  inline: boolean;
  onChange: (p: Partial<Editable>) => void;
  onMove: (n: number) => void;
}) {
  const { t } = useI18n();
  return (
    <div className="rounded-lg border border-line bg-panel p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold">
          {t("console.channel", { n })} {value.label ? <span className="text-dim">· {value.label}</span> : null}
        </h3>
        <div className="flex items-center gap-3">
          {value.pfl ? <span className="rounded border border-info/40 bg-info/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-info">{t("console.pfl.badge")}</span> : null}
          {value.mute ? <span className="rounded border border-bad/40 bg-bad/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-bad">{t("console.recall.mute")}</span> : null}
          <div className="flex gap-1">
            <button type="button" disabled={n <= 1} onClick={() => onMove(n - 1)} className="rounded border border-line-strong px-2 py-1 text-sm disabled:opacity-40" aria-label={t("console.previousChannel")}>←</button>
            <button type="button" disabled={n >= total} onClick={() => onMove(n + 1)} className="rounded border border-line-strong px-2 py-1 text-sm disabled:opacity-40" aria-label={t("console.nextChannel")}>→</button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-5">
        {/* The channel, as it stands on the desk. */}
        <div>
          <ConsoleStrip value={value} onChange={onChange} groups={groups} auxes={auxes} />
          <div className="mt-3 w-[154px]">
            <span className="mb-1 block text-xs font-medium text-dim">{t("console.field.color")}</span>
            <div className="flex flex-wrap items-center gap-1.5">
              <button type="button" onClick={() => onChange({ color: "" })} className={`h-6 rounded border px-2 text-xs ${value.color === "" ? "border-amber text-amber" : "border-line-strong text-dim"}`}>
                {t("state.none")}
              </button>
              {SWATCHES.map((c) => (
                <button key={c} type="button" onClick={() => onChange({ color: c })} className={`size-5 rounded border-2 ${value.color === c ? "border-white" : "border-transparent"}`} style={{ background: c }} aria-label={t("console.aria.color", { n })} />
              ))}
            </div>
            <label className="mt-3 block">
              <span className="mb-1 block text-xs font-medium text-dim">{t("console.field.note")}</span>
              <input className="control" value={value.note} onChange={(e) => onChange({ note: e.target.value })} />
            </label>
          </div>
        </div>

        {/* Where that puts the signal, and what is plugged into the channel. */}
        <div className="min-w-[320px] flex-1 space-y-4">
          <div>
            <span className="mb-1.5 block text-xs font-medium text-dim">{t("console.schema.title")}</span>
            <RoutingSchema value={value} view={view} inline={inline} />
          </div>
          <div>
            <span className="mb-1 block text-xs font-medium text-dim">{t("console.sockets", { n })}</span>
            {view?.sockets.length ? (
              <ul className="space-y-1.5">
                {view.sockets.map((k) => (
                  <SocketLine key={k.port} s={k} consoleId={consoleId} />
                ))}
              </ul>
            ) : (
              <p className="text-xs text-warn">{t("console.noPorts", { n })}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---- Every strip, with paste ----

function TableEditor({
  channels,
  setChannels,
  list,
  get,
  set,
  views,
  setStrips,
  groups,
  auxes,
}: {
  channels: number;
  setChannels: (n: number) => void;
  list: number[];
  get: (n: number) => Editable;
  set: (n: number, p: Partial<Editable>) => void;
  views: Map<number, StripView>;
  setStrips: React.Dispatch<React.SetStateAction<Editable[]>>;
  groups: number;
  auxes: number;
}) {
  const { t, p } = useI18n();
  const [field, setField] = useState<Field>("label");
  const [start, setStart] = useState(1);
  const [text, setText] = useState("");
  const [message, setMessage] = useState("");
  const fill = () => {
    const values = splitPasted(text);
    if (!values.length) return;
    setStrips((ss) => {
      const next = new Map(ss.map((s) => [s.number, { ...s }]));
      values.forEach((raw, i) => {
        const n = start + i;
        if (n > channels) return;
        const s = next.get(n) ?? empty(n);
        const v = /^(free|libre|\.|-|—)$/i.test(raw) ? "" : raw;
        if (field === "source") s.source = /mic/i.test(v) ? "mic" : /line|ligne/i.test(v) ? "line" : /tape|mon|magn/i.test(v) ? "tape" : "";
        else if (field === "color") s.color = /^#[0-9a-fA-F]{6}$/.test(v) ? v : "";
        else if (field === "route") {
          s.route = v.replace(/direct/i, "").trim();
          if (/direct/i.test(v)) s.direct = true;
        } else if (field === "aux") Object.assign(s, auxFromText(s, v));
        else s[field] = v;
        next.set(n, s);
      });
      return [...next.values()];
    });
    setMessage(p("console.paste.done", Math.min(values.length, channels - start + 1), { start }));
    setText("");
  };
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-line bg-panel p-4">
        <h3 className="mb-1 font-semibold">{t("console.paste.title")}</h3>
        <p className="mb-3 text-sm text-dim">{t("console.paste.hint")}</p>
        <div className="grid gap-3 md:grid-cols-[12rem_7rem_1fr_auto] md:items-end">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-dim">{t("console.paste.into")}</span>
            <select className="control" value={field} onChange={(e) => setField(e.target.value as Field)}>
              <option value="label">{t("console.paste.field.label")}</option>
              <option value="source">{t("console.paste.field.source")}</option>
              <option value="route">{t("console.paste.field.route")}</option>
              <option value="aux">{t("console.paste.field.aux")}</option>
              <option value="note">{t("console.paste.field.note")}</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-dim">{t("console.paste.from")}</span>
            <input className="control" type="number" min={1} max={channels} value={start} onChange={(e) => setStart(Math.max(1, Math.min(channels, Number(e.target.value) || 1)))} />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-dim">{t("console.paste.cells")}</span>
            <textarea className="control font-mono text-xs" rows={2} value={text} onChange={(e) => setText(e.target.value)} placeholder={t("console.paste.placeholder")} />
          </label>
          <button type="button" onClick={fill} className="rounded-md border border-line-strong px-3 py-2 text-sm hover:bg-raised">{t("console.paste.fill")}</button>
        </div>
        {message ? <p className="mt-2 text-sm text-ok">{message}</p> : null}
      </div>
      <div className="flex items-center gap-3 text-sm">
        <label className="flex items-center gap-2">
          <span className="text-dim">{t("console.channels")}</span>
          <input className="control w-20" type="number" min={1} max={128} value={channels} onChange={(e) => setChannels(Math.max(1, Math.min(128, Number(e.target.value) || 1)))} />
        </label>
        <span className="text-xs text-faint">
          {p("console.shape.groups", groups)} · {p("console.shape.auxes", auxes)} {t("console.shape.fromPorts")}
        </span>
      </div>
      <div className="overflow-x-auto rounded-lg border border-line bg-panel">
        <table className="data">
          <thead>
            <tr>
              <th>#</th>
              <th>{t("console.col.label")}</th>
              <th>{t("console.col.source")}</th>
              <th>{t("console.col.plugged")}</th>
              <th>{t("console.col.insert")}</th>
              <th>{t("console.col.direct")}</th>
              <th>{t("console.col.route")}</th>
              <th>{t("console.col.aux")}</th>
              <th>{t("console.col.out")}</th>
              <th>{t("console.col.color")}</th>
              <th>{t("console.col.note")}</th>
            </tr>
          </thead>
          <tbody>
            {list.map((n) => {
              const v = get(n);
              const w = views.get(n);
              const src = (["mic", "line", "tape"] as const).map((r) => ({ r, end: endText(w?.sockets.find((s) => s.role === r)) })).filter((x) => x.end);
              const ins = endText(w?.sockets.find((s) => s.role === "insert"));
              const out = endText(w?.sockets.find((s) => s.role === "out"));
              return (
                <tr key={n}>
                  <td className="font-mono text-xs text-dim">{n}</td>
                  <td className="min-w-32"><input className="control" value={v.label} onChange={(e) => set(n, { label: e.target.value })} aria-label={t("console.aria.label", { n })} /></td>
                  <td>
                    <select className="control w-20" value={v.source} onChange={(e) => set(n, { source: e.target.value as Editable["source"] })} aria-label={t("console.aria.source", { n })}>
                      {SOURCES.map((s) => <option key={s || "none"} value={s}>{sourceLabel(t, s)}</option>)}
                    </select>
                  </td>
                  <td className="text-xs text-dim">{src.length ? src.map((x) => `${roleLabel(t, x.r)}: ${x.end!.main} · ${x.end!.sub}`).join(" / ") : t("state.none")}</td>
                  <td className="text-xs text-dim">{ins ? ins.main : t("state.none")}</td>
                  <td className="text-center"><input type="checkbox" className="mt-2 size-4 accent-amber" checked={v.direct} onChange={(e) => set(n, { direct: e.target.checked })} aria-label={t("console.aria.direct", { n })} /></td>
                  <td className="min-w-24"><input className="control" value={v.route} onChange={(e) => set(n, { route: e.target.value })} placeholder="1-2, mix" aria-label={t("console.aria.route", { n })} /></td>
                  <td><input className="control w-16" value={auxText(v)} onChange={(e) => set(n, auxFromText(v, e.target.value))} placeholder="1,3" aria-label={t("console.aria.aux", { n })} /></td>
                  <td className="text-xs text-dim">{out ? `${out.main} · ${out.sub}` : t("state.none")}</td>
                  <td><input type="color" value={v.color || "#24262a"} onChange={(e) => set(n, { color: e.target.value })} className="h-8 w-10 cursor-pointer rounded border border-line-strong bg-transparent" aria-label={t("console.aria.color", { n })} /></td>
                  <td className="min-w-28"><input className="control" value={v.note} onChange={(e) => set(n, { note: e.target.value })} aria-label={t("console.aria.note", { n })} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---- Master section ----

function MasterSection({ view }: { view: ConsoleView }) {
  const { t } = useI18n();
  if (!view.sections.length) return null;
  return (
    <div className="mt-8">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-faint">{t("console.master")}</h2>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {view.sections.map((sec) => {
          const key = SECTION_KEYS[sec.title];
          return (
            <section key={sec.title} className="rounded-lg border border-line bg-panel">
              <h3 className="border-b border-line px-3 py-2 text-sm font-semibold">{key ? t(key) : sec.title}</h3>
              <ul className="divide-y divide-line/60 px-3 py-1">
                {sec.sockets.map((s) => {
                  const end = endText(s);
                  return (
                    <li key={s.port} className="flex items-baseline gap-2 py-1 text-xs">
                      <span className="w-32 shrink-0 text-dim">{s.port}</span>
                      {end ? (
                        <span className={s.ends.length > 1 ? "text-warn" : ""}>
                          {s.direction === "in" ? "← " : s.direction === "out" ? "→ " : "↔ "}
                          {s.ends[0]!.deviceId ? <Link href={`/assets/${s.ends[0]!.deviceId}`} className="hover:text-amber">{end.main}</Link> : end.main}
                          <span className="text-dim"> · {end.sub}</span>
                          {s.ends.length > 1 ? <span className="text-faint"> +{s.ends.length - 1}</span> : null}
                        </span>
                      ) : (
                        <Link href={s.direction === "in" ? `/cables/new?to=${encodeURIComponent(`${view.id}::${s.port}`)}` : `/cables/new?from=${encodeURIComponent(`${view.id}::${s.port}`)}`} className="text-faint hover:text-amber">
                          {t("state.free")}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
