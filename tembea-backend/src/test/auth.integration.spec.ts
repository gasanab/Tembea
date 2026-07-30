/// <reference types="jest" />

import { INestApplication } from "@nestjs/common";
import request = require("supertest");
import { createTestApp, cleanupApp, generateTestEmail, generateTestName } from "./setup";

describe("Auth Integration Tests", () => {
  let app: INestApplication;
  const unwrap = (response: request.Response) => response.body.data;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await cleanupApp(app);
  });

  describe("POST /api/auth/register", () => {
    it("should register a new client user", async () => {
      const response = await request(app.getHttpServer())
        .post("/api/auth/register")
        .set("Content-Type", "application/json")
        .send({
          name: generateTestName(),
          email: generateTestEmail(),
          password: "TestPass123",
          role: "CLIENT",
        });

      expect(response.status).toBe(201);
      const data = unwrap(response);
      expect(data).toHaveProperty("user");
      expect(data.user).toHaveProperty("id");
      expect(data.user.email).toContain("@example.com");
      expect(data.user.role).toBe("CLIENT");
      expect(data).toHaveProperty("token");
    });

    it("should register a new partner user with Partner row", async () => {
      const response = await request(app.getHttpServer())
        .post("/api/auth/register")
        .set("Content-Type", "application/json")
        .send({
          name: generateTestName(),
          email: generateTestEmail(),
          password: "TestPass123",
          role: "PARTNER",
        });

      expect(response.status).toBe(201);
      const data = unwrap(response);
      expect(data.user).toHaveProperty("id");
      expect(data.user.role).toBe("PARTNER");
      expect(data.user.partner).toBeDefined();
      expect(data.user.partner).toHaveProperty("id");
      expect(data.user.partner.businessName).toBeDefined();
      expect(data.user.partner.status).toBe("PENDING");
      expect(data).toHaveProperty("token");
    });

    it("should reject duplicate email", async () => {
      const email = generateTestEmail();
      
      // First registration
      await request(app.getHttpServer())
        .post("/api/auth/register")
        .set("Content-Type", "application/json")
        .send({
          name: generateTestName(),
          email,
          password: "TestPass123",
          role: "CLIENT",
        });

      // Second registration with same email
      const response = await request(app.getHttpServer())
        .post("/api/auth/register")
        .set("Content-Type", "application/json")
        .send({
          name: generateTestName(),
          email,
          password: "TestPass123",
          role: "CLIENT",
        });

      expect(response.status).toBe(409);
      expect(response.body.message).toContain("already registered");
    });

    it("should reject public ADMIN registration", async () => {
      const response = await request(app.getHttpServer())
        .post("/api/auth/register")
        .set("Content-Type", "application/json")
        .send({
          name: generateTestName(),
          email: generateTestEmail(),
          password: "TestPass123",
          role: "ADMIN",
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toEqual(
        expect.arrayContaining([expect.stringContaining("role")]),
      );
    });
  });

  describe("POST /api/auth/login", () => {
    it("should login with valid credentials", async () => {
      const email = generateTestEmail();
      const password = "TestPass123";

      // Register first
      await request(app.getHttpServer())
        .post("/api/auth/register")
        .set("Content-Type", "application/json")
        .send({
          name: generateTestName(),
          email,
          password,
          role: "CLIENT",
        });

      // Login
      const response = await request(app.getHttpServer())
        .post("/api/auth/login")
        .set("Content-Type", "application/json")
        .send({ email, password });

      expect(response.status).toBe(200);
      const data = unwrap(response);
      expect(data).toHaveProperty("user");
      expect(data.user.email).toBe(email);
      expect(data).toHaveProperty("token");
      expect(data).toHaveProperty("partner");
    });

    it("should login when email casing differs from registration", async () => {
      const email = generateTestEmail();
      const password = "TestPass123";

      await request(app.getHttpServer())
        .post("/api/auth/register")
        .set("Content-Type", "application/json")
        .send({
          name: generateTestName(),
          email: email.toUpperCase(),
          password,
          role: "CLIENT",
        });

      const response = await request(app.getHttpServer())
        .post("/api/auth/login")
        .set("Content-Type", "application/json")
        .send({ email, password });

      expect(response.status).toBe(200);
      const data = unwrap(response);
      expect(data.user.email).toBe(email);
      expect(data).toHaveProperty("token");
    });

    it("should reject invalid credentials", async () => {
      const response = await request(app.getHttpServer())
        .post("/api/auth/login")
        .set("Content-Type", "application/json")
        .send({
          email: "nonexistent@example.com",
          password: "WrongPass123",
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toContain("Invalid credentials");
    });
  });

  describe("GET /api/auth/me", () => {
    it("should return current user with partner data", async () => {
      const email = generateTestEmail();
      const password = "TestPass123";

      // Register as partner
      const registerResponse = await request(app.getHttpServer())
        .post("/api/auth/register")
        .set("Content-Type", "application/json")
        .send({
          name: generateTestName(),
          email,
          password,
          role: "PARTNER",
        });

      const token = unwrap(registerResponse).token;

      // Get current user
      const response = await request(app.getHttpServer())
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      const data = unwrap(response);
      expect(data).toHaveProperty("id");
      expect(data).toHaveProperty("email", email);
      expect(data).toHaveProperty("partner");
      expect(data.partner).toHaveProperty("id");
      expect(data.partner).toHaveProperty("businessName");
    });
  });
});
