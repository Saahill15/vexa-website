import Image from "next/image";
import Link from "next/link";

const linkClass =
  "rounded-sm transition-colors duration-base ease-vx-out hover:text-vx-ink-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-vx-accent-500";

export function Footer(): React.ReactElement {
  return (
    <footer className="border-t border-vx-neutral-200 bg-vx-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 md:grid-cols-[1fr_auto] md:px-8">
        <div className="space-y-3">
          <Image
            src="/brand/vexa-vmark.png"
            alt="VEXA"
            width={36}
            height={36}
            className="h-9 w-9"
          />
          <p className="max-w-sm text-sm text-vx-neutral-600">
            Sponsorship sales for gaming and youth rights holders. Measured pilot campaigns for
            brands reaching gamers 16 to 28.
          </p>
          <p className="text-sm text-vx-neutral-600">
            <a className={`${linkClass} hover:text-vx-accent-600`} href="tel:+919958895505">
              +91 9958895505
            </a>
            {" · "}
            <a className={`${linkClass} hover:text-vx-accent-600`} href="mailto:partnerships@vexadigital.in">
              partnerships@vexadigital.in
            </a>
          </p>
          <p className="max-w-sm text-sm text-vx-neutral-600">
            77A, LGF, Bhawani Kunj, Sector D-2, New Delhi 110070
          </p>
        </div>
        <div className="flex flex-col gap-2 text-sm text-vx-neutral-600">
          <Link href="/legal/privacy" className={linkClass}>
            Privacy
          </Link>
          <Link href="/legal/terms" className={linkClass}>
            Terms
          </Link>
          <Link href="/legal/grievance-officer" className={linkClass}>
            Grievance officer
          </Link>
          <p className="pt-4 text-xs text-vx-neutral-400">© {new Date().getFullYear()} VEXA Digital</p>
        </div>
      </div>
    </footer>
  );
}
