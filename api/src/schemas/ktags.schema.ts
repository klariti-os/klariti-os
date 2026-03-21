export const ktagObject = {
  type: "object",
  properties: {
    tag_id: { type: "string" },
    uid_hash: { type: "string", nullable: true },
    payload: { type: "string" },
    signature: { type: "string", nullable: true },
    sig_version: { type: "integer", nullable: true },
    status: { type: "string" },
    owner_id: { type: "string", nullable: true },
    label: { type: "string", nullable: true },
    tag_type: { type: "string", nullable: true },
    created_at: { type: "string", format: "date-time", nullable: true },
    revoked_at: { type: "string", format: "date-time", nullable: true },
  },
} as const;
