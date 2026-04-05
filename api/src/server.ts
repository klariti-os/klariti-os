import Fastify from "fastify";
import formbody from "@fastify/formbody";
import { config } from "./config.js";

import swaggerPlugin from "./plugins/swagger.js";
import corsPlugin from "./plugins/cors.js";
import authPlugin from "./plugins/auth.js";
import authRoutes from "./routes/auth.js";
import meRoutes from "./routes/me.js";
import challengesRoutes from "./routes/challenges.js";
import friendsRoutes from "./routes/friends.js";
import ktagsRoutes from "./routes/ktags.js";
import classifyRoutes from "./routes/classify.js";

const usePrettyLogger = process.env.NODE_ENV !== "production" && Boolean(process.stdout.isTTY);

const fastify = Fastify({
  routerOptions: {
    maxParamLength: 1024,
  },
  logger: usePrettyLogger
    ? { transport: { target: "pino-pretty" } }
    : true,
});

fastify.register(formbody);
fastify.register(swaggerPlugin);
fastify.register(corsPlugin);
fastify.register(authPlugin);

fastify.register(authRoutes);
fastify.register(meRoutes);
fastify.register(challengesRoutes);
fastify.register(friendsRoutes);
fastify.register(ktagsRoutes);
fastify.register(classifyRoutes);

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
  },
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
