import fp from "fastify-plugin";
import { FastifyInstance } from "fastify";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";

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
        // Use a relative server URL so Swagger targets the current deployment
        // origin instead of falling back to localhost when APP_URL is unset.
        servers: [{ url: "/", description: "Current server" }],
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
