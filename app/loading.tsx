import { Spinner } from "@/components/Skeletons";

/** Shown while a page that needs fresh data (an article, the account page) is on its way. It appears only if the wait is noticeable. */
export default function Loading() {
  return (
    <div className="loading-center loading" aria-busy="true">
      <span className="loading-note"><Spinner label="Loading the page" /> Loading…</span>
    </div>
  );
}
