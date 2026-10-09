import { randomBytes } from "node:crypto";
import { spawn } from "node:child_process";
import { mkdirSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const data = path.join(root, ".local", "data");
mkdirSync(data, { recursive: true });
const env = { ...process.env, VEXA_PREVIEW: "1", VEXA_BUILD_DIR: ".next-review-dev", VEXA_DATA_DIR: data,
  CONTACT_WEBHOOK_URL: "", CONTACT_WEBHOOK_TOKEN: "", GOOGLE_CLIENT_ID: "", GOOGLE_CLIENT_SECRET: "",
  NEXTAUTH_SECRET: randomBytes(32).toString("base64url"), NEXTAUTH_URL: "http://localhost:3310", TEAM_PROGRAMME_OPEN: "0" };
const child = spawn(process.execPath, [path.join(root, "node_modules/next/dist/bin/next"), "dev", "--hostname", "127.0.0.1", "--port", "3310"], {env, stdio: "inherit"});
for (const signal of ["SIGTERM", "SIGINT"]) process.on(signal, () => child.kill(signal));
child.on("exit", code => process.exit(code ?? 1));
