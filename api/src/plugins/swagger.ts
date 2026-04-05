import fp from "fastify-plugin";
import { FastifyInstance } from "fastify";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { generateOpenApi } from "@ts-rest/open-api";
import { contract } from "../api.contracts.ts";

const openApiDocument = generateOpenApi(
  contract,
  {
    info: { title: "Klariti API", description: "Klariti OS REST API", version: "1.0.0" },
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
  {
    setOperationId: "concatenated-path",
    operationMapper: (operation, appRoute) => ({
      ...operation,
      tags: (appRoute.metadata as any)?.tags ?? operation.tags,
      security: (appRoute.metadata as any)?.security ?? operation.security,
    }),
  },
);

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
