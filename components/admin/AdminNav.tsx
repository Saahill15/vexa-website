"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Icon, type IconName } from "../Icon";
import { MailIcon, type MailIconName } from "./MailIcons";

type Item = { href: string; label: string; icon: IconName; badge?: "unread" | "enquiries"; external?: boolean };
type Group = { id: string; label?: string; items: Item[] };

const GROUPS: Group[] = [
  {
    id: "main",
    items: [
      { href: "/admin", label: "Dashboard", icon: "chart" },
      { href: "/admin/inbox", label: "Inbox", icon: "inbox", badge: "unread" },
    ],
  },
  {
    id: "people",
    label: "People",
    items: [
      { href: "/admin/enquiries", label: "Enquiries", icon: "mail", badge: "enquiries" },
      { href: "/admin/users", label: "Users", icon: "users" },
    ],
  },
  {
    id: "content",
    label: "Content",
    items: [
      { href: "/admin/articles", label: "Articles", icon: "doc" },
      { href: "/admin/comments", label: "Comments", icon: "chat" },
    ],
  },
  {
    id: "shortcuts",
    label: "Shortcuts",
    items: [
      { href: "/admin/articles/new", label: "New article", icon: "plus" },
      { href: "/admin/enquiries/export", label: "Export enquiries", icon: "download", external: true },
      { href: "/", label: "View site", icon: "external", external: true },
    ],
  },
  // at the very bottom of the sidebar, below the other sections
  { id: "account", items: [{ href: "/account", label: "My profile", icon: "users" }] },
];

const MAIL_FOLDERS: [string, string, MailIconName][] = [
  ["starred", "Starred", "star"], ["important", "Important", "important"], ["sent", "Sent", "sent"], ["drafts", "Drafts", "drafts"], ["spam", "Spam", "spam"], ["trash", "Trash", "trash"], ["all", "All Mail", "all"],
  ["primary", "Primary", "person"], ["social", "Social", "people"], ["promotions", "Promotions", "tag"], ["updates", "Updates", "bell"], ["forums", "Forums", "chats"], ["purchases", "Purchases", "cart"],
];

const KEY = "vexa:admin:collapsed";

export function AdminNav({ newEnquiries, unread }: { newEnquiries: number; unread: number }) {
  const path = usePathname();
  const [collapsed, setCollapsed] = useState<string[]>([]);

  // remember which categories are folded (per browser)
  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(KEY) ?? "[]");
      if (Array.isArray(saved)) setCollapsed(saved.filter((x) => typeof x === "string"));
    } catch {
      /* storage unavailable */
    }
  }, []);

  // unread numbers for the mail folders, fetched when Inbox is first hovered and again after a minute
  const [unreadBy, setUnreadBy] = useState<Record<string, number>>({});
  const fetchedAt = useRef(0);
  function loadCounts() {
    if (Date.now() - fetchedAt.current < 60_000) return;
    fetchedAt.current = Date.now();
    fetch("/admin/inbox/counts", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : {}))
      .then((d) => setUnreadBy(d && typeof d === "object" ? (d as Record<string, number>) : {}))
      .catch(() => undefined);
  }

  function toggle(id: string) {
    setCollapsed((cur) => {
      const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
      try {
        window.localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        /* storage unavailable */
      }
      return next;
    });
  }

  const active = (href: string) => (href === "/admin" ? path === "/admin" : path === href || path.startsWith(`${href}/`));
  const count = (b?: Item["badge"]) => (b === "unread" ? unread : b === "enquiries" ? newEnquiries : 0);

  return (
    <aside className="adm-side">
      <Link href="/admin" className="adm-brand" aria-label="Vexa Admin"><b className="adm-nav-label">Vexa <span>Admin</span></b></Link>
      <nav aria-label="Admin">
        {GROUPS.map((g) => {
          const folded = collapsed.includes(g.id);
          return (
            <div key={g.id} className="adm-group">
              {g.label ? (
                <button type="button" className="adm-group-label" aria-expanded={!folded} onClick={() => toggle(g.id)}>
                  <span className="adm-nav-label">{g.label}</span>
                  <Icon name="caret" size={12} />
                </button>
              ) : null}
              {!folded ? (
                <div className="adm-group-items">
                  {g.items.map((i) => {
                    const n = count(i.badge);
                    const link = (
                      <Link key={i.href} href={i.href} title={i.label} aria-current={!i.external && active(i.href) ? "page" : undefined} {...(i.external && i.href !== "/" ? { prefetch: false } : {})} {...(i.href === "/" ? { target: "_blank" } : {})}>
                        <Icon name={i.icon} size={17} />
                        <span className="adm-nav-label">{i.label}</span>
                        {n > 0 ? <b className="adm-count">{n}</b> : null}
                      </Link>
                    );
                    // the mail folders only open while the pointer or keyboard is on Inbox
                    return i.href === "/admin/inbox" ? (
                      <div key={i.href} className="adm-has-sub" onMouseEnter={loadCounts} onFocus={loadCounts}>
                        {link}
                        <div className="adm-sub" aria-label="Mail folders">
                          {MAIL_FOLDERS.map(([id, label, icon]) => (
                            <Link key={id} href={`/admin/inbox?filter=mail&folder=${id}`} className={[id === "primary" ? "adm-sub-gap" : "", unreadBy[id] ? "adm-sub-unread" : ""].join(" ").trim() || undefined}><MailIcon name={icon} size={15} /><span>{label}</span>{unreadBy[id] ? <b>{unreadBy[id] > 999 ? "999+" : unreadBy[id]}</b> : null}</Link>
                          ))}
                        </div>
                      </div>
                    ) : link;
                  })}
                </div>
              ) : null}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
