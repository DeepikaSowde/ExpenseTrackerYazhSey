// Mounts the same five routes for both /api/income and /api/expenses — see
// models/ledgerModel.js for why they share one implementation.
const express = require("express");
const multer = require("multer");
const { makeLedgerModel } = require("../models/ledgerModel");

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

function makeLedgerRouter(table, prefix) {
  const Model = makeLedgerModel(table, prefix);
  const router = express.Router();

  router.get("/", async (req, res, next) => {
    try { res.json(await Model.getAll()); } catch (err) { next(err); }
  });

  // Fetches just the one attachment's bytes, as a data URL — kept out of the
  // list response so loading the table doesn't pull every file over the wire.
  router.get("/:id/attachment", async (req, res, next) => {
    try {
      const att = await Model.getAttachment(req.params.id);
      if (!att) return res.status(404).json({ message: "No attachment on this record" });
      res.json({
        name: att.name, type: att.type,
        dataUrl: `data:${att.type || "application/octet-stream"};base64,${att.data.toString("base64")}`,
      });
    } catch (err) { next(err); }
  });

  router.post("/", upload.single("attachment"), async (req, res, next) => {
    try {
      const { description, category, amount, createdBy } = req.body;
      if (!description || !category || !(Number(amount) > 0)) {
        return res.status(400).json({ message: "description, category and a positive amount are required" });
      }
      const attachment = req.file
        ? { name: req.file.originalname, type: req.file.mimetype, data: req.file.buffer }
        : null;
      const created = await Model.create({ description, category, amount: Number(amount), attachment, createdBy });
      res.status(201).json(created);
    } catch (err) { next(err); }
  });

  router.put("/:id", upload.single("attachment"), async (req, res, next) => {
    try {
      const { description, category, amount } = req.body;
      if (!description || !category || !(Number(amount) > 0)) {
        return res.status(400).json({ message: "description, category and a positive amount are required" });
      }
      // No new file sent = keep whatever attachment is already on the record
      // (undefined, not null — the model only touches the attachment columns
      // when this key is present at all).
      const attachment = req.file
        ? { name: req.file.originalname, type: req.file.mimetype, data: req.file.buffer }
        : undefined;
      const updated = await Model.update(req.params.id, { description, category, amount: Number(amount), attachment });
      if (!updated) return res.status(404).json({ message: "Not found" });
      res.json(updated);
    } catch (err) { next(err); }
  });

  router.delete("/:id", async (req, res, next) => {
    try {
      const ok = await Model.remove(req.params.id);
      if (!ok) return res.status(404).json({ message: "Not found" });
      res.status(204).end();
    } catch (err) { next(err); }
  });

  return router;
}

module.exports = { makeLedgerRouter };
