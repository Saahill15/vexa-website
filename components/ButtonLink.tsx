import Link from "next/link";

type Props = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  external?: boolean;
};

const focus =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-vx-accent-500";

export function ButtonLink({
  href,
  children,
  variant = "primary",
  external = false,
}: Props): React.ReactElement {
  if (variant === "secondary") {
    const className = `rounded-sm text-sm font-medium text-vx-accent-600 underline-offset-4 transition-colors duration-base ease-vx-out hover:text-vx-accent-500 hover:underline ${focus}`;
    if (external) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }

  const className = `inline-flex items-center justify-center rounded-pill bg-vx-accent-500 px-5 py-3 text-sm font-medium text-white transition-[colors,transform] duration-base ease-vx-out hover:bg-vx-accent-600 active:scale-[0.97] ${focus}`;
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
