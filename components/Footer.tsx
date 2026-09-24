import Image from "next/image";
import Link from "next/link";
import { ENTITY } from "@/components/entity";
import { FeatherEye } from "@/components/FeatherEye";
import { FOOTER_GROUPS } from "@/components/nav";
import { SITE } from "@/lib/site";

const link = "rounded-sm underline-offset-4 transition-colors duration-fast hover:underline hover:decoration-vx-peacock-blue";

export function Footer(): React.ReactElement {
  return (
    <footer data-segment="FOOTER-01" className="border-t border-vx-ink bg-vx-stone">
      <div className="vx-container vx-grid gap-y-12 py-16 md:py-20">
        <div className="col-span-full md:col-span-8 lg:col-span-4">
          <Image src="/brand/vexa-logo-compact-ink.png" alt="VEXA Digital" width={236} height={144} className="h-11 w-auto" />
          <p className="mt-6 max-w-sm font-text text-small text-vx-ink-2">
            VEXA Digital is an esports and brand partnerships consultancy. We help brands find their fit in gaming, and help
            teams and creators find the right brand partners.
          </p>
          <div className="mt-5 space-y-2 font-text text-small text-vx-muted">
            {[ENTITY.licence, ENTITY.registrations, ENTITY.operatingOffice, ENTITY.registeredOffice, ENTITY.invoicing].map((line) => (
              <p key={line} data-counsel="true" className="max-w-sm">
                {line}
              </p>
            ))}
          </div>
        </div>
        {FOOTER_GROUPS.map((group) => (
          <nav key={group.title} aria-label={group.title} className="col-span-2 md:col-span-2 lg:col-span-2 lg:col-start-auto">
            <h2 className="vx-label text-vx-muted">{group.title}</h2>
            <ul className="mt-4 space-y-1 font-text text-small">
              {group.links.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={`inline-flex min-h-[36px] items-center text-vx-ink ${link}`}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
        <div className="col-span-full md:col-span-4 lg:col-span-3 lg:col-start-10">
          <h2 className="vx-label text-vx-muted">Write to us</h2>
          <p className="mt-4 font-text text-body font-medium">
            <a href={`mailto:${SITE.email}`} className={`break-all text-vx-ink ${link}`}>
              {SITE.email}
            </a>
          </p>
          <p className="mt-2 font-text text-small">
            <a href={SITE.phoneHref} className={`text-vx-ink ${link}`}>
              {SITE.phone}
            </a>
          </p>
          <div className="footer-eye mt-8 flex items-center gap-3" aria-hidden="true">
            <FeatherEye className="w-6" />
            <span className="h-px w-16 bg-vx-feather-gold" />
          </div>
        </div>
      </div>
      <div className="border-t border-vx-hair">
        <div className="vx-container flex flex-wrap items-center gap-x-8 gap-y-2 py-6 font-text text-small text-vx-muted">
          <p>© {new Date().getFullYear()} Blue Wings</p>
          <Link href="/legal/privacy" className={`inline-flex min-h-[44px] items-center ${link}`}>
            Privacy
          </Link>
          <Link href="/legal/terms" className={`inline-flex min-h-[44px] items-center ${link}`}>
            Terms
          </Link>
          <Link href="/legal/grievance-officer" className={`inline-flex min-h-[44px] items-center ${link}`}>
            Grievance Officer
          </Link>
        </div>
      </div>
    </footer>
  );
}
