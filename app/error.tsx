"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="auth">
      <div className="wrap">
        <div className="auth-card">
          <span className="auth-eyebrow">Something went wrong</span>
          <h1 className="auth-title">We could not load this page</h1>
          <p className="muted">Please try again. If it keeps happening, email us and we will look into it.</p>
          <button type="button" className="btn" onClick={reset}>Try again</button>
        </div>
      </div>
    </section>
  );
}
