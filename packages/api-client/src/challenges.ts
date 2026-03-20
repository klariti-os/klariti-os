import { client } from "./client";

export type Goal = "FOCUS" | "WORK" | "STUDY" | "CASUAL";
export type ParticipantStatus = "active" | "paused" | "completed";

type ErrorResponse = {
  error?: string;
};

type ChallengeErrors = {
  400: ErrorResponse;
  401: ErrorResponse;
  403: ErrorResponse;
};

type ChallengePath = {
  id: string;
};

const bearerAuth = [{ scheme: "bearer", type: "http" }] as const;

export interface Challenge {
  id: string;
  creator_id: string;
  name: string;
  goal: Goal;
  ends_at: string | null;
  pause_threshold: number | null;
  created_at: string;
  updated_at: string;
}

export interface ChallengeWithStatus extends Challenge {
  participant_status: ParticipantStatus;
  joined_at: string | null;
}

export interface ChallengeParticipant {
  challenge_id: string;
  user_id: string;
  status: ParticipantStatus;
  joined_at: string | null;
  created_at: string;
}

export const getApiMeChallenges = () =>
  client.get<{ 200: ChallengeWithStatus[] }, ChallengeErrors>({
    security: bearerAuth,
    url: "/api/me/challenges",
  });

export const postApiMeChallenges = (options: {
  body: {
    name: string;
    goal: Goal;
    ends_at?: string;
    pause_threshold?: number;
  };
}) =>
  client.post<{ 200: Challenge }, ChallengeErrors>({
    security: bearerAuth,
    url: "/api/me/challenges",
    ...options,
    headers: {
      "Content-Type": "application/json",
    },
  });

export const putApiMeChallengesById = (options: {
  path: ChallengePath;
  body: {
    name?: string;
    goal?: Goal;
    ends_at?: string | null;
    pause_threshold?: number | null;
  };
}) =>
  client.put<{ 200: Challenge }, ChallengeErrors>({
    security: bearerAuth,
    url: "/api/me/challenges/{id}",
    ...options,
    headers: {
      "Content-Type": "application/json",
    },
  });

export const deleteApiMeChallengesById = (options: { path: ChallengePath }) =>
  client.delete<{ 200: { success: boolean } }, ChallengeErrors>({
    security: bearerAuth,
    url: "/api/me/challenges/{id}",
    ...options,
  });

export const patchApiMeChallengesByIdStatus = (options: {
  path: ChallengePath;
  body: {
    status: "active" | "paused";
  };
}) =>
  client.patch<{ 200: ChallengeParticipant }, ChallengeErrors>({
    security: bearerAuth,
    url: "/api/me/challenges/{id}/status",
    ...options,
    headers: {
      "Content-Type": "application/json",
    },
  });
