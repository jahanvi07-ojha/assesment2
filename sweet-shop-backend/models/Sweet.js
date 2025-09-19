const mongoose = require("mongoose");

const sweetSchema = new mongoose.Schema({
  name: String,
  category: String,
  price: { type: Number, min: 0 },
  quantity: { type: Number, min: 0 },
  description: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Sweet", sweetSchema);
