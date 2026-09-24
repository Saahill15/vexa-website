export function SkipToContent(): React.ReactElement {
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-pill focus:bg-vx-accent-500 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-vx-charcoal-950"
    >
      Skip to content
    </a>
  );
}
