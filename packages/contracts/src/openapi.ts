import { generateOpenApi } from "@ts-rest/open-api";
import { contract } from "./contract.js";

export const openApiDocument = generateOpenApi(
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
