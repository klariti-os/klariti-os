// Raw friendship row (active/removed relationship state)
export const friendshipObject = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    user_a_id: { type: "string" },
    user_b_id: { type: "string" },
    status: { type: "string", enum: ["active", "removed"] },
    created_at: { type: "string", format: "date-time" },
    updated_at: { type: "string", format: "date-time" },
  },
} as const;

// Raw friend request row
export const friendRequestObject = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    from_id: { type: "string" },
    to_id: { type: "string" },
    status: { type: "string", enum: ["pending", "accepted", "declined", "cancelled"] },
    created_at: { type: "string", format: "date-time" },
    updated_at: { type: "string", format: "date-time" },
  },
} as const;

// Friend user — the other person enriched with friendship context
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

// Received request enriched with sender's info — full status visible to recipient
export const friendRequestUserObject = {
  type: "object",
  properties: {
    request_id: { type: "string", format: "uuid" },
    status: { type: "string", enum: ["pending", "accepted", "declined", "cancelled"] },
    id: { type: "string" },
    name: { type: "string" },
    email: { type: "string" },
    image: { type: "string", nullable: true },
    createdAt: { type: "string" },
  },
} as const;

// Sent request enriched with recipient's info — declined/cancelled masked as pending, withdrawn shown
export const sentRequestUserObject = {
  type: "object",
  properties: {
    request_id: { type: "string", format: "uuid" },
    status: { type: "string", enum: ["pending", "withdrawn"] },
    id: { type: "string" },
    name: { type: "string" },
    email: { type: "string" },
    image: { type: "string", nullable: true },
    createdAt: { type: "string" },
  },
} as const;
