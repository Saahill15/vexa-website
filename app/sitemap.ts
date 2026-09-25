import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://www.vexadigital.in";
  const paths = [
    "/",
    "/how-we-work",
    "/proof",
    "/about",
    "/valuate",
    "/contact",
    "/legal/privacy",
    "/legal/terms",
    "/legal/grievance-officer",
  ];
  const now = new Date();
  return paths.map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
