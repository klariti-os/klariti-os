import { FastifyInstance } from "fastify";

export default async function userRoutes(fastify: FastifyInstance) {
  fastify.post<{
    Body: {
      name: string;
      age: number;
    };
  }>("/", {
    schema: {
      tags: ["Users"],
      body: {
        type: "object",
        required: ["name", "age"],
        properties: {
          name: { type: "string" },
          age: { type: "number" },
        },
      },
      response: {
        201: {
          type: "object",
          properties: {
            name: { type: "string" },
            age: { type: "number" },
          },
        },
      },
    },
    handler: async (request, reply) => {
      return reply.code(201).send(request.body);
    },
  });
}
