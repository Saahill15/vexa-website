#!/usr/bin/env node
// Gives an existing account admin access. Needs DATABASE_URL (run it where the site's database is reachable):
//   npm run make-admin -- someone@example.com
// The person must have signed up first. This is how the very first admin is created.
import pg from "pg";

const email = (process.argv[2] ?? "").trim().toLowerCase();
if (!email) {
  console.error("Usage: npm run make-admin -- someone@example.com");
  process.exit(1);
}
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set. Put it in .env.local (development) or .env.production (server).");
  process.exit(1);
}

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
try {
  const { rows, rowCount } = await client.query("update users set role = 'admin' where email = $1 returning name", [email]);
  if (!rowCount) {
    console.error(`No account for ${email}. Sign up with that exact email on the website first, then run this again.`);
    process.exitCode = 1;
  } else {
    console.log(`${rows[0].name} <${email}> is now an admin.`);
  }
} finally {
  await client.end();
}
