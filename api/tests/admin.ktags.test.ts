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

describe("POST /api/admin/ktags", () => {
  it("issues a signed ktag from the raw NFC uid", async () => {
    const token = await createAdminToken();
    const uid = "04:A1:B2:C3:D4:E5:F6";

    const res = await app.inject({
      method: "POST",
      url: "/api/admin/ktags",
      headers: authHeader(token),
      payload: {
        uid,
        label: "__test__ issued ktag",
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
  });

  it("rejects duplicate uids even when they are formatted differently", async () => {
    const token = await createAdminToken();

    const first = await app.inject({
      method: "POST",
      url: "/api/admin/ktags",
      headers: authHeader(token),
      payload: {
        uid: "0x04A1B2C3D4E5F7",
        label: "__test__ duplicate one",
        tag_type: "test-suite",
      },
    });

    expect(first.statusCode).toBe(201);

    const second = await app.inject({
      method: "POST",
      url: "/api/admin/ktags",
      headers: authHeader(token),
      payload: {
        uid: "04:A1:B2:C3:D4:E5:F7",
        label: "__test__ duplicate two",
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
      url: "/api/admin/ktags",
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

describe("PATCH /api/admin/ktags/:tag_id", () => {
  it("rejects updates to server-managed issuance fields", async () => {
    const token = await createAdminToken();
    const created = await app.inject({
      method: "POST",
      url: "/api/admin/ktags",
      headers: authHeader(token),
      payload: {
        uid: "04A1B2C3D4E5F9",
        label: "__test__ patch target",
        tag_type: "test-suite",
      },
    });

    expect(created.statusCode).toBe(201);

    const res = await app.inject({
      method: "PATCH",
      url: `/api/admin/ktags/${created.json().tag_id}`,
      headers: authHeader(token),
      payload: {
        payload: "https://klariti.so/tag/forged",
      },
    });

    expect(res.statusCode).toBe(400);
  });
});
