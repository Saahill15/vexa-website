
type Props = {
  compact?: boolean;
};

function GaugeMark(): React.ReactElement {
  return (
    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-vx-accent-500">
      <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="13" width="8" height="4" rx="2" fill="#14110F" />
        <rect x="3" y="6" width="14" height="4" rx="2" fill="#14110F" />
      </svg>
    </span>
  );
}

export function ValuateSample({ compact = false }: Props): React.ReactElement {
  return (
    <div className="relative overflow-hidden rounded-lg border border-[#3A322B] bg-[#14110F] text-[#F2EEEA]">
      <div className={`relative ${compact ? "p-4" : "p-6 md:p-8"}`}>
        <div className="flex items-center gap-3">
          <GaugeMark />
          <span className="font-display text-sm font-semibold tracking-tight">VEXA Valuate</span>
        </div>
        <p className="mt-4 text-xs text-[#A79C90]">
          Gaming, 500 followers, about 2,900 typical views
        </p>
        <p className="mt-5 font-body text-xs font-medium uppercase tracking-[0.14em] text-[#A79C90]">
          Ask for
        </p>
        <p className="font-display text-4xl font-semibold tabular-nums tracking-tight">₹1,236</p>
        <div className="mt-6">
          <div className="flex h-3.5 overflow-hidden rounded-pill">
            <div className="h-full w-[38%] bg-[#3A1B18]" />
            <div className="h-full w-[34%] bg-[#123322]" />
            <div className="h-full w-[28%] bg-[#3A2A0C]" />
          </div>
          <div className="relative h-8">
            <div className="absolute left-[78%] top-1 flex -translate-x-1/2 flex-col items-center">
              <span className="h-2 w-0.5 bg-vx-accent-500" />
              <span className="whitespace-nowrap rounded-sm bg-vx-accent-500 px-2 py-0.5 text-[11px] font-semibold text-white tabular-nums">
                Offer ₹3,500
              </span>
            </div>
          </div>
          <div className="flex justify-between text-[11px] font-semibold uppercase tracking-wide text-[#A79C90]">
            <span>Lowball</span>
            <span>Fair</span>
            <span>Premium</span>
          </div>
        </div>
        <p className="mt-3 text-sm text-[#A79C90]">
          Don&apos;t go below <span className="font-semibold text-[#F2EEEA] tabular-nums">₹913</span>.
        </p>
        <div className={`mt-4 grid gap-3 ${compact ? "" : "sm:grid-cols-2"}`}>
          <div className="rounded-md bg-[#201B17] p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#A79C90]">
              Your views support
            </p>
            <p className="mt-1 font-display text-lg font-semibold tabular-nums">₹913 to ₹1,236</p>
          </div>
          <div className="rounded-md bg-[#201B17] p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#A79C90]">
              Where you are
            </p>
            <p className="mt-1 text-sm leading-snug">
              Most brands start paying cash at 1,000 to 5,000 followers
            </p>
          </div>
        </div>
        {compact ? null : (
          <p className="mt-4 text-sm leading-relaxed text-[#A79C90]">
            Under 1,000 followers, barter and small fees are normal. This band shows what that
            barter is worth.
          </p>
        )}
      </div>
    </div>
  );
}
