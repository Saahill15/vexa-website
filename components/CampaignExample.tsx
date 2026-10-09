type Product = "case" | "webcam" | "router";
const examples = [
  { id: "case", label: "Phone case", lens: "A choice that says something", moment: "On a phone used for everything.", audience: "Someone who plays on their phone and wants a case that feels like them.", alternative: "A plain protective case, a favourite design, or the case they already own.", question: "Would they choose it for the look, the grip, the protection, or something else?", implication: "If the design matters, how people style and show the case may tell us more than a gameplay demonstration." },
  { id: "webcam", label: "Webcam", lens: "Useful in a particular moment", moment: "Going live from a bedroom.", audience: "A player starting to stream, with limited space and changing light.", alternative: "Their phone camera, a built-in camera, or streaming without showing their face.", question: "What would make a separate webcam worth adding to their setup?", implication: "If ease of setup matters, a creator showing the whole process may be more useful than a spec sheet." },
  { id: "router", label: "Router", lens: "A job the product could do", moment: "A match while the house is online.", audience: "A player sharing home internet with people on calls, streams or downloads.", alternative: "The existing router, mobile data, or changing when and where they play.", question: "Is the interruption coming from Wi-Fi coverage, the connection, or something else?", implication: "Finding the cause comes first. A campaign can explain the router’s role only if it addresses what this player experiences." },
] as const;

function ProductDrawing({ product }: { product: Product }): React.ReactElement {
  return <svg viewBox="0 0 280 180" fill="none" className="product-drawing" aria-hidden="true">
    {product === "case" ? <>
      <rect x="88" y="12" width="104" height="156" rx="20" stroke="currentColor" strokeWidth="2" />
      <rect x="98" y="22" width="35" height="42" rx="10" stroke="currentColor" strokeWidth="2" />
      <circle cx="108" cy="34" r="5" stroke="currentColor" /><circle cx="123" cy="49" r="5" stroke="currentColor" />
      <path d="M90 102l56-29 45 26M91 123l57-29 42 25M93 144l56-29 38 25" stroke="currentColor" strokeWidth="2" />
      <path d="M205 47h36M39 133h34" stroke="currentColor" strokeWidth="1.5" /><circle cx="237" cy="133" r="4" fill="#D4A62A" />
    </> : product === "webcam" ? <>
      <rect x="53" y="82" width="174" height="78" rx="5" stroke="currentColor" strokeWidth="2" />
      <path d="M119 160v13h43v-13M37 173h206" stroke="currentColor" strokeWidth="2" />
      <rect x="104" y="43" width="74" height="35" rx="12" stroke="currentColor" strokeWidth="2" />
      <circle cx="141" cy="60" r="10" stroke="currentColor" strokeWidth="2" /><circle cx="141" cy="60" r="3" fill="#D4A62A" />
      <path d="M130 78v4h23v-4M190 39l12-12M204 59h18M94 32L84 20" stroke="currentColor" strokeWidth="1.5" />
      <path d="M68 98h52M68 110h32M68 122h43" stroke="currentColor" strokeOpacity=".5" />
    </> : <>
      <path d="M65 118l25-21h100l25 21v28H65zM65 118h150M91 97V56M189 97V56" stroke="currentColor" strokeWidth="2" />
      <path d="M112 53q28-24 56 0M122 65q18-15 36 0M132 78q8-7 16 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="88" cy="132" r="3" fill="#D4A62A" /><path d="M103 132h8M122 132h8M141 132h8" stroke="currentColor" strokeWidth="2" />
      <path d="M47 75h19M213 75h20M140 146v23h61" stroke="currentColor" strokeWidth="1.5" />
    </>}
  </svg>;
}

// Native radios and CSS keep every example usable before hydration and with JavaScript disabled.
export function CampaignExample({ idPrefix = "home-fit" }: { idPrefix?: string }): React.ReactElement {
  return <section id="product-relevance" className="relevance-section" aria-labelledby={`${idPrefix}-title`}>
    <div className="vx-container">
      <div className="relevance-heading"><div><p className="vx-label">PRODUCT EXAMPLES</p><h2 id={`${idPrefix}-title`}>Start with the reason someone would want it.</h2></div><p>Try a product to see what we would investigate before suggesting a campaign.</p></div>
      <fieldset className="relevance-explorer"><legend className="sr-only">Choose a product to explore</legend>
        {examples.map((example, index) => <input className="product-radio" type="radio" name={`${idPrefix}-product`} id={`${idPrefix}-${example.id}`} key={example.id} defaultChecked={index === 0} aria-controls={`${idPrefix}-panel-${example.id}`} aria-describedby={`${idPrefix}-question-${example.id}`} />)}
        <div className="product-choices">{examples.map(example => <label key={example.id} htmlFor={`${idPrefix}-${example.id}`}><span>{example.label}</span><span className="product-selected" aria-hidden="true">↗</span></label>)}</div>
        <div className="product-panels">{examples.map(example => <div className={`product-panel panel-${example.id}`} id={`${idPrefix}-panel-${example.id}`} key={example.id}>
          <div className="product-scene"><p className="scene-lens">{example.lens}</p><ProductDrawing product={example.id} /><h3>{example.moment}</h3><span className="scene-caption">Illustrative situation</span></div>
          <div className="product-reasoning"><dl><div><dt>Who might care</dt><dd>{example.audience}</dd></div><div><dt>What they might choose instead</dt><dd>{example.alternative}</dd></div></dl>
            <div className="research-question"><p className="vx-label">The question to research</p><h3 id={`${idPrefix}-question-${example.id}`}>{example.question}</h3></div>
            <p className="campaign-implication">{example.implication}</p>
          </div>
        </div>)}</div>
      </fieldset>
      <p className="example-boundary">These examples show how we think. They are questions to investigate, not findings from a customer study.</p>
    </div>
  </section>;
}
