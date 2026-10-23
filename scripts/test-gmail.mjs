// Tests for lib/gmail.ts against a fake Google and a fake Gmail. Nothing real is contacted. Run: npm run test:mail
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";

const require = createRequire(import.meta.url);
const build = path.resolve(".test-build/gmail.js");
const b64 = (s) => Buffer.from(s, "utf8").toString("base64url");
const header = (name, value) => ({ name, value });

const message = (id, headers, extra = {}) => ({ id, threadId: extra.threadId ?? "aaaa0001", labelIds: extra.labels ?? ["INBOX", "UNREAD"], internalDate: String(extra.at ?? Date.parse("2026-10-24T10:00:00Z")), snippet: extra.snippet ?? "snippet", payload: { mimeType: "text/plain", headers, body: { data: b64(extra.body ?? "Hello from a partner") }, ...(extra.payload ?? {}) } });

const THREADS = {
  aaaa0001: [message("m1", [header("From", "Rhea Shah <rhea@brand.com>"), header("To", "support@vexadigital.in"), header("Delivered-To", "partnerships@vexadigital.in"), header("Subject", "Sponsorship question"), header("Message-ID", "<m1@brand.com>"), header("Reply-To", "rhea.reply@brand.com")], { threadId: "aaaa0001" })],
  aaaa0002: [message("m2", [header("From", "Dev <dev@x.com>"), header("To", "someone@else.com"), header("X-Original-To", "contact@vexadigital.in"), header("Subject", "Hello")], { threadId: "aaaa0002", labels: ["INBOX"] })],
  aaaa0003: [message("m3", [header("From", "Ana <ana@y.com>"), header("To", "partnerships@vexadigital.in"), header("Subject", "Partner")], { threadId: "aaaa0003", labels: ["INBOX"] })],
  aaaa0004: [message("m4", [header("From", "Zed <zed@z.com>"), header("To", "undisclosed@z.com"), header("Subject", "Bcc only")], { threadId: "aaaa0004", labels: ["INBOX"] })],
  aaaa0005: [
    message("m5", [header("From", "Html <h@h.com>"), header("To", "support@vexadigital.in"), header("Subject", "Html mail"), header("Message-ID", "<m5@h.com>")], {
      threadId: "aaaa0005",
      payload: { mimeType: "multipart/mixed", body: {}, parts: [
        { mimeType: "text/html", body: { data: b64("<style>x{}</style><p>Line one<br>Line two</p><script>alert(1)</script><img src='https://track.example/p.gif'>") } },
        { mimeType: "application/pdf", filename: "deck.pdf", body: {} },
      ] },
    }),
  ],
};

function fresh(env) {
  for (const k of ["GMAIL_AUTH", "GMAIL_OAUTH_CLIENT_ID", "GMAIL_OAUTH_CLIENT_SECRET", "GMAIL_OAUTH_REFRESH_TOKEN", "GOOGLE_APPLICATION_CREDENTIALS", "GMAIL_SERVICE_ACCOUNT"]) delete process.env[k];
  process.env.GMAIL_RETRY_DELAY_MS = "1";
  Object.assign(process.env, env);
  delete require.cache[build];
  return require(build);
}
const OAUTH = { GMAIL_OAUTH_CLIENT_ID: "cid", GMAIL_OAUTH_CLIENT_SECRET: "csecret", GMAIL_OAUTH_REFRESH_TOKEN: "rtoken" };

function fakeGoogle({ profile = "partnerships@vexadigital.in", rule } = {}) {
  const calls = [];
  globalThis.fetch = async (url, init = {}) => {
    const u = String(url);
    const body = typeof init.body === "string" ? init.body : init.body instanceof URLSearchParams ? init.body.toString() : "";
    calls.push({ url: u, method: init.method ?? "GET", body, auth: init.headers?.Authorization });
    const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });
    const forced = rule?.(u, init, calls);
    if (forced) return forced;
    if (u === "https://oauth2.googleapis.com/token") return json({ access_token: "ACCESS-" + calls.length, expires_in: 3600 });
    if (u.includes(":signJwt")) return json({ signedJwt: "signed.jwt.value" });
    if (u.endsWith("/users/me/profile")) return json({ emailAddress: profile });
    if (u.includes("/users/me/threads?")) return json({ threads: Object.keys(THREADS).map((id) => ({ id })) });
    const t = u.match(/\/users\/me\/threads\/([0-9a-f]+)(\?|$)/);
    if (t && (init.method ?? "GET") === "GET") return THREADS[t[1]] ? json({ id: t[1], messages: THREADS[t[1]] }) : json({}, 404);
    if (u.includes("/modify") || u.includes("/trash") || u.includes("/untrash") || u.endsWith("/messages/send")) return json({ ok: true });
    if (u.includes("/users/me/drafts?")) return json({ drafts: [{ id: "r9", message: { id: "aa11", threadId: "aaaa0002" } }] });
    if (u.includes("/users/me/drafts/r9?format=full")) return json({ id: "r9", message: { id: "aa11", threadId: "aaaa0002", labelIds: ["DRAFT"], payload: { mimeType: "text/html", headers: [{ name: "From", value: '"Vexa Digital" <support@vexadigital.in>' }, { name: "To", value: "a@b.com, c@d.com" }, { name: "Bcc", value: "e@f.com" }, { name: "Subject", value: "Half done" }], body: { data: Buffer.from("<p>Hello <b>there</b></p>").toString("base64url") } } } });
    if (u.endsWith("/users/me/drafts") && init.method === "POST") return json({ id: "r123" });
    if (/\/users\/me\/drafts\/[\w-]+$/.test(u) && init.method === "PUT") return json({ id: "r123" });
    if (/\/users\/me\/drafts\/[\w-]+$/.test(u) && init.method === "DELETE") return new Response(null, { status: 204 });
    return json({}, 404);
  };
  return calls;
}

const results = [];
const test = async (name, fn) => {
  try { await fn(); results.push(["ok", name]); console.log("ok  " + name); }
  catch (e) { results.push(["FAIL", name]); console.log("FAIL " + name + "\n     " + e.message); }
};

await test("not configured without settings, configured with them", () => {
  assert.equal(fresh({}).mailConfigured(), false);
  assert.equal(fresh(OAUTH).mailConfigured(), true);
});

await test("refuses any mailbox other than partnerships@ and reads nothing", async () => {
  const calls = fakeGoogle({ profile: "someone.else@gmail.com" });
  const g = fresh(OAUTH);
  await assert.rejects(g.listThreads(), (e) => e instanceof g.MailError && /different mailbox/.test(e.message));
  assert.equal(calls.filter((c) => c.url.includes("/threads")).length, 0, "no thread was read");
});

await test("lists conversations and sorts them by the address they were sent to", async () => {
  fakeGoogle();
  const g = fresh(OAUTH);
  const list = await g.listThreads();
  const box = Object.fromEntries(list.map((t) => [t.id, t.box]));
  assert.deepEqual(box, { aaaa0001: "support", aaaa0002: "contact", aaaa0003: "partnerships", aaaa0004: "other", aaaa0005: "support" });
  assert.equal(list.find((t) => t.id === "aaaa0001").unread, true);
  assert.equal(list.find((t) => t.id === "aaaa0002").unread, false);
  assert.equal(list.find((t) => t.id === "aaaa0001").from, "Rhea Shah");
  assert.equal(list.find((t) => t.id === "aaaa0001").subject, "Sponsorship question");
  assert.match(list[0].at, /\+05:30$/, "times are in IST");
});

await test("reads a conversation: plain text, replies go to Reply-To", async () => {
  fakeGoogle();
  const g = fresh(OAUTH);
  const t = await g.getThread("aaaa0001");
  assert.equal(t.replyTo, "rhea.reply@brand.com");
  assert.equal(t.messages[0].text, "Hello from a partner");
  assert.equal(t.box, "support");
});

await test("HTML mail becomes safe text: no scripts, styles or tracking images; attachments are named only", async () => {
  fakeGoogle();
  const g = fresh(OAUTH);
  const t = await g.getThread("aaaa0005");
  assert.equal(t.messages[0].text, "Line one\nLine two");
  assert.doesNotMatch(t.messages[0].text, /script|alert|track\.example|<|style/i);
  assert.deepEqual(t.messages[0].files, ["deck.pdf"]);
});

await test("marking read removes only the UNREAD label; bad ids make no request", async () => {
  const calls = fakeGoogle();
  const g = fresh(OAUTH);
  await g.markThreadRead("aaaa0001");
  const mod = calls.find((c) => c.url.includes("/modify"));
  assert.deepEqual(JSON.parse(mod.body), { removeLabelIds: ["UNREAD"] });
  const before = calls.length;
  await assert.rejects(g.markThreadRead("../../etc"), g.MailError);
  assert.equal(calls.length, before);
});

await test("a reply is sent in the same conversation from the chosen address", async () => {
  const calls = fakeGoogle();
  const g = fresh(OAUTH);
  await g.sendReply({ threadId: "aaaa0001", from: "support", to: "rhea.reply@brand.com", body: "Thanks, ជំរាបសួរ — we will call you." });
  const sent = JSON.parse(calls.find((c) => c.url.endsWith("/messages/send")).body);
  assert.equal(sent.threadId, "aaaa0001");
  const raw = Buffer.from(sent.raw, "base64url").toString("utf8");
  const [head, ...rest] = raw.split("\r\n\r\n");
  assert.match(head, /^From: "Vexa Digital" <support@vexadigital\.in>/m);
  assert.match(head, /^To: rhea\.reply@brand\.com$/m);
  assert.match(head, /^Subject: Re: Sponsorship question$/m);
  assert.match(head, /^In-Reply-To: <m1@brand\.com>$/m);
  assert.match(head, /^References: <m1@brand\.com>$/m);
  assert.equal(Buffer.from(rest.join("").replace(/\r\n/g, ""), "base64").toString("utf8"), "Thanks, ជំរាបសួរ — we will call you.");
});

await test("replies cannot come from any other address and cannot inject headers", async () => {
  const calls = fakeGoogle();
  const g = fresh(OAUTH);
  const base = { threadId: "aaaa0001", to: "a@b.com", body: "hi" };
  await assert.rejects(g.sendReply({ ...base, from: "ceo" }), g.MailError);
  await assert.rejects(g.sendReply({ ...base, from: "support", to: "a@b.com\r\nBcc: x@y.com" }), g.MailError);
  await assert.rejects(g.sendReply({ ...base, from: "support", body: "   " }), g.MailError);
  assert.equal(calls.filter((c) => c.url.endsWith("/messages/send")).length, 0);
  const raw = g.buildRaw({ from: "contact", to: "a@b.com\r\nBcc: x@y.com", subject: "Hi\r\nBcc: z@y.com", body: "x" });
  assert.doesNotMatch(raw.split("\r\n\r\n")[0], /^Bcc:/m);
});

await test("keyless delegation: Google signs for the service account, only partnerships@ and two scopes", async () => {
  const dir = mkdtempSync(path.join(os.tmpdir(), "adc-"));
  const file = path.join(dir, "adc.json");
  writeFileSync(file, JSON.stringify({ type: "authorized_user", client_id: "dev-id", client_secret: "dev-secret", refresh_token: "dev-refresh" }));
  const calls = fakeGoogle();
  const g = fresh({ GMAIL_AUTH: "delegation", GOOGLE_APPLICATION_CREDENTIALS: file });
  await g.listThreads();
  const sign = calls.find((c) => c.url.includes(":signJwt"));
  assert.match(sign.url, /serviceAccounts\/vexa-mail-inbox%40vexa-digital\.iam\.gserviceaccount\.com:signJwt/);
  const claims = JSON.parse(JSON.parse(sign.body).payload);
  assert.equal(claims.sub, "partnerships@vexadigital.in");
  assert.equal(claims.iss, "vexa-mail-inbox@vexa-digital.iam.gserviceaccount.com");
  assert.equal(claims.scope, "https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/gmail.send");
  const exchange = calls.filter((c) => c.url === "https://oauth2.googleapis.com/token").pop();
  assert.match(decodeURIComponent(exchange.body), /grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer/);
  assert.match(exchange.body, /assertion=signed\.jwt\.value/);
});

await test("a service-account key file is refused", async () => {
  const dir = mkdtempSync(path.join(os.tmpdir(), "adc-"));
  const file = path.join(dir, "key.json");
  writeFileSync(file, JSON.stringify({ type: "service_account", private_key: "-----BEGIN PRIVATE KEY-----", client_email: "x@y.iam.gserviceaccount.com" }));
  fakeGoogle();
  const g = fresh({ GMAIL_AUTH: "delegation", GOOGLE_APPLICATION_CREDENTIALS: file });
  await assert.rejects(g.listThreads(), (e) => e instanceof g.MailError && /Service-account key files are not used/.test(e.message));
});

await test("errors never contain tokens or secrets", async () => {
  fakeGoogle({ profile: "someone.else@gmail.com" });
  const g = fresh(OAUTH);
  try { await g.listThreads(); assert.fail("should have thrown"); }
  catch (e) { assert.doesNotMatch(e.message, /ACCESS-|csecret|rtoken/); }
});


const isList = (u) => u.includes("/users/me/threads?");
const status = (code) => new Response(JSON.stringify({}), { status: code });

await test("a busy Gmail (503 twice) is retried and the sync still succeeds", async () => {
  let failures = 2;
  const calls = fakeGoogle({ rule: (u) => (isList(u) && failures-- > 0 ? status(503) : undefined) });
  const g = fresh(OAUTH);
  const list = await g.listThreads();
  assert.equal(list.length, 5);
  assert.equal(calls.filter((c) => isList(c.url)).length, 3, "tried three times");
});

await test("a refusal (403) is not retried", async () => {
  const calls = fakeGoogle({ rule: (u) => (isList(u) ? status(403) : undefined) });
  const g = fresh(OAUTH);
  await assert.rejects(g.listThreads(), (e) => e instanceof g.MailError && /Gmail API is turned on/.test(e.message));
  assert.equal(calls.filter((c) => isList(c.url)).length, 1);
});

await test("a failed send is never retried, so a reply cannot go out twice", async () => {
  const calls = fakeGoogle({ rule: (u) => (u.endsWith("/messages/send") ? status(503) : undefined) });
  const g = fresh(OAUTH);
  await assert.rejects(g.sendReply({ threadId: "aaaa0001", from: "support", to: "a@b.com", body: "hi" }), g.MailError);
  assert.equal(calls.filter((c) => c.url.endsWith("/messages/send")).length, 1);
});

await test("simultaneous syncs share one fetch", async () => {
  const calls = fakeGoogle();
  const g = fresh(OAUTH);
  await Promise.all([g.listThreads(true), g.listThreads(true), g.listThreads(true)]);
  assert.equal(calls.filter((c) => isList(c.url)).length, 1);
});

await test("clicking Sync again within 10 seconds does not call Gmail again", async () => {
  const calls = fakeGoogle();
  const g = fresh(OAUTH);
  await g.listThreads(true);
  const before = calls.length;
  await g.listThreads(true);
  assert.equal(calls.length, before);
});

await test("a failed sync keeps the last good list, reports the problem, and recovers on the next sync", async () => {
  let down = false;
  fakeGoogle({ rule: (u) => (down && isList(u) ? status(500) : undefined) });
  const g = fresh(OAUTH);
  const good = await g.listThreads();
  assert.equal(g.mailSyncInfo().error, null);
  const firstSync = g.mailSyncInfo().syncedAt;
  assert.match(firstSync, /\+05:30$/);

  down = true;
  await g.markThreadRead("aaaa0001"); // expires the list, so the next read fetches again
  const stale = await g.listThreads(true);
  assert.deepEqual(stale, good, "the old list is still shown");
  assert.match(g.mailSyncInfo().error, /Gmail returned an error \(500\)/);
  assert.equal(g.mailSyncInfo().syncedAt, firstSync, "the time still says when the list is really from");

  down = false;
  await g.markThreadRead("aaaa0001");
  await g.listThreads(true);
  assert.equal(g.mailSyncInfo().error, null);
});

await test("with no list yet, a failed sync reports the problem instead of an empty inbox", async () => {
  fakeGoogle({ rule: (u) => (isList(u) ? status(500) : undefined) });
  const g = fresh(OAUTH);
  await assert.rejects(g.listThreads(true), g.MailError);
  assert.match(g.mailSyncInfo().error, /500/);
  assert.equal(g.mailSyncInfo().syncedAt, null);
});

await test("an old list is shown at once while a fresh one loads in the background", async () => {
  let fetches = 0;
  fakeGoogle({ rule: (u) => { if (isList(u)) fetches++; return undefined; } });
  const g = fresh(OAUTH);
  const first = await g.listThreads();
  await g.markThreadRead("aaaa0001"); // makes the saved list old
  const before = fetches;
  const started = Date.now();
  const shown = await g.listThreads(); // not forced: must answer from the saved list
  assert.deepEqual(shown, first);
  assert.ok(Date.now() - started < 50, "answered at once");
  await new Promise((r) => setTimeout(r, 100)); // the background refresh finishes
  assert.equal(fetches, before + 1, "exactly one background refresh ran");
  assert.ok(g.mailSyncInfo().syncedAt >= first[0].at.slice(0, 0));
});


const jsonResponse = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });

await test("previews drop [image: …], web addresses, entity codes and invisible padding", () => {
  const g = fresh(OAUTH);
  assert.equal(g.cleanSnippet("Welcome &amp; hello [image: Google] see https://x.example/track?id=1 it&#39;s fine​‌  ok"), "Welcome & hello see it's fine ok");
});

await test("plain-text mail: no placeholders, short links, quoted history set apart", () => {
  const g = fresh(OAUTH);
  const r = g.plainToHtml("[image: Google]\nAccount recovered\n<https://accounts.google.com/AccountChooser?Email=partnerships@vexadigital.in&continue=https://myaccount.google.com/secure-account?utm_source=email>\nThanks <b>\n\nOn Fri, 23 Oct 2026 at 23:18, Sahil <a@b.com> wrote:\n> old text");
  assert.doesNotMatch(r.html, /\[image/);
  assert.match(r.html, /<a href="https:\/\/accounts\.google\.com[^"]*" target="_blank" rel="noopener noreferrer">accounts\.google\.com\/…<\/a>/);
  assert.doesNotMatch(r.html, /&lt;https/);
  assert.match(r.html, /Thanks &lt;b&gt;/, "markup in the text is escaped, not run");
  assert.equal(r.hasQuoted, true);
  assert.match(r.html, /<div class="gmail_quote"[^>]*>On Fri/);
});

await test("HTML mail is cleaned: no scripts, frames, forms, handlers or javascript: links", () => {
  const g = fresh(OAUTH);
  const r = g.sanitizeHtml('<html><head><title>x</title><script>alert(1)</script></head><body><p onclick="steal()">Hi</p><a href="javascript:alert(1)">bad</a><a href="https://ok.example/">ok</a><iframe src="https://evil.example"></iframe><form action="https://evil.example"><input name="p"><button>Go</button></form><img src="https://track.example/p.gif" onerror="x()"><div class="gmail_quote">old</div></body></html>');
  assert.doesNotMatch(r.html, /<script|<iframe|<form|<input|<button|onclick|onerror|javascript:|<title/i);
  assert.match(r.html, /href="https:\/\/ok\.example\/"/);
  assert.equal(r.hasRemoteImages, true);
  assert.equal(r.hasQuoted, true);
});

await test("a conversation carries clean HTML for the sandboxed frame", async () => {
  fakeGoogle();
  const g = fresh(OAUTH);
  const t = await g.getThread("aaaa0005");
  assert.match(t.messages[0].html, /Line one/);
  assert.doesNotMatch(t.messages[0].html, /<script|alert/);
  assert.equal(t.messages[0].hasRemoteImages, true, "the tracking image is flagged so it can be blocked");
  assert.equal(t.starred, false);
});

await test("search sends Gmail's own query, and repeats within 15 seconds are not fetched again", async () => {
  const calls = fakeGoogle();
  const g = fresh(OAUTH);
  await g.queryThreads("from:rhea budget");
  const first = calls.find((c) => isList(c.url));
  assert.match(first.url, /q=from%3Arhea%20budget/);
  assert.doesNotMatch(first.url, /labelIds=INBOX/, "search covers all mail, not only the inbox");
  const before = calls.filter((c) => isList(c.url)).length;
  await g.queryThreads("from:rhea budget");
  assert.equal(calls.filter((c) => isList(c.url)).length, before);
});

await test("mark unread, archive, star, unstar and trash change only what they say", async () => {
  const calls = fakeGoogle();
  const g = fresh(OAUTH);
  await g.markThreadUnread("aaaa0001");
  await g.archiveThread("aaaa0001");
  await g.setStarred("aaaa0001", true);
  await g.setStarred("aaaa0001", false);
  await g.trashThread("aaaa0001");
  const bodies = calls.filter((c) => c.url.includes("/modify")).map((c) => JSON.parse(c.body));
  assert.deepEqual(bodies, [{ addLabelIds: ["UNREAD"] }, { removeLabelIds: ["INBOX"] }, { addLabelIds: ["STARRED"] }, { removeLabelIds: ["STARRED"] }]);
  assert.ok(calls.some((c) => c.url.endsWith("/threads/aaaa0001/trash") && c.method === "POST"));
  const before = calls.length;
  await assert.rejects(g.trashThread("../x"), g.MailError);
  await assert.rejects(g.archiveThread("zz"), g.MailError);
  assert.equal(calls.length, before, "bad ids make no request");
});

await test("a new message goes from the chosen address, with no thread, and is validated", async () => {
  const calls = fakeGoogle();
  const g = fresh(OAUTH);
  await g.sendNew({ from: "contact", to: "a@b.com, c@d.org", subject: "Hello there", body: "Hi!" });
  const sent = JSON.parse(calls.find((c) => c.url.endsWith("/messages/send")).body);
  assert.equal(sent.threadId, undefined);
  const head = Buffer.from(sent.raw, "base64url").toString("utf8").split("\r\n\r\n")[0];
  assert.match(head, /^From: "Vexa Digital" <contact@vexadigital\.in>/m);
  assert.match(head, /^To: a@b\.com, c@d\.org$/m);
  assert.match(head, /^Subject: Hello there$/m);
  assert.doesNotMatch(head, /In-Reply-To/);
  const before = calls.length;
  const ok = { from: "support", to: "a@b.com", subject: "S", body: "b" };
  await assert.rejects(g.sendNew({ ...ok, from: "ceo" }), g.MailError);
  await assert.rejects(g.sendNew({ ...ok, to: "" }), g.MailError);
  await assert.rejects(g.sendNew({ ...ok, to: "not-an-address" }), g.MailError);
  await assert.rejects(g.sendNew({ ...ok, to: Array.from({ length: 11 }, (_, i) => `u${i}@x.com`).join(",") }), g.MailError);
  await assert.rejects(g.sendNew({ ...ok, subject: "  " }), g.MailError);
  await assert.rejects(g.sendNew({ ...ok, body: " " }), g.MailError);
  assert.equal(calls.length, before, "nothing was sent for any invalid message");
  const raw = g.buildRaw({ from: "support", to: "a@b.com", subject: "Hi\r\nBcc: z@y.com", body: "x" });
  assert.doesNotMatch(raw.split("\r\n\r\n")[0], /^Bcc:/m);
});

await test("attachments: the right file is served; programs, huge files and other messages' files are refused", async () => {
  const msg = {
    id: "bbbb0001", threadId: "aaaa0001",
    payload: { mimeType: "multipart/mixed", headers: [], parts: [
      { mimeType: "text/plain", body: { data: b64("see attached") } },
      { mimeType: "application/pdf", filename: "report.pdf", body: { attachmentId: "ATTACHMENT_PDF_0001", size: 5 } },
      { mimeType: "application/octet-stream", filename: "setup.exe", body: { attachmentId: "ATTACHMENT_EXE_0002", size: 5 } },
      { mimeType: "application/zip", filename: "big.zip", body: { attachmentId: "ATTACHMENT_BIG_0003", size: 30 * 1024 * 1024 } },
      { mimeType: "application/pdf", filename: "invoice.pdf.exe", body: { attachmentId: "ATTACHMENT_DBL_0004", size: 5 } },
    ] },
  };
  const calls = fakeGoogle({ rule: (u) => {
    if (u.includes("/users/me/messages/bbbb0001?format=full")) return jsonResponse(msg);
    if (u.includes("/attachments/ATTACHMENT_PDF_0001")) return jsonResponse({ data: b64("PDFDATA") });
    return undefined;
  } });
  const g = fresh(OAUTH);
  const file = await g.getAttachment("bbbb0001", "ATTACHMENT_PDF_0001");
  assert.equal(file.name, "report.pdf");
  assert.equal(file.data.toString(), "PDFDATA");
  await assert.rejects(g.getAttachment("bbbb0001", "ATTACHMENT_EXE_0002"), /can run on a computer/);
  await assert.rejects(g.getAttachment("bbbb0001", "ATTACHMENT_DBL_0004"), /can run on a computer/);
  await assert.rejects(g.getAttachment("bbbb0001", "ATTACHMENT_BIG_0003"), /larger than 25 MB/);
  await assert.rejects(g.getAttachment("bbbb0001", "ATTACHMENT_NOT_HERE_9"), /could not be found/);
  await assert.rejects(g.getAttachment("../x", "ATTACHMENT_PDF_0001"), g.MailError);
  assert.equal(calls.filter((c) => c.url.includes("/attachments/")).length, 1, "only the allowed file was downloaded");
  assert.equal(g.isRiskyFile("notes.PDF"), false);
  assert.equal(g.isRiskyFile("Run.Bat"), true);
});

await test("polling gives a fingerprint that changes when mail changes", async () => {
  fakeGoogle();
  const g = fresh(OAUTH);
  const a = await g.pollMail();
  assert.match(a.signature, /^[0-9a-f]{16}$/);
  assert.equal(typeof a.unread, "number");
  THREADS.aaaa0001[0].labelIds = ["INBOX"]; // one conversation was read elsewhere
  await g.markThreadRead("aaaa0001"); // expires the saved list; the 10-second guard no longer applies
  const b = await g.pollMail();
  assert.notEqual(a.signature, b.signature);
  assert.equal(b.unread, a.unread - 1);
  THREADS.aaaa0001[0].labelIds = ["INBOX", "UNREAD"];
});

await test("report spam moves the conversation to Spam and out of the inbox", async () => {
  const calls = fakeGoogle();
  const g = fresh(OAUTH);
  await g.reportSpam("aaaa0001");
  assert.deepEqual(JSON.parse(calls.find((c) => c.url.includes("/modify")).body), { addLabelIds: ["SPAM"], removeLabelIds: ["INBOX"] });
  await assert.rejects(g.reportSpam("../x"), g.MailError);
});


const rawOf = (calls) => { const c = calls.find((x) => x.url.endsWith("/messages/send")); return Buffer.from(JSON.parse(c.body).raw, "base64url").toString("utf8"); };

await test("Cc and Bcc go in the headers, are validated, and a Bcc is never shown as To", async () => {
  const calls = fakeGoogle();
  const g = fresh(OAUTH);
  await g.sendNew({ from: "support", to: "a@b.com", cc: "c@d.org, e@f.net", bcc: "secret@x.com", subject: "Hi", body: "Hello" });
  const head = rawOf(calls).split("\r\n\r\n")[0];
  assert.match(head, /^To: a@b\.com$/m);
  assert.match(head, /^Cc: c@d\.org, e@f\.net$/m);
  assert.match(head, /^Bcc: secret@x\.com$/m);
  const before = calls.length;
  const ok = { from: "support", to: "a@b.com", subject: "S", body: "b" };
  await assert.rejects(g.sendNew({ ...ok, cc: "nope" }), /Cc addresses is not complete/);
  await assert.rejects(g.sendNew({ ...ok, bcc: Array.from({ length: 11 }, (_, i) => `u${i}@x.com`).join(",") }), /Bcc can have 10/);
  await assert.rejects(g.sendNew({ ...ok, cc: "c@d.org\r\nBcc: z@y.com x" }), g.MailError);
  assert.equal(calls.length, before);
});

await test("formatted mail keeps simple styling only, and a plain version travels with it", async () => {
  const calls = fakeGoogle();
  const g = fresh(OAUTH);
  const dirty = '<p onclick="x()">Hi <b>there</b> <a href="javascript:alert(1)">bad</a> <a href="https://ok.example/">ok</a><script>alert(1)</script><img src="https://t.example/p.gif"><iframe src="https://e.example"></iframe></p><ul><li>one</li></ul>';
  await g.sendNew({ from: "contact", to: "a@b.com", subject: "Formatted", body: "Hi there bad ok one", html: dirty });
  const raw = rawOf(calls);
  assert.match(raw, /Content-Type: multipart\/alternative/);
  assert.match(raw, /Content-Type: text\/plain/);
  const htmlB64 = raw.split("Content-Type: text/html; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n")[1].split("\r\n--")[0].replace(/\r\n/g, "");
  const html = Buffer.from(htmlB64, "base64").toString("utf8");
  assert.doesNotMatch(html, /<script|<img|<iframe|onclick|javascript:/i);
  assert.match(html, /<b>there<\/b>/);
  assert.match(html, /<a href="https:\/\/ok\.example\/" target="_blank" rel="noopener noreferrer">ok<\/a>/);
  assert.match(html, /<ul><li>one<\/li><\/ul>/);
});

await test("attachments travel with the message; programs, too many and too large are refused", async () => {
  const calls = fakeGoogle();
  const g = fresh(OAUTH);
  const file = (name, size = 10, type = "application/pdf") => ({ name, type, data: Buffer.alloc(size, 65) });
  await g.sendNew({ from: "support", to: "a@b.com", subject: "With file", body: "see attached", files: [file("report.pdf", 12, "application/pdf")] });
  const raw = rawOf(calls);
  assert.match(raw, /Content-Type: multipart\/mixed/);
  assert.match(raw, /Content-Disposition: attachment; filename="report\.pdf"/);
  assert.match(raw, new RegExp(Buffer.alloc(12, 65).toString("base64")));
  const before = calls.length;
  const ok = { from: "support", to: "a@b.com", subject: "S", body: "b" };
  await assert.rejects(g.sendNew({ ...ok, files: [file("setup.exe")] }), /can run on a computer/);
  await assert.rejects(g.sendNew({ ...ok, files: [file("invoice.pdf.js")] }), /can run on a computer/);
  await assert.rejects(g.sendNew({ ...ok, files: Array.from({ length: 11 }, (_, i) => file(`f${i}.txt`)) }), /up to 10 files/);
  await assert.rejects(g.sendNew({ ...ok, files: [file("big.zip", 21 * 1024 * 1024)] }), /larger than 20 MB/);
  assert.equal(calls.length, before, "nothing was sent for any refused message");
  const injected = g.buildMime({ from: "support", to: "a@b.com", subject: "x", body: "y", files: [file('evil"\r\nContent-Type: text/html.pdf')] });
  assert.doesNotMatch(injected, /\r\nContent-Type: text\/html\.pdf/);
});

await test("a large message goes through Gmail's upload address as a raw message", async () => {
  const calls = fakeGoogle({ rule: (u) => (u.includes("/upload/gmail/v1/users/me/messages/send") ? jsonResponse({ ok: true }) : undefined) });
  const g = fresh(OAUTH);
  await g.sendNew({ from: "partnerships", to: "a@b.com", subject: "Big", body: "x", files: [{ name: "deck.pdf", type: "application/pdf", data: Buffer.alloc(3 * 1024 * 1024, 66) }] });
  const up = calls.find((c) => c.url.includes("/upload/gmail/v1/users/me/messages/send"));
  assert.ok(up, "the upload address was used");
  assert.match(up.url, /uploadType=media/);
  assert.equal(calls.filter((c) => c.url.endsWith("/users/me/messages/send")).length, 0, "the small-message route was not used");
  assert.match(up.body.slice(0, 200), /^From: "Vexa Digital" <partnerships@vexadigital\.in>/);
});


const listUrls = (calls) => calls.filter((c) => isList(c.url)).map((c) => c.url);

await test("each folder asks Gmail for the right thing, and keeps its own saved list", async () => {
  const calls = fakeGoogle();
  const g = fresh(OAUTH);
  await g.listFolder("spam");
  await g.listFolder("sent");
  await g.listFolder("all");
  await g.listFolder("social");
  await g.listFolder("starred");
  const urls = listUrls(calls);
  assert.match(urls[0], /labelIds=SPAM/);
  assert.match(urls[0], /includeSpamTrash=true/);
  assert.match(urls[1], /labelIds=SENT/);
  assert.doesNotMatch(urls[1], /includeSpamTrash/);
  assert.doesNotMatch(urls[2], /labelIds/);
  assert.match(decodeURIComponent(urls[3]), /q=in:inbox category:social/);
  assert.match(urls[4], /labelIds=STARRED/);
  const before = urls.length;
  await g.listFolder("spam");
  await g.listFolder("sent");
  assert.equal(listUrls(calls).length, before, "each folder reused its own saved list");
  await g.listThreads();
  assert.match(listUrls(calls)[before], /labelIds=INBOX/, "the inbox has its own list");
  assert.equal(g.isFolder("trash"), true);
  assert.equal(g.isFolder("../x"), false);
});

await test("in Sent and Drafts a conversation shows who it went to", async () => {
  const mine = message("s1", [header("From", "Vexa Digital <partnerships@vexadigital.in>"), header("To", "Sahil <sahililiyaskhan@gmail.com>, sahil@hiveout.in, ana@x.com"), header("Subject", "TEST MAIL")], { threadId: "bbbb0009", labels: ["SENT"] });
  const calls = fakeGoogle({ rule: (u) => {
    if (u.includes("/users/me/threads?") && u.includes("labelIds=SENT")) return jsonResponse({ threads: [{ id: "bbbb0009" }] });
    if (u.includes("/users/me/threads/bbbb0009")) return jsonResponse({ id: "bbbb0009", messages: [mine] });
    return undefined;
  } });
  const g = fresh(OAUTH);
  const [t] = await g.listFolder("sent");
  assert.equal(t.from, "To: Sahil, sahil@hiveout.in +1");
  assert.equal(t.box, "partnerships");
  assert.ok(calls.length > 0);
});

await test("folder numbers: unread for the inbox, totals for Drafts, and a failing folder is left out", async () => {
  fakeGoogle({ rule: (u) => {
    const m = u.match(/\/users\/me\/labels\/([A-Z_]+)$/);
    if (!m) return undefined;
    if (m[1] === "INBOX") return jsonResponse({ threadsUnread: 7, threadsTotal: 90 });
    if (m[1] === "DRAFT") return jsonResponse({ threadsUnread: 0, threadsTotal: 3 });
    if (m[1] === "SPAM") return jsonResponse({ threadsUnread: 0, threadsTotal: 0 });
    return status(500);
  } });
  const g = fresh(OAUTH);
  assert.deepEqual(await g.folderCounts(), { inbox: 7, drafts: 3 });
});

await test("moving a conversation out of Spam or Trash puts it back in the inbox", async () => {
  const trashed = { id: "aaaa0001", messages: [{ id: "m1", labelIds: ["TRASH"] }] };
  const spam = { id: "aaaa0002", messages: [{ id: "m2", labelIds: ["SPAM"] }] };
  const calls = fakeGoogle({ rule: (u) => (u.includes("format=minimal") ? jsonResponse(u.includes("aaaa0001") ? trashed : spam) : undefined) });
  const g = fresh(OAUTH);
  await g.restoreThread("aaaa0001");
  assert.ok(calls.some((c) => c.url.endsWith("/threads/aaaa0001/trash") === false && c.url.endsWith("/threads/aaaa0001/untrash") && c.method === "POST"), "a trashed conversation is un-trashed");
  assert.deepEqual(JSON.parse(calls.find((c) => c.url.includes("/threads/aaaa0001/modify")).body), { addLabelIds: ["INBOX"], removeLabelIds: ["SPAM"] });
  await g.restoreThread("aaaa0002");
  assert.equal(calls.filter((c) => c.url.endsWith("/untrash")).length, 1, "a conversation that is only in Spam is not un-trashed");
  await assert.rejects(g.restoreThread("../x"), g.MailError);
});

await test("closing a message keeps it as a draft, which can be updated and thrown away", async () => {
  const calls = fakeGoogle();
  const g = fresh(OAUTH);
  const id = await g.saveDraft({ from: "partnerships", to: "", subject: "", body: "Half a thought" });
  assert.equal(id, "r123");
  const made = calls.find((c) => c.url.endsWith("/users/me/drafts"));
  assert.match(Buffer.from(JSON.parse(made.body).message.raw, "base64url").toString(), /^From: "Vexa Digital" <partnerships@vexadigital\.in>/);
  await g.saveDraft({ id, from: "partnerships", to: "a@b.com", subject: "Hi", body: "More" });
  assert.equal(calls.filter((c) => c.method === "PUT" && c.url.endsWith("/drafts/r123")).length, 1);
  await g.deleteDraft(id);
  assert.equal(calls.filter((c) => c.method === "DELETE").length, 1);
  await assert.rejects(g.saveDraft({ from: "nobody", to: "", subject: "", body: "x" }), g.MailError);
});

await test("a draft can be opened again with its recipients and text", async () => {
  fakeGoogle();
  const g = fresh(OAUTH);
  const d = await g.getDraft("aaaa0002");
  assert.equal(d.id, "r9");
  assert.equal(d.from, "support");
  assert.equal(d.to, "a@b.com, c@d.com");
  assert.equal(d.bcc, "e@f.com");
  assert.equal(d.subject, "Half done");
  assert.match(d.html, /Hello <b>there<\/b>/);
  assert.equal(await g.getDraft("bbbb0001"), null);
});

const failed = results.filter(([s]) => s === "FAIL").length;
console.log(`\n${results.length - failed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
