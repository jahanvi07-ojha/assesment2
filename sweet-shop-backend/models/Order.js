const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  sweet: { type: mongoose.Schema.Types.ObjectId, ref: "Sweet" },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  quantity: { type: Number, default: 1 },
  totalPrice: Number,
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Order", orderSchema);
