import { z } from "zod";

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  image: z.string().nullable().optional(),
  emailVerified: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
  role: z.string().nullable().optional(),
});

export const AuthResponseSchema = z.object({
  token: z.string().nullable(),
  user: UserSchema,
});

export const SignUpBodySchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(1),
  image: z.string().optional(),
  callbackURL: z.string().optional(),
  rememberMe: z.boolean().optional(),
});

export const SignInBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  callbackURL: z.string().optional(),
  rememberMe: z.boolean().optional(),
});

export const ChangeEmailBodySchema = z.object({
  newEmail: z.string().email(),
  callbackURL: z.string().optional(),
});

export const ChangeEmailResponseSchema = z.object({
  status: z.boolean(),
  user: UserSchema.optional(),
  message: z.string().nullable().optional(),
});

export const ChangePasswordBodySchema = z.object({
  newPassword: z.string().min(1),
  currentPassword: z.string().min(1),
  revokeOtherSessions: z.boolean().optional(),
});

export const ChangePasswordResponseSchema = z.object({
  token: z.string().nullable(),
  user: UserSchema,
});

export type User = z.infer<typeof UserSchema>;
export type AuthResponse = z.infer<typeof AuthResponseSchema>;
export type SignUpBody = z.infer<typeof SignUpBodySchema>;
export type SignInBody = z.infer<typeof SignInBodySchema>;
export type ChangeEmailBody = z.infer<typeof ChangeEmailBodySchema>;
export type ChangeEmailResponse = z.infer<typeof ChangeEmailResponseSchema>;
export type ChangePasswordBody = z.infer<typeof ChangePasswordBodySchema>;
export type ChangePasswordResponse = z.infer<typeof ChangePasswordResponseSchema>;
