import { notFound } from "next/navigation";
import { getSession } from "./auth";

/**
 * Call this first in every admin page, before reading any data. The admin layout also checks, but layouts and
 * pages are rendered side by side, so a page that skipped this would still send its data to a non-admin.
 */
export async function adminOnly() {
  const session = await getSession();
  if (!session || session.role !== "admin") notFound();
  return session;
}
