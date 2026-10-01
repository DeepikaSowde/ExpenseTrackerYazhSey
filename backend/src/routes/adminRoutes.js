const express = require("express");
const Admin = require("../models/adminModel");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try { res.json(await Admin.getAll()); } catch (err) { next(err); }
});

router.post("/", async (req, res, next) => {
  try {
    const { name, role } = req.body;
    if (!String(name || "").trim()) return res.status(400).json({ message: "name is required" });
    res.status(201).json(await Admin.create(name, role));
  } catch (err) { next(err); }
});

router.delete("/:id", async (req, res, next) => {
  try {
    await Admin.remove(req.params.id);
    res.status(204).end();
  } catch (err) { next(err); }
});

module.exports = router;
