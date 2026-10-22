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
import { splitPasted } from "@/lib/patchbay";
import type { ConsoleView, Socket, StripView } from "@/lib/console";

interface Editable {
  number: number;
  label: string;
  source: "" | "mic" | "line" | "tape";
  route: string;
  direct: boolean;
  aux: string;
  color: string;
  note: string;
}

const FIELDS = ["label", "source", "route", "direct", "aux", "color", "note"] as const;
type Field = Exclude<(typeof FIELDS)[number], "direct">;
const SWATCHES = ["#e9c46a", "#f4a261", "#e76f51", "#d4a5c7", "#a78bfa", "#7aa7d9", "#5ec8d8", "#8fc79a", "#f0e68c", "#bdbdbd"];
const SOURCES: Record<Editable["source"], string> = { "": "—", mic: "Mic", line: "Line", tape: "Tape" };
const ROLE_LABEL = { mic: "Mic", line: "Line", tape: "Tape", insert: "Insert", out: "Out", other: "" } as const;

const toEditable = (s: StripView): Editable => ({
  number: s.number,
  label: s.label,
  source: s.source ?? "",
  route: s.route,
  direct: s.direct,
  aux: s.aux.join(","),
  color: s.color,
  note: s.note,
});
const empty = (n: number): Editable => ({ number: n, label: "", source: "", route: "", direct: false, aux: "", color: "", note: "" });

export function ConsoleBoard({ view, editable = false }: { view: ConsoleView; editable?: boolean }) {
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

  const save = () => {
    const data = new FormData();
    data.set("id", String(view.id));
    data.set("channels", String(channels));
    data.set("strips", JSON.stringify(normalize(strips).filter((s) => s.number <= channels)));
    startTransition(() => run(data));
  };

  const groupNote = view.groupsOnTrackOuts && view.groups ? `Groups come out of the track outs of channels g, g+${view.groups}, g+${view.groups * 2}…` : null;

  return (
    <div>
      <div className="overflow-x-auto rounded-lg border border-line bg-[#141517] p-3">
        <div className="flex gap-[3px]" style={{ minWidth: list.length * 74 }}>
          {list.map((n) => (
            <Strip key={n} n={n} value={get(n)} view={views.get(n)} active={selected === n} onClick={editable ? () => setSelected((s) => (s === n ? null : n)) : undefined} />
          ))}
        </div>
        {view.strips.some((s) => s.loop) ? <p className="mt-3 text-xs text-bad">Red strips are part of an aux feedback loop: see the warnings above.</p> : null}
      </div>

      {editable ? (
        <>
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => setTable(false)} className={`rounded-md border px-3 py-1.5 text-sm ${!table ? "border-amber text-amber" : "border-line-strong text-dim hover:text-ink"}`}>
              One channel
            </button>
            <button type="button" onClick={() => setTable(true)} className={`rounded-md border px-3 py-1.5 text-sm ${table ? "border-amber text-amber" : "border-line-strong text-dim hover:text-ink"}`}>
              All channels · paste from a sheet
            </button>
            {groupNote ? <span className="ml-auto text-xs text-faint">{groupNote}</span> : null}
          </div>
          <div className="mt-4">
            {table ? (
              <TableEditor channels={channels} setChannels={setChannels} list={list} get={get} set={set} views={views} setStrips={setStrips} groups={view.groups} auxes={view.auxes} />
            ) : selected && selected <= channels ? (
              <StripEditor n={selected} total={channels} value={get(selected)} view={views.get(selected)} consoleId={view.id} groups={view.groups} auxes={view.auxes} onChange={(p) => set(selected, p)} onMove={setSelected} />
            ) : (
              <p className="rounded-md border border-dashed border-line-strong px-4 py-6 text-center text-sm text-dim">
                Click a channel to name it, choose its source, route it and see what&apos;s plugged into it.
              </p>
            )}
          </div>
          <div className={`sticky bottom-0 z-10 mt-6 flex flex-wrap items-center gap-3 border-t border-line bg-bg/95 py-3 backdrop-blur ${dirty || state.error ? "" : "hidden"}`}>
            <button type="button" onClick={save} disabled={pending} className="rounded-md bg-amber px-4 py-2 text-sm font-medium text-amber-ink hover:brightness-110 disabled:opacity-60">
              {pending ? "Saving…" : "Save console"}
            </button>
            <button type="button" onClick={() => { setStrips(initial); setChannels(view.channels || 16); }} className="rounded-md border border-line-strong px-3 py-2 text-sm hover:bg-raised">
              Discard changes
            </button>
            {state.error ? <span className="text-sm text-bad">{state.error}</span> : <span className="text-sm text-dim">Unsaved changes</span>}
          </div>
        </>
      ) : null}

      <MasterSection view={view} />
    </div>
  );
}

function normalize(strips: Editable[]) {
  return [...strips]
    .filter((s) => FIELDS.some((f) => (f === "direct" ? s.direct : s[f] !== "")))
    .sort((a, b) => a.number - b.number)
    .map((s) => ({ ...s, label: s.label.trim(), route: s.route.trim(), aux: s.aux.trim(), note: s.note.trim() }));
}

// ---- One strip ----

function endText(k: Socket | undefined) {
  const e = k?.ends[0];
  if (!e) return null;
  return { main: e.deviceName, sub: e.port, many: (k?.ends.length ?? 0) > 1 };
}

function Strip({ n, value, view, active, onClick }: { n: number; value: Editable; view?: StripView; active: boolean; onClick?: () => void }) {
  const sock = (role: Socket["role"]) => view?.sockets.find((s) => s.role === role);
  const ins = (["mic", "line", "tape"] as const).map((r) => ({ role: r, s: sock(r), t: endText(sock(r)) }));
  const insert = sock("insert");
  const out = sock("out");
  const tint = value.color || "";
  const source = value.source || ins.find((i) => i.t)?.role || "";
  const routeText = [value.direct ? "DIRECT" : "", value.route.toUpperCase(), value.aux ? `AUX ${value.aux}` : ""].filter(Boolean).join(" · ");
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`flex w-[71px] shrink-0 flex-col rounded-sm border text-left ${view?.loop ? "border-bad" : active ? "border-amber" : "border-line"} ${onClick ? "hover:border-line-strong" : "cursor-default"}`}
      style={{ background: tint ? `color-mix(in srgb, ${tint} 16%, #1b1c1f)` : "#1b1c1f" }}
    >
      {/* Scribble strip */}
      <div className="flex h-9 items-center justify-center border-b border-line px-1 text-center" style={{ background: tint ? `color-mix(in srgb, ${tint} 40%, #1b1c1f)` : "#24262a" }}>
        <span className={`line-clamp-2 text-[10.5px] font-semibold leading-tight ${value.label ? "text-ink" : "text-faint"}`}>{value.label || "—"}</span>
      </div>
      {/* Inputs */}
      <div className="space-y-px p-1">
        {ins.map(({ role, s, t }) =>
          s ? (
            <div key={role} className={`rounded px-1 py-0.5 ${source === role ? "bg-amber/15" : ""}`} title={t ? `${s.port} ← ${t.main} · ${t.sub}` : `${s.port}: free`}>
              <div className="flex items-center justify-between text-[8.5px] uppercase tracking-wider text-faint">
                <span>{ROLE_LABEL[role]}</span>
                {source === role ? <span className="text-amber">●</span> : null}
              </div>
              <div className={`truncate text-[9.5px] leading-tight ${t ? (t.many ? "text-warn" : "text-ink") : "text-faint"}`}>{t ? t.main : "free"}</div>
              {t ? <div className="truncate text-[8.5px] leading-tight text-dim">{t.sub}</div> : null}
            </div>
          ) : null,
        )}
      </div>
      {/* Insert */}
      {insert ? (
        <div className="border-t border-line px-2 py-1 text-[9px]" title={insert.ends.map((e) => `${e.cableCode}: ${e.deviceName} · ${e.port}`).join("\n") || "Insert: nothing"}>
          <span className="uppercase tracking-wider text-faint">Ins </span>
          <span className={insert.ends.length ? "text-info" : "text-faint"}>{insert.ends.length ? insert.ends[0]!.deviceName : "—"}</span>
        </div>
      ) : null}
      {/* Fader area: routing */}
      <div className="flex min-h-14 flex-1 flex-col items-center justify-end gap-1 border-t border-line px-1 py-1.5">
        <span className="line-clamp-2 text-center font-mono text-[8.5px] leading-tight text-amber">{routeText || "→ MIX"}</span>
        <span className="h-6 w-1.5 rounded-sm bg-line-strong" aria-hidden />
      </div>
      {/* Out */}
      {out ? (
        <div className="border-t border-line px-1 py-1 text-[9px]" title={`${out.port} → ${endText(out)?.main ?? "free"} ${endText(out)?.sub ?? ""}`}>
          <div className="uppercase tracking-wider text-faint">{ROLE_LABEL.out}</div>
          <div className={`truncate leading-tight ${endText(out) ? "text-ink" : "text-faint"}`}>{endText(out)?.main ?? "free"}</div>
        </div>
      ) : null}
      <div className="border-t border-line py-0.5 text-center font-mono text-[10px] text-dim">{n}</div>
    </button>
  );
}

// ---- Editing one strip ----

function SocketLine({ s, consoleId }: { s: Socket; consoleId: number }) {
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
          free · patch it →
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
  onChange: (p: Partial<Editable>) => void;
  onMove: (n: number) => void;
}) {
  const groupPairs: string[] = [];
  for (let g = 1; g <= groups; g += 2) groupPairs.push(g + 1 <= groups ? `${g}-${g + 1}` : `${g}`);
  const auxList = Array.from({ length: auxes }, (_, i) => i + 1);
  const auxOn = new Set((value.aux.match(/\d+/g) ?? []).map(Number));
  return (
    <div className="rounded-lg border border-line bg-panel p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold">
          Channel {n} {value.label ? <span className="text-dim">· {value.label}</span> : null}
        </h3>
        <div className="flex gap-1">
          <button type="button" disabled={n <= 1} onClick={() => onMove(n - 1)} className="rounded border border-line-strong px-2 py-1 text-sm disabled:opacity-40">←</button>
          <button type="button" disabled={n >= total} onClick={() => onMove(n + 1)} className="rounded border border-line-strong px-2 py-1 text-sm disabled:opacity-40">→</button>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-dim">Label (scribble strip)</span>
            <input className="control" value={value.label} onChange={(e) => onChange({ label: e.target.value })} placeholder="Kick, Prophet, Vocal…" />
          </label>
          <div>
            <span className="mb-1 block text-xs font-medium text-dim">Source in use</span>
            <div className="inline-flex overflow-hidden rounded-md border border-line-strong">
              {(Object.keys(SOURCES) as Editable["source"][]).map((s) => (
                <button key={s || "none"} type="button" onClick={() => onChange({ source: s })} className={`px-3 py-1.5 text-sm ${value.source === s ? "bg-raised text-amber" : "text-dim hover:text-ink"}`}>
                  {SOURCES[s]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <span className="mb-1 block text-xs font-medium text-dim">Routing</span>
            <div className="flex flex-wrap gap-1.5">
              <label className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-sm ${value.direct ? "border-amber text-amber" : "border-line-strong text-dim"}`}>
                <input type="checkbox" className="accent-amber" checked={value.direct} onChange={(e) => onChange({ direct: e.target.checked })} />
                Direct out
              </label>
              <button type="button" onClick={() => onChange({ route: value.route.toLowerCase().includes("mix") ? value.route.replace(/\s*\+?\s*mix/i, "").trim() : [value.route, "mix"].filter(Boolean).join(" + ") })} className={`rounded-md border px-2.5 py-1 text-sm ${/mix/i.test(value.route) ? "border-amber text-amber" : "border-line-strong text-dim"}`}>
                Mix L/R
              </button>
              {groupPairs.map((g) => {
                const on = value.route.split(/[\s,+]+/).includes(g);
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => {
                      const parts = value.route.split(/[\s,+]+/).filter(Boolean);
                      onChange({ route: (on ? parts.filter((p) => p !== g) : [...parts, g]).join(" + ") });
                    }}
                    className={`rounded-md border px-2.5 py-1 text-sm ${on ? "border-amber text-amber" : "border-line-strong text-dim"}`}
                  >
                    Grp {g}
                  </button>
                );
              })}
            </div>
            <input className="control mt-2" value={value.route} onChange={(e) => onChange({ route: e.target.value })} placeholder="e.g. 1-2 + mix, or a note on the routing" />
          </div>
          {auxes ? (
            <div>
              <span className="mb-1 block text-xs font-medium text-dim">Aux sends up</span>
              <div className="flex flex-wrap gap-1.5">
                {auxList.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => {
                      const next = new Set(auxOn);
                      if (next.has(a)) next.delete(a);
                      else next.add(a);
                      onChange({ aux: [...next].sort((x, y) => x - y).join(",") });
                    }}
                    className={`rounded-md border px-2.5 py-1 text-sm ${auxOn.has(a) ? "border-amber text-amber" : "border-line-strong text-dim"}`}
                  >
                    Aux {a}
                  </button>
                ))}
              </div>
              <p className="mt-1 text-[11px] text-faint">Used to catch an aux coming back into a channel that feeds it.</p>
            </div>
          ) : null}
          <div>
            <span className="mb-1 block text-xs font-medium text-dim">Color</span>
            <div className="flex flex-wrap items-center gap-1.5">
              <button type="button" onClick={() => onChange({ color: "" })} className={`h-6 rounded border px-2 text-xs ${value.color === "" ? "border-amber text-amber" : "border-line-strong text-dim"}`}>None</button>
              {SWATCHES.map((c) => (
                <button key={c} type="button" onClick={() => onChange({ color: c })} className={`size-6 rounded border-2 ${value.color === c ? "border-white" : "border-transparent"}`} style={{ background: c }} aria-label={`Color ${c}`} />
              ))}
            </div>
          </div>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-dim">Note</span>
            <input className="control" value={value.note} onChange={(e) => onChange({ note: e.target.value })} />
          </label>
        </div>
        <div>
          <span className="mb-1 block text-xs font-medium text-dim">Sockets of channel {n}</span>
          {view?.sockets.length ? (
            <ul className="space-y-1.5">
              {view.sockets.map((s) => (
                <SocketLine key={s.port} s={s} consoleId={consoleId} />
              ))}
            </ul>
          ) : (
            <p className="text-xs text-warn">No “Ch {n} …” ports on this device: add them (or refill from a template) in Edit device.</p>
          )}
          {view?.outputs.length ? (
            <p className="mt-4 text-xs text-dim">
              With this routing the signal leaves by <span className="text-ink">{view.outputs.join(", ")}</span>.
            </p>
          ) : null}
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
        if (field === "source") s.source = /mic/i.test(v) ? "mic" : /line/i.test(v) ? "line" : /tape|mon/i.test(v) ? "tape" : "";
        else if (field === "color") s.color = /^#[0-9a-fA-F]{6}$/.test(v) ? v : "";
        else if (field === "route") {
          s.route = v.replace(/direct/i, "").trim();
          if (/direct/i.test(v)) s.direct = true;
        } else s[field] = v;
        next.set(n, s);
      });
      return [...next.values()];
    });
    setMessage(`${Math.min(values.length, channels - start + 1)} channel(s) filled from channel ${start}. Check, then save.`);
    setText("");
  };
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-line bg-panel p-4">
        <h3 className="mb-1 font-semibold">Paste from a sheet</h3>
        <p className="mb-3 text-sm text-dim">Copy a row of cells (channel names, routings like “1-2”, “mix”, “direct”, aux numbers…) and paste it here.</p>
        <div className="grid gap-3 md:grid-cols-[12rem_7rem_1fr_auto] md:items-end">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-dim">Into</span>
            <select className="control" value={field} onChange={(e) => setField(e.target.value as Field)}>
              <option value="label">Labels</option>
              <option value="source">Sources (mic / line / tape)</option>
              <option value="route">Routing</option>
              <option value="aux">Aux sends</option>
              <option value="note">Notes</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-dim">From channel</span>
            <input className="control" type="number" min={1} max={channels} value={start} onChange={(e) => setStart(Math.max(1, Math.min(channels, Number(e.target.value) || 1)))} />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-dim">Cells</span>
            <textarea className="control font-mono text-xs" rows={2} value={text} onChange={(e) => setText(e.target.value)} placeholder={"Kick\tSnare\tHats\tProphet L\t…"} />
          </label>
          <button type="button" onClick={fill} className="rounded-md border border-line-strong px-3 py-2 text-sm hover:bg-raised">Fill</button>
        </div>
        {message ? <p className="mt-2 text-sm text-ok">{message}</p> : null}
      </div>
      <div className="flex items-center gap-3 text-sm">
        <label className="flex items-center gap-2">
          <span className="text-dim">Channels</span>
          <input className="control w-20" type="number" min={1} max={128} value={channels} onChange={(e) => setChannels(Math.max(1, Math.min(128, Number(e.target.value) || 1)))} />
        </label>
        <span className="text-xs text-faint">{groups} groups · {auxes} auxes (from the ports)</span>
      </div>
      <div className="overflow-x-auto rounded-lg border border-line bg-panel">
        <table className="data">
          <thead>
            <tr>
              <th>#</th>
              <th>Label</th>
              <th>Source</th>
              <th>Plugged in</th>
              <th>Insert</th>
              <th>Direct</th>
              <th>Route</th>
              <th>Aux</th>
              <th>Out →</th>
              <th>Color</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
            {list.map((n) => {
              const v = get(n);
              const w = views.get(n);
              const src = (["mic", "line", "tape"] as const).map((r) => ({ r, t: endText(w?.sockets.find((s) => s.role === r)) })).filter((x) => x.t);
              const ins = endText(w?.sockets.find((s) => s.role === "insert"));
              const out = endText(w?.sockets.find((s) => s.role === "out"));
              return (
                <tr key={n}>
                  <td className="font-mono text-xs text-dim">{n}</td>
                  <td className="min-w-32"><input className="control" value={v.label} onChange={(e) => set(n, { label: e.target.value })} aria-label={`Label ${n}`} /></td>
                  <td>
                    <select className="control w-20" value={v.source} onChange={(e) => set(n, { source: e.target.value as Editable["source"] })} aria-label={`Source ${n}`}>
                      {(Object.keys(SOURCES) as Editable["source"][]).map((s) => <option key={s || "none"} value={s}>{SOURCES[s]}</option>)}
                    </select>
                  </td>
                  <td className="text-xs text-dim">{src.length ? src.map((x) => `${ROLE_LABEL[x.r]}: ${x.t!.main} · ${x.t!.sub}`).join(" / ") : "—"}</td>
                  <td className="text-xs text-dim">{ins ? ins.main : "—"}</td>
                  <td className="text-center"><input type="checkbox" className="mt-2 size-4 accent-amber" checked={v.direct} onChange={(e) => set(n, { direct: e.target.checked })} aria-label={`Direct ${n}`} /></td>
                  <td className="min-w-24"><input className="control" value={v.route} onChange={(e) => set(n, { route: e.target.value })} placeholder="1-2, mix" aria-label={`Route ${n}`} /></td>
                  <td><input className="control w-16" value={v.aux} onChange={(e) => set(n, { aux: e.target.value })} placeholder="1,3" aria-label={`Aux ${n}`} /></td>
                  <td className="text-xs text-dim">{out ? `${out.main} · ${out.sub}` : "—"}</td>
                  <td><input type="color" value={v.color || "#24262a"} onChange={(e) => set(n, { color: e.target.value })} className="h-8 w-10 cursor-pointer rounded border border-line-strong bg-transparent" aria-label={`Color ${n}`} /></td>
                  <td className="min-w-28"><input className="control" value={v.note} onChange={(e) => set(n, { note: e.target.value })} aria-label={`Note ${n}`} /></td>
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
  if (!view.sections.length) return null;
  return (
    <div className="mt-8">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-faint">Master section</h2>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {view.sections.map((sec) => (
          <section key={sec.title} className="rounded-lg border border-line bg-panel">
            <h3 className="border-b border-line px-3 py-2 text-sm font-semibold">{sec.title}</h3>
            <ul className="divide-y divide-line/60 px-3 py-1">
              {sec.sockets.map((s) => {
                const t = endText(s);
                return (
                  <li key={s.port} className="flex items-baseline gap-2 py-1 text-xs">
                    <span className="w-32 shrink-0 text-dim">{s.port}</span>
                    {t ? (
                      <span className={s.ends.length > 1 ? "text-warn" : ""}>
                        {s.direction === "in" ? "← " : s.direction === "out" ? "→ " : "↔ "}
                        {s.ends[0]!.deviceId ? <Link href={`/assets/${s.ends[0]!.deviceId}`} className="hover:text-amber">{t.main}</Link> : t.main}
                        <span className="text-dim"> · {t.sub}</span>
                        {s.ends.length > 1 ? <span className="text-faint"> +{s.ends.length - 1}</span> : null}
                      </span>
                    ) : (
                      <Link href={s.direction === "in" ? `/cables/new?to=${encodeURIComponent(`${view.id}::${s.port}`)}` : `/cables/new?from=${encodeURIComponent(`${view.id}::${s.port}`)}`} className="text-faint hover:text-amber">
                        free
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
