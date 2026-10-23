import { getSession } from "@/lib/auth";
import { fail, ok, readJson, sameOrigin, text } from "@/lib/http";
import { renameCommenter } from "@/lib/comments";
import { setName } from "@/lib/users";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return fail("This request can only be sent from the Vexa website.", 403);
  const session = await getSession();
  if (!session) return fail("Please log in again to continue.", 401);
  const body = await readJson(request);
  const name = text(body?.name, 80);
  if (!name) return fail("Enter your name.");

  const error = await setName(session.id, name);
  if (error) return fail(error, 404);
  // comments show the name they were posted with, so update those too
  await renameCommenter(session.id, name);
  return ok();
}
