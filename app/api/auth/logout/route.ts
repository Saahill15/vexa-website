import { endSession } from "@/lib/auth";
import { fail, ok, sameOrigin } from "@/lib/http";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return fail("Not allowed.", 403);
  await endSession();
  return ok();
}
