"use client";

/**
 * The patch plan: devices as boxes laid out along the signal (sources on the
 * left), inputs on their left edge, outputs on their right edge, and every
 * connected cable as a line coloured by signal. Hover a box or a line to
 * follow it; filter by signal, or focus on one device and its neighbours.
 */
import Link from "next/link";
import { useMemo, useRef, useState } from "react";

import { useI18n } from "@/lib/i18n/client";
import { layoutPlan, type PlanCable, type PlanDevice } from "@/lib/patch";
import { DEVICE_STATES, SIGNALS, deviceStateLabel, isKey, signalColor, signalLabel, type Signal } from "@/lib/vocab";

const DEFAULT_SIGNALS: Signal[] = ["audio", "midi", "cv", "gate", "clock", "digital_audio", "control"];

export function PlanDiagram({ devices, cables, focus: initialFocus }: { devices: PlanDevice[]; cables: PlanCable[]; focus?: number }) {
  const { t, d } = useI18n();
  const [signals, setSignals] = useState<Set<Signal>>(() => new Set(DEFAULT_SIGNALS));
  const [allPorts, setAllPorts] = useState(false);
  const [hideIdle, setHideIdle] = useState(true);
  const [focus, setFocus] = useState<number | undefined>(initialFocus);
  const [hoverCable, setHoverCable] = useState<number | null>(null);
  const [hoverDevice, setHoverDevice] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const counts = useMemo(() => {
    const m = new Map<Signal, number>();
    for (const c of cables) if (c.state === "connected") m.set(c.signal, (m.get(c.signal) ?? 0) + 1);
    return m;
  }, [cables]);

  const layout = useMemo(() => {
    let ds = devices;
    let cs = cables;
    if (focus !== undefined) {
      const keep = new Set([focus]);
      for (const c of cables) {
        if (c.state !== "connected" || !c.from || !c.to || !signals.has(c.signal)) continue;
        if (c.from.device === focus) keep.add(c.to.device);
        if (c.to.device === focus) keep.add(c.from.device);
      }
      ds = devices.filter((x) => keep.has(x.id));
      cs = cables.filter((c) => c.from && c.to && (c.from.device === focus || c.to.device === focus));
    }
    return layoutPlan(ds, cs, { signals, allPorts, hideIdle: focus === undefined ? hideIdle : false });
  }, [devices, cables, signals, allPorts, hideIdle, focus]);

  const lit = (cable: PlanCable) =>
    hoverCable === cable.id || (hoverDevice !== null && (cable.from?.device === hoverDevice || cable.to?.device === hoverDevice));
  const dimming = hoverCable !== null || hoverDevice !== null;
  const hovered = hoverCable !== null ? layout.edges.find((e) => e.cable.id === hoverCable) : undefined;
  const nameOf = (id: number | undefined) => devices.find((x) => x.id === id)?.name ?? "?";

  const toggle = (s: Signal) =>
    setSignals((prev) => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next;
    });

  const download = () => {
    const svg = svgRef.current;
    if (!svg) return;
    const clone = svg.cloneNode(true) as SVGSVGElement;
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    const style = document.createElementNS("http://www.w3.org/2000/svg", "style");
    style.textContent = "text{font-family:ui-sans-serif,system-ui,sans-serif}";
    clone.prepend(style);
    const blob = new Blob([new XMLSerializer().serializeToString(clone)], { type: "image/svg+xml" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "patch-plan.svg";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div>
      <div className="no-print mb-4 flex flex-wrap items-center gap-2">
        {(Object.keys(SIGNALS) as Signal[]).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => toggle(s)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs ${
              signals.has(s) ? "border-line-strong bg-raised text-ink" : "border-line text-faint"
            }`}
            aria-pressed={signals.has(s)}
          >
            <span className="size-2 rounded-full" style={{ background: signals.has(s) ? signalColor(s) : "transparent", outline: `1px solid ${signalColor(s)}` }} />
            {signalLabel(t, s)}
            <span className="text-faint">{counts.get(s) ?? 0}</span>
          </button>
        ))}
      </div>
      <div className="no-print mb-4 flex flex-wrap items-center gap-4 text-sm">
        <select
          className="control w-auto"
          value={focus ?? ""}
          onChange={(e) => setFocus(e.target.value ? Number(e.target.value) : undefined)}
          aria-label={t("cables.plan.focus")}
        >
          <option value="">{t("cables.plan.whole")}</option>
          {devices.map((dev) => (
            <option key={dev.id} value={dev.id}>
              {t("cables.plan.around", { code: dev.code, name: dev.name })}
            </option>
          ))}
        </select>
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" className="size-4 accent-amber" checked={allPorts} onChange={(e) => setAllPorts(e.target.checked)} />
          {t("cables.plan.freePorts")}
        </label>
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" className="size-4 accent-amber" checked={!hideIdle} onChange={(e) => setHideIdle(!e.target.checked)} disabled={focus !== undefined} />
          {t("cables.plan.unpatched")}
        </label>
        <button type="button" onClick={download} className="ml-auto rounded-md border border-line-strong px-3 py-1.5 hover:bg-raised">
          {t("cables.plan.download")}
        </button>
      </div>

      <div className="relative overflow-auto rounded-lg border border-line bg-panel">
        {layout.nodes.length === 0 ? (
          <p className="p-8 text-center text-sm text-dim">{t("cables.plan.empty")}</p>
        ) : (
          <svg ref={svgRef} width={layout.width} height={layout.height} viewBox={`0 0 ${layout.width} ${layout.height}`} className="block" onMouseLeave={() => { setHoverCable(null); setHoverDevice(null); }}>
            <rect width={layout.width} height={layout.height} fill="#18191c" />
            {/* Cables under the boxes */}
            <g fill="none">
              {layout.edges.map((e) => {
                const dx = Math.max(40, (e.x2 - e.x1) / 2);
                const back = e.x2 < e.x1 + 20; // a loop back to an earlier column
                const path = back
                  ? `M${e.x1},${e.y1} C${e.x1 + 80},${e.y1} ${e.x1 + 80},${Math.max(e.y1, e.y2) + 60} ${(e.x1 + e.x2) / 2},${Math.max(e.y1, e.y2) + 60} S${e.x2 - 80},${e.y2} ${e.x2},${e.y2}`
                  : `M${e.x1},${e.y1} C${e.x1 + dx},${e.y1} ${e.x2 - dx},${e.y2} ${e.x2},${e.y2}`;
                const on = lit(e.cable);
                return (
                  <g key={e.cable.id} onMouseEnter={() => setHoverCable(e.cable.id)} onMouseLeave={() => setHoverCable(null)} style={{ cursor: "pointer" }}>
                    <path d={path} stroke="transparent" strokeWidth={10} />
                    <path
                      d={path}
                      stroke={signalColor(e.cable.signal)}
                      strokeWidth={on ? 3 : 1.6}
                      strokeOpacity={dimming && !on ? 0.15 : 0.9}
                      strokeDasharray={e.cable.signal === "midi" || e.cable.signal === "usb" || e.cable.signal === "network" ? "5 3" : undefined}
                    />
                  </g>
                );
              })}
            </g>

            {layout.nodes.map((n) => {
              const faded = dimming && hoverDevice !== n.device.id && !layout.edges.some((e) => lit(e.cable) && (e.cable.from?.device === n.device.id || e.cable.to?.device === n.device.id));
              return (
                <g key={n.device.id} opacity={faded ? 0.45 : 1} onMouseEnter={() => setHoverDevice(n.device.id)} onMouseLeave={() => setHoverDevice(null)}>
                  <rect x={n.x} y={n.y} width={n.width} height={n.height} rx={7} fill="#202226" stroke={n.device.id === focus ? "#f2a541" : "#3a3e45"} />
                  <a href={`/assets/${n.device.id}`}>
                    <text x={n.x + 10} y={n.y + 17} fontSize={10} fill="#f2a541" fontFamily="ui-monospace, monospace">
                      {n.device.code}
                    </text>
                    <text x={n.x + 10} y={n.y + 31} fontSize={12.5} fontWeight={600} fill="#ecebe7">
                      {truncate(n.device.name, 26)}
                    </text>
                  </a>
                  {n.device.state !== "in_use" ? (
                    <text x={n.x + n.width - 8} y={n.y + 17} fontSize={9} textAnchor="end" fill="#fbbf24">
                      {isKey(DEVICE_STATES, n.device.state) ? deviceStateLabel(t, n.device.state) : n.device.state}
                    </text>
                  ) : null}
                  <line x1={n.x} x2={n.x + n.width} y1={n.y + 38} y2={n.y + 38} stroke="#2c2f34" />
                  {n.links.map((l) => (
                    <path
                      key={`n${l.column}-${l.y2}`}
                      d={`M${n.x + 62},${l.y1} C${n.x + n.width / 2},${l.y1} ${n.x + n.width / 2},${l.y2} ${n.x + n.width - 66},${l.y2}`}
                      stroke="#4ade80"
                      strokeOpacity={0.45}
                      strokeDasharray="2 3"
                      fill="none"
                    >
                      <title>{n.device.patch ? t("cables.plan.normalled", { column: l.column }) : t("cables.plan.insideDesk")}</title>
                    </path>
                  ))}
                  {n.inputs.map((p) => (
                    <g key={`i${p.port.name}`}>
                      <circle cx={n.x} cy={p.y} r={3.5} fill={signalColor(p.port.signal)} />
                      <text x={n.x + 9} y={p.y + 3.5} fontSize={10.5} fill="#9a9ca3">
                        {truncate(p.port.name, n.outputs.length ? 13 : 28)}
                      </text>
                    </g>
                  ))}
                  {n.outputs.map((p) => (
                    <g key={`o${p.port.name}`}>
                      <circle cx={n.x + n.width} cy={p.y} r={3.5} fill={signalColor(p.port.signal)} />
                      <text x={n.x + n.width - 9} y={p.y + 3.5} fontSize={10.5} fill="#9a9ca3" textAnchor="end">
                        {truncate(p.port.name, n.inputs.length ? 13 : 28)}
                      </text>
                    </g>
                  ))}
                </g>
              );
            })}
          </svg>
        )}
        {hovered ? (
          <div className="pointer-events-none absolute top-3 right-3 rounded-md border border-line-strong bg-bg/95 px-3 py-2 text-sm shadow-lg">
            <div className="font-mono text-amber">{hovered.cable.code}</div>
            <div>
              {nameOf(hovered.cable.from?.device)} · <span className="text-dim">{hovered.cable.from?.port}</span>
            </div>
            <div>
              → {nameOf(hovered.cable.to?.device)} · <span className="text-dim">{hovered.cable.to?.port}</span>
            </div>
            <div className="text-xs text-faint">
              {signalLabel(t, hovered.cable.signal)}
              {hovered.cable.length_m ? ` · ${d.metres(hovered.cable.length_m)}` : ""}
              {hovered.cable.color ? ` · ${hovered.cable.color}` : ""}
            </div>
          </div>
        ) : null}
      </div>
      <p className="no-print mt-3 text-xs text-faint">
        {t("cables.plan.legend")} {t("cables.plan.needList")}{" "}
        <Link href="/cables" className="underline">
          {t("cables.plan.listLink")}
        </Link>
        .
      </p>
    </div>
  );
}

function truncate(s: string, n: number) {
  return s.length > n ? `${s.slice(0, n - 1)}…` : s;
}
