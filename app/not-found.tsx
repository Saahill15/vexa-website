import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <section className="auth">
      <div className="wrap">
        <div className="auth-card">
          <span className="auth-eyebrow">Error 404</span>
          <h1 className="auth-title">Page not found</h1>
          <p className="muted">The page you are looking for has moved or does not exist. Try the home page or one of the sections in the menu.</p>
          <Link href="/" className="btn">Back to the home page <span className="arr" aria-hidden="true">→</span></Link>
        </div>
      </div>
    </section>
  );
}
