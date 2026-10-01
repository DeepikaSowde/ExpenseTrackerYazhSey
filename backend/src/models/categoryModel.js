const db = require("../config/db");

async function list(type) {
  const { rows } = await db.query(
    "SELECT name FROM categories WHERE type = $1 ORDER BY id ASC",
    [type]
  );
  return rows.map((r) => r.name);
}

// Mirrors the original app's addCategoryData: trims, ignores blank, and is a
// no-op (not an error) if the category already exists.
async function add(type, name) {
  const value = String(name || "").trim();
  if (!value) return { added: false, name: value };
  const { rows } = await db.query(
    "INSERT INTO categories (type, name) VALUES ($1,$2) ON CONFLICT (type, name) DO NOTHING RETURNING id",
    [type, value]
  );
  return { added: rows.length > 0, name: value };
}

module.exports = { list, add };
