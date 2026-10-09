// Weekly export for Claude: node scripts/export-leads.mjs > leads.csv
// On the server: docker exec vexa-site node scripts/export-leads.mjs > leads.csv
import Database from "better-sqlite3";
import path from "path";

const dir = process.env.VEXA_DATA_DIR ?? path.join(process.cwd(), "data");
const db = new Database(path.join(dir, "vexa.db"), { readonly: true, fileMustExist: true });
const quote = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;

for (const table of ["leads", "briefs"]) {
  const rows = db.prepare(`SELECT * FROM ${table} ORDER BY id`).all();
  console.log(`# ${table}: ${rows.length} rows`);
  if (rows.length > 0) {
    const columns = Object.keys(rows[0]);
    console.log(columns.join(","));
    for (const row of rows) console.log(columns.map((column) => quote(row[column])).join(","));
  }
}
