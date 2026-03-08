import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { buildApp } from "./helpers/build-app";
import { cleanupTestUsers } from "./helpers/cleanup";
import { signUp, authHeader, testEmail } from "./helpers/auth";

const app = buildApp();
let token: string;
let userId: string;
let otherToken: string;
let otherUserId: string;

beforeAll(async () => {
  await app.ready();
  ({ token, userId } = await signUp(app, testEmail("challenges-a")));
  ({ token: otherToken, userId: otherUserId } = await signUp(app, testEmail("challenges-b")));
});

afterAll(async () => {
  await cleanupTestUsers();
  await app.close();
});

describe("GET /api/me/challenges", () => {
  it("returns 401 without auth", async () => {
    const res = await app.inject({ method: "GET", url: "/api/me/challenges" });
    expect(res.statusCode).toBe(401);
  });

  it("returns empty array for new user", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/me/challenges",
      headers: authHeader(token),
    });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual([]);
  });
});

describe("POST /api/me/challenges", () => {
  it("creates a challenge and auto-enrolls creator as active", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/me/challenges",
      headers: authHeader(token),
      payload: { name: "My Focus Challenge", goal: "FOCUS" },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.name).toBe("My Focus Challenge");
    expect(body.goal).toBe("FOCUS");
    expect(body.creator_id).toBe(userId);
  });

  it("rejects invalid goal", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/me/challenges",
      headers: authHeader(token),
      payload: { name: "Bad", goal: "INVALID" },
    });
    expect(res.statusCode).toBe(400);
  });
});

describe("GET /api/me/challenges/:id", () => {
  it("returns challenge for participant", async () => {
    const created = await app.inject({
      method: "POST",
      url: "/api/me/challenges",
      headers: authHeader(token),
      payload: { name: "Solo", goal: "STUDY" },
    });
    const { id } = created.json();

    const res = await app.inject({
      method: "GET",
      url: `/api/me/challenges/${id}`,
      headers: authHeader(token),
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().id).toBe(id);
  });

  it("returns 404 for non-participant", async () => {
    const created = await app.inject({
      method: "POST",
      url: "/api/me/challenges",
      headers: authHeader(token),
      payload: { name: "Private", goal: "WORK" },
    });
    const { id } = created.json();

    const res = await app.inject({
      method: "GET",
      url: `/api/me/challenges/${id}`,
      headers: authHeader(otherToken),
    });
    expect(res.statusCode).toBe(404);
  });
});

describe("PUT /api/me/challenges/:id", () => {
  it("creator can update name and goal", async () => {
    const created = await app.inject({
      method: "POST",
      url: "/api/me/challenges",
      headers: authHeader(token),
      payload: { name: "Old Name", goal: "FOCUS" },
    });
    const { id } = created.json();

    const res = await app.inject({
      method: "PUT",
      url: `/api/me/challenges/${id}`,
      headers: authHeader(token),
      payload: { name: "New Name", goal: "WORK" },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().name).toBe("New Name");
    expect(res.json().goal).toBe("WORK");
  });

  it("non-creator gets 403", async () => {
    const created = await app.inject({
      method: "POST",
      url: "/api/me/challenges",
      headers: authHeader(token),
      payload: { name: "Owned", goal: "CASUAL" },
    });
    const { id } = created.json();

    const res = await app.inject({
      method: "PUT",
      url: `/api/me/challenges/${id}`,
      headers: authHeader(otherToken),
      payload: { name: "Hijacked" },
    });
    expect(res.statusCode).toBe(403);
  });
});

describe("DELETE /api/me/challenges/:id", () => {
  it("creator can delete their challenge", async () => {
    const created = await app.inject({
      method: "POST",
      url: "/api/me/challenges",
      headers: authHeader(token),
      payload: { name: "To Delete", goal: "FOCUS" },
    });
    const { id } = created.json();

    const res = await app.inject({
      method: "DELETE",
      url: `/api/me/challenges/${id}`,
      headers: authHeader(token),
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().success).toBe(true);
  });

  it("non-creator cannot delete", async () => {
    const created = await app.inject({
      method: "POST",
      url: "/api/me/challenges",
      headers: authHeader(token),
      payload: { name: "Protected", goal: "STUDY" },
    });
    const { id } = created.json();

    const res = await app.inject({
      method: "DELETE",
      url: `/api/me/challenges/${id}`,
      headers: authHeader(otherToken),
    });
    expect(res.statusCode).toBe(403);
  });
});

describe("POST /api/me/challenges/:id/invite", () => {
  it("cannot invite if not friends", async () => {
    const created = await app.inject({
      method: "POST",
      url: "/api/me/challenges",
      headers: authHeader(token),
      payload: { name: "Invite Test", goal: "FOCUS" },
    });
    const { id } = created.json();

    const res = await app.inject({
      method: "POST",
      url: `/api/me/challenges/${id}/invite`,
      headers: authHeader(token),
      payload: { user_id: otherUserId },
    });
    expect(res.statusCode).toBe(403);
  });
});
