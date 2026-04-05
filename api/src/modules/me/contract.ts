import { initContract } from "@ts-rest/core";
import { ErrorSchema } from "../common/errors.schemas.js";
import {
  UserSchema,
  ChangeEmailBodySchema,
  ChangeEmailResponseSchema,
  ChangePasswordBodySchema,
  ChangePasswordResponseSchema,
} from "../auth/schemas.ts";
import { UpdateProfileBodySchema } from "./schemas.ts";

const c = initContract();

const sec = { metadata: { tags: ["Me"], security: [{ bearerAuth: [] }] } as const };

export const meContract = c.router({
  getProfile: {
    method: "GET",
    path: "/api/me",
    responses: { 200: UserSchema, 401: ErrorSchema },
    summary: "Get current user profile",
    ...sec,
  },
  updateProfile: {
    method: "PATCH",
    path: "/api/me",
    body: UpdateProfileBodySchema,
    responses: { 200: UserSchema, 400: ErrorSchema, 401: ErrorSchema },
    summary: "Update name or image",
    ...sec,
  },
  changeEmail: {
    method: "POST",
    path: "/api/me/change-email",
    body: ChangeEmailBodySchema,
    responses: { 200: ChangeEmailResponseSchema, 400: ErrorSchema, 401: ErrorSchema },
    summary: "Change email address",
    ...sec,
  },
  changePassword: {
    method: "POST",
    path: "/api/me/change-password",
    body: ChangePasswordBodySchema,
    responses: { 200: ChangePasswordResponseSchema, 400: ErrorSchema, 401: ErrorSchema },
    summary: "Change password",
    ...sec,
  },
});
