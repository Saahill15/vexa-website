import { adminOnly } from "@/lib/admin-guard";
import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteEnquiryAction, saveEnquiryAction } from "@/app/admin/actions";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { StatusDot } from "@/components/admin/StatusDot";
import { getEnquiry, listForEmail, STATUSES } from "@/lib/enquiries";
import { formatDateTime, ROLE_LABEL } from "@/lib/format";

export const metadata = { title: "Enquiry" };

const EMAILED = { delivered: "Emailed to the inbox", failed: "Email to the inbox failed", not_configured: "Saved only (email not connected)" } as const;
const label = (v: string) => STATUSES.find((s) => s.value === v)?.label ?? v;

export default async function EnquiryPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  await adminOnly();
  const e = await getEnquiry((await params).id);
  if (!e) notFound();
  const { saved } = await searchParams;
  const earlier = (await listForEmail(e.email)).filter((x) => x.id !== e.id).slice(0, 5);
  const subject = encodeURIComponent("Re: your message to Vexa Digital");
  const mailto = `mailto:${e.email}?subject=${subject}`;
  const who = e.name || e.email;
  const initials = who.split(/[\s@.]+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("") || "?";

  const facts: [string, string][] = [
    ["Is a", ROLE_LABEL[e.role] ?? e.role],
    ["Interested in", e.interest || "Not specified"],
    ["Company or channel", e.company || "Not given"],
    ["Timing", e.launch || "Not given"],
  ];

  return (
    <div className="adm-page enq">
      <Link href="/admin/enquiries" className="adm-back">← All enquiries</Link>

      <header className="enq-head">
        <span className="enq-avatar" aria-hidden="true">{initials}</span>
        <div className="enq-id">
          <h1>{who}</h1>
          <p><a href={mailto}>{e.email}</a> · received {formatDateTime(e.at)}</p>
        </div>
        <span className={`enq-status enq-status--${e.status}`}><StatusDot status={e.status} />{label(e.status)}</span>
        <a className="btn btn--sm" href={mailto}>Reply by email</a>
      </header>
      {saved ? <p className="adm-note" role="status">Saved.</p> : null}

      <div className="enq-grid">
        <div className="enq-main">
          <section className="adm-card enq-msg">
            <h2>Message</h2>
            <p>{e.problem}</p>
          </section>

          <section className="adm-card">
            <h2 className="enq-h">About this enquiry</h2>
            <dl className="enq-facts">
              {facts.map(([k, v]) => (<div key={k}><dt>{k}</dt><dd>{v}</dd></div>))}
              <div><dt>Received</dt><dd>{formatDateTime(e.at)}</dd></div>
              <div><dt>Inbox email</dt><dd>{EMAILED[e.emailed]}</dd></div>
            </dl>
          </section>

          {earlier.length ? (
            <section className="adm-card">
              <h2 className="enq-h">Earlier from {e.email}</h2>
              <ul className="enq-earlier">
                {earlier.map((x) => (
                  <li key={x.id}>
                    <Link href={`/admin/enquiries/${x.id}`}><StatusDot status={x.status} /><span>{x.problem.length > 90 ? `${x.problem.slice(0, 90)}…` : x.problem}</span><small>{formatDateTime(x.at)}</small></Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        <aside className="enq-side">
          <section className="adm-card">
            <h2 className="enq-h">Follow-up</h2>
            <form action={saveEnquiryAction} className="form">
              <input type="hidden" name="id" value={e.id} />
              <fieldset className="enq-pick">
                <legend>Status</legend>
                {STATUSES.map((s) => (
                  <label key={s.value}><input type="radio" name="status" value={s.value} defaultChecked={e.status === s.value} /><span><StatusDot status={s.value} />{s.label}</span></label>
                ))}
              </fieldset>
              <div className="field">
                <label htmlFor="notes">Private notes <span>(only admins see these)</span></label>
                <textarea id="notes" name="notes" className="in" rows={6} maxLength={5000} defaultValue={e.notes} />
              </div>
              <button type="submit" className="btn">Save changes</button>
            </form>
          </section>

          <form action={deleteEnquiryAction} className="enq-danger">
            <input type="hidden" name="id" value={e.id} />
            <ConfirmButton message="Delete this enquiry for good?" className="adm-delete">Delete enquiry</ConfirmButton>
          </form>
        </aside>
      </div>
    </div>
  );
}
