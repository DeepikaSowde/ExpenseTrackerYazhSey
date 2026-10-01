// Shared data-access for the `income` and `expenses` tables — identical shape
// (description, category, amount, one optional attachment), differing only in
// table name and id prefix. One factory instead of two near-duplicate models.
const db = require("../config/db");

// List rows never carry the (potentially large) attachment bytes — only
// whether one exists — so the table/list view stays light. The full file is
// fetched separately when actually viewed.
function toListItem(r) {
  if (!r) return null;
  return {
    id: r.id,
    description: r.description,
    category: r.category,
    amount: Number(r.amount),
    attachment: r.attachment_name ? { name: r.attachment_name, type: r.attachment_type } : null,
    createdBy: r.created_by,
    createdAt: r.created_at,
  };
}

function makeLedgerModel(table, prefix) {
  async function getAll() {
    const { rows } = await db.query(
      `SELECT id, description, category, amount, attachment_name, attachment_type, created_by, created_at
       FROM ${table} ORDER BY created_at DESC`
    );
    return rows.map(toListItem);
  }

  async function getAttachment(id) {
    const { rows } = await db.query(
      `SELECT attachment_name, attachment_type, attachment_data FROM ${table} WHERE id = $1`,
      [id]
    );
    const r = rows[0];
    if (!r || !r.attachment_name) return null;
    return { name: r.attachment_name, type: r.attachment_type, data: r.attachment_data };
  }

  // Next id without using it up — INC-0001 style, 4 digits, never reused
  // (based on the highest number that has ever existed, not the row count).
  async function peekNextId() {
    const { rows } = await db.query(
      `SELECT COALESCE(MAX(NULLIF(regexp_replace(id, '\\D', '', 'g'), '')::int), 0) + 1 AS n FROM ${table}`
    );
    return `${prefix}-${String(rows[0].n).padStart(4, "0")}`;
  }

  async function create({ description, category, amount, attachment, createdBy }) {
    const id = await peekNextId();
    const { rows } = await db.query(
      `INSERT INTO ${table} (id, description, category, amount, attachment_name, attachment_type, attachment_data, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING id, description, category, amount, attachment_name, attachment_type, created_by, created_at`,
      [
        id, description, category, amount,
        attachment?.name ?? null, attachment?.type ?? null, attachment?.data ?? null,
        createdBy ?? null,
      ]
    );
    return toListItem(rows[0]);
  }

  // Matches the original app's own update rule: description/category/amount
  // change, attachment only changes when a new one is actually supplied (so
  // editing the description doesn't silently drop an existing attachment).
  async function update(id, { description, category, amount, attachment }) {
    const sets = ["description = $2", "category = $3", "amount = $4"];
    const vals = [id, description, category, amount];
    if (attachment !== undefined) {
      sets.push("attachment_name = $5", "attachment_type = $6", "attachment_data = $7");
      vals.push(attachment?.name ?? null, attachment?.type ?? null, attachment?.data ?? null);
    }
    const { rows } = await db.query(
      `UPDATE ${table} SET ${sets.join(", ")} WHERE id = $1
       RETURNING id, description, category, amount, attachment_name, attachment_type, created_by, created_at`,
      vals
    );
    return toListItem(rows[0]);
  }

  async function remove(id) {
    const { rowCount } = await db.query(`DELETE FROM ${table} WHERE id = $1`, [id]);
    return rowCount > 0;
  }

  return { getAll, getAttachment, peekNextId, create, update, remove };
}

module.exports = { makeLedgerModel };
