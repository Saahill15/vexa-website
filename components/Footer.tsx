import Image from "next/image";
import Link from "next/link";
import { NAV, SITE } from "@/lib/site";

export function Footer() {
  return (
    <footer className="foot">
      <div className="wrap">
        <div className="foot-grid">
          <div>
            <Image className="logo-on-light" src="/img/vexa-logo.png" alt="VEXA Esports Consultancy" width={119} height={62} />
            <Image className="logo-on-dark" src="/img/vexa-logo-light.png" alt="" aria-hidden="true" width={119} height={62} />
          </div>
          <nav aria-label="Pages">
            <h2>Explore</h2>
            <ul>
              <li><Link href="/">Home</Link></li>
              {NAV.map((item) => (
                <li key={item.href}><Link href={item.href}>{item.label}</Link></li>
              ))}
            </ul>
          </nav>
          <div>
            <h2>Say hello</h2>
            <ul>
              <li><a href={`mailto:${SITE.email}`} style={{ wordBreak: "break-all" }}>{SITE.email}</a></li>
              <li><a href={SITE.instagram} rel="noopener" target="_blank">Instagram</a></li>
              <li><a href={SITE.linkedin} rel="noopener" target="_blank">LinkedIn</a></li>
            </ul>
          </div>
        </div>
        <div className="wordmark" aria-hidden="true">VEXA</div>
        <div className="legal">
          <p>VEXA Digital is a trade name of Blue Wings. Operating office: {SITE.address}.</p>
          <div className="bottom">
            <span>© {new Date().getFullYear()} Blue Wings</span>
            <span>Esports consultancy · est. 2025</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
