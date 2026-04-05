import Fastify from "fastify";
import formbody from "@fastify/formbody";
import authPlugin from "../../src/plugins/auth.js";
import authRoutes from "../../src/routes/auth.js";
import meRoutes from "../../src/routes/me.js";
import challengesRoutes from "../../src/routes/challenges.js";
import friendsRoutes from "../../src/routes/friends.js";
import ktagsRoutes from "../../src/routes/ktags.js";
import classifyRoutes from "../../src/routes/classify.js";

export function buildApp() {
  const app = Fastify({
    routerOptions: {
      maxParamLength: 1024,
    },
    ajv: {
      customOptions: {
        removeAdditional: false,
      },
    },
    logger: false,
  });
  app.register(formbody);
  app.register(authPlugin);
  app.register(authRoutes);
  app.register(meRoutes);
  app.register(challengesRoutes);
  app.register(friendsRoutes);
  app.register(ktagsRoutes);
  app.register(classifyRoutes);
  return app;
}
