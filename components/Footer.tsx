import Image from "next/image";
import Link from "next/link";
import { NAV } from "@/components/nav";

const linkClass =
  "rounded-sm transition-colors duration-base ease-vx-out hover:text-vx-feather-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-vx-accent-500";

export function Footer(): React.ReactElement {
  return (
    <footer data-segment="FOOTER-01" className="border-t border-vx-peacock-teal/50 bg-vx-charcoal-950">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 md:grid-cols-[1fr_auto] md:px-8">
        <div className="space-y-3">
          <Image
            src="/brand/vexa-logo-light.png"
            alt="VEXA Digital"
            width={1132}
            height={590}
            className="h-12 w-auto"
          />
          <p className="max-w-sm text-sm text-vx-neutral-200">
            VEXA Digital is an esports and brand partnerships consultancy. We help brands find their
            fit in gaming, and help teams and creators find the right brand partners.
          </p>
          <p className="max-w-sm text-sm text-vx-neutral-200">
            VEXA Digital is a trade name of Blue Wings, a proprietorship. Proprietor: Asknani Pratham
            Kishorkumar.
          </p>
          <p className="max-w-sm text-sm text-vx-neutral-200">
            77A, LGF, Bhawani Kunj, Sector D-2, New Delhi 110070
          </p>
          <p className="max-w-sm text-sm text-vx-neutral-200">
            GSTIN 24FKBPA4989L1ZT. Udyam registration number UDYAM-GJ-01-0537468.
          </p>
          <p className="text-sm text-vx-neutral-200">
            <a className={`${linkClass} hover:text-vx-feather-gold`} href="tel:+919958895505">
              +91 9958895505
            </a>
            {" · "}
            <a className={`${linkClass} hover:text-vx-feather-gold`} href="mailto:partnerships@vexadigital.in">
              partnerships@vexadigital.in
            </a>
          </p>
          <p className="max-w-sm text-sm text-vx-neutral-200">
            [Soda to confirm: LinkedIn, Instagram or other profiles that belong to VEXA or Soda]
          </p>
        </div>
        <div className="flex flex-col gap-2 text-sm text-vx-neutral-200">
          <nav aria-label="Footer" className="flex flex-col gap-2">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} className={linkClass}>
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 flex flex-col gap-2">
            <Link href="/legal/privacy" className={linkClass}>
              Privacy
            </Link>
            <Link href="/legal/terms" className={linkClass}>
              Terms
            </Link>
            <Link href="/legal/grievance-officer" className={linkClass}>
              Grievance officer
            </Link>
          </div>
          <p className="pt-4 text-xs text-vx-neutral-400">© {new Date().getFullYear()} Blue Wings</p>
        </div>
      </div>
    </footer>
  );
}
