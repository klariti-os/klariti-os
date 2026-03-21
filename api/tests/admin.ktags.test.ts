import { createHash } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { db, authUser, eq } from "@klariti/database";
import { buildApp } from "./helpers/build-app";
import { authHeader, signUp, testEmail } from "./helpers/auth";
import { cleanupTestUsers } from "./helpers/cleanup";

const app = buildApp();

beforeAll(() => app.ready());
afterAll(async () => {
  await cleanupTestUsers();
  await app.close();
});

async function createAdminToken() {
  const { token, userId } = await signUp(app, testEmail("admin-ktag"), "Admin KTag");
  await db.update(authUser).set({ role: "admin" }).where(eq(authUser.id, userId));
  return token;
}

describe("POST /api/admin/ktag/register", () => {
  it("issues a signed ktag from the raw NFC uid", async () => {
    const token = await createAdminToken();
    const uid = "04:A1:B2:C3:D4:E5:F6";

    const res = await app.inject({
      method: "POST",
      url: "/api/admin/ktag/register",
      headers: authHeader(token),
      payload: {
        uid,
        tag_type: "test-suite",
      },
    });

    expect(res.statusCode).toBe(201);
    const body = res.json();
    const expectedUidHash = createHash("sha256").update("04A1B2C3D4E5F6", "utf8").digest("hex");

    expect(body.tag_id).toMatch(/^kt_[A-Za-z0-9_-]+$/);
    expect(body.uid_hash).toBe(expectedUidHash);
    expect(body.signature).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(body.sig_version).toBe(1);
    expect(body.payload).toBe(`https://klariti.so/tag/v1.${body.tag_id}.${body.signature}`);
    expect(body.status).toBe("active");
    expect(body.owner_id).toBeNull();
    expect(body.label).toMatch(/^[A-Z][a-z]+ [A-Z][a-z]+$/);
  });

  it("rejects duplicate uids even when they are formatted differently", async () => {
    const token = await createAdminToken();

    const first = await app.inject({
      method: "POST",
      url: "/api/admin/ktag/register",
      headers: authHeader(token),
      payload: {
        uid: "0x04A1B2C3D4E5F7",
        tag_type: "test-suite",
      },
    });

    expect(first.statusCode).toBe(201);

    const second = await app.inject({
      method: "POST",
      url: "/api/admin/ktag/register",
      headers: authHeader(token),
      payload: {
        uid: "04:A1:B2:C3:D4:E5:F7",
        tag_type: "test-suite",
      },
    });

    expect(second.statusCode).toBe(409);
    expect(second.json()).toEqual({ error: "A ktag with this UID already exists." });
  });

  it("rejects server-managed fields in the create body", async () => {
    const token = await createAdminToken();

    const res = await app.inject({
      method: "POST",
      url: "/api/admin/ktag/register",
      headers: authHeader(token),
      payload: {
        uid: "04A1B2C3D4E5F8",
        uid_hash: "should-not-be-accepted",
        tag_type: "test-suite",
      },
    });

    expect(res.statusCode).toBe(400);
  });
});

describe("PATCH /api/admin/ktag/:tag_id", () => {
  it("rejects updates to server-managed issuance fields", async () => {
    const token = await createAdminToken();
    const created = await app.inject({
      method: "POST",
      url: "/api/admin/ktag/register",
      headers: authHeader(token),
      payload: {
        uid: "04A1B2C3D4E5F9",
        tag_type: "test-suite",
      },
    });

    expect(created.statusCode).toBe(201);

    const res = await app.inject({
      method: "PATCH",
      url: `/api/admin/ktag/${created.json().tag_id}`,
      headers: authHeader(token),
      payload: {
        payload: "https://klariti.so/tag/forged",
      },
    });

    expect(res.statusCode).toBe(400);
  });
});

describe("GET /api/tag/:message", () => {
  it("returns the public tag name and owner name for a valid signed message", async () => {
    const token = await createAdminToken();
    const { userId: ownerId } = await signUp(app, testEmail("tag-owner"), "Taylor Owner");

    const created = await app.inject({
      method: "POST",
      url: "/api/admin/ktag/register",
      headers: authHeader(token),
      payload: {
        uid: "04A1B2C3D4E600",
        tag_type: "test-suite",
      },
    });

    expect(created.statusCode).toBe(201);

    const createdBody = created.json();
    const assigned = await app.inject({
      method: "PATCH",
      url: `/api/admin/ktag/${createdBody.tag_id}`,
      headers: authHeader(token),
      payload: {
        owner_id: ownerId,
        label: "Morning Beacon",
      },
    });

    expect(assigned.statusCode).toBe(200);

    const message = createdBody.payload.replace("https://klariti.so/tag/", "");
    const res = await app.inject({
      method: "GET",
      url: `/api/tag/${message}`,
    });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({
      tag_id: createdBody.tag_id,
      tag_name: "Morning Beacon",
      owner_name: "Taylor Owner",
      status: "active",
    });
  });

  it("returns revoked status for a revoked tag", async () => {
    const token = await createAdminToken();

    const created = await app.inject({
      method: "POST",
      url: "/api/admin/ktag/register",
      headers: authHeader(token),
      payload: {
        uid: "04A1B2C3D4E601",
        tag_type: "test-suite",
      },
    });

    expect(created.statusCode).toBe(201);

    const createdBody = created.json();
    const revoked = await app.inject({
      method: "PATCH",
      url: `/api/admin/ktag/${createdBody.tag_id}`,
      headers: authHeader(token),
      payload: {
        status: "revoked",
        label: "Retired Beacon",
      },
    });

    expect(revoked.statusCode).toBe(200);

    const message = createdBody.payload.replace("https://klariti.so/tag/", "");
    const res = await app.inject({
      method: "GET",
      url: `/api/tag/${message}`,
    });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({
      tag_id: createdBody.tag_id,
      tag_name: "Retired Beacon",
      owner_name: null,
      status: "revoked",
    });
  });

  it("returns 404 for an unknown or malformed public message", async () => {
    const malformed = await app.inject({
      method: "GET",
      url: "/api/tag/not-a-real-message",
    });

    expect(malformed.statusCode).toBe(404);

    const unknown = await app.inject({
      method: "GET",
      url: "/api/tag/v1.kt_missing.fake_signature",
    });

    expect(unknown.statusCode).toBe(404);
  });
});
