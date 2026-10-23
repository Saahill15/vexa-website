import Link from "next/link";
import { Icon } from "@/components/Icon";
import { authHref } from "@/lib/session";

/** The wall shown to signed-out readers after the opening of an article: one quiet card, one choice. */
export function Gate({ next }: { next: string }) {
  return (
    <div className="gate" role="region" aria-labelledby="gate-h">
      <span className="gate-ico" aria-hidden="true"><Icon name="shield" size={22} /></span>
      <h2 className="gate-h" id="gate-h">Keep reading with a free account</h2>
      <p>Sign up to finish this article and join the conversation in the comments.</p>
      <Link className="btn" href={authHref("signup", next)}>
        Sign up free <span className="arr" aria-hidden="true">→</span>
      </Link>
      <p className="gate-alt">Already have an account? <Link href={authHref("login", next)}>Log in</Link></p>
    </div>
  );
}
