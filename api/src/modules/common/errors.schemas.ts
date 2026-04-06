import { z } from "zod";

export const ErrorSchema = z.object({
  error: z.string().optional(),
});

export const SuccessSchema = z.object({
  success: z.boolean(),
});

export const StatusSchema = z.object({
  status: z.boolean(),
});

export type Error = z.infer<typeof ErrorSchema>;
export type Success = z.infer<typeof SuccessSchema>;
