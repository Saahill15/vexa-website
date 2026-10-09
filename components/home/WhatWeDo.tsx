import { CampaignStudio } from "@/components/home/CampaignStudio";

export function WhatWeDo(): React.ReactElement {
  return <section className="home-campaigns" aria-labelledby="work-title">
    <div className="vx-container">
      <div className="campaign-heading"><p className="vx-label">Campaigns with a place in gaming</p><h2 id="work-title">The right gaming partners<br />for your campaign.</h2><p>Creators, teams and tournaments offer different ways to participate. We develop the campaign around your objective, then bring together the partners who can deliver it.</p></div>
      <CampaignStudio />
    </div>
  </section>;
}
