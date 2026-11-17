import type { MetadataRoute } from "next";

/** Lets phones add the site to the home screen with the Vexa icon and colours. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Vexa Digital",
    short_name: "Vexa",
    description: "Esports consultancy: brand campaigns in gaming and partnership advisory for esports teams and organisers.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#064B4A",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
