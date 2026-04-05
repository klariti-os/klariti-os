import Fastify, { type FastifyLoggerOptions, type FastifyServerOptions } from "fastify";
import formbody from "@fastify/formbody";
import swaggerPlugin from "./plugins/swagger.js";
import corsPlugin from "./plugins/cors.js";
import authPlugin from "./plugins/auth.js";
import { initServer } from "@ts-rest/fastify";

const s = initServer();
import { authRouter } from "./modules/auth/router.js";
import { meRouter } from "./modules/me/router.js";
import { challengesRouter } from "./modules/challenges/router.js";
import { friendsRouter } from "./modules/friends/router.js";
import { adminKtagsRouter, ktagsRouter, publicRouter } from "./modules/ktags/router.js";
import { classifyRouter } from "./modules/classify/router.js";

type BuildAppOptions = {
  includeSwagger?: boolean;
  logger?: FastifyServerOptions["logger"] | FastifyLoggerOptions;
};

export function buildApp({
  includeSwagger = true,
  logger = true,
}: BuildAppOptions = {}) {
  const app = Fastify({
    routerOptions: {
      maxParamLength: 1024,
    },
    ajv: {
      customOptions: {
        removeAdditional: false,
      },
    },
    logger,
  });

  app.register(formbody);

  if (includeSwagger) {
    app.register(swaggerPlugin);
  }

  app.register(corsPlugin);
  app.register(authPlugin);

  app.register(s.plugin(authRouter));
  app.register(s.plugin(meRouter));
  app.register(s.plugin(challengesRouter));
  app.register(s.plugin(friendsRouter));
  app.register(s.plugin(ktagsRouter));
  app.register(s.plugin(adminKtagsRouter));
  app.register(s.plugin(classifyRouter));
  app.register(s.plugin(publicRouter));

  app.get(
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

  app.get("/favicon.ico", { schema: { hide: true } }, async (_req, reply) => {
    reply.redirect("https://agentic-house.vercel.app/favicons/favicon.ico");
  });

  return app;
}
