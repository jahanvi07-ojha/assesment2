const express = require("express");
const Sweet = require("../models/Sweet");
const { auth, admin } = require("../middleware/auth");

const router = express.Router();

router.post("/", auth, admin, async (req, res) => {
  const sweet = await Sweet.create(req.body);
  res.json(sweet);
});

router.get("/", auth, async (req, res) => {
  res.json(await Sweet.find());
});

router.get("/search", auth, async (req, res) => {
  const { name, category, minPrice, maxPrice } = req.query;
  let query = {};
  if (name) query.name = new RegExp(name, "i");
  if (category) query.category = category;
  if (minPrice || maxPrice) {
    query.price = { $gte: minPrice || 0, $lte: maxPrice || 999999 };
  }
  res.json(await Sweet.find(query));
});

router.put("/:id", auth, admin, async (req, res) => {
  const sweet = await Sweet.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(sweet);
});

router.delete("/:id", auth, admin, async (req, res) => {
  await Sweet.findByIdAndDelete(req.params.id);
  res.json({ message: "Sweet deleted" });
});

router.get("/low-stock", auth, admin, async (req, res) => {
  const sweets = await Sweet.find({ quantity: { $lt: 5 } });
  res.json(sweets);
});

module.exports = router;
