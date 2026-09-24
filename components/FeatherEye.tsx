type Props = {
  className?: string;
};

// Leaf shaped outline that follows the curve of the V in the VEXA logo: a pointed tip
// that leans right and a full, rounded base. Every ring of the eye reuses this shape.
const LEAF = "M13 1 C 17 7, 19.5 13, 18.5 19 C 17.5 24.5, 13.5 27, 10 27 C 5.5 27, 2 23.5, 2 19 C 2 12, 7 6, 13 1 Z";

/**
 * Peacock feather eye: concentric leaf shaped rings in feather gold, peacock teal and
 * peacock blue. Decorative only. Use at most twice on a page (see BRAND_COLOURS.md).
 */
export function FeatherEye({ className = "h-7 w-5" }: Props): React.ReactElement {
  return (
    <svg viewBox="0 0 20 28" className={className} aria-hidden="true" focusable="false">
      <path d={LEAF} fill="none" stroke="#C9A227" strokeWidth="1.25" />
      <path d={LEAF} fill="#0F7B6C" transform="translate(10.4 19.6) scale(0.68) translate(-10.4 -19.6)" />
      <path d={LEAF} fill="#0B4F6C" transform="translate(10.4 20.2) scale(0.4) translate(-10.4 -20.2)" />
      <ellipse cx="10.4" cy="20.6" rx="1.2" ry="1.6" fill="#C9A227" />
    </svg>
  );
}
