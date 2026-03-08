export const challengeObject = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    creator_id: { type: "string" },
    name: { type: "string" },
    goal: { type: "string", enum: ["FOCUS", "WORK", "STUDY", "CASUAL"] },
    ends_at: { type: "string", format: "date-time", nullable: true },
    pause_threshold: { type: "number", nullable: true },
    created_at: { type: "string", format: "date-time" },
    updated_at: { type: "string", format: "date-time" },
  },
} as const;

export const participantObject = {
  type: "object",
  properties: {
    challenge_id: { type: "string", format: "uuid" },
    user_id: { type: "string" },
    status: { type: "string", enum: ["invited", "active", "paused", "declined", "completed"] },
    joined_at: { type: "string", format: "date-time", nullable: true },
    created_at: { type: "string", format: "date-time" },
  },
} as const;

// Challenge row as returned from the list endpoint (includes participant status)
export const challengeWithStatusObject = {
  type: "object",
  properties: {
    ...challengeObject.properties,
    participant_status: { type: "string", enum: ["invited", "active", "paused", "declined", "completed"] },
    joined_at: { type: "string", format: "date-time", nullable: true },
  },
} as const;
