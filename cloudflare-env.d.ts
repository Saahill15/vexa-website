// The Cloudflare bindings this site uses. `npm run cf-typegen` can regenerate a fuller version.
interface CloudflareEnv {
  ASSETS: Fetcher;
  HYPERDRIVE: Hyperdrive;
}
