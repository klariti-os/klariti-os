import fp from "fastify-plugin";
import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { auth, type Session } from "@klariti/auth/server";

declare module "fastify" {
  interface FastifyRequest {
    session: Session | null;
  }
  interface FastifyInstance {
    verifySession: (
      request: FastifyRequest,
      reply: FastifyReply,
    ) => Promise<void>;
  }
}

export default fp(
  async function authPlugin(fastify: FastifyInstance) {
    // Attach session to every request (null if unauthenticated)
    fastify.decorateRequest("session", null);

    // Reusable preHandler – use on any protected route:
    //   { preHandler: [fastify.verifySession] }
    fastify.decorate(
      "verifySession",
      async function (request: FastifyRequest, reply: FastifyReply) {
        const headers = new Headers();
        for (const [key, value] of Object.entries(request.headers)) {
          if (value !== undefined) {
            headers.set(key, Array.isArray(value) ? value.join(", ") : value);
          }
        }

        const session = await auth.api.getSession({ headers });
        if (!session) {
          return reply.status(401).send({ error: "Unauthorized" });
        }
        request.session = session;
      },
    );

    // Forward all better-auth routes (cookie-based auth, etc.)
    fastify.route({
      method: ["GET", "POST"],
      url: "/api/auth/*",
      schema: { hide: true },
      async handler(request, reply) {
        const url = new URL(request.url, `http://${request.headers.host}`);

        const headers = new Headers();
        for (const [key, value] of Object.entries(request.headers)) {
          if (value !== undefined) {
            headers.set(key, Array.isArray(value) ? value.join(", ") : value);
          }
        }

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
