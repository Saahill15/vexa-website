type Props = { label: string; title: string; children?: React.ReactNode; segment?: string; after?: React.ReactNode };
export function PageIntro({ label, title, children, segment, after }: Props): React.ReactElement {
  return <header data-segment={segment} className="vx-container page-intro"><p className="vx-label hero-eyebrow">{label}</p><div className="page-intro-grid"><h1>{title}</h1>{children ? <div className="page-intro-copy">{children}</div> : null}</div>{after}</header>;
}
