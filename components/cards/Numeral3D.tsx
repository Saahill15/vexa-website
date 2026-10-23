import { useId } from "react";

type Props = { value: string; tone?: "teal" | "ink" | "mint" };

const TONES = {
  teal: { deep: "var(--midnight)", mid: "var(--teal)", light: "var(--mist)", rim: "#ffffff" },
  ink: { deep: "var(--num-ink-deep)", mid: "var(--deep)", light: "var(--num-ink-light)", rim: "#ffffff" },
  mint: { deep: "var(--deep)", mid: "var(--aqua)", light: "#ffffff", rim: "#ffffff" },
};

/** A chrome-like extruded numeral that rises out of a folder card on hover. */
export function Numeral3D({ value, tone = "teal" }: Props) {
  const id = useId().replace(/:/g, "");
  const c = TONES[tone];
  const depth = 12;
  const font = { fontFamily: "var(--font-sans), sans-serif", fontWeight: 700, fontSize: 176, letterSpacing: "-0.06em" } as const;

  return (
    <svg viewBox="0 0 240 240" width="240" height="240" aria-hidden="true" className="num3d">
      <defs>
        <linearGradient id={`face-${id}`} x1="0" y1="0" x2="0.9" y2="1">
          <stop offset="0" style={{ stopColor: c.light }} />
          <stop offset="0.34" style={{ stopColor: c.mid }} />
          <stop offset="0.52" style={{ stopColor: c.deep }} />
          <stop offset="0.66" style={{ stopColor: c.mid }} />
          <stop offset="1" style={{ stopColor: c.light }} />
        </linearGradient>
        <linearGradient id={`side-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" style={{ stopColor: c.mid }} />
          <stop offset="1" style={{ stopColor: c.deep }} />
        </linearGradient>
        <linearGradient id={`gloss-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.85" />
          <stop offset="0.45" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <filter id={`shadow-${id}`} x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="18" stdDeviation="14" style={{ floodColor: c.deep }} floodOpacity="0.45" />
        </filter>
      </defs>
      <g filter={`url(#shadow-${id})`}>
        {/* extrusion: stacked copies offset down and to the right */}
        {Array.from({ length: depth }, (_, i) => (
          <text key={i} x={120 + (depth - i) * 0.9} y={182 + (depth - i) * 0.9} textAnchor="middle" fill={`url(#side-${id})`} style={font}>
            {value}
          </text>
        ))}
        {/* face */}
        <text x="120" y="182" textAnchor="middle" fill={`url(#face-${id})`} stroke={c.rim} strokeOpacity="0.9" strokeWidth="1.6" style={font}>
          {value}
        </text>
        {/* gloss on the upper half */}
        <text x="120" y="182" textAnchor="middle" fill={`url(#gloss-${id})`} style={font}>
          {value}
        </text>
      </g>
    </svg>
  );
}
