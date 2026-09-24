type Props = {
  className?: string;
};

/**
 * The peacock feather eye, the site's one motif (DESIGN.md section 9). Decorative only.
 * Use at most twice on a page: the hero aside or footer, plus one section at most.
 * Size it with width classes; the viewBox keeps the 2:3 ratio.
 */
export function FeatherEye({ className = "w-10" }: Props): React.ReactElement {
  return (
    <svg viewBox="0 0 64 96" className={`h-auto ${className}`} aria-hidden="true" focusable="false">
      <path d="M32 95 V10" stroke="#17140F" strokeWidth="1" fill="none" />
      <path d="M32 6 C13 22 9 50 32 88 C55 50 51 22 32 6 Z" stroke="#0F7B6C" strokeWidth="1" fill="none" />
      <ellipse cx="32" cy="36" rx="14" ry="17" fill="none" stroke="#C9A227" strokeWidth="1.5" />
      <ellipse cx="32" cy="37" rx="10" ry="12.5" fill="#0F7B6C" />
      <ellipse cx="32" cy="39" rx="5.5" ry="7" fill="#0B4F6C" />
    </svg>
  );
}
