import type { Ktag } from "./schemas.js";

function toIsoString(value: Date | string | null | undefined) {
  if (value == null) return value ?? null;
  return value instanceof Date ? value.toISOString() : value;
}

type KtagLike = Omit<Ktag, "created_at" | "revoked_at"> & {
  created_at: Date | string | null;
  revoked_at: Date | string | null;
};

export function serializeKtag(ktag: KtagLike): Ktag {
  return {
    ...ktag,
    created_at: toIsoString(ktag.created_at),
    revoked_at: toIsoString(ktag.revoked_at),
  };
}

export function serializeKtags(ktags: KtagLike[]): Ktag[] {
  return ktags.map(serializeKtag);
}
