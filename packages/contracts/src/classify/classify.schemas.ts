import { z } from "zod";

export const ClassifyBodySchema = z.object({
  url: z.string(),
});

export const ClassifyResponseSchema = z.object({
  category: z.string().nullable(),
});

export type ClassifyBody = z.infer<typeof ClassifyBodySchema>;
export type ClassifyResponse = z.infer<typeof ClassifyResponseSchema>;
