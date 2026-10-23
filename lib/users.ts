import { randomBytes, scrypt, timingSafeEqual } from "crypto";
import { newId, readAll, update } from "./store";
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

const COLLECTION = "users";

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

const derive = (password: string, salt: Buffer) =>
  new Promise<Buffer>((resolve, reject) => scrypt(password, salt, 64, (error, key) => (error ? reject(error) : resolve(key))));

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await derive(password, salt);
  return `scrypt$${salt.toString("base64")}$${key.toString("base64")}`;
}

const DUMMY = `scrypt$${Buffer.alloc(16).toString("base64")}$${Buffer.alloc(64).toString("base64")}`;

/** Always does the same work, so a wrong email takes as long as a wrong password. */
export async function verifyPassword(password: string, stored: string | undefined): Promise<boolean> {
  const [scheme, saltB64, keyB64] = (stored ?? DUMMY).split("$");
  if (scheme !== "scrypt" || !saltB64 || !keyB64) return false;
  const expected = Buffer.from(keyB64, "base64");
  const actual = await derive(password, Buffer.from(saltB64, "base64"));
  return stored !== undefined && expected.length === actual.length && timingSafeEqual(expected, actual);
}

export const listUsers = () => readAll<User>(COLLECTION);
export async function getUserById(id: string) {
  return (await listUsers()).find((u) => u.id === id) ?? null;
}
export async function getUserByEmail(email: string) {
  const e = email.toLowerCase();
  return (await listUsers()).find((u) => u.email === e) ?? null;
}

/** Creates an account once its email has been confirmed. Null if the email already has an account. */
export async function createConfirmedUser(input: { name: string; email: string; passwordHash: string }): Promise<User | null> {
  return update<User, User | null>(COLLECTION, (rows) => {
    const email = input.email.toLowerCase();
    if (rows.some((u) => u.email === email)) return null;
    const user: User = { id: newId(), name: input.name, email, passwordHash: input.passwordHash, emailVerified: true, role: "user", disabled: false, createdAt: istIso() };
    rows.push(user);
    return user;
  });
}

export type GoogleOutcome = { kind: "login"; user: User } | { kind: "link"; user: User } | { kind: "blocked" };

/**
 * Google sign-in. A Google account already linked signs straight in. A matching email with a password is never
 * merged silently: the caller must confirm it with that password first ("link"). A matching email without a
 * password (not expected, but safe) is linked. Otherwise a new account is created.
 */
export async function googleLogin(input: { googleId: string; name: string; email: string }): Promise<GoogleOutcome> {
  return update<User, GoogleOutcome>(COLLECTION, (rows) => {
    const email = input.email.toLowerCase();
    const byGoogle = rows.find((u) => u.googleId === input.googleId);
    if (byGoogle) return { kind: "login", user: byGoogle };
    const byEmail = rows.find((u) => u.email === email);
    if (byEmail?.passwordHash) return { kind: "link", user: byEmail };
    // a Google-only account already holds this email under a different Google account: never swap it over
    if (byEmail?.googleId) return { kind: "blocked" };
    if (byEmail) {
      byEmail.googleId = input.googleId;
      byEmail.emailVerified = true;
      return { kind: "login", user: byEmail };
    }
    const user: User = { id: newId(), name: input.name || email.split("@")[0], email, googleId: input.googleId, emailVerified: true, role: "user", disabled: false, createdAt: istIso() };
    rows.push(user);
    return { kind: "login", user };
  });
}

/** Links a Google account to an existing account. Returns an error message, or null when linked. */
export async function linkGoogle(userId: string, googleId: string): Promise<string | null> {
  return update<User, string | null>(COLLECTION, (rows) => {
    if (rows.some((u) => u.googleId === googleId && u.id !== userId)) return "That Google account is already linked to another account.";
    const user = rows.find((u) => u.id === userId);
    if (!user) return "That account no longer exists.";
    if (user.googleId && user.googleId !== googleId) return "This account is already linked to a different Google account. Unlink it first.";
    user.googleId = googleId;
    user.emailVerified = true;
    return null;
  });
}

/** Removes the Google link. Refused unless a password is set, so nobody is left without a way to log in. */
export async function unlinkGoogle(userId: string): Promise<string | null> {
  return update<User, string | null>(COLLECTION, (rows) => {
    const user = rows.find((u) => u.id === userId);
    if (!user) return "That account no longer exists.";
    if (!user.passwordHash) return "Set a password first, so you still have a way to log in.";
    delete user.googleId;
    return null;
  });
}

/** Removes the password. Refused unless Google is linked, so nobody is left without a way to log in. */
export async function removePassword(userId: string): Promise<string | null> {
  return update<User, string | null>(COLLECTION, (rows) => {
    const user = rows.find((u) => u.id === userId);
    if (!user) return "That account no longer exists.";
    if (!user.googleId) return "Link Google first, so you still have a way to log in.";
    delete user.passwordHash;
    return null;
  });
}

export async function touchLogin(id: string) {
  await update<User>(COLLECTION, (rows) => {
    const user = rows.find((u) => u.id === id);
    if (user) user.lastLoginAt = istIso();
  });
}

/** Admin actions. Both refuse to leave the site without an administrator. */
export async function setRole(id: string, role: Role): Promise<string | null> {
  return update<User, string | null>(COLLECTION, (rows) => {
    const user = rows.find((u) => u.id === id);
    if (!user) return "That account no longer exists.";
    if (role === "user" && isListedAdmin(user)) return "This person is an admin through ADMIN_EMAILS. Remove them from that list to change it.";
    if (role === "user" && user.role === "admin" && rows.filter((u) => effectiveRole(u) === "admin" && !u.disabled).length <= 1) return "There must be at least one admin.";
    user.role = role;
    return null;
  });
}

export async function setDisabled(id: string, disabled: boolean): Promise<string | null> {
  return update<User, string | null>(COLLECTION, (rows) => {
    const user = rows.find((u) => u.id === id);
    if (!user) return "That account no longer exists.";
    if (disabled && effectiveRole(user) === "admin" && rows.filter((u) => effectiveRole(u) === "admin" && !u.disabled).length <= 1) return "You can't disable the only admin.";
    user.disabled = disabled;
    return null;
  });
}

/** Admin inbox read state. */
export async function markInboxRead(userId: string, key: string) {
  await update<User>(COLLECTION, (rows) => {
    const user = rows.find((u) => u.id === userId);
    if (!user) return;
    const read = user.inboxRead ?? [];
    if (!read.includes(key)) user.inboxRead = [...read, key].slice(-400);
  });
}
export async function markAllInboxRead(userId: string) {
  await update<User>(COLLECTION, (rows) => {
    const user = rows.find((u) => u.id === userId);
    if (!user) return;
    user.inboxReadAll = istIso();
    user.inboxRead = [];
  });
}

/** Sets a new password. A password reset also proves the email address, so the account counts as verified. */
export async function setPassword(userId: string, password: string): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return update<User, boolean>(COLLECTION, (rows) => {
    const user = rows.find((u) => u.id === userId);
    if (!user) return false;
    user.passwordHash = passwordHash;
    user.emailVerified = true;
    user.passwordChangedAt = istIso();
    return true;
  });
}

/** Marks the email address as proven (after the verification link, a password reset, or a Google link). */
export async function setEmailVerified(userId: string): Promise<void> {
  await update<User>(COLLECTION, (rows) => {
    const user = rows.find((u) => u.id === userId);
    if (user) user.emailVerified = true;
  });
}

/** Changes the display name. Returns an error message, or null when saved. */
export async function setName(userId: string, name: string): Promise<string | null> {
  return update<User, string | null>(COLLECTION, (rows) => {
    const user = rows.find((u) => u.id === userId);
    if (!user) return "That account no longer exists.";
    user.name = name;
    return null;
  });
}

/** Signs out every session issued before now. The caller starts a new session for the device they are on. */
export async function revokeSessions(userId: string): Promise<void> {
  await update<User>(COLLECTION, (rows) => {
    const user = rows.find((u) => u.id === userId);
    if (user) user.sessionsRevokedAt = istIso();
  });
}
