import fp from "fastify-plugin";
import { FastifyInstance } from "fastify";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { config } from "../config";

export default fp(
  async function swaggerPlugin(fastify: FastifyInstance) {
    await fastify.register(swagger, {
      openapi: {
        openapi: "3.0.0",
        info: {
          title: "Klariti API",
          description: "Klariti OS REST API",
          version: "1.0.0",
        },
        servers: [
          { url: config.appUrl, description: "Development" },
        ],
        components: {
          securitySchemes: {
            bearerAuth: {
              type: "http",
              scheme: "bearer",
              description:
                "Sign in via POST /api/sign-in, copy the token from the response, then paste it here.",
            },
          },
        },
      },
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
  { name: "swagger" }
);
