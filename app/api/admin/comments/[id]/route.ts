export const dynamic = "force-dynamic";
import { error, readBody } from "@/lib/account-security";
import { moderateComment } from "@/lib/admin-data";
import { actorOf, ok, staffApi, UUID } from "@/lib/staff";

type Context = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Context) {
  const { staff, response } = await staffApi(request, "comments");
  if (response) return response;
  const id = (await params).id;
  if (!UUID.test(id)) return error("Comment not found.", 404);
  let body: Record<string, unknown>;
  try { body = await readBody(request); } catch { return error("Invalid request."); }
  const result = moderateComment(id, String(body.action ?? ""), { ...actorOf(staff), id: staff.id, role: staff.role });
  if (result === "invalid") return error("Choose approve, reject or remove.");
  if (result === "own_comment") return error("Another moderator needs to review your own comment.", 403);
  if (result === "not_found") return error("That comment is not in a state where this action applies. Reload the list.", 409);
  return ok();
}
