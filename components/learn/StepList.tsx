import type { Step } from "@/lib/learn";
type Props = { steps: Step[]; start?: number };
/** Existing structured guides read as full prose, with optional practical exercises. */
export function StepList({ steps }: Props): React.ReactElement {
 return <div className="article-prose">{steps.map((section,index)=><section key={section.title || index}>{section.title ? <h2>{section.title}</h2> : null}{section.body.map(paragraph=><p key={paragraph}>{paragraph}</p>)}{section.doThisNow ? <aside className="reader-action"><p className="vx-label">Try it on your own work</p><p>{section.doThisNow}</p></aside> : null}</section>)}</div>;
}
