import { z } from "zod";

export const UpdateProfileBodySchema = z.object({
  name: z.string().min(1).optional(),
  image: z.string().nullable().optional(),
});

export type UpdateProfileBody = z.infer<typeof UpdateProfileBodySchema>;
