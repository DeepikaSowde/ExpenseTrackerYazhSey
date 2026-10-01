# YazhSey Books

A small income/expense tracker for YazhSey — UI from [oviya5522/yazhsey-books](https://github.com/oviya5522/yazhsey-books), now backed by a real database instead of in-memory state.

- **`frontend/`** — the React + Vite + Tailwind UI (Dashboard, Income, Expenses, Settings), unchanged in design. It now loads and saves everything through the API below instead of keeping it only in memory.
- **`backend/`** — an Express API (`income`, `expenses`, `categories`, `admins`) backed by Postgres.

## Running locally

**Backend**

```bash
cd backend
npm install
cp .env.example .env   # fill in DATABASE_URL (Neon or any Postgres connection string)
npm run dev             # http://localhost:5000
```

The schema is applied automatically on startup (idempotent — safe to restart anytime), including the default admin and category list the original app shipped with.

**Frontend**

```bash
cd frontend
npm install
cp .env.example .env   # VITE_API_URL, defaults to http://localhost:5000/api
npm run dev             # http://localhost:5173
```

## What changed from the original UI

The original app (`yazhsey-books`) held income, expenses, categories and admins purely in React state — a refresh wiped everything, and attachments were plain in-memory `File` objects. This version is wired to the API above:

- Income/expense records, categories and admins are fetched on load and persist in Postgres.
- An attachment uploads with the record (multipart form) and is stored in the database; "View attachment" fetches it back on demand.
- Adding a category, an admin, or deleting the last remaining admin now goes through the server, which is also where those rules (e.g. "at least one admin is required") are enforced.

Everything else — layout, styling, navigation, the Dashboard's filters and charts — is the original UI as-is.
