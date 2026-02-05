import { FastifyInstance } from "fastify";

export default async function userRoutes(fastify: FastifyInstance) {
  fastify.post<{
    Body: {
      name: string;
      age: number;
    };
  }>("/", {
    schema: {
      body: {
        type: "object",
        required: ["name", "age"],
        properties: {
          name: { type: "string" },
          age: { type: "number" },
        },
      },
    },
    handler: async (request, reply) => {
      const body = request.body;
      console.log({ body });
      return reply.code(201).send(body);
    },
  });
}