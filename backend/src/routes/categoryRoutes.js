const express = require("express");
const Category = require("../models/categoryModel");

const router = express.Router();

// GET /api/categories?type=income|expense
router.get("/", async (req, res, next) => {
  try {
    const type = req.query.type;
    if (!["income", "expense"].includes(type)) {
      return res.status(400).json({ message: "?type=income or ?type=expense is required" });
    }
    res.json(await Category.list(type));
  } catch (err) { next(err); }
});

router.post("/", async (req, res, next) => {
  try {
    const { type, name } = req.body;
    if (!["income", "expense"].includes(type)) {
      return res.status(400).json({ message: "type must be income or expense" });
    }
    const result = await Category.add(type, name);
    if (!result.name) return res.status(400).json({ message: "Enter a category name." });
    res.status(201).json(result);
  } catch (err) { next(err); }
});

module.exports = router;
