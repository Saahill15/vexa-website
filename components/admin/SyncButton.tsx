"use client";

import { useFormStatus } from "react-dom";

/** Submit button for the sync form: shows that a sync is running, cannot be clicked twice, and draws a progress bar. */
export function SyncButton() {
  const { pending } = useFormStatus();
  return (
    <>
      <button type="submit" className="adm-mini" disabled={pending} aria-busy={pending}>
        {pending ? (
          <>
            <span className="spin" aria-hidden="true" style={{ width: 12, height: 12, borderWidth: 2, marginRight: 6, verticalAlign: -2 }} />
            Syncing…
          </>
        ) : (
          "Sync"
        )}
      </button>
      {pending ? <span className="progress" role="progressbar" aria-label="Syncing mail" /> : null}
    </>
  );
}
