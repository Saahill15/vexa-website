import Link from "next/link";
import { authHref, safeNext } from "@/lib/session";

type Props = { mode: "login" | "signup"; next?: string };

/** Stand-in for the login and signup screens until accounts are built. */
export function AuthPlaceholder({ mode, next }: Props) {
  const target = safeNext(next);
  const isDev = process.env.NODE_ENV !== "production";
  const other = mode === "login" ? "signup" : "login";

  return (
    <section className="phero" aria-labelledby="auth-h">
      <div className="wrap" style={{ maxWidth: 760 }}>
        <p className="tag">{mode === "login" ? "Log in" : "Sign up"}</p>
        <h1 className="h-xl" id="auth-h" style={{ fontSize: "clamp(2.2rem,6vw,5rem)" }}>
          {mode === "login" ? "Log in." : "Sign up."}
        </h1>
        <p className="lede">Accounts are coming soon. Once they are live, you will be able to read full articles and join the conversation.</p>

        {isDev ? (
          <div className="auth-dev">
            <p className="tag">Development preview</p>
            <p>No accounts exist yet. To review the signed-in experience, continue as a preview reader.</p>
            <div className="row">
              <a className="btn" href={`/api/dev/session?set=1&next=${encodeURIComponent(target)}`}>
                Continue as a preview reader <span className="arr" aria-hidden="true">→</span>
              </a>
              <a className="btn btn--line" href={`/api/dev/session?set=0&next=${encodeURIComponent(target)}`}>Sign out of preview</a>
            </div>
          </div>
        ) : null}

        <div className="row" style={{ marginTop: 32 }}>
          <Link className="tl" href={authHref(other, target)}>{mode === "login" ? "Need an account? Sign up" : "Already have an account? Log in"}</Link>
          <Link className="tl" href={target}>Back to the article</Link>
        </div>
      </div>
    </section>
  );
}
