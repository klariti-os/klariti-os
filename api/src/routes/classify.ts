import { FastifyInstance } from "fastify";
import { classifyUrl } from "@klariti/url-class";

export default async function classifyRoutes(fastify: FastifyInstance) {
  fastify.post<{ Body: { url: string } }>("/", {
    schema: {
      tags: ["Classify"],
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        required: ["url"],
        properties: {
          url: { type: "string" },
        },
      },
      response: {
        200: {
          type: "object",
          properties: {
            category: { type: "string", nullable: true },
          },
        },
        401: { type: "object", properties: { error: { type: "string" } } },
      },
    },
    preHandler: [fastify.verifySession],
    handler: async (request, reply) => {
      const { url } = request.body;
      const category = await classifyUrl(url);
      return reply.send({ category: category ?? null });
    },
  });
}
