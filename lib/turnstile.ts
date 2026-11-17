/*
 * Cloudflare Turnstile: the spam check on the enquiry and sign-up forms. The page shows the widget when TURNSTILE_SITE_KEY is
 * set; the server checks the token it produces when TURNSTILE_SECRET_KEY is set. With neither key (for example a local
 * machine) the forms work without the check.
 */
export const turnstileOn = (): boolean => Boolean(process.env.TURNSTILE_SECRET_KEY);

export async function verifyTurnstile(token: unknown, ip?: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (typeof token !== "string" || !token || token.length > 2048) return false;
  try {
    const body = new URLSearchParams({ secret, response: token });
    if (ip && ip !== "unknown") body.set("remoteip", ip);
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body, signal: AbortSignal.timeout(5000) });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false; // when the check cannot be completed, the form is refused rather than left open
  }
}

export const TURNSTILE_FAILED = "The security check did not pass. Please wait for it to finish, then try again.";
