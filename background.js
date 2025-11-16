// background.js - Minimal blocker: close current tab if it matches blocked challenges

importScripts('config.js');

let blockedUrls = new Set();
let wsConnection = null;
let reconnectTimeout = null;

// Initialize extension
async function initializeExtension() {
  try {
    const { access_token } = await chrome.storage.local.get('access_token');
    if (access_token) {
      await updateChallengesAndBlocking();
      connectWebSocket();
    }
    // Initial check on the current active tab
    await checkActiveTab();
  } catch (e) {
    console.error('Initialization error:', e);
  }
}

chrome.runtime.onInstalled.addListener(() => {
  console.log('Klariti extension installed');
  initializeExtension();
});

chrome.runtime.onStartup.addListener(() => {
  console.log('Klariti extension starting');
  initializeExtension();
});

// Also initialize when the service worker wakes up
initializeExtension();

// Fetch challenges and update blocking rules
async function updateChallengesAndBlocking() {
  try {
    const { access_token } = await chrome.storage.local.get('access_token');
    if (!access_token) {
      console.log('No access token, skipping challenge fetch');
      return;
    }

    const response = await fetch(`${config.apiUrl}/challenges/my-challenges?skip=0&limit=100`, {
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json'
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to fetch challenges:', response.status, errorText);
      return;
    }

    const challenges = await response.json();
    await chrome.storage.local.set({ challenges });
    updateBlockingRules(challenges);
  } catch (error) {
    console.error('Error fetching challenges:', error);
  }
}

// Update blocking rules based on challenges
function updateBlockingRules(challenges) {
  blockedUrls.clear();

  challenges.forEach(challenge => {
    if (challenge.completed) return;

    const isActive = challenge.challenge_type === 'toggle'
      ? (challenge.toggle_details?.is_active === true)
      : isTimeBasedActive(challenge);

    if (!isActive) return;

    if (Array.isArray(challenge.distracting_websites)) {
      challenge.distracting_websites.forEach(website => {
        if (website?.url) {
          blockedUrls.add(normalizeUrl(website.url));
        }
      });
    }
  });

  // After rules update, check the current active tab only
  checkActiveTab();
}

// Check if time-based challenge is active
function isTimeBasedActive(challenge) {
  if (challenge.challenge_type !== 'time_based' || !challenge.time_based_details) return false;
  const now = new Date();
  const start = new Date(challenge.time_based_details.start_date);
  const end = new Date(challenge.time_based_details.end_date);
  return now >= start && now <= end;
}

// Normalize URL to match against
function normalizeUrl(url) {
  if (!url) return '';
  let normalized = url.replace(/^https?:\/\//, ''); // strip protocol
  normalized = normalized.replace(/^www\./, '');      // strip www
  normalized = normalized.replace(/\/$/, '');        // strip trailing slash
  return normalized.toLowerCase();
}

// Check if a URL is blocked
function isUrlBlocked(url) {
  if (!url) return false;
  const normalized = normalizeUrl(url);

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

// Check only the active tab and close it if blocked
async function checkActiveTab() {
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tabs || tabs.length === 0) return;
    const activeTab = tabs[0];
    const url = activeTab.url;
    if (url && isUrlBlocked(url)) {
      try {
        await chrome.tabs.remove(activeTab.id);
        console.log('Closed blocked active tab:', url);
      } catch (err) {
        console.error('Error closing blocked active tab:', err);
      }
    }
  } catch (error) {
    console.error('Error checking active tab:', error);
  }
}

// Keep-alive: lightweight state refresh (re-fetch if token exists)
async function fetchStateFromApi() {
  try {
    const { access_token } = await chrome.storage.local.get('access_token');
    if (access_token) {
      await updateChallengesAndBlocking();
    }
  } catch (error) {
    console.error('Error fetching state from API:', error);
  }
}

// WebSocket connection for real-time challenge updates
function connectWebSocket() {
  try {
    if (wsConnection) return;

    wsConnection = new WebSocket(config.wsUrl);

    wsConnection.onopen = () => {
      console.log('Challenge WebSocket connected');
    };

    wsConnection.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'challenge_toggled' || data.type === 'challenge_updated') {
          // Refresh rules and immediately check active tab
          updateChallengesAndBlocking().then(() => checkActiveTab());
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    wsConnection.onerror = (error) => {
      console.error('Challenge WebSocket error:', error);
    };

    wsConnection.onclose = () => {
      wsConnection = null;
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      reconnectTimeout = setTimeout(() => {
        chrome.storage.local.get('access_token', ({ access_token }) => {
          if (access_token) connectWebSocket();
        });
      }, 5000);
    };
  } catch (error) {
    console.error('Error creating challenge WebSocket:', error);
  }
}

// Listen for minimal messages
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === 'user_logged_in') {
    updateChallengesAndBlocking().then(() => {
      connectWebSocket();
      checkActiveTab();
      sendResponse({ success: true });
    });
    return true;
  }

  if (request.action === 'user_logged_out') {
    if (wsConnection) {
      wsConnection.close();
      wsConnection = null;
    }
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
      reconnectTimeout = null;
    }
    blockedUrls.clear();
    sendResponse({ success: true });
    return true;
  }

  if (request.action === 'challenges_updated' && Array.isArray(request.challenges)) {
    updateBlockingRules(request.challenges);
    checkActiveTab();
    sendResponse({ success: true });
    return true;
  }

  return false;
});

// Create light-weight alarms
chrome.alarms.create('keepAlive', { periodInMinutes: 1 });
chrome.alarms.create('checkActiveTab', { periodInMinutes: 0.25 }); // ~15s
chrome.alarms.create('checkTimedChallenges', { periodInMinutes: 1 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'keepAlive') {
    fetchStateFromApi();
  } else if (alarm.name === 'checkActiveTab') {
    checkActiveTab();
  } else if (alarm.name === 'checkTimedChallenges') {
    // Re-evaluate time-based challenge windows using cached challenges
    chrome.storage.local.get(['challenges'], ({ challenges }) => {
      if (Array.isArray(challenges)) {
        updateBlockingRules(challenges);
      }
    });
  }
});

// Check when user switches tabs
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    if (tab?.url && isUrlBlocked(tab.url)) {
      await chrome.tabs.remove(tab.id);
    }
  } catch (error) {
    console.error('Error in tab activation handler:', error);
  }
});

// Check when Chrome window regains focus
chrome.windows.onFocusChanged.addListener(async (windowId) => {
  if (windowId !== chrome.windows.WINDOW_ID_NONE) {
    await checkActiveTab();
  }
});
