import crypto from "crypto";
import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions, googleEnabled } from "@/lib/auth";
import { getLeadRole } from "@/lib/db";

export const LEAD_COOKIE = process.env.NODE_ENV === "production" ? "__Host-vexa-public-lead" : "vexa-public-lead";

export type Viewer = { email: string; via: "google" | "email"; role: string | null };

function secret(): string {
  const value = process.env.LEAD_COOKIE_SECRET || process.env.NEXTAUTH_SECRET || "";
  if (value) return value;
  // A fixed secret is fine on a developer's machine. In production the cookie route stays off without a real one.
  return process.env.NODE_ENV === "production" ? "" : "dev-only-secret";
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function canRememberLead(): boolean {
  return Boolean(secret());
}

/** The email route has no inbox check: this cookie only remembers the email this browser gave us. */
export function makeLeadCookie(email: string): string {
  if (!canRememberLead()) throw new Error("Email access is not configured.");
  const payload = Buffer.from(email.toLowerCase()).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

function readLeadCookie(value: string | undefined): string | null {
  if (!value || !secret()) return null;
  const [payload, signature] = value.split(".");
  if (!payload || !signature) return null;
  const expected = sign(payload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  return Buffer.from(payload, "base64url").toString("utf8");
}

export async function getViewer(): Promise<Viewer | null> {
  const session = googleEnabled ? await getServerSession(authOptions) : null;
  const googleEmail = session?.user?.email?.toLowerCase();
  if (googleEmail) return { email: googleEmail, via: "google", role: getLeadRole(googleEmail) };
  const cookieEmail = readLeadCookie((await cookies()).get(LEAD_COOKIE)?.value);
  if (cookieEmail) return { email: cookieEmail, via: "email", role: getLeadRole(cookieEmail) };
  return null;
}
