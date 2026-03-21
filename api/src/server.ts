import Fastify from "fastify";
import formbody from "@fastify/formbody";
import { config } from "./config.js";

import swaggerPlugin from "./plugins/swagger.js";
import corsPlugin from "./plugins/cors.js";
import authPlugin from "./plugins/auth.js";
import authRoutes from "./routes/auth.js";
import meRoutes from "./routes/me.js";
import meKtagsRoutes from "./routes/me.ktags.js";
import meChallengesRoutes from "./routes/me.challenges.js";
import meFriendsRoutes from "./routes/me.friends.js";
import classifyRoutes from "./routes/classify.js";
import adminKtagsRoutes from "./routes/admin.ktags.js";
import publicTagRoutes from "./routes/public.tag.js";

const usePrettyLogger = process.env.NODE_ENV !== "production" && Boolean(process.stdout.isTTY);

const fastify = Fastify({
  routerOptions: {
    maxParamLength: 1024,
  },
  ajv: {
    customOptions: {
      removeAdditional: false,
    },
  },
  logger: usePrettyLogger
    ? {
        transport: {
          target: "pino-pretty",
        },
      }
    : true,
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
fastify.register(adminKtagsRoutes, { prefix: "/api/admin/ktag" });
fastify.register(meKtagsRoutes, { prefix: "/api/me/ktags" });
fastify.register(publicTagRoutes, { prefix: "/api/tag" });

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
