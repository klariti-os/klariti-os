export const friendshipObject = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    user_a_id: { type: "string" },
    user_b_id: { type: "string" },
    requester_id: { type: "string" },
    status: { type: "string", enum: ["pending", "accepted", "blocked"] },
    created_at: { type: "string", format: "date-time" },
    updated_at: { type: "string", format: "date-time" },
  },
} as const;
