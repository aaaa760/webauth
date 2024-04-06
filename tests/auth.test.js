const request = require("supertest");
const app = require("../index");

describe("POST /api/signup", () => {
  it("should create a new user", async () => {
    const res = await request(app)
      .post("/api/signup")
      .send({
        firstName: "test",
        lastName: "appala",
        email: "abcd@gmail.com",
        phoneNumber: "9390848454",
        password: "deepu123$",
        address: {
          street: "456 Elm St",
          city: "Othertown",
          state: "NY",
          country: "USA",
          postalCode: "54321",
        },
      });
    expect(res.status).toBe(201);
    expect(res.body.message).toBe("User created successfully");
  }, 10000);
});


describe("POST /api/login", () => {
    it("should log in a user", async () => {
      const res = await request(app)
        .post("/api/login")
        .send({
          email: "abcd@gmail.com",
          password: "deepu123$",
        });
      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
      expect(res.body.expiresIn).toBe("1h");
    }, 10000);
  });
  