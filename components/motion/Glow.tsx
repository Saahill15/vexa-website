import type { CSSProperties } from "react";

type Props = { className?: string; style?: CSSProperties; tone?: "teal" | "mint" | "deep" };

/** Soft, slowly drifting light behind a section (the reference's ambient "Glow" layers). */
export function Glow({ className = "", style, tone = "teal" }: Props) {
  return <span aria-hidden="true" className={`glow glow--${tone} ${className}`} style={style} />;
}
