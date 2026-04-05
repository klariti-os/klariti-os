import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { buildApp } from "./helpers/build-app.js";
import { cleanupTestUsers } from "./helpers/cleanup.js";
import { signUp, authHeader, testEmail } from "./helpers/auth.js";

const app = buildApp();
let tokenA: string; // creator / challenge sender
let userAId: string;
let tokenB: string; // friend of A (invite recipient)
let userBId: string;
let tokenC: string; // stranger (no friendship with A)
let userCId: string;

async function becomeFriends(senderToken: string, receiverId: string, receiverToken: string) {
  const reqRes = await app.inject({
    method: "POST",
    url: "/api/me/friends/requests",
    headers: authHeader(senderToken),
    payload: { addressee_id: receiverId },
  });
  const reqId = reqRes.json().id;
  await app.inject({
    method: "PATCH",
    url: `/api/me/friends/requests/${reqId}`,
    headers: authHeader(receiverToken),
    payload: { action: "accept" },
  });
}

async function createChallenge(token: string, name = "Test Challenge") {
  const res = await app.inject({
    method: "POST",
    url: "/api/me/challenges",
    headers: authHeader(token),
    payload: { name, goal: "FOCUS" },
  });
  return res.json() as { id: string };
}

async function inviteFriend(token: string, challengeId: string, userId: string) {
  const res = await app.inject({
    method: "POST",
    url: `/api/me/challenges/${challengeId}/invite`,
    headers: authHeader(token),
    payload: { user_id: userId },
  });
  return res;
}

beforeAll(async () => {
  await app.ready();
  ({ token: tokenA, userId: userAId } = await signUp(app, testEmail("chal-a"), "Owner Alpha"));
  ({ token: tokenB, userId: userBId } = await signUp(app, testEmail("chal-b"), "Friend Beta"));
  ({ token: tokenC, userId: userCId } = await signUp(app, testEmail("chal-c"), "Stranger Gamma"));
  await becomeFriends(tokenA, userBId, tokenB);
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
      headers: authHeader(tokenA),
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
      headers: authHeader(tokenA),
      payload: { name: "My Focus Challenge", goal: "FOCUS" },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.name).toBe("My Focus Challenge");
    expect(body.goal).toBe("FOCUS");
    expect(body.creator_id).toBe(userAId);
  });

  it("rejects invalid goal", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/me/challenges",
      headers: authHeader(tokenA),
      payload: { name: "Bad", goal: "INVALID" },
    });
    expect(res.statusCode).toBe(400);
  });
});

describe("GET /api/me/challenges/:id", () => {
  it("returns challenge for participant", async () => {
    const { id } = await createChallenge(tokenA, "Solo");
    const res = await app.inject({
      method: "GET",
      url: `/api/me/challenges/${id}`,
      headers: authHeader(tokenA),
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().id).toBe(id);
  });

  it("returns 403 for non-participant", async () => {
    const { id } = await createChallenge(tokenA, "Private");
    const res = await app.inject({
      method: "GET",
      url: `/api/me/challenges/${id}`,
      headers: authHeader(tokenB),
    });
    expect(res.statusCode).toBe(403);
  });

  it("returns 403 for invalid UUID", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/me/challenges/not-a-uuid",
      headers: authHeader(tokenA),
    });
    expect(res.statusCode).toBe(403);
  });
});

describe("PUT /api/me/challenges/:id", () => {
  it("creator can update name and goal", async () => {
    const { id } = await createChallenge(tokenA, "Old Name");
    const res = await app.inject({
      method: "PUT",
      url: `/api/me/challenges/${id}`,
      headers: authHeader(tokenA),
      payload: { name: "New Name", goal: "WORK" },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().name).toBe("New Name");
    expect(res.json().goal).toBe("WORK");
  });

  it("non-creator gets 403", async () => {
    const { id } = await createChallenge(tokenA, "Owned");
    const res = await app.inject({
      method: "PUT",
      url: `/api/me/challenges/${id}`,
      headers: authHeader(tokenB),
      payload: { name: "Hijacked" },
    });
    expect(res.statusCode).toBe(403);
  });
});

describe("DELETE /api/me/challenges/:id", () => {
  it("creator can delete their challenge", async () => {
    const { id } = await createChallenge(tokenA, "To Delete");
    const res = await app.inject({
      method: "DELETE",
      url: `/api/me/challenges/${id}`,
      headers: authHeader(tokenA),
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().success).toBe(true);
  });

  it("non-creator cannot delete", async () => {
    const { id } = await createChallenge(tokenA, "Protected");
    const res = await app.inject({
      method: "DELETE",
      url: `/api/me/challenges/${id}`,
      headers: authHeader(tokenB),
    });
    expect(res.statusCode).toBe(403);
  });
});

describe("DELETE /api/me/challenges/:id/leave", () => {
  it("participant can leave a shared challenge", async () => {
    const { id } = await createChallenge(tokenA, "Leave Test");
    const inviteRes = await inviteFriend(tokenA, id, userBId);
    const requestId = inviteRes.json().id;

    const acceptRes = await app.inject({
      method: "PATCH",
      url: `/api/me/challenges/requests/${requestId}`,
      headers: authHeader(tokenB),
      payload: { action: "accept" },
    });
    expect(acceptRes.statusCode).toBe(200);

    const leaveRes = await app.inject({
      method: "DELETE",
      url: `/api/me/challenges/${id}/leave`,
      headers: authHeader(tokenB),
    });
    expect(leaveRes.statusCode).toBe(200);
    expect(leaveRes.json().success).toBe(true);

    const challengesRes = await app.inject({
      method: "GET",
      url: "/api/me/challenges",
      headers: authHeader(tokenB),
    });
    expect(challengesRes.statusCode).toBe(200);
    const challenges = challengesRes.json() as { id: string }[];
    expect(challenges.find((challenge) => challenge.id === id)).toBeUndefined();
  });

  it("creator cannot leave their own challenge", async () => {
    const { id } = await createChallenge(tokenA, "Creator Leave Guard");
    const res = await app.inject({
      method: "DELETE",
      url: `/api/me/challenges/${id}/leave`,
      headers: authHeader(tokenA),
    });
    expect(res.statusCode).toBe(403);
  });
});

describe("POST /api/me/challenges/:id/invite", () => {
  it("non-friend invite returns 403", async () => {
    const { id } = await createChallenge(tokenA, "Invite Test");
    const res = await inviteFriend(tokenA, id, userCId);
    expect(res.statusCode).toBe(403);
  });

  it("non-creator cannot invite", async () => {
    const { id } = await createChallenge(tokenA, "Creator Only");
    const res = await inviteFriend(tokenB, id, userCId);
    expect(res.statusCode).toBe(403);
  });

  it("invalid UUID returns 403 not 500", async () => {
    const res = await inviteFriend(tokenA, "not-a-uuid", userBId);
    expect(res.statusCode).toBe(403);
  });

  it("creates a challenge_request row for a friend", async () => {
    const { id } = await createChallenge(tokenA, "Friend Invite");
    const res = await inviteFriend(tokenA, id, userBId);
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.challenge_id).toBe(id);
    expect(body.from_id).toBe(userAId);
    expect(body.to_id).toBe(userBId);
    expect(body.status).toBe("pending");
  });

  it("duplicate pending invite returns 400", async () => {
    const { id } = await createChallenge(tokenA, "Dup Invite");
    await inviteFriend(tokenA, id, userBId);
    const res = await inviteFriend(tokenA, id, userBId);
    expect(res.statusCode).toBe(400);
  });
});

describe("GET /api/me/challenges/requests/sent", () => {
  it("shows pending invite in sender's sent list", async () => {
    const { id } = await createChallenge(tokenA, "Sent List Test");
    await inviteFriend(tokenA, id, userBId);

    const res = await app.inject({
      method: "GET",
      url: "/api/me/challenges/requests/sent",
      headers: authHeader(tokenA),
    });
    expect(res.statusCode).toBe(200);
    const reqs = res.json() as { challenge_id: string; status: string }[];
    const match = reqs.find((r) => r.challenge_id === id);
    expect(match).toBeDefined();
    expect(match!.status).toBe("pending");
  });

  it("recipient sees nothing in sent", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/me/challenges/requests/sent",
      headers: authHeader(tokenB),
    });
    expect(res.statusCode).toBe(200);
    // B hasn't sent any invites
    const reqs = res.json() as { from_id: string }[];
    expect(reqs.every((r) => r.from_id !== userBId || true)).toBe(true);
  });
});

describe("GET /api/me/challenges/requests/received", () => {
  it("shows pending invite in recipient's received list", async () => {
    const { id } = await createChallenge(tokenA, "Received List Test");
    await inviteFriend(tokenA, id, userBId);

    const res = await app.inject({
      method: "GET",
      url: "/api/me/challenges/requests/received",
      headers: authHeader(tokenB),
    });
    expect(res.statusCode).toBe(200);
    const reqs = res.json() as { challenge_id: string; status: string }[];
    const match = reqs.find((r) => r.challenge_id === id);
    expect(match).toBeDefined();
    expect(match!.status).toBe("pending");
  });
});

describe("PATCH /api/me/challenges/requests/:requestId — accept", () => {
  let challengeId: string;
  let requestId: string;

  beforeAll(async () => {
    ({ id: challengeId } = await createChallenge(tokenA, "Accept Test"));
    const invRes = await inviteFriend(tokenA, challengeId, userBId);
    requestId = invRes.json().id;
  });

  it("sender cannot accept their own invite", async () => {
    const res = await app.inject({
      method: "PATCH",
      url: `/api/me/challenges/requests/${requestId}`,
      headers: authHeader(tokenA),
      payload: { action: "accept" },
    });
    expect(res.statusCode).toBe(403);
  });

  it("recipient accepts → request status becomes accepted", async () => {
    const res = await app.inject({
      method: "PATCH",
      url: `/api/me/challenges/requests/${requestId}`,
      headers: authHeader(tokenB),
      payload: { action: "accept" },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().status).toBe("accepted");
  });

  it("recipient now appears in challenge participants list", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/me/challenges",
      headers: authHeader(tokenB),
    });
    expect(res.statusCode).toBe(200);
    const challenges = res.json() as { id: string; participant_status: string; creator_name: string }[];
    const match = challenges.find((c) => c.id === challengeId);
    expect(match).toBeDefined();
    expect(match!.participant_status).toBe("active");
    expect(match!.creator_name).toBe("Owner Alpha");
  });

  it("already-accepted invite cannot be accepted again", async () => {
    const res = await app.inject({
      method: "PATCH",
      url: `/api/me/challenges/requests/${requestId}`,
      headers: authHeader(tokenB),
      payload: { action: "accept" },
    });
    expect(res.statusCode).toBe(403);
  });
});

describe("PATCH /api/me/challenges/requests/:requestId — decline", () => {
  let challengeId: string;
  let requestId: string;

  beforeAll(async () => {
    ({ id: challengeId } = await createChallenge(tokenA, "Decline Test"));
    const invRes = await inviteFriend(tokenA, challengeId, userBId);
    requestId = invRes.json().id;
  });

  it("recipient declines → request status becomes declined", async () => {
    const res = await app.inject({
      method: "PATCH",
      url: `/api/me/challenges/requests/${requestId}`,
      headers: authHeader(tokenB),
      payload: { action: "decline" },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().status).toBe("declined");
  });

  it("declined recipient is not added as a participant", async () => {
    const res = await app.inject({
      method: "GET",
      url: `/api/me/challenges/${challengeId}`,
      headers: authHeader(tokenB),
    });
    expect(res.statusCode).toBe(403);
  });
});

describe("PATCH /api/me/challenges/requests/:requestId — ignore", () => {
  let challengeId: string;
  let requestId: string;

  beforeAll(async () => {
    ({ id: challengeId } = await createChallenge(tokenA, "Ignore Test"));
    const invRes = await inviteFriend(tokenA, challengeId, userBId);
    requestId = invRes.json().id;
  });

  it("recipient ignores → request status becomes ignored", async () => {
    const res = await app.inject({
      method: "PATCH",
      url: `/api/me/challenges/requests/${requestId}`,
      headers: authHeader(tokenB),
      payload: { action: "ignore" },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().status).toBe("ignored");
  });

  it("ignored recipient is not added as a participant", async () => {
    const res = await app.inject({
      method: "GET",
      url: `/api/me/challenges/${challengeId}`,
      headers: authHeader(tokenB),
    });
    expect(res.statusCode).toBe(403);
  });

  it("ignored invite is hidden from recipient's received list", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/me/challenges/requests/received",
      headers: authHeader(tokenB),
    });
    expect(res.statusCode).toBe(200);
    const reqs = res.json() as { id: string }[];
    expect(reqs.find((r) => r.id === requestId)).toBeUndefined();
  });
});

describe("DELETE /api/me/challenges/requests/:requestId — withdraw", () => {
  let requestId: string;

  beforeAll(async () => {
    const { id } = await createChallenge(tokenA, "Withdraw Test");
    const invRes = await inviteFriend(tokenA, id, userBId);
    requestId = invRes.json().id;
  });

  it("recipient cannot withdraw sender's invite", async () => {
    const res = await app.inject({
      method: "DELETE",
      url: `/api/me/challenges/requests/${requestId}`,
      headers: authHeader(tokenB),
    });
    expect(res.statusCode).toBe(403);
  });

  it("sender withdraws → status becomes withdrawn", async () => {
    const res = await app.inject({
      method: "DELETE",
      url: `/api/me/challenges/requests/${requestId}`,
      headers: authHeader(tokenA),
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().status).toBe("withdrawn");
  });

  it("withdrawn invite is hidden from recipient's received list", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/me/challenges/requests/received",
      headers: authHeader(tokenB),
    });
    expect(res.statusCode).toBe(200);
    const reqs = res.json() as { id: string }[];
    expect(reqs.find((r) => r.id === requestId)).toBeUndefined();
  });
});

describe("PATCH /api/me/challenges/:id/status", () => {
  it("participant can pause their own status", async () => {
    const { id } = await createChallenge(tokenA, "Pause Test");
    const res = await app.inject({
      method: "PATCH",
      url: `/api/me/challenges/${id}/status`,
      headers: authHeader(tokenA),
      payload: { status: "paused" },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().status).toBe("paused");
  });

  it("non-participant gets 403", async () => {
    const { id } = await createChallenge(tokenA, "Status Guard");
    const res = await app.inject({
      method: "PATCH",
      url: `/api/me/challenges/${id}/status`,
      headers: authHeader(tokenC),
      payload: { status: "paused" },
    });
    expect(res.statusCode).toBe(403);
  });
});
