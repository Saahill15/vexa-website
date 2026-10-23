import Image from "next/image";
import Link from "next/link";
import { istDate } from "@/lib/time";
import { NAV, SITE } from "@/lib/site";
import { Icon } from "./Icon";

/* Full-width footer: CTA, link columns, contact details and a legal bar. */
export function Footer() {
  return (
    <footer className="foot">
      <div className="wrap">
        <div className="foot-cols">
          <div className="foot-brand">
            <Image src="/img/vexa-logo-light-teal.png" alt="Vexa Esports Consultancy" width={92} height={48} />
            <p>Brand campaigns in gaming, and business advisory for esports teams and tournament organisers.</p>
            <div className="foot-social">
              <a href={SITE.instagram} rel="noopener" target="_blank" aria-label="Instagram"><Icon name="instagram" size={18} /></a>
              <a href={SITE.linkedin} rel="noopener" target="_blank" aria-label="LinkedIn"><Icon name="linkedin" size={16} /></a>
            </div>
          </div>

          <nav className="foot-col" aria-label="Explore">
            <p className="foot-h">Explore</p>
            <Link href="/">Home</Link>
            {NAV.map((item) => (
              <Link key={item.href} href={item.href}>{item.label}</Link>
            ))}
            <Link href="/faq">FAQ</Link>
          </nav>

          <div className="foot-col">
            <p className="foot-h">Reach us at</p>
            <a href={`mailto:${SITE.email}`} className="f-line"><Icon name="mail" size={17} />{SITE.email}</a>
            <p className="f-line"><Icon name="pin" size={17} />{SITE.address}</p>
          </div>

          <nav className="foot-col" aria-label="Legal">
            <p className="foot-h">Legal</p>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms &amp; Conditions</Link>
          </nav>
        </div>

        <div className="foot-legal">
          <p>Vexa Digital is a trade name used by Blue Wings, a sole proprietorship, under licence. Registered place of business: 13 Vrundavan, Nava Wadaj, Ahmedabad 380013. Invoices are issued by Blue Wings.</p>
        </div>

        <div className="foot-bar">
          <p>© {istDate().slice(0, 4)} Blue Wings. All rights reserved.</p>
          <nav aria-label="Legal links">
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms &amp; Conditions</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
