// Applies schema.sql on startup so the database schema is always in sync,
// without a manual migration step. The whole file is idempotent, so running
// it on every boot is safe.
const fs = require("fs");
const path = require("path");
const db = require("./db");

async function initSchema() {
  const schemaPath = path.join(__dirname, "schema.sql");
  const sql = fs.readFileSync(schemaPath, "utf8");
  await db.query(sql);
  console.log("Database schema ensured (schema.sql applied)");
}

module.exports = { initSchema };
