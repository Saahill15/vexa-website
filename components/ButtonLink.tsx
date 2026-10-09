import Link from "next/link";

type Props = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "text";
  className?: string;
};

export const primaryButton =
  "group inline-flex gap-3 min-h-[48px] items-center justify-center rounded-sm border border-vx-accent-deep bg-vx-accent-500 px-6 py-3 font-text text-body font-medium text-vx-ink transition-colors duration-fast hover:bg-vx-accent-600 active:translate-y-px";

export const textLink =
  "group inline-flex min-h-[44px] items-center gap-2 rounded-sm font-text text-body font-medium text-vx-ink underline decoration-vx-hair decoration-1 underline-offset-[6px] transition-colors duration-fast hover:decoration-vx-peacock-blue hover:decoration-2";

export function Arrow(): React.ReactElement {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4 transition-transform duration-fast group-hover:translate-x-0.5" aria-hidden="true" focusable="false">
      <path d="M2 8h11M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function ButtonLink({ href, children, variant = "primary", className = "" }: Props): React.ReactElement {
  if (variant === "text") {
    return (
      <Link href={href} className={`${textLink} ${className}`}>
        {children}
        <Arrow />
      </Link>
    );
  }
  return (
    <Link href={href} className={`${primaryButton} ${className}`}>
      {children}
    </Link>
  );
}
