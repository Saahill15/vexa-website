const prod = process.env.NODE_ENV === "production";

/*
 * Content-Security-Policy. Scripts: this site plus Google's sign-in button (the page's own bootstrap scripts are inline,
 * so 'unsafe-inline' stays until nonces are added). Images may come from any https address because the mail screen can
 * show a message's pictures when an admin asks for them. Nothing may frame the site, and forms only post to itself.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' https://accounts.google.com/gsi/client${prod ? "" : " 'unsafe-eval'"}`,
  "style-src 'self' 'unsafe-inline' https://accounts.google.com/gsi/style",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  `connect-src 'self' https://accounts.google.com${prod ? "" : " ws: wss:"}`,
  "frame-src 'self' about: https://accounts.google.com",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  ...(prod ? ["upgrade-insecure-requests"] : []),
].join("; ");

const baseHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" }, // the Google sign-in window needs to talk back
  { key: "X-DNS-Prefetch-Control", value: "off" },
  ...(prod ? [{ key: "Strict-Transport-Security", value: "max-age=31536000" }] : []),
];

// pages and endpoints that belong to a signed-in person: never stored by a browser or a proxy, never indexed
const private_ = [
  { key: "Cache-Control", value: "private, no-store, max-age=0" },
  { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
];

// lets `next dev` use the Cloudflare bindings (Hyperdrive) from wrangler.jsonc
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // the Cloudflare build only follows pg's default import, which skips the file that opens connections on Workers
  outputFileTracingIncludes: { "/**": ["./node_modules/pg-cloudflare/dist/index.js", "./node_modules/pg-cloudflare/esm/index.mjs"] },
  // the logos are small static files; Cloudflare Images is not set up, so they are served as they are
  images: { unoptimized: true },
  // the mail compose window sends attachments (up to 20 MB) through a server action
  experimental: { serverActions: { bodySizeLimit: "26mb" } },
  // dev only: lets a temporary Cloudflare tunnel link load the dev server's scripts
  allowedDevOrigins: ["*.trycloudflare.com"],
  async headers() {
    return [
      { source: "/:path*", headers: baseHeaders },
      ...["/admin/:path*", "/api/:path*", "/account/:path*", "/login", "/signup", "/forgot-password", "/reset-password", "/verify-email"].map((source) => ({ source, headers: private_ })),
    ];
  },
  async redirects() {
    return [{ source: "/esports-advisory", destination: "/services#esports", permanent: true }];
  },
};

export default nextConfig;
