import Fastify from "fastify";
import formbody from "@fastify/formbody";
import corsPlugin from "../../src/plugins/cors.js";
import authPlugin from "../../src/plugins/auth.js";
import { initServer } from "@ts-rest/fastify";
import { authRouter } from "../../src/modules/auth/router.js";
import { meRouter } from "../../src/modules/me/router.js";
import { challengesRouter } from "../../src/modules/challenges/router.js";
import { friendsRouter } from "../../src/modules/friends/router.js";
import { adminKtagsRouter, ktagsRouter, publicRouter } from "../../src/modules/ktags/router.js";
import { classifyRouter } from "../../src/modules/classify/router.js";

const s = initServer();

export function buildApp() {
  const app = Fastify({
    logger: false,
    routerOptions: { maxParamLength: 1024 },
    ajv: { customOptions: { removeAdditional: false } },
  });

  app.register(formbody);
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

  return app;
}
