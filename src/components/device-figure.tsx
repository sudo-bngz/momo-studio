/**
 * A drawing of a machine, for when there is no photograph of it yet: a front
 * panel with the motif of its category — keys for a synth, pads for a drum
 * machine, two rows of jacks for a patchbay, a cone for a monitor. What the
 * app already knows shapes it: a rack device gets the proportions of its
 * height in U, a patchbay its real number of columns, a console its faders.
 *
 * It is a drawing, not a picture of your machine: upload a photo and this
 * steps aside.
 */
import { getI18n } from "@/lib/i18n";
import { categoryLabel, type Category } from "@/lib/vocab";

export interface Figure {
  category: Category;
  /** Rack height in U, when it is rack gear. */
  units?: number;
  /** Patchbay columns, console channels: makes the motif match the device. */
  columns?: number;
  code?: string;
}

/** Each category's panel colour and how wide the panel sits in the frame. */
const SKIN: Record<Category, { face: string; trim: string; motif: string }> = {
  synth: { face: "#2a2d33", trim: "#4b5058", motif: "#e9c46a" },
  expander: { face: "#26292e", trim: "#4b5058", motif: "#7aa7d9" },
  drum_machine: { face: "#2d2724", trim: "#5a4b42", motif: "#f4a261" },
  sampler: { face: "#2b2a26", trim: "#55524a", motif: "#f0e68c" },
  sequencer: { face: "#272b2e", trim: "#4b5058", motif: "#5ec8d8" },
  eurorack: { face: "#232528", trim: "#5a606a", motif: "#a78bfa" },
  effect: { face: "#2c2430", trim: "#5b4a63", motif: "#d4a5c7" },
  dynamics_eq: { face: "#262a2a", trim: "#4b5058", motif: "#8fc79a" },
  preamp: { face: "#2a2724", trim: "#55504a", motif: "#e9c46a" },
  audio_interface: { face: "#242729", trim: "#4b5058", motif: "#7aa7d9" },
  mixer: { face: "#2a2724", trim: "#55504a", motif: "#f2a541" },
  patchbay: { face: "#1f2124", trim: "#4b5058", motif: "#9a9ca3" },
  monitor: { face: "#242424", trim: "#4a4a4a", motif: "#bdbdbd" },
  headphones: { face: "#222426", trim: "#4b5058", motif: "#bdbdbd" },
  microphone: { face: "#232527", trim: "#4b5058", motif: "#bdbdbd" },
  controller: { face: "#282b30", trim: "#4b5058", motif: "#8fc79a" },
  computer: { face: "#26282b", trim: "#55595f", motif: "#7aa7d9" },
  midi_interface: { face: "#282529", trim: "#4b5058", motif: "#a78bfa" },
  power: { face: "#2a2426", trim: "#5b4446", motif: "#e76f51" },
  other: { face: "#26282b", trim: "#4b5058", motif: "#9a9ca3" },
};

/** Categories that live in a 19" rack: drawn wide and short. */
const RACK: Category[] = ["expander", "dynamics_eq", "preamp", "audio_interface", "patchbay", "midi_interface", "power"];

const W = 200;

export async function DeviceFigure({ figure, className = "", title }: { figure: Figure; className?: string; title?: string }) {
  const { t } = await getI18n();
  const { category, units, columns, code } = figure;
  const skin = SKIN[category] ?? SKIN.other;
  // Height follows the real thing: a 1U box is a letterbox, a synth is deeper.
  const h = RACK.includes(category) ? Math.round(26 * Math.max(1, Math.min(4, units ?? 1)) + 14) : category === "monitor" ? 150 : category === "microphone" ? 150 : 110;
  const pad = 8;

  return (
    <svg
      viewBox={`0 0 ${W} ${h}`}
      className={className}
      role="img"
      aria-label={title ?? t("assets.figure.alt", { category: categoryLabel(t, category) })}
      preserveAspectRatio="xMidYMid meet"
    >
      {title ? <title>{title}</title> : null}
      <rect x={2} y={2} width={W - 4} height={h - 4} rx={6} fill={skin.face} stroke={skin.trim} strokeWidth={2} />
      <Motif category={category} w={W} h={h} pad={pad} color={skin.motif} trim={skin.trim} columns={columns} />
      {code ? (
        <text x={W - pad} y={h - 7} fontSize={9} textAnchor="end" fill="#6b6e76" fontFamily="ui-monospace, monospace">
          {code}
        </text>
      ) : null}
    </svg>
  );
}

function Motif({
  category,
  w,
  h,
  pad,
  color,
  trim,
  columns,
}: {
  category: Category;
  w: number;
  h: number;
  pad: number;
  color: string;
  trim: string;
  columns?: number;
}) {
  const knob = (cx: number, cy: number, r = 5) => (
    <g key={`k${cx}-${cy}`}>
      <circle cx={cx} cy={cy} r={r} fill="#15171a" stroke={trim} />
      <line x1={cx} y1={cy} x2={cx} y2={cy - r + 1} stroke={color} strokeWidth={1.6} strokeLinecap="round" />
    </g>
  );
  const jack = (cx: number, cy: number, r = 4) => (
    <g key={`j${cx}-${cy}`}>
      <circle cx={cx} cy={cy} r={r} fill="#0c0d0e" stroke={trim} />
      <circle cx={cx} cy={cy} r={r * 0.35} fill={trim} />
    </g>
  );
  const row = (n: number, fn: (i: number, x: number) => React.ReactNode, y: number, from = pad + 10, to = w - pad - 10) =>
    Array.from({ length: n }, (_, i) => fn(i, from + ((to - from) * (n === 1 ? 0.5 : i / (n - 1)))));

  switch (category) {
    case "synth":
    case "controller": {
      // Knobs above, an octave of keys below.
      const keyTop = h - 46;
      const whites = 14;
      const kw = (w - pad * 2) / whites;
      return (
        <g>
          {row(5, (i, x) => knob(x, pad + 16), 0)}
          <rect x={pad} y={keyTop} width={w - pad * 2} height={38} fill="#e8e6e1" rx={2} />
          {Array.from({ length: whites - 1 }, (_, i) => (
            <line key={i} x1={pad + kw * (i + 1)} y1={keyTop} x2={pad + kw * (i + 1)} y2={keyTop + 38} stroke="#b9b6ae" />
          ))}
          {[0, 1, 3, 4, 5, 7, 8, 10, 11, 12].map((i) => (
            <rect key={i} x={pad + kw * (i + 1) - kw * 0.3} y={keyTop} width={kw * 0.6} height={23} fill="#17191c" rx={1} />
          ))}
          {category === "controller" ? row(4, (i, x) => <rect key={i} x={x - 9} y={pad + 34} width={18} height={13} rx={2} fill={color} opacity={0.75} />, 0) : null}
        </g>
      );
    }
    case "drum_machine":
    case "sampler": {
      // A screen and a grid of pads.
      const cols = 8;
      const padW = (w - pad * 2 - (cols - 1) * 4) / cols;
      return (
        <g>
          <rect x={pad} y={pad + 4} width={w * 0.34} height={20} rx={2} fill="#0d1a14" stroke={trim} />
          <line x1={pad + 5} y1={pad + 11} x2={pad + w * 0.24} y2={pad + 11} stroke={color} strokeWidth={1.5} />
          <line x1={pad + 5} y1={pad + 17} x2={pad + w * 0.16} y2={pad + 17} stroke={color} strokeWidth={1.5} opacity={0.6} />
          {row(3, (i, x) => knob(x, pad + 14), 0, w * 0.46, w - pad - 10)}
          {[0, 1].map((r) =>
            Array.from({ length: cols }, (_, c) => (
              <rect
                key={`${r}-${c}`}
                x={pad + c * (padW + 4)}
                y={h - 48 + r * (padW * 0.62 + 4)}
                width={padW}
                height={padW * 0.62}
                rx={2}
                fill={color}
                opacity={(r * cols + c) % 4 === 0 ? 0.85 : 0.3}
              />
            )),
          )}
        </g>
      );
    }
    case "sequencer": {
      const n = 16;
      const sw = (w - pad * 2 - (n - 1) * 2) / n;
      return (
        <g>
          {row(4, (i, x) => knob(x, pad + 16), 0)}
          {Array.from({ length: n }, (_, i) => (
            <rect key={i} x={pad + i * (sw + 2)} y={h - 40} width={sw} height={16} rx={1.5} fill={color} opacity={i % 4 === 0 ? 0.9 : 0.28} />
          ))}
          <rect x={pad} y={h - 20} width={w - pad * 2} height={8} rx={2} fill="#15171a" stroke={trim} />
        </g>
      );
    }
    case "eurorack": {
      // Module strips with patch points.
      const mods = [0.18, 0.14, 0.22, 0.16, 0.3];
      let x = pad;
      return (
        <g>
          {mods.map((frac, i) => {
            const mw = (w - pad * 2) * frac - 3;
            const g = (
              <g key={i}>
                <rect x={x} y={pad} width={mw} height={h - pad * 2} rx={2} fill="#1a1c1f" stroke={trim} />
                {knob(x + mw / 2, pad + 14, Math.min(5, mw / 4))}
                {jack(x + mw / 2, h - pad - 22, Math.min(4, mw / 5))}
                {jack(x + mw / 2, h - pad - 9, Math.min(4, mw / 5))}
              </g>
            );
            x += mw + 3;
            return g;
          })}
        </g>
      );
    }
    case "effect": {
      // A pedal: knobs, and a footswitch below.
      return (
        <g>
          {row(3, (i, x) => knob(x, pad + 22, 8), 0, pad + 26, w - pad - 26)}
          <rect x={w / 2 - 34} y={h - 44} width={68} height={22} rx={3} fill="#15171a" stroke={trim} />
          <circle cx={w / 2} cy={h - 16} r={8} fill={trim} />
          <circle cx={w / 2} cy={h - 16} r={4} fill={color} />
        </g>
      );
    }
    case "dynamics_eq":
    case "preamp": {
      // Rack face: a meter and a line of knobs.
      const cy = h / 2;
      return (
        <g>
          <rect x={pad} y={cy - 11} width={46} height={22} rx={2} fill="#1b1a14" stroke={trim} />
          <path d={`M${pad + 4},${cy + 7} Q${pad + 23},${cy - 9} ${pad + 42},${cy - 2}`} fill="none" stroke={color} strokeWidth={1.6} />
          {row(category === "preamp" ? 3 : 5, (i, x) => knob(x, cy, Math.min(7, h / 5)), 0, pad + 66, w - pad - 12)}
        </g>
      );
    }
    case "audio_interface": {
      const cy = h / 2;
      return (
        <g>
          {row(4, (i, x) => jack(x, cy, 5), 0, pad + 10, w * 0.45)}
          {row(6, (i, x) => (
            <rect key={i} x={x - 3} y={cy - 9} width={6} height={18} rx={1} fill={color} opacity={i < 3 ? 0.9 : 0.3} />
          ), 0, w * 0.56, w - pad - 28)}
          {knob(w - pad - 12, cy, Math.min(8, h / 4))}
        </g>
      );
    }
    case "patchbay": {
      // The real number of columns, two rows, as on the hardware.
      const n = Math.max(4, Math.min(24, columns ?? 24));
      const r = Math.min(4, (w - pad * 2) / (n * 2.6));
      const y1 = h / 2 - 9;
      const y2 = h / 2 + 9;
      return (
        <g>
          {Array.from({ length: n }, (_, i) => {
            const x = pad + 6 + ((w - pad * 2 - 12) * (n === 1 ? 0.5 : i / (n - 1)));
            return (
              <g key={i}>
                {jack(x, y1, r)}
                {jack(x, y2, r)}
              </g>
            );
          })}
        </g>
      );
    }
    case "mixer": {
      // Channel strips: a knob and a fader each.
      const n = Math.max(4, Math.min(12, columns ? Math.min(12, columns) : 8));
      const sw = (w - pad * 2) / n;
      return (
        <g>
          {Array.from({ length: n }, (_, i) => {
            const x = pad + sw * (i + 0.5);
            return (
              <g key={i}>
                {knob(x, pad + 12, Math.min(4.5, sw / 3))}
                <rect x={x - 1.5} y={h - 48} width={3} height={32} rx={1.5} fill="#15171a" stroke={trim} strokeWidth={0.8} />
                <rect x={x - 5} y={h - 44 + (i % 4) * 5} width={10} height={6} rx={1.5} fill={color} opacity={0.85} />
              </g>
            );
          })}
        </g>
      );
    }
    case "monitor": {
      const cx = w / 2;
      return (
        <g>
          <circle cx={cx} cy={h * 0.58} r={Math.min(w, h) * 0.26} fill="#17191c" stroke={trim} strokeWidth={2} />
          <circle cx={cx} cy={h * 0.58} r={Math.min(w, h) * 0.1} fill={trim} />
          <circle cx={cx} cy={h * 0.24} r={Math.min(w, h) * 0.1} fill="#17191c" stroke={trim} strokeWidth={2} />
          <circle cx={cx} cy={h * 0.24} r={Math.min(w, h) * 0.04} fill={color} opacity={0.6} />
        </g>
      );
    }
    case "headphones": {
      const cx = w / 2;
      return (
        <g fill="none" stroke={trim} strokeWidth={5}>
          <path d={`M${cx - 42},${h * 0.56} A42,42 0 0 1 ${cx + 42},${h * 0.56}`} strokeLinecap="round" />
          <rect x={cx - 54} y={h * 0.54} width={22} height={34} rx={8} fill="#17191c" />
          <rect x={cx + 32} y={h * 0.54} width={22} height={34} rx={8} fill="#17191c" />
        </g>
      );
    }
    case "microphone": {
      const cx = w / 2;
      return (
        <g>
          <rect x={cx - 17} y={h * 0.12} width={34} height={52} rx={17} fill="#17191c" stroke={trim} strokeWidth={2} />
          {Array.from({ length: 5 }, (_, i) => (
            <line key={i} x1={cx - 12} y1={h * 0.12 + 12 + i * 8} x2={cx + 12} y2={h * 0.12 + 12 + i * 8} stroke={trim} strokeWidth={1.2} />
          ))}
          <rect x={cx - 6} y={h * 0.12 + 52} width={12} height={22} fill={trim} />
          <path d={`M${cx - 20},${h - 18} h40`} stroke={trim} strokeWidth={4} strokeLinecap="round" />
          <path d={`M${cx},${h * 0.12 + 74} v${h - 18 - (h * 0.12 + 74)}`} stroke={trim} strokeWidth={4} />
        </g>
      );
    }
    case "computer": {
      return (
        <g>
          <rect x={pad + 8} y={pad + 6} width={w - pad * 2 - 16} height={h - pad * 2 - 26} rx={4} fill="#0f1114" stroke={trim} strokeWidth={2} />
          <rect x={pad + 16} y={pad + 14} width={(w - pad * 2 - 32) * 0.55} height={5} rx={2.5} fill={color} opacity={0.7} />
          <rect x={pad + 16} y={pad + 24} width={(w - pad * 2 - 32) * 0.3} height={5} rx={2.5} fill={color} opacity={0.35} />
          <rect x={w / 2 - 30} y={h - pad - 14} width={60} height={6} rx={3} fill={trim} />
        </g>
      );
    }
    case "midi_interface": {
      const cy = h / 2;
      return (
        <g>
          {row(5, (i, x) => (
            <g key={i}>
              <circle cx={x} cy={cy} r={Math.min(9, h / 3.2)} fill="#0c0d0e" stroke={trim} strokeWidth={1.5} />
              {[-60, -20, 20, 60, 180].map((a) => (
                <circle
                  key={a}
                  cx={x + Math.cos(((a - 90) * Math.PI) / 180) * 4.2}
                  cy={cy + Math.sin(((a - 90) * Math.PI) / 180) * 4.2}
                  r={1.2}
                  fill={color}
                />
              ))}
            </g>
          ), 0)}
        </g>
      );
    }
    case "power": {
      const cy = h / 2;
      return (
        <g>
          {row(6, (i, x) => (
            <g key={i}>
              <circle cx={x} cy={cy} r={Math.min(8, h / 3.4)} fill="#0c0d0e" stroke={trim} strokeWidth={1.5} />
              <circle cx={x - 2.6} cy={cy} r={1.3} fill={trim} />
              <circle cx={x + 2.6} cy={cy} r={1.3} fill={trim} />
            </g>
          ), 0)}
          <rect x={w - pad - 16} y={cy - 7} width={12} height={14} rx={2} fill={color} opacity={0.8} />
        </g>
      );
    }
    default: {
      // A plain box with a couple of controls, for anything else.
      const cy = h / 2;
      return (
        <g>
          {row(3, (i, x) => knob(x, cy, Math.min(7, h / 5)), 0, pad + 20, w * 0.6)}
          {jack(w - pad - 34, cy, 5)}
          {jack(w - pad - 16, cy, 5)}
        </g>
      );
    }
  }
}
