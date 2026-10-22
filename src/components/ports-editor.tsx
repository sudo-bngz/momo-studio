"use client";

/**
 * The sockets of a device, edited as rows. The list travels to the Server
 * Action as JSON in a hidden `ports` field.
 */
import { useState } from "react";

import type { Port } from "@/gohead";
import { CONNECTORS, DIRECTIONS, SIGNALS, type Connector, type Direction, type Signal } from "@/lib/vocab";

interface Row {
  key: number;
  name: string;
  direction: Direction;
  signal: Signal;
  connector: Connector | "";
  balanced: boolean;
  note: string;
}

let nextKey = 1;
const row = (p: Partial<Row>): Row => ({
  key: nextKey++,
  name: "",
  direction: "out",
  signal: "audio",
  connector: "",
  balanced: false,
  note: "",
  ...p,
});

const PRESETS: Array<{ label: string; ports: Array<Partial<Row>> }> = [
  { label: "Mono out", ports: [{ name: "Out", direction: "out", signal: "audio", connector: "jack_ts" }] },
  {
    label: "Stereo out",
    ports: [
      { name: "Out L", direction: "out", signal: "audio", connector: "jack_ts" },
      { name: "Out R", direction: "out", signal: "audio", connector: "jack_ts" },
    ],
  },
  {
    label: "Stereo in",
    ports: [
      { name: "In L", direction: "in", signal: "audio", connector: "jack_ts" },
      { name: "In R", direction: "in", signal: "audio", connector: "jack_ts" },
    ],
  },
  {
    label: "MIDI in/out/thru",
    ports: [
      { name: "MIDI In", direction: "in", signal: "midi", connector: "din5" },
      { name: "MIDI Out", direction: "out", signal: "midi", connector: "din5" },
      { name: "MIDI Thru", direction: "out", signal: "midi", connector: "din5" },
    ],
  },
  { label: "USB", ports: [{ name: "USB", direction: "io", signal: "usb", connector: "usb_b" }] },
  { label: "Power", ports: [{ name: "Power", direction: "in", signal: "power", connector: "iec" }] },
];

export function PortsEditor({ initial }: { initial: Port[] }) {
  const [rows, setRows] = useState<Row[]>(() =>
    initial.map((p) =>
      row({
        name: p.name,
        direction: p.direction,
        signal: p.signal,
        connector: p.connector ?? "",
        balanced: !!p.balanced,
        note: p.note ?? "",
      }),
    ),
  );
  // A batch: "Line In" × 8 → Line In 1 … Line In 8.
  const [batch, setBatch] = useState({ name: "Line In", count: 8, direction: "in" as Direction, signal: "audio" as Signal, connector: "jack_trs" as Connector });

  const update = (key: number, patch: Partial<Row>) => setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  const remove = (key: number) => setRows((rs) => rs.filter((r) => r.key !== key));
  const move = (key: number, by: number) =>
    setRows((rs) => {
      const i = rs.findIndex((r) => r.key === key);
      const j = i + by;
      if (i < 0 || j < 0 || j >= rs.length) return rs;
      const copy = [...rs];
      [copy[i], copy[j]] = [copy[j]!, copy[i]!];
      return copy;
    });
  const add = (ports: Array<Partial<Row>>) => setRows((rs) => [...rs, ...ports.map(row)]);

  const json = JSON.stringify(
    rows.map(({ name, direction, signal, connector, balanced, note }) => ({ name, direction, signal, connector: connector || undefined, balanced, note })),
  );
  const names = rows.map((r) => r.name.trim()).filter(Boolean);
  const duplicates = new Set(names.filter((n, i) => names.indexOf(n) !== i));

  return (
    <div>
      <input type="hidden" name="ports" value={json} />
      {rows.length ? (
        <div className="overflow-x-auto">
          <table className="data">
            <thead>
              <tr>
                <th>Name</th>
                <th>Direction</th>
                <th>Signal</th>
                <th>Connector</th>
                <th>Bal.</th>
                <th>Note</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.key}>
                  <td className="min-w-40">
                    <input
                      className={`control ${duplicates.has(r.name.trim()) ? "border-bad" : ""}`}
                      value={r.name}
                      placeholder="Out L"
                      onChange={(e) => update(r.key, { name: e.target.value })}
                      aria-label={`Port ${i + 1} name`}
                    />
                  </td>
                  <td>
                    <select className="control" value={r.direction} onChange={(e) => update(r.key, { direction: e.target.value as Direction })} aria-label="Direction">
                      {Object.entries(DIRECTIONS).map(([v, l]) => (
                        <option key={v} value={v}>
                          {l}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <select className="control" value={r.signal} onChange={(e) => update(r.key, { signal: e.target.value as Signal })} aria-label="Signal">
                      {Object.entries(SIGNALS).map(([v, s]) => (
                        <option key={v} value={v}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <select className="control" value={r.connector} onChange={(e) => update(r.key, { connector: e.target.value as Connector | "" })} aria-label="Connector">
                      <option value="">—</option>
                      {Object.entries(CONNECTORS).map(([v, l]) => (
                        <option key={v} value={v}>
                          {l}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="text-center">
                    <input type="checkbox" className="mt-2 size-4 accent-amber" checked={r.balanced} onChange={(e) => update(r.key, { balanced: e.target.checked })} aria-label="Balanced" />
                  </td>
                  <td className="min-w-32">
                    <input className="control" value={r.note} onChange={(e) => update(r.key, { note: e.target.value })} aria-label="Note" />
                  </td>
                  <td className="whitespace-nowrap">
                    <button type="button" onClick={() => move(r.key, -1)} className="px-1.5 py-2 text-dim hover:text-ink" aria-label="Move up">
                      ↑
                    </button>
                    <button type="button" onClick={() => move(r.key, 1)} className="px-1.5 py-2 text-dim hover:text-ink" aria-label="Move down">
                      ↓
                    </button>
                    <button type="button" onClick={() => remove(r.key)} className="px-1.5 py-2 text-bad hover:brightness-125" aria-label="Remove port">
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-dim">No ports yet. Add the sockets you patch: they become the ends cables plug into.</p>
      )}
      {duplicates.size ? <p className="mt-2 text-sm text-bad">Port names must be unique: {[...duplicates].join(", ")}</p> : null}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => add([{}])} className="rounded-md border border-line-strong px-2.5 py-1 text-sm hover:bg-raised">
          + Port
        </button>
        {PRESETS.map((p) => (
          <button key={p.label} type="button" onClick={() => add(p.ports)} className="rounded-md border border-line px-2.5 py-1 text-xs text-dim hover:bg-raised hover:text-ink">
            + {p.label}
          </button>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-end gap-2 rounded-md border border-line bg-raised/50 p-3 text-sm">
        <span className="mr-1 self-center text-xs text-dim">Numbered batch</span>
        <input className="control w-32" value={batch.name} onChange={(e) => setBatch({ ...batch, name: e.target.value })} aria-label="Batch name" />
        <span className="self-center text-dim">×</span>
        <input
          className="control w-16"
          type="number"
          min={1}
          max={64}
          value={batch.count}
          onChange={(e) => setBatch({ ...batch, count: Math.max(1, Math.min(64, Number(e.target.value) || 1)) })}
          aria-label="How many"
        />
        <select className="control w-28" value={batch.direction} onChange={(e) => setBatch({ ...batch, direction: e.target.value as Direction })} aria-label="Batch direction">
          {Object.entries(DIRECTIONS).map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
        <select className="control w-32" value={batch.signal} onChange={(e) => setBatch({ ...batch, signal: e.target.value as Signal })} aria-label="Batch signal">
          {Object.entries(SIGNALS).map(([v, s]) => (
            <option key={v} value={v}>
              {s.label}
            </option>
          ))}
        </select>
        <select className="control w-36" value={batch.connector} onChange={(e) => setBatch({ ...batch, connector: e.target.value as Connector })} aria-label="Batch connector">
          {Object.entries(CONNECTORS).map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() =>
            add(
              Array.from({ length: batch.count }, (_, i) => ({
                name: `${batch.name.trim()} ${i + 1}`,
                direction: batch.direction,
                signal: batch.signal,
                connector: batch.connector,
                balanced: batch.connector === "jack_trs" || batch.connector === "xlr",
              })),
            )
          }
          className="rounded-md border border-line-strong px-2.5 py-1.5 hover:bg-raised"
        >
          Add {batch.count}
        </button>
      </div>
    </div>
  );
}
