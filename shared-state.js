// shared-state.js - Centralized state management for Klariti extension

const StateManager = {
  // Constants
    STORAGE_KEYS: {
    ACCESS_TOKEN: 'access_token',
    USERNAME: 'username',
    CHALLENGES: 'challenges',
    CONNECTION_STATUS: 'connectionStatus'
  },

  // State Accessors
  async getState() {
    return await chrome.storage.local.get([
      this.STORAGE_KEYS.ACCESS_TOKEN,
      this.STORAGE_KEYS.USERNAME,
      this.STORAGE_KEYS.CHALLENGES,
      this.STORAGE_KEYS.CONNECTION_STATUS
    ]);
  },

  async setChallenges(challenges) {
    await chrome.storage.local.set({ [this.STORAGE_KEYS.CHALLENGES]: challenges });
  },

  async setConnectionStatus(isConnected) {
    await chrome.storage.local.set({ 
      [this.STORAGE_KEYS.CONNECTION_STATUS]: isConnected ? 'connected' : 'disconnected' 
    });
  },

  async setSession(accessToken, username) {
    await chrome.storage.local.set({
      [this.STORAGE_KEYS.ACCESS_TOKEN]: accessToken,
      [this.STORAGE_KEYS.USERNAME]: username
    });
  },

  async clearSession() {
    await chrome.storage.local.remove([
      this.STORAGE_KEYS.ACCESS_TOKEN,
      this.STORAGE_KEYS.USERNAME,
      this.STORAGE_KEYS.CHALLENGES
    ]);
  },

  // Challenge Helpers
  isChallengeActive(challenge) {
    if (challenge.completed) return false;

    if (challenge.challenge_type === 'toggle') {
      return challenge.toggle_details?.is_active === true;
    }

    if (challenge.challenge_type === 'time_based' && challenge.time_based_details) {
      const now = new Date();
      const startString = challenge.time_based_details.start_date;
      const endString = challenge.time_based_details.end_date;
      
      const start = new Date(startString.endsWith("Z") ? startString : `${startString}Z`);
      const end = new Date(endString.endsWith("Z") ? endString : `${endString}Z`);
      
      return now >= start && now <= end;
    }

    return false;
  },

  getActiveChallenges(challenges) {
    if (!Array.isArray(challenges)) return [];
    return challenges.filter(c => this.isChallengeActive(c));
  },

  // URL Helpers
  normalizeUrl(url) {
    if (!url) return '';
    let normalized = url.replace(/^https?:\/\//, ''); // strip protocol
    normalized = normalized.replace(/^www\./, '');      // strip www
    normalized = normalized.replace(/\/$/, '');        // strip trailing slash
    return normalized.toLowerCase();
  },

  getBlockedUrls(challenges) {
    const blockedUrls = new Set();
    const activeChallenges = this.getActiveChallenges(challenges);

    activeChallenges.forEach(challenge => {
      if (Array.isArray(challenge.distracting_websites)) {
        challenge.distracting_websites.forEach(website => {
          if (website?.url) {
            blockedUrls.add(this.normalizeUrl(website.url));
          }
        });
      }
    });

    return blockedUrls;
  },

  isUrlBlocked(url, blockedUrls) {
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
  }
};
