"use client";

import { useEffect, useRef, useState } from "react";

type Contact = { email: string; name: string; photo?: string };

/* No photos are available for these people, so each gets a letter on a colour that stays the same for the same address. */
const TINTS = [["#d9f2f0", "#064b4a"], ["#fde8d8", "#8a3b0c"], ["#e4e6fb", "#3a3f9e"], ["#fbe3ee", "#8e1f55"], ["#e6f3d6", "#3d6414"], ["#fff1c9", "#7a5200"], ["#e1ecf8", "#1f4f86"], ["#eadff7", "#5b2d91"]] as const;
const tint = (email: string) => {
  let h = 0;
  for (const ch of email) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const [bg, fg] = TINTS[h % TINTS.length];
  return { background: bg, color: fg };
};

/**
 * An address field with suggestions like Gmail's: as you type, people you have exchanged mail with are offered in a list.
 * The part after the last comma is what is matched; choosing a suggestion fills it in and starts the next address.
 */
export function RecipientInput({ name, defaultValue, maxLength = 600, className, placeholder }: { name: string; defaultValue?: string; maxLength?: number; className?: string; placeholder?: string }) {
  const [value, setValue] = useState(defaultValue ?? "");
  const [items, setItems] = useState<Contact[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const activeRef = useRef(0);
  const typed = useRef(false); // suggestions appear only after the person types, not for the value the field starts with

  activeRef.current = active;
  const token = value.split(/[,;]/).pop()!.trim();
  const already = new Set((value.match(/[a-z0-9._%+-]+@[a-z0-9-]+(?:\.[a-z0-9-]+)+/gi) ?? []).map((e) => e.toLowerCase()));

  useEffect(() => {
    if (!typed.current || token.length < 1) {
      setItems([]);
      return;
    }
    const controller = new AbortController();
    const ask = (full: boolean) =>
      fetch(`/api/admin/contacts?q=${encodeURIComponent(token)}${full ? "&full=1" : ""}`, { signal: controller.signal })
        .then((r) => (r.ok ? r.json() : { contacts: [] }))
        .then((d: { contacts?: Contact[] }) => {
          // the address being typed is not offered again, and neither are ones already in the field
          const list = (d.contacts ?? []).filter((c) => !already.has(c.email.toLowerCase()));
          setItems((prev) => {
            // when the fuller list arrives, the highlighted person stays highlighted
            const keep = full ? prev[activeRef.current]?.email : undefined;
            const at = keep ? list.findIndex((c) => c.email === keep) : -1;
            setActive(at >= 0 ? at : 0);
            return list;
          });
          setOpen(list.length > 0);
        });
    const timer = setTimeout(() => {
      // the site's own list shows at once; Google's people and photos follow a moment later
      ask(false).then(() => ask(true)).catch(() => undefined);
    }, 140);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  function choose(c: Contact) {
    const head = value.slice(0, value.length - value.split(/[,;]/).pop()!.length).replace(/\s+$/, "");
    setValue(`${head ? `${head} ` : ""}${c.email}, `);
    setItems([]);
    setOpen(false);
    typed.current = false;
    input.current?.focus();
  }

  return (
    <span className="rcpt">
      <input
        ref={input}
        name={name}
        className={className}
        placeholder={placeholder}
        maxLength={maxLength}
        autoComplete="off"
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        value={value}
        onChange={(e) => {
          typed.current = true;
          setValue(e.target.value);
        }}
        onFocus={() => items.length && setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={(e) => {
          if (!open || !items.length) return;
          if (e.key === "ArrowDown") { e.preventDefault(); setActive((i) => (i + 1) % items.length); }
          else if (e.key === "ArrowUp") { e.preventDefault(); setActive((i) => (i - 1 + items.length) % items.length); }
          else if (e.key === "Enter" || e.key === "Tab") { e.preventDefault(); choose(items[active]); }
          else if (e.key === "Escape") { e.stopPropagation(); setOpen(false); }
        }}
      />
      {open && items.length ? (
        <ul className="rcpt-list" role="listbox">
          {items.map((c, i) => (
            <li key={c.email} role="option" aria-selected={i === active} className={i === active ? "is-on" : undefined} onMouseDown={(e) => { e.preventDefault(); choose(c); }} onMouseEnter={() => setActive(i)}>
              <span className="rcpt-av" style={tint(c.email)} aria-hidden="true">{c.photo ? <img src={c.photo} alt="" referrerPolicy="no-referrer" onError={(ev) => { ev.currentTarget.style.display = "none"; }} /> : null}{(c.name || c.email).charAt(0).toUpperCase()}</span>
              <span className="rcpt-who"><b>{c.name || c.email}</b>{c.name ? <small>{c.email}</small> : null}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </span>
  );
}
