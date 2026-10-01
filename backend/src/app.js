const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { makeLedgerRouter } = require("./routes/ledgerRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const adminRoutes = require("./routes/adminRoutes");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "*" }));
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.use("/api/income", makeLedgerRouter("income", "INC"));
app.use("/api/expenses", makeLedgerRouter("expenses", "EXP"));
app.use("/api/categories", categoryRoutes);
app.use("/api/admins", adminRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
