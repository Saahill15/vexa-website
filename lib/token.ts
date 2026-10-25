import { createHmac, randomBytes } from "crypto";
import { chmodSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";

/*
 * The signed session token: the account id, an expiry and the time it was issued, signed with HMAC-SHA256. It carries no
 * role: who is an admin is always read from the account on the server, so a token can never claim more than the account has.
 */

let cachedSecret: Buffer | null = null;
function secret(): Buffer {
  if (cachedSecret) return cachedSecret;
  const fromEnv = process.env.SESSION_SECRET;
  if (fromEnv && fromEnv.length >= 32) return (cachedSecret = Buffer.from(fromEnv));
  // a hosted site has no folder that lasts between requests, so there the secret must be set
  if (process.env.NODE_ENV === "production") throw new Error("SESSION_SECRET must be set in production: at least 32 random characters (openssl rand -base64 48).");
  // development: make one once and keep it in the data folder, so sessions survive restarts
  const folder = process.env.VEXA_DATA_DIR ?? path.join(process.cwd(), "data");
  const where = path.join(folder, ".session-secret");
  if (!existsSync(where)) {
    mkdirSync(folder, { recursive: true, mode: 0o700 });
    writeFileSync(where, randomBytes(48).toString("base64"), { mode: 0o600 });
    chmodSync(where, 0o600);
  }
  return (cachedSecret = Buffer.from(readFileSync(where, "utf8").trim()));
}

export const sign = (payload: string) => createHmac("sha256", secret()).update(payload).digest("base64url");
