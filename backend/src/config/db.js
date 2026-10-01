// Postgres connection pool. Neon (and most hosted Postgres) requires SSL, so
// it's always enabled — the `rejectUnauthorized: false` matches how Neon's
// own pooled connection string is meant to be used from a plain `pg` client.
const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

pool.on("error", (err) => {
  console.error("Unexpected PostgreSQL error", err);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
