import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { buildApp } from "./helpers/build-app.js";
import { cleanupTestUsers } from "./helpers/cleanup.js";
import { testEmail } from "./helpers/auth.js";

const app = buildApp();
beforeAll(() => app.ready());
afterAll(async () => {
  await cleanupTestUsers();
  await app.close();
});

describe("POST /api/sign-up", () => {
  it("creates a user and returns a token", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/sign-up",
      payload: { name: "Alice", email: testEmail("alice"), password: "password123" },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.token).toBeTypeOf("string");
    expect(body.user.email).toContain("@test.klariti.dev");
  });

  it("rejects duplicate email", async () => {
    const email = testEmail("dup");
    await app.inject({
      method: "POST",
      url: "/api/sign-up",
      payload: { name: "Dup", email, password: "password123" },
    });
    const res = await app.inject({
      method: "POST",
      url: "/api/sign-up",
      payload: { name: "Dup2", email, password: "password123" },
    });
    expect(res.statusCode).toBe(400);
  });

  it("rejects short password", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/sign-up",
      payload: { name: "Bob", email: testEmail("bob"), password: "short" },
    });
    expect(res.statusCode).toBe(400);
  });
});

describe("POST /api/sign-in", () => {
  it("returns token for valid credentials", async () => {
    const email = testEmail("signin");
    await app.inject({
      method: "POST",
      url: "/api/sign-up",
      payload: { name: "SignIn", email, password: "password123" },
    });
    const res = await app.inject({
      method: "POST",
      url: "/api/sign-in",
      payload: { email, password: "password123" },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().token).toBeTypeOf("string");
  });

  it("returns 401 for wrong password", async () => {
    const email = testEmail("wrongpw");
    await app.inject({
      method: "POST",
      url: "/api/sign-up",
      payload: { name: "Wrong", email, password: "password123" },
    });
    const res = await app.inject({
      method: "POST",
      url: "/api/sign-in",
      payload: { email, password: "wrongpassword" },
    });
    expect(res.statusCode).toBe(401);
  });
});
