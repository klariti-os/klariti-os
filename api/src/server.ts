import Fastify from "fastify";
import formbody from "@fastify/formbody";
import { config } from "./config";

import swaggerPlugin from "./plugins/swagger";
import corsPlugin from "./plugins/cors";
import authPlugin from "./plugins/auth";
import meRoutes from "./routes/me";
import authRoutes from "./routes/auth";

const fastify = Fastify({
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
