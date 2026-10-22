"use client";

/**
 * A patchbay drawn like the hardware: the label of each top point, the two
 * rows of jacks with their front numbers, the normalling between them, and
 * the label of each bottom point. With `editable`, a click on a column opens
 * its editor; the table mode edits every column at once and takes rows
 * pasted from a spreadsheet. Changes are saved together.
 */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useActionState, useEffect, useMemo, useState } from "react";

import { createRearPorts, savePatchPoints } from "@/app/actions";
import { useI18n } from "@/lib/i18n/client";
import { parseMode, rearLabel, splitPasted, type ColumnView, type PatchbayView, type RearView } from "@/lib/patchbay";
import { directionLabel, patchModeLabel, signalColor, PATCH_MODES, type PatchMode } from "@/lib/vocab";

interface Editable {
  column: number;
  top_label: string;
  bottom_label: string;
  mode: PatchMode | "";
  daw_track: string;
  color: string;
  note: string;
}

const FIELDS = ["top_label", "bottom_label", "mode", "daw_track", "color", "note"] as const;
type Field = (typeof FIELDS)[number];

/** Group colors, close to the ones of a typical patchbay sheet. */
const SWATCHES = ["#e9c46a", "#f4a261", "#e76f51", "#d4a5c7", "#a78bfa", "#7aa7d9", "#5ec8d8", "#8fc79a", "#f0e68c", "#bdbdbd"];

const toEditable = (r: ColumnView): Editable => ({
  column: r.column,
  top_label: r.top.text,
  bottom_label: r.bottom.text,
  mode: r.mode ?? "",
  daw_track: r.daw_track,
  color: r.color,
  note: r.note,
});

const empty = (column: number): Editable => ({ column, top_label: "", bottom_label: "", mode: "", daw_track: "", color: "", note: "" });

export function PatchbayBoard({ view, editable = false }: { view: PatchbayView; editable?: boolean }) {
  const { t, p } = useI18n();
  const router = useRouter();
  const initial = useMemo(() => view.rows.map(toEditable), [view]);
  const [columns, setColumns] = useState(view.columns || 24);
  const [points, setPoints] = useState<Editable[]>(initial);
  const [selected, setSelected] = useState<number | null>(null);
  const [table, setTable] = useState(false);
  const [state, run, pending] = useActionState(savePatchPoints, {});
  const [portsState, runPorts, portsPending] = useActionState(createRearPorts, {});

  // After a save the server sends a new view: start from it again.
  const [shown, setShown] = useState(initial);
  if (shown !== initial) {
    setShown(initial);
    setPoints(initial);
    setColumns(view.columns || 24);
  }
  useEffect(() => {
    if (state.ok || portsState.ok) router.refresh();
  }, [state, portsState, router]);

  const byColumn = new Map(points.map((p) => [p.column, p]));
  const get = (n: number) => byColumn.get(n) ?? empty(n);
  const set = (n: number, patch: Partial<Editable>) =>
    setPoints((ps) => {
      const exists = ps.some((p) => p.column === n);
      return exists ? ps.map((p) => (p.column === n ? { ...p, ...patch } : p)) : [...ps, { ...empty(n), ...patch }];
    });
  const rowsByColumn = new Map(view.rows.map((r) => [r.column, r]));
  const dirty = columns !== (view.columns || 24) || JSON.stringify(normalize(points)) !== JSON.stringify(normalize(initial));

  const save = () => {
    const data = new FormData();
    data.set("id", String(view.id));
    data.set("columns", String(columns));
    data.set("points", JSON.stringify(normalize(points).filter((p) => p.column <= columns).map((p) => ({ ...p, mode: p.mode || undefined }))));
    startTransition(() => run(data));
  };

  const list = Array.from({ length: columns }, (_, i) => i + 1);

  return (
    <div>
      <Board
        view={view}
        columns={list}
        get={get}
        rows={rowsByColumn}
        selected={selected}
        onSelect={editable ? (n) => setSelected((s) => (s === n ? null : n)) : undefined}
      />

      {editable ? (
        <>
          {view.missingPorts > 0 ? (
            <div className="mt-4 flex flex-wrap items-center gap-3 rounded-md border border-warn/40 bg-warn/10 px-4 py-3 text-sm text-warn">
              <span>{p("patchbay.missingPorts", view.missingPorts)}</span>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const data = new FormData(e.currentTarget);
                  startTransition(() => runPorts(data));
                }}
              >
                <input type="hidden" name="id" value={view.id} />
                <input type="hidden" name="columns" value={columns} />
                <button disabled={portsPending} className="rounded-md border border-warn/50 px-3 py-1 hover:bg-warn/10 disabled:opacity-60">
                  {portsPending ? t("patchbay.addingPorts") : t("patchbay.addPorts")}
                </button>
              </form>
              {portsState.error ? <span className="text-bad">{portsState.error}</span> : null}
            </div>
          ) : null}

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setTable(false)}
              className={`rounded-md border px-3 py-1.5 text-sm ${!table ? "border-amber text-amber" : "border-line-strong text-dim hover:text-ink"}`}
            >
              {t("patchbay.oneColumn")}
            </button>
            <button
              type="button"
              onClick={() => setTable(true)}
              className={`rounded-md border px-3 py-1.5 text-sm ${table ? "border-amber text-amber" : "border-line-strong text-dim hover:text-ink"}`}
            >
              {t("patchbay.allColumns")}
            </button>
          </div>

          <div className="mt-4">
            {table ? (
              <TableEditor columns={columns} setColumns={setColumns} list={list} get={get} set={set} rows={rowsByColumn} setPoints={setPoints} />
            ) : selected && selected <= columns ? (
              <ColumnEditor
                n={selected}
                total={columns}
                value={get(selected)}
                row={rowsByColumn.get(selected)}
                pbId={view.id}
                onChange={(patch) => set(selected, patch)}
                onMove={(n) => setSelected(n)}
              />
            ) : (
              <p className="rounded-md border border-dashed border-line-strong px-4 py-6 text-center text-sm text-dim">
                {t("patchbay.clickColumn")}
              </p>
            )}
          </div>

          <div
            className={`sticky bottom-0 z-10 mt-6 flex flex-wrap items-center gap-3 border-t border-line bg-bg/95 py-3 backdrop-blur ${dirty || state.error ? "" : "hidden"}`}
          >
            <button type="button" onClick={save} disabled={pending} className="rounded-md bg-amber px-4 py-2 text-sm font-medium text-amber-ink hover:brightness-110 disabled:opacity-60">
              {pending ? t("action.saving") : t("patchbay.save")}
            </button>
            <button
              type="button"
              onClick={() => {
                setPoints(initial);
                setColumns(view.columns || 24);
              }}
              className="rounded-md border border-line-strong px-3 py-2 text-sm hover:bg-raised"
            >
              {t("action.discard")}
            </button>
            {state.error ? <span className="text-sm text-bad">{state.error}</span> : <span className="text-sm text-dim">{t("state.unsaved")}</span>}
          </div>
        </>
      ) : null}
    </div>
  );
}

function normalize(points: Editable[]) {
  return [...points]
    .filter((p) => FIELDS.some((f) => p[f] !== ""))
    .sort((a, b) => a.column - b.column)
    .map((p) => Object.fromEntries(Object.entries(p).map(([k, v]) => [k, typeof v === "string" ? v.trim() : v])) as unknown as Editable);
}

// ---- The hardware view ----

function Board({
  view,
  columns,
  get,
  rows,
  selected,
  onSelect,
}: {
  view: PatchbayView;
  columns: number[];
  get: (n: number) => Editable;
  rows: Map<number, ColumnView>;
  selected: number | null;
  onSelect?: (n: number) => void;
}) {
  const { t } = useI18n();
  const total = columns.length;
  const hasDaw = columns.some((n) => get(n).daw_track);
  return (
    <div className="overflow-x-auto rounded-lg border border-line bg-[#141517] p-3">
      <div className="grid gap-x-[3px]" style={{ gridTemplateColumns: `64px repeat(${total}, minmax(38px, 1fr))`, minWidth: 64 + total * 41 }}>
        {hasDaw ? (
          <>
            <Legend>DAW</Legend>
            {columns.map((n) => (
              <div
                key={`d${n}`}
                className="truncate py-1 text-center font-mono text-[10px] text-[#d4a5c7]"
                title={get(n).daw_track ? t("patchbay.board.dawTrack", { track: get(n).daw_track }) : undefined}
              >
                {get(n).daw_track}
              </div>
            ))}
          </>
        ) : null}

        <Legend>{t("patchbay.board.top")}</Legend>
        {columns.map((n) => (
          <Label key={`t${n}`} rear={rows.get(n)?.top} text={get(n).top_label} color={get(n).color} active={selected === n} onClick={onSelect && (() => onSelect(n))} />
        ))}

        <Legend>1–{total}</Legend>
        {columns.map((n) => (
          <Jack key={`jt${n}`} number={n} row={rows.get(n)} active={selected === n} onClick={onSelect && (() => onSelect(n))} />
        ))}

        <Legend>{t("patchbay.board.mode")}</Legend>
        {columns.map((n) => (
          <Normal key={`m${n}`} mode={get(n).mode || undefined} flow={rows.get(n)?.flow} onClick={onSelect && (() => onSelect(n))} />
        ))}

        <Legend>
          {total + 1}–{total * 2}
        </Legend>
        {columns.map((n) => (
          <Jack key={`jb${n}`} number={n + total} row={rows.get(n)} active={selected === n} onClick={onSelect && (() => onSelect(n))} />
        ))}

        <Legend>{t("patchbay.board.bottom")}</Legend>
        {columns.map((n) => (
          <Label key={`b${n}`} rear={rows.get(n)?.bottom} text={get(n).bottom_label} color={get(n).color} active={selected === n} onClick={onSelect && (() => onSelect(n))} />
        ))}
      </div>
      {view.rows.some((r) => r.loop) ? (
        <p className="mt-3 text-xs text-bad">{t("patchbay.board.loopNote")}</p>
      ) : null}
    </div>
  );
}

function Legend({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center justify-end pr-2 text-right text-[10px] uppercase tracking-wider text-faint">{children}</div>;
}

function Label({ rear, text, color, active, onClick }: { rear?: RearView; text: string; color: string; active: boolean; onClick?: () => void }) {
  const { t, p } = useI18n();
  const l = rear ? rearLabel({ ...rear, text }) : text ? { main: text, free: false } : { main: text, free: true };
  // rearLabel() answers in English ("FREE"); a free point says it in the reader's language.
  const main = l.free ? t("state.free").toUpperCase() : l.main;
  const end = rear?.ends[0];
  const tint = color || (end ? signalColor(end.signal) : "");
  const title = [
    end ? `${end.cableCode}: ${end.deviceName} · ${end.port}` : null,
    text && end && text !== end.deviceName ? t("patchbay.board.labelTitle", { text }) : null,
    rear && rear.ends.length > 1 ? p("patchbay.board.cablesOnPoint", rear.ends.length) : null,
  ]
    .filter(Boolean)
    .join("\n");
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      title={title || undefined}
      className={`flex h-44 items-center justify-center overflow-hidden rounded-sm border px-0.5 py-1 text-left ${active ? "border-amber" : "border-transparent"} ${onClick ? "cursor-pointer hover:border-line-strong" : "cursor-default"}`}
      style={{ background: l.free ? "#1b1c1f" : tint ? `color-mix(in srgb, ${tint} 30%, #1b1c1f)` : "#24262a" }}
    >
      <span className="flex max-h-full rotate-180 gap-0.5 [writing-mode:vertical-rl]">
        <span className={`truncate text-[10.5px] leading-none ${l.free ? "font-semibold tracking-widest text-faint" : "font-medium text-ink"}`}>{main}</span>
        {l.sub ? <span className="truncate text-[10px] leading-none text-dim">{l.sub}</span> : null}
      </span>
      {rear && rear.ends.length > 1 ? <span className="sr-only">{t("patchbay.board.severalCables")}</span> : null}
    </button>
  );
}

function Jack({ number, row, active, onClick }: { number: number; row?: ColumnView; active: boolean; onClick?: () => void }) {
  const { t } = useI18n();
  const ring = row?.loop ? "#f87171" : active ? "#f2a541" : "#3a3e45";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className="flex flex-col items-center gap-0.5 py-1"
      aria-label={t("patchbay.board.point", { number })}
    >
      <span className="font-mono text-[10px] text-dim">{number}</span>
      <span className="grid size-5 place-items-center rounded-full border-2 bg-[#0c0d0e]" style={{ borderColor: ring }}>
        <span className="size-1.5 rounded-full bg-[#2c2f34]" />
      </span>
    </button>
  );
}

function Normal({ mode, flow, onClick }: { mode?: PatchMode; flow?: "down" | "up"; onClick?: () => void }) {
  const { t } = useI18n();
  const m = mode ? patchModeLabel(t, mode) : undefined;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className="relative flex h-9 items-center justify-center"
      title={m ? t("patchbay.board.modeTitle", { label: m.label, help: m.help }) : t("patchbay.board.modeNotSet")}
    >
      {m && mode !== "thru" ? (
        <span className="absolute inset-y-0 left-1/2 w-0 -translate-x-1/2 border-l-2" style={{ borderColor: m.color, borderStyle: mode === "half_normal" ? "dashed" : "solid" }} />
      ) : null}
      <span
        className="relative z-[1] rounded px-1 font-mono text-[10px] font-bold leading-4"
        style={m ? { background: `color-mix(in srgb, ${m.color} 25%, #141517)`, color: m.color } : { color: "#6b6e76" }}
      >
        {m ? m.short : "·"}
        {flow === "down" ? "↓" : flow === "up" ? "↑" : ""}
      </span>
    </button>
  );
}

// ---- Editing one column ----

function RearInfo({ rear, pbId, side }: { rear?: RearView; pbId: number; side: "top" | "bottom" }) {
  const { t } = useI18n();
  // The port's own name is data, in English on the hardware: cables point at it.
  const port = `${side === "top" ? "Top" : "Bottom"} ${rear?.port.split(" ")[1] ?? ""}`;
  if (!rear) return null;
  if (!rear.hasPort) return <p className="text-xs text-warn">{t("patchbay.editor.noPort", { port: rear.port })}</p>;
  if (!rear.ends.length) {
    // A cable comes into the top from a source, and leaves the bottom to a destination, usually.
    const href = side === "top" ? `/cables/new?to=${encodeURIComponent(`${pbId}::${port}`)}` : `/cables/new?from=${encodeURIComponent(`${pbId}::${port}`)}`;
    return (
      <p className="text-xs text-dim">
        {t("patchbay.editor.nothingBehind")}{" "}
        <Link href={href} className="text-amber hover:underline">
          {t("patchbay.editor.patchRear")}
        </Link>
      </p>
    );
  }
  return (
    <ul className="space-y-1 text-xs">
      {rear.ends.map((e) => (
        <li key={e.cableId} className={rear.ends.length > 1 ? "text-warn" : "text-dim"}>
          <Link href={`/cables/${e.cableId}`} className="font-mono text-amber hover:underline">
            {e.cableCode}
          </Link>{" "}
          ↔{" "}
          {e.deviceId ? (
            <Link href={`/assets/${e.deviceId}`} className="text-ink hover:text-amber">
              {e.deviceName}
            </Link>
          ) : (
            e.deviceName
          )}{" "}
          · {e.port}
          {e.direction ? <span className="text-faint"> ({directionLabel(t, e.direction)})</span> : null}
        </li>
      ))}
    </ul>
  );
}

function ColumnEditor({
  n,
  total,
  value,
  row,
  pbId,
  onChange,
  onMove,
}: {
  n: number;
  total: number;
  value: Editable;
  row?: ColumnView;
  pbId: number;
  onChange: (patch: Partial<Editable>) => void;
  onMove: (n: number) => void;
}) {
  const { t } = useI18n();
  return (
    <div className="rounded-lg border border-line bg-panel p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold">
          {t("patchbay.editor.column", { n })}{" "}
          <span className="text-sm font-normal text-dim">· {t("patchbay.editor.frontPoints", { a: n, b: n + total })}</span>
        </h3>
        <div className="flex gap-1">
          <button type="button" disabled={n <= 1} onClick={() => onMove(n - 1)} className="rounded border border-line-strong px-2 py-1 text-sm disabled:opacity-40">
            ←
          </button>
          <button type="button" disabled={n >= total} onClick={() => onMove(n + 1)} className="rounded border border-line-strong px-2 py-1 text-sm disabled:opacity-40">
            →
          </button>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-dim">{t("patchbay.editor.topLabel", { n })}</span>
            <input
              className="control"
              value={value.top_label}
              onChange={(e) => onChange({ top_label: e.target.value })}
              placeholder={row?.top.ends[0] ? t("patchbay.editor.namedByCable") : t("patchbay.editor.topPlaceholder")}
            />
          </label>
          <RearInfo rear={row?.top} pbId={pbId} side="top" />
        </div>
        <div className="space-y-2">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-dim">{t("patchbay.editor.bottomLabel", { n: n + total })}</span>
            <input
              className="control"
              value={value.bottom_label}
              onChange={(e) => onChange({ bottom_label: e.target.value })}
              placeholder={row?.bottom.ends[0] ? t("patchbay.editor.namedByCable") : t("patchbay.editor.bottomPlaceholder")}
            />
          </label>
          <RearInfo rear={row?.bottom} pbId={pbId} side="bottom" />
        </div>
      </div>
      <p className="mt-2 text-[11px] text-faint">{t("patchbay.editor.labelHint")}</p>

      <div className="mt-5 grid gap-6 md:grid-cols-[auto_1fr]">
        <div>
          <span className="mb-1 block text-xs font-medium text-dim">{t("patchbay.editor.mode")}</span>
          <div className="inline-flex overflow-hidden rounded-md border border-line-strong">
            {(["", "normal", "half_normal", "thru"] as const).map((m) => (
              <button
                key={m || "none"}
                type="button"
                onClick={() => onChange({ mode: m })}
                className={`px-3 py-1.5 text-sm ${value.mode === m ? "bg-raised text-amber" : "text-dim hover:text-ink"}`}
                title={m ? patchModeLabel(t, m).help : t("state.notSet")}
              >
                {m ? patchModeLabel(t, m).label : t("state.none")}
              </button>
            ))}
          </div>
          <p className="mt-1 max-w-sm text-[11px] text-faint">
            {value.mode ? patchModeLabel(t, value.mode).help : t("patchbay.editor.modeNotSetYet")}
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-[8rem_1fr]">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-dim">{t("patchbay.editor.dawTrack")}</span>
            <input
              className="control"
              value={value.daw_track}
              onChange={(e) => onChange({ daw_track: e.target.value })}
              placeholder={t("patchbay.editor.dawPlaceholder")}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-dim">{t("patchbay.editor.note")}</span>
            <input className="control" value={value.note} onChange={(e) => onChange({ note: e.target.value })} />
          </label>
        </div>
      </div>

      <div className="mt-5">
        <span className="mb-1 block text-xs font-medium text-dim">{t("patchbay.editor.color")}</span>
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => onChange({ color: "" })}
            className={`h-6 rounded border px-2 text-xs ${value.color === "" ? "border-amber text-amber" : "border-line-strong text-dim"}`}
          >
            {t("patchbay.editor.colorAuto")}
          </button>
          {SWATCHES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onChange({ color: c })}
              className={`size-6 rounded border-2 ${value.color === c ? "border-white" : "border-transparent"}`}
              style={{ background: c }}
              aria-label={t("patchbay.editor.colorSwatch", { color: c })}
            />
          ))}
          <input
            type="color"
            value={value.color || "#888888"}
            onChange={(e) => onChange({ color: e.target.value })}
            className="h-6 w-8 cursor-pointer rounded border border-line-strong bg-transparent"
            aria-label={t("patchbay.editor.colorCustom")}
          />
        </div>
        <p className="mt-1 text-[11px] text-faint">{t("patchbay.editor.colorHint")}</p>
      </div>
    </div>
  );
}

// ---- Editing every column, pasting from a spreadsheet ----

function TableEditor({
  columns,
  setColumns,
  list,
  get,
  set,
  rows,
  setPoints,
}: {
  columns: number;
  setColumns: (n: number) => void;
  list: number[];
  get: (n: number) => Editable;
  set: (n: number, patch: Partial<Editable>) => void;
  rows: Map<number, ColumnView>;
  setPoints: React.Dispatch<React.SetStateAction<Editable[]>>;
}) {
  const { t, p } = useI18n();
  const [field, setField] = useState<Field>("top_label");
  const [start, setStart] = useState(1);
  const [text, setText] = useState("");
  const [message, setMessage] = useState("");

  const fill = () => {
    const values = splitPasted(text);
    if (!values.length || (values.length === 1 && !values[0])) return;
    let skipped = 0;
    setPoints((ps) => {
      const next = new Map(ps.map((p) => [p.column, { ...p }]));
      values.forEach((raw, i) => {
        const n = start + i;
        if (n > columns) {
          skipped++;
          return;
        }
        const p = next.get(n) ?? empty(n);
        const v = /^(free|libre|\.|-|—)$/i.test(raw) ? "" : raw;
        if (field === "mode") p.mode = parseMode(v) ?? "";
        else if (field === "color") p.color = /^#[0-9a-fA-F]{6}$/.test(v) ? v : "";
        else p[field] = v;
        next.set(n, p);
      });
      return [...next.values()];
    });
    setMessage(
      [
        p("patchbay.paste.filled", Math.min(values.length, columns - start + 1), { start }),
        skipped ? p("patchbay.paste.skipped", skipped) : "",
        t("patchbay.paste.check"),
      ]
        .filter(Boolean)
        .join(" "),
    );
    setText("");
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-line bg-panel p-4">
        <h3 className="mb-1 font-semibold">{t("patchbay.paste.title")}</h3>
        <p className="mb-3 text-sm text-dim">{t("patchbay.paste.help")}</p>
        <div className="grid gap-3 md:grid-cols-[12rem_7rem_1fr_auto] md:items-end">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-dim">{t("patchbay.paste.into")}</span>
            <select className="control" value={field} onChange={(e) => setField(e.target.value as Field)}>
              <option value="top_label">{t("patchbay.paste.topLabels")}</option>
              <option value="bottom_label">{t("patchbay.paste.bottomLabels")}</option>
              <option value="mode">{t("patchbay.paste.modes")}</option>
              <option value="daw_track">{t("patchbay.paste.dawTracks")}</option>
              <option value="note">{t("patchbay.paste.notes")}</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-dim">{t("patchbay.paste.fromColumn")}</span>
            <input className="control" type="number" min={1} max={columns} value={start} onChange={(e) => setStart(Math.max(1, Math.min(columns, Number(e.target.value) || 1)))} />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-dim">{t("patchbay.paste.cells")}</span>
            <textarea className="control font-mono text-xs" rows={2} value={text} onChange={(e) => setText(e.target.value)} placeholder={"SPACE ECHO 1\tSPECULAR\tBIG MUFF\tFLANGER\t…"} />
          </label>
          <button type="button" onClick={fill} className="rounded-md border border-line-strong px-3 py-2 text-sm hover:bg-raised">
            {t("patchbay.paste.fill")}
          </button>
        </div>
        {message ? <p className="mt-2 text-sm text-ok">{message}</p> : null}
      </div>

      <div className="flex items-center gap-3 text-sm">
        <label className="flex items-center gap-2">
          <span className="text-dim">{t("patchbay.table.columns")}</span>
          <input className="control w-20" type="number" min={1} max={96} value={columns} onChange={(e) => setColumns(Math.max(1, Math.min(96, Number(e.target.value) || 1)))} />
        </label>
        <span className="text-xs text-faint">{t("patchbay.table.columnsHint")}</span>
        <span className="ml-auto flex items-center gap-1 text-xs text-dim">
          {t("patchbay.table.setEveryMode")}
          {(Object.keys(PATCH_MODES) as PatchMode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => list.forEach((n) => set(n, { mode: m }))}
              title={patchModeLabel(t, m).label}
              className="rounded border border-line-strong px-2 py-0.5 hover:bg-raised"
            >
              {patchModeLabel(t, m).short}
            </button>
          ))}
        </span>
      </div>

      <div className="overflow-x-auto rounded-lg border border-line bg-panel">
        <table className="data">
          <thead>
            <tr>
              <th>#</th>
              <th>{t("patchbay.table.head.topLabel")}</th>
              <th>{t("patchbay.table.head.behindTop")}</th>
              <th>{t("patchbay.table.head.mode")}</th>
              <th>{t("patchbay.table.head.bottomLabel")}</th>
              <th>{t("patchbay.table.head.behindBottom")}</th>
              <th>{t("patchbay.table.head.daw")}</th>
              <th>{t("patchbay.table.head.color")}</th>
              <th>{t("patchbay.table.head.note")}</th>
            </tr>
          </thead>
          <tbody>
            {list.map((n) => {
              const v = get(n);
              const r = rows.get(n);
              const behind = (rear?: RearView) =>
                rear?.ends.length ? (
                  <span className={rear.ends.length > 1 ? "text-warn" : "text-dim"}>
                    {rear.ends.map((e) => `${e.deviceName} · ${e.port}`).join(" + ")}
                  </span>
                ) : (
                  <span className="text-faint">{t("state.none")}</span>
                );
              return (
                <tr key={n}>
                  <td className="whitespace-nowrap font-mono text-xs text-dim">
                    {n}/{n + columns}
                  </td>
                  <td className="min-w-40">
                    <input
                      className="control"
                      value={v.top_label}
                      onChange={(e) => set(n, { top_label: e.target.value })}
                      aria-label={t("patchbay.table.aria.topLabel", { n })}
                    />
                  </td>
                  <td className="text-xs">{behind(r?.top)}</td>
                  <td>
                    <select
                      className="control w-24"
                      value={v.mode}
                      onChange={(e) => set(n, { mode: e.target.value as PatchMode | "" })}
                      aria-label={t("patchbay.table.aria.mode", { n })}
                    >
                      <option value="">{t("state.none")}</option>
                      {(Object.keys(PATCH_MODES) as PatchMode[]).map((m) => {
                        const mode = patchModeLabel(t, m);
                        return (
                          <option key={m} value={m}>
                            {mode.short} · {mode.label}
                          </option>
                        );
                      })}
                    </select>
                  </td>
                  <td className="min-w-40">
                    <input
                      className="control"
                      value={v.bottom_label}
                      onChange={(e) => set(n, { bottom_label: e.target.value })}
                      aria-label={t("patchbay.table.aria.bottomLabel", { n })}
                    />
                  </td>
                  <td className="text-xs">{behind(r?.bottom)}</td>
                  <td>
                    <input
                      className="control w-16"
                      value={v.daw_track}
                      onChange={(e) => set(n, { daw_track: e.target.value })}
                      aria-label={t("patchbay.table.aria.dawTrack", { n })}
                    />
                  </td>
                  <td>
                    <input
                      type="color"
                      value={v.color || "#24262a"}
                      onChange={(e) => set(n, { color: e.target.value })}
                      className="h-8 w-10 cursor-pointer rounded border border-line-strong bg-transparent"
                      aria-label={t("patchbay.table.aria.color", { n })}
                    />
                  </td>
                  <td className="min-w-32">
                    <input
                      className="control"
                      value={v.note}
                      onChange={(e) => set(n, { note: e.target.value })}
                      aria-label={t("patchbay.table.aria.note", { n })}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
