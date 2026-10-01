-- YazhSey Books schema. Idempotent (CREATE TABLE IF NOT EXISTS, INSERT ...
-- ON CONFLICT DO NOTHING) so it's safe to run on every server start.

CREATE TABLE IF NOT EXISTS admins (
  id   VARCHAR(20) PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  role VARCHAR(80) NOT NULL DEFAULT 'Administrator'
);

INSERT INTO admins (id, name, role) VALUES
  ('ADMIN-001', 'Kavivarthini', 'Administrator')
ON CONFLICT (id) DO NOTHING;

-- One row per category option offered on the Income/Expense forms. `type`
-- keeps the two lists (income categories, expense categories) in the same
-- table without them ever mixing.
CREATE TABLE IF NOT EXISTS categories (
  id   SERIAL PRIMARY KEY,
  type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
  name VARCHAR(120) NOT NULL,
  UNIQUE (type, name)
);

INSERT INTO categories (type, name) VALUES
  ('income', 'Project Revenue'),
  ('income', 'Service Revenue'),
  ('income', 'Other Income'),
  ('expense', 'Utilities'),
  ('expense', 'Office'),
  ('expense', 'Travel'),
  ('expense', 'Salary'),
  ('expense', 'Marketing'),
  ('expense', 'Other Expense')
ON CONFLICT (type, name) DO NOTHING;

-- Income and Expenses are deliberately two separate tables (not one table
-- with a type column) — their id prefixes (INC-/EXP-) and category lists are
-- independent, exactly as the original app treated them.
CREATE TABLE IF NOT EXISTS income (
  id               VARCHAR(20) PRIMARY KEY,
  description      TEXT NOT NULL,
  category         VARCHAR(120) NOT NULL,
  amount           NUMERIC(14,2) NOT NULL,
  attachment_name  TEXT,
  attachment_type  TEXT,
  attachment_data  BYTEA,          -- raw file bytes, served back as a data URL
  created_by       VARCHAR(160),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS expenses (
  id               VARCHAR(20) PRIMARY KEY,
  description      TEXT NOT NULL,
  category         VARCHAR(120) NOT NULL,
  amount           NUMERIC(14,2) NOT NULL,
  attachment_name  TEXT,
  attachment_type  TEXT,
  attachment_data  BYTEA,
  created_by       VARCHAR(160),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_income_created_at ON income (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_created_at ON expenses (created_at DESC);
