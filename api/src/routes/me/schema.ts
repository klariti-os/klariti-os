/** JSON-Schema fragments shared across /api/me endpoints */

export const userObject = {
  type: "object",
  properties: {
    id: { type: "string" },
    name: { type: "string" },
    email: { type: "string" },
    emailVerified: { type: "boolean" },
    image: { type: "string", nullable: true },
    createdAt: { type: "string" },
    updatedAt: { type: "string" },
  },
} as const;

export const errorObject = {
  type: "object",
  properties: {
    error: { type: "string" },
  },
} as const;

export const updateProfileBody = {
  type: "object",
  properties: {
    name: { type: "string", minLength: 1 },
    image: { type: "string", nullable: true },
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
