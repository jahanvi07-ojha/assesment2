const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../server");

jest.setTimeout(20000);

describe("Sweet Routes", () => {
  let adminToken = "";

  beforeAll(async () => {
    // Create admin
    await request(app).post("/api/auth/register").send({
      username: "admin",
      email: "admin@test.com",
      password: "123456",
      isAdmin: true,
    });

    // Login admin
    const res = await request(app).post("/api/auth/login").send({
      email: "admin@test.com",
      password: "123456",
    });

    adminToken = res.body.token;
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it("🔴 should NOT allow adding a sweet without token", async () => {
    const res = await request(app).post("/api/sweets").send({
      name: "Ladoo",
      category: "Indian",
      price: 50,
      quantity: 10,
    });

    expect(res.statusCode).toBe(401);
  });

  it("🟢 should allow admin to add a sweet", async () => {
    const res = await request(app)
      .post("/api/sweets")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Jalebi",
        category: "Indian",
        price: 30,
        quantity: 20,
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("name", "Jalebi");
  });

  it("🟢 should fetch sweets list", async () => {
    const res = await request(app)
      .get("/api/sweets")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
