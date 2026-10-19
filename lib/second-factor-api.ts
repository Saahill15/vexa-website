import type { NextResponse } from "next/server";
import { allowAttempt } from "@/lib/accounts";
import { error } from "@/lib/account-security";
import { audit } from "@/lib/audit";
import { actorOf, type Staff } from "@/lib/staff";

/**
 * Code attempts per staff account (enrolment confirmations and sign-in codes together): 6 per 15 minutes, and at
 * most 30 a day. With three valid codes per attempt (clock drift), 30 guesses a day give someone who already has the
 * password roughly a 1 in 11,000 chance a day, instead of about 1 in 580 with the 15-minute limit alone.
 */
const ATTEMPTS = 6;
const WINDOW_MS = 15 * 60_000;
export const DAILY_ATTEMPTS = 30;
const DAY_MS = 24 * 3600_000;

function limited(staff: Staff, purpose: "enrol" | "verify", window: "15min" | "day", windowMs: number): void {
  if (!allowAttempt(`audit-second-factor-limit-${window}:${staff.id}`, 1, windowMs)) return;
  try { audit(actorOf(staff), "auth.second_factor_limited", { type: "user", id: staff.id }, { purpose, window }); } catch { /* auditing must not change the response */ }
}

/** Counts one code attempt; past either limit, refuses and records that once per window. */
export function codeAttemptLimited(staff: Staff, purpose: "enrol" | "verify"): NextResponse | null {
  if (!allowAttempt(`second-factor:${staff.id}`, ATTEMPTS, WINDOW_MS)) {
    limited(staff, purpose, "15min", WINDOW_MS);
    return error("Too many codes tried. Wait 15 minutes and try again.", 429);
  }
  if (!allowAttempt(`second-factor-day:${staff.id}`, DAILY_ATTEMPTS, DAY_MS)) {
    limited(staff, purpose, "day", DAY_MS);
    return error("Too many codes tried today. Try again tomorrow, or ask the site owner if you have lost access.", 429);
  }
  return null;
}

export function codeInput(body: Record<string, unknown>): string | null {
  return typeof body.code === "string" && body.code.length <= 32 ? body.code : null;
}
