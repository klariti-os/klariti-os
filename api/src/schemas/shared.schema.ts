export const errorObject = {
  type: "object",
  properties: { error: { type: "string" } },
} as const;

export const successObject = {
  type: "object",
  properties: { success: { type: "boolean" } },
} as const;

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
