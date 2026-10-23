import { adminOnly } from "@/lib/admin-guard";
import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteEnquiryAction, saveEnquiryAction } from "@/app/admin/actions";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { getEnquiry, STATUSES } from "@/lib/enquiries";
import { formatDateTime, ROLE_LABEL } from "@/lib/format";

export const metadata = { title: "Enquiry" };

const EMAILED = { delivered: "Emailed to the inbox", failed: "Email to the inbox failed", not_configured: "Saved only (email not connected)" } as const;

export default async function EnquiryPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  await adminOnly();
  const e = await getEnquiry((await params).id);
  if (!e) notFound();
  const { saved } = await searchParams;
  const subject = encodeURIComponent("Re: your message to Vexa Digital");

  const rows: [string, React.ReactNode][] = [
    ["Name", e.name || "Not given"],
    ["Email", <a key="m" href={`mailto:${e.email}?subject=${subject}`}>{e.email}</a>],
    ["Is", ROLE_LABEL[e.role] ?? e.role],
    ["Interested in", e.interest || "Not specified"],
    ["Company or channel", e.company || "Not given"],
    ["Timing", e.launch || "Not given"],
    ["Received", formatDateTime(e.at)],
    ["Inbox email", EMAILED[e.emailed]],
  ];

  return (
    <div className="adm-page">
      <Link href="/admin/enquiries" className="adm-back">← All enquiries</Link>
      <header className="adm-head"><div><h1>{e.name || e.email}</h1><p>Enquiry received {formatDateTime(e.at)}</p></div>
        <a className="btn btn--sm" href={`mailto:${e.email}?subject=${subject}`}>Reply by email</a>
      </header>
      {saved ? <p className="adm-note">Saved.</p> : null}

      <div className="adm-cols adm-cols--detail">
        <section className="adm-card">
          <div className="adm-card-head"><h2>Message</h2></div>
          <p className="adm-body">{e.problem}</p>
          <dl className="adm-dl">{rows.map(([k, v]) => (<div key={k}><dt>{k}</dt><dd>{v}</dd></div>))}</dl>
        </section>

        <section className="adm-card">
          <div className="adm-card-head"><h2>Follow-up</h2></div>
          <form action={saveEnquiryAction} className="form">
            <input type="hidden" name="id" value={e.id} />
            <div className="field">
              <label htmlFor="status">Status</label>
              <select id="status" name="status" className="in" defaultValue={e.status}>
                {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="notes">Private notes <span>(only admins see these)</span></label>
              <textarea id="notes" name="notes" className="in" rows={6} maxLength={5000} defaultValue={e.notes} />
            </div>
            <button type="submit" className="btn">Save changes</button>
          </form>
          <form action={deleteEnquiryAction} className="adm-danger">
            <input type="hidden" name="id" value={e.id} />
            <ConfirmButton message="Delete this enquiry for good?" className="adm-delete">Delete enquiry</ConfirmButton>
          </form>
        </section>
      </div>
    </div>
  );
}
