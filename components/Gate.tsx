import Link from "next/link";
import { authHref } from "@/lib/session";

/** The wall shown to signed-out readers after the opening of an article. */
export function Gate({ next }: { next: string }) {
  return (
    <div className="gate" role="region" aria-labelledby="gate-h">
      <p className="tag">Keep reading</p>
      <h2 className="h-lg" id="gate-h">Log in to read the full article.</h2>
      <p>Create a free account or log in to finish this article and join the conversation in the comments.</p>
      <div className="row">
        <Link className="btn" href={authHref("signup", next)}>
          Sign up <span className="arr" aria-hidden="true">→</span>
        </Link>
        <Link className="btn btn--line" href={authHref("login", next)}>Log in</Link>
      </div>
    </div>
  );
}
