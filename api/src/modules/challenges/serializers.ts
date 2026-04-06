import type {
  Challenge,
  ChallengeRequest,
  ChallengeWithStatus,
  Participant,
} from "./schemas.js";

function toIsoString(value: Date | string | null | undefined) {
  if (value == null) return value ?? null;
  return value instanceof Date ? value.toISOString() : value;
}

type ChallengeLike = Omit<Challenge, "ends_at" | "created_at" | "updated_at"> & {
  ends_at: Date | string | null;
  created_at: Date | string | null;
  updated_at: Date | string | null;
};

export function serializeChallenge(challenge: ChallengeLike): Challenge {
  return {
    ...challenge,
    ends_at: toIsoString(challenge.ends_at),
    created_at: toIsoString(challenge.created_at),
    updated_at: toIsoString(challenge.updated_at),
  };
}

type ChallengeWithStatusLike = Omit<
  ChallengeWithStatus,
  "ends_at" | "created_at" | "updated_at" | "joined_at"
> & {
  ends_at: Date | string | null;
  created_at: Date | string | null;
  updated_at: Date | string | null;
  joined_at: Date | string | null;
};

export function serializeChallengeWithStatus(
  challenge: ChallengeWithStatusLike,
): ChallengeWithStatus {
  return {
    ...serializeChallenge(challenge),
    creator_name: challenge.creator_name,
    participant_status: challenge.participant_status,
    joined_at: toIsoString(challenge.joined_at),
  };
}

type ParticipantLike = Omit<Participant, "joined_at" | "created_at"> & {
  joined_at: Date | string | null;
  created_at: Date | string | null;
};

export function serializeParticipant(participant: ParticipantLike): Participant {
  return {
    ...participant,
    joined_at: toIsoString(participant.joined_at),
    created_at: toIsoString(participant.created_at),
  };
}

type ChallengeRequestLike = Omit<ChallengeRequest, "created_at" | "updated_at"> & {
  created_at: Date | string | null;
  updated_at: Date | string | null;
};

export function serializeChallengeRequest(request: ChallengeRequestLike): ChallengeRequest {
  return {
    ...request,
    created_at: toIsoString(request.created_at),
    updated_at: toIsoString(request.updated_at),
  };
}
