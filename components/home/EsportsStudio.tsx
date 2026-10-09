"use client";

import { useState } from "react";

const work = [
  { id: "offer", label: "Make the commercial offer specific", title: "Show what a buyer can actually buy.", body: "Define the activity, brand presence, timing and rights you can deliver. Build the media kit and proposal around that purchase.", output: "A partnership offer with named deliverables, a pricing rationale and the conditions that need agreement." },
  { id: "content", label: "Build the content and audience evidence", title: "Give the pitch something to stand on.", body: "Choose formats your people can sustain. Assign the production work and organise relevant audience data with its source and reporting period.", output: "A content plan and an evidence note connecting the proposed activity to examples a buyer can inspect." },
  { id: "event", label: "Develop the event partnership", title: "Turn event assets into an agreed scope.", body: "For tournament organisers, identify the placements and experiences under your control, the approvals required and the people responsible for delivery.", output: "An event partnership inventory with clear assets, production responsibilities and reporting requirements." },
] as const;

export function EsportsStudio(): React.ReactElement {
  const [chosen, setChosen] = useState<string>(work[0].id);
  const item = work.find(piece => piece.id === chosen) || work[0];
  return <div className="org-studio">
    <div className="org-choice" aria-label="Advisory priorities">{work.map(piece => <button type="button" key={piece.id} aria-pressed={chosen === piece.id} onClick={() => setChosen(piece.id)}>{piece.label}<span aria-hidden="true">↗</span></button>)}</div>
    <div className="org-choice-result" key={item.id} aria-live="polite"><p className="vx-label">A possible advisory priority</p><h3>{item.title}</h3><p>{item.body}</p><p><strong>What the work produces</strong><br />{item.output}</p></div>
  </div>;
}
