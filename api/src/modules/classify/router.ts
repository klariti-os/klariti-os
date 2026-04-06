import { classifyUrl } from "@klariti/url-class";
import { initServer } from "@ts-rest/fastify";

const s = initServer();
import { requireSession } from "../common/guards.js";
import { classifyContract } from "./contract.js";

const sessionRoute = { hooks: { preHandler: requireSession } };

export const classifyRouter = s.router(classifyContract, {
  classify: {
    ...sessionRoute,
    handler: async ({ body }) => {
      const category = await classifyUrl(body.url);

      return {
        status: 200,
        body: { category: category ?? null },
      };
    },
  },
});
