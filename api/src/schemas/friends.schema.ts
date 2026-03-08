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

// User object enriched with the friendship context (returned from list/request endpoints)
export const friendUserObject = {
  type: "object",
  properties: {
    friendship_id: { type: "string", format: "uuid" },
    id: { type: "string" },
    name: { type: "string" },
    email: { type: "string" },
    image: { type: "string", nullable: true },
    createdAt: { type: "string" },
  },
} as const;
