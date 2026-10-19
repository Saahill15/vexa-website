// Opens the database once at server start so pending schema migrations (lib/migrations.ts) run before the
// first visitor request rather than in the middle of one. The runtime check lets the edge bundle drop the import.
export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === "nodejs") await import("./lib/startup");
}
