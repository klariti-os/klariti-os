import { type FastifyInstance, type FastifyPluginOptions } from "fastify";
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

const s = initServer();

export default async function app(
  fastify: FastifyInstance,
  opts: FastifyPluginOptions,
) {
  const includeSwagger = opts.includeSwagger !== false;

  await fastify.register(formbody);

  if (includeSwagger) {
    await fastify.register(swaggerPlugin);
  }

  await fastify.register(corsPlugin);
  await fastify.register(authPlugin);

  await fastify.register(s.plugin(authRouter));
  await fastify.register(s.plugin(meRouter));
  await fastify.register(s.plugin(challengesRouter));
  await fastify.register(s.plugin(friendsRouter));
  await fastify.register(s.plugin(ktagsRouter));
  await fastify.register(s.plugin(adminKtagsRouter));
  await fastify.register(s.plugin(classifyRouter));
  await fastify.register(s.plugin(publicRouter));

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
}
