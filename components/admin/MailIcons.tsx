/* The small icons the mail screen uses, drawn like Gmail's: thin outline, 20px grid. */
const PATHS = {
  back: "M19 12H5m6-6-6 6 6 6",
  archive: "M4 7h16v3H4zM5 10v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-8M10 14h4",
  spam: "M9 3h6l6 6v6l-6 6H9l-6-6V9zM12 8v5M12 16.5v.01",
  trash: "M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12M10 11v5M14 11v5",
  unread: "M4 8l8 5 8-5M4 6h12M4 6v12h16V11",
  star: "M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9-5.2-2.8-5.2 2.8 1-5.9-4.3-4.1 5.9-.8z",
  reply: "M10 8 4 13l6 5M4 13h9a7 7 0 0 1 7 7",
  forward: "M14 8l6 5-6 5M20 13h-9a7 7 0 0 0-7 7",
  more: "M12 5.5v.01M12 12v.01M12 18.5v.01",
  print: "M7 9V4h10v5M7 17H5a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-2M7 14h10v6H7z",
  open: "M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5",
  prev: "M15 5l-7 7 7 7",
  next: "M9 5l7 7-7 7",
  caret: "M7 10l5 5 5-5",
  inbox: "M4 13l2-8h12l2 8M4 13v6h16v-6M4 13h5l1 2h4l1-2h5",
  important: "M4 6h11l5 6-5 6H4l5-6z",
  sent: "M4 12l16-8-6 16-3-7z",
  drafts: "M6 3h8l4 4v14H6zM14 3v4h4M9 13h6M9 17h4",
  all: "M3 8l9 5 9-5M3 8l9-5 9 5M3 8v10h18V8",
  people: "M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM3 19c0-3 3-5 6-5s6 2 6 5M16 6a3 3 0 0 1 0 5M18 14c2 .6 3 2 3 5",
  tag: "M3 12V4h8l10 10-8 8zM7.5 8v.01",
  bell: "M6 17V11a6 6 0 0 1 12 0v6l2 2H4zM10 21h4",
  chats: "M4 5h16v11H9l-5 4zM8 9h8M8 12h5",
  cart: "M3 4h3l2 11h10l2-8H7M10 20v.01M17 20v.01",
  person: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c0-4 4-6 8-6s8 2 8 6",
} as const;

export type MailIconName = keyof typeof PATHS;

export function MailIcon({ name, size = 18, filled = false }: { name: MailIconName; size?: number; filled?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={PATHS[name]} />
    </svg>
  );
}
