import { userObject } from "./shared.schema";

export const signUpBody = {
  type: "object",
  required: ["name", "email", "password"],
  properties: {
    name: { type: "string" },
    email: { type: "string", format: "email" },
    password: { type: "string", minLength: 8 },
  },
} as const;

export const signInBody = {
  type: "object",
  required: ["email", "password"],
  properties: {
    email: { type: "string", format: "email" },
    password: { type: "string" },
  },
} as const;

export const authResponse = {
  type: "object",
  properties: {
    token: { type: "string", nullable: true },
    user: userObject,
  },
} as const;

export const changeEmailBody = {
  type: "object",
  required: ["newEmail"],
  properties: {
    newEmail: { type: "string", format: "email" },
  },
} as const;

export const changePasswordBody = {
  type: "object",
  required: ["currentPassword", "newPassword"],
  properties: {
    currentPassword: { type: "string" },
    newPassword: { type: "string", minLength: 8 },
  },
} as const;
