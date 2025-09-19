const express = require("express");
const Order = require("../models/Order");
const Sweet = require("../models/Sweet");
const { auth, admin } = require("../middleware/auth");

const router = express.Router();

router.post("/:id/purchase", auth, async (req, res) => {
  const sweet = await Sweet.findById(req.params.id);
  if (!sweet || sweet.quantity <= 0) return res.status(400).json({ message: "Out of stock" });

  const qty = req.body.quantity || 1;
  if (sweet.quantity < qty) return res.status(400).json({ message: "Not enough stock" });

  sweet.quantity -= qty;
  await sweet.save();

  const order = await Order.create({
    sweet: sweet._id,
    user: req.user.id,
    quantity: qty,
    totalPrice: sweet.price * qty,
  });

  res.json({ message: "Order placed", order });
});

router.get("/", auth, admin, async (req, res) => {
  const orders = await Order.find().populate("sweet user");
  res.json(orders);
});

router.get("/report", auth, admin, async (req, res) => {
  const orders = await Order.find().populate("sweet");
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalPrice, 0);
  res.json({ totalOrders: orders.length, totalRevenue, orders });
});

module.exports = router;
