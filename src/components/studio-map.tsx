"use client";

/**
 * The studio map: rooms and places (racks, desks, stands, cases) drawn to
 * scale, and the cable bundles between places. Click a place to zoom into
 * it: a rack shows its units, a desk or stand its machines, with the cables
 * between them and stubs to the other places they reach. Scroll to zoom,
 * drag to pan, Esc to come back.
 *
 * In edit mode, drag places and rooms, resize them from their corner, turn
 * places a quarter turn, move machines on a desk; then save the layout.
 */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useActionState, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { saveMapLayout } from "@/app/actions";
import {
  bundles as bundlesOf,
  detailCard,
  exitPoint,
  gridOf,
  placeRect,
  rotatedBox,
  type Bundle,
  type MapCable,
  type MapDevice,
  type MapPlace,
  type MapRoom,
} from "@/lib/studio-map";
import { CATEGORIES, LOCATION_KINDS, SIGNALS, type Category, type Signal } from "@/lib/vocab";

interface Props {
  rooms: MapRoom[];
  places: MapPlace[];
  devices: MapDevice[];
  cables: MapCable[];
  focus?: number;
}

type View = { x: number; y: number; w: number; h: number };
type Selection = { type: "place" | "room"; id: number } | null;
type Drag =
  | { kind: "pan"; cx: number; cy: number; view: View; place?: number; moved: boolean }
  | { kind: "place"; id: number; sx: number; sy: number; ox: number; oy: number; moved: boolean }
  | { kind: "place-size"; id: number; sx: number; sy: number; ow: number; od: number; rot: number }
  | { kind: "room"; id: number; sx: number; sy: number; ox: number; oy: number }
  | { kind: "room-size"; id: number; sx: number; sy: number; ow: number; od: number }
  | { kind: "device"; id: number; box: { x: number; y: number; w: number; d: number } };

const SNAP = 5;
const snap = (v: number) => Math.round(v / SNAP) * SNAP;
const ALL_SIGNALS = Object.keys(SIGNALS) as Signal[];
const DEFAULT_SIGNALS = new Set<Signal>(["audio", "midi", "cv", "gate", "clock", "digital_audio", "usb", "network", "control"]);

const PLACE_STYLE: Record<MapPlace["kind"], { fill: string; stroke: string; dash?: string }> = {
  rack: { fill: "#1c1e22", stroke: "#5a606a" },
  desk: { fill: "#3a2e24", stroke: "#7a5f45" },
  shelf: { fill: "#262a30", stroke: "#56606b" },
  wall: { fill: "#2c2f35", stroke: "#5a606a" },
  case: { fill: "#22252a", stroke: "#6b6e76", dash: "6 4" },
  storage: { fill: "url(#hatch)", stroke: "#4b5058" },
};

export function StudioMap(props: Props) {
  const router = useRouter();
  const svgRef = useRef<SVGSVGElement>(null);
  const [rooms, setRooms] = useState(props.rooms);
  const [places, setPlaces] = useState(props.places);
  const [devices, setDevices] = useState(props.devices);
  const [dirty, setDirty] = useState({ rooms: new Set<number>(), places: new Set<number>(), devices: new Set<number>() });
  const [signals, setSignals] = useState<Set<Signal>>(() => new Set(DEFAULT_SIGNALS));
  const [focus, setFocus] = useState<number | null>(props.focus ?? null);
  const [edit, setEdit] = useState(false);
  const [selected, setSelected] = useState<Selection>(null);
  const [hover, setHover] = useState<{ bundle?: string; device?: number } | null>(null);
  const [state, run, pending] = useActionState(saveMapLayout, {});
  const drag = useRef<Drag | null>(null);

  // A save brings new props from the server: start from them.
  const [shown, setShown] = useState(props);
  if (shown !== props) {
    setShown(props);
    setRooms(props.rooms);
    setPlaces(props.places);
    setDevices(props.devices);
    setDirty({ rooms: new Set(), places: new Set(), devices: new Set() });
  }
  useEffect(() => {
    if (state.ok) router.refresh();
  }, [state, router]);

  const roomById = useMemo(() => new Map(rooms.map((r) => [r.id, r])), [rooms]);
  const placeById = useMemo(() => new Map(places.map((p) => [p.id, p])), [places]);
  const deviceById = useMemo(() => new Map(devices.map((d) => [d.id, d])), [devices]);
  const boxOf = useCallback(
    (p: MapPlace) => {
      const r = placeRect(p, roomById);
      return rotatedBox(r.x, r.y, r.w, r.d, p.rot);
    },
    [roomById],
  );
  const placeOf = useCallback((device: number) => deviceById.get(device)?.place, [deviceById]);
  const visibleCables = useMemo(() => props.cables.filter((c) => signals.has(c.signal)), [props.cables, signals]);
  const bundleList = useMemo(() => bundlesOf(visibleCables, placeOf), [visibleCables, placeOf]);

  // ---- The view: fit, zoom to a place, animate ----

  const fit = useCallback((): View => {
    const boxes = [
      ...rooms.map((r) => ({ x: r.x, y: r.y, w: r.w, d: r.d })),
      ...places.map((p) => boxOf(p)),
    ];
    if (!boxes.length) return { x: 0, y: 0, w: 800, h: 500 };
    const x0 = Math.min(...boxes.map((b) => b.x));
    const y0 = Math.min(...boxes.map((b) => b.y));
    const x1 = Math.max(...boxes.map((b) => b.x + b.w));
    const y1 = Math.max(...boxes.map((b) => b.y + b.d));
    const m = Math.max(40, (x1 - x0) * 0.04);
    return { x: x0 - m, y: y0 - m, w: x1 - x0 + 2 * m, h: y1 - y0 + 2 * m };
  }, [rooms, places, boxOf]);

  const placeView = useCallback(
    (id: number): View | null => {
      const p = placeById.get(id);
      if (!p) return null;
      const b = detailCard(p, boxOf(p), devices.filter((d) => d.place === id));
      const m = Math.max(b.w, b.d) * 0.22;
      return { x: b.x - m, y: b.y - m, w: b.w + 2 * m, h: b.d + 2 * m };
    },
    [placeById, boxOf, devices],
  );

  const [view, setView] = useState<View>({ x: 0, y: 0, w: 800, h: 500 });
  const viewRef = useRef(view);
  useEffect(() => {
    viewRef.current = view;
  }, [view]);
  const anim = useRef<number | null>(null);
  const animateTo = useCallback((target: View) => {
    if (anim.current) cancelAnimationFrame(anim.current);
    const from = viewRef.current;
    const t0 = performance.now();
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / 380);
      const e = 1 - Math.pow(1 - k, 3);
      setView({
        x: from.x + (target.x - from.x) * e,
        y: from.y + (target.y - from.y) * e,
        w: from.w + (target.w - from.w) * e,
        h: from.h + (target.h - from.h) * e,
      });
      if (k < 1) anim.current = requestAnimationFrame(step);
    };
    anim.current = requestAnimationFrame(step);
  }, []);

  // First view: the whole studio, or the place asked for in the URL.
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const target = (focus !== null && placeView(focus)) || fit();
    viewRef.current = target;
    animateTo(target);
  }, [focus, placeView, fit, animateTo]);

  const zoomTo = useCallback(
    (id: number | null) => {
      setFocus(id);
      setHover(null);
      const target = id !== null ? placeView(id) : fit();
      if (target) animateTo(target);
      const url = new URL(window.location.href);
      if (id !== null) url.searchParams.set("place", String(id));
      else url.searchParams.delete("place");
      window.history.replaceState(null, "", url);
    },
    [placeView, fit, animateTo],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (selected) setSelected(null);
        else if (focus !== null) zoomTo(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [focus, selected, zoomTo]);

  // ---- Pointer: pan, zoom, drag ----

  const toSvg = (clientX: number, clientY: number) => {
    const svg = svgRef.current!;
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const p = pt.matrixTransform(svg.getScreenCTM()!.inverse());
    return { x: p.x, y: p.y };
  };

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (anim.current) cancelAnimationFrame(anim.current);
      const p = toSvg(e.clientX, e.clientY);
      const k = Math.exp(e.deltaY * 0.0015);
      const v = viewRef.current;
      const w = Math.min(20000, Math.max(30, v.w * k));
      const h = (v.h * w) / v.w;
      setView({ x: p.x - ((p.x - v.x) * w) / v.w, y: p.y - ((p.y - v.y) * h) / v.h, w, h });
    };
    svg.addEventListener("wheel", onWheel, { passive: false });
    return () => svg.removeEventListener("wheel", onWheel);
  }, []);

  const markDirty = (kind: "rooms" | "places" | "devices", id: number) =>
    setDirty((d) => {
      if (d[kind].has(id)) return d;
      const next = { ...d, [kind]: new Set(d[kind]) };
      next[kind].add(id);
      return next;
    });

  const begin = (e: React.PointerEvent, d: Drag) => {
    e.stopPropagation();
    if (anim.current) cancelAnimationFrame(anim.current);
    drag.current = d;
    svgRef.current?.setPointerCapture(e.pointerId);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    begin(e, { kind: "pan", cx: e.clientX, cy: e.clientY, view: viewRef.current, moved: false });
    if (edit) setSelected(null);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    if (d.kind === "pan") {
      // Pan in screen pixels, scaled to the view at the start of the drag.
      const rect = svgRef.current!.getBoundingClientRect();
      const scale = Math.max(d.view.w / rect.width, d.view.h / rect.height);
      const dx = (e.clientX - d.cx) * scale;
      const dy = (e.clientY - d.cy) * scale;
      if (Math.abs(e.clientX - d.cx) + Math.abs(e.clientY - d.cy) > 4) d.moved = true;
      if (d.moved) setView({ ...d.view, x: d.view.x - dx, y: d.view.y - dy });
      return;
    }
    const p = toSvg(e.clientX, e.clientY);
    if (d.kind === "place") {
      const dx = p.x - d.sx;
      const dy = p.y - d.sy;
      if (Math.abs(dx) + Math.abs(dy) > 1) d.moved = true;
      setPlaces((ps) => ps.map((pl) => (pl.id === d.id ? { ...pl, x: snap(d.ox + dx), y: snap(d.oy + dy) } : pl)));
      markDirty("places", d.id);
    } else if (d.kind === "place-size") {
      // Resize along the place's own axes, whatever its rotation.
      const a = (-d.rot * Math.PI) / 180;
      const dx = p.x - d.sx;
      const dy = p.y - d.sy;
      const lx = dx * Math.cos(a) - dy * Math.sin(a);
      const ly = dx * Math.sin(a) + dy * Math.cos(a);
      setPlaces((ps) => ps.map((pl) => (pl.id === d.id ? { ...pl, w: Math.max(10, snap(d.ow + lx)), d: Math.max(10, snap(d.od + ly)) } : pl)));
      markDirty("places", d.id);
    } else if (d.kind === "room") {
      setRooms((rs) => rs.map((r) => (r.id === d.id ? { ...r, x: snap(d.ox + p.x - d.sx), y: snap(d.oy + p.y - d.sy) } : r)));
      markDirty("rooms", d.id);
    } else if (d.kind === "room-size") {
      setRooms((rs) => rs.map((r) => (r.id === d.id ? { ...r, w: Math.max(100, snap(d.ow + p.x - d.sx)), d: Math.max(100, snap(d.od + p.y - d.sy)) } : r)));
      markDirty("rooms", d.id);
    } else if (d.kind === "device") {
      const x = Math.round(Math.min(100, Math.max(0, ((p.x - d.box.x) / d.box.w) * 100)));
      const y = Math.round(Math.min(100, Math.max(0, ((p.y - d.box.y) / d.box.d) * 100)));
      setDevices((ds) => ds.map((dev) => (dev.id === d.id ? { ...dev, x, y } : dev)));
      markDirty("devices", d.id);
    }
  };

  const onPointerUp = () => {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    if (d.kind === "pan" && !d.moved && d.place !== undefined) zoomTo(d.place);
    if (d.kind === "place" && d.moved) {
      // Dropped in another room (or outside any): it now belongs there.
      setPlaces((ps) =>
        ps.map((pl) => {
          if (pl.id !== d.id) return pl;
          const abs = placeRect(pl, roomById);
          const cx = abs.x + abs.w / 2;
          const cy = abs.y + abs.d / 2;
          const into = rooms.find((r) => cx >= r.x && cx <= r.x + r.w && cy >= r.y && cy <= r.y + r.d);
          if (into?.id === pl.room) return pl;
          return { ...pl, room: into?.id, x: snap(abs.x - (into?.x ?? 0)), y: snap(abs.y - (into?.y ?? 0)) };
        }),
      );
    }
  };

  // ---- Saving ----

  const changed = dirty.rooms.size + dirty.places.size + dirty.devices.size;
  const unplaced = rooms.some((r) => !r.placed) || places.some((p) => !p.placed);
  const save = () => {
    // Everything moved, plus everything still auto-placed, so the plan stays as shown.
    const layout = {
      rooms: rooms.filter((r) => dirty.rooms.has(r.id) || !r.placed).map((r) => ({ id: r.id, x: r.x, y: r.y, w: r.w, d: r.d })),
      locations: places
        .filter((p) => dirty.places.has(p.id) || !p.placed)
        .map((p) => ({ id: p.id, room: p.room ?? 0, x: p.x, y: p.y, w: p.w, d: p.d, rot: p.rot })),
      devices: devices.filter((d) => dirty.devices.has(d.id)).map((d) => ({ id: d.id, x: d.x ?? 50, y: d.y ?? 50 })),
    };
    const data = new FormData();
    data.set("layout", JSON.stringify(layout));
    startTransition(() => run(data));
  };
  const discard = () => {
    setRooms(props.rooms);
    setPlaces(props.places);
    setDevices(props.devices);
    setDirty({ rooms: new Set(), places: new Set(), devices: new Set() });
    setSelected(null);
  };

  // ---- Drawing ----

  const fsBase = view.w / 75; // a readable text size at the current zoom
  const focusPlace = focus !== null ? placeById.get(focus) : undefined;
  const sel = selected?.type === "place" ? placeById.get(selected.id) : undefined;
  const selRoom = selected?.type === "room" ? roomById.get(selected.id) : undefined;
  const homeless = devices.filter((d) => d.place === undefined && d.state !== "sold");
  const hovered = hover?.bundle ? bundleList.find((b) => b.key === hover.bundle) : undefined;

  return (
    <div>
      {/* Toolbar */}
      <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
        <nav className="mr-auto flex items-center gap-1 text-dim" aria-label="Breadcrumb">
          <button type="button" onClick={() => zoomTo(null)} className={focusPlace ? "hover:text-ink" : "font-medium text-ink"}>
            Studio
          </button>
          {focusPlace ? (
            <>
              <span>›</span>
              {focusPlace.room !== undefined ? <span>{roomById.get(focusPlace.room)?.name}</span> : null}
              {focusPlace.room !== undefined ? <span>›</span> : null}
              <span className="font-medium text-ink">{focusPlace.name}</span>
            </>
          ) : null}
        </nav>
        {focusPlace ? (
          <button type="button" onClick={() => zoomTo(null)} className="rounded-md border border-line-strong px-3 py-1.5 hover:bg-raised">
            ← Whole studio
          </button>
        ) : (
          <button type="button" onClick={() => animateTo(fit())} className="rounded-md border border-line-strong px-3 py-1.5 hover:bg-raised">
            Fit
          </button>
        )}
        <button
          type="button"
          onClick={() => {
            setEdit((v) => !v);
            setSelected(null);
          }}
          className={`rounded-md border px-3 py-1.5 ${edit ? "border-amber bg-amber/10 text-amber" : "border-line-strong hover:bg-raised"}`}
          aria-pressed={edit}
        >
          {edit ? "Editing layout" : "Edit layout"}
        </button>
      </div>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {ALL_SIGNALS.filter((s) => props.cables.some((c) => c.signal === s)).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() =>
              setSignals((prev) => {
                const next = new Set(prev);
                if (next.has(s)) next.delete(s);
                else next.add(s);
                return next;
              })
            }
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs ${signals.has(s) ? "border-line-strong bg-raised text-ink" : "border-line text-faint"}`}
            aria-pressed={signals.has(s)}
          >
            <span className="size-2 rounded-full" style={{ background: signals.has(s) ? SIGNALS[s].color : "transparent", outline: `1px solid ${SIGNALS[s].color}` }} />
            {SIGNALS[s].label}
          </button>
        ))}
      </div>

      <div className="relative">
        <svg
          ref={svgRef}
          viewBox={`${view.x} ${view.y} ${view.w} ${view.h}`}
          preserveAspectRatio="xMidYMid meet"
          className="block h-[70vh] min-h-[420px] w-full touch-none select-none rounded-lg border border-line bg-[#0f1012]"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          role="img"
          aria-label="Floor plan of the studio"
        >
          <defs>
            <pattern id="grid50" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M50 0H0V50" fill="none" stroke="#1f2125" strokeWidth="1" />
            </pattern>
            <pattern id="hatch" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="10" height="10" fill="#202226" />
              <line x1="0" y1="0" x2="0" y2="10" stroke="#34373d" strokeWidth="4" />
            </pattern>
          </defs>

          {/* Rooms */}
          {rooms.map((r) => {
            const active = selRoom?.id === r.id;
            return (
              <g key={r.id}>
                <rect x={r.x} y={r.y} width={r.w} height={r.d} fill="url(#grid50)" />
                <rect
                  x={r.x}
                  y={r.y}
                  width={r.w}
                  height={r.d}
                  fill="none"
                  stroke={active ? "#f2a541" : r.color}
                  strokeWidth={Math.max(3, fsBase * 0.25)}
                  strokeDasharray={r.placed || dirty.rooms.has(r.id) ? undefined : "18 10"}
                />
                <g
                  onPointerDown={(e) => {
                    if (!edit) return;
                    const p = toSvg(e.clientX, e.clientY);
                    setSelected({ type: "room", id: r.id });
                    begin(e, { kind: "room", id: r.id, sx: p.x, sy: p.y, ox: r.x, oy: r.y });
                  }}
                  style={{ cursor: edit ? "move" : undefined }}
                >
                  <text x={r.x} y={r.y - fsBase * 0.45} fontSize={fsBase * 1.05} fontWeight={600} fill={r.color}>
                    {r.name}
                  </text>
                  <text x={r.x + r.w} y={r.y - fsBase * 0.45} fontSize={fsBase * 0.7} fill="#6b6e76" textAnchor="end">
                    {(r.w / 100).toFixed(1)} × {(r.d / 100).toFixed(1)} m
                  </text>
                </g>
                {edit ? (
                  <rect
                    x={r.x + r.w - fsBase * 0.8}
                    y={r.y + r.d - fsBase * 0.8}
                    width={fsBase * 1.6}
                    height={fsBase * 1.6}
                    fill="#f2a541"
                    style={{ cursor: "nwse-resize" }}
                    onPointerDown={(e) => {
                      const p = toSvg(e.clientX, e.clientY);
                      setSelected({ type: "room", id: r.id });
                      begin(e, { kind: "room-size", id: r.id, sx: p.x, sy: p.y, ow: r.w, od: r.d });
                    }}
                  />
                ) : null}
              </g>
            );
          })}

          {/* Bundles between places */}
          <g opacity={focusPlace ? 0.35 : 1}>
            {bundleList.map((b) => (
              <BundleLines
                key={b.key}
                bundle={b}
                a={placeById.get(b.a)}
                b={placeById.get(b.b)}
                boxOf={boxOf}
                fs={fsBase}
                lit={hover?.bundle === b.key}
                onHover={(on) => setHover(on ? { bundle: b.key } : null)}
              />
            ))}
          </g>

          {/* Places */}
          {places.map((p) => {
            const r = placeRect(p, roomById);
            const style = PLACE_STYLE[p.kind];
            const count = devices.filter((d) => d.place === p.id && d.state !== "sold").length;
            const isFocus = focus === p.id;
            const isSel = sel?.id === p.id;
            const cx = r.x + r.w / 2;
            const cy = r.y + r.d / 2;
            const box = boxOf(p);
            const nameSize = Math.max(fsBase * 0.62, Math.min(fsBase * 0.95, (box.w / Math.max(4, p.name.length)) * 1.6));
            return (
              <g key={p.id}>
                <g
                  transform={`rotate(${p.rot} ${cx} ${cy})`}
                  onPointerDown={(e) => {
                    if (e.button !== 0) return;
                    if (edit) {
                      const pt = toSvg(e.clientX, e.clientY);
                      setSelected({ type: "place", id: p.id });
                      begin(e, { kind: "place", id: p.id, sx: pt.x, sy: pt.y, ox: p.x, oy: p.y, moved: false });
                    } else {
                      begin(e, { kind: "pan", cx: e.clientX, cy: e.clientY, view: viewRef.current, place: p.id, moved: false });
                    }
                  }}
                  style={{ cursor: edit ? "move" : "zoom-in" }}
                >
                  <rect
                    x={r.x}
                    y={r.y}
                    width={r.w}
                    height={r.d}
                    rx={Math.min(r.w, r.d) * 0.04}
                    fill={style.fill}
                    stroke={isSel || isFocus ? "#f2a541" : style.stroke}
                    strokeWidth={isSel || isFocus ? Math.max(2, fsBase * 0.2) : Math.max(1.5, fsBase * 0.1)}
                    strokeDasharray={p.placed || dirty.places.has(p.id) ? style.dash : "8 6"}
                  />
                  {p.kind === "rack" && !isFocus ? (
                    <>
                      <line x1={r.x + r.w * 0.12} y1={r.y + 4} x2={r.x + r.w * 0.12} y2={r.y + r.d - 4} stroke="#3a3e45" strokeWidth={2} />
                      <line x1={r.x + r.w * 0.88} y1={r.y + 4} x2={r.x + r.w * 0.88} y2={r.y + r.d - 4} stroke="#3a3e45" strokeWidth={2} />
                    </>
                  ) : null}
                </g>
                {!isFocus ? (
                  <g pointerEvents="none">
                    <text x={cx} y={cy} fontSize={nameSize} fontWeight={600} fill="#ecebe7" textAnchor="middle" stroke="#0f1012" strokeWidth={nameSize * 0.25} paintOrder="stroke">
                      {p.name}
                    </text>
                    <text x={cx} y={cy + nameSize * 1.2} fontSize={nameSize * 0.7} fill="#9a9ca3" textAnchor="middle" stroke="#0f1012" strokeWidth={nameSize * 0.2} paintOrder="stroke">
                      {LOCATION_KINDS[p.kind]} · {count} {count === 1 ? "machine" : "machines"}
                    </text>
                  </g>
                ) : null}
                {edit && isSel ? (
                  <ResizeHandle place={p} rect={r} size={fsBase * 1.4} onDown={(e) => {
                    const pt = toSvg(e.clientX, e.clientY);
                    begin(e, { kind: "place-size", id: p.id, sx: pt.x, sy: pt.y, ow: p.w, od: p.d, rot: p.rot });
                  }} />
                ) : null}
              </g>
            );
          })}

          {/* Inside the place we zoomed into */}
          {focusPlace ? (
            <PlaceDetail
              place={focusPlace}
              box={detailCard(focusPlace, boxOf(focusPlace), devices.filter((d) => d.place === focusPlace.id))}
              devices={devices.filter((d) => d.place === focusPlace.id && d.state !== "sold")}
              cables={visibleCables}
              placeOf={placeOf}
              placeById={placeById}
              boxOf={boxOf}
              deviceById={deviceById}
              edit={edit}
              hoverDevice={hover?.device}
              onHoverDevice={(id) => setHover(id === null ? null : { device: id })}
              onDragDevice={(e, id, box) => begin(e, { kind: "device", id, box })}
              onOpenPlace={zoomTo}
            />
          ) : null}
        </svg>

        {hovered ? <BundleTip bundle={hovered} placeById={placeById} deviceById={deviceById} /> : null}

        {edit && (sel || selRoom) ? (
          <div className="absolute top-3 left-3 w-64 rounded-lg border border-line-strong bg-bg/95 p-3 text-sm shadow-xl">
            {sel ? (
              <PlaceInspector
                place={sel}
                rooms={rooms}
                onChange={(patch) => {
                  setPlaces((ps) => ps.map((p) => (p.id === sel.id ? { ...p, ...patch } : p)));
                  markDirty("places", sel.id);
                }}
                onRoom={(roomId) => {
                  // Keep it where it is on the plan, now counted from the new room's corner.
                  const abs = placeRect(sel, roomById);
                  const into = roomId ? roomById.get(roomId) : undefined;
                  setPlaces((ps) => ps.map((p) => (p.id === sel.id ? { ...p, room: into?.id, x: snap(abs.x - (into?.x ?? 0)), y: snap(abs.y - (into?.y ?? 0)) } : p)));
                  markDirty("places", sel.id);
                }}
              />
            ) : selRoom ? (
              <RoomInspector
                room={selRoom}
                onChange={(patch) => {
                  setRooms((rs) => rs.map((r) => (r.id === selRoom.id ? { ...r, ...patch } : r)));
                  markDirty("rooms", selRoom.id);
                }}
              />
            ) : null}
          </div>
        ) : null}

        {edit ? (
          <p className="pointer-events-none absolute bottom-3 left-3 rounded bg-bg/80 px-2 py-1 text-xs text-dim">
            Drag places and room names to move them · orange corner to resize · drop a place in another room to move it there
            {focusPlace && focusPlace.kind !== "rack" ? " · drag machines on this surface" : ""}
          </p>
        ) : (
          <p className="pointer-events-none absolute bottom-3 left-3 rounded bg-bg/80 px-2 py-1 text-xs text-dim">
            Click a place to zoom in · scroll to zoom · drag to move around · Esc to go back
          </p>
        )}
      </div>

      {changed || (edit && unplaced) || state.error ? (
        <div className="sticky bottom-0 z-10 mt-3 flex flex-wrap items-center gap-3 border-t border-line bg-bg/95 py-3 backdrop-blur">
          <button type="button" onClick={save} disabled={pending} className="rounded-md bg-amber px-4 py-2 text-sm font-medium text-amber-ink hover:brightness-110 disabled:opacity-60">
            {pending ? "Saving…" : "Save layout"}
          </button>
          {changed ? (
            <button type="button" onClick={discard} className="rounded-md border border-line-strong px-3 py-2 text-sm hover:bg-raised">
              Discard changes
            </button>
          ) : null}
          <span className={`text-sm ${state.error ? "text-bad" : "text-dim"}`}>
            {state.error ?? (changed ? `${changed} change(s)` : "Dashed outlines are placed automatically: save to keep them where they are.")}
          </span>
        </div>
      ) : null}

      {homeless.length ? (
        <p className="mt-4 text-sm text-dim">
          Not on the map (no place):{" "}
          {homeless.map((d, i) => (
            <span key={d.id}>
              {i ? ", " : ""}
              <Link href={`/assets/${d.id}/edit`} className="text-ink hover:text-amber">
                {d.name}
              </Link>
            </span>
          ))}
          . Give them a location to see them here.
        </p>
      ) : null}
    </div>
  );
}

// ---- Bundles ----

function BundleLines({
  bundle,
  a,
  b,
  boxOf,
  fs,
  lit,
  onHover,
}: {
  bundle: Bundle;
  a?: MapPlace;
  b?: MapPlace;
  boxOf: (p: MapPlace) => ReturnType<typeof rotatedBox>;
  fs: number;
  lit: boolean;
  onHover: (on: boolean) => void;
}) {
  if (!a || !b) return null;
  const ba = boxOf(a);
  const bb = boxOf(b);
  const p1 = exitPoint(ba, bb.cx, bb.cy);
  const p2 = exitPoint(bb, ba.cx, ba.cy);
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const entries = (Object.entries(bundle.bySignal) as Array<[Signal, number]>).sort((x, y) => y[1] - x[1]);
  const gap = fs * 0.45;
  const total = bundle.cables.length;
  const mx = (p1.x + p2.x) / 2;
  const my = (p1.y + p2.y) / 2;
  return (
    <g onPointerEnter={() => onHover(true)} onPointerLeave={() => onHover(false)} style={{ cursor: "help" }}>
      <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="transparent" strokeWidth={fs * 1.6} />
      {entries.map(([signal, n], i) => {
        const off = (i - (entries.length - 1) / 2) * gap;
        return (
          <line
            key={signal}
            x1={p1.x + nx * off}
            y1={p1.y + ny * off}
            x2={p2.x + nx * off}
            y2={p2.y + ny * off}
            stroke={SIGNALS[signal].color}
            strokeWidth={(0.12 + Math.sqrt(n) * 0.09) * fs * (lit ? 1.6 : 1)}
            strokeOpacity={lit ? 1 : 0.8}
            strokeLinecap="round"
            strokeDasharray={signal === "midi" || signal === "usb" || signal === "network" ? `${fs * 0.5} ${fs * 0.3}` : undefined}
          />
        );
      })}
      <circle cx={mx} cy={my} r={fs * 0.62} fill="#0f1012" stroke={lit ? "#f2a541" : "#3a3e45"} strokeWidth={fs * 0.08} />
      <text x={mx} y={my + fs * 0.25} fontSize={fs * 0.7} fontWeight={700} fill="#ecebe7" textAnchor="middle" pointerEvents="none">
        {total}
      </text>
    </g>
  );
}

function BundleTip({ bundle, placeById, deviceById }: { bundle: Bundle; placeById: Map<number, MapPlace>; deviceById: Map<number, MapDevice> }) {
  const a = placeById.get(bundle.a);
  const b = placeById.get(bundle.b);
  return (
    <div className="pointer-events-none absolute top-3 right-3 max-w-sm rounded-md border border-line-strong bg-bg/95 px-3 py-2 text-sm shadow-xl">
      <div className="font-semibold">
        {a?.name} ↔ {b?.name}
      </div>
      <div className="mt-1 flex flex-wrap gap-x-3 text-xs">
        {(Object.entries(bundle.bySignal) as Array<[Signal, number]>).map(([s, n]) => (
          <span key={s} style={{ color: SIGNALS[s].color }}>
            {n} {SIGNALS[s].label}
          </span>
        ))}
      </div>
      <ul className="mt-2 space-y-0.5 text-xs text-dim">
        {bundle.cables.slice(0, 8).map((c) => (
          <li key={c.id}>
            <span className="font-mono text-amber">{c.code}</span> {deviceById.get(c.a.device)?.name} · {c.a.port} → {deviceById.get(c.b.device)?.name} · {c.b.port}
          </li>
        ))}
        {bundle.cables.length > 8 ? <li>and {bundle.cables.length - 8} more</li> : null}
      </ul>
    </div>
  );
}

// ---- Editing ----

function ResizeHandle({ place, rect, size, onDown }: { place: MapPlace; rect: { x: number; y: number; w: number; d: number }; size: number; onDown: (e: React.PointerEvent) => void }) {
  const cx = rect.x + rect.w / 2;
  const cy = rect.y + rect.d / 2;
  return (
    <g transform={`rotate(${place.rot} ${cx} ${cy})`}>
      <rect x={rect.x + rect.w - size / 2} y={rect.y + rect.d - size / 2} width={size} height={size} fill="#f2a541" style={{ cursor: "nwse-resize" }} onPointerDown={onDown} />
    </g>
  );
}

function PlaceInspector({
  place,
  rooms,
  onChange,
  onRoom,
}: {
  place: MapPlace;
  rooms: MapRoom[];
  onChange: (patch: Partial<MapPlace>) => void;
  onRoom: (room: number | undefined) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-semibold">{place.name}</span>
        <Link href={`/places?location=${place.id}`} className="text-xs text-dim hover:text-ink">
          Details
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <label>
          <span className="block text-[11px] text-faint">Width (cm)</span>
          <input className="control" type="number" min={10} value={place.w} onChange={(e) => onChange({ w: Math.max(10, Number(e.target.value) || 10) })} />
        </label>
        <label>
          <span className="block text-[11px] text-faint">Depth (cm)</span>
          <input className="control" type="number" min={10} value={place.d} onChange={(e) => onChange({ d: Math.max(10, Number(e.target.value) || 10) })} />
        </label>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[11px] text-faint">Turn</span>
        <button type="button" onClick={() => onChange({ rot: (place.rot + 270) % 360 })} className="rounded border border-line-strong px-2 py-0.5 hover:bg-raised" aria-label="Turn left">
          ⟲
        </button>
        <button type="button" onClick={() => onChange({ rot: (place.rot + 90) % 360 })} className="rounded border border-line-strong px-2 py-0.5 hover:bg-raised" aria-label="Turn right">
          ⟳
        </button>
        <span className="text-xs text-dim">{place.rot}°</span>
      </div>
      <label className="block">
        <span className="block text-[11px] text-faint">Room</span>
        <select className="control" value={place.room ?? ""} onChange={(e) => onRoom(e.target.value ? Number(e.target.value) : undefined)}>
          <option value="">— none —</option>
          {rooms.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

function RoomInspector({ room, onChange }: { room: MapRoom; onChange: (patch: Partial<MapRoom>) => void }) {
  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-semibold" style={{ color: room.color }}>
          {room.name}
        </span>
        <Link href={`/places?room=${room.id}`} className="text-xs text-dim hover:text-ink">
          Details
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <label>
          <span className="block text-[11px] text-faint">Width (cm)</span>
          <input className="control" type="number" min={100} value={room.w} onChange={(e) => onChange({ w: Math.max(100, Number(e.target.value) || 100) })} />
        </label>
        <label>
          <span className="block text-[11px] text-faint">Depth (cm)</span>
          <input className="control" type="number" min={100} value={room.d} onChange={(e) => onChange({ d: Math.max(100, Number(e.target.value) || 100) })} />
        </label>
      </div>
    </div>
  );
}

// ---- Inside a place ----

interface Anchor {
  x: number;
  y: number;
  /** Which way lines leave this machine inside a rack: to its right. */
  side?: "right";
}

function PlaceDetail({
  place,
  box,
  devices,
  cables,
  placeOf,
  placeById,
  boxOf,
  deviceById,
  edit,
  hoverDevice,
  onHoverDevice,
  onDragDevice,
  onOpenPlace,
}: {
  place: MapPlace;
  box: ReturnType<typeof detailCard>;
  devices: MapDevice[];
  cables: MapCable[];
  placeOf: (d: number) => number | undefined;
  placeById: Map<number, MapPlace>;
  boxOf: (p: MapPlace) => ReturnType<typeof rotatedBox>;
  deviceById: Map<number, MapDevice>;
  edit: boolean;
  hoverDevice?: number;
  onHoverDevice: (id: number | null) => void;
  onDragDevice: (e: React.PointerEvent, id: number, box: { x: number; y: number; w: number; d: number }) => void;
  onOpenPlace: (id: number) => void;
}) {
  const fs = place.kind === "rack" ? 6 : Math.max(4, Math.min(box.w, box.d) / 11);
  const center = { cx: box.x + box.w / 2, cy: box.y + box.d / 2 };
  const anchors = new Map<number, Anchor>();
  const back: React.ReactNode[] = [];
  const tiles: React.ReactNode[] = [];
  const pad = fs * 0.8;

  if (place.kind === "rack") {
    // Front view, unit by unit.
    const units = box.units;
    const railX = box.x + pad * 2.2;
    const railW = box.w - pad * 4.4;
    const uh = (box.d - pad * 2) / units;
    back.push(
      <g key="rails">
        <rect x={box.x} y={box.y} width={box.w} height={box.d} fill="#141517" stroke="#f2a541" strokeWidth={fs * 0.12} rx={fs * 0.3} />
        <rect x={railX} y={box.y + pad} width={railW} height={uh * units} fill="#0c0d0e" />
        {Array.from({ length: units }, (_, i) => (
          <g key={i}>
            <line x1={railX} x2={railX + railW} y1={box.y + pad + i * uh} y2={box.y + pad + i * uh} stroke="#1f2125" strokeWidth={fs * 0.05} />
            <text x={box.x + pad * 1.1} y={box.y + pad + (i + 0.5) * uh + fs * 0.25} fontSize={Math.min(fs * 0.7, uh * 0.55)} fill="#6b6e76" textAnchor="middle" fontFamily="ui-monospace, monospace">
              {i + 1}
            </text>
          </g>
        ))}
      </g>,
    );
    const loose: MapDevice[] = [];
    for (const d of devices) {
      if (!d.rackPos) {
        loose.push(d);
        continue;
      }
      const h = (d.rackH ?? 1) * uh;
      const y = box.y + pad + (d.rackPos - 1) * uh;
      anchors.set(d.id, { x: railX + railW, y: y + h / 2, side: "right" });
      tiles.push(
        <DeviceTile key={d.id} d={d} x={railX + fs * 0.1} y={y + uh * 0.06} w={railW - fs * 0.2} h={h - uh * 0.12} fs={Math.min(fs * 0.85, uh * 0.5)} lit={hoverDevice === d.id} onHover={onHoverDevice} />,
      );
    }
    if (loose.length) {
      tiles.push(
        <text key="loose" x={box.x + box.w / 2} y={box.y + box.d + fs * 1.2} fontSize={fs * 0.7} fill="#9a9ca3" textAnchor="middle">
          No rack position: {loose.map((d) => d.name).join(", ")}
        </text>,
      );
    }
  } else {
    // Top view: machines on the surface.
    const grid = gridOf(Math.max(1, devices.length), box.w, box.d);
    const tw = (box.w / grid.cols) * 0.82;
    const th = Math.min((box.d / grid.rows) * 0.7, tw * 0.75);
    back.push(<rect key="surface" x={box.x} y={box.y} width={box.w} height={box.d} fill={PLACE_STYLE[place.kind].fill} stroke="#f2a541" strokeWidth={fs * 0.12} rx={fs * 0.4} />);
    for (const d of devices) {
      const cx = box.x + ((d.x ?? 50) / 100) * box.w;
      const cy = box.y + ((d.y ?? 50) / 100) * box.d;
      anchors.set(d.id, { x: cx, y: cy });
      tiles.push(
        <DeviceTile
          key={d.id}
          d={d}
          x={cx - tw / 2}
          y={cy - th / 2}
          w={tw}
          h={th}
          fs={Math.min(fs * 0.9, tw / 9)}
          lit={hoverDevice === d.id}
          onHover={onHoverDevice}
          onDown={edit ? (e) => onDragDevice(e, d.id, { x: box.x, y: box.y, w: box.w, d: box.d }) : undefined}
        />,
      );
    }
  }

  // Cables inside the place, and stubs towards the places they reach.
  const here = new Set(devices.map((d) => d.id));
  const inner: React.ReactNode[] = [];
  const out = new Map<string, { device: number; place: number; cables: MapCable[] }>();
  let k = 0;
  for (const c of cables) {
    const ia = here.has(c.a.device);
    const ib = here.has(c.b.device);
    if (!ia && !ib) continue;
    if (ia && ib) {
      const A = anchors.get(c.a.device);
      const B = anchors.get(c.b.device);
      if (!A || !B || c.a.device === c.b.device) continue;
      const lit = hoverDevice === c.a.device || hoverDevice === c.b.device;
      const color = SIGNALS[c.signal].color;
      const sw = fs * (lit ? 0.22 : 0.12);
      if (A.side === "right") {
        const off = fs * (1.2 + (k++ % 6) * 0.55) + Math.abs(B.y - A.y) * 0.15;
        inner.push(<path key={c.id} d={`M${A.x},${A.y} C${A.x + off},${A.y} ${B.x + off},${B.y} ${B.x},${B.y}`} stroke={color} strokeWidth={sw} fill="none" strokeOpacity={hoverDevice && !lit ? 0.2 : 0.9}><title>{`${c.code}: ${deviceById.get(c.a.device)?.name} · ${c.a.port} → ${deviceById.get(c.b.device)?.name} · ${c.b.port}`}</title></path>);
      } else {
        const mx = (A.x + B.x) / 2;
        const my = (A.y + B.y) / 2 - Math.hypot(B.x - A.x, B.y - A.y) * 0.15;
        inner.push(<path key={c.id} d={`M${A.x},${A.y} Q${mx},${my} ${B.x},${B.y}`} stroke={color} strokeWidth={sw} fill="none" strokeOpacity={hoverDevice && !lit ? 0.2 : 0.85}><title>{`${c.code}: ${deviceById.get(c.a.device)?.name} · ${c.a.port} → ${deviceById.get(c.b.device)?.name} · ${c.b.port}`}</title></path>);
      }
      continue;
    }
    const mine = ia ? c.a.device : c.b.device;
    const other = placeOf(ia ? c.b.device : c.a.device);
    if (other === undefined) continue;
    const key = `${mine}-${other}`;
    const g = out.get(key) ?? { device: mine, place: other, cables: [] };
    g.cables.push(c);
    out.set(key, g);
  }

  const stubs: React.ReactNode[] = [];
  const labels: React.ReactNode[] = [];
  const labelled = new Set<number>();
  const taken: Array<{ x: number; y: number }> = [];
  for (const [key, g] of out) {
    const A = anchors.get(g.device);
    const target = placeById.get(g.place);
    if (!A || !target) continue;
    const tb = boxOf(target);
    const exit = exitPoint(box, tb.cx, tb.cy);
    const lit = hoverDevice === g.device;
    const counts = new Map<Signal, number>();
    for (const c of g.cables) counts.set(c.signal, (counts.get(c.signal) ?? 0) + 1);
    const main = [...counts.entries()].sort((x, y) => y[1] - x[1])[0]![0];
    const start = A.side === "right" ? { x: A.x, y: A.y } : A;
    stubs.push(
      <path
        key={key}
        d={`M${start.x},${start.y} Q${(start.x + exit.x) / 2},${start.y} ${exit.x},${exit.y}`}
        stroke={SIGNALS[main].color}
        strokeWidth={fs * (lit ? 0.2 : 0.1)}
        strokeDasharray={`${fs * 0.4} ${fs * 0.25}`}
        fill="none"
        strokeOpacity={hoverDevice && !lit ? 0.15 : 0.75}
      >
        <title>{`${deviceById.get(g.device)?.name} → ${target.name}: ${g.cables.map((c) => c.code).join(", ")}`}</title>
      </path>,
    );
    // One label per neighbouring place, where the stubs leave.
    if (!labelled.has(g.place)) {
      labelled.add(g.place);
      const total = [...out.values()].filter((o) => o.place === g.place).reduce((s, o) => s + o.cables.length, 0);
      let lx = exit.x + (exit.x - center.cx) * 0.18;
      let ly = exit.y + (exit.y - center.cy) * 0.18;
      // Move down (or right) until it doesn't sit on another label.
      const lw = fs * 8.4;
      const lh = fs * 1.5;
      for (let i = 0; i < 20 && taken.some((t) => Math.abs(t.x - lx) < lw && Math.abs(t.y - ly) < lh); i++) {
        if (Math.abs(exit.y - center.cy) > Math.abs(exit.x - center.cx) * (box.d / box.w)) lx += lw * 1.05;
        else ly += lh * 1.05;
      }
      taken.push({ x: lx, y: ly });
      labels.push(
        <g key={`l${g.place}`} style={{ cursor: "pointer" }} onPointerDown={(e) => e.stopPropagation()} onClick={() => onOpenPlace(g.place)}>
          <rect x={lx - fs * 4} y={ly - fs * 0.75} width={fs * 8} height={fs * 1.3} rx={fs * 0.3} fill="#0f1012" stroke="#3a3e45" strokeWidth={fs * 0.06} />
          <text x={lx} y={ly + fs * 0.2} fontSize={fs * 0.62} fill="#ecebe7" textAnchor="middle">
            → {truncate(target.name, 16)} · {total}
          </text>
        </g>,
      );
    }
  }

  return (
    <g>
      {back}
      <g>{stubs}</g>
      <g>{inner}</g>
      {tiles}
      <g>{labels}</g>
    </g>
  );
}

function DeviceTile({
  d,
  x,
  y,
  w,
  h,
  fs,
  lit,
  onHover,
  onDown,
}: {
  d: MapDevice;
  x: number;
  y: number;
  w: number;
  h: number;
  fs: number;
  lit: boolean;
  onHover: (id: number | null) => void;
  onDown?: (e: React.PointerEvent) => void;
}) {
  const dim = d.state === "in_repair" || d.state === "loaned";
  const body = (
    <g
      onPointerEnter={() => onHover(d.id)}
      onPointerLeave={() => onHover(null)}
      onPointerDown={(e) => {
        e.stopPropagation();
        onDown?.(e);
      }}
      style={{ cursor: onDown ? "grab" : "pointer" }}
      opacity={dim ? 0.6 : 1}
    >
      <rect x={x} y={y} width={w} height={h} rx={Math.min(w, h) * 0.08} fill="#24262a" stroke={lit ? "#f2a541" : "#4b5058"} strokeWidth={fs * 0.1} />
      {h < fs * 2.6 ? (
        // A one-unit machine: code and name on one line.
        <text x={x + fs * 0.5} y={y + h / 2 + fs * 0.33} fontSize={fs * 0.9}>
          <tspan fill="#f2a541" fontFamily="ui-monospace, monospace" fontSize={fs * 0.75}>
            {d.code}
          </tspan>
          <tspan fill="#ecebe7" fontWeight={600} dx={fs * 0.6}>
            {truncate(d.name, Math.max(6, Math.floor(w / (fs * 0.55)) - d.code.length - 2))}
          </tspan>
        </text>
      ) : (
        <>
          <text x={x + fs * 0.5} y={y + fs * 1.15} fontSize={fs * 0.7} fill="#f2a541" fontFamily="ui-monospace, monospace">
            {d.code}
          </text>
          <text x={x + fs * 0.5} y={y + fs * 2.25} fontSize={fs * 0.9} fontWeight={600} fill="#ecebe7">
            {truncate(d.name, Math.max(6, Math.floor(w / (fs * 0.55))))}
          </text>
        </>
      )}
      {h > fs * 3.2 ? (
        <text x={x + fs * 0.5} y={y + fs * 3.3} fontSize={fs * 0.62} fill="#9a9ca3">
          {CATEGORIES[d.category as Category] ?? d.category}
          {dim ? ` · ${d.state.replace("_", " ")}` : ""}
        </text>
      ) : null}
    </g>
  );
  // Outside edit mode, a machine opens its page.
  return onDown ? body : <a href={`/assets/${d.id}`}>{body}</a>;
}

function truncate(s: string, n: number) {
  return s.length > n ? `${s.slice(0, Math.max(1, n - 1))}…` : s;
}
