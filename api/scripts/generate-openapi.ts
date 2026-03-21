import { writeFileSync } from "node:fs";
import Fastify from "fastify";
import formbody from "@fastify/formbody";

import swaggerPlugin from "../src/plugins/swagger.ts";
import corsPlugin from "../src/plugins/cors.ts";
import authPlugin from "../src/plugins/auth.ts";
import authRoutes from "../src/routes/auth.ts";
import meRoutes from "../src/routes/me.ts";
import meKtagsRoutes from "../src/routes/me.ktags.ts";
import meChallengesRoutes from "../src/routes/me.challenges.ts";
import meFriendsRoutes from "../src/routes/me.friends.ts";
import classifyRoutes from "../src/routes/classify.ts";
import adminKtagsRoutes from "../src/routes/admin.ktags.ts";
import publicTagRoutes from "../src/routes/public.tag.ts";

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
app.register(swaggerPlugin);
app.register(corsPlugin);
app.register(authPlugin);

app.register(authRoutes);
app.register(meRoutes, { prefix: "/api/me" });
app.register(meChallengesRoutes, { prefix: "/api/me/challenges" });
app.register(meFriendsRoutes, { prefix: "/api/me/friends" });
app.register(classifyRoutes, { prefix: "/api/classify" });
app.register(adminKtagsRoutes, { prefix: "/api/admin/ktag" });
app.register(meKtagsRoutes, { prefix: "/api/me/ktags" });
app.register(publicTagRoutes, { prefix: "/api/tag" });

await app.ready();
writeFileSync(
  new URL("../../packages/api-client/openapi.json", import.meta.url),
  `${JSON.stringify(app.swagger(), null, 2)}\n`,
);
await app.close();
