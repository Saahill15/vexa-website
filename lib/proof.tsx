export type LedgerRow = {
  segment: string;
  status: "In progress" | "Network" | "Founder record";
  heading: string;
  summary: string;
  body: React.ReactNode;
  meta?: string;
};

export const LEDGER: readonly LedgerRow[] = [
  {
    segment: "PROOF-02",
    status: "In progress",
    heading: "Pilot campaign with a gaming hardware brand",
    summary: "The idea uses data to answer a question gamers already argue about. Stage: discovery.",
    body: (
      <>
        <p>The idea uses data to answer a question gamers already argue about. Stage: discovery.</p>
        <p>The brand will be named once it agrees.</p>
      </>
    ),
  },
  {
    segment: "PROOF-03",
    status: "Network",
    heading: "Partners we work with",
    summary: "We work with gaming teams, creators and event organisers we have checked ourselves.",
    body: (
      <>
        <p>We work with gaming teams, creators and event organisers we have checked ourselves.</p>
        <p>Their past work is theirs, not VEXA&apos;s, and we label it that way.</p>
      </>
    ),
  },
  {
    segment: "PROOF-04",
    status: "Founder record",
    heading: "The founder's record before VEXA",
    summary: "Wrote campaign strategy for gaming organisations, under non disclosure agreements.",
    body: (
      <>
        <ul className="list-disc space-y-2 pl-5">
          <li>Wrote campaign strategy for gaming organisations, under non disclosure agreements.</li>
          <li>
            Worked as paid ground crew on a national energy drink brand&apos;s event campaign with a major esports network.
          </li>
        </ul>
        <p>These are Kaustubh&apos;s own experience, not VEXA campaigns.</p>
      </>
    ),
  },
];
