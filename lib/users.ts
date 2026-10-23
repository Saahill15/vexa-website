import { randomBytes, scrypt, timingSafeEqual } from "crypto";
import { db, isUuid, isoOrUndefined, iso, transaction, type Queryer } from "./db";
import { istIso } from "./time";

export type Role = "user" | "admin";

export type User = {
  id: string;
  name: string;
  email: string;
  /** Present for accounts created with a password. */
  passwordHash?: string;
  googleId?: string;
  emailVerified: boolean;
  role: Role;
  disabled: boolean;
  createdAt: string;
  lastLoginAt?: string;
  /** Set when the password is changed (for example by a reset). Sessions issued before this stop working. */
  passwordChangedAt?: string;
  /** Set by "sign out everywhere". Sessions issued before this stop working. */
  sessionsRevokedAt?: string;
  /** Admin inbox: everything before this time counts as read, plus any item key listed in inboxRead. */
  inboxReadAll?: string;
  inboxRead?: string[];
};

type UserRow = {
  id: string;
  name: string;
  email: string;
  password_hash: string | null;
  google_id: string | null;
  email_verified: boolean;
  role: Role;
  disabled: boolean;
  created_at: Date;
  last_login_at: Date | null;
  password_changed_at: Date | null;
  sessions_revoked_at: Date | null;
  inbox_read_all: Date | null;
  inbox_read: string[];
};

const COLUMNS = "id, name, email, password_hash, google_id, email_verified, role, disabled, created_at, last_login_at, password_changed_at, sessions_revoked_at, inbox_read_all, inbox_read";

function toUser(r: UserRow): User {
  return {
    id: r.id,
    name: r.name,
    email: r.email,
    ...(r.password_hash ? { passwordHash: r.password_hash } : {}),
    ...(r.google_id ? { googleId: r.google_id } : {}),
    emailVerified: r.email_verified,
    role: r.role,
    disabled: r.disabled,
    createdAt: iso(r.created_at),
    lastLoginAt: isoOrUndefined(r.last_login_at),
    passwordChangedAt: isoOrUndefined(r.password_changed_at),
    sessionsRevokedAt: isoOrUndefined(r.sessions_revoked_at),
    inboxReadAll: isoOrUndefined(r.inbox_read_all),
    inboxRead: r.inbox_read,
  };
}

async function oneUser(q: Queryer, sql: string, params: unknown[]): Promise<User | null> {
  const { rows } = await q.query<UserRow>(sql, params);
  return rows[0] ? toUser(rows[0]) : null;
}

/** Emails in ADMIN_EMAILS are admins once their address is verified by Google. */
function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
}

export function isListedAdmin(user: User): boolean {
  return user.emailVerified && adminEmails().includes(user.email);
}

export function effectiveRole(user: User): Role {
  return user.role === "admin" || isListedAdmin(user) ? "admin" : "user";
}

/** Cost of a new password hash (32 MB of memory per attempt). Earlier hashes, made with Node's lighter default, still verify. */
const COST = 32768;
const derive = (password: string, salt: Buffer, cost?: number) =>
  new Promise<Buffer>((resolve, reject) =>
    scrypt(password, salt, 64, cost ? { N: cost, r: 8, p: 1, maxmem: 128 * cost * 8 * 2 } : {}, (error, key) => (error ? reject(error) : resolve(key))),
  );

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await derive(password, salt, COST);
  return `scrypt$${COST}$${salt.toString("base64")}$${key.toString("base64")}`;
}

const DUMMY = `scrypt$${COST}$${Buffer.alloc(16).toString("base64")}$${Buffer.alloc(64).toString("base64")}`;

/** Always does the same work, so a wrong email takes as long as a wrong password. */
export async function verifyPassword(password: string, stored: string | undefined): Promise<boolean> {
  const parts = (stored ?? DUMMY).split("$");
  // "scrypt$cost$salt$key" (current) or "scrypt$salt$key" (earlier)
  const [scheme, ...rest] = parts;
  const cost = rest.length === 3 ? Number(rest[0]) : undefined;
  const [saltB64, keyB64] = rest.length === 3 ? rest.slice(1) : rest;
  if (scheme !== "scrypt" || !saltB64 || !keyB64 || (cost !== undefined && (!Number.isInteger(cost) || cost < 16384 || cost > 262144))) return false;
  const expected = Buffer.from(keyB64, "base64");
  const actual = await derive(password, Buffer.from(saltB64, "base64"), cost);
  return stored !== undefined && expected.length === actual.length && timingSafeEqual(expected, actual);
}

export async function listUsers(): Promise<User[]> {
  const { rows } = await db.query<UserRow>(`select ${COLUMNS} from users order by created_at`);
  return rows.map(toUser);
}

export async function getUserById(id: string): Promise<User | null> {
  if (!isUuid(id)) return null;
  return oneUser(db, `select ${COLUMNS} from users where id = $1`, [id]);
}

export async function getUserByEmail(email: string): Promise<User | null> {
  return oneUser(db, `select ${COLUMNS} from users where email = $1`, [email.toLowerCase()]);
}

/** Creates an account once its email has been confirmed. Null if the email already has an account. */
export async function createConfirmedUser(input: { name: string; email: string; passwordHash: string }): Promise<User | null> {
  return oneUser(
    db,
    `insert into users (name, email, password_hash, email_verified, role, disabled)
     values ($1, $2, $3, true, 'user', false) on conflict do nothing returning ${COLUMNS}`,
    [input.name, input.email.toLowerCase(), input.passwordHash],
  );
}

export type GoogleOutcome = { kind: "login"; user: User } | { kind: "link"; user: User } | { kind: "blocked" };

/**
 * Google sign-in. A Google account already linked signs straight in. A matching email with a password is never
 * merged silently: the caller must confirm it with that password first ("link"). A matching email without a
 * password (not expected, but safe) is linked. Otherwise a new account is created.
 */
export async function googleLogin(input: { googleId: string; name: string; email: string }): Promise<GoogleOutcome> {
  const email = input.email.toLowerCase();
  return transaction(async (client): Promise<GoogleOutcome> => {
    const byGoogle = await oneUser(client, `select ${COLUMNS} from users where google_id = $1`, [input.googleId]);
    if (byGoogle) return { kind: "login", user: byGoogle };
    const byEmail = await oneUser(client, `select ${COLUMNS} from users where email = $1 for update`, [email]);
    if (byEmail?.passwordHash) return { kind: "link", user: byEmail };
    // a Google-only account already holds this email under a different Google account: never swap it over
    if (byEmail?.googleId) return { kind: "blocked" };
    if (byEmail) {
      const linked = await oneUser(client, `update users set google_id = $2, email_verified = true where id = $1 returning ${COLUMNS}`, [byEmail.id, input.googleId]);
      return { kind: "login", user: linked as User };
    }
    const user = await oneUser(
      client,
      `insert into users (name, email, google_id, email_verified, role, disabled)
       values ($1, $2, $3, true, 'user', false) returning ${COLUMNS}`,
      [input.name || email.split("@")[0], email, input.googleId],
    );
    return { kind: "login", user: user as User };
  });
}

/** Links a Google account to an existing account. Returns an error message, or null when linked. */
export async function linkGoogle(userId: string, googleId: string): Promise<string | null> {
  if (!isUuid(userId)) return "That account no longer exists.";
  return transaction(async (client) => {
    const user = await oneUser(client, `select ${COLUMNS} from users where id = $1 for update`, [userId]);
    if (!user) return "That account no longer exists.";
    if (user.googleId && user.googleId !== googleId) return "This account is already linked to a different Google account. Unlink it first.";
    const taken = await client.query("select 1 from users where google_id = $1 and id <> $2", [googleId, userId]);
    if (taken.rowCount) return "That Google account is already linked to another account.";
    await client.query("update users set google_id = $2, email_verified = true where id = $1", [userId, googleId]);
    return null;
  });
}

/** Removes the Google link. Refused unless a password is set, so nobody is left without a way to log in. */
export async function unlinkGoogle(userId: string): Promise<string | null> {
  if (!isUuid(userId)) return "That account no longer exists.";
  return transaction(async (client) => {
    const user = await oneUser(client, `select ${COLUMNS} from users where id = $1 for update`, [userId]);
    if (!user) return "That account no longer exists.";
    if (!user.passwordHash) return "Set a password first, so you still have a way to log in.";
    await client.query("update users set google_id = null where id = $1", [userId]);
    return null;
  });
}

/** Removes the password. Refused unless Google is linked, so nobody is left without a way to log in. */
export async function removePassword(userId: string): Promise<string | null> {
  if (!isUuid(userId)) return "That account no longer exists.";
  return transaction(async (client) => {
    const user = await oneUser(client, `select ${COLUMNS} from users where id = $1 for update`, [userId]);
    if (!user) return "That account no longer exists.";
    if (!user.googleId) return "Link Google first, so you still have a way to log in.";
    await client.query("update users set password_hash = null where id = $1", [userId]);
    return null;
  });
}

export async function touchLogin(id: string) {
  if (!isUuid(id)) return;
  await db.query("update users set last_login_at = $2 where id = $1", [id, istIso()]);
}

/** Admin actions. Both refuse to leave the site without an administrator. */
export async function setRole(id: string, role: Role): Promise<string | null> {
  if (!isUuid(id)) return "That account no longer exists.";
  return transaction(async (client) => {
    const user = await oneUser(client, `select ${COLUMNS} from users where id = $1 for update`, [id]);
    if (!user) return "That account no longer exists.";
    if (role === "user" && isListedAdmin(user)) return "This person is an admin through ADMIN_EMAILS. Remove them from that list to change it.";
    if (role === "user" && user.role === "admin" && (await activeAdminCount(client)) <= 1) return "There must be at least one admin.";
    await client.query("update users set role = $2 where id = $1", [id, role]);
    return null;
  });
}

export async function setDisabled(id: string, disabled: boolean): Promise<string | null> {
  if (!isUuid(id)) return "That account no longer exists.";
  return transaction(async (client) => {
    const user = await oneUser(client, `select ${COLUMNS} from users where id = $1 for update`, [id]);
    if (!user) return "That account no longer exists.";
    if (disabled && effectiveRole(user) === "admin" && (await activeAdminCount(client)) <= 1) return "You can't disable the only admin.";
    await client.query("update users set disabled = $2 where id = $1", [id, disabled]);
    return null;
  });
}

/** Accounts that are currently admins (by role or by ADMIN_EMAILS) and not disabled. */
async function activeAdminCount(client: Queryer): Promise<number> {
  const { rows } = await client.query<UserRow>(`select ${COLUMNS} from users where (role = 'admin' or email = any($1)) and not disabled`, [adminEmails()]);
  return rows.map(toUser).filter((u) => effectiveRole(u) === "admin").length;
}

/** Admin inbox read state. */
export async function markInboxRead(userId: string, key: string) {
  if (!isUuid(userId)) return;
  await transaction(async (client) => {
    const user = await oneUser(client, `select ${COLUMNS} from users where id = $1 for update`, [userId]);
    if (!user) return;
    const read = user.inboxRead ?? [];
    if (read.includes(key)) return;
    await client.query("update users set inbox_read = $2 where id = $1", [userId, [...read, key].slice(-400)]);
  });
}
export async function markAllInboxRead(userId: string) {
  if (!isUuid(userId)) return;
  await db.query("update users set inbox_read_all = $2, inbox_read = '{}' where id = $1", [userId, istIso()]);
}

/** Sets a new password. A password reset also proves the email address, so the account counts as verified. */
export async function setPassword(userId: string, password: string): Promise<boolean> {
  if (!isUuid(userId)) return false;
  const passwordHash = await hashPassword(password);
  const { rowCount } = await db.query(
    "update users set password_hash = $2, email_verified = true, password_changed_at = $3 where id = $1",
    [userId, passwordHash, istIso()],
  );
  return Boolean(rowCount);
}

/** Marks the email address as proven (after the verification link, a password reset, or a Google link). */
export async function setEmailVerified(userId: string): Promise<void> {
  if (!isUuid(userId)) return;
  await db.query("update users set email_verified = true where id = $1", [userId]);
}

/** Changes the display name. Returns an error message, or null when saved. */
export async function setName(userId: string, name: string): Promise<string | null> {
  if (!isUuid(userId)) return "That account no longer exists.";
  const { rowCount } = await db.query("update users set name = $2 where id = $1", [userId, name]);
  return rowCount ? null : "That account no longer exists.";
}

/** Signs out every session issued before now. The caller starts a new session for the device they are on. */
export async function revokeSessions(userId: string): Promise<void> {
  if (!isUuid(userId)) return;
  await db.query("update users set sessions_revoked_at = $2 where id = $1", [userId, istIso()]);
}

