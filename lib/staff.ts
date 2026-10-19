import { notFound, redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { getToken } from "next-auth/jwt";
import { authOptions } from "@/lib/auth";
import { allowAttempt, readerById, validReaderSession, type Reader } from "@/lib/accounts";
import { error, mutationGuard } from "@/lib/account-security";
import { accountConfigured } from "@/lib/deployment";
import { audit, type AuditActor } from "@/lib/audit";
import { secondFactorRequiredForAll, secondFactorStatus, sessionSecondFactorAt } from "@/lib/second-factor";

/**
 * Roles come only from the readers row, which only the server-side provisioning command (administrator) or an
 * administrator (moderator) can change. Nothing the browser sends is consulted.
 *  - admin: everything in /admin
 *  - moderator: comment moderation only
 */
export type StaffRole = "admin" | "moderator";
export type Permission = "dashboard" | "enquiries" | "leads" | "users" | "articles" | "comments" | "settings" | "audit";
const GRANTS: Record<StaffRole, readonly Permission[]> = {
  admin: ["dashboard", "enquiries", "leads", "users", "articles", "comments", "settings", "audit"],
  moderator: ["dashboard", "comments"],
};
/** Privileged work needs a sign-in from the last 12 hours, not a 30-day-old reader session. */
export const STAFF_FRESH_MS = 12 * 3600_000;

/**
 * Two-step sign-in state of this browser session:
 *  - verified: enrolled and this session passed the code
 *  - needs_code: enrolled, but this session signed in with a password (or Google) only
 *  - needs_enrolment: not enrolled while STAFF_TOTP_REQUIRED=true
 *  - optional: not enrolled and not yet required
 */
export type SecondFactorState = "verified" | "needs_code" | "needs_enrolment" | "optional";
export type Staff = { id: string; email: string; name: string; role: StaffRole; authTime: number | null; fresh: boolean; secondFactor: SecondFactorState };
export const secondFactorOk = (staff: Staff) => staff.secondFactor === "verified" || staff.secondFactor === "optional";

export function staffRole(reader: Pick<Reader, "admin" | "moderator" | "disabled_at">): StaffRole | null {
  if (reader.disabled_at) return null;
  if (reader.admin === 1) return "admin";
  if (reader.moderator === 1) return "moderator";
  return null;
}
export function can(role: StaffRole, permission: Permission): boolean {
  return GRANTS[role].includes(permission);
}
export function actorOf(staff: Staff): AuditActor {
  return { id: staff.id, label: staff.email };
}

type Viewer = { reader: Reader | null; authTime: number | null };
async function viewer(): Promise<Viewer> {
  if (!accountConfigured()) return { reader: null, authTime: null };
  const session = await getServerSession(authOptions);
  const id = (session?.user as { id?: string } | undefined)?.id;
  const reader = id ? readerById(id) : null;
  return { reader: reader && !reader.disabled_at ? reader : null, authTime: (session as { authTime?: number | null } | null)?.authTime ?? null };
}

/** The server-side session row behind this browser's signed cookie. Never sent to the browser. */
async function sessionId(readerId: string): Promise<string | null> {
  const token = await getToken({ req: { cookies: await cookies(), headers: {} } as unknown as Parameters<typeof getToken>[0]["req"], cookieName: authOptions.cookies?.sessionToken?.name, secret: authOptions.secret });
  const id = token?.readerSession;
  return typeof id === "string" && token?.readerId === readerId && validReaderSession(id, readerId) ? id : null;
}

export async function currentStaff(): Promise<{ staff: Staff | null; signedIn: boolean; sessionId: string | null }> {
  const { reader, authTime } = await viewer();
  if (!reader) return { staff: null, signedIn: false, sessionId: null };
  const role = staffRole(reader);
  if (!role) return { staff: null, signedIn: true, sessionId: null };
  const session = await sessionId(reader.id);
  const enrolled = secondFactorStatus(reader.id).enrolled;
  const secondFactor: SecondFactorState = enrolled ? (sessionSecondFactorAt(session) ? "verified" : "needs_code") : secondFactorRequiredForAll() ? "needs_enrolment" : "optional";
  return { staff: { id: reader.id, email: reader.email, name: reader.name, role, authTime, fresh: Boolean(authTime && Date.now() - authTime < STAFF_FRESH_MS), secondFactor }, signedIn: true, sessionId: session };
}

function noStore(response: NextResponse): NextResponse {
  response.headers.set("Cache-Control", "no-store");
  return response;
}

/** What a staff API answers when this session has not passed two-step sign-in, or null when it has. */
export function secondFactorRefusal(staff: Staff): NextResponse | null {
  if (staff.secondFactor === "needs_code") return error("Enter the code from your authenticator app at /admin/verify to continue.", 401);
  if (staff.secondFactor === "needs_enrolment") return error("Set up two-step sign-in at /admin/security before using the admin area.", 403);
  return null;
}

/**
 * Every admin API route starts here: same-origin JSON check for mutations, a recent staff sign-in, two-step
 * sign-in when it applies, the permission for this area and a per-staff rate limit. Error messages say what to
 * do, never why internally. Only the two-step endpoints themselves pass `secondFactor: false`.
 */
export async function staffApi(request: Request, permission: Permission, options: { mutation?: boolean; secondFactor?: boolean } = {}): Promise<{ staff: Staff; sessionId: string; response?: undefined } | { staff?: undefined; sessionId?: undefined; response: NextResponse }> {
  if (options.mutation !== false) {
    const blocked = mutationGuard(request);
    if (blocked) return { response: blocked };
  }
  const { staff, signedIn, sessionId: session } = await currentStaff();
  if (!staff || !session) {
    if (signedIn && !staff) {
      const { reader } = await viewer();
      if (reader && allowAttempt(`audit-denied:${reader.id}`, 3, 3600_000)) {
        try { audit({ id: reader.id, label: reader.email }, "admin.access_denied", { type: "user", id: reader.id }, { area: permission }); } catch { /* auditing must not change the response */ }
      }
      return { response: error("You do not have access to this area.", 403) };
    }
    return { response: error("Sign in to the admin area first.", 401) };
  }
  if (!staff.fresh) return { response: error("Your admin sign-in has expired. Sign in again to continue.", 401) };
  if (options.secondFactor !== false) {
    const refused = secondFactorRefusal(staff);
    if (refused) return { response: refused };
  }
  if (!can(staff.role, permission)) return { response: error("Your role does not include this area.", 403) };
  if (!allowAttempt(`admin-api:${staff.id}`, 120, 60_000)) return { response: error("Too many requests. Wait a minute and try again.", 429) };
  return { staff, sessionId: session };
}

export function ok(body: Record<string, unknown> = {}): NextResponse {
  return noStore(NextResponse.json({ ok: true, ...body }));
}

/**
 * For admin pages. Not signed in or not recent: the admin sign-in page. Not staff: a plain 404, so the area is
 * not advertised. Two-step sign-in pending: the code page, or the set-up page when enrolment is required.
 */
export async function staffPage(permission: Permission, next = "/admin", options: { secondFactor?: boolean } = {}): Promise<Staff> {
  const { staff, signedIn } = await currentStaff();
  if (!signedIn) redirect(`/admin/login?next=${encodeURIComponent(next)}`);
  if (!staff) notFound();
  if (!staff.fresh) redirect(`/admin/login?next=${encodeURIComponent(next)}&expired=1`);
  if (options.secondFactor !== false) {
    if (staff.secondFactor === "needs_code") redirect(`/admin/verify?next=${encodeURIComponent(next)}`);
    if (staff.secondFactor === "needs_enrolment") redirect(`/admin/security?next=${encodeURIComponent(next)}`);
  }
  if (!can(staff.role, permission)) redirect("/admin?denied=1");
  return staff;
}

/** Bounded integer parsing for ids and page numbers taken from URLs. */
export function intParam(value: unknown, fallback: number, max = 1_000_000): number {
  const parsed = typeof value === "string" && /^\d{1,7}$/.test(value) ? Number(value) : fallback;
  return Math.min(Math.max(parsed, 1), max);
}
export const UUID = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;

/** Only same-site /admin paths may be used as a post-sign-in destination. */
export const safeAdminNext = (value: string | undefined) => (value && /^\/admin(?:\/[A-Za-z0-9/_?=&%.-]*)?$/.test(value) ? value : "/admin");
