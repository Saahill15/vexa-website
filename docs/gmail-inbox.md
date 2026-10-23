# Admin mail inbox (Gmail)

The admin Inbox can show and answer the mail of `partnerships@vexadigital.in`, split by the address each message was sent to:
`partnerships@`, `support@` and `contact@` (the last two are aliases of the same mailbox). Replies can be sent from any of the three.

Only that mailbox can be opened. The code fixes the mailbox name and asks Gmail who it is signed in as before reading anything.
No Google service-account key file is created or used; the organisation policy that blocks key creation stays in force.

## What is already done (Google side)

- Google Cloud project `Vexa Digital`, service account `vexa-mail-inbox@vexa-digital.iam.gserviceaccount.com`.
- Domain-wide delegation for that service account's Client ID, with the scopes `gmail.modify` and `gmail.send`.

## Check before anything else

1. **Gmail API is on.** Google Cloud console → APIs & Services → Enabled APIs → "Gmail API". Turn it on if it is missing.
2. **The consent screen allows internal use.** APIs & Services → OAuth consent screen. User type should be **Internal** so the
   Gmail scopes need no Google verification. Do not change the existing Google Sign-In client.

## Sign-in method 1: one-time authorisation (works on the Mac and on the server)

1. Google Cloud → APIs & Services → Credentials → **Create credentials → OAuth client ID** → application type **Desktop app**
   (a new client, separate from the Sign-In one). Copy its ID and secret.
2. Put them in `.env.local` (never in chat or in git):

   ```
   GMAIL_OAUTH_CLIENT_ID=...
   GMAIL_OAUTH_CLIENT_SECRET=...
   ```
3. Run `npm run gmail-authorize`, open the address it prints, and sign in as **partnerships@vexadigital.in**.
   The script checks that the account really is that mailbox, and saves `GMAIL_OAUTH_REFRESH_TOKEN` into `.env.local` without
   printing it. If another account signs in, nothing is saved.
4. Restart the server. Admin → Inbox → Mail.
5. On the server, put the same three values in `/opt/vexa/site/.env` and add them to the `environment:` list in
   `docker-compose.site.yml`.

## Sign-in method 2: keyless delegation (local development only)

Uses the service account through domain-wide delegation without any key: Google signs the login assertion on its behalf.

1. Install the Google Cloud CLI and run `gcloud auth application-default login` with your own Google account.
2. In Google Cloud, grant your account **Service Account Token Creator** on `vexa-mail-inbox` (IAM → Service accounts → the
   account → Permissions).
3. Turn on the **IAM Service Account Credentials API**.
4. Set `GMAIL_AUTH=delegation` in `.env.local`.

This cannot run on the Hetzner server, which has no Google identity to sign in with, so production uses method 1.

## Settings

| Name | Meaning |
| --- | --- |
| `GMAIL_AUTH` | `oauth` (default) or `delegation` |
| `GMAIL_OAUTH_CLIENT_ID`, `GMAIL_OAUTH_CLIENT_SECRET` | The Desktop-app OAuth client (method 1) |
| `GMAIL_OAUTH_REFRESH_TOKEN` | Written by `npm run gmail-authorize` (method 1) |
| `GMAIL_SERVICE_ACCOUNT` | Optional, delegation only. Default `vexa-mail-inbox@vexa-digital.iam.gserviceaccount.com` |

## Behaviour

- Messages are read as plain text only. HTML mail is converted to text, so it cannot run scripts or load tracking images.
  Attachments are listed by name and are not downloadable yet.
- Read state is Gmail's own UNREAD label, shared by every admin.
- The conversation list is cached for 45 seconds.
- Replies stay in the same conversation (thread id, In-Reply-To, References). Check once, after connecting, that a reply sent
  from `support@` shows `support@vexadigital.in` as its sender; Gmail replaces an address it does not recognise as an alias.

## Tests

`npm run test:mail` runs the Gmail layer against a fake Google and a fake Gmail. Nothing real is contacted.
