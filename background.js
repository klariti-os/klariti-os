importScripts('config.js', 'challenge-utils.js');

let blockedUrls = new Set();
let wsConnection = null;
let reconnectTimeout = null;


// initialize when the service worker wakes up
initializeExtension();


chrome.runtime.onInstalled.addListener(() => {
  console.log('Klariti extension installed');
  initializeExtension();
});

chrome.runtime.onStartup.addListener(() => {
  console.log('Klariti extension starting');
  initializeExtension();
});

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
      
      // Check if it's an authentication error (401 or 403)
      if (response.status === 401 || response.status === 403) {
        console.error('Authentication failed - token expired or invalid');
      
        // Clear invalid session
        await StateManager.clearSession();
        // Clear local state
        if (wsConnection) {
          wsConnection.close();
          wsConnection = null;
        }
        if (reconnectTimeout) {
          clearTimeout(reconnectTimeout);
          reconnectTimeout = null;
        }
        blockedUrls.clear();
      }
      return;
    }

    const challenges = await response.json();
    await StateManager.setChallenges(challenges);
    updateBlockingRules(challenges);
  } catch (error) {
    console.error('Error fetching challenges:', error);
  }
}

// Update blocking rules based on challenges
function updateBlockingRules(challenges) {
  blockedUrls = StateManager.getBlockedUrls(challenges);
  console.log(`Updated blocking rules: ${blockedUrls.size} URLs blocked from ${challenges.filter(shouldBlock).length} active challenges`);
  // After rules update, check the current active tab only
  checkActiveTab();
}

// Check if a URL is blocked
function isUrlBlocked(url) {
  return StateManager.isUrlBlocked(url, blockedUrls);
}

// Check only the active tab and close it if blocked
// Helper to check a single tab and redirect if blocked
async function checkAndRedirectTab(tab) {
  if (!tab || !tab.url) return;
  const url = tab.url;
  
  // Skip internal chrome pages
  if (url.startsWith('chrome://') || url.startsWith('chrome-extension://')) return;
  
  if (isUrlBlocked(url)) {
    try {
      await chrome.tabs.update(tab.id, { url: 'http://localhost:3000/lock' });
      console.log('Redirected blocked tab:', url);
    } catch (err) {
      console.error('Error redirecting blocked tab:', err);
    }
  }
}

// Check only the active tab and close it if blocked
async function checkActiveTab() {
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tabs || tabs.length === 0) return;
    await checkAndRedirectTab(tabs[0]);
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
      // Ensure WebSocket is connected
      if (!wsConnection || wsConnection.readyState !== WebSocket.OPEN) {
        connectWebSocket();
      }
    }
  } catch (error) {
    console.error('Error fetching state from API:', error);
  }
}

// WebSocket connection for real-time challenge updates
function connectWebSocket(retryCount = 0) {
  try {
    if (wsConnection && wsConnection.readyState === WebSocket.OPEN) return;
    if (wsConnection) wsConnection.close();

    wsConnection = new WebSocket(config.wsUrl);

    wsConnection.onopen = () => {
      console.log('Challenge WebSocket connected');
      StateManager.setConnectionStatus(true);
      // Reset retry count on successful connection
      retryCount = 0;
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
      StateManager.setConnectionStatus(false);
    };

    wsConnection.onclose = () => {
      console.log('WebSocket disconnected');
      wsConnection = null;
      StateManager.setConnectionStatus(false);
      
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      
      // Exponential backoff with jitter: 2^retry * 1000 + random jitter
      const baseDelay = Math.min(30000, Math.pow(2, retryCount) * 1000);
      const jitter = Math.random() * 1000;
      const delay = baseDelay + jitter;
      
      console.log(`Reconnecting in ${Math.round(delay)}ms...`);
      
      reconnectTimeout = setTimeout(() => {
        chrome.storage.local.get('access_token', ({ access_token }) => {
          if (access_token) connectWebSocket(retryCount + 1);
        });
      }, delay);
    };
  } catch (error) {
    console.error('Error creating challenge WebSocket:', error);
    StateManager.setConnectionStatus(false);
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

  if (request.action === 'refresh_challenges') {
    // Popup is requesting fresh challenge data
    updateChallengesAndBlocking().then(() => {
      sendResponse({ success: true });
    });
    return true;
  }

  if (request.action === 'check_connection') {
    if (!wsConnection || wsConnection.readyState !== WebSocket.OPEN) {
      connectWebSocket();
    }
    // Return current status immediately
    const isConnected = wsConnection && wsConnection.readyState === WebSocket.OPEN;
    sendResponse({ status: isConnected ? 'connected' : 'disconnected' });
    return true;
  }

  return false;
});

// Create light-weight alarms
chrome.alarms.create('keepAlive', { periodInMinutes: 20/60 });
chrome.alarms.create('checkActiveTab', { periodInMinutes: 10/60 }); // ~15s
chrome.alarms.create('checkTimedChallenges', { periodInMinutes: 1 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'keepAlive') {
    console.log('Keep alive alarm triggered');
    // print access token for debugging
    chrome.storage.local.get('access_token', ({ access_token }) => {
      console.log('Access token:', access_token);
    });
    fetchStateFromApi();
  } else if (alarm.name === 'checkActiveTab') {
    console.log('Check active tab alarm triggered');
    checkActiveTab();
  } else if (alarm.name === 'checkTimedChallenges') {
    console.log('Check timed challenges alarm triggered');
    // Re-evaluate time-based challenge windows using cached challenges
    chrome.storage.local.get(['challenges'], ({ challenges }) => {
      if (Array.isArray(challenges)) {
        updateBlockingRules(challenges);
      }
    });
  }
});

// Check when user switches tabs
// Check when user switches tabs
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    await checkAndRedirectTab(tab);
  } catch (error) {
    console.error('Error in tab activation handler:', error);
  }
});

// Check when Chrome window regains focus (immediate close if blocked)
// Check when Chrome window regains focus (immediate close if blocked)
chrome.windows.onFocusChanged.addListener((windowId) => {
  console.log('Window focus changed:', windowId);
  if (windowId === chrome.windows.WINDOW_ID_NONE) return;
  chrome.tabs.query({ active: true, windowId }, (tabs) => {
    if (!tabs || tabs.length === 0) return;
    checkAndRedirectTab(tabs[0]);
  });
});

// Check when a tab's URL changes (immediate reaction)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (!tab || !tab.active) return;
  if (!changeInfo.url && changeInfo.status !== 'loading') return;
  checkAndRedirectTab(tab);
});


