// One-time sign-in for the admin mail inbox. Run: npm run gmail-authorize
//
// Opens Google's consent screen for partnerships@vexadigital.in, then saves the resulting refresh token into
// .env.local as GMAIL_OAUTH_REFRESH_TOKEN. The token is never printed. If the account that signs in is not
// partnerships@vexadigital.in, nothing is saved.
//
// Needs GMAIL_OAUTH_CLIENT_ID and GMAIL_OAUTH_CLIENT_SECRET in .env.local, from a Google Cloud OAuth client of
// type "Desktop app" (a separate client from the one used for Google sign-in).
import { createServer } from "http";
import { readFileSync, writeFileSync, existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const MAILBOX = "partnerships@vexadigital.in";
const SCOPES = ["https://www.googleapis.com/auth/gmail.modify", "https://www.googleapis.com/auth/gmail.send"];
const PORT = 53682;
const REDIRECT = `http://127.0.0.1:${PORT}/callback`;
// saved into .env.local; for the production values run:  ENV_FILE=.env.production npm run gmail-authorize
const envFile = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", process.env.ENV_FILE ?? ".env.local");

const env = existsSync(envFile) ? readFileSync(envFile, "utf8") : "";
const read = (name) => env.match(new RegExp(`^${name}=(.*)$`, "m"))?.[1]?.trim() ?? "";
const clientId = read("GMAIL_OAUTH_CLIENT_ID");
const clientSecret = read("GMAIL_OAUTH_CLIENT_SECRET");
if (!clientId || !clientSecret) {
  console.error("Add GMAIL_OAUTH_CLIENT_ID and GMAIL_OAUTH_CLIENT_SECRET to .env.local first (see docs/gmail-inbox.md).");
  process.exit(1);
}

const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
url.search = new URLSearchParams({
  client_id: clientId,
  redirect_uri: REDIRECT,
  response_type: "code",
  scope: SCOPES.join(" "),
  access_type: "offline",
  prompt: "consent",
  login_hint: MAILBOX,
}).toString();

function save(name, value) {
  const line = `${name}=${value}`;
  const next = new RegExp(`^${name}=.*$`, "m").test(env) ? env.replace(new RegExp(`^${name}=.*$`, "m"), line) : `${env.replace(/\n*$/, "\n")}${line}\n`;
  writeFileSync(envFile, next, { mode: 0o600 });
}

const server = createServer(async (req, res) => {
  const u = new URL(req.url ?? "/", REDIRECT);
  if (u.pathname !== "/callback") return res.writeHead(404).end();
  const done = (code, message) => {
    res.writeHead(code, { "Content-Type": "text/plain; charset=utf-8" }).end(message);
    server.close();
  };
  const code = u.searchParams.get("code");
  if (!code) return done(400, `Google did not return a code (${u.searchParams.get("error") ?? "unknown"}). You can close this tab.`);

  try {
    const token = await (
      await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ code, client_id: clientId, client_secret: clientSecret, redirect_uri: REDIRECT, grant_type: "authorization_code" }),
      })
    ).json();
    if (!token.refresh_token) return done(400, "Google returned no refresh token. Remove the app's access at myaccount.google.com/permissions for this account and run this again.");

    const profile = await (await fetch("https://gmail.googleapis.com/gmail/v1/users/me/profile", { headers: { Authorization: `Bearer ${token.access_token}` } })).json();
    if (String(profile.emailAddress).toLowerCase() !== MAILBOX) {
      console.error(`\nSigned in as a different account (${profile.emailAddress}). Nothing was saved. Sign in as ${MAILBOX}.`);
      return done(400, `That is not ${MAILBOX}. Nothing was saved. You can close this tab.`);
    }
    save("GMAIL_OAUTH_REFRESH_TOKEN", token.refresh_token);
    console.log(`\nSaved GMAIL_OAUTH_REFRESH_TOKEN for ${MAILBOX} in .env.local. Restart the dev server.`);
    done(200, `Connected to ${MAILBOX}. You can close this tab and go back to the terminal.`);
  } catch {
    done(500, "Something went wrong while connecting. Nothing was saved. You can close this tab.");
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Open this address in the browser, and sign in as ${MAILBOX}:\n\n${url.toString()}\n`);
});
