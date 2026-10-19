export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import styles from "@/components/admin/Admin.module.css";
import { NoteForm, SelectAction } from "@/components/admin/actions";
import { Empty, Header, LoadError, when } from "@/components/admin/ui";
import { getLead, LEAD_STATUSES, notesFor } from "@/lib/admin-data";
import { AUDIT_LABELS, auditFor } from "@/lib/audit";
import { ROLES } from "@/lib/roles";
import { intParam, staffPage } from "@/lib/staff";

export const metadata: Metadata = { title: "Lead" };

export default async function LeadPage({ params }: { params: Promise<{ id: string }> }) {
  const raw = (await params).id;
  await staffPage("leads", `/admin/leads/${encodeURIComponent(raw)}`);
  const id = intParam(raw, 0);
  let data;
  try {
    const lead = getLead(id);
    data = lead ? { lead, notes: notesFor("lead", id), history: auditFor("lead", id) } : null;
  } catch {
    return <><Header title="Lead" back={{ href: "/admin/leads", label: "Leads" }} /><LoadError what="This lead" /></>;
  }
  if (!data) notFound();
  const { lead, notes, history } = data;
  const endpoint = `/api/admin/leads/${lead.id}`;
  return <>
    <Header title={lead.name || lead.email} intro={`Joined ${when(lead.created_at)}`} back={{ href: "/admin/leads", label: "Leads" }} />
    <div className={styles.two}>
      <div>
        <section className={styles.panel}><h2>Details</h2>
          <dl className={styles.dl}>
            <dt>Name</dt><dd>{lead.name || "—"}</dd>
            <dt>Email</dt><dd>{lead.email}</dd>
            <dt>Describes themself as</dt><dd>{ROLES.find((r) => r.value === lead.role)?.label ?? lead.role ?? "—"}</dd>
            <dt>WhatsApp</dt><dd>{lead.whatsapp_consent ? lead.whatsapp || "Consent given, no number" : lead.whatsapp ? "Number given without WhatsApp consent: do not contact on WhatsApp" : "—"}</dd>
            <dt>Consent</dt><dd>Agreed to have details saved (required by the form){lead.whatsapp_consent ? "; agreed to WhatsApp contact" : ""}</dd>
            <dt>Source</dt><dd>{lead.source_slug || "—"}</dd>
            <dt>UTM source</dt><dd>{lead.utm_source || "—"}</dd>
            <dt>Signed up with</dt><dd>{lead.signed_in_with === "google" ? "Google" : "Email address"}</dd>
            <dt>Last seen</dt><dd>{when(lead.last_seen)}</dd>
            <dt>Last updated</dt><dd>{when(lead.updated_at)}</dd>
          </dl>
        </section>
        <section className={styles.panel}><h2>Internal notes</h2>
          <NoteForm endpoint={endpoint} />
          {notes.length ? <div className={styles.notes}>{notes.map((note) => <div key={note.id} className={styles.note}><p>{note.body}</p><span className={styles.muted}>{note.author_label} · {when(note.created_at)}</span></div>)}</div> : <p className={styles.muted} style={{ marginTop: 12 }}>No notes yet.</p>}
        </section>
      </div>
      <div>
        <section className={styles.panel}><h2>Follow-up</h2>
          <SelectAction endpoint={endpoint} action="status" field="status" value={lead.status} label="Status" options={LEAD_STATUSES.map((s) => ({ value: s.value, label: s.label }))} />
        </section>
        <section className={styles.panel}><h2>History</h2>
          {history.length ? <ul className={styles.history}>{history.map((row) => <li key={row.id}>{AUDIT_LABELS[row.action] ?? row.action}<div className={styles.muted}>{row.actor_label} · {when(row.at)}</div></li>)}</ul> : <Empty>No changes yet.</Empty>}
        </section>
      </div>
    </div>
  </>;
}
