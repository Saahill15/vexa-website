type Props = {
  eyebrow?: string;
  title: string;
  children?: React.ReactNode;
  segment?: string;
};

export function PageIntro({ eyebrow, title, children, segment }: Props): React.ReactElement {
  return (
    <header data-segment={segment} className="mx-auto max-w-3xl px-5 pb-10 pt-14 md:px-8 md:pt-20">
      {eyebrow ? (
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-vx-accent-600">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="font-display text-4xl font-semibold tracking-tighter text-vx-ink-900 md:text-5xl">
        {title}
      </h1>
      {children ? <div className="mt-5 space-y-4 text-base leading-relaxed text-vx-neutral-600 md:text-lg">{children}</div> : null}
    </header>
  );
}
