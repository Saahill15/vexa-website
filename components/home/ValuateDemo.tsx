"use client";

import { useId, useState } from "react";
import { Arrow, ButtonLink } from "@/components/ButtonLink";

const formats = [
  { id: "reel", label: "Instagram Reel", metric: "Recent Instagram Reel views", work: "One sponsored Reel on your Instagram account", explanation: "Use views from your recent Instagram Reels. That describes the format being bought." },
  { id: "video", label: "YouTube video", metric: "Recent YouTube video views", work: "One sponsored video on your YouTube channel", explanation: "Use views from your recent YouTube videos. Shorts reach describes a different purchase." },
  { id: "short", label: "YouTube Short", metric: "Recent YouTube Shorts views", work: "One sponsored Short on your YouTube channel", explanation: "Use views from your recent YouTube Shorts. Keep longer video views separate." },
] as const;
const usages = [
  { id: "own", label: "On your own channel", title: "Original publication", body: "The free estimate is for publication on your own account. Brand reuse, advertising and exclusivity are outside that purchase." },
  { id: "repost", label: "The brand also wants to repost", title: "An additional permission to discuss", body: "A brand repost is a separate use of your content. Describe where it can appear, for how long and whether changes are allowed before agreeing its price." },
  { id: "ads", label: "The brand also wants advertising use", title: "Advertising use needs its own scope", body: "Paid advertising is different from publication on your channel. Agree the channels, duration, edits and access required. The free organic estimate does not price that permission." },
] as const;

export function ValuateDemo({ href, compact = false, available = true, ctaLabel }: { href: string; compact?: boolean; available?: boolean; ctaLabel?: string }): React.ReactElement {
  const id = useId();
  const [format, setFormat] = useState<string>(formats[0].id);
  const [usage, setUsage] = useState<string>(usages[0].id);
  const chosen = formats.find(item => item.id === format) || formats[0];
  const use = usages.find(item => item.id === usage) || usages[0];

  return <div className={`valuate-demo ${compact ? "valuate-demo-compact" : ""}`}>
    <div className="demo-window-top"><span className="demo-wordmark">Valuate<span>↗</span></span><span>Understand the quote</span></div>
    <fieldset className="demo-formats"><legend>What are you publishing?</legend><div>{formats.map(item => <label key={item.id}><input type="radio" name={`format-${id}`} value={item.id} checked={format === item.id} onChange={() => setFormat(item.id)} /><span>{item.label}</span></label>)}</div></fieldset>
    <div className="demo-purchase">
      <div className="demo-usage"><label htmlFor={`usage-${id}`}>How would the content be used?</label><select id={`usage-${id}`} value={usage} onChange={event => setUsage(event.target.value)}>{usages.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}</select><p className="vx-label">Audience input for this format</p><p className="demo-metric">{chosen.metric}</p><p>{chosen.explanation}</p></div>
      <div className="demo-scope" key={`${chosen.id}-${use.id}`} aria-live="polite"><p className="vx-label">The quote to prepare</p><h3>{chosen.work}</h3><div className="demo-record"><strong>{use.title}</strong><p>{use.body}</p></div></div>
    </div>
    <div className="demo-window-bottom"><p>{available ? "Choose your format and understand the scope here. Open Valuate to add your own audience input and calculate an indicative range." : "See how a quote is scoped here. Public calculator access is still in development."}</p><ButtonLink href={href}>{available ? "Try Valuate" : ctaLabel || "Explore Valuate"} <Arrow /></ButtonLink></div>
  </div>;
}
