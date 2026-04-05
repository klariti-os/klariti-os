import { z } from "zod";

export const KtagTypeSchema = z.enum(["WALL", "MOBILE", "DESK"]);
export const KtagStatusSchema = z.enum(["active", "revoked"]);

export const KtagSchema = z.object({
  tag_id: z.string(),
  uid_hash: z.string().nullable(),
  payload: z.string(),
  signature: z.string().nullable(),
  sig_version: z.number().int().nullable(),
  status: z.string(),
  owner_id: z.string().nullable(),
  label: z.string().nullable(),
  tag_type: KtagTypeSchema.nullable(),
  created_at: z.string().nullable(),
  revoked_at: z.string().nullable(),
});

export const UpdateKtagLabelBodySchema = z.object({
  label: z.string().nullable(),
});

export const RegisterKtagBodySchema = z
  .object({
    uid: z.string().min(1),
    tag_type: KtagTypeSchema,
  })
  .strict();

export const UpdateKtagAdminBodySchema = z
  .object({
    status: KtagStatusSchema.optional(),
    owner_id: z.string().nullable().optional(),
    label: z.string().nullable().optional(),
    tag_type: KtagTypeSchema.optional(),
  })
  .strict();

export const PublicTagSchema = z.object({
  tag_id: z.string(),
  tag_name: z.string(),
  owner_name: z.string().nullable(),
  status: KtagStatusSchema,
});

export type KtagType = z.infer<typeof KtagTypeSchema>;
export type Ktag = z.infer<typeof KtagSchema>;
export type RegisterKtagBody = z.infer<typeof RegisterKtagBodySchema>;
export type UpdateKtagAdminBody = z.infer<typeof UpdateKtagAdminBodySchema>;
export type PublicTag = z.infer<typeof PublicTagSchema>;
