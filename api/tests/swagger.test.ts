import { afterAll, beforeAll, describe, expect, it } from "vitest";
import swaggerPlugin from "../src/plugins/swagger.js";
import { buildApp } from "./helpers/build-app.js";
import { signUp, testEmail } from "./helpers/auth.js";
import { cleanupTestUsers } from "./helpers/cleanup.js";

const app = buildApp();
app.register(swaggerPlugin);

beforeAll(async () => {
  await cleanupTestUsers();
  await app.ready();
});

afterAll(async () => {
  await cleanupTestUsers();
  await app.close();
});

describe("Swagger docs auth flow", () => {
  it("serves the default Swagger UI shell without the custom helper assets", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/docs",
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers["content-type"]).toContain("text/html");
    expect(response.body).toContain("<title>Klariti API Docs</title>");
    expect(response.body).not.toContain("klariti-docs-auth");
  });

  it("documents bearer auth as Swagger's built-in OAuth2 password flow", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/docs/json",
    });

    expect(response.statusCode).toBe(200);

    const body = response.json();
    expect(body.components.securitySchemes.bearerAuth.type).toBe("oauth2");
    expect(body.components.securitySchemes.bearerAuth.flows.password.tokenUrl).toBe(
      "/api/docs/oauth/token",
    );
    expect(body.components.securitySchemes.bearerAuth.flows.password.scopes).toEqual({});
  });

  it("exchanges username and password for a bearer token at the Swagger token endpoint", async () => {
    const email = testEmail("swagger-oauth");
    const password = "password123";

    await signUp(app, email, "Swagger OAuth", password);

    const response = await app.inject({
      method: "POST",
      url: "/api/docs/oauth/token",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
      payload: new URLSearchParams({
        grant_type: "password",
        username: email,
        password,
      }).toString(),
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers["cache-control"]).toBe("no-store");
    expect(response.headers["pragma"]).toBe("no-cache");

    const body = response.json();
    expect(body.access_token).toBeTypeOf("string");
    expect(body.token_type).toBe("Bearer");
  });
});
