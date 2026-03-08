import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { buildApp } from "./helpers/build-app";
import { cleanupTestUsers } from "./helpers/cleanup";
import { signUp, authHeader, testEmail } from "./helpers/auth";

const app = buildApp();
let tokenA: string;
let userAId: string;
let tokenB: string;
let userBId: string;

beforeAll(async () => {
  await app.ready();
  ({ token: tokenA, userId: userAId } = await signUp(app, testEmail("friends-a")));
  ({ token: tokenB, userId: userBId } = await signUp(app, testEmail("friends-b")));
});

afterAll(async () => {
  await cleanupTestUsers();
  await app.close();
});

describe("GET /api/me/friends", () => {
  it("returns 401 without auth", async () => {
    const res = await app.inject({ method: "GET", url: "/api/me/friends" });
    expect(res.statusCode).toBe(401);
  });

  it("returns empty list for new user", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/me/friends",
      headers: authHeader(tokenA),
    });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual([]);
  });
});

describe("POST /api/me/friends/request", () => {
  it("cannot friend yourself", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/me/friends/request",
      headers: authHeader(tokenA),
      payload: { addressee_id: userAId },
    });
    expect(res.statusCode).toBe(400);
  });

  it("sends a friend request", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/me/friends/request",
      headers: authHeader(tokenA),
      payload: { addressee_id: userBId },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.status).toBe("pending");
    expect(body.requester_id).toBe(userAId);
  });

  it("rejects duplicate request", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/me/friends/request",
      headers: authHeader(tokenA),
      payload: { addressee_id: userBId },
    });
    expect(res.statusCode).toBe(400);
  });
});

describe("GET /api/me/friends/requests", () => {
  it("addressee sees the pending request", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/me/friends/requests",
      headers: authHeader(tokenB),
    });
    expect(res.statusCode).toBe(200);
    const requests = res.json();
    expect(requests.length).toBeGreaterThan(0);
    expect(requests[0].friendship_id).toBeTypeOf("string");
    expect(requests[0].id).toBe(userAId);
  });

  it("requester does not see it in their requests list", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/me/friends/requests",
      headers: authHeader(tokenA),
    });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual([]);
  });
});

describe("PATCH /api/me/friends/:id (accept)", () => {
  let friendshipId: string;

  beforeAll(async () => {
    // Get the friendship id from B's requests
    const res = await app.inject({
      method: "GET",
      url: "/api/me/friends/requests",
      headers: authHeader(tokenB),
    });
    friendshipId = res.json()[0].friendship_id;
  });

  it("requester cannot accept their own request", async () => {
    const res = await app.inject({
      method: "PATCH",
      url: `/api/me/friends/${friendshipId}`,
      headers: authHeader(tokenA),
      payload: { status: "accepted" },
    });
    expect(res.statusCode).toBe(403);
  });

  it("addressee can accept", async () => {
    const res = await app.inject({
      method: "PATCH",
      url: `/api/me/friends/${friendshipId}`,
      headers: authHeader(tokenB),
      payload: { status: "accepted" },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().status).toBe("accepted");
  });

  it("both users now see each other in friends list", async () => {
    const resA = await app.inject({
      method: "GET",
      url: "/api/me/friends",
      headers: authHeader(tokenA),
    });
    const resB = await app.inject({
      method: "GET",
      url: "/api/me/friends",
      headers: authHeader(tokenB),
    });
    expect(resA.json().length).toBe(1);
    expect(resB.json().length).toBe(1);
  });
});

describe("DELETE /api/me/friends/:id", () => {
  let friendshipId: string;

  beforeAll(async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/me/friends",
      headers: authHeader(tokenA),
    });
    friendshipId = res.json()[0].friendship_id;
  });

  it("either user can remove the friendship", async () => {
    const res = await app.inject({
      method: "DELETE",
      url: `/api/me/friends/${friendshipId}`,
      headers: authHeader(tokenA),
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().success).toBe(true);
  });

  it("friends list is empty after removal", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/me/friends",
      headers: authHeader(tokenA),
    });
    expect(res.json()).toEqual([]);
  });
});
