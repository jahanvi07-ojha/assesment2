const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Sweet = require("./models/Sweet");
const User = require("./models/User");
const fs = require("fs");
require("dotenv").config();

// Read sweets.json
const sweets = JSON.parse(fs.readFileSync("sweets.json", "utf-8"));

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    // Clear existing data
    await Sweet.deleteMany();
    await User.deleteMany();

    // Insert sweets
    await Sweet.insertMany(sweets);
    console.log("🍬 Sweets data inserted!");

    // Create default admin user
    const hashedPassword = await bcrypt.hash("admin123", 10);
    const admin = new User({
      username: "admin",
      email: "admin@sweetshop.com",
      password: hashedPassword,
      isAdmin: true,
    });

    await admin.save();
    console.log("👑 Admin user created: email=admin@sweetshop.com | password=admin123");

    mongoose.connection.close();
  } catch (err) {
    console.error(err);
    mongoose.connection.close();
  }
}

seed();
