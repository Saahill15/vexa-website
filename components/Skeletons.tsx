/* Placeholders shown while a page or a pane loads. They match the shape of what is coming, and appear after a short delay. */

export function Spinner({ label = "Loading" }: { label?: string }) {
  return <span className="spin" role="status" aria-label={label} />;
}

export function InboxRowsSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="skel-inbox-row" aria-hidden="true">
          <span className="skel skel-ico" />
          <span className="skel-stack">
            <span className="skel skel-line w60" />
            <span className="skel skel-line w95" />
          </span>
          <span className="skel skel-time" />
        </div>
      ))}
    </>
  );
}

/** The right-hand pane while a conversation or message opens. */
export function ThreadSkeleton() {
  return (
    <div className="skel-detail loading" aria-busy="true">
      <span className="sr-only">Loading the conversation</span>
      <span className="skel skel-title w60" />
      <span className="skel skel-line w30" />
      <span className="skel skel-block" />
      <span className="skel skel-block" />
      <span className="loading-note"><Spinner label="Opening the conversation" /> Opening the conversation…</span>
    </div>
  );
}

/** The inbox list while it loads: the title, a short message, and placeholder rows. */
export function InboxListSkeleton() {
  return (
    <div className="loading" aria-busy="true">
      <header className="adm-inbox-head">
        <h1>Inbox</h1>
      </header>
      <p className="loading-note" style={{ padding: "6px 16px 10px" }}><Spinner label="Loading the inbox" /> Loading your mail…</p>
      <InboxRowsSkeleton rows={9} />
    </div>
  );
}

/** The whole inbox while its page first loads: list on the left, a quiet pane on the right. */
export function InboxSkeleton() {
  return (
    <div className="adm-inbox" aria-busy="true">
      <section className="adm-inbox-list" aria-label="Loading the inbox">
        <InboxListSkeleton />
      </section>
      <section className="adm-inbox-detail" aria-hidden="true">
        <div className="skel-detail loading">
          <span className="skel skel-title w40" />
          <span className="skel skel-line w30" />
          <span className="skel skel-block" />
        </div>
      </section>
    </div>
  );
}

/** Generic page while its data loads: a heading and a few cards. */
export function PageSkeleton({ label = "Loading" }: { label?: string }) {
  return (
    <div className="wrap loading" aria-busy="true">
      <div className="skel-page">
        <span className="sr-only">{label}</span>
        <span className="skel skel-title w40" />
        <span className="skel skel-line w60" />
        <span className="skel skel-block" />
        <span className="skel skel-block" />
      </div>
    </div>
  );
}
