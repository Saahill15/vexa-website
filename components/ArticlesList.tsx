"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Icon } from "./Icon";

export type ArticleCard = { slug: string; title: string; excerpt: string; category: string; dateLabel: string; date: string; minutes: number };

/* Soft, layered article cards with category filters and a search box. */
export function ArticlesList({ articles }: { articles: ArticleCard[] }) {
  const categories = useMemo(() => ["All", ...Array.from(new Set(articles.map((a) => a.category)))], [articles]);
  const [active, setActive] = useState("All");
  const [query, setQuery] = useState("");

  const shown = articles.filter((a) => {
    const inCategory = active === "All" || a.category === active;
    const q = query.trim().toLowerCase();
    const matches = !q || `${a.title} ${a.excerpt} ${a.category}`.toLowerCase().includes(q);
    return inCategory && matches;
  });

  return (
    <>
      <div className="filters">
        {categories.map((c) => (
          <button key={c} type="button" aria-pressed={active === c} onClick={() => setActive(c)}>{c}</button>
        ))}
        <label className="search">
          <span className="sr-only">Search articles</span>
          <Icon name="search" size={18} />
          <input type="search" placeholder="Search articles" value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
      </div>
      {shown.length ? (
        <ul className="agrid">
          {shown.map((a) => (
            <li key={a.slug}>
              <Link className="acard" href={`/articles/${a.slug}`}>
                <span className="tag">{a.category}</span>
                <h2>{a.title}</h2>
                <p className="aex">{a.excerpt}</p>
                <p className="ameta"><time dateTime={a.date}>{a.dateLabel}</time> · {a.minutes} min read</p>
                <span className="go">Read article →</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="aempty">No articles match that search.</p>
      )}
    </>
  );
}
