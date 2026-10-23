"use client";

import { useId, useState } from "react";

/* A small working preview of Valuate: pick a format and a usage, see what the quote covers. From the earlier build. */

const FORMATS = [
  { id: "reel", label: "Instagram Reel", metric: "Recent Instagram Reel views", work: "One sponsored Reel on your Instagram account", explanation: "Use views from your recent Instagram Reels. That describes the format being bought." },
  { id: "video", label: "YouTube video", metric: "Recent YouTube video views", work: "One sponsored video on your YouTube channel", explanation: "Use views from your recent YouTube videos. Shorts reach describes a different purchase." },
  { id: "short", label: "YouTube Short", metric: "Recent YouTube Shorts views", work: "One sponsored Short on your YouTube channel", explanation: "Use views from your recent YouTube Shorts. Keep longer video views separate." },
] as const;

const USAGES = [
  { id: "own", label: "On your own channel", title: "Original publication", body: "The free estimate is for publication on your own account. Brand reuse, advertising and exclusivity are outside that purchase." },
  { id: "repost", label: "The brand also wants to repost", title: "An additional permission to discuss", body: "A brand repost is a separate use of your content. Agree where it can appear, for how long and whether changes are allowed before pricing it." },
  { id: "ads", label: "The brand also wants advertising use", title: "Advertising use needs its own scope", body: "Paid advertising is different from publication on your channel. Agree the channels, duration, edits and access required." },
] as const;

export function ValuateDemo() {
  const id = useId();
  const [format, setFormat] = useState<string>(FORMATS[0].id);
  const [usage, setUsage] = useState<string>(USAGES[0].id);
  const f = FORMATS.find((x) => x.id === format) ?? FORMATS[0];
  const u = USAGES.find((x) => x.id === usage) ?? USAGES[0];

  return (
    <div className="vdemo">
      <div className="vdemo-top"><strong>Valuate</strong><span>Understand the quote</span></div>
      <div className="vdemo-body">
        <fieldset className="vdemo-formats">
          <legend>What are you publishing?</legend>
          <div>
            {FORMATS.map((x) => (
              <label key={x.id}>
                <input type="radio" name={`format-${id}`} checked={format === x.id} onChange={() => setFormat(x.id)} />
                <span>{x.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <div className="vdemo-field">
          <label htmlFor={`usage-${id}`}>How would the content be used?</label>
          <select id={`usage-${id}`} className="in" value={usage} onChange={(e) => setUsage(e.target.value)}>
            {USAGES.map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}
          </select>
        </div>
        <div className="vdemo-result" key={`${f.id}-${u.id}`} aria-live="polite">
          <span className="vdemo-k">The quote to prepare</span>
          <p className="vdemo-work">{f.work}</p>
          <div className="vdemo-rows">
            <div><span className="vdemo-k">Audience input</span><p>{f.metric}</p><small>{f.explanation}</small></div>
            <div><span className="vdemo-k">Usage</span><p>{u.title}</p><small>{u.body}</small></div>
          </div>
        </div>
      </div>
    </div>
  );
}
