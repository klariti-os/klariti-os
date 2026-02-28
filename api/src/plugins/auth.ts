import fp from "fastify-plugin";
import { FastifyInstance } from "fastify";
import { auth } from "@klariti/auth/server";

export default fp(
  async function authPlugin(fastify: FastifyInstance) {
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
  { name: "auth" }
);
