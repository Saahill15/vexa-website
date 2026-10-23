/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // the mail compose window sends attachments (up to 20 MB) through a server action
  experimental: { serverActions: { bodySizeLimit: "26mb" } },
  // dev only: lets a temporary Cloudflare tunnel link load the dev server's scripts
  allowedDevOrigins: ["*.trycloudflare.com"],
  async redirects() {
    return [{ source: "/esports-advisory", destination: "/services#esports", permanent: true }];
  },
};

export default nextConfig;
