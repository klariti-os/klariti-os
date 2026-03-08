export const updateProfileBody = {
  type: "object",
  properties: {
    name: { type: "string", minLength: 1 },
    image: { type: "string", nullable: true },
  },
} as const;
