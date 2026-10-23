import { adminOnly } from "@/lib/admin-guard";
import { setDisabledAction, setRoleAction } from "@/app/admin/actions";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { getSession } from "@/lib/auth";
import { formatDateTime, formatShortDate } from "@/lib/format";
import { effectiveRole, isListedAdmin, listUsers } from "@/lib/users";

export const metadata = { title: "Users" };

export default async function UsersAdmin({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  await adminOnly();
  const [users, me, { error }] = await Promise.all([listUsers(), getSession(), searchParams]);
  const sorted = [...users].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  return (
    <div className="adm-page">
      <header className="adm-head"><div><h1>Users</h1><p>People with an account. Admins can use this panel; everyone else can read full articles and comment.</p></div></header>
      {error ? <p className="adm-note adm-note--error" role="alert">{error}</p> : null}

      {sorted.length === 0 ? <p className="adm-empty adm-card">No accounts yet.</p> : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead><tr><th>Person</th><th>Signed up with</th><th>Joined</th><th>Last login</th><th>Role</th><th><span className="sr-only">Actions</span></th></tr></thead>
            <tbody>
              {sorted.map((u) => {
                const role = effectiveRole(u);
                const self = u.id === me?.id;
                return (
                  <tr key={u.id} className={u.disabled ? "is-off" : ""}>
                    <td><strong>{u.name}</strong>{self ? <em className="adm-you"> you</em> : null}<small>{u.email}</small></td>
                    <td>{[u.googleId ? "Google" : "", u.passwordHash ? "Password" : ""].filter(Boolean).join(" + ")}</td>
                    <td className="nowrap">{formatShortDate(u.createdAt)}</td>
                    <td className="nowrap">{u.lastLoginAt ? formatDateTime(u.lastLoginAt) : "Never"}</td>
                    <td><span className={`adm-badge adm-badge--${role}`}>{role === "admin" ? "Admin" : "Reader"}</span>{u.disabled ? <span className="adm-badge adm-badge--off">Disabled</span> : null}{isListedAdmin(u) ? <small>via ADMIN_EMAILS</small> : null}</td>
                    <td className="adm-actions">
                      {self ? <span className="adm-faint">This is you</span> : (
                        <>
                          {!isListedAdmin(u) ? (
                            <form action={setRoleAction}><input type="hidden" name="id" value={u.id} /><input type="hidden" name="role" value={role === "admin" ? "user" : "admin"} />
                              <ConfirmButton message={role === "admin" ? `Remove admin access from ${u.name}?` : `Give ${u.name} full admin access?`} className="adm-mini">{role === "admin" ? "Remove admin" : "Make admin"}</ConfirmButton></form>
                          ) : null}
                          <form action={setDisabledAction}><input type="hidden" name="id" value={u.id} /><input type="hidden" name="disabled" value={u.disabled ? "0" : "1"} />
                            <ConfirmButton message={u.disabled ? `Let ${u.name} sign in again?` : `Disable ${u.name}? They are signed out straight away.`} className={u.disabled ? "adm-mini" : "adm-mini adm-mini--danger"}>{u.disabled ? "Enable" : "Disable"}</ConfirmButton></form>
                        </>
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
