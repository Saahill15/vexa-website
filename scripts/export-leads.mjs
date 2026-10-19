// Weekly export for Claude: node scripts/export-leads.mjs > leads.csv
// On the server: docker exec vexa-site node scripts/export-leads.mjs > leads.csv
// Same privacy rules as the admin export: a WhatsApp number is included only where the person consented to
// WhatsApp contact, and no cell can start a spreadsheet formula.
import Database from "better-sqlite3";
import path from "path";

const dir = process.env.VEXA_DATA_DIR ?? path.join(process.cwd(), "data");
const db = new Database(path.join(dir, "vexa.db"), { readonly: true, fileMustExist: true });
const quote = (value) => {
  let text = String(value ?? "");
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
};
const EXPORTS = {
  leads: `SELECT id, created_at, last_seen, name, email, role, CASE WHEN whatsapp_consent = 1 THEN whatsapp ELSE '' END AS whatsapp, whatsapp_consent, source_slug, utm_source, signed_in_with FROM leads ORDER BY id`,
  briefs: `SELECT id, created_at, name, email, role, interest, company, problem, budget, launch, source, consent FROM briefs ORDER BY id`,
};

for (const [table, query] of Object.entries(EXPORTS)) {
  const rows = db.prepare(query).all();
  console.log(`# ${table}: ${rows.length} rows`);
  if (rows.length > 0) {
    const columns = Object.keys(rows[0]);
    console.log(columns.join(","));
    for (const row of rows) console.log(columns.map((column) => quote(row[column])).join(","));
  }
}
db.close();
