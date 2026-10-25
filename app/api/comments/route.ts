import { getSession } from "@/lib/auth";
import { getBySlug } from "@/lib/articles";
import { addComment, COMMENT_MAX, removeComment } from "@/lib/comments";
import { fail, ok, readJson, sameOrigin, text } from "@/lib/http";
import { tooMany } from "@/lib/ratelimit";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return fail("Not allowed.", 403);
  const session = await getSession();
  if (!session) return fail("Log in to comment.", 401);
  if (await tooMany(`comment:${session.id}`, 6, 60_000)) return fail("You're posting quickly. Wait a moment and try again.", 429);

  const body = await readJson(request, 5000);
  const slug = text(body?.slug, 200);
  const message = text(body?.text, COMMENT_MAX);
  if (!message) return fail("Write something before posting.");
  const article = slug ? await getBySlug(slug) : null;
  if (!article || (article.status !== "published" && session.role !== "admin")) return fail("That article could not be found.", 404);

  const comment = await addComment({ slug, userId: session.id, name: session.name, text: message });
  return ok({ comment });
}

export async function DELETE(request: Request) {
  if (!sameOrigin(request)) return fail("Not allowed.", 403);
  const session = await getSession();
  if (!session) return fail("Log in first.", 401);
  const id = text(new URL(request.url).searchParams.get("id"), 100);
  const removed = id ? await removeComment(id, { id: session.id, admin: session.role === "admin" }) : false;
  return removed ? ok() : fail("That comment could not be removed.", 404);
}
