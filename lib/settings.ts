import { getDb } from "@/lib/db";

// Only operational switches that are safe to change from the browser live here. Secrets and paths never do.
export function registrationOpen(): boolean {
  try {
    const row = getDb().prepare("SELECT value FROM site_settings WHERE key = 'registration_open'").get() as { value: string } | undefined;
    return row?.value !== "0";
  } catch {
    return true;
  }
}

export function setRegistrationOpen(open: boolean, actorId: string): void {
  getDb()
    .prepare("INSERT INTO site_settings (key, value, updated_at, updated_by) VALUES ('registration_open', ?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at, updated_by = excluded.updated_by")
    .run(open ? "1" : "0", new Date().toISOString(), actorId);
}
