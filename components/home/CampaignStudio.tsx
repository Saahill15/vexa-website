"use client";

import { useId, useState } from "react";
import { ButtonLink } from "@/components/ButtonLink";

const paths = [
  { id: "creators", label: "Creators", noun: "A format people choose to watch.", idea: "A product story, demonstration or participation idea developed with suitable gaming creators.", delivery: "A creative brief, creator shortlist and a publishing plan that names what each partner will make.", agreement: "Deliverables, dates, approvals and content use are agreed before production.", href: "/brands#creators", symbol: "↗" },
  { id: "teams", label: "Esports teams", noun: "A relationship people follow.", idea: "A campaign around the players, original content and community of an esports team.", delivery: "A team partnership proposal that names the team's own content and assets, and the brand's role in them.", agreement: "Team-controlled assets and required event permissions are assessed separately.", href: "/brands#team-partnerships", symbol: "◎" },
  { id: "events", label: "Tournaments", noun: "A moment people take part in.", idea: "A considered role for a product around a gaming competition or live event.", delivery: "An activation plan with organiser responsibilities, production needs and a delivery schedule.", agreement: "Availability, permissions and the assets the organiser controls shape the scope.", href: "/brands#tournaments", symbol: "↳" },
] as const;

export function CampaignStudio({ page = false }: { page?: boolean }): React.ReactElement {
  const id = useId();
  const [selected, setSelected] = useState<string>(paths[0].id);
  const chosen = paths.find(path => path.id === selected) || paths[0];

  return <div className={`campaign-studio ${page ? "campaign-studio-page" : ""}`}>
    <fieldset className="studio-selector"><legend>Explore the partners a campaign can work with</legend><div>{paths.map(path => <label key={path.id}>
      <input type="radio" name={`campaign-${id}`} checked={selected === path.id} onChange={() => setSelected(path.id)} />
      <span>{path.label}<span aria-hidden="true">↗</span></span>
    </label>)}</div></fieldset>
    <div className="studio-explanation" aria-live="polite" key={chosen.id}>
      <div className="studio-scene"><span className="studio-symbol" aria-hidden="true">{chosen.symbol}</span><p className="vx-label">{chosen.label}</p><h3>{chosen.noun}</h3></div>
      <div className="studio-detail"><p className="studio-lead">{chosen.idea}</p><h4>What VEXA develops</h4><p>{chosen.delivery}</p><p className="studio-agreement">{chosen.agreement}</p><ButtonLink href={page ? "/contact?as=brand" : chosen.href} variant="text">{page ? "Discuss a campaign" : `Explore ${chosen.label.toLowerCase()}`}</ButtonLink></div>
    </div>
    <noscript><p className="studio-nojs">You can explore each approach on the <a className="vx-link" href="/brands">brand campaigns page</a>.</p></noscript>
  </div>;
}
