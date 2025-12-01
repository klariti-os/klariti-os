// Challenge Service - API calls for challenge management
import { config } from "@/config/api";

// Types based on OpenAPI schema
export enum ChallengeType {
  TIME_BASED = "time_based",
  TOGGLE = "toggle",
}

export interface DistractingWebsite {
  id?: number;
  url: string;
  name?: string;
  challenge_id?: number;
}

export interface TimeBasedDetails {
  start_date: string;
  end_date: string;
}

export interface ToggleDetails {
  is_active: boolean;
}

export interface Challenge {
  id: number;
  name: string;
  description?: string;
  challenge_type: ChallengeType;
  strict_mode: boolean;
  completed: boolean;
  creator_id: number;
  time_based_details?: TimeBasedDetails;
  toggle_details?: ToggleDetails;
  distracting_websites?: DistractingWebsite[];
  participants?: { id: number; username: string }[];
}

export interface CreateChallengeData {
  name: string;
  description?: string;
  challenge_type: ChallengeType;
  strict_mode?: boolean;
  start_date?: string;
  end_date?: string;
  is_active?: boolean;
  distracting_websites?: { url: string; name?: string }[];
}

export interface UpdateChallengeData {
  name?: string;
  description?: string;
  strict_mode?: boolean;
  start_date?: string;
  end_date?: string;
  is_active?: boolean;
  completed?: boolean;
}

export interface ParticipationStateUpdate {
  paused?: boolean;
  completed?: boolean;
}

// Get auth token from localStorage
const getAuthHeaders = () => {
  if (typeof window === "undefined") {
    return {
      "Content-Type": "application/json",
    };
  }
  const token = localStorage.getItem("access_token");
  if (!token) {
    console.warn("No access token found in localStorage");
  }
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Create a new challenge
export const createChallenge = async (
  data: CreateChallengeData
): Promise<Challenge> => {
  const response = await fetch(`${config.apiUrl}/challenges/`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to create challenge");
  }

  return response.json();
};

// Get all challenges
export const getAllChallenges = async (
  skip = 0,
  limit = 100,
  activeOnly = false
): Promise<Challenge[]> => {
  const params = new URLSearchParams({
    skip: skip.toString(),
    limit: limit.toString(),
    active_only: activeOnly.toString(),
  });

  const response = await fetch(
    `${config.apiUrl}/challenges/?${params.toString()}`,
    {
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch challenges");
  }

  return response.json();
};

// Get a specific challenge
export const getChallenge = async (challengeId: number): Promise<Challenge> => {
  const response = await fetch(`${config.apiUrl}/challenges/${challengeId}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch challenge");
  }

  return response.json();
};

// Get challenges the user is participating in
export const getMyChallenges = async (
  skip = 0,
  limit = 100
): Promise<Challenge[]> => {
  const params = new URLSearchParams({
    skip: skip.toString(),
    limit: limit.toString(),
  });

  const response = await fetch(
    `${config.apiUrl}/challenges/my-challenges?${params.toString()}`,
    {
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("getMyChallenges failed:", response.status, errorText);
    throw new Error(`Failed to fetch your challenges: ${response.status} ${errorText}`);
  }

  return response.json();
};

// Get challenges created by the user
export const getMyCreatedChallenges = async (
  skip = 0,
  limit = 100
): Promise<Challenge[]> => {
  const params = new URLSearchParams({
    skip: skip.toString(),
    limit: limit.toString(),
  });

  const response = await fetch(
    `${config.apiUrl}/challenges/my-created-challenges?${params.toString()}`,
    {
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("getMyCreatedChallenges failed:", response.status, errorText);
    throw new Error(`Failed to fetch your created challenges: ${response.status} ${errorText}`);
  }

  return response.json();
};

// Join a challenge
export const joinChallenge = async (
  challengeId: number
): Promise<Challenge> => {
  const response = await fetch(
    `${config.apiUrl}/challenges/${challengeId}/join`,
    {
      method: "POST",
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to join challenge");
  }

  return response.json();
};

// Update a challenge (creator only)
export const updateChallenge = async (
  challengeId: number,
  data: UpdateChallengeData
): Promise<Challenge> => {
  const response = await fetch(`${config.apiUrl}/challenges/${challengeId}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to update challenge");
  }

  return response.json();
};

// Toggle challenge status (toggle-type challenges only)
export const toggleChallengeStatus = async (
  challengeId: number
): Promise<Challenge> => {
  const response = await fetch(
    `${config.apiUrl}/challenges/${challengeId}/toggle`,
    {
      method: "PATCH",
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to toggle challenge");
  }

  return response.json();
};

// Update participation state
export const updateParticipationState = async (
  challengeId: number,
  data: ParticipationStateUpdate
): Promise<void> => {
  const response = await fetch(
    `${config.apiUrl}/challenges/${challengeId}/participation`,
    {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to update participation");
  }
};
