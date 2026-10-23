#!/usr/bin/env node
// Gives an existing account admin access. Run on the server that holds the data folder:
//   npm run make-admin -- someone@example.com
// The person must have signed up first. This is how the very first admin is created.
import { readFileSync, renameSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// the project folder, wherever the command is run from
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const email = (process.argv[2] ?? "").trim().toLowerCase();
if (!email) {
  console.error("Usage: npm run make-admin -- someone@example.com");
  process.exit(1);
}
const file = path.join(process.env.VEXA_DATA_DIR ?? path.join(root, "data"), "users.json");
let users;
try {
  users = JSON.parse(readFileSync(file, "utf8"));
} catch {
  console.error(`No accounts found at ${file}. Sign up on the website first, then run this again.`);
  process.exit(1);
}
const user = users.find((u) => u.email === email);
if (!user) {
  console.error(`No account for ${email}. Sign up with that exact email on the website first, then run this again.`);
  process.exit(1);
}
user.role = "admin";
writeFileSync(`${file}.tmp`, JSON.stringify(users, null, 2), { mode: 0o600 });
renameSync(`${file}.tmp`, file);
console.log(`${user.name} <${email}> is now an admin.`);
