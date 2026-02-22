import { Challenge, shouldBlock } from "./challenge-utils";

export interface StorageState {
  access_token: string | null;
  username: string | null;
  challenges: Challenge[];
  connectionStatus: "connected" | "disconnected";
}

export const StateManager = {
  // Constants
  STORAGE_KEYS: {
    ACCESS_TOKEN: "access_token",
    USERNAME: "username",
    CHALLENGES: "challenges",
    CONNECTION_STATUS: "connectionStatus",
  },

  // State Accessors
  async getState(): Promise<StorageState> {
    const data = await browser.storage.local.get([
      this.STORAGE_KEYS.ACCESS_TOKEN,
      this.STORAGE_KEYS.USERNAME,
      this.STORAGE_KEYS.CHALLENGES,
      this.STORAGE_KEYS.CONNECTION_STATUS,
    ]);
    return {
      access_token: (data[this.STORAGE_KEYS.ACCESS_TOKEN] as string) || null,
      username: (data[this.STORAGE_KEYS.USERNAME] as string) || null,
      challenges: (data[this.STORAGE_KEYS.CHALLENGES] as Challenge[]) || [],
      connectionStatus:
        (data[this.STORAGE_KEYS.CONNECTION_STATUS] as
          | "connected"
          | "disconnected") || "disconnected",
    };
  },

  async setChallenges(challenges: Challenge[]) {
    await browser.storage.local.set({
      [this.STORAGE_KEYS.CHALLENGES]: challenges,
    });
  },

  async setConnectionStatus(isConnected: boolean) {
    console.log(
      "Setting connection status to:",
      isConnected ? "connected" : "disconnected"
    );
    await browser.storage.local.set({
      [this.STORAGE_KEYS.CONNECTION_STATUS]: isConnected
        ? "connected"
        : "disconnected",
    });
  },

  async setSession(accessToken: string, username: string) {
    await browser.storage.local.set({
      [this.STORAGE_KEYS.ACCESS_TOKEN]: accessToken,
      [this.STORAGE_KEYS.USERNAME]: username,
    });
  },

  async clearSession() {
    await browser.storage.local.remove([
      this.STORAGE_KEYS.ACCESS_TOKEN,
      this.STORAGE_KEYS.USERNAME,
      this.STORAGE_KEYS.CHALLENGES,
    ]);
  },

  // Challenge Helpers
  getActiveChallenges(challenges: Challenge[]): Challenge[] {
    if (!Array.isArray(challenges)) return [];
    return challenges.filter(shouldBlock);
  },

  // URL Helpers
  normalizeUrl(url: string) {
    if (!url) return "";
    let normalized = url.replace(/^https?:\/\//, ""); // strip protocol
    normalized = normalized.replace(/^www\./, ""); // strip www
    normalized = normalized.replace(/\/$/, ""); // strip trailing slash
    return normalized.toLowerCase();
  },

  getBlockedUrls(challenges: Challenge[]) {
    const blockedUrls = new Set<string>();
    const activeChallenges = challenges.filter(shouldBlock);

    activeChallenges.forEach((challenge: Challenge) => {
      if (Array.isArray(challenge.distractions)) {
        challenge.distractions.forEach((website) => {
          if (website?.url) {
            blockedUrls.add(this.normalizeUrl(website.url));
          }
        });
      }
    });

    return blockedUrls;
  },

  isUrlBlocked(url: string, blockedUrls: Set<string>) {
    if (!url) return false;
    const normalized = this.normalizeUrl(url);

    // Exact match
    if (blockedUrls.has(normalized)) return true;

    // Parent/contains match
    for (const blocked of blockedUrls) {
      if (normalized === blocked) return true;
      if (normalized.startsWith(blocked)) return true;
      if (normalized.includes(blocked)) return true;
    }
    return false;
  },
};
