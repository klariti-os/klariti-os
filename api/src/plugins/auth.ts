import fp from "fastify-plugin";
import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { bearer, admin } from "better-auth/plugins";
import {
  db,
  authUser,
  authSession,
  authAccount,
  authVerification,
} from "@klariti/database";

// ── better-auth instance ────────────────────────────────────────────────────
const trustedOrigins = (process.env.CORS_ORIGINS ?? "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: authUser,
      session: authSession,
      account: authAccount,
      verification: authVerification,
    },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  user: {
    changeEmail: {
      enabled: true,
    },
  },
  plugins: [bearer(), admin()],
});

export type Session = typeof auth.$Infer.Session;

function sendOauthTokenError(
  reply: FastifyReply,
  statusCode: number,
  error: string,
  errorDescription: string,
) {
  return reply
    .status(statusCode)
    .header("cache-control", "no-store")
    .header("pragma", "no-cache")
    .send({
      error,
      error_description: errorDescription,
    });
}

// ── Fastify type augmentation ───────────────────────────────────────────────
declare module "fastify" {
  interface FastifyRequest {
    session: Session | null;
    webHeaders(): Headers;
  }
  interface FastifyInstance {
    auth: typeof auth;
    verifySession: (
      request: FastifyRequest,
      reply: FastifyReply,
    ) => Promise<void>;
    verifyAdmin: (
      request: FastifyRequest,
      reply: FastifyReply,
    ) => Promise<void>;
  }
}

export default fp(
  async function authPlugin(fastify: FastifyInstance) {
    // Expose the auth instance so routes can call auth.api.* via fastify.auth
    fastify.decorate("auth", auth);

    fastify.decorateRequest("session", null);

    fastify.decorateRequest(
      "webHeaders", 
      function () {
      const webHeaders = new Headers();
      for (const [key, value] of Object.entries(this.headers)) {
        if (value !== undefined) {
          webHeaders.set(key, Array.isArray(value) ? value.join(", ") : value);
        }
      }
      return webHeaders;
    });

    // Reusable preHandler – use on any protected route:
    //   { preHandler: [fastify.verifySession] }
    fastify.decorate(
      "verifySession",
      async function (request: FastifyRequest, reply: FastifyReply) {
        const headers = request.webHeaders();
        const session = await auth.api.getSession({ headers });
        if (!session) {
          return reply.status(401).send({ error: "Unauthorized" });
        }
        request.session = session;
      },
    );

    fastify.decorate(
      "verifyAdmin",
      async function (request: FastifyRequest, reply: FastifyReply) {
        const headers = request.webHeaders();
        const session = await auth.api.getSession({ headers });
        if (!session) {
          return reply.status(401).send({ error: "Unauthorized" });
        }
        if (session.user.role !== "admin") {
          return reply.status(403).send({ error: "Forbidden" });
        }
        request.session = session;
      },
    );

    fastify.route({
      method: "POST",
      url: "/api/docs/oauth/token",
      schema: { hide: true },
      async handler(request, reply) {
        const body = (request.body ?? {}) as Record<string, unknown>;
        const grantType =
          typeof body.grant_type === "string" ? body.grant_type : undefined;
        const username =
          typeof body.username === "string" ? body.username.trim() : undefined;
        const password =
          typeof body.password === "string" ? body.password : undefined;
        const scope = typeof body.scope === "string" ? body.scope : undefined;

        if (grantType !== "password") {
          return sendOauthTokenError(
            reply,
            400,
            "unsupported_grant_type",
            "Only the OAuth2 password grant is supported for Swagger UI.",
          );
        }

        if (!username || !password) {
          return sendOauthTokenError(
            reply,
            400,
            "invalid_request",
            "username and password are required.",
          );
        }

        try {
          const data = await auth.api.signInEmail({
            body: {
              email: username,
              password,
              rememberMe: true,
            },
          });

          if (!data.token) {
            return sendOauthTokenError(
              reply,
              500,
              "server_error",
              "No bearer token was returned.",
            );
          }

          return reply
            .header("cache-control", "no-store")
            .header("pragma", "no-cache")
            .send({
              access_token: data.token,
              token_type: "Bearer",
              ...(scope ? { scope } : {}),
            });
        } catch {
          return sendOauthTokenError(
            reply,
            400,
            "invalid_grant",
            "Invalid email or password.",
          );
        }
      },
    });

    // Forward all better-auth routes (cookie-based auth, etc.)
    fastify.route({
      method: ["GET", "POST"],
      url: "/api/auth/*",
      schema: { hide: true },
      async handler(request, reply) {
        const url = new URL(request.url, `http://${request.headers.host}`);
        const headers = request.webHeaders();

        const req = new Request(url.toString(), {
          method: request.method,
          headers,
          body: request.body ? JSON.stringify(request.body) : undefined,
        });

        const response = await auth.handler(req);

        reply.status(response.status);
        response.headers.forEach((value, key) => reply.header(key, value));
        reply.send(await response.text());
      },
    });
  },
  { name: "auth" },
);
