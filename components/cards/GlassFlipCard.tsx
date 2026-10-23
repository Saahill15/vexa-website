"use client";

import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";

/*
 * Liquid-glass flip card, rebuilt to match the reference element:
 * - glass: backdrop blur + an SVG displacement field that bends the scene behind the edges,
 *   with red/green/blue displaced by slightly different amounts (chromatic split)
 * - rim: inset highlights on each edge, a conic edge light and a faint iridescent ring
 * - flip: the card tilts to about -12deg, the content swaps while a band of light sweeps
 *   across, then it springs back through +11deg and settles (about 1.1s in total)
 */

const W = 340;
const H = 440;
const RADIUS = 32;
const BEZEL = 34; // how far in from the edge the glass bends light
const SCALE = 44.16; // displacement strength (red); green and blue are slightly stronger

/** Builds the displacement field: vectors pointing inward, strongest at the rounded edges. */
function buildField(w: number, h: number, r: number, bezel: number): string {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  const img = ctx.createImageData(w, h);
  const hw = w / 2;
  const hh = h / 2;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      // signed distance from the rounded-rectangle edge (positive inside) and the inward normal
      const px = x + 0.5 - hw;
      const py = y + 0.5 - hh;
      const qx = Math.abs(px) - (hw - r);
      const qy = Math.abs(py) - (hh - r);
      let dist: number;
      let nx = 0;
      let ny = 0;
      if (qx > 0 && qy > 0) {
        const len = Math.hypot(qx, qy) || 1;
        dist = r - len;
        nx = -Math.sign(px) * (qx / len);
        ny = -Math.sign(py) * (qy / len);
      } else if (qx > qy) {
        dist = r - qx;
        nx = -Math.sign(px);
      } else {
        dist = r - qy;
        ny = -Math.sign(py);
      }
      const t = Math.max(0, Math.min(1, 1 - dist / bezel));
      const strength = t * t * (3 - 2 * t); // smooth falloff into the card
      const i = (y * w + x) * 4;
      img.data[i] = 128 + nx * strength * 127;
      img.data[i + 1] = 128 + ny * strength * 127;
      img.data[i + 2] = 128;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return canvas.toDataURL("image/png");
}

function FlipIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12a9 9 0 0 0-15.5-6.2L3 8" />
      <path d="M3 3v5h5" />
      <path d="M3 12a9 9 0 0 0 15.5 6.2L21 16" />
      <path d="M21 21v-5h-5" />
    </svg>
  );
}

type Props = {
  chip: string;
  /** Front: shown first. */
  front: ReactNode;
  /** Back: shown on hover (or when the flip button is pressed). */
  back: ReactNode;
  label: string;
};

export function GlassFlipCard({ chip, front, back, label }: Props) {
  const filterId = `lg-${useId().replace(/:/g, "")}`;
  const [field, setField] = useState("");
  const [chromium, setChromium] = useState(false);
  const [face, setFace] = useState<"front" | "back">("front");
  const target = useRef<"front" | "back">("front");
  const busy = useRef(false);
  const reduce = useReducedMotion();

  const rotateY = useMotionValue(0);
  const scale = useMotionValue(1);
  const sheen = useMotionValue(0);
  const sheenX = useTransform(rotateY, [-12, 0, 12], ["-35%", "0%", "35%"]);

  useEffect(() => {
    setField(buildField(W, H, RADIUS, BEZEL));
    // SVG filters inside backdrop-filter only work in Chromium-based browsers
    setChromium(/Chrome|Chromium|Edg\//.test(navigator.userAgent) && !/Firefox/.test(navigator.userAgent));
  }, []);

  async function flipTo(next: "front" | "back") {
    target.current = next;
    if (busy.current) return;
    busy.current = true;
    while (true) {
      const goal = target.current;
      const current = faceRef.current;
      if (goal === current) break;
      if (reduce) {
        setFaceBoth(goal);
        continue;
      }
      // 1. tilt away, with a little press-in and the light starting to cross
      await Promise.all([
        animate(rotateY, -12, { duration: 0.42, ease: [0.45, 0, 0.55, 1] }),
        animate(scale, 0.99, { duration: 0.42, ease: [0.45, 0, 0.55, 1] }),
        animate(sheen, 0.22, { duration: 0.42, ease: "easeIn" }),
      ]);
      // 2. swing through centre; the content swaps as it passes edge-on
      sheen.set(0);
      setFaceBoth(goal);
      await animate(rotateY, 11, { duration: 0.15, ease: "easeOut" });
      // 3. spring back and settle
      animate(sheen, [0.2, 0], { duration: 0.32, ease: "easeOut" });
      animate(scale, 1, { type: "spring", stiffness: 170, damping: 16 });
      await animate(rotateY, 0, { type: "spring", stiffness: 170, damping: 16 });
    }
    busy.current = false;
  }

  const faceRef = useRef<"front" | "back">("front");
  function setFaceBoth(f: "front" | "back") {
    faceRef.current = f;
    setFace(f);
  }

  const glassFilter = chromium && field
    ? `blur(8px) url(#${filterId}) saturate(1.45) brightness(1.02)`
    : "blur(8px) saturate(1.45) brightness(1.02)";

  return (
    <div
      className="lgc"
      onPointerEnter={(e) => e.pointerType === "mouse" && flipTo("back")}
      onPointerLeave={(e) => e.pointerType === "mouse" && flipTo("front")}
    >
      {field ? (
        <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
          <filter id={filterId} x="0" y="0" width={W} height={H} filterUnits="userSpaceOnUse" primitiveUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feImage href={field} x="0" y="0" width={W} height={H} preserveAspectRatio="none" result="field" />
            <feDisplacementMap in="SourceGraphic" in2="field" scale={SCALE} xChannelSelector="R" yChannelSelector="G" result="bentR" />
            <feColorMatrix in="bentR" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="red" />
            <feDisplacementMap in="SourceGraphic" in2="field" scale={SCALE * 1.04235} xChannelSelector="R" yChannelSelector="G" result="bentG" />
            <feColorMatrix in="bentG" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="green" />
            <feDisplacementMap in="SourceGraphic" in2="field" scale={SCALE * 1.0847} xChannelSelector="R" yChannelSelector="G" result="bentB" />
            <feColorMatrix in="bentB" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="blue" />
            <feComposite in="red" in2="green" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="rg" />
            <feComposite in="rg" in2="blue" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" />
          </filter>
        </svg>
      ) : null}

      <motion.div
        className="lgc-card"
        style={{ rotateY, scale, transformPerspective: 1054 }}
        role="group"
        aria-label={label}
      >
        <div className="lgc-glass" style={{ backdropFilter: glassFilter, WebkitBackdropFilter: "blur(8px) saturate(1.45) brightness(1.02)" }} />
        <div className="lgc-rim" />
        <div className="lgc-edge" />
        <div className="lgc-iris" />
        <motion.div className="lgc-sheen" style={{ opacity: sheen, x: sheenX }} />

        <div className="lgc-content">
          <div className="lgc-top">
            <span className="lgc-chip">{chip}</span>
            <button
              type="button"
              className="lgc-flip"
              aria-label={face === "front" ? "Show details" : "Show front"}
              aria-pressed={face === "back"}
              onClick={() => flipTo(face === "front" ? "back" : "front")}
            >
              <FlipIcon />
            </button>
          </div>
          <div className="lgc-face" aria-live="polite">
            {face === "front" ? front : back}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
