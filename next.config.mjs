/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  // The site only serves its own static brand images. Turning the optimiser off removes the
  // Image Optimization API, the surface of several open Next.js 14 advisories (see LAUNCH_NOTES.md).
  images: { unoptimized: true },
  poweredByHeader: false,
};
export default nextConfig;
