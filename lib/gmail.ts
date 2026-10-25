import { createHash, randomBytes } from "crypto";
import { readFile } from "fs/promises";
import os from "os";
import path from "path";
import { istIso } from "./time";

/*
 * The shared mailbox behind the admin inbox: partnerships@vexadigital.in, plus its two aliases (support@ and contact@).
 * Messages arrive in that one mailbox; the address each one was sent to decides which tab it appears under.
 *
 * Only that mailbox can ever be opened: MAILBOX is fixed here, and every new connection is checked against Gmail's own
 * answer for who it is signed in as. No Google key file is used or supported.
 *
 * Two ways to sign in (GMAIL_AUTH):
 *   oauth       (default) a refresh token for partnerships@, made once with scripts/gmail-authorize.mjs. Works on a
 *               laptop and on the server.
 *   delegation  keyless domain-wide delegation: Google signs the login assertion for the service account, using
 *               your own `gcloud auth application-default login`. For local development only.
 * See docs/gmail-inbox.md.
 */

export const MAILBOX = "partnerships@vexadigital.in";
export const ADDRESSES = { partnerships: MAILBOX, support: "support@vexadigital.in", contact: "contact@vexadigital.in" } as const;
export type Address = keyof typeof ADDRESSES;
export type Box = Address | "other";
export const BOX_LABEL: Record<Box, string> = { partnerships: "Partnerships", support: "Support", contact: "Contact", other: "Other" };
export const isAddress = (v: unknown): v is Address => typeof v === "string" && v in ADDRESSES;

const SCOPES = ["https://www.googleapis.com/auth/gmail.modify", "https://www.googleapis.com/auth/gmail.send"];
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const GMAIL = "https://gmail.googleapis.com/gmail/v1/users/me";
const DEFAULT_SERVICE_ACCOUNT = "vexa-mail-inbox@vexa-digital.iam.gserviceaccount.com";

/** A problem that is safe to show to an admin. It never contains a token or a secret. */
export class MailError extends Error {
  /** True for a problem that is worth trying again (a busy or briefly unreachable Gmail). */
  constructor(message: string, readonly retry = false) {
    super(message);
  }
}

const RETRY_STATUS = new Set([429, 500, 502, 503, 504]);
const pause = (attempt: number) => new Promise((resolve) => setTimeout(resolve, Number(process.env.GMAIL_RETRY_DELAY_MS ?? 400) * attempt));

/* ---------- sign-in ---------- */

const authMode = () => (process.env.GMAIL_AUTH === "delegation" ? "delegation" : "oauth");

/** Whether the settings for the chosen sign-in method are present (says nothing about whether Google accepts them). */
export function mailConfigured(): boolean {
  if (authMode() === "delegation") return true;
  return Boolean(process.env.GMAIL_OAUTH_CLIENT_ID && process.env.GMAIL_OAUTH_CLIENT_SECRET && process.env.GMAIL_OAUTH_REFRESH_TOKEN);
}

type Grant = { access_token: string; expires_in: number };

async function tokenRequest(body: Record<string, string>): Promise<Grant> {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(body),
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new MailError(`Google did not accept the mail sign-in (${res.status}). Check the Gmail settings in .env.`, res.status === 429 || res.status >= 500);
  const grant = (await res.json()) as Partial<Grant>;
  if (!grant.access_token) throw new MailError("Google returned no access token for the mail sign-in.");
  return { access_token: grant.access_token, expires_in: grant.expires_in ?? 3000 };
}

function oauthGrant(): Promise<Grant> {
  return tokenRequest({
    grant_type: "refresh_token",
    client_id: process.env.GMAIL_OAUTH_CLIENT_ID ?? "",
    client_secret: process.env.GMAIL_OAUTH_CLIENT_SECRET ?? "",
    refresh_token: process.env.GMAIL_OAUTH_REFRESH_TOKEN ?? "",
  });
}

/** Keyless: sign in as the developer (application-default login), have Google sign the assertion, swap it for a token. */
async function delegationGrant(): Promise<Grant> {
  const serviceAccount = process.env.GMAIL_SERVICE_ACCOUNT || DEFAULT_SERVICE_ACCOUNT;
  const file = process.env.GOOGLE_APPLICATION_CREDENTIALS || path.join(os.homedir(), ".config", "gcloud", "application_default_credentials.json");
  let login: { type?: string; client_id?: string; client_secret?: string; refresh_token?: string };
  try {
    login = JSON.parse(await readFile(file, "utf8"));
  } catch {
    throw new MailError("No Google login found on this machine. Run: gcloud auth application-default login");
  }
  if (login.type !== "authorized_user" || !login.client_id || !login.client_secret || !login.refresh_token) {
    throw new MailError("Only a personal Google login is accepted here. Service-account key files are not used.");
  }
  const developer = await tokenRequest({ grant_type: "refresh_token", client_id: login.client_id, client_secret: login.client_secret, refresh_token: login.refresh_token });

  const now = Math.floor(Date.now() / 1000);
  const claims = { iss: serviceAccount, sub: MAILBOX, scope: SCOPES.join(" "), aud: TOKEN_URL, iat: now, exp: now + 3600 };
  const signed = await fetch(`https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${encodeURIComponent(serviceAccount)}:signJwt`, {
    method: "POST",
    headers: { Authorization: `Bearer ${developer.access_token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ payload: JSON.stringify(claims) }),
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });
  if (!signed.ok) {
    throw new MailError(`Google would not sign for the service account (${signed.status}). It needs the Service Account Token Creator role for your login, and the IAM Service Account Credentials API turned on.`);
  }
  const { signedJwt } = (await signed.json()) as { signedJwt?: string };
  if (!signedJwt) throw new MailError("Google returned no signed assertion.");
  return tokenRequest({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: signedJwt });
}

let cached: { value: string; expires: number } | null = null;

async function accessToken(): Promise<string> {
  if (cached && cached.expires > Date.now() + 60_000) return cached.value;
  if (!mailConfigured()) throw new MailError("Mail is not connected yet. See docs/gmail-inbox.md.");
  const grant = authMode() === "delegation" ? await delegationGrant() : await oauthGrant();

  // never trust the settings alone: ask Gmail who this really is, and refuse anyone but the partnerships mailbox
  const res = await fetch(`${GMAIL}/profile`, { headers: { Authorization: `Bearer ${grant.access_token}` }, cache: "no-store", signal: AbortSignal.timeout(10_000) });
  if (!res.ok) throw new MailError(gmailProblem(res.status));
  const { emailAddress } = (await res.json()) as { emailAddress?: string };
  if (emailAddress?.toLowerCase() !== MAILBOX) {
    throw new MailError(`The mail sign-in belongs to a different mailbox. The inbox only works with ${MAILBOX}.`);
  }
  cached = { value: grant.access_token, expires: Date.now() + grant.expires_in * 1000 };
  return cached.value;
}

function gmailProblem(status: number): string {
  if (status === 401) return "Gmail rejected the sign-in. Authorise the mailbox again.";
  if (status === 403) return "Gmail refused the request. Check that the Gmail API is turned on and the scopes are approved for this mailbox.";
  if (status === 404) return "Gmail could not find that conversation.";
  if (status === 429) return "Gmail is limiting requests. Try again in a minute.";
  return `Gmail returned an error (${status}).`;
}

/**
 * One call to Gmail. Reading is tried up to three times when Gmail is busy or briefly unreachable. Sending is tried once only:
 * if the answer to a send is lost, trying again could send the same reply twice.
 */
async function api<T>(route: string, init?: { method?: string; body?: unknown }): Promise<T> {
  const attempts = route === "/messages/send" || (route === "/drafts" && init?.method === "POST") ? 1 : 3;
  for (let attempt = 1; ; attempt++) {
    try {
      const token = await accessToken();
      const res = await fetch(`${GMAIL}${route}`, {
        method: init?.method ?? "GET",
        headers: { Authorization: `Bearer ${token}`, ...(init?.body ? { "Content-Type": "application/json" } : {}) },
        body: init?.body ? JSON.stringify(init.body) : undefined,
        cache: "no-store",
        signal: AbortSignal.timeout(15_000),
      });
      if (res.status === 401) cached = null; // the next attempt signs in again
      if (!res.ok) {
        // Google sends some rate limits as 403; read the reason so they are retried like 429 and show up in the logs
        const reason = await res.text().catch(() => "");
        const limited = res.status === 403 && /rateLimitExceeded|userRateLimitExceeded/.test(reason);
        console.error(`gmail ${route.split("?")[0]} -> ${res.status}${limited ? " (rate limit)" : ""}: ${reason.slice(0, 200)}`);
        // a per-minute limit is not cleared by retrying a second later, so it is reported straight away
        throw new MailError(gmailProblem(limited ? 429 : res.status), !limited && (res.status === 401 || RETRY_STATUS.has(res.status)));
      }
      if (res.ok) {
        const body = await res.text();
        return (body ? JSON.parse(body) : {}) as T;
      }
      throw new MailError(gmailProblem(res.status), res.status === 401 || RETRY_STATUS.has(res.status));
    } catch (e) {
      if (!(e instanceof MailError)) console.error(`gmail ${route.split("?")[0]} failed: ${e instanceof Error ? `${e.name}: ${e.message}` : String(e)}`);
      const error = e instanceof MailError ? e : new MailError("Gmail could not be reached.", true);
      if (!error.retry || attempt >= attempts) throw error;
      await pause(attempt);
    }
  }
}

/* ---------- reading a message ---------- */

type Part = { mimeType?: string; filename?: string; body?: { data?: string; attachmentId?: string; size?: number }; parts?: Part[]; headers?: { name: string; value: string }[] };
type GmailMessage = { id: string; threadId: string; labelIds?: string[]; internalDate?: string; snippet?: string; payload?: Part };
type GmailThread = { id: string; messages?: GmailMessage[] };

const header = (m: GmailMessage, name: string): string => m.payload?.headers?.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value ?? "";
const emailsIn = (value: string): string[] => (value.toLowerCase().match(/[a-z0-9._%+-]+@[a-z0-9-]+(?:\.[a-z0-9-]+)+/g) ?? []);
const ours = (email: string): Address | null => (Object.keys(ADDRESSES) as Address[]).find((a) => ADDRESSES[a] === email) ?? null;
const clean = (value: string) => value.replace(/[\r\n]+/g, " ").trim();

/** The address a message was sent to: the aliases are checked before the main mailbox, and Delivered-To last. */
function boxOfMessage(m: GmailMessage): Box {
  const fromMe = emailsIn(header(m, "From")).map(ours).find(Boolean);
  if (fromMe) return fromMe;
  const found = (value: string) => emailsIn(value).map(ours).filter((a): a is Address => Boolean(a));
  const direct = [...found(header(m, "To")), ...found(header(m, "Cc")), ...found(header(m, "X-Original-To"))];
  const pick = direct.find((a) => a !== "partnerships") ?? direct[0] ?? found(header(m, "Delivered-To"))[0];
  return pick ?? "other";
}

function decode(data?: string): string {
  return data ? Buffer.from(data.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8") : "";
}

const NAMED: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };
function decodeEntities(value: string): string {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, h: string) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d: string) => String.fromCodePoint(Number(d)))
    .replace(/&(amp|lt|gt|quot|apos|nbsp);/g, (_, n: string) => NAMED[n]);
}

/** Invisible characters that mailers pad previews with. */
const INVISIBLE = /[\u200b-\u200f\u2060\u034f\ufeff\u00ad]+/g;

/** A short preview line: no entity codes, [image: …] placeholders, web addresses or invisible padding. */
export function cleanSnippet(value: string): string {
  return decodeEntities(value)
    .replace(/\[image:[^\]]*\]/gi, "")
    .replace(/<https?:\/\/[^>]*>/g, "")
    .replace(/https?:\/\/\S+/g, "")
    .replace(INVISIBLE, "")
    .replace(/\s+/g, " ")
    .trim();
}

const escapeHtml = (v: string) => v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Turns web addresses in plain text into short links (the domain, not the whole tracking address). */
function linkify(text: string): string {
  const url = /https?:\/\/[^\s<>"')\]]+/g;
  let out = "";
  let last = 0;
  for (const m of text.matchAll(url)) {
    out += escapeHtml(text.slice(last, m.index));
    const href = m[0].replace(/[.,;:!?]+$/, "");
    let label = href;
    try {
      const u = new URL(href);
      label = href.length > 48 ? `${u.hostname}/…` : href;
    } catch {
      /* keep the address as it is */
    }
    out += `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a>`;
    last = (m.index ?? 0) + href.length;
  }
  return out + escapeHtml(text.slice(last));
}

/** Plain-text mail as simple HTML: placeholders removed, links shortened, earlier quoted messages set apart. */
export function plainToHtml(text: string): { html: string; hasRemoteImages: boolean; hasQuoted: boolean } {
  const lines = text
    .replace(/\r\n/g, "\n")
    .replace(INVISIBLE, "")
    .replace(/\[image:[^\]]*\]\n?/gi, "")
    .replace(/<(https?:\/\/[^>\s]+)>/g, "$1")
    .split("\n");
  const quoteStart = lines.findIndex((l, i) => i > 0 && (/^On .{5,200} wrote:\s*$/.test(l) || /^-{2,} ?Original Message ?-{2,}/i.test(l) || (/^On .{5,200}$/.test(l) && /wrote:\s*$/.test(lines[i + 1] ?? "")) || /^>/.test(l)));
  const own = (quoteStart > 0 ? lines.slice(0, quoteStart) : lines).join("\n").replace(/\n{3,}/g, "\n\n").trim();
  const quoted = quoteStart > 0 ? lines.slice(quoteStart).join("\n").trim() : "";
  const html = `<div style="white-space:pre-wrap">${linkify(own)}</div>` + (quoted ? `<div class="gmail_quote" style="white-space:pre-wrap">${linkify(quoted)}</div>` : "");
  return { html, hasRemoteImages: false, hasQuoted: Boolean(quoted) };
}

/**
 * Cleans mail HTML before it is shown. This is a second layer: the message is also shown inside a sandboxed frame that
 * cannot run scripts, cannot submit forms and cannot load anything from the web unless the admin chooses to.
 */
export function sanitizeHtml(input: string): { html: string; hasRemoteImages: boolean; hasQuoted: boolean } {
  let h = input;
  const body = h.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  if (body) h = body[1];
  h = h
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(script|iframe|object|embed|form|frame|frameset|applet|noscript|title)\b[\s\S]*?<\/\1\s*>/gi, "")
    .replace(/<\/?(script|iframe|object|embed|form|input|button|textarea|select|frame|frameset|applet|meta|link|base|title|noscript)\b[^>]*>/gi, "")
    .replace(/\s(on[a-z]+)\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/\s(href|src|action|formaction|xlink:href|background)\s*=\s*("\s*(?:javascript|vbscript|data:text\/html)[^"]*"|'\s*(?:javascript|vbscript|data:text\/html)[^']*')/gi, "")
    .replace(/@import[^;]*;/gi, "")
    .replace(/expression\s*\(/gi, "(")
    .replace(INVISIBLE, "");
  return {
    html: h,
    hasRemoteImages: /<img\b[^>]*\ssrc\s*=\s*["']?\s*https?:/i.test(h),
    hasQuoted: /gmail_quote|<blockquote/i.test(h),
  };
}

function htmlToText(html: string): string {
  return decodeEntities(
    html
      .replace(/<(style|script)[\s\S]*?<\/\1>/gi, "")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(p|div|tr|li|h[1-6])>/gi, "\n")
      .replace(/<[^>]+>/g, ""),
  )
    .replace(INVISIBLE, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export type Attachment = { id: string; name: string; size: number; mime: string };

/** Plain text, the HTML version, and the attachments of one message. */
function readBody(part: Part | undefined): { text: string; html: string; files: string[]; attachments: Attachment[] } {
  const plain: string[] = [];
  const html: string[] = [];
  const attachments: Attachment[] = [];
  const files: string[] = [];
  const walk = (p: Part) => {
    if (p.filename) {
      files.push(p.filename);
      if (p.body?.attachmentId) attachments.push({ id: p.body.attachmentId, name: p.filename, size: p.body.size ?? 0, mime: p.mimeType ?? "application/octet-stream" });
    } else if (p.mimeType === "text/plain" && p.body?.data) plain.push(decode(p.body.data));
    else if (p.mimeType === "text/html" && p.body?.data) html.push(decode(p.body.data));
    for (const child of p.parts ?? []) walk(child);
  };
  if (part) walk(part);
  const rawHtml = html.join("\n");
  const text = plain.join("\n").trim() || htmlToText(rawHtml);
  return { text, html: rawHtml, files, attachments };
}

/* ---------- the list ---------- */

export type MailThreadSummary = { id: string; subject: string; from: string; snippet: string; at: string; unread: boolean; starred: boolean; count: number; box: Box };

const METADATA = ["From", "To", "Cc", "Delivered-To", "X-Original-To", "Subject", "Date"].map((h) => `metadataHeaders=${h}`).join("&");

/** "Sahil, Ana +1" from a To header: names where there are any, otherwise addresses. */
function recipientNames(value: string): string {
  const parts = value.match(/(?:"[^"]*"|[^,"])+/g)?.map((p) => p.trim()).filter(Boolean) ?? [];
  const names = parts.map((p) => p.replace(/<[^>]*>/, "").replace(/"/g, "").trim() || emailsIn(p)[0] || p);
  if (!names.length) return "no recipient";
  return names.length > 2 ? `${names.slice(0, 2).join(", ")} +${names.length - 2}` : names.join(", ");
}

function summarise(thread: GmailThread): MailThreadSummary {
  const messages = thread.messages ?? [];
  const last = messages[messages.length - 1];
  const firstIncoming = messages.find((m) => !emailsIn(header(m, "From")).some((e) => ours(e))) ?? messages[0];
  const incoming = [...messages].reverse().find((m) => !emailsIn(header(m, "From")).some((e) => ours(e))) ?? last;
  return {
    id: thread.id,
    subject: clean(header(messages[0], "Subject")) || "(no subject)",
    from: emailsIn(header(incoming, "From")).some((e) => ours(e))
      ? `To: ${recipientNames(header(incoming, "To"))}`
      : clean(header(incoming, "From")).replace(/<[^>]*>/, "").replace(/"/g, "").trim() || emailsIn(header(incoming, "From"))[0] || "Unknown sender",
    snippet: cleanSnippet(last?.snippet ?? ""),
    at: istIso(Number(last?.internalDate ?? Date.now())),
    unread: messages.some((m) => m.labelIds?.includes("UNREAD")),
    starred: messages.some((m) => m.labelIds?.includes("STARRED")),
    count: messages.length,
    box: boxOfMessage(firstIncoming),
  };
}

export type Folder = "inbox" | "starred" | "important" | "sent" | "drafts" | "spam" | "trash" | "all" | "primary" | "social" | "promotions" | "updates" | "forums" | "purchases";
export const FOLDERS: { id: Folder; label: string; group: "folders" | "categories" }[] = [
  { id: "inbox", label: "Inbox", group: "folders" },
  { id: "starred", label: "Starred", group: "folders" },
  { id: "important", label: "Important", group: "folders" },
  { id: "sent", label: "Sent", group: "folders" },
  { id: "drafts", label: "Drafts", group: "folders" },
  { id: "spam", label: "Spam", group: "folders" },
  { id: "trash", label: "Trash", group: "folders" },
  { id: "all", label: "All Mail", group: "folders" },
  { id: "primary", label: "Primary", group: "categories" },
  { id: "social", label: "Social", group: "categories" },
  { id: "promotions", label: "Promotions", group: "categories" },
  { id: "updates", label: "Updates", group: "categories" },
  { id: "forums", label: "Forums", group: "categories" },
  { id: "purchases", label: "Purchases", group: "categories" },
];
export const isFolder = (v: unknown): v is Folder => typeof v === "string" && FOLDERS.some((f) => f.id === v);

const WITH_SPAM = "includeSpamTrash=true";
const category = (name: string) => `q=${encodeURIComponent(`in:inbox category:${name}`)}`;
/** What to ask Gmail for each folder. Categories are searches inside the inbox. */
const FOLDER_QUERY: Record<Folder, string> = {
  inbox: "labelIds=INBOX",
  starred: "labelIds=STARRED",
  important: "labelIds=IMPORTANT",
  sent: "labelIds=SENT",
  drafts: "labelIds=DRAFT",
  spam: `labelIds=SPAM&${WITH_SPAM}`,
  trash: `labelIds=TRASH&${WITH_SPAM}`,
  all: "",
  primary: category("primary"),
  social: category("social"),
  promotions: category("promotions"),
  updates: category("updates"),
  forums: category("forums"),
  purchases: category("purchases"),
};

type Slot = { cache: { at: number; data: MailThreadSummary[]; syncedAt: string } | null; error: string | null; inflight: Promise<MailThreadSummary[]> | null; loaded: boolean };

/*
 * The saved lists are also kept in the database, so every server instance (on Cloudflare there are many) shares one copy.
 * Without it each instance fetches from Gmail on its own, and Gmail's per-minute limit for the mailbox runs out.
 * Both calls are best effort: if the database is unavailable, the list just works from memory as before.
 */
async function readShared(folder: Folder): Promise<{ at: number; data: MailThreadSummary[]; syncedAt: string } | null> {
  try {
    const { db } = await import("./db");
    const { rows } = await db.query<{ fetched_at: string; synced_at: string; data: MailThreadSummary[] }>("select fetched_at, synced_at, data from mail_cache where folder = $1", [folder]);
    return rows[0] ? { at: Number(rows[0].fetched_at), syncedAt: rows[0].synced_at, data: rows[0].data } : null;
  } catch {
    return null;
  }
}

async function writeShared(folder: Folder, cache: { at: number; data: MailThreadSummary[]; syncedAt: string }): Promise<void> {
  try {
    const { db } = await import("./db");
    await db.query(
      "insert into mail_cache (folder, fetched_at, synced_at, data) values ($1, $2, $3, $4) on conflict (folder) do update set fetched_at = excluded.fetched_at, synced_at = excluded.synced_at, data = excluded.data",
      [folder, cache.at, cache.syncedAt, JSON.stringify(cache.data)],
    );
  } catch {
    /* kept in memory only */
  }
}
const slots = new Map<Folder, Slot>();
const slot = (folder: Folder): Slot => {
  let s = slots.get(folder);
  if (!s) slots.set(folder, (s = { cache: null, error: null, inflight: null, loaded: false }));
  return s;
};

async function fetchThreads(query: string): Promise<MailThreadSummary[]> {
  const { threads = [] } = await api<{ threads?: { id: string }[] }>(`/threads?${[query, "maxResults=20"].filter(Boolean).join("&")}`);
  // in small batches: Gmail limits how much one user may use per minute, so 30 at once is too many
  const full: GmailThread[] = [];
  for (let i = 0; i < threads.length; i += 5) {
    full.push(...(await Promise.all(threads.slice(i, i + 5).map((t) => api<GmailThread>(`/threads/${t.id}?format=metadata&${METADATA}`)))));
  }
  return full.filter((t) => t.messages?.length).map(summarise);
}

/** When a folder's list was last fetched from Gmail, and why the latest attempt failed, if it did. */
export function mailSyncInfo(folder: Folder = "inbox"): { syncedAt: string | null; error: string | null } {
  const s = slot(folder);
  return { syncedAt: s.cache?.syncedAt ?? null, error: s.error };
}

/**
 * The latest conversations in a folder (the inbox by default). Each folder keeps its own saved list.
 *  - Within 45 seconds of the last fetch, the saved list is used.
 *  - After that, the saved list is still shown at once while a fresh one loads in the background, so opening a page or a
 *    message never waits on Gmail. Only the very first load of a folder waits.
 *  - `force` (the Sync button) waits for a fresh list, except within 10 seconds of the last one, so repeated clicks do not hammer Gmail.
 * Simultaneous fetches share one request. If a fetch fails, the last good list is kept; the problem is in mailSyncInfo().
 */
export async function listFolder(folder: Folder, force = false): Promise<MailThreadSummary[]> {
  const s = slot(folder);
  if (!s.loaded) {
    s.loaded = true;
    const shared = await readShared(folder);
    if (shared && (!s.cache || shared.at > s.cache.at)) s.cache = shared;
  }
  const age = s.cache ? Date.now() - s.cache.at : Infinity;
  // Gmail allows only a small number of requests per minute for this mailbox, so a list is reused for three minutes
  if (s.cache && age < (force ? 10_000 : 180_000)) return s.cache.data;
  if (!s.inflight) {
    s.inflight = fetchThreads(FOLDER_QUERY[folder])
      .then(async (data) => {
        s.cache = { at: Date.now(), data, syncedAt: istIso() };
        s.error = null;
        await writeShared(folder, s.cache);
        return data;
      })
      .catch((e) => {
        s.error = e instanceof MailError ? e.message : "Mail could not be loaded right now.";
        if (s.cache) return s.cache.data;
        throw e;
      })
      .finally(() => {
        s.inflight = null;
      });
  }
  if (s.cache && !force) return s.cache.data;
  return s.inflight;
}

export const listThreads = (force = false) => listFolder("inbox", force);

/** The next read of any folder fetches fresh data, but the old lists stay as a fallback if that fetch fails. */
const expire = () => {
  for (const s of slots.values()) if (s.cache) s.cache.at = 0;
  countsCache = null;
};

/* ---------- folder counts ---------- */

const COUNT_LABEL: Partial<Record<Folder, { id: string; kind: "unread" | "total" }>> = {
  inbox: { id: "INBOX", kind: "unread" },
  important: { id: "IMPORTANT", kind: "unread" },
  drafts: { id: "DRAFT", kind: "total" },
  spam: { id: "SPAM", kind: "total" },
  primary: { id: "CATEGORY_PERSONAL", kind: "unread" },
  social: { id: "CATEGORY_SOCIAL", kind: "unread" },
  promotions: { id: "CATEGORY_PROMOTIONS", kind: "unread" },
  updates: { id: "CATEGORY_UPDATES", kind: "unread" },
  forums: { id: "CATEGORY_FORUMS", kind: "unread" },
};
let countsCache: { at: number; data: Partial<Record<Folder, number>> } | null = null;

/** Unread (or total, for Drafts and Spam) numbers for the folder menu. Kept for a minute; any folder that fails is left out. */
export async function folderCounts(): Promise<Partial<Record<Folder, number>>> {
  if (countsCache && Date.now() - countsCache.at < 60_000) return countsCache.data;
  const entries = Object.entries(COUNT_LABEL) as [Folder, { id: string; kind: "unread" | "total" }][];
  const results = await Promise.allSettled(entries.map(([, l]) => api<{ threadsUnread?: number; threadsTotal?: number }>(`/labels/${l.id}`)));
  const data: Partial<Record<Folder, number>> = {};
  results.forEach((r, i) => {
    if (r.status !== "fulfilled") return;
    const [folder, l] = entries[i];
    const n = l.kind === "unread" ? r.value.threadsUnread : r.value.threadsTotal;
    if (typeof n === "number" && n > 0) data[folder] = n;
  });
  countsCache = { at: Date.now(), data };
  return data;
}

/* ---------- one conversation ---------- */

export type MailMessage = {
  id: string;
  from: string;
  to: string;
  cc: string;
  at: string;
  text: string;
  /** The message as safe HTML, ready to show in a sandboxed frame. */
  html: string;
  hasRemoteImages: boolean;
  hasQuoted: boolean;
  files: string[];
  attachments: Attachment[];
  mine: boolean;
};
export type MailThread = { id: string; subject: string; box: Box; unread: boolean; starred: boolean; inInbox: boolean; spam: boolean; trashed: boolean; messages: MailMessage[]; replyTo: string };

const THREAD_ID = /^[0-9a-f]{8,32}$/;
export const isThreadId = (v: string) => THREAD_ID.test(v);

export async function getThread(id: string): Promise<MailThread> {
  if (!isThreadId(id)) throw new MailError("That is not a valid conversation.");
  const thread = await api<GmailThread>(`/threads/${id}?format=full`);
  const messages = thread.messages ?? [];
  if (!messages.length) throw new MailError("That conversation has no messages.");
  const mapped = messages.map((m): MailMessage => {
    const body = readBody(m.payload);
    const view = body.html.trim() ? sanitizeHtml(body.html) : plainToHtml(body.text || m.snippet || "");
    return {
      id: m.id,
      from: clean(header(m, "From")),
      to: clean(header(m, "To")),
      cc: clean(header(m, "Cc")),
      at: istIso(Number(m.internalDate ?? Date.now())),
      text: body.text || m.snippet || "",
      html: view.html,
      hasRemoteImages: view.hasRemoteImages,
      hasQuoted: view.hasQuoted,
      files: body.files,
      attachments: body.attachments,
      mine: emailsIn(header(m, "From")).some((e) => ours(e)),
    };
  });
  const incoming = [...messages].reverse().find((m) => !emailsIn(header(m, "From")).some((e) => ours(e)));
  const summary = summarise({ id: thread.id, messages });
  return {
    id: thread.id,
    subject: summary.subject,
    box: summary.box,
    unread: summary.unread,
    starred: summary.starred,
    inInbox: messages.some((m) => m.labelIds?.includes("INBOX")),
    spam: messages.some((m) => m.labelIds?.includes("SPAM")),
    trashed: messages.some((m) => m.labelIds?.includes("TRASH")),
    messages: mapped,
    replyTo: incoming ? emailsIn(header(incoming, "Reply-To") || header(incoming, "From"))[0] ?? "" : "",
  };
}

/* ---------- actions ---------- */

export async function markThreadRead(id: string): Promise<void> {
  if (!isThreadId(id)) throw new MailError("That is not a valid conversation.");
  await api(`/threads/${id}/modify`, { method: "POST", body: { removeLabelIds: ["UNREAD"] } });
  expire();
}

const encodeHeader = (value: string) => (/^[\x20-\x7e]*$/.test(value) ? value : `=?UTF-8?B?${Buffer.from(value, "utf8").toString("base64")}?=`);

export type OutFile = { name: string; type: string; data: Buffer };
type MimeInput = { from: Address; to: string; cc?: string; bcc?: string; subject: string; body: string; html?: string; files?: OutFile[]; inReplyTo?: string; references?: string };

const base64Lines = (data: Buffer | string) => (Buffer.from(data).toString("base64").match(/.{1,76}/g) ?? []).join("\r\n");
const safeName = (name: string) => name.replace(/[\r\n"\\/]+/g, "_").trim().slice(0, 120) || "attachment";

function multipart(kind: "alternative" | "mixed", parts: string[]): string {
  const boundary = `=_vexa_${randomBytes(12).toString("hex")}`;
  return `Content-Type: multipart/${kind}; boundary="${boundary}"\r\n\r\n--${boundary}\r\n${parts.join(`\r\n--${boundary}\r\n`)}\r\n--${boundary}--`;
}

/**
 * Builds the email. Plain text is sent as it is; with HTML, a plain version travels beside it; with files, everything is
 * wrapped so they come along. Headers are single-line, so nothing in them can add another header.
 */
export function buildMime(input: MimeInput): string {
  const text = input.body.replace(/\r?\n/g, "\r\n");
  const textPart = `Content-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n${base64Lines(text)}`;
  const htmlPart = input.html ? `Content-Type: text/html; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n${base64Lines(input.html)}` : "";
  const body = input.html ? multipart("alternative", [textPart, htmlPart]) : textPart;
  const files = (input.files ?? []).map((f) => {
    const name = encodeHeader(safeName(f.name));
    const type = /^[\w.+-]+\/[\w.+-]+$/.test(f.type) ? f.type : "application/octet-stream";
    return `Content-Type: ${type}; name="${name}"\r\nContent-Disposition: attachment; filename="${name}"\r\nContent-Transfer-Encoding: base64\r\n\r\n${base64Lines(f.data)}`;
  });
  const root = files.length ? multipart("mixed", [body, ...files]) : body;
  const head = [
    `From: "Vexa Digital" <${ADDRESSES[input.from]}>`,
    `To: ${clean(input.to)}`,
    ...(input.cc ? [`Cc: ${clean(input.cc)}`] : []),
    ...(input.bcc ? [`Bcc: ${clean(input.bcc)}`] : []),
    `Subject: ${encodeHeader(clean(input.subject))}`,
    ...(input.inReplyTo ? [`In-Reply-To: ${clean(input.inReplyTo)}`] : []),
    ...(input.references ? [`References: ${clean(input.references)}`] : []),
    "MIME-Version: 1.0",
  ];
  return `${head.join("\r\n")}\r\n${root}`;
}

/** A plain-text message (used for replies). */
export const buildRaw = (input: { from: Address; to: string; subject: string; body: string; inReplyTo?: string; references?: string }): string => buildMime(input);

const OUT_TAGS = new Set(["p", "div", "br", "b", "strong", "i", "em", "u", "a", "ul", "ol", "li", "blockquote", "span"]);

/**
 * Cleans the HTML typed in the compose window before it is sent: only simple formatting tags survive, no attributes
 * except a web, mail or tel link address, and nothing that can run or load anything.
 */
export function cleanOutgoingHtml(input: string): string {
  const stripped = input.replace(/<!--[\s\S]*?-->/g, "").replace(/<(script|style|iframe|object|embed|form|svg|math|template)\b[\s\S]*?<\/\1\s*>/gi, "");
  const out = stripped.replace(/<(\/?)([a-z][a-z0-9]*)\b([^>]*)>/gi, (_all, close: string, tag: string, attrs: string) => {
    const name = tag.toLowerCase();
    if (!OUT_TAGS.has(name)) return "";
    if (close) return `</${name}>`;
    if (name === "a") {
      const href = attrs.match(/\shref\s*=\s*("([^"]*)"|'([^']*)')/i);
      const url = (href?.[2] ?? href?.[3] ?? "").trim();
      return /^(https?:\/\/|mailto:|tel:)/i.test(url) ? `<a href="${url.replace(/"/g, "&quot;")}" target="_blank" rel="noopener noreferrer">` : "<a>";
    }
    return name === "br" ? "<br>" : `<${name}>`;
  });
  return `<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6">${out}</div>`.slice(0, 200_000);
}

/** What a reply to this conversation needs: who it goes to and the headers that keep it in the same thread. */
export async function prepareReply(threadId: string): Promise<{ to: string; subject: string; inReplyTo: string; references: string; box: Box }> {
  const thread = await api<GmailThread>(`/threads/${threadId}?format=metadata&metadataHeaders=Message-ID&metadataHeaders=References&metadataHeaders=Subject&${METADATA}`);
  const messages = thread.messages ?? [];
  const last = messages[messages.length - 1];
  if (!last) throw new MailError("That conversation has no messages.");
  const summary = summarise({ id: thread.id, messages });
  const incoming = [...messages].reverse().find((m) => !emailsIn(header(m, "From")).some((e) => ours(e))) ?? last;
  const messageId = header(last, "Message-ID");
  const references = [header(last, "References"), messageId].filter(Boolean).join(" ");
  const subject = summary.subject.toLowerCase().startsWith("re:") ? summary.subject : `Re: ${summary.subject}`;
  return { to: emailsIn(header(incoming, "Reply-To") || header(incoming, "From"))[0] ?? "", subject, inReplyTo: messageId, references, box: summary.box };
}

/** Sends a reply in the same conversation, from the chosen address. Only the three Vexa addresses can be used. */
export async function sendReply(input: { threadId: string; from: Address; to: string; cc?: string; bcc?: string; body: string; html?: string; files?: OutFile[] }): Promise<void> {
  if (!isThreadId(input.threadId)) throw new MailError("That is not a valid conversation.");
  if (!isAddress(input.from)) throw new MailError("Choose one of the Vexa addresses to reply from.");
  const to = addressList(input.to, "To", true);
  const cc = addressList(input.cc ?? "", "Cc", false);
  const bcc = addressList(input.bcc ?? "", "Bcc", false);
  const body = input.body.trim();
  if (!body) throw new MailError("Write a message before sending.");
  if (body.length > 20_000) throw new MailError("That reply is too long.");
  const files = input.files ?? [];
  checkFiles(files);
  const html = input.html?.trim() ? cleanOutgoingHtml(input.html) : undefined;

  const reply = await prepareReply(input.threadId);
  const raw = buildMime({ from: input.from, to, cc, bcc, subject: reply.subject, body, html, files, inReplyTo: reply.inReplyTo, references: reply.references });
  await sendMime(raw, input.threadId);
  expire();
}

/* ---------- search, labels, compose, attachments ---------- */

const searchCache = new Map<string, { at: number; data: MailThreadSummary[] }>();

/** Searches all mail with Gmail's own search (words, from:, subject:, is:unread, …). Results are kept for 15 seconds. */
export async function queryThreads(query: string): Promise<MailThreadSummary[]> {
  const q = query.trim().slice(0, 200);
  if (!q) return listThreads();
  const hit = searchCache.get(q);
  if (hit && Date.now() - hit.at < 15_000) return hit.data;
  const data = await fetchThreads(`q=${encodeURIComponent(q)}`);
  if (searchCache.size > 30) searchCache.clear();
  searchCache.set(q, { at: Date.now(), data });
  return data;
}

async function changeLabels(id: string, change: { addLabelIds?: string[]; removeLabelIds?: string[] }) {
  if (!isThreadId(id)) throw new MailError("That is not a valid conversation.");
  await api(`/threads/${id}/modify`, { method: "POST", body: change });
  expire();
  searchCache.clear();
}

/** Takes a conversation out of Spam or Trash and puts it back in the inbox. */
export async function restoreThread(id: string): Promise<void> {
  if (!isThreadId(id)) throw new MailError("That is not a valid conversation.");
  const thread = await api<GmailThread>(`/threads/${id}?format=minimal`);
  if (thread.messages?.some((m) => m.labelIds?.includes("TRASH"))) await api(`/threads/${id}/untrash`, { method: "POST" });
  await changeLabels(id, { addLabelIds: ["INBOX"], removeLabelIds: ["SPAM"] });
}

export const markThreadUnread = (id: string) => changeLabels(id, { addLabelIds: ["UNREAD"] });
export const archiveThread = (id: string) => changeLabels(id, { removeLabelIds: ["INBOX"] });
/** Moves a conversation to Gmail's spam folder. */
export const reportSpam = (id: string) => changeLabels(id, { addLabelIds: ["SPAM"], removeLabelIds: ["INBOX"] });
export const setStarred = (id: string, starred: boolean) => changeLabels(id, starred ? { addLabelIds: ["STARRED"] } : { removeLabelIds: ["STARRED"] });

/** Moves a conversation to Gmail's trash (Gmail deletes it for good after 30 days). */
export async function trashThread(id: string): Promise<void> {
  if (!isThreadId(id)) throw new MailError("That is not a valid conversation.");
  await api(`/threads/${id}/trash`, { method: "POST" });
  expire();
  searchCache.clear();
}

const EMAIL_ONE = /^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/;
export const MAX_OUT_FILES = 10;
export const MAX_OUT_BYTES = 20 * 1024 * 1024;

/** One list of recipients: at most ten, each a full address. Returns them joined for the header. */
function addressList(value: string, label: string, required: boolean): string {
  const list = value.split(/[\s,;]+/).filter(Boolean);
  if (!list.length) {
    if (required) throw new MailError("Enter who the message is for.");
    return "";
  }
  if (list.length > 10) throw new MailError(`${label} can have 10 people at most.`);
  if (!list.every((r) => EMAIL_ONE.test(r))) throw new MailError(`One of the ${label} addresses is not complete.`);
  return list.join(", ");
}

/**
 * Sends a message that Vexa wrote itself (a template), with its own HTML. Unlike sendNew, the HTML is not cleaned, because
 * the styling is the point. Only use it for fixed templates whose variable parts are escaped by the caller.
 */
export async function sendTemplated(input: { from: Address; to: string; subject: string; body: string; html: string }): Promise<void> {
  if (!isAddress(input.from)) throw new MailError("Choose one of the Vexa addresses to send from.");
  await sendMime(buildMime({ from: input.from, to: addressList(input.to, "To", true), subject: input.subject, body: input.body, html: input.html }));
}

/** Sends a message to Gmail. Large ones (with files) go through Gmail's upload address, which accepts up to 35 MB. */
async function sendMime(mime: string, threadId?: string): Promise<void> {
  if (mime.length < 3_000_000) {
    await api("/messages/send", { method: "POST", body: { raw: Buffer.from(mime, "utf8").toString("base64url"), ...(threadId ? { threadId } : {}) } });
    return;
  }
  const token = await accessToken();
  const res = await fetch("https://gmail.googleapis.com/upload/gmail/v1/users/me/messages/send?uploadType=media", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "message/rfc822" },
    body: mime,
    cache: "no-store",
    signal: AbortSignal.timeout(60_000),
  });
  if (res.status === 401) cached = null;
  if (!res.ok) throw new MailError(gmailProblem(res.status));
}

function checkFiles(files: OutFile[]) {
  if (files.length > MAX_OUT_FILES) throw new MailError(`You can attach up to ${MAX_OUT_FILES} files.`);
  if (files.reduce((n, f) => n + f.data.length, 0) > MAX_OUT_BYTES) throw new MailError("The attachments are larger than 20 MB in all.");
  const blocked = files.find((f) => isRiskyFile(f.name));
  if (blocked) throw new MailError(`"${blocked.name}" is a kind of file that can run on a computer, so it is not sent from here.`);
}

/**
 * A new message (not a reply) from one of the three Vexa addresses: up to ten people each in To, Cc and Bcc, simple
 * formatting, and up to ten files (20 MB in all; programs are not sent).
 */
export async function sendNew(input: { from: Address; to: string; cc?: string; bcc?: string; subject: string; body: string; html?: string; files?: OutFile[] }): Promise<void> {
  if (!isAddress(input.from)) throw new MailError("Choose one of the Vexa addresses to send from.");
  const to = addressList(input.to, "To", true);
  const cc = addressList(input.cc ?? "", "Cc", false);
  const bcc = addressList(input.bcc ?? "", "Bcc", false);
  const subject = input.subject.trim();
  if (!subject) throw new MailError("Add a subject.");
  if (subject.length > 200) throw new MailError("That subject is too long.");
  const body = input.body.trim();
  if (!body) throw new MailError("Write a message before sending.");
  if (body.length > 20_000) throw new MailError("That message is too long.");

  const files = input.files ?? [];
  checkFiles(files);

  const html = input.html?.trim() ? cleanOutgoingHtml(input.html) : undefined;
  await sendMime(buildMime({ from: input.from, to, cc, bcc, subject, body, html, files }));
  expire();
}

/**
 * Saves what is in the compose window as a Gmail draft (a new one, or the one with this id). Nothing is checked as hard as
 * a send: a draft may have no recipient or subject yet. Returns the draft's id.
 */
export async function saveDraft(input: { id?: string; from: string; to: string; cc?: string; bcc?: string; subject: string; body: string; html?: string; files?: OutFile[] }): Promise<string> {
  if (!isAddress(input.from)) throw new MailError("Choose one of the Vexa addresses to send from.");
  const files = input.files ?? [];
  if (files.length > MAX_OUT_FILES) throw new MailError(`You can attach up to ${MAX_OUT_FILES} files.`);
  if (files.some((f) => isRiskyFile(f.name))) throw new MailError("A file that can run on a computer cannot be kept in a draft.");
  const list = (v?: string) => (v ?? "").split(/[\s,;]+/).filter(Boolean).slice(0, 10).join(", ");
  const html = input.html?.trim() ? cleanOutgoingHtml(input.html) : undefined;
  const mime = buildMime({ from: input.from, to: list(input.to), cc: list(input.cc), bcc: list(input.bcc), subject: input.subject.trim().slice(0, 200), body: input.body.slice(0, 20_000), html, files });
  if (mime.length >= 3_000_000) throw new MailError("A draft with large attachments cannot be saved. Remove them or send the message.");
  const raw = Buffer.from(mime, "utf8").toString("base64url");
  const id = input.id && /^[\w-]{1,40}$/.test(input.id) ? input.id : "";
  const saved = await api<{ id: string }>(id ? `/drafts/${id}` : "/drafts", { method: id ? "PUT" : "POST", body: { message: { raw } } });
  expire();
  return saved.id;
}

export type DraftContent = { id: string; from: string; to: string; cc: string; bcc: string; subject: string; html: string; files: { name: string; type: string; data: string }[]; lostFiles: number };

/** The draft that is this conversation, with what is needed to open it in the compose window again; null when it is not a draft. */
export async function getDraft(threadId: string): Promise<DraftContent | null> {
  if (!isThreadId(threadId)) throw new MailError("That is not a valid conversation.");
  const list = await api<{ drafts?: { id: string; message?: { threadId?: string } }[] }>("/drafts?maxResults=100");
  const found = list.drafts?.find((d) => d.message?.threadId === threadId);
  if (!found) return null;
  const draft = await api<{ id: string; message?: GmailMessage }>(`/drafts/${found.id}?format=full`);
  const m = draft.message;
  if (!m) return null;
  const body = readBody(m.payload);
  const files: DraftContent["files"] = [];
  let lost = 0;
  let total = 0;
  for (const a of body.attachments) {
    try {
      if (total + a.size > 5 * 1024 * 1024) throw new MailError("large");
      const file = await getAttachment(m.id, a.id);
      total += file.data.length;
      files.push({ name: file.name, type: a.mime, data: file.data.toString("base64") });
    } catch {
      lost++;
    }
  }
  const sender = emailsIn(header(m, "From")).map(ours).find(Boolean);
  return {
    id: draft.id,
    from: sender ?? "partnerships",
    to: clean(header(m, "To")),
    cc: clean(header(m, "Cc")),
    bcc: clean(header(m, "Bcc")),
    subject: clean(header(m, "Subject")),
    html: body.html.trim() ? cleanOutgoingHtml(body.html) : plainToHtml(body.text).html,
    files,
    lostFiles: lost,
  };
}

/** Removes a draft (when it is discarded or after it has been sent). */
export async function deleteDraft(id: string): Promise<void> {
  if (!/^[\w-]{1,40}$/.test(id)) return;
  await api(`/drafts/${id}`, { method: "DELETE" }).catch((e) => {
    if (!(e instanceof MailError) || e.message !== gmailProblem(404)) throw e;
  });
  expire();
}

const RISKY = new Set(["exe", "msi", "bat", "cmd", "com", "scr", "pif", "js", "jse", "vbs", "vbe", "wsf", "wsh", "ps1", "jar", "hta", "lnk", "dll", "reg", "apk", "dmg", "app", "sh"]);
export const MAX_ATTACHMENT = 25 * 1024 * 1024;

/** True for files that can run on someone's computer. They are not served from the admin panel. */
export function isRiskyFile(name: string): boolean {
  const parts = name.toLowerCase().split(".").slice(1);
  return parts.some((ext) => RISKY.has(ext.trim()));
}

function findAttachment(part: Part | undefined, id: string): Part | null {
  if (!part) return null;
  if (part.body?.attachmentId === id && part.filename) return part;
  for (const child of part.parts ?? []) {
    const found = findAttachment(child, id);
    if (found) return found;
  }
  return null;
}

/** One attachment's bytes, after checking that it belongs to that message, is not too big, and is not a program. */
export async function getAttachment(messageId: string, attachmentId: string): Promise<{ name: string; data: Buffer }> {
  if (!/^[0-9a-f]{8,32}$/.test(messageId) || !/^[A-Za-z0-9_-]{10,2000}$/.test(attachmentId)) throw new MailError("That attachment could not be found.");
  const message = await api<GmailMessage>(`/messages/${messageId}?format=full`);
  const part = findAttachment(message.payload, attachmentId);
  if (!part?.filename) throw new MailError("That attachment could not be found.");
  if (isRiskyFile(part.filename)) throw new MailError("This kind of file can run on a computer, so it is not offered here. Open it in Gmail if you trust the sender.");
  if ((part.body?.size ?? 0) > MAX_ATTACHMENT) throw new MailError("This file is larger than 25 MB. Open it in Gmail.");
  const file = await api<{ data?: string }>(`/messages/${messageId}/attachments/${attachmentId}`);
  return { name: part.filename, data: Buffer.from((file.data ?? "").replace(/-/g, "+").replace(/_/g, "/"), "base64") };
}

/** A short fingerprint of the inbox, for the auto-refresh to tell whether anything changed. It fetches fresh (at most every 10 seconds). */
export async function pollMail(): Promise<{ signature: string; unread: number }> {
  // uses the 45-second cache, so several open screens share one fetch instead of each forcing their own
  const list = await listThreads(false);
  return { signature: threadsSignature(list), unread: list.filter((t) => t.unread).length };
}

/** A short fingerprint of a list of conversations: it changes when mail arrives, is read, starred or removed. */
export function threadsSignature(list: MailThreadSummary[]): string {
  const text = list.map((t) => `${t.id}:${t.at}:${t.unread ? 1 : 0}:${t.starred ? 1 : 0}`).join("|");
  return createHash("sha1").update(text).digest("hex").slice(0, 16);
}
