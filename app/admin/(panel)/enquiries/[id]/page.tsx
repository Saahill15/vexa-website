export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import styles from "@/components/admin/Admin.module.css";
import { ActionButton, NoteForm, SelectAction } from "@/components/admin/actions";
import { Badge, Empty, Header, LoadError, when } from "@/components/admin/ui";
import { assignableStaff, getEnquiry, notesFor } from "@/lib/admin-data";
import { AUDIT_LABELS, auditFor } from "@/lib/audit";
import { ENQUIRY_STATUSES } from "@/lib/enquiries";
import { intParam, staffPage } from "@/lib/staff";

export const metadata: Metadata = { title: "Enquiry" };
const AUDIENCE: Record<string, string> = { brand: "A brand", organisation: "An esports business", other: "A creator or another enquiry" };
const WEBHOOK: Record<string, string> = { delivered: "Delivered", failed: "Failed", not_configured: "No webhook configured" };

export default async function EnquiryPage({ params }: { params: Promise<{ id: string }> }) {
  const raw = (await params).id;
  await staffPage("enquiries", `/admin/enquiries/${encodeURIComponent(raw)}`);
  const id = intParam(raw, 0);
  let data;
  try {
    const enquiry = getEnquiry(id);
    data = enquiry ? { enquiry, notes: notesFor("enquiry", id), history: auditFor("enquiry", id), staff: assignableStaff() } : null;
  } catch {
    return <><Header title="Enquiry" back={{ href: "/admin/enquiries", label: "Enquiries" }} /><LoadError what="This enquiry" /></>;
  }
  if (!data) notFound();
  const { enquiry, notes, history, staff } = data;
  const endpoint = `/api/admin/enquiries/${enquiry.id}`;
  return <>
    <Header title={enquiry.name || enquiry.email} intro={`Received ${when(enquiry.created_at)}`} back={{ href: "/admin/enquiries", label: "Enquiries" }}>
      <a className={`${styles.button} ${styles.secondary}`} href={`mailto:${encodeURIComponent(enquiry.email)}?subject=${encodeURIComponent("Your message to VEXA")}`}>Reply by email</a>
    </Header>
    <div className={styles.two}>
      <div>
        <section className={styles.panel}><h2>Message</h2><div className={styles.message}>{enquiry.problem}</div></section>
        <section className={styles.panel}><h2>Details</h2>
          <dl className={styles.dl}>
            <dt>Name</dt><dd>{enquiry.name || "—"}</dd>
            <dt>Email</dt><dd>{enquiry.email}</dd>
            <dt>Company or channel</dt><dd>{enquiry.company || "—"}</dd>
            <dt>Who they are</dt><dd>{AUDIENCE[enquiry.role ?? ""] ?? enquiry.role ?? "—"}</dd>
            <dt>Starting point</dt><dd>{enquiry.interest || "—"}</dd>
            <dt>Timing</dt><dd>{enquiry.launch || "—"}</dd>
            {enquiry.budget ? <><dt>Budget</dt><dd>{enquiry.budget}</dd></> : null}
            <dt>Heard about VEXA</dt><dd>{enquiry.source || "—"}</dd>
            <dt>Consent to reply</dt><dd>{enquiry.consent ? "Given" : "Not recorded"}</dd>
            <dt>Saved via</dt><dd>{enquiry.origin === "fallback-file" ? "Fallback file (imported)" : "Website form"}</dd>
            <dt>Last updated</dt><dd>{when(enquiry.updated_at)}</dd>
          </dl>
        </section>
        <section className={styles.panel}><h2>Internal notes</h2>
          <NoteForm endpoint={endpoint} />
          {notes.length ? <div className={styles.notes}>{notes.map((note) => <div key={note.id} className={styles.note}><p>{note.body}</p><span className={styles.muted}>{note.author_label} · {when(note.created_at)}</span></div>)}</div> : <p className={styles.muted} style={{ marginTop: 12 }}>No notes yet.</p>}
        </section>
      </div>
      <div>
        <section className={styles.panel}><h2>Workflow</h2>
          <p style={{ marginBottom: 12 }}><Badge value={enquiry.status} label={ENQUIRY_STATUSES.find((s) => s.value === enquiry.status)?.label} /></p>
          <div className={styles.form} style={{ marginTop: 0 }}>
            <SelectAction endpoint={endpoint} action="status" field="status" value={enquiry.status} label="Status" options={ENQUIRY_STATUSES.map((s) => ({ value: s.value, label: s.label }))} />
            <SelectAction endpoint={endpoint} action="assign" field="assignedTo" value={enquiry.assigned_to ?? ""} label="Owner" options={[{ value: "", label: "Unassigned" }, ...staff.map((person) => ({ value: person.id, label: person.label }))]} />
          </div>
        </section>
        <section className={styles.panel}><h2>Notification</h2>
          <p>{enquiry.webhook_status ? <Badge value={enquiry.webhook_status} label={WEBHOOK[enquiry.webhook_status] ?? enquiry.webhook_status} /> : <span className={styles.muted}>Not recorded (received before delivery tracking, or imported)</span>}</p>
          {enquiry.webhook_detail ? <p className={styles.muted} style={{ marginTop: 6 }}>{enquiry.webhook_detail} · {when(enquiry.webhook_at)}</p> : null}
          {enquiry.webhook_status !== "delivered" ? <div style={{ marginTop: 12 }}><ActionButton endpoint={endpoint} body={{ action: "retry-webhook" }} label="Send notification again" /></div> : null}
        </section>
        <section className={styles.panel}><h2>History</h2>
          {history.length ? <ul className={styles.history}>{history.map((row) => { const detail = row.metadata ? Object.entries(JSON.parse(row.metadata) as Record<string, unknown>).filter(([key]) => key !== "length").map(([key, value]) => `${key}: ${String(value).replace(/_/g, " ")}`).join(", ") : ""; return <li key={row.id}>{AUDIT_LABELS[row.action] ?? row.action}{detail ? <span className={styles.muted}> · {detail}</span> : null}<div className={styles.muted}>{row.actor_label} · {when(row.at)}</div></li>; })}</ul> : <Empty>No changes yet.</Empty>}
        </section>
      </div>
    </div>
  </>;
}
