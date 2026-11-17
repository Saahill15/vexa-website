import { db } from "./db";

/*
 * Address suggestions for the compose window, like Gmail's: people the mailbox has exchanged mail with (learned as the
 * inbox is browsed and as mail is sent), plus accounts and enquiry senders. Everything here is best effort: if the database
 * is unavailable, the compose window simply has no suggestions.
 */

export type Contact = { email: string; name: string };

const EMAIL = /[a-z0-9._%+-]+@[a-z0-9-]+(?:\.[a-z0-9-]+)+/i;
const BOTS = /^(no-?reply|do-?not-?reply|mailer-daemon|postmaster|bounce|notifications?)[@+._-]/i;

/** Names and addresses from header values such as `"Ana Shah" <ana@x.com>, bob@y.com`. */
export function contactsFromHeaders(values: string[]): Contact[] {
  const out: Contact[] = [];
  for (const value of values) {
    for (const part of value.match(/(?:"[^"]*"|[^,"])+/g) ?? []) {
      const email = part.match(EMAIL)?.[0]?.toLowerCase();
      if (!email || BOTS.test(email)) continue;
      const name = part.replace(/<[^>]*>/g, "").replace(/"/g, "").replace(EMAIL, "").trim().slice(0, 120);
      out.push({ email, name });
    }
  }
  return out;
}

/** Saves addresses. `sent` adds weight, so people you write to rise to the top of the suggestions. */
export async function rememberContacts(list: Contact[], sent = false): Promise<void> {
  const byEmail = new Map<string, string>();
  for (const c of list) if (!byEmail.get(c.email)) byEmail.set(c.email, c.name);
  if (!byEmail.size) return;
  try {
    await db.query(
      `insert into mail_contacts (email, name, uses, last_at)
         select e, n, 1, now() from unnest($1::text[], $2::text[]) as t(e, n)
       on conflict (email) do update
         set name = coalesce(nullif(excluded.name, ''), mail_contacts.name),
             uses = mail_contacts.uses + $3, last_at = now()`,
      [[...byEmail.keys()], [...byEmail.values()], sent ? 3 : 0],
    );
  } catch {
    /* suggestions are a convenience */
  }
}

/** Matches on any part of the name or address; frequent and recent contacts first. */
export async function searchContacts(q: string, own: string[] = [], limit = 8): Promise<Contact[]> {
  const term = q.trim().slice(0, 80);
  if (!term) return [];
  const like = `%${term.replace(/[\\%_]/g, (m) => `\\${m}`)}%`;
  try {
    const { rows } = await db.query<{ email: string; name: string }>(
      `select email, max(name) as name from (
         select email, name, uses * 10 as score from mail_contacts where email ilike $1 or name ilike $1
         union all select email, name, 2 from users where email ilike $1 or name ilike $1
         union all select email, coalesce(name, '') as name, 1 from enquiries where email ilike $1 or coalesce(name, '') ilike $1
       ) s
       where not (email = any($2::text[]))
       group by email order by sum(score) desc, email limit $3`,
      [like, own.map((e) => e.toLowerCase()), limit],
    );
    return rows;
  } catch {
    return [];
  }
}
