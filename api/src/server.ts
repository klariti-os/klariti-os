import Fastify from "fastify";
import formbody from "@fastify/formbody";
import { config } from "./config";

import swaggerPlugin from "./plugins/swagger";
import corsPlugin from "./plugins/cors";
import authPlugin from "./plugins/auth";
import authRoutes from "./routes/auth";
import meRoutes from "./routes/me";
import meKtagsRoutes from "./routes/me.ktags";
import meChallengesRoutes from "./routes/me.challenges";
import meFriendsRoutes from "./routes/me.friends";
import classifyRoutes from "./routes/classify";
import adminKtagsRoutes from "./routes/admin.ktags";

const fastify = Fastify({
  ajv: {
    customOptions: {
      removeAdditional: false,
    },
  },
  logger: {
    transport: {
      target: "pino-pretty",
    },
  },
});

// Plugins (order matters: swagger before routes, cors before auth)
fastify.register(formbody);
fastify.register(swaggerPlugin);
fastify.register(corsPlugin);
fastify.register(authPlugin);

// Routes
fastify.register(authRoutes);
fastify.register(meRoutes, { prefix: "/api/me" });
fastify.register(meChallengesRoutes, { prefix: "/api/me/challenges" });
fastify.register(meFriendsRoutes, { prefix: "/api/me/friends" });
fastify.register(classifyRoutes, { prefix: "/api/classify" });
fastify.register(adminKtagsRoutes, { prefix: "/api/admin/ktags" });
fastify.register(meKtagsRoutes, { prefix: "/api/me/ktags" });

fastify.get(
  "/",    
  {
    schema: {
      tags: ["Health"],
      response: { 200: { type: "object", properties: { message: { type: "string" } } } },
    },
  },
  async (_request, reply) => {
    reply.send({ message: "hello from Klariti" });
  }
);

fastify.get("/favicon.ico", { schema: { hide: true } }, async (_req, reply) => {
  reply.redirect("https://agentic-house.vercel.app/favicons/favicon.ico");
});

async function main() {
  try {
    await fastify.listen({ port: config.port, host: config.host });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

["SIGINT", "SIGTERM"].forEach((signal) => {
  process.on(signal, async () => {
    await fastify.close();
    process.exit(0);
  });
});

main();
