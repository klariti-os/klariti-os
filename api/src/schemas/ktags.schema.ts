export const ktagObject = {
  type: "object",
  properties: {
    embedded_id: { type: "string" },
    payload: { type: "string" },
    user_id: { type: "string" },
    label: { type: "string", nullable: true },
    created_at: { type: "string", format: "date-time", nullable: true },
  },
} as const;
