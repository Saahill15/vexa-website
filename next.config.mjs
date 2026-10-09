/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  distDir: process.env.VEXA_BUILD_DIR || ".next",
  // The site only serves its own static brand images. Turning the optimiser off removes the
  // Image Optimization API, the surface of several open Next.js 14 advisories (see LAUNCH_NOTES.md).
  images: { unoptimized: true },
  poweredByHeader: false,
  // SQLite is a native module; keep it out of the bundle so the standalone build copies it whole.
  serverExternalPackages: ["better-sqlite3"],
  experimental: { serverActions: { bodySizeLimit: "16kb" } },
  async headers() {
    const policy = (google = false) => ["default-src 'self'", "script-src 'self' 'unsafe-inline'" + (process.env.NODE_ENV === "production" ? "" : " 'unsafe-eval'") + (google ? " https://accounts.google.com/gsi/client" : ""), "style-src 'self' 'unsafe-inline'" + (google ? " https://accounts.google.com/gsi/style" : ""), "img-src 'self' data:", "font-src 'self'", "connect-src 'self'" + (google ? " https://accounts.google.com/gsi/" : ""), "frame-src https://www.youtube-nocookie.com" + (google ? " https://accounts.google.com/gsi/" : ""), "frame-ancestors 'none'", "base-uri 'self'", "object-src 'none'", "form-action 'self' https://accounts.google.com"].join("; ");
    return [{source:"/:path*",headers:[{key:"X-Content-Type-Options",value:"nosniff"},{key:"X-Frame-Options",value:"DENY"},{key:"Referrer-Policy",value:"strict-origin-when-cross-origin"},{key:"Permissions-Policy",value:"camera=(), microphone=(), geolocation=()"},{key:"Content-Security-Policy",value:policy()},...(process.env.NODE_ENV==='production'?[{key:"Strict-Transport-Security",value:"max-age=31536000"}]:[])]},...['/account', '/learn/:path*'].map(source=>({source,headers:[{key:"Content-Security-Policy",value:policy(true)},{key:"Cross-Origin-Opener-Policy",value:"same-origin-allow-popups"}]})),{source:"/api/:path*",headers:[{key:"Cache-Control",value:"private, no-store"}]},{source:"/account/:path*",headers:[{key:"Cache-Control",value:"private, no-store"}]},{source:"/account/:tokenPage(verify|reset)",headers:[{key:"Referrer-Policy",value:"no-referrer"}]}];
  },
  async redirects() {
    // The old pages folded into the two doors (SITE_PLAN.md, 01.10.2026).
    return [
      { source: "/how-we-work", destination: "/brands", permanent: true },
      { source: "/proof", destination: "/organisations", permanent: true },
    ];
  },
};
export default nextConfig;
