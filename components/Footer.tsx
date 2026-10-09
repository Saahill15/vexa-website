import Image from "next/image";
import Link from "next/link";
import { ENTITY } from "@/components/entity";
import { FOOTER_GROUPS } from "@/components/nav";
import { SITE, SOCIAL } from "@/lib/site";

export function Footer(): React.ReactElement {
  return <footer data-segment="FOOTER-01" className="site-footer"><div className="vx-container">
    <div className="footer-layout">
      <div className="footer-company"><Image src="/brand/open-feather-lockup-light.svg" alt="VEXA Digital" width={348} height={112} className="footer-logo" /><p>Gaming campaigns for brands. Business advisory for esports teams and tournament organisers.</p></div>
      {FOOTER_GROUPS.map(group => <nav key={group.title} aria-label={group.title}><h2 className="vx-label">{group.title}</h2><ul>{group.links.map(item => <li key={item.href}><Link href={item.href}>{item.label}</Link></li>)}</ul></nav>)}
      <div className="footer-contact"><h2 className="vx-label">Start a conversation</h2><p><a className="break-all" href={`mailto:${SITE.email}`}>{SITE.email}</a></p><ul>{Object.values(SOCIAL).map(item => <li key={item.href}><a href={item.href} rel="noopener">{item.label}</a></li>)}</ul></div>
    </div>
    <div className="footer-legal"><div className="footer-entity">{[ENTITY.licence,ENTITY.registrations,ENTITY.operatingOffice,ENTITY.registeredOffice,ENTITY.invoicing].map(line => <p key={line} data-counsel="true">{line}</p>)}</div><div className="footer-bottom"><p>© {new Date().getFullYear()} Blue Wings</p><Link href="/legal/privacy">Privacy</Link><Link href="/legal/terms">Terms</Link><Link href="/legal/grievance-officer">Grievance Officer</Link></div></div>
  </div></footer>;
}
