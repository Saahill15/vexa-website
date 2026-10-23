/*
 * Every time the site stores or shows is in India Standard Time (IST, UTC+05:30). IST has no daylight saving, so the
 * offset never changes. Stored times carry the offset, for example 2026-10-23T18:30:00.000+05:30.
 */
export const IST_ZONE = "Asia/Kolkata";
const IST_OFFSET_MS = 5.5 * 3600_000;

/** A moment as an ISO timestamp in IST, for storing. */
export function istIso(ms: number = Date.now()): string {
  return new Date(ms + IST_OFFSET_MS).toISOString().replace("Z", "+05:30");
}

/** The IST calendar date (YYYY-MM-DD) of a moment. */
export const istDate = (ms: number = Date.now()): string => istIso(ms).slice(0, 10);
