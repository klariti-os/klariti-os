import Fastify from "fastify";
import formbody from "@fastify/formbody";
import authPlugin from "../../src/plugins/auth";
import authRoutes from "../../src/routes/auth";
import meRoutes from "../../src/routes/me";
import meKtagsRoutes from "../../src/routes/me.ktags";
import meChallengesRoutes from "../../src/routes/me.challenges";
import meFriendsRoutes from "../../src/routes/me.friends";
import adminKtagsRoutes from "../../src/routes/admin.ktags";
import publicTagRoutes from "../../src/routes/public.tag";

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
  app.register(meRoutes, { prefix: "/api/me" });
  app.register(meChallengesRoutes, { prefix: "/api/me/challenges" });
  app.register(meFriendsRoutes, { prefix: "/api/me/friends" });
  app.register(meKtagsRoutes, { prefix: "/api/me/ktags" });
  app.register(adminKtagsRoutes, { prefix: "/api/admin/ktag" });
  app.register(publicTagRoutes, { prefix: "/api/tag" });
  return app;
}
