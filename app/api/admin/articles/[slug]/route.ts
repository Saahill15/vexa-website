export const dynamic = "force-dynamic";
import { error, readBody } from "@/lib/account-security";
import { hiddenSlugs, setArticleHidden } from "@/lib/article-state";
import { audit } from "@/lib/audit";
import { getArticle } from "@/lib/learn";
import { actorOf, ok, staffApi } from "@/lib/staff";

type Context = { params: Promise<{ slug: string }> };

/** Withdraws a published article from the public site, or restores it. Article text is edited in source, not here. */
export async function POST(request: Request, { params }: Context) {
  const { staff, response } = await staffApi(request, "articles");
  if (response) return response;
  const slug = (await params).slug;
  if (!getArticle(slug)) return error("Article not found.", 404);
  let body: Record<string, unknown>;
  try { body = await readBody(request); } catch { return error("Invalid request."); }
  if (typeof body.hidden !== "boolean") return error("Choose publish or unpublish.");
  if (hiddenSlugs().has(slug) === body.hidden) return ok();
  setArticleHidden(slug, body.hidden, staff.id);
  audit(actorOf(staff), body.hidden ? "article.unpublish" : "article.publish", { type: "article", id: slug });
  return ok();
}
