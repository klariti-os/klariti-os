import fp from "fastify-plugin";
import { FastifyInstance } from "fastify";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { openApiDocument } from "@klariti/contracts";

export default fp(
  async function swaggerPlugin(fastify: FastifyInstance) {
    await fastify.register(swagger, {
      mode: "static",
      specification: { document: openApiDocument as any },
    });

    await fastify.register(swaggerUi, {
      routePrefix: "/docs",
      uiConfig: {
        docExpansion: "list",
        deepLinking: true,
        persistAuthorization: true,
      },
    });
  },
  { name: "swagger" },
);
