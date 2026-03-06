/** Map better-auth string status codes to numeric HTTP codes. */
const STATUS_MAP: Record<string, number> = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
};

/** Resolve an HTTP status code from a better-auth error. */
export function resolveStatus(err: any, fallback = 400): number {
  const s = err?.status ?? err?.statusCode;
  if (typeof s === "number") return s;
  if (typeof s === "string") return STATUS_MAP[s] ?? fallback;
  return fallback;
}

/** Extract a human-readable error message from a better-auth error. */
export function resolveMessage(err: any, fallback: string): string {
  return err?.body?.message ?? err?.message ?? fallback;
}
