import Link from "next/link";
import { adminOnly } from "@/lib/admin-guard";
import { setDisabledAction, setRoleAction } from "@/app/admin/actions";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { RowMenu } from "@/components/admin/RowMenu";
import { getSession } from "@/lib/auth";
import { ago, formatDateTime, formatShortDate } from "@/lib/format";
import { effectiveRole, isListedAdmin, listUsers } from "@/lib/users";

export const metadata = { title: "Users" };

const DAY = 86_400_000;
const FILTERS = [
  { value: "all", label: "All" },
  { value: "admin", label: "Admins" },
  { value: "reader", label: "Readers" },
  { value: "disabled", label: "Disabled" },
] as const;
const SORTS = [
  { value: "joined", label: "Newest first" },
  { value: "login", label: "Last sign-in" },
  { value: "name", label: "Name A to Z" },
] as const;
const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("") || "?";
const when = (iso: string) => ago(iso) || formatShortDate(iso);

export default async function UsersAdmin({ searchParams }: { searchParams: Promise<{ error?: string; filter?: string; q?: string; sort?: string }> }) {
  await adminOnly();
  const [users, me, params] = await Promise.all([listUsers(), getSession(), searchParams]);
  const { error, q = "" } = params;
  const filter = FILTERS.some((f) => f.value === params.filter) ? params.filter! : "all";
  const sort = SORTS.some((s) => s.value === params.sort) ? params.sort! : "joined";

  const now = Date.now();
  const isAdmin = (u: (typeof users)[number]) => effectiveRole(u) === "admin";
  const counts = {
    all: users.length,
    admin: users.filter(isAdmin).length,
    reader: users.filter((u) => !isAdmin(u)).length,
    disabled: users.filter((u) => u.disabled).length,
  };
  const week = users.filter((u) => now - Date.parse(u.createdAt) < 7 * DAY).length;
  const active = users.filter((u) => u.lastLoginAt && now - Date.parse(u.lastLoginAt) < 30 * DAY).length;

  const needle = q.trim().toLowerCase();
  const shown = users
    .filter((u) => (filter === "all" ? true : filter === "disabled" ? u.disabled : filter === "admin" ? isAdmin(u) : !isAdmin(u)))
    .filter((u) => !needle || `${u.name} ${u.email}`.toLowerCase().includes(needle))
    .sort((a, b) =>
      sort === "name" ? a.name.localeCompare(b.name) : sort === "login" ? Date.parse(b.lastLoginAt ?? "0") - Date.parse(a.lastLoginAt ?? "0") : Date.parse(b.createdAt) - Date.parse(a.createdAt),
    );
  const href = (patch: Record<string, string>) => {
    const p = new URLSearchParams({ filter, sort, ...(q ? { q } : {}), ...patch });
    if (p.get("filter") === "all") p.delete("filter");
    if (p.get("sort") === "joined") p.delete("sort");
    const s = p.toString();
    return `/admin/users${s ? `?${s}` : ""}`;
  };

  const tiles = [
    { label: "Accounts", value: counts.all, note: `${week} new this week` },
    { label: "Admins", value: counts.admin, note: "can use this panel" },
    { label: "Readers", value: counts.reader, note: "can read and comment" },
    { label: "Active, last 30 days", value: active, note: "signed in at least once" },
  ];

  return (
    <div className="adm-page dash">
      <header className="adm-head"><div><h1>Users</h1><p>People with an account. Admins can use this panel; everyone else can read full articles and comment.</p></div></header>
      {error ? <p className="adm-note adm-note--error" role="alert">{error}</p> : null}

      <div className="dash-tiles usr-tiles">
        {tiles.map((t) => (
          <div key={t.label} className="dash-tile"><span>{t.label}</span><strong>{t.value}</strong><small>{t.note}</small></div>
        ))}
      </div>

      <div className="adm-toolbar">
        <nav className="adm-tabs" aria-label="Filter users">
          {FILTERS.map((f) => (
            <Link key={f.value} href={href({ filter: f.value })} aria-current={filter === f.value ? "page" : undefined}>
              {f.label} <span>{counts[f.value]}</span>
            </Link>
          ))}
        </nav>
        <form className="adm-search usr-search" action="/admin/users">
          {filter !== "all" ? <input type="hidden" name="filter" value={filter} /> : null}
          <input className="in" type="search" name="q" defaultValue={q} placeholder="Search name or email" aria-label="Search users" />
          <select className="in" name="sort" defaultValue={sort} aria-label="Sort users">
            {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <button type="submit" className="btn btn--sm btn--line">Apply</button>
        </form>
      </div>

      {shown.length === 0 ? (
        <p className="adm-empty adm-card">{users.length === 0 ? "No accounts yet." : "No users match that filter."}</p>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table usr-table">
            <thead><tr><th>Person</th><th>Signed up with</th><th>Joined</th><th>Last sign-in</th><th>Role</th><th className="usr-act"><span className="sr-only">Actions</span></th></tr></thead>
            <tbody>
              {shown.map((u) => {
                const role = effectiveRole(u);
                const self = u.id === me?.id;
                return (
                  <tr key={u.id} className={u.disabled ? "is-off" : ""}>
                    <td>
                      <div className="usr-who">
                        <span className="usr-av" aria-hidden="true">{initials(u.name)}</span>
                        <div><strong>{u.name}</strong>{self ? <em className="adm-you"> you</em> : null}<small>{u.email}</small></div>
                      </div>
                    </td>
                    <td>{[u.googleId ? "Google" : "", u.passwordHash ? "Password" : ""].filter(Boolean).join(" + ") || "Not set"}</td>
                    <td className="nowrap">{formatShortDate(u.createdAt)}</td>
                    <td className="nowrap">{u.lastLoginAt ? <span title={formatDateTime(u.lastLoginAt)}>{when(u.lastLoginAt)}</span> : <span className="adm-faint">Never</span>}</td>
                    <td><span className={`adm-badge adm-badge--${role}`}>{role === "admin" ? "Admin" : "Reader"}</span>{u.disabled ? <span className="adm-badge adm-badge--off">Disabled</span> : null}{isListedAdmin(u) ? <small>via ADMIN_EMAILS</small> : null}</td>
                    <td className="usr-act">
                      {self ? <span className="adm-faint">This is you</span> : (
                        <RowMenu label={`Actions for ${u.name}`}>
                          <a href={`mailto:${u.email}`} role="menuitem">Email {u.name.split(" ")[0]}</a>
                          {!isListedAdmin(u) ? (
                            <form action={setRoleAction}><input type="hidden" name="id" value={u.id} /><input type="hidden" name="role" value={role === "admin" ? "user" : "admin"} />
                              <ConfirmButton role="menuitem" message={role === "admin" ? `Remove admin access from ${u.name}?` : `Give ${u.name} full admin access?`}>{role === "admin" ? "Remove admin" : "Make admin"}</ConfirmButton></form>
                          ) : null}
                          <form action={setDisabledAction}><input type="hidden" name="id" value={u.id} /><input type="hidden" name="disabled" value={u.disabled ? "0" : "1"} />
                            <ConfirmButton role="menuitem" message={u.disabled ? `Let ${u.name} sign in again?` : `Disable ${u.name}? They are signed out straight away.`} className={u.disabled ? "" : "is-danger"}>{u.disabled ? "Enable" : "Disable"}</ConfirmButton></form>
                        </RowMenu>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
