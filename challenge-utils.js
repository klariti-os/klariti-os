// shared-state.js - Centralized state management for Klariti extension

/**
 * Challenge Status Enum
 * Represents all possible states a challenge can be in
 */
const ChallengeStatus = {
  ACTIVE: 'active',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  SCHEDULED: 'scheduled',
  EXPIRED: 'expired'
};

/**
 * Get challenge status based on challenge properties
 * This is the single source of truth for status calculation
 * @param {Object} challenge - The challenge object
 * @returns {string} One of ChallengeStatus values
 */
function getChallengeStatus(challenge) {
  // Priority order: completed > expired > scheduled > active/paused
  
  if (challenge.completed) {
    return ChallengeStatus.COMPLETED;
  }

  // Time-based challenges have date-dependent status
  if (challenge.challenge_type === 'time_based' && challenge.time_based_details) {
    const now = new Date();
    const startString = challenge.time_based_details.start_date;
    const endString = challenge.time_based_details.end_date;
    
    const start = new Date(startString.endsWith("Z") ? startString : `${startString}Z`);
    const end = new Date(endString.endsWith("Z") ? endString : `${endString}Z`);

    if (now > end) {
      return ChallengeStatus.EXPIRED;
    }
    
    if (now < start) {
      return ChallengeStatus.SCHEDULED;
    }
    
    // Within time range = active
    return ChallengeStatus.ACTIVE;
  }

  // Toggle-based challenges use is_active flag
  if (challenge.challenge_type === 'toggle' && challenge.toggle_details) {
    return challenge.toggle_details.is_active ? ChallengeStatus.ACTIVE : ChallengeStatus.PAUSED;
  }

  // Fallback for unknown types or missing details
  return ChallengeStatus.PAUSED;
}

/**
 * Helper methods for semantic status checking
 * These provide clean, readable code like: if (isActive(challenge)) { ... }
 */

function isActive(challenge) {
  return getChallengeStatus(challenge) === ChallengeStatus.ACTIVE;
}

function isPaused(challenge) {
  return getChallengeStatus(challenge) === ChallengeStatus.PAUSED;
}

function isCompleted(challenge) {
  return getChallengeStatus(challenge) === ChallengeStatus.COMPLETED;
}

function isScheduled(challenge) {
  return getChallengeStatus(challenge) === ChallengeStatus.SCHEDULED;
}

function isExpired(challenge) {
  return getChallengeStatus(challenge) === ChallengeStatus.EXPIRED;
}

/**
 * Check if a challenge should block websites
 * Only active challenges should block
 * @param {Object} challenge
 * @returns {boolean}
 */
function shouldBlock(challenge) {
  return isActive(challenge);
}

/**
 * Check if a challenge is in a terminal state (completed or expired)
 * @param {Object} challenge
 * @returns {boolean}
 */
function isTerminal(challenge) {
  const status = getChallengeStatus(challenge);
  return status === ChallengeStatus.COMPLETED || status === ChallengeStatus.EXPIRED;
}

/**
 * Check if a challenge is actionable (can be interacted with)
 * @param {Object} challenge
 * @returns {boolean}
 */
function isActionable(challenge) {
  return !isTerminal(challenge);
}

/**
 * Get display text for a challenge status
 * @param {string} status - One of ChallengeStatus values
 * @returns {string} Human-readable status text
 */
function getStatusText(status) {
  const statusTextMap = {
    [ChallengeStatus.ACTIVE]: 'Active',
    [ChallengeStatus.PAUSED]: 'Paused',
    [ChallengeStatus.COMPLETED]: 'Completed',
    [ChallengeStatus.SCHEDULED]: 'Scheduled',
    [ChallengeStatus.EXPIRED]: 'Expired'
  };
  return statusTextMap[status] || 'Unknown';
}

/**
 * Get CSS class for a challenge status
 * @param {string} status - One of ChallengeStatus values
 * @returns {string} CSS class name
 */
function getStatusClass(status) {
  const statusClassMap = {
    [ChallengeStatus.ACTIVE]: 'status-active',
    [ChallengeStatus.PAUSED]: 'status-paused',
    [ChallengeStatus.COMPLETED]: 'status-completed',
    [ChallengeStatus.SCHEDULED]: 'status-scheduled',
    [ChallengeStatus.EXPIRED]: 'status-expired'
  };
  return statusClassMap[status] || 'status-unknown';
}

/**
 * Get status badge HTML for a challenge
 * Combines status class and text for easy rendering
 * @param {Object} challenge
 * @returns {string} HTML string for status badge
 */
function getStatusBadge(challenge) {
  const status = getChallengeStatus(challenge);
  const statusClass = getStatusClass(status);
  const statusText = getStatusText(status);
  return `<span class="status-badge ${statusClass}">${statusText}</span>`;
}

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
    console.log('Setting connection status to:', isConnected ? 'connected' : 'disconnected');
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

  // Challenge Helpers (using new status system)
  getActiveChallenges(challenges) {
    if (!Array.isArray(challenges)) return [];
    return challenges.filter(shouldBlock);
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
      if (Array.isArray(challenge.distractions)) {
        challenge.distractions.forEach(website => {
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
