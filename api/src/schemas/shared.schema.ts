export const errorObject = {
  type: "object",
  properties: { error: { type: "string" } },
} as const;

export const successObject = {
  type: "object",
  properties: { success: { type: "boolean" } },
} as const;

