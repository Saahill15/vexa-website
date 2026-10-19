import Link from "next/link";
import styles from "./Admin.module.css";

const DATE = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" });
export function when(iso: string | null | undefined): string {
  if (!iso) return "—";
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "—" : `${DATE.format(date)} IST`;
}

export function Badge({ value, label }: { value: string; label?: string }) {
  return <span className={`${styles.badge} ${styles[`b-${value}`] ?? styles["b-neutral"]}`}>{label ?? value.replace(/_/g, " ")}</span>;
}

export function Header({ title, intro, back, children }: { title: string; intro?: string; back?: { href: string; label: string }; children?: React.ReactNode }) {
  return <div className={styles.header}><div>{back ? <Link className={styles.crumb} href={back.href}>← {back.label}</Link> : null}<h1>{title}</h1>{intro ? <p>{intro}</p> : null}</div>{children ? <div className={styles.actions}>{children}</div> : null}</div>;
}

/** A failed query is shown as a failure, never as an empty list. */
export function LoadError({ what }: { what: string }) {
  return <div role="alert" className={styles.errorState}><strong>{what} could not be loaded.</strong> This is a server or database problem, not an empty list. Reload the page; if it continues, check the container logs.</div>;
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <div className={styles.state}>{children}</div>;
}

export function Pager({ page, pages, total, href }: { page: number; pages: number; total: number; href: (page: number) => string }) {
  return <nav className={styles.pager} aria-label="Pagination"><span>{total} {total === 1 ? "record" : "records"} · page {page} of {pages}</span><span className={styles.actions}>{page > 1 ? <Link className={`${styles.button} ${styles.secondary}`} href={href(page - 1)}>Previous</Link> : null}{page < pages ? <Link className={`${styles.button} ${styles.secondary}`} href={href(page + 1)}>Next</Link> : null}</span></nav>;
}

/** Builds a list URL that keeps the current filters. */
export function query(base: string, params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) if (value !== undefined && value !== "" && !(key === "page" && value === 1)) search.set(key, String(value));
  return search.size ? `${base}?${search}` : base;
}

export type SearchParams = Promise<Record<string, string | string[] | undefined>>;
export async function params(searchParams: SearchParams): Promise<Record<string, string>> {
  const raw = await searchParams;
  return Object.fromEntries(Object.entries(raw).map(([key, value]) => [key, (Array.isArray(value) ? value[0] : value ?? "").slice(0, 200)]));
}
