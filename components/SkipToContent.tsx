export function SkipToContent(): React.ReactElement {
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-sm focus:border focus:border-vx-accent-deep focus:bg-vx-accent-500 focus:px-4 focus:py-3 focus:font-text focus:text-small focus:font-medium focus:text-vx-ink"
    >
      Skip to content
    </a>
  );
}
