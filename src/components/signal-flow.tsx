/**
 * The three drawings the guide needs to explain the wiring: one channel of an
 * in-line desk from socket to socket, how its eight group buses land on the
 * channels' track outs, and what a patchbay column's three modes actually do.
 *
 * Plain SVG, sized by its container, colours from the theme so they follow the
 * rest of the app.
 */
const INK = "var(--color-ink)";
const DIM = "var(--color-dim)";
const FAINT = "var(--color-faint)";
const LINE = "var(--color-line-strong)";
const PANEL = "var(--color-raised)";
const AMBER = "var(--color-amber)";
const INFO = "var(--color-info)";

function Box({
  x,
  y,
  w,
  h,
  label,
  sub,
  accent,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  sub?: string;
  accent?: string;
}) {
  const cx = x + w / 2;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={4} fill={PANEL} stroke={accent ?? LINE} strokeWidth={1} />
      <text x={cx} y={sub ? y + h / 2 - 2 : y + h / 2 + 4} textAnchor="middle" fontSize={11} fill={accent ?? INK}>
        {label}
      </text>
      {sub ? (
        <text x={cx} y={y + h / 2 + 11} textAnchor="middle" fontSize={8.5} fill={FAINT}>
          {sub}
        </text>
      ) : null}
    </g>
  );
}

/** One channel of a GS3: both its paths, the insert, and the four ways out. */
export function ChannelStripFlow() {
  // Each way out of the channel, with the socket it actually leaves by.
  const outs = [
    { cy: 20, label: "Direct out", sub: "→ Ch n Track Out", accent: AMBER },
    { cy: 64, label: "Group 1–8", sub: "→ track outs of channels g, g+8, g+16", accent: AMBER },
    { cy: 108, label: "Mix L/R", sub: "→ Mix Out L / Mix Out R", accent: AMBER },
    { cy: 152, label: "Aux 1–4", sub: "post-fade → Aux n Out", accent: AMBER },
  ];
  return (
    <svg viewBox="0 0 700 252" className="w-full" role="img" aria-label="One in-line console channel: mic and line inputs through the preamp, insert, EQ and fader, leaving by the direct out, a group, the mix or an aux; and the tape return on its own monitor path.">
      <defs>
        <marker id="sf-arrow" viewBox="0 0 8 8" refX={7} refY={4} markerWidth={6} markerHeight={6} orient="auto">
          <path d="M0 0.5 L8 4 L0 7.5 z" fill={LINE} />
        </marker>
        <marker id="sf-arrow-amber" viewBox="0 0 8 8" refX={7} refY={4} markerWidth={6} markerHeight={6} orient="auto">
          <path d="M0 0.5 L8 4 L0 7.5 z" fill={AMBER} />
        </marker>
        <marker id="sf-arrow-info" viewBox="0 0 8 8" refX={7} refY={4} markerWidth={6} markerHeight={6} orient="auto">
          <path d="M0 0.5 L8 4 L0 7.5 z" fill={INFO} />
        </marker>
      </defs>

      <text x={6} y={16} fontSize={9} fill={FAINT} letterSpacing={0.6}>
        CHANNEL PATH
      </text>

      {/* Inputs, merging into the one channel path. */}
      <Box x={6} y={33} w={66} h={30} label="Mic" sub="XLR" />
      <Box x={6} y={89} w={66} h={30} label="Line" sub="jack" />
      <path d="M72 48 H84 V76" fill="none" stroke={LINE} />
      <path d="M72 104 H84 V76" fill="none" stroke={LINE} />
      <path d="M84 76 H96" fill="none" stroke={LINE} markerEnd="url(#sf-arrow)" />

      <Box x={96} y={61} w={72} h={30} label="Preamp" />
      <path d="M168 76 H192" fill="none" stroke={LINE} markerEnd="url(#sf-arrow)" />
      <Box x={192} y={61} w={72} h={30} label="Insert" sub="pre-EQ" accent={INFO} />
      <path d="M264 76 H288" fill="none" stroke={LINE} markerEnd="url(#sf-arrow)" />
      <Box x={288} y={61} w={52} h={30} label="EQ" />
      <path d="M340 76 H364" fill="none" stroke={LINE} markerEnd="url(#sf-arrow)" />
      <Box x={364} y={61} w={52} h={30} label="Fader" />

      {/* The insert's outboard, on one TRS jack: tip out, ring back. */}
      <path d="M210 91 V120" fill="none" stroke={INFO} strokeDasharray="3 3" markerEnd="url(#sf-arrow-info)" />
      <path d="M246 120 V91" fill="none" stroke={INFO} strokeDasharray="3 3" markerEnd="url(#sf-arrow-info)" />
      <text x={204} y={107} textAnchor="end" fontSize={8} fill={INFO}>
        tip
      </text>
      <text x={252} y={107} fontSize={8} fill={INFO}>
        ring
      </text>
      <Box x={180} y={120} w={96} h={30} label="Outboard" sub="comp, EQ, pedal" accent={INFO} />

      {/* The four ways out. */}
      <path d="M416 76 H441" fill="none" stroke={AMBER} />
      <path d={`M441 ${outs[0]!.cy} V${outs[3]!.cy}`} fill="none" stroke={AMBER} />
      {outs.map((o) => (
        <g key={o.label}>
          <path d={`M441 ${o.cy} H466`} fill="none" stroke={AMBER} markerEnd="url(#sf-arrow-amber)" />
          <Box x={466} y={o.cy - 17} w={200} h={34} label={o.label} sub={o.sub} accent={o.accent} />
        </g>
      ))}

      {/* The monitor path, which is why every channel has a tape return. */}
      <text x={6} y={205} fontSize={9} fill={FAINT} letterSpacing={0.6}>
        MONITOR PATH
      </text>
      <Box x={6} y={213} w={66} h={30} label="Tape In" sub="track return" />
      <path d="M72 228 H96" fill="none" stroke={LINE} markerEnd="url(#sf-arrow)" />
      <Box x={96} y={213} w={96} h={30} label="Monitor level" />
      <path d="M192 228 H216" fill="none" stroke={LINE} markerEnd="url(#sf-arrow)" />
      <Box x={216} y={213} w={120} h={30} label="Cue / monitors" />
      <text x={350} y={232} fontSize={9} fill={FAINT}>
        Auxes 3 and 4 can be switched to follow this path instead.
      </text>
    </svg>
  );
}

/** Group g comes out of the track outs of channels g, g+8, g+16. */
export function InlineGroups({ channels = 24, groups = 8 }: { channels?: number; groups?: number }) {
  const cell = 26;
  const pad = 8;
  const cx = (i: number) => pad + i * cell + (cell - 4) / 2;
  const lane = (g: number) => {
    const at: number[] = [];
    for (let n = g; n <= channels; n += groups) at.push(n);
    return at;
  };
  const one = lane(1);
  const two = lane(2);
  const width = pad * 2 + channels * cell + 92;
  return (
    <svg viewBox={`0 0 ${width} 122`} className="w-full" role="img" aria-label={`The ${channels} track-out sockets, with group 1 landing on channels ${one.join(", ")} and group 2 on ${two.join(", ")}.`}>
      {/* Group 2, bracketed above the row. */}
      {two.map((n) => (
        <path key={n} d={`M${cx(n - 1)} 44 V24`} fill="none" stroke={INFO} />
      ))}
      <path d={`M${cx(two[0]! - 1)} 24 H${cx(two[two.length - 1]! - 1)}`} fill="none" stroke={INFO} />
      <text x={cx(two[two.length - 1]! - 1) + 8} y={28} fontSize={11} fill={INFO}>
        Group 2
      </text>

      {/* The track-out sockets. */}
      {Array.from({ length: channels }, (_, i) => {
        const n = i + 1;
        const accent = one.includes(n) ? AMBER : two.includes(n) ? INFO : undefined;
        return (
          <g key={n}>
            <rect
              x={pad + i * cell}
              y={44}
              width={cell - 4}
              height={26}
              rx={3}
              fill={accent ? `color-mix(in srgb, ${accent} 18%, ${PANEL})` : PANEL}
              stroke={accent ?? LINE}
            />
            <circle cx={cx(i)} cy={53} r={3.5} fill="none" stroke={accent ?? DIM} />
            <text x={cx(i)} y={67} textAnchor="middle" fontSize={8} fill={accent ?? FAINT}>
              {n}
            </text>
          </g>
        );
      })}
      <text x={pad} y={38} fontSize={9} fill={FAINT} letterSpacing={0.6}>
        TRACK OUT SOCKETS, CHANNELS 1–{channels}
      </text>

      {/* Group 1, bracketed below. */}
      {one.map((n) => (
        <path key={n} d={`M${cx(n - 1)} 70 V96`} fill="none" stroke={AMBER} />
      ))}
      <path d={`M${cx(one[0]! - 1)} 96 H${cx(one[one.length - 1]! - 1)}`} fill="none" stroke={AMBER} />
      <text x={cx(one[one.length - 1]! - 1) + 8} y={100} fontSize={11} fill={AMBER}>
        Group 1
      </text>
      <text x={pad} y={117} fontSize={9} fill={FAINT}>
        Each socket carries its own channel&apos;s direct out, or the group it is switched to — never both at once.
      </text>
    </svg>
  );
}

/** What normal, half-normal and thru do to a column's two points. */
export function Normalling() {
  const modes = [
    { title: "Normal", color: "var(--color-ok)", link: true, copy: false, note: "Either front jack breaks the link." },
    { title: "Half-normal", color: "var(--color-warn)", link: true, copy: true, note: "The top jack takes a copy. Only the bottom jack breaks it." },
    { title: "Thru", color: INFO, link: false, copy: false, note: "Not joined. Patch it with a cord." },
  ];
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {modes.map((m) => (
        <figure key={m.title} className="rounded-lg border border-line bg-panel p-3">
          <svg viewBox="0 0 200 116" className="w-full" role="img" aria-label={`${m.title}: ${m.note}`}>
            {/* Rear points on the left, front jacks on the right. */}
            <text x={2} y={10} fontSize={8} fill={FAINT} letterSpacing={0.5}>
              REAR
            </text>
            <text x={198} y={10} textAnchor="end" fontSize={8} fill={FAINT} letterSpacing={0.5}>
              FRONT
            </text>

            {[
              { y: 34, name: "Top" },
              { y: 86, name: "Bottom" },
            ].map((row) => (
              <g key={row.name}>
                <circle cx={14} cy={row.y} r={4} fill="none" stroke={DIM} />
                <text x={24} y={row.y - 7} fontSize={9} fill={DIM}>
                  {row.name}
                </text>
                <path d={`M18 ${row.y} H168`} fill="none" stroke={LINE} />
                <circle cx={176} cy={row.y} r={7} fill="none" stroke={DIM} />
                <circle cx={176} cy={row.y} r={2.5} fill={DIM} />
              </g>
            ))}

            {/* The link between the two points, and what breaks it. */}
            {m.link ? (
              <>
                <path d="M100 34 V52" fill="none" stroke={m.color} />
                <path d="M100 68 V86" fill="none" stroke={m.color} />
                {m.copy ? (
                  <path d="M100 52 V68" fill="none" stroke={m.color} />
                ) : (
                  <path d="M94 54 L106 66 M94 66 L106 54" fill="none" stroke={m.color} strokeWidth={1.2} />
                )}
                <text x={110} y={63} fontSize={8.5} fill={m.color}>
                  {m.copy ? "stays joined" : "breaks"}
                </text>
                <circle cx={100} cy={34} r={2.5} fill={m.color} />
                <circle cx={100} cy={86} r={2.5} fill={m.color} />
              </>
            ) : (
              <text x={70} y={63} fontSize={8.5} fill={m.color}>
                no link
              </text>
            )}

            {m.copy ? (
              <>
                <path d="M100 34 H150" fill="none" stroke={m.color} strokeDasharray="2 2" />
                <text x={104} y={27} fontSize={8} fill={FAINT}>
                  copy
                </text>
              </>
            ) : null}
          </svg>
          <figcaption className="mt-2">
            <span className="text-sm font-medium" style={{ color: m.color }}>
              {m.title}
            </span>
            <span className="mt-0.5 block text-xs leading-relaxed text-dim">{m.note}</span>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
