"use client";

/**
 * The controls of an analogue desk: a knob you can drag, a dual-concentric
 * pair like the GS3's aux sends, a console button and a fader.
 *
 * Everything here is a real control, not a picture: drag it, roll the wheel
 * over it, or focus it and use the arrow keys. Each one is a `slider` to a
 * screen reader, with the value read out in the unit printed on the panel.
 */
import { useRef, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";

/** Pixels of vertical drag that cover the whole travel. */
const TRAVEL = 150;
/** A knob turns from 7 o'clock to 5 o'clock, like every knob on the desk. */
const SWEEP = 270;

export interface KnobProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  /** Printed under the knob. */
  label?: string;
  /** What the readout says; defaults to the number and the unit. */
  format?: (value: number) => string;
  unit?: string;
  /** A knob with a centre position, like an EQ gain: marked, and it snaps. */
  detent?: boolean;
  size?: number;
  /** The collar colour, which says which section the knob belongs to. */
  color?: string;
  disabled?: boolean;
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const angleOf = (v: number, min: number, max: number) => -SWEEP / 2 + (SWEEP * (v - min)) / (max - min);
const polar = (cx: number, cy: number, r: number, deg: number) => {
  const rad = ((deg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)] as const;
};

/** The arc a knob's pointer travels, for the track behind it. */
function arc(cx: number, cy: number, r: number, from: number, to: number) {
  const [x1, y1] = polar(cx, cy, r, from);
  const [x2, y2] = polar(cx, cy, r, to);
  return `M${x1} ${y1} A${r} ${r} 0 ${Math.abs(to - from) > 180 ? 1 : 0} 1 ${x2} ${y2}`;
}

/**
 * The dragging, the wheel and the keys — shared by the knob and the ring of a
 * dual-concentric pair, which behave identically and only look different.
 */
function useTurn({ value, onChange, min, max, step = 0.1, detent, disabled }: KnobProps) {
  const from = useRef<{ y: number; value: number } | null>(null);

  const commit = (raw: number) => {
    let next = clamp(raw, min, max);
    // A centre-detented control falls into the middle, as the real one does.
    if (detent && Math.abs(next) < (max - min) / 60) next = 0;
    const rounded = Math.round(next / step) * step;
    const fixed = Number(rounded.toFixed(6));
    if (fixed !== value) onChange(fixed);
  };

  const onPointerDown = (e: ReactPointerEvent<SVGGElement>) => {
    if (disabled) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    from.current = { y: e.clientY, value };
  };
  const onPointerMove = (e: ReactPointerEvent<SVGGElement>) => {
    if (!from.current) return;
    const perPixel = (max - min) / TRAVEL;
    // Shift drags finely, which is how you set a frequency by ear.
    commit(from.current.value + (from.current.y - e.clientY) * perPixel * (e.shiftKey ? 0.25 : 1));
  };
  const onPointerUp = (e: ReactPointerEvent<SVGGElement>) => {
    from.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
  };
  const onKeyDown = (e: React.KeyboardEvent<SVGGElement>) => {
    if (disabled) return;
    const big = (max - min) / 10;
    const by = { ArrowUp: step, ArrowRight: step, ArrowDown: -step, ArrowLeft: -step, PageUp: big, PageDown: -big } as Record<string, number>;
    if (e.key in by) {
      e.preventDefault();
      commit(value + by[e.key]!);
    } else if (e.key === "Home") {
      e.preventDefault();
      commit(min);
    } else if (e.key === "End") {
      e.preventDefault();
      commit(max);
    }
  };

  return { onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp, onKeyDown };
}

export function Knob(props: KnobProps) {
  const { value, min, max, label, format, unit, detent, size = 38, color = "var(--color-amber)", disabled } = props;
  const turn = useTurn(props);
  const r = size / 2;
  const cx = r;
  const cy = r;
  const a = angleOf(value, min, max);
  const [px, py] = polar(cx, cy, r - 5, a);
  const text = format ? format(value) : `${Number(value.toFixed(2))}${unit ?? ""}`;

  return (
    <div className="flex flex-col items-center gap-0.5">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className={`touch-none ${disabled ? "opacity-40" : "cursor-ns-resize"}`}
        role="slider"
        tabIndex={disabled ? -1 : 0}
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={text}
        aria-disabled={disabled || undefined}
        {...turn}
      >
        {/* The travel, and how much of it is used. */}
        <path d={arc(cx, cy, r - 2, -SWEEP / 2, SWEEP / 2)} fill="none" stroke="var(--color-line)" strokeWidth={2} strokeLinecap="round" />
        <path
          d={arc(cx, cy, r - 2, detent ? 0 : -SWEEP / 2, a)}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          opacity={Math.abs(a - (detent ? 0 : -SWEEP / 2)) < 1 ? 0 : 1}
        />
        {detent ? <path d={`M${cx} 1 V4`} stroke="var(--color-faint)" strokeWidth={1} /> : null}
        {/* The cap. */}
        <circle cx={cx} cy={cy} r={r - 6.5} fill="#24262a" stroke="var(--color-line-strong)" />
        <line x1={cx} y1={cy} x2={px} y2={py} stroke="var(--color-ink)" strokeWidth={1.75} strokeLinecap="round" />
      </svg>
      {label ? <span className="text-[8px] uppercase leading-none tracking-wider text-faint">{label}</span> : null}
      <span className="font-mono text-[9px] leading-none text-dim">{text}</span>
    </div>
  );
}

/**
 * Two controls on one spindle, the way the GS3 puts Aux 1 over Aux 2: the
 * outer ring and the inner cap turn independently, and each takes focus of
 * its own.
 */
export function DualKnob({
  outer,
  inner,
  label,
  size = 48,
}: {
  outer: KnobProps & { name: string };
  inner: KnobProps & { name: string };
  label?: string;
  size?: number;
}) {
  const outerTurn = useTurn(outer);
  const innerTurn = useTurn(inner);
  const r = size / 2;
  const ao = angleOf(outer.value, outer.min, outer.max);
  const ai = angleOf(inner.value, inner.min, inner.max);
  const [ox, oy] = polar(r, r, r - 4, ao);
  const [ix, iy] = polar(r, r, r - 15, ai);
  const fmt = (p: KnobProps) => (p.format ? p.format(p.value) : `${Number(p.value.toFixed(2))}${p.unit ?? ""}`);

  return (
    <div className="flex flex-col items-center gap-0.5">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="touch-none">
        {/* Outer: the ring. */}
        <g
          role="slider"
          tabIndex={0}
          aria-label={outer.name}
          aria-valuemin={outer.min}
          aria-valuemax={outer.max}
          aria-valuenow={outer.value}
          aria-valuetext={fmt(outer)}
          className="cursor-ns-resize"
          {...outerTurn}
        >
          <path d={arc(r, r, r - 1.5, -SWEEP / 2, SWEEP / 2)} fill="none" stroke="var(--color-line)" strokeWidth={2.5} strokeLinecap="round" />
          <path d={arc(r, r, r - 1.5, -SWEEP / 2, ao)} fill="none" stroke={outer.color ?? "var(--color-info)"} strokeWidth={2.5} strokeLinecap="round" />
          <circle cx={r} cy={r} r={r - 5} fill="#1f2125" stroke="var(--color-line-strong)" />
          <line x1={r} y1={r} x2={ox} y2={oy} stroke={outer.color ?? "var(--color-info)"} strokeWidth={2} strokeLinecap="round" />
        </g>
        {/* Inner: the cap on the same spindle. */}
        <g
          role="slider"
          tabIndex={0}
          aria-label={inner.name}
          aria-valuemin={inner.min}
          aria-valuemax={inner.max}
          aria-valuenow={inner.value}
          aria-valuetext={fmt(inner)}
          className="cursor-ns-resize"
          {...innerTurn}
        >
          <circle cx={r} cy={r} r={r - 13} fill="#2b2e33" stroke="var(--color-line-strong)" />
          <line x1={r} y1={r} x2={ix} y2={iy} stroke={inner.color ?? "var(--color-ink)"} strokeWidth={1.75} strokeLinecap="round" />
        </g>
      </svg>
      {label ? <span className="text-[8px] uppercase leading-none tracking-wider text-faint">{label}</span> : null}
      <span className="font-mono text-[9px] leading-none text-dim">
        <span style={{ color: outer.color ?? "var(--color-info)" }}>{fmt(outer)}</span>
        <span className="text-faint"> / </span>
        {fmt(inner)}
      </span>
    </div>
  );
}

/** A console button: latching, lit when it is in. */
export function Switch({
  on,
  onChange,
  children,
  color = "var(--color-amber)",
  title,
  wide = false,
}: {
  on: boolean;
  onChange: (on: boolean) => void;
  children: ReactNode;
  color?: string;
  title?: string;
  wide?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      aria-pressed={on}
      title={title}
      className={`rounded-sm border px-1 py-[3px] text-[8.5px] font-semibold uppercase leading-none tracking-wider transition-colors ${
        wide ? "w-full" : ""
      }`}
      style={
        on
          ? { borderColor: color, background: `color-mix(in srgb, ${color} 25%, #1b1c1f)`, color }
          : { borderColor: "var(--color-line-strong)", background: "#1b1c1f", color: "var(--color-faint)" }
      }
    >
      {children}
    </button>
  );
}

/**
 * The travel of a real fader is not linear in dB: the top third holds a few
 * dB and the bottom third holds thirty, which is what puts unity about three
 * quarters of the way up. These anchors trace that law closely enough that
 * the printed scale and the cap agree with the desk.
 */
const TAPER: Array<[db: number, pos: number]> = [
  [10, 1],
  [5, 0.9],
  [0, 0.78],
  [-5, 0.67],
  [-10, 0.57],
  [-20, 0.42],
  [-30, 0.29],
  [-40, 0.18],
  [-50, 0.1],
  [-60, 0.04],
  [-70, 0],
];

/** Where a value sits on the travel, 0 at the bottom and 1 at the top. */
function faderPos(db: number): number {
  if (db >= 10) return 1;
  for (let i = 0; i < TAPER.length - 1; i++) {
    const [hiDb, hiPos] = TAPER[i]!;
    const [loDb, loPos] = TAPER[i + 1]!;
    if (db <= hiDb && db >= loDb) return loPos + ((db - loDb) / (hiDb - loDb)) * (hiPos - loPos);
  }
  return 0;
}

/** And back, for dragging: the cap follows the finger, not the decibels. */
function faderDb(pos: number): number {
  if (pos >= 1) return 10;
  for (let i = 0; i < TAPER.length - 1; i++) {
    const [hiDb, hiPos] = TAPER[i]!;
    const [loDb, loPos] = TAPER[i + 1]!;
    if (pos <= hiPos && pos >= loPos) return loDb + ((pos - loPos) / (hiPos - loPos)) * (hiDb - loDb);
  }
  return -70;
}

/**
 * A 100 mm fader. The scale is the desk's: +10 at the top, a long stretch
 * around 0 where the ear wants resolution, and off at the bottom.
 */
export function Fader({
  value,
  onChange,
  label,
  height = 120,
  off = -70,
}: {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  height?: number;
  off?: number;
}) {
  const width = 26;
  const top = 8;
  const travel = height - 16;
  const from = useRef<{ y: number; pos: number } | null>(null);
  const marks = [10, 5, 0, -5, -10, -20, -30, -50];
  const text = value <= off ? "−∞" : `${value > 0 ? "+" : ""}${Number(value.toFixed(1))}`;
  const y = top + travel * (1 - faderPos(value));

  const commit = (pos: number) => {
    const next = pos <= 0.005 ? off : Number(faderDb(clamp(pos, 0, 1)).toFixed(1));
    if (next !== value) onChange(next);
  };
  const onPointerDown = (e: ReactPointerEvent<SVGSVGElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    from.current = { y: e.clientY, pos: faderPos(value) };
  };
  const onPointerMove = (e: ReactPointerEvent<SVGSVGElement>) => {
    if (!from.current) return;
    commit(from.current.pos + (from.current.y - e.clientY) / travel);
  };
  const onPointerUp = (e: ReactPointerEvent<SVGSVGElement>) => {
    from.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
  };
  const onKeyDown = (e: React.KeyboardEvent<SVGSVGElement>) => {
    const by: Record<string, number> = { ArrowUp: 0.5, ArrowRight: 0.5, ArrowDown: -0.5, ArrowLeft: -0.5, PageUp: 5, PageDown: -5 };
    if (e.key in by) {
      e.preventDefault();
      const next = clamp(value + by[e.key]!, off, 10);
      if (next !== value) onChange(Number(next.toFixed(1)));
    } else if (e.key === "Home") {
      e.preventDefault();
      onChange(off);
    } else if (e.key === "End") {
      e.preventDefault();
      onChange(10);
    }
  };

  return (
    <div className="flex flex-col items-center gap-0.5">
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="cursor-ns-resize touch-none"
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={off}
        aria-valuemax={10}
        aria-valuenow={value}
        aria-valuetext={`${text} dB`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={onKeyDown}
      >
        {marks.map((m) => {
          const my = top + travel * (1 - faderPos(m));
          return (
            <g key={m}>
              <line x1={1} y1={my} x2={5} y2={my} stroke="var(--color-line-strong)" />
              <text x={7} y={my + 2.5} fontSize={6} fill="var(--color-faint)">
                {m > 0 ? `+${m}` : m}
              </text>
            </g>
          );
        })}
        {/* The slot, and the cap in it. */}
        <rect x={width / 2 - 2} y={top} width={4} height={travel} rx={2} fill="#141517" stroke="var(--color-line)" />
        <rect x={width / 2 - 9} y={y - 5} width={18} height={10} rx={2} fill="#2f3237" stroke="var(--color-line-strong)" />
        <line x1={width / 2 - 7} y1={y} x2={width / 2 + 7} y2={y} stroke="var(--color-ink)" strokeWidth={1.25} />
      </svg>
      {label ? <span className="text-[8px] uppercase leading-none tracking-wider text-faint">{label}</span> : null}
      <span className="font-mono text-[9px] leading-none text-dim">{text}</span>
    </div>
  );
}
