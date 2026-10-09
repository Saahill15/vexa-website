// The order we work in (HOW-02). Timings are added here once Soda confirms them.
export const STEPS = [
  {
    title: "Brief",
    body: "You tell us your product, your audience and the business result you need. You receive a short written summary to confirm we understood.",
  },
  {
    title: "Audience fit",
    body: "We check whether gamers aged 16 to 28 can deliver that result. If they cannot, we tell you before you spend anything.",
  },
  {
    title: "Partners and price",
    body: "We shortlist teams, events or creators and price what each one offers, such as jersey placement, stream mentions or videos. You receive the shortlist with a proposed KPI, benchmark and success criteria.",
  },
  {
    title: "Negotiation",
    body: "We agree deliverables, dates and price with each partner for you.",
  },
  {
    title: "Contract and payment",
    body: "Agreements for our services are made with Blue Wings, and invoices are issued by Blue Wings. Payments follow an agreed schedule.",
    counsel: true,
  },
  {
    title: "Campaign and report",
    body: "The campaign runs and we track it against the KPI. At the end you receive a final report with a recommendation for your next decision.",
  },
] as const;
