import { initContract } from "@ts-rest/core";
import { ErrorSchema } from "../common/errors.schemas.js";
import { ClassifyBodySchema, ClassifyResponseSchema } from "./schemas.js";

const c = initContract();

export const classifyContract = c.router({
  classify: {
    method: "POST",
    path: "/api/classify",
    body: ClassifyBodySchema,
    responses: { 200: ClassifyResponseSchema, 401: ErrorSchema },
    summary: "Classify a URL",
    metadata: { tags: ["Classify"], security: [{ bearerAuth: [] }] } as const,
  },
});
