import type { Metadata } from "next";

const OG_IMAGE = { url: "/og.png", width: 1200, height: 630, alt: "VEXA Digital, esports and brand partnerships consultancy" };

/**
 * Gives a page its own Open Graph and Twitter tags. Without this, Next.js reuses the root
 * layout's openGraph object, so every page would share the home page's title, description and URL.
 */
export function withShare(meta: Metadata & { title: string | { absolute: string }; description: string; alternates: { canonical: string } }): Metadata {
  const raw = typeof meta.title === "string" ? meta.title : meta.title.absolute;
  const title = raw.endsWith("| VEXA") ? raw : `${raw} | VEXA`;
  return {
    ...meta,
    openGraph: {
      type: "website",
      locale: "en_IN",
      siteName: "VEXA Digital",
      url: meta.alternates.canonical,
      title,
      description: meta.description,
      images: [OG_IMAGE],
    },
    twitter: { card: "summary_large_image", title, description: meta.description, images: ["/og.png"] },
  };
}
