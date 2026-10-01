const db = require("../config/db");

async function getAll() {
  const { rows } = await db.query("SELECT id, name, role FROM admins ORDER BY id ASC");
  return rows;
}

async function peekNextId() {
  const { rows } = await db.query(
    "SELECT COALESCE(MAX(NULLIF(regexp_replace(id, '\\D', '', 'g'), '')::int), 0) + 1 AS n FROM admins"
  );
  return `ADMIN-${String(rows[0].n).padStart(3, "0")}`;
}

async function create(name, role) {
  const id = await peekNextId();
  const { rows } = await db.query(
    "INSERT INTO admins (id, name, role) VALUES ($1,$2,$3) RETURNING id, name, role",
    [id, String(name || "").trim(), String(role || "Administrator").trim()]
  );
  return rows[0];
}

// Mirrors the original app's removeAdmin: refuses to drop the last admin.
async function remove(id) {
  const { rows: all } = await db.query("SELECT id FROM admins");
  if (all.length <= 1) {
    const err = new Error("At least one admin is required");
    err.status = 400;
    throw err;
  }
  const { rowCount } = await db.query("DELETE FROM admins WHERE id = $1", [id]);
  if (rowCount === 0) {
    const err = new Error("Admin not found");
    err.status = 404;
    throw err;
  }
  return true;
}

module.exports = { getAll, create, remove };
