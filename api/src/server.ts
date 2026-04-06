import Fastify from "fastify";
import formbody from "@fastify/formbody";
import swaggerPlugin from "./plugins/swagger.js";
import corsPlugin from "./plugins/cors.js";
import authPlugin from "./plugins/auth.js";
import { initServer } from "@ts-rest/fastify";
import { authRouter } from "./modules/auth/router.js";
import { meRouter } from "./modules/me/router.js";
import { challengesRouter } from "./modules/challenges/router.js";
import { friendsRouter } from "./modules/friends/router.js";
import { adminKtagsRouter, ktagsRouter, publicRouter } from "./modules/ktags/router.js";
import { classifyRouter } from "./modules/classify/router.js";
import { config } from "./config.js";

const s = initServer();

const server = Fastify({
  routerOptions: {
    maxParamLength: 1024,
  },
  ajv: {
    customOptions: {
      removeAdditional: false,
    },
  },
  logger: process.stdout.isTTY
    ? { transport: { target: "pino-pretty" } }
    : true,
});

server.register(formbody);
server.register(swaggerPlugin);
server.register(corsPlugin);
server.register(authPlugin);
server.register(s.plugin(authRouter));
server.register(s.plugin(meRouter));
server.register(s.plugin(challengesRouter));
server.register(s.plugin(friendsRouter));
server.register(s.plugin(ktagsRouter));
server.register(s.plugin(adminKtagsRouter));
server.register(s.plugin(classifyRouter));
server.register(s.plugin(publicRouter));

server.get(
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

server.get("/favicon.ico", { schema: { hide: true } }, async (_req, reply) => {
  reply.redirect("https://agentic-house.vercel.app/favicons/favicon.ico");
});

async function init() {
  try {
    await server.listen({ port: config.port, host: config.host });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

["SIGINT", "SIGTERM"].forEach((signal) => {
  process.on(signal, async () => {
    await server.close();
    process.exit(0);
  });
});

init();
