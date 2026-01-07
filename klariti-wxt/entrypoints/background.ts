import { config } from "@/utils/config";
import { StateManager } from "@/utils/storage";
import { Challenge, shouldBlock } from "@/utils/challenge-utils";

let blockedUrls = new Set<string>();
let wsConnection: WebSocket | null = null;
let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;

// Initialize when the service worker wakes up
export default defineBackground(() => {
  initializeExtension();

  browser.runtime.onInstalled.addListener(() => {
    console.log("Klariti extension installed");
    initializeExtension();
  });

  browser.runtime.onStartup.addListener(() => {
    console.log("Klariti extension starting");
    initializeExtension();
  });

  // Listen for messages
  browser.runtime.onMessage.addListener((request, _sender, sendResponse) => {
    if (request.action === "user_logged_in") {
      updateChallengesAndBlocking().then(() => {
        connectWebSocket();
        checkActiveTab();
        sendResponse({ success: true });
      });
      return true;
    }

    if (request.action === "user_logged_out") {
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

    if (
      request.action === "challenges_updated" &&
      Array.isArray(request.challenges)
    ) {
      updateBlockingRules(request.challenges);
      checkActiveTab();
      sendResponse({ success: true });
      return true;
    }

    if (request.action === "refresh_challenges") {
      updateChallengesAndBlocking().then(() => {
        sendResponse({ success: true });
      });
      return true;
    }

    if (request.action === "check_connection") {
      if (!wsConnection || wsConnection.readyState !== WebSocket.OPEN) {
        connectWebSocket();
      }
      const isConnected =
        wsConnection && wsConnection.readyState === WebSocket.OPEN;
      sendResponse({ status: isConnected ? "connected" : "disconnected" });
      return true;
    }

    return false;
  });

  // Alarms
  browser.alarms.create("keepAlive", { periodInMinutes: 5 / 60 });
  browser.alarms.create("checkActiveTab", { periodInMinutes: 10 / 60 });
  browser.alarms.create("checkTimedChallenges", { periodInMinutes: 1 });

  browser.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "keepAlive") {
      console.log("Keep alive alarm triggered");
      fetchStateFromApi();
    } else if (alarm.name === "checkActiveTab") {
      console.log("Check active tab alarm triggered");
      checkActiveTab();
    } else if (alarm.name === "checkTimedChallenges") {
      console.log("Check timed challenges alarm triggered");
      StateManager.getState().then(({ challenges }) => {
        if (Array.isArray(challenges)) {
          updateBlockingRules(challenges);
        }
      });
    }
  });

  // Tab events
  browser.tabs.onActivated.addListener(async (activeInfo) => {
    try {
      const tab = await browser.tabs.get(activeInfo.tabId);
      await checkAndRedirectTab(tab);
    } catch (error) {
      console.error("Error in tab activation handler:", error);
    }
  });

  browser.windows.onFocusChanged.addListener((windowId) => {
    console.log("Window focus changed:", windowId);
    if (windowId === browser.windows.WINDOW_ID_NONE) return;
    browser.tabs.query({ active: true, windowId }).then((tabs) => {
      if (!tabs || tabs.length === 0) return;
      checkAndRedirectTab(tabs[0]);
    });
  });

  browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (!tab || !tab.active) return;
    if (!changeInfo.url && changeInfo.status !== "loading") return;
    checkAndRedirectTab(tab);
  });
});

// Initialize extension
async function initializeExtension() {
  try {
    const { access_token } = await StateManager.getState();
    if (access_token) {
      await updateChallengesAndBlocking();
      connectWebSocket();
    }
    await checkActiveTab();
  } catch (e) {
    console.error("Initialization error:", e);
  }
}

// Fetch challenges and update blocking rules
async function updateChallengesAndBlocking() {
  try {
    const { access_token } = await StateManager.getState();
    if (!access_token) {
      console.log("No access token, skipping challenge fetch");
      return;
    }

    const response = await fetch(
      `${config.apiUrl}/challenges/my-challenges?skip=0&limit=100`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to fetch challenges:", response.status, errorText);

      if (response.status === 401 || response.status === 403) {
        console.error("Authentication failed - token expired or invalid");
        await StateManager.clearSession();
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
    console.error("Error fetching challenges:", error);
  }
}

// Update blocking rules based on challenges
function updateBlockingRules(challenges: Challenge[]) {
  blockedUrls = StateManager.getBlockedUrls(challenges);
  console.log(
    `Updated blocking rules: ${blockedUrls.size} URLs blocked from ${
      challenges.filter(shouldBlock).length
    } active challenges`
  );
  checkActiveTab();
}

// Check if a URL is blocked
function isUrlBlocked(url: string) {
  return StateManager.isUrlBlocked(url, blockedUrls);
}

// Helper to check a single tab and redirect if blocked
async function checkAndRedirectTab(tab: browser.Tabs.Tab) {
  if (!tab || !tab.url) return;
  const url = tab.url;

  // Skip internal chrome pages
  if (url.startsWith("chrome://") || url.startsWith("chrome-extension://"))
    return;

  if (isUrlBlocked(url)) {
    try {
      await browser.tabs.update(tab.id!, { url: "http://klariti.so/lock" });
      console.log("Redirected blocked tab:", url);
    } catch (err) {
      console.error("Error redirecting blocked tab:", err);
    }
  }
}

// Check only the active tab and close it if blocked
async function checkActiveTab() {
  try {
    const tabs = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (!tabs || tabs.length === 0) return;
    await checkAndRedirectTab(tabs[0]);
  } catch (error) {
    console.error("Error checking active tab:", error);
  }
}

// Keep-alive: lightweight state refresh
async function fetchStateFromApi() {
  try {
    const { access_token } = await StateManager.getState();
    if (access_token) {
      await updateChallengesAndBlocking();
      if (!wsConnection || wsConnection.readyState !== WebSocket.OPEN) {
        connectWebSocket();
      }
    }
  } catch (error) {
    console.error("Error fetching state from API:", error);
  }
}

// WebSocket connection for real-time challenge updates
function connectWebSocket(retryCount = 0) {
  try {
    if (wsConnection && wsConnection.readyState === WebSocket.OPEN) return;
    if (wsConnection) wsConnection.close();

    wsConnection = new WebSocket(config.wsUrl);

    wsConnection.onopen = () => {
      console.log("Challenge WebSocket connected");
      StateManager.setConnectionStatus(true);
    };

    wsConnection.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (
          data.type === "challenge_toggled" ||
          data.type === "challenge_updated"
        ) {
          updateChallengesAndBlocking().then(() => checkActiveTab());
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    wsConnection.onerror = (error) => {
      console.error("Challenge WebSocket error:", error);
      StateManager.setConnectionStatus(false);
    };

    wsConnection.onclose = () => {
      console.log("WebSocket disconnected");
      wsConnection = null;
      StateManager.setConnectionStatus(false);

      if (reconnectTimeout) clearTimeout(reconnectTimeout);

      const baseDelay = Math.min(30000, Math.pow(2, retryCount) * 1000);
      const jitter = Math.random() * 1000;
      const delay = baseDelay + jitter;

      console.log(`Reconnecting in ${Math.round(delay)}ms...`);

      reconnectTimeout = setTimeout(() => {
        StateManager.getState().then(({ access_token }) => {
          if (access_token) connectWebSocket(retryCount + 1);
        });
      }, delay);
    };
  } catch (error) {
    console.error("Error creating challenge WebSocket:", error);
    StateManager.setConnectionStatus(false);
  }
}
