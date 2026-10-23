import type { EnquiryStatus } from "@/lib/enquiries";

/** A small status icon in the style of an issue tracker: ring, half-filled, dashed, or ticked. */
export function StatusDot({ status, size = 14 }: { status: EnquiryStatus; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 14 14", className: "adm-dot", "aria-hidden": true as const };
  if (status === "resolved")
    return (
      <svg {...common}>
        <circle cx="7" cy="7" r="7" fill="#0B7F7C" />
        <path d="M4 7.2 6.1 9.2 10 5" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  if (status === "in_progress")
    return (
      <svg {...common}>
        <circle cx="7" cy="7" r="5.9" fill="none" stroke="#d19a1c" strokeWidth="1.5" />
        <path d="M7 3.2a3.8 3.8 0 0 1 0 7.6z" fill="#d19a1c" />
      </svg>
    );
  if (status === "waiting")
    return (
      <svg {...common}>
        <circle cx="7" cy="7" r="5.9" fill="none" stroke="#7b80d9" strokeWidth="1.5" strokeDasharray="2.4 2" />
      </svg>
    );
  return (
    <svg {...common}>
      <circle cx="7" cy="7" r="5.9" fill="none" stroke="#0B7F7C" strokeWidth="1.5" />
    </svg>
  );
}
