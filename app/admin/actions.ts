"use server";

import { archiveThread, deleteDraft, saveDraft, reportSpam, restoreThread, type OutFile, isAddress, isFolder, listFolder, markThreadRead, markThreadUnread, MailError, sendNew, sendReply, setStarred, trashThread } from "@/lib/gmail";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { textToBlocks } from "@/lib/article-text";
import { deleteArticle, getById, saveArticle } from "@/lib/articles";
import { requireAdmin } from "@/lib/auth";
import { removeComment } from "@/lib/comments";
import { deleteEnquiry, isStatus, updateEnquiry } from "@/lib/enquiries";
import { markAllInboxRead, markInboxRead, setDisabled, setRole } from "@/lib/users";

const str = (v: FormDataEntryValue | null, max = 500) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/* ---------- enquiries ---------- */

export async function saveEnquiryAction(formData: FormData) {
  await requireAdmin();
  const id = str(formData.get("id"), 100);
  const status = str(formData.get("status"), 30);
  await updateEnquiry(id, { status: isStatus(status) ? status : undefined, notes: str(formData.get("notes"), 5000) });
  revalidatePath("/admin", "layout");
  redirect(`/admin/enquiries/${id}?saved=1`);
}

export async function setEnquiryStatusAction(formData: FormData) {
  await requireAdmin();
  const status = str(formData.get("status"), 30);
  if (isStatus(status)) await updateEnquiry(str(formData.get("id"), 100), { status });
  revalidatePath("/admin", "layout");
}

export async function deleteEnquiryAction(formData: FormData) {
  await requireAdmin();
  await deleteEnquiry(str(formData.get("id"), 100));
  revalidatePath("/admin", "layout");
  redirect("/admin/enquiries?deleted=1");
}

/* ---------- articles ---------- */

export type ArticleFormState = { error?: string } | undefined;

export async function saveArticleAction(_prev: ArticleFormState, formData: FormData): Promise<ArticleFormState> {
  await requireAdmin();
  const id = str(formData.get("id"), 100) || undefined;
  const title = str(formData.get("title"), 160);
  const slug = str(formData.get("slug"), 100).toLowerCase();
  const excerpt = str(formData.get("excerpt"), 300);
  const category = str(formData.get("category"), 30);
  const date = str(formData.get("date"), 10);
  const status = str(formData.get("status"), 12) === "published" ? "published" : "draft";
  const blocks = textToBlocks(str(formData.get("body"), 60_000));
  const previewBlocks = Math.min(Math.max(parseInt(str(formData.get("previewBlocks"), 3), 10) || 4, 1), Math.max(blocks.length, 1));

  if (!title) return { error: "Add a title." };
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) return { error: "The web address can only use lowercase letters, numbers and single dashes." };
  if (!excerpt) return { error: "Add a short summary." };
  if (!category) return { error: "Add a category." };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date))) return { error: "Choose a valid date." };
  if (!blocks.length) return { error: "The article body is empty." };

  const result = await saveArticle({ slug, title, excerpt, category, date, previewBlocks, blocks, status }, id);
  if ("error" in result) return { error: result.error };
  revalidatePath("/articles");
  revalidatePath("/admin", "layout");
  redirect(`/admin/articles?saved=${encodeURIComponent(title)}`);
}

export async function deleteArticleAction(formData: FormData) {
  await requireAdmin();
  await deleteArticle(str(formData.get("id"), 100));
  revalidatePath("/articles");
  revalidatePath("/admin", "layout");
  redirect("/admin/articles?deleted=1");
}

export async function setArticleStatusAction(formData: FormData) {
  await requireAdmin();
  const article = await getById(str(formData.get("id"), 100));
  if (!article) return;
  const { id, slug, title, excerpt, category, date, previewBlocks, blocks } = article;
  await saveArticle({ slug, title, excerpt, category, date, previewBlocks, blocks, status: article.status === "published" ? "draft" : "published" }, id);
  revalidatePath("/articles");
  revalidatePath("/admin", "layout");
}

/* ---------- comments ---------- */

export async function deleteCommentAction(formData: FormData) {
  const admin = await requireAdmin();
  await removeComment(str(formData.get("id"), 100), { id: admin.id, admin: true });
  revalidatePath("/admin", "layout");
}

/* ---------- users ---------- */

export async function setRoleAction(formData: FormData) {
  const admin = await requireAdmin();
  const id = str(formData.get("id"), 100);
  if (id === admin.id) redirect("/admin/users?error=" + encodeURIComponent("You can't change your own role."));
  const error = await setRole(id, str(formData.get("role"), 10) === "admin" ? "admin" : "user");
  revalidatePath("/admin/users");
  redirect(error ? `/admin/users?error=${encodeURIComponent(error)}` : "/admin/users");
}

export async function setDisabledAction(formData: FormData) {
  const admin = await requireAdmin();
  const id = str(formData.get("id"), 100);
  if (id === admin.id) redirect("/admin/users?error=" + encodeURIComponent("You can't disable your own account."));
  const error = await setDisabled(id, str(formData.get("disabled"), 5) === "1");
  revalidatePath("/admin/users");
  redirect(error ? `/admin/users?error=${encodeURIComponent(error)}` : "/admin/users");
}

/* ---------- inbox ---------- */

const KEY = /^(enq|com|usr):[0-9a-f-]{36}$/;
const MAIL_KEY = /^mail:[0-9a-f]{8,32}$/;

export async function markReadAction(key: string) {
  const admin = await requireAdmin();
  if (KEY.test(key)) await markInboxRead(admin.id, key);
  // mail keeps its read state in Gmail itself, shared by every admin
  if (MAIL_KEY.test(key)) await markThreadRead(key.slice(5)).catch(() => undefined);
  revalidatePath("/admin", "layout");
}

export async function markAllReadAction() {
  const admin = await requireAdmin();
  await markAllInboxRead(admin.id);
  revalidatePath("/admin", "layout");
}

export async function inboxStatusAction(formData: FormData) {
  await requireAdmin();
  const id = str(formData.get("id"), 100);
  const status = str(formData.get("status"), 30);
  if (isStatus(status)) await updateEnquiry(id, { status });
  revalidatePath("/admin", "layout");
  redirect(`/admin/inbox?item=enq:${id}&filter=${str(formData.get("filter"), 10) || "all"}`);
}

export async function inboxDeleteCommentAction(formData: FormData) {
  const admin = await requireAdmin();
  await removeComment(str(formData.get("id"), 100), { id: admin.id, admin: true });
  revalidatePath("/admin", "layout");
  redirect(`/admin/inbox?filter=${str(formData.get("filter"), 10) || "all"}`);
}

export type MailFormState = { error: string; values?: Record<string, string>; sent?: boolean };

/** Rebuilds the list address from a saved view, keeping only the settings the inbox understands. */
function listHref(ctx: string): string {
  const incoming = new URLSearchParams(ctx.slice(0, 400));
  const out = new URLSearchParams();
  for (const key of ["filter", "box", "folder", "q", "unread", "starred"]) {
    const value = incoming.get(key);
    if (value && value.length <= 200) out.set(key, value);
  }
  if (!out.has("filter")) out.set("filter", "mail");
  return `/admin/inbox?${out.toString()}`;
}
const withItem = (href: string, thread: string, extra = "") => `${href}&item=${encodeURIComponent(`mail:${thread}`)}${extra}`;

/** Sends a reply to a mail conversation from one of the three Vexa addresses. */
export async function replyMailAction(_prev: MailFormState, formData: FormData): Promise<MailFormState> {
  await requireAdmin();
  const thread = str(formData.get("thread"), 40);
  const from = str(formData.get("from"), 20);
  const base = listHref(str(formData.get("ctx"), 400));
  try {
    if (!isAddress(from)) throw new MailError("Choose one of the Vexa addresses to reply from.");
    await sendReply({
      threadId: thread,
      from,
      to: str(formData.get("to"), 600),
      cc: str(formData.get("cc"), 600),
      bcc: str(formData.get("bcc"), 600),
      body: String(formData.get("body") ?? ""),
      html: String(formData.get("html") ?? "").slice(0, 300_000),
      files: await readFiles(formData.getAll("files")),
    });
  } catch (error) {
    // what was typed is sent back, so a mistake never costs the admin their message
    return {
      error: error instanceof MailError ? error.message : "The reply could not be sent. Please try again.",
      values: { from, to: str(formData.get("to"), 600), cc: str(formData.get("cc"), 600), bcc: str(formData.get("bcc"), 600), body: String(formData.get("body") ?? "") },
    };
  }
  revalidatePath("/admin", "layout");
  redirect(withItem(base, thread, "&sent=1"));
}

/** The files picked in the compose window, as bytes. Anything that is not a real file is ignored. */
async function readFiles(entries: FormDataEntryValue[]): Promise<OutFile[]> {
  const files: OutFile[] = [];
  for (const entry of entries) {
    if (typeof entry === "string" || entry.size === 0) continue;
    files.push({ name: entry.name, type: entry.type, data: Buffer.from(await entry.arrayBuffer()) });
  }
  return files;
}

/**
 * Sends a new message (not a reply), or a forward. It answers with the result instead of moving to another page, so the
 * conversation that is open stays open while the compose window shows "sent".
 */
export async function composeMailAction(_prev: MailFormState, formData: FormData): Promise<MailFormState> {
  await requireAdmin();
  const from = str(formData.get("from"), 20);
  const typed = {
    from,
    to: str(formData.get("to"), 600),
    cc: str(formData.get("cc"), 600),
    bcc: str(formData.get("bcc"), 600),
    subject: str(formData.get("subject"), 300),
  };
  try {
    if (!isAddress(from)) throw new MailError("Choose one of the Vexa addresses to send from.");
    await sendNew({ ...typed, from, body: String(formData.get("body") ?? ""), html: String(formData.get("html") ?? "").slice(0, 300_000), files: await readFiles(formData.getAll("files")) });
    const draft = str(formData.get("draft"), 40);
    if (draft) await deleteDraft(draft).catch(() => undefined); // the sent message replaces the draft
  } catch (error) {
    return { error: error instanceof MailError ? error.message : "The message could not be sent. Please try again.", values: typed };
  }
  revalidatePath("/admin", "layout");
  return { error: "", sent: true };
}

/** Keeps the compose window's contents as a Gmail draft, like closing a message in Gmail. Answers with the draft's id. */
export async function saveDraftAction(formData: FormData): Promise<{ id?: string; error?: string }> {
  await requireAdmin();
  try {
    const id = await saveDraft({
      id: str(formData.get("draft"), 40),
      from: str(formData.get("from"), 20),
      to: str(formData.get("to"), 600),
      cc: str(formData.get("cc"), 600),
      bcc: str(formData.get("bcc"), 600),
      subject: str(formData.get("subject"), 300),
      body: String(formData.get("body") ?? ""),
      html: String(formData.get("html") ?? "").slice(0, 300_000),
      files: await readFiles(formData.getAll("files")),
    });
    revalidatePath("/admin", "layout");
    return { id };
  } catch (error) {
    return { error: error instanceof MailError ? error.message : "The draft could not be saved." };
  }
}

/** Throws a draft away. */
export async function discardDraftAction(id: string): Promise<void> {
  await requireAdmin();
  await deleteDraft(str(id, 40)).catch(() => undefined);
  revalidatePath("/admin", "layout");
}

/** Mark unread, archive, star, unstar or trash one conversation. */
export async function mailThreadAction(formData: FormData) {
  await requireAdmin();
  const thread = str(formData.get("thread"), 40);
  const op = str(formData.get("op"), 12);
  const base = listHref(str(formData.get("ctx"), 400));
  let problem = "";
  try {
    if (op === "unread") await markThreadUnread(thread);
    else if (op === "archive") await archiveThread(thread);
    else if (op === "trash") await trashThread(thread);
    else if (op === "spam") await reportSpam(thread);
    else if (op === "inbox") await restoreThread(thread);
    else if (op === "star") await setStarred(thread, true);
    else if (op === "unstar") await setStarred(thread, false);
    else throw new MailError("That action is not available.");
  } catch (error) {
    problem = error instanceof MailError ? error.message : "That did not work. Please try again.";
  }
  revalidatePath("/admin", "layout");
  if (problem) redirect(withItem(base, thread, `&error=${encodeURIComponent(problem)}`));
  // star and unstar keep the conversation open; the others close it
  redirect(op === "star" || op === "unstar" ? withItem(base, thread) : base);
}

/** Fetches the mail list from Gmail right now. Any problem is shown on the inbox page; the last good list stays visible. */
export async function syncMailAction(formData: FormData) {
  await requireAdmin();
  const folderField = str(formData.get("folder"), 20);
  const folder = isFolder(folderField) ? folderField : "inbox";
  await listFolder(folder, true).catch(() => undefined);
  // only the inbox data is refreshed: no redirect, so the page, the open message and the filters stay as they are
  revalidatePath("/admin/inbox");
}
