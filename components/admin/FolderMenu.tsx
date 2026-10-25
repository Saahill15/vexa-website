"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { MailIcon } from "./MailIcons";

export type FolderItem = { id: string; label: string; group: "folders" | "categories"; count?: number; href: string };

/** The folder picker for the Mail view: Inbox, Starred, Sent, Drafts, Spam and the rest, with Gmail's inbox categories below. */
export function FolderMenu({ current, items }: { current: string; items: FolderItem[] }) {
  const [open, setOpen] = useState(false);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const box = useRef<HTMLDivElement>(null);
  const loadedAt = useRef(0);

  // the numbers come from the server only when the menu opens, and at most once a minute
  function toggle() {
    setOpen((o) => !o);
    if (Date.now() - loadedAt.current < 60_000) return;
    loadedAt.current = Date.now();
    fetch("/admin/inbox/counts", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : {}))
      .then((d) => setCounts(d && typeof d === "object" ? (d as Record<string, number>) : {}))
      .catch(() => undefined);
  }

  useEffect(() => {
    if (!open) return;
    const outside = (e: MouseEvent) => !box.current?.contains(e.target as Node) && setOpen(false);
    const escape = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("mousedown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);

  const active = items.find((i) => i.id === current) ?? items[0];
  const group = (name: FolderItem["group"], title?: string) => (
    <div className="adm-folders-group" role="group" aria-label={title ?? "Folders"}>
      {title ? <p>{title}</p> : null}
      {items.filter((i) => i.group === name).map((i) => (
        // counts are shown only where they exist (unread folders)
        <Link key={i.id} href={i.href} role="menuitem" aria-current={i.id === current ? "true" : undefined} className={counts[i.id] && i.id !== "drafts" && i.id !== "spam" ? "is-unread" : undefined} onClick={() => setOpen(false)}>
          <span>{i.label}</span>
          {counts[i.id] ? <b>{counts[i.id] > 999 ? "999+" : counts[i.id]}</b> : null}
        </Link>
      ))}
    </div>
  );

  return (
    <div className="adm-folders" ref={box}>
      <button type="button" className="adm-folders-btn" aria-haspopup="menu" aria-expanded={open} onClick={toggle}>
        <MailIcon name="inbox" size={16} />
        <span>{active.label}</span>
        <MailIcon name="caret" size={14} />
      </button>
      {open ? (
        <div className="adm-folders-list" role="menu">
          {group("folders")}
          {group("categories", "Categories")}
        </div>
      ) : null}
    </div>
  );
}
