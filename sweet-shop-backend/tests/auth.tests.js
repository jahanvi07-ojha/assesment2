const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../server");

jest.setTimeout(20000);

describe("Auth Routes", () => {
  let testEmail = "testuser@example.com";
  let testPassword = "123456";

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it("🔴 should fail login before registering", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: testEmail, password: testPassword });

    expect(res.statusCode).toBe(400);
  });

  it("🟢 should register a new user", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        username: "tester",
        email: testEmail,
        password: testPassword,
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("message");
  });

  it("🟢 should login the user", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: testEmail, password: testPassword });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
  });
});
