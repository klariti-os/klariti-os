// Challenge Status Enum
export enum ChallengeStatus {
  ACTIVE = "active",
  PAUSED = "paused",
  COMPLETED = "completed",
  SCHEDULED = "scheduled",
  EXPIRED = "expired",
}

export interface Challenge {
  id: string; // Assuming ID exists
  name: string;
  description?: string;
  completed?: boolean;
  challenge_type: "time_based" | "toggle" | string;
  strict_mode?: boolean;
  time_based_details?: {
    start_date: string;
    end_date: string;
  };
  toggle_details?: {
    is_active: boolean;
  };
  distractions?: Array<{ url: string; name?: string }>;
  [key: string]: any;
}

export const getChallengeStatus = (challenge: Challenge): ChallengeStatus => {
  if (challenge.completed) {
    return ChallengeStatus.COMPLETED;
  }

  if (
    challenge.challenge_type === "time_based" &&
    challenge.time_based_details
  ) {
    const now = new Date();
    const startString = challenge.time_based_details.start_date;
    const endString = challenge.time_based_details.end_date;

    const start = new Date(
      startString.endsWith("Z") ? startString : `${startString}Z`
    );
    const end = new Date(endString.endsWith("Z") ? endString : `${endString}Z`);

    if (now > end) {
      return ChallengeStatus.EXPIRED;
    }

    if (now < start) {
      return ChallengeStatus.SCHEDULED;
    }

    return ChallengeStatus.ACTIVE;
  }

  if (challenge.challenge_type === "toggle" && challenge.toggle_details) {
    return challenge.toggle_details.is_active
      ? ChallengeStatus.ACTIVE
      : ChallengeStatus.PAUSED;
  }

  return ChallengeStatus.PAUSED;
};

export const isActive = (challenge: Challenge) =>
  getChallengeStatus(challenge) === ChallengeStatus.ACTIVE;
export const isPaused = (challenge: Challenge) =>
  getChallengeStatus(challenge) === ChallengeStatus.PAUSED;
export const isCompleted = (challenge: Challenge) =>
  getChallengeStatus(challenge) === ChallengeStatus.COMPLETED;
export const isScheduled = (challenge: Challenge) =>
  getChallengeStatus(challenge) === ChallengeStatus.SCHEDULED;
export const isExpired = (challenge: Challenge) =>
  getChallengeStatus(challenge) === ChallengeStatus.EXPIRED;

export const shouldBlock = (challenge: Challenge) => isActive(challenge);

export const isTerminal = (challenge: Challenge) => {
  const status = getChallengeStatus(challenge);
  return (
    status === ChallengeStatus.COMPLETED || status === ChallengeStatus.EXPIRED
  );
};

export const isActionable = (challenge: Challenge) => !isTerminal(challenge);

export const getStatusText = (status: ChallengeStatus) => {
  const statusTextMap: Record<ChallengeStatus, string> = {
    [ChallengeStatus.ACTIVE]: "Active",
    [ChallengeStatus.PAUSED]: "Paused",
    [ChallengeStatus.COMPLETED]: "Completed",
    [ChallengeStatus.SCHEDULED]: "Scheduled",
    [ChallengeStatus.EXPIRED]: "Expired",
  };
  return statusTextMap[status] || "Unknown";
};

export const getStatusClass = (status: ChallengeStatus) => {
  const statusClassMap: Record<ChallengeStatus, string> = {
    [ChallengeStatus.ACTIVE]: "status-active",
    [ChallengeStatus.PAUSED]: "status-paused",
    [ChallengeStatus.COMPLETED]: "status-completed",
    [ChallengeStatus.SCHEDULED]: "status-scheduled",
    [ChallengeStatus.EXPIRED]: "status-expired",
  };
  return statusClassMap[status] || "status-unknown";
};
