import { ButtonLink } from "@/components/ButtonLink";
const steps = [
  {title: "Research the fit.", body: "Look at the people, their situation and the alternatives. Find what could make the product matter and what may be getting in the way.", output: "A reason to explore, with questions still to answer."},
  {title: "Talk it through with you.", body: "Bring those questions to a conversation about your product, what you have tried and the constraints your team is working with.", output: "A shared direction for the campaign."},
  {title: "Develop it. Bring the right people in.", body: "Build the campaign, select creators, teams or event partners for their role in it, then coordinate the agreed work.", output: "A defined scope, delivery plan and way to assess what happened."},
];
export function ProcessPreview(): React.ReactElement {
  return <section className="campaign-process vx-container" aria-labelledby="process-title"><div className="process-heading"><p className="vx-label">From a question to a campaign</p><h2 id="process-title">The research opens<br />the conversation.</h2><p>The campaign takes shape with your team.</p></div>
    <ol className="process-list">{steps.map((step,index)=><li key={step.title}><span className="process-number">0{index+1}</span><h3>{step.title}</h3><div><p>{step.body}</p><p className="process-output">{step.output}</p></div></li>)}</ol>
    <div className="process-more"><ButtonLink href="/brands" variant="text">What working with VEXA involves</ButtonLink></div>
  </section>;
}
