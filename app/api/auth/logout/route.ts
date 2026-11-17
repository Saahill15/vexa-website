import { audit } from "@/lib/audit";
import { endSession, getSession } from "@/lib/auth";
import { fail, ok, sameOrigin } from "@/lib/http";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return fail("Not allowed.", 403);
  const session = await getSession();
  // the admin pages send this header when they sign someone out after 45 minutes without activity
  const idle = request.headers.get("x-idle-signout") === "1";
  await endSession();
  if (session) await audit(idle ? "auth.idle" : "auth.logout", { actor: session });
  return ok();
}
