import type { FriendRequest } from "./schemas.js";

function toIsoString(value: Date | string | null | undefined) {
  if (value == null) return value ?? null;
  return value instanceof Date ? value.toISOString() : value;
}

type FriendRequestLike = Omit<FriendRequest, "created_at" | "updated_at"> & {
  created_at: Date | string | null;
  updated_at: Date | string | null;
};

export function serializeFriendRequest(request: FriendRequestLike): FriendRequest {
  return {
    ...request,
    created_at: toIsoString(request.created_at),
    updated_at: toIsoString(request.updated_at),
  };
}
