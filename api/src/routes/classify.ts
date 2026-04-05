import { FastifyInstance } from "fastify";
import type { ClassifyBody } from "@klariti/contracts";
import { classifyUrl } from "@klariti/url-class";

export default async function classifyRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", fastify.verifySession);

  fastify.post<{ Body: ClassifyBody }>("/api/classify", {
    schema: { tags: ["Classify"], security: [{ bearerAuth: [] }], body: { type: "object" } },
    handler: async (request, reply) => {
      const category = await classifyUrl(request.body.url);
      return reply.send({ category: category ?? null });
    },
  });
}
