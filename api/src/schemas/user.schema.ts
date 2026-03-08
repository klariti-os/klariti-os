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

export const updateProfileBody = {
  type: "object",
  properties: {
    name: { type: "string", minLength: 1 },
    image: { type: "string", nullable: true },
  },
} as const;
