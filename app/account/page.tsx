import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AccountPanel } from "@/components/AccountPanel";
import { getBySlug } from "@/lib/articles";
import { getSession } from "@/lib/auth";
import { listForUser } from "@/lib/comments";
import { listForEmail, STATUSES, STATUS_NOTE } from "@/lib/enquiries";
import { formatDateTime, formatShortDate, ROLE_LABEL } from "@/lib/format";
import { getUserById } from "@/lib/users";

export const metadata: Metadata = { title: "Your account", robots: { index: false } };

export default async function AccountPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=%2Faccount");
  const user = await getUserById(session.id);
  if (!user) redirect("/login?next=%2Faccount");

  // enquiries are only shown once the email address is confirmed, so nobody can read another person's enquiries
  const [comments, enquiries] = await Promise.all([listForUser(user.id), user.emailVerified ? listForEmail(user.email) : Promise.resolve([])]);
  const slugs = [...new Set(comments.map((c) => c.slug))];
  const articles = new Map(await Promise.all(slugs.map(async (slug) => [slug, await getBySlug(slug)] as const)));

  return (
    <section className="auth acc-page-section">
      <div className="wrap">
        <AccountPanel
          account={{
            name: user.name,
            email: user.email,
            role: session.role,
            memberSince: formatShortDate(user.createdAt),
            lastLogin: user.lastLoginAt ? formatShortDate(user.lastLoginAt) : null,
            passwordChanged: user.passwordChangedAt ? formatDateTime(user.passwordChangedAt) : null,
            emailVerified: user.emailVerified,
            hasPassword: Boolean(user.passwordHash),
            hasGoogle: Boolean(user.googleId),
          }}
          googleClientId={process.env.GOOGLE_CLIENT_ID ?? null}
          comments={comments.map((c) => ({ id: c.id, slug: c.slug, title: articles.get(c.slug)?.title ?? "Article", text: c.text, date: formatShortDate(c.createdAt) }))}
          enquiries={enquiries.map((e) => ({
            id: e.id,
            title: e.interest ?? "General enquiry",
            received: formatDateTime(e.at),
            status: e.status,
            statusLabel: STATUSES.find((x) => x.value === e.status)?.label ?? e.status,
            statusNote: STATUS_NOTE[e.status],
            problem: e.problem,
            // only what the person entered; admin notes never leave the server
            facts: ([
              ["Name", e.name],
              ["You are", ROLE_LABEL[e.role] ?? e.role],
              ["Interested in", e.interest],
              ["Company or channel", e.company],
              ["Budget", e.budget],
              ["Timing", e.launch],
            ] as [string, string | null][]).filter((f): f is [string, string] => Boolean(f[1])),
          }))}
        />
      </div>
    </section>
  );
}
