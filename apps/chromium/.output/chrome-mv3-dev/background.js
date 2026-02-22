var background = (function() {
  "use strict";
  function defineBackground(arg) {
    if (arg == null || typeof arg === "function") return { main: arg };
    return arg;
  }
  const browser$1 = globalThis.browser?.runtime?.id ? globalThis.browser : globalThis.chrome;
  const browser = browser$1;
  const API_BASE_URL = "https://api-klariti.onrender.com";
  const getWebSocketUrl = (apiUrl) => {
    const wsUrl = apiUrl.replace(/^https/, "wss");
    return `${wsUrl}/challenges/ws`;
  };
  const config = {
    apiUrl: API_BASE_URL,
    wsUrl: getWebSocketUrl(API_BASE_URL)
  };
  const getChallengeStatus = (challenge) => {
    if (challenge.completed) {
      return "completed";
    }
    if (challenge.challenge_type === "time_based" && challenge.time_based_details) {
      const now = /* @__PURE__ */ new Date();
      const startString = challenge.time_based_details.start_date;
      const endString = challenge.time_based_details.end_date;
      const start = new Date(
        startString.endsWith("Z") ? startString : `${startString}Z`
      );
      const end = new Date(endString.endsWith("Z") ? endString : `${endString}Z`);
      if (now > end) {
        return "expired";
      }
      if (now < start) {
        return "scheduled";
      }
      return "active";
    }
    if (challenge.challenge_type === "toggle" && challenge.toggle_details) {
      return challenge.toggle_details.is_active ? "active" : "paused";
    }
    return "paused";
  };
  const isActive = (challenge) => getChallengeStatus(challenge) === "active";
  const shouldBlock = (challenge) => isActive(challenge);
  const StateManager = {
    // Constants
    STORAGE_KEYS: {
      ACCESS_TOKEN: "access_token",
      USERNAME: "username",
      CHALLENGES: "challenges",
      CONNECTION_STATUS: "connectionStatus"
    },
    // State Accessors
    async getState() {
      const data = await browser.storage.local.get([
        this.STORAGE_KEYS.ACCESS_TOKEN,
        this.STORAGE_KEYS.USERNAME,
        this.STORAGE_KEYS.CHALLENGES,
        this.STORAGE_KEYS.CONNECTION_STATUS
      ]);
      return {
        access_token: data[this.STORAGE_KEYS.ACCESS_TOKEN] || null,
        username: data[this.STORAGE_KEYS.USERNAME] || null,
        challenges: data[this.STORAGE_KEYS.CHALLENGES] || [],
        connectionStatus: data[this.STORAGE_KEYS.CONNECTION_STATUS] || "disconnected"
      };
    },
    async setChallenges(challenges) {
      await browser.storage.local.set({
        [this.STORAGE_KEYS.CHALLENGES]: challenges
      });
    },
    async setConnectionStatus(isConnected) {
      console.log(
        "Setting connection status to:",
        isConnected ? "connected" : "disconnected"
      );
      await browser.storage.local.set({
        [this.STORAGE_KEYS.CONNECTION_STATUS]: isConnected ? "connected" : "disconnected"
      });
    },
    async setSession(accessToken, username) {
      await browser.storage.local.set({
        [this.STORAGE_KEYS.ACCESS_TOKEN]: accessToken,
        [this.STORAGE_KEYS.USERNAME]: username
      });
    },
    async clearSession() {
      await browser.storage.local.remove([
        this.STORAGE_KEYS.ACCESS_TOKEN,
        this.STORAGE_KEYS.USERNAME,
        this.STORAGE_KEYS.CHALLENGES
      ]);
    },
    // Challenge Helpers
    getActiveChallenges(challenges) {
      if (!Array.isArray(challenges)) return [];
      return challenges.filter(shouldBlock);
    },
    // URL Helpers
    normalizeUrl(url) {
      if (!url) return "";
      let normalized = url.replace(/^https?:\/\//, "");
      normalized = normalized.replace(/^www\./, "");
      normalized = normalized.replace(/\/$/, "");
      return normalized.toLowerCase();
    },
    getBlockedUrls(challenges) {
      const blockedUrls2 = /* @__PURE__ */ new Set();
      const activeChallenges = challenges.filter(shouldBlock);
      activeChallenges.forEach((challenge) => {
        if (Array.isArray(challenge.distractions)) {
          challenge.distractions.forEach((website) => {
            if (website?.url) {
              blockedUrls2.add(this.normalizeUrl(website.url));
            }
          });
        }
      });
      return blockedUrls2;
    },
    isUrlBlocked(url, blockedUrls2) {
      if (!url) return false;
      const normalized = this.normalizeUrl(url);
      if (blockedUrls2.has(normalized)) return true;
      for (const blocked of blockedUrls2) {
        if (normalized === blocked) return true;
        if (normalized.startsWith(blocked)) return true;
        if (normalized.includes(blocked)) return true;
      }
      return false;
    }
  };
  let blockedUrls = /* @__PURE__ */ new Set();
  let wsConnection = null;
  let reconnectTimeout = null;
  const definition = defineBackground(() => {
    initializeExtension();
    browser.runtime.onInstalled.addListener(() => {
      console.log("Klariti extension installed");
      initializeExtension();
    });
    browser.runtime.onStartup.addListener(() => {
      console.log("Klariti extension starting");
      initializeExtension();
    });
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
      if (request.action === "challenges_updated" && Array.isArray(request.challenges)) {
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
        const isConnected = wsConnection && wsConnection.readyState === WebSocket.OPEN;
        sendResponse({ status: isConnected ? "connected" : "disconnected" });
        return true;
      }
      return false;
    });
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
            "Content-Type": "application/json"
          }
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
  function updateBlockingRules(challenges) {
    blockedUrls = StateManager.getBlockedUrls(challenges);
    console.log(
      `Updated blocking rules: ${blockedUrls.size} URLs blocked from ${challenges.filter(shouldBlock).length} active challenges`
    );
    checkActiveTab();
  }
  function isUrlBlocked(url) {
    return StateManager.isUrlBlocked(url, blockedUrls);
  }
  async function checkAndRedirectTab(tab) {
    if (!tab || !tab.url) return;
    const url = tab.url;
    if (url.startsWith("chrome://") || url.startsWith("chrome-extension://"))
      return;
    if (isUrlBlocked(url)) {
      try {
        await browser.tabs.update(tab.id, { url: "http://klariti.so/lock" });
        console.log("Redirected blocked tab:", url);
      } catch (err) {
        console.error("Error redirecting blocked tab:", err);
      }
    }
  }
  async function checkActiveTab() {
    try {
      const tabs = await browser.tabs.query({
        active: true,
        currentWindow: true
      });
      if (!tabs || tabs.length === 0) return;
      await checkAndRedirectTab(tabs[0]);
    } catch (error) {
      console.error("Error checking active tab:", error);
    }
  }
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
          if (data.type === "challenge_toggled" || data.type === "challenge_updated") {
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
        const baseDelay = Math.min(3e4, Math.pow(2, retryCount) * 1e3);
        const jitter = Math.random() * 1e3;
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
  function initPlugins() {
  }
  var _MatchPattern = class {
    constructor(matchPattern) {
      if (matchPattern === "<all_urls>") {
        this.isAllUrls = true;
        this.protocolMatches = [..._MatchPattern.PROTOCOLS];
        this.hostnameMatch = "*";
        this.pathnameMatch = "*";
      } else {
        const groups = /(.*):\/\/(.*?)(\/.*)/.exec(matchPattern);
        if (groups == null)
          throw new InvalidMatchPattern(matchPattern, "Incorrect format");
        const [_, protocol, hostname, pathname] = groups;
        validateProtocol(matchPattern, protocol);
        validateHostname(matchPattern, hostname);
        this.protocolMatches = protocol === "*" ? ["http", "https"] : [protocol];
        this.hostnameMatch = hostname;
        this.pathnameMatch = pathname;
      }
    }
    includes(url) {
      if (this.isAllUrls)
        return true;
      const u = typeof url === "string" ? new URL(url) : url instanceof Location ? new URL(url.href) : url;
      return !!this.protocolMatches.find((protocol) => {
        if (protocol === "http")
          return this.isHttpMatch(u);
        if (protocol === "https")
          return this.isHttpsMatch(u);
        if (protocol === "file")
          return this.isFileMatch(u);
        if (protocol === "ftp")
          return this.isFtpMatch(u);
        if (protocol === "urn")
          return this.isUrnMatch(u);
      });
    }
    isHttpMatch(url) {
      return url.protocol === "http:" && this.isHostPathMatch(url);
    }
    isHttpsMatch(url) {
      return url.protocol === "https:" && this.isHostPathMatch(url);
    }
    isHostPathMatch(url) {
      if (!this.hostnameMatch || !this.pathnameMatch)
        return false;
      const hostnameMatchRegexs = [
        this.convertPatternToRegex(this.hostnameMatch),
        this.convertPatternToRegex(this.hostnameMatch.replace(/^\*\./, ""))
      ];
      const pathnameMatchRegex = this.convertPatternToRegex(this.pathnameMatch);
      return !!hostnameMatchRegexs.find((regex) => regex.test(url.hostname)) && pathnameMatchRegex.test(url.pathname);
    }
    isFileMatch(url) {
      throw Error("Not implemented: file:// pattern matching. Open a PR to add support");
    }
    isFtpMatch(url) {
      throw Error("Not implemented: ftp:// pattern matching. Open a PR to add support");
    }
    isUrnMatch(url) {
      throw Error("Not implemented: urn:// pattern matching. Open a PR to add support");
    }
    convertPatternToRegex(pattern) {
      const escaped = this.escapeForRegex(pattern);
      const starsReplaced = escaped.replace(/\\\*/g, ".*");
      return RegExp(`^${starsReplaced}$`);
    }
    escapeForRegex(string) {
      return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }
  };
  var MatchPattern = _MatchPattern;
  MatchPattern.PROTOCOLS = ["http", "https", "file", "ftp", "urn"];
  var InvalidMatchPattern = class extends Error {
    constructor(matchPattern, reason) {
      super(`Invalid match pattern "${matchPattern}": ${reason}`);
    }
  };
  function validateProtocol(matchPattern, protocol) {
    if (!MatchPattern.PROTOCOLS.includes(protocol) && protocol !== "*")
      throw new InvalidMatchPattern(
        matchPattern,
        `${protocol} not a valid protocol (${MatchPattern.PROTOCOLS.join(", ")})`
      );
  }
  function validateHostname(matchPattern, hostname) {
    if (hostname.includes(":"))
      throw new InvalidMatchPattern(matchPattern, `Hostname cannot include a port`);
    if (hostname.includes("*") && hostname.length > 1 && !hostname.startsWith("*."))
      throw new InvalidMatchPattern(
        matchPattern,
        `If using a wildcard (*), it must go at the start of the hostname`
      );
  }
  function print(method, ...args) {
    if (typeof args[0] === "string") method(`[wxt] ${args.shift()}`, ...args);
    else method("[wxt]", ...args);
  }
  const logger = {
    debug: (...args) => print(console.debug, ...args),
    log: (...args) => print(console.log, ...args),
    warn: (...args) => print(console.warn, ...args),
    error: (...args) => print(console.error, ...args)
  };
  let ws;
  function getDevServerWebSocket() {
    if (ws == null) {
      const serverUrl = "ws://localhost:3000";
      logger.debug("Connecting to dev server @", serverUrl);
      ws = new WebSocket(serverUrl, "vite-hmr");
      ws.addWxtEventListener = ws.addEventListener.bind(ws);
      ws.sendCustom = (event, payload) => ws?.send(JSON.stringify({
        type: "custom",
        event,
        payload
      }));
      ws.addEventListener("open", () => {
        logger.debug("Connected to dev server");
      });
      ws.addEventListener("close", () => {
        logger.debug("Disconnected from dev server");
      });
      ws.addEventListener("error", (event) => {
        logger.error("Failed to connect to dev server", event);
      });
      ws.addEventListener("message", (e) => {
        try {
          const message = JSON.parse(e.data);
          if (message.type === "custom") ws?.dispatchEvent(new CustomEvent(message.event, { detail: message.data }));
        } catch (err) {
          logger.error("Failed to handle message", err);
        }
      });
    }
    return ws;
  }
  function keepServiceWorkerAlive() {
    setInterval(async () => {
      await browser.runtime.getPlatformInfo();
    }, 5e3);
  }
  function reloadContentScript(payload) {
    if (browser.runtime.getManifest().manifest_version == 2) reloadContentScriptMv2();
    else reloadContentScriptMv3(payload);
  }
  async function reloadContentScriptMv3({ registration, contentScript }) {
    if (registration === "runtime") await reloadRuntimeContentScriptMv3(contentScript);
    else await reloadManifestContentScriptMv3(contentScript);
  }
  async function reloadManifestContentScriptMv3(contentScript) {
    const id = `wxt:${contentScript.js[0]}`;
    logger.log("Reloading content script:", contentScript);
    const registered = await browser.scripting.getRegisteredContentScripts();
    logger.debug("Existing scripts:", registered);
    const existing = registered.find((cs) => cs.id === id);
    if (existing) {
      logger.debug("Updating content script", existing);
      await browser.scripting.updateContentScripts([{
        ...contentScript,
        id,
        css: contentScript.css ?? []
      }]);
    } else {
      logger.debug("Registering new content script...");
      await browser.scripting.registerContentScripts([{
        ...contentScript,
        id,
        css: contentScript.css ?? []
      }]);
    }
    await reloadTabsForContentScript(contentScript);
  }
  async function reloadRuntimeContentScriptMv3(contentScript) {
    logger.log("Reloading content script:", contentScript);
    const registered = await browser.scripting.getRegisteredContentScripts();
    logger.debug("Existing scripts:", registered);
    const matches = registered.filter((cs) => {
      const hasJs = contentScript.js?.find((js) => cs.js?.includes(js));
      const hasCss = contentScript.css?.find((css) => cs.css?.includes(css));
      return hasJs || hasCss;
    });
    if (matches.length === 0) {
      logger.log("Content script is not registered yet, nothing to reload", contentScript);
      return;
    }
    await browser.scripting.updateContentScripts(matches);
    await reloadTabsForContentScript(contentScript);
  }
  async function reloadTabsForContentScript(contentScript) {
    const allTabs = await browser.tabs.query({});
    const matchPatterns = contentScript.matches.map((match) => new MatchPattern(match));
    const matchingTabs = allTabs.filter((tab) => {
      const url = tab.url;
      if (!url) return false;
      return !!matchPatterns.find((pattern) => pattern.includes(url));
    });
    await Promise.all(matchingTabs.map(async (tab) => {
      try {
        await browser.tabs.reload(tab.id);
      } catch (err) {
        logger.warn("Failed to reload tab:", err);
      }
    }));
  }
  async function reloadContentScriptMv2(_payload) {
    throw Error("TODO: reloadContentScriptMv2");
  }
  {
    try {
      const ws2 = getDevServerWebSocket();
      ws2.addWxtEventListener("wxt:reload-extension", () => {
        browser.runtime.reload();
      });
      ws2.addWxtEventListener("wxt:reload-content-script", (event) => {
        reloadContentScript(event.detail);
      });
      if (true) {
        ws2.addEventListener("open", () => ws2.sendCustom("wxt:background-initialized"));
        keepServiceWorkerAlive();
      }
    } catch (err) {
      logger.error("Failed to setup web socket connection with dev server", err);
    }
    browser.commands.onCommand.addListener((command) => {
      if (command === "wxt:reload-extension") browser.runtime.reload();
    });
  }
  let result;
  try {
    initPlugins();
    result = definition.main();
    if (result instanceof Promise) console.warn("The background's main() function return a promise, but it must be synchronous");
  } catch (err) {
    logger.error("The background crashed on startup!");
    throw err;
  }
  var background_entrypoint_default = result;
  return background_entrypoint_default;
})();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFja2dyb3VuZC5qcyIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3d4dEAwLjIwLjE3X0B0eXBlcytub2RlQDI1LjMuMF9lc2xpbnRAOS4zOS4zX2ppdGlAMS4yMS43X19qaXRpQDEuMjEuN19yb2xsdXBANC41OS4wX3RzeEA0LjIxLjAvbm9kZV9tb2R1bGVzL3d4dC9kaXN0L3V0aWxzL2RlZmluZS1iYWNrZ3JvdW5kLm1qcyIsIi4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9Ad3h0LWRlditicm93c2VyQDAuMS4zNy9ub2RlX21vZHVsZXMvQHd4dC1kZXYvYnJvd3Nlci9zcmMvaW5kZXgubWpzIiwiLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3d4dEAwLjIwLjE3X0B0eXBlcytub2RlQDI1LjMuMF9lc2xpbnRAOS4zOS4zX2ppdGlAMS4yMS43X19qaXRpQDEuMjEuN19yb2xsdXBANC41OS4wX3RzeEA0LjIxLjAvbm9kZV9tb2R1bGVzL3d4dC9kaXN0L2Jyb3dzZXIubWpzIiwiLi4vLi4vdXRpbHMvY29uZmlnLnRzIiwiLi4vLi4vdXRpbHMvY2hhbGxlbmdlLXV0aWxzLnRzIiwiLi4vLi4vdXRpbHMvc3RvcmFnZS50cyIsIi4uLy4uL2VudHJ5cG9pbnRzL2JhY2tncm91bmQudHMiLCIuLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vQHdlYmV4dC1jb3JlK21hdGNoLXBhdHRlcm5zQDEuMC4zL25vZGVfbW9kdWxlcy9Ad2ViZXh0LWNvcmUvbWF0Y2gtcGF0dGVybnMvbGliL2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vI3JlZ2lvbiBzcmMvdXRpbHMvZGVmaW5lLWJhY2tncm91bmQudHNcbmZ1bmN0aW9uIGRlZmluZUJhY2tncm91bmQoYXJnKSB7XG5cdGlmIChhcmcgPT0gbnVsbCB8fCB0eXBlb2YgYXJnID09PSBcImZ1bmN0aW9uXCIpIHJldHVybiB7IG1haW46IGFyZyB9O1xuXHRyZXR1cm4gYXJnO1xufVxuXG4vLyNlbmRyZWdpb25cbmV4cG9ydCB7IGRlZmluZUJhY2tncm91bmQgfTsiLCIvLyAjcmVnaW9uIHNuaXBwZXRcbmV4cG9ydCBjb25zdCBicm93c2VyID0gZ2xvYmFsVGhpcy5icm93c2VyPy5ydW50aW1lPy5pZFxuICA/IGdsb2JhbFRoaXMuYnJvd3NlclxuICA6IGdsb2JhbFRoaXMuY2hyb21lO1xuLy8gI2VuZHJlZ2lvbiBzbmlwcGV0XG4iLCJpbXBvcnQgeyBicm93c2VyIGFzIGJyb3dzZXIkMSB9IGZyb20gXCJAd3h0LWRldi9icm93c2VyXCI7XG5cbi8vI3JlZ2lvbiBzcmMvYnJvd3Nlci50c1xuLyoqXG4qIENvbnRhaW5zIHRoZSBgYnJvd3NlcmAgZXhwb3J0IHdoaWNoIHlvdSBzaG91bGQgdXNlIHRvIGFjY2VzcyB0aGUgZXh0ZW5zaW9uIEFQSXMgaW4geW91ciBwcm9qZWN0OlxuKiBgYGB0c1xuKiBpbXBvcnQgeyBicm93c2VyIH0gZnJvbSAnd3h0L2Jyb3dzZXInO1xuKlxuKiBicm93c2VyLnJ1bnRpbWUub25JbnN0YWxsZWQuYWRkTGlzdGVuZXIoKCkgPT4ge1xuKiAgIC8vIC4uLlxuKiB9KVxuKiBgYGBcbiogQG1vZHVsZSB3eHQvYnJvd3NlclxuKi9cbmNvbnN0IGJyb3dzZXIgPSBicm93c2VyJDE7XG5cbi8vI2VuZHJlZ2lvblxuZXhwb3J0IHsgYnJvd3NlciB9OyIsImV4cG9ydCBjb25zdCBBUElfQkFTRV9VUkwgPSBcImh0dHBzOi8vYXBpLWtsYXJpdGkub25yZW5kZXIuY29tXCI7XG5cbmV4cG9ydCBjb25zdCBnZXRXZWJTb2NrZXRVcmwgPSAoYXBpVXJsOiBzdHJpbmcpID0+IHtcbiAgY29uc3Qgd3NVcmwgPSBhcGlVcmwucmVwbGFjZSgvXmh0dHBzLywgXCJ3c3NcIik7XG4gIHJldHVybiBgJHt3c1VybH0vY2hhbGxlbmdlcy93c2A7XG59O1xuXG5leHBvcnQgY29uc3QgY29uZmlnID0ge1xuICBhcGlVcmw6IEFQSV9CQVNFX1VSTCxcbiAgd3NVcmw6IGdldFdlYlNvY2tldFVybChBUElfQkFTRV9VUkwpLFxufTtcblxuZXhwb3J0IGRlZmF1bHQgY29uZmlnO1xuIiwiLy8gQ2hhbGxlbmdlIFN0YXR1cyBFbnVtXG5leHBvcnQgZW51bSBDaGFsbGVuZ2VTdGF0dXMge1xuICBBQ1RJVkUgPSBcImFjdGl2ZVwiLFxuICBQQVVTRUQgPSBcInBhdXNlZFwiLFxuICBDT01QTEVURUQgPSBcImNvbXBsZXRlZFwiLFxuICBTQ0hFRFVMRUQgPSBcInNjaGVkdWxlZFwiLFxuICBFWFBJUkVEID0gXCJleHBpcmVkXCIsXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ2hhbGxlbmdlIHtcbiAgaWQ6IHN0cmluZzsgLy8gQXNzdW1pbmcgSUQgZXhpc3RzXG4gIG5hbWU6IHN0cmluZztcbiAgZGVzY3JpcHRpb24/OiBzdHJpbmc7XG4gIGNvbXBsZXRlZD86IGJvb2xlYW47XG4gIGNoYWxsZW5nZV90eXBlOiBcInRpbWVfYmFzZWRcIiB8IFwidG9nZ2xlXCIgfCBzdHJpbmc7XG4gIHN0cmljdF9tb2RlPzogYm9vbGVhbjtcbiAgdGltZV9iYXNlZF9kZXRhaWxzPzoge1xuICAgIHN0YXJ0X2RhdGU6IHN0cmluZztcbiAgICBlbmRfZGF0ZTogc3RyaW5nO1xuICB9O1xuICB0b2dnbGVfZGV0YWlscz86IHtcbiAgICBpc19hY3RpdmU6IGJvb2xlYW47XG4gIH07XG4gIGRpc3RyYWN0aW9ucz86IEFycmF5PHsgdXJsOiBzdHJpbmc7IG5hbWU/OiBzdHJpbmcgfT47XG4gIFtrZXk6IHN0cmluZ106IGFueTtcbn1cblxuZXhwb3J0IGNvbnN0IGdldENoYWxsZW5nZVN0YXR1cyA9IChjaGFsbGVuZ2U6IENoYWxsZW5nZSk6IENoYWxsZW5nZVN0YXR1cyA9PiB7XG4gIGlmIChjaGFsbGVuZ2UuY29tcGxldGVkKSB7XG4gICAgcmV0dXJuIENoYWxsZW5nZVN0YXR1cy5DT01QTEVURUQ7XG4gIH1cblxuICBpZiAoXG4gICAgY2hhbGxlbmdlLmNoYWxsZW5nZV90eXBlID09PSBcInRpbWVfYmFzZWRcIiAmJlxuICAgIGNoYWxsZW5nZS50aW1lX2Jhc2VkX2RldGFpbHNcbiAgKSB7XG4gICAgY29uc3Qgbm93ID0gbmV3IERhdGUoKTtcbiAgICBjb25zdCBzdGFydFN0cmluZyA9IGNoYWxsZW5nZS50aW1lX2Jhc2VkX2RldGFpbHMuc3RhcnRfZGF0ZTtcbiAgICBjb25zdCBlbmRTdHJpbmcgPSBjaGFsbGVuZ2UudGltZV9iYXNlZF9kZXRhaWxzLmVuZF9kYXRlO1xuXG4gICAgY29uc3Qgc3RhcnQgPSBuZXcgRGF0ZShcbiAgICAgIHN0YXJ0U3RyaW5nLmVuZHNXaXRoKFwiWlwiKSA/IHN0YXJ0U3RyaW5nIDogYCR7c3RhcnRTdHJpbmd9WmBcbiAgICApO1xuICAgIGNvbnN0IGVuZCA9IG5ldyBEYXRlKGVuZFN0cmluZy5lbmRzV2l0aChcIlpcIikgPyBlbmRTdHJpbmcgOiBgJHtlbmRTdHJpbmd9WmApO1xuXG4gICAgaWYgKG5vdyA+IGVuZCkge1xuICAgICAgcmV0dXJuIENoYWxsZW5nZVN0YXR1cy5FWFBJUkVEO1xuICAgIH1cblxuICAgIGlmIChub3cgPCBzdGFydCkge1xuICAgICAgcmV0dXJuIENoYWxsZW5nZVN0YXR1cy5TQ0hFRFVMRUQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIENoYWxsZW5nZVN0YXR1cy5BQ1RJVkU7XG4gIH1cblxuICBpZiAoY2hhbGxlbmdlLmNoYWxsZW5nZV90eXBlID09PSBcInRvZ2dsZVwiICYmIGNoYWxsZW5nZS50b2dnbGVfZGV0YWlscykge1xuICAgIHJldHVybiBjaGFsbGVuZ2UudG9nZ2xlX2RldGFpbHMuaXNfYWN0aXZlXG4gICAgICA/IENoYWxsZW5nZVN0YXR1cy5BQ1RJVkVcbiAgICAgIDogQ2hhbGxlbmdlU3RhdHVzLlBBVVNFRDtcbiAgfVxuXG4gIHJldHVybiBDaGFsbGVuZ2VTdGF0dXMuUEFVU0VEO1xufTtcblxuZXhwb3J0IGNvbnN0IGlzQWN0aXZlID0gKGNoYWxsZW5nZTogQ2hhbGxlbmdlKSA9PlxuICBnZXRDaGFsbGVuZ2VTdGF0dXMoY2hhbGxlbmdlKSA9PT0gQ2hhbGxlbmdlU3RhdHVzLkFDVElWRTtcbmV4cG9ydCBjb25zdCBpc1BhdXNlZCA9IChjaGFsbGVuZ2U6IENoYWxsZW5nZSkgPT5cbiAgZ2V0Q2hhbGxlbmdlU3RhdHVzKGNoYWxsZW5nZSkgPT09IENoYWxsZW5nZVN0YXR1cy5QQVVTRUQ7XG5leHBvcnQgY29uc3QgaXNDb21wbGV0ZWQgPSAoY2hhbGxlbmdlOiBDaGFsbGVuZ2UpID0+XG4gIGdldENoYWxsZW5nZVN0YXR1cyhjaGFsbGVuZ2UpID09PSBDaGFsbGVuZ2VTdGF0dXMuQ09NUExFVEVEO1xuZXhwb3J0IGNvbnN0IGlzU2NoZWR1bGVkID0gKGNoYWxsZW5nZTogQ2hhbGxlbmdlKSA9PlxuICBnZXRDaGFsbGVuZ2VTdGF0dXMoY2hhbGxlbmdlKSA9PT0gQ2hhbGxlbmdlU3RhdHVzLlNDSEVEVUxFRDtcbmV4cG9ydCBjb25zdCBpc0V4cGlyZWQgPSAoY2hhbGxlbmdlOiBDaGFsbGVuZ2UpID0+XG4gIGdldENoYWxsZW5nZVN0YXR1cyhjaGFsbGVuZ2UpID09PSBDaGFsbGVuZ2VTdGF0dXMuRVhQSVJFRDtcblxuZXhwb3J0IGNvbnN0IHNob3VsZEJsb2NrID0gKGNoYWxsZW5nZTogQ2hhbGxlbmdlKSA9PiBpc0FjdGl2ZShjaGFsbGVuZ2UpO1xuXG5leHBvcnQgY29uc3QgaXNUZXJtaW5hbCA9IChjaGFsbGVuZ2U6IENoYWxsZW5nZSkgPT4ge1xuICBjb25zdCBzdGF0dXMgPSBnZXRDaGFsbGVuZ2VTdGF0dXMoY2hhbGxlbmdlKTtcbiAgcmV0dXJuIChcbiAgICBzdGF0dXMgPT09IENoYWxsZW5nZVN0YXR1cy5DT01QTEVURUQgfHwgc3RhdHVzID09PSBDaGFsbGVuZ2VTdGF0dXMuRVhQSVJFRFxuICApO1xufTtcblxuZXhwb3J0IGNvbnN0IGlzQWN0aW9uYWJsZSA9IChjaGFsbGVuZ2U6IENoYWxsZW5nZSkgPT4gIWlzVGVybWluYWwoY2hhbGxlbmdlKTtcblxuZXhwb3J0IGNvbnN0IGdldFN0YXR1c1RleHQgPSAoc3RhdHVzOiBDaGFsbGVuZ2VTdGF0dXMpID0+IHtcbiAgY29uc3Qgc3RhdHVzVGV4dE1hcDogUmVjb3JkPENoYWxsZW5nZVN0YXR1cywgc3RyaW5nPiA9IHtcbiAgICBbQ2hhbGxlbmdlU3RhdHVzLkFDVElWRV06IFwiQWN0aXZlXCIsXG4gICAgW0NoYWxsZW5nZVN0YXR1cy5QQVVTRURdOiBcIlBhdXNlZFwiLFxuICAgIFtDaGFsbGVuZ2VTdGF0dXMuQ09NUExFVEVEXTogXCJDb21wbGV0ZWRcIixcbiAgICBbQ2hhbGxlbmdlU3RhdHVzLlNDSEVEVUxFRF06IFwiU2NoZWR1bGVkXCIsXG4gICAgW0NoYWxsZW5nZVN0YXR1cy5FWFBJUkVEXTogXCJFeHBpcmVkXCIsXG4gIH07XG4gIHJldHVybiBzdGF0dXNUZXh0TWFwW3N0YXR1c10gfHwgXCJVbmtub3duXCI7XG59O1xuXG5leHBvcnQgY29uc3QgZ2V0U3RhdHVzQ2xhc3MgPSAoc3RhdHVzOiBDaGFsbGVuZ2VTdGF0dXMpID0+IHtcbiAgY29uc3Qgc3RhdHVzQ2xhc3NNYXA6IFJlY29yZDxDaGFsbGVuZ2VTdGF0dXMsIHN0cmluZz4gPSB7XG4gICAgW0NoYWxsZW5nZVN0YXR1cy5BQ1RJVkVdOiBcInN0YXR1cy1hY3RpdmVcIixcbiAgICBbQ2hhbGxlbmdlU3RhdHVzLlBBVVNFRF06IFwic3RhdHVzLXBhdXNlZFwiLFxuICAgIFtDaGFsbGVuZ2VTdGF0dXMuQ09NUExFVEVEXTogXCJzdGF0dXMtY29tcGxldGVkXCIsXG4gICAgW0NoYWxsZW5nZVN0YXR1cy5TQ0hFRFVMRURdOiBcInN0YXR1cy1zY2hlZHVsZWRcIixcbiAgICBbQ2hhbGxlbmdlU3RhdHVzLkVYUElSRURdOiBcInN0YXR1cy1leHBpcmVkXCIsXG4gIH07XG4gIHJldHVybiBzdGF0dXNDbGFzc01hcFtzdGF0dXNdIHx8IFwic3RhdHVzLXVua25vd25cIjtcbn07XG4iLCJpbXBvcnQgeyBDaGFsbGVuZ2UsIHNob3VsZEJsb2NrIH0gZnJvbSBcIi4vY2hhbGxlbmdlLXV0aWxzXCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgU3RvcmFnZVN0YXRlIHtcbiAgYWNjZXNzX3Rva2VuOiBzdHJpbmcgfCBudWxsO1xuICB1c2VybmFtZTogc3RyaW5nIHwgbnVsbDtcbiAgY2hhbGxlbmdlczogQ2hhbGxlbmdlW107XG4gIGNvbm5lY3Rpb25TdGF0dXM6IFwiY29ubmVjdGVkXCIgfCBcImRpc2Nvbm5lY3RlZFwiO1xufVxuXG5leHBvcnQgY29uc3QgU3RhdGVNYW5hZ2VyID0ge1xuICAvLyBDb25zdGFudHNcbiAgU1RPUkFHRV9LRVlTOiB7XG4gICAgQUNDRVNTX1RPS0VOOiBcImFjY2Vzc190b2tlblwiLFxuICAgIFVTRVJOQU1FOiBcInVzZXJuYW1lXCIsXG4gICAgQ0hBTExFTkdFUzogXCJjaGFsbGVuZ2VzXCIsXG4gICAgQ09OTkVDVElPTl9TVEFUVVM6IFwiY29ubmVjdGlvblN0YXR1c1wiLFxuICB9LFxuXG4gIC8vIFN0YXRlIEFjY2Vzc29yc1xuICBhc3luYyBnZXRTdGF0ZSgpOiBQcm9taXNlPFN0b3JhZ2VTdGF0ZT4ge1xuICAgIGNvbnN0IGRhdGEgPSBhd2FpdCBicm93c2VyLnN0b3JhZ2UubG9jYWwuZ2V0KFtcbiAgICAgIHRoaXMuU1RPUkFHRV9LRVlTLkFDQ0VTU19UT0tFTixcbiAgICAgIHRoaXMuU1RPUkFHRV9LRVlTLlVTRVJOQU1FLFxuICAgICAgdGhpcy5TVE9SQUdFX0tFWVMuQ0hBTExFTkdFUyxcbiAgICAgIHRoaXMuU1RPUkFHRV9LRVlTLkNPTk5FQ1RJT05fU1RBVFVTLFxuICAgIF0pO1xuICAgIHJldHVybiB7XG4gICAgICBhY2Nlc3NfdG9rZW46IChkYXRhW3RoaXMuU1RPUkFHRV9LRVlTLkFDQ0VTU19UT0tFTl0gYXMgc3RyaW5nKSB8fCBudWxsLFxuICAgICAgdXNlcm5hbWU6IChkYXRhW3RoaXMuU1RPUkFHRV9LRVlTLlVTRVJOQU1FXSBhcyBzdHJpbmcpIHx8IG51bGwsXG4gICAgICBjaGFsbGVuZ2VzOiAoZGF0YVt0aGlzLlNUT1JBR0VfS0VZUy5DSEFMTEVOR0VTXSBhcyBDaGFsbGVuZ2VbXSkgfHwgW10sXG4gICAgICBjb25uZWN0aW9uU3RhdHVzOlxuICAgICAgICAoZGF0YVt0aGlzLlNUT1JBR0VfS0VZUy5DT05ORUNUSU9OX1NUQVRVU10gYXNcbiAgICAgICAgICB8IFwiY29ubmVjdGVkXCJcbiAgICAgICAgICB8IFwiZGlzY29ubmVjdGVkXCIpIHx8IFwiZGlzY29ubmVjdGVkXCIsXG4gICAgfTtcbiAgfSxcblxuICBhc3luYyBzZXRDaGFsbGVuZ2VzKGNoYWxsZW5nZXM6IENoYWxsZW5nZVtdKSB7XG4gICAgYXdhaXQgYnJvd3Nlci5zdG9yYWdlLmxvY2FsLnNldCh7XG4gICAgICBbdGhpcy5TVE9SQUdFX0tFWVMuQ0hBTExFTkdFU106IGNoYWxsZW5nZXMsXG4gICAgfSk7XG4gIH0sXG5cbiAgYXN5bmMgc2V0Q29ubmVjdGlvblN0YXR1cyhpc0Nvbm5lY3RlZDogYm9vbGVhbikge1xuICAgIGNvbnNvbGUubG9nKFxuICAgICAgXCJTZXR0aW5nIGNvbm5lY3Rpb24gc3RhdHVzIHRvOlwiLFxuICAgICAgaXNDb25uZWN0ZWQgPyBcImNvbm5lY3RlZFwiIDogXCJkaXNjb25uZWN0ZWRcIlxuICAgICk7XG4gICAgYXdhaXQgYnJvd3Nlci5zdG9yYWdlLmxvY2FsLnNldCh7XG4gICAgICBbdGhpcy5TVE9SQUdFX0tFWVMuQ09OTkVDVElPTl9TVEFUVVNdOiBpc0Nvbm5lY3RlZFxuICAgICAgICA/IFwiY29ubmVjdGVkXCJcbiAgICAgICAgOiBcImRpc2Nvbm5lY3RlZFwiLFxuICAgIH0pO1xuICB9LFxuXG4gIGFzeW5jIHNldFNlc3Npb24oYWNjZXNzVG9rZW46IHN0cmluZywgdXNlcm5hbWU6IHN0cmluZykge1xuICAgIGF3YWl0IGJyb3dzZXIuc3RvcmFnZS5sb2NhbC5zZXQoe1xuICAgICAgW3RoaXMuU1RPUkFHRV9LRVlTLkFDQ0VTU19UT0tFTl06IGFjY2Vzc1Rva2VuLFxuICAgICAgW3RoaXMuU1RPUkFHRV9LRVlTLlVTRVJOQU1FXTogdXNlcm5hbWUsXG4gICAgfSk7XG4gIH0sXG5cbiAgYXN5bmMgY2xlYXJTZXNzaW9uKCkge1xuICAgIGF3YWl0IGJyb3dzZXIuc3RvcmFnZS5sb2NhbC5yZW1vdmUoW1xuICAgICAgdGhpcy5TVE9SQUdFX0tFWVMuQUNDRVNTX1RPS0VOLFxuICAgICAgdGhpcy5TVE9SQUdFX0tFWVMuVVNFUk5BTUUsXG4gICAgICB0aGlzLlNUT1JBR0VfS0VZUy5DSEFMTEVOR0VTLFxuICAgIF0pO1xuICB9LFxuXG4gIC8vIENoYWxsZW5nZSBIZWxwZXJzXG4gIGdldEFjdGl2ZUNoYWxsZW5nZXMoY2hhbGxlbmdlczogQ2hhbGxlbmdlW10pOiBDaGFsbGVuZ2VbXSB7XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KGNoYWxsZW5nZXMpKSByZXR1cm4gW107XG4gICAgcmV0dXJuIGNoYWxsZW5nZXMuZmlsdGVyKHNob3VsZEJsb2NrKTtcbiAgfSxcblxuICAvLyBVUkwgSGVscGVyc1xuICBub3JtYWxpemVVcmwodXJsOiBzdHJpbmcpIHtcbiAgICBpZiAoIXVybCkgcmV0dXJuIFwiXCI7XG4gICAgbGV0IG5vcm1hbGl6ZWQgPSB1cmwucmVwbGFjZSgvXmh0dHBzPzpcXC9cXC8vLCBcIlwiKTsgLy8gc3RyaXAgcHJvdG9jb2xcbiAgICBub3JtYWxpemVkID0gbm9ybWFsaXplZC5yZXBsYWNlKC9ed3d3XFwuLywgXCJcIik7IC8vIHN0cmlwIHd3d1xuICAgIG5vcm1hbGl6ZWQgPSBub3JtYWxpemVkLnJlcGxhY2UoL1xcLyQvLCBcIlwiKTsgLy8gc3RyaXAgdHJhaWxpbmcgc2xhc2hcbiAgICByZXR1cm4gbm9ybWFsaXplZC50b0xvd2VyQ2FzZSgpO1xuICB9LFxuXG4gIGdldEJsb2NrZWRVcmxzKGNoYWxsZW5nZXM6IENoYWxsZW5nZVtdKSB7XG4gICAgY29uc3QgYmxvY2tlZFVybHMgPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgICBjb25zdCBhY3RpdmVDaGFsbGVuZ2VzID0gY2hhbGxlbmdlcy5maWx0ZXIoc2hvdWxkQmxvY2spO1xuXG4gICAgYWN0aXZlQ2hhbGxlbmdlcy5mb3JFYWNoKChjaGFsbGVuZ2U6IENoYWxsZW5nZSkgPT4ge1xuICAgICAgaWYgKEFycmF5LmlzQXJyYXkoY2hhbGxlbmdlLmRpc3RyYWN0aW9ucykpIHtcbiAgICAgICAgY2hhbGxlbmdlLmRpc3RyYWN0aW9ucy5mb3JFYWNoKCh3ZWJzaXRlKSA9PiB7XG4gICAgICAgICAgaWYgKHdlYnNpdGU/LnVybCkge1xuICAgICAgICAgICAgYmxvY2tlZFVybHMuYWRkKHRoaXMubm9ybWFsaXplVXJsKHdlYnNpdGUudXJsKSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiBibG9ja2VkVXJscztcbiAgfSxcblxuICBpc1VybEJsb2NrZWQodXJsOiBzdHJpbmcsIGJsb2NrZWRVcmxzOiBTZXQ8c3RyaW5nPikge1xuICAgIGlmICghdXJsKSByZXR1cm4gZmFsc2U7XG4gICAgY29uc3Qgbm9ybWFsaXplZCA9IHRoaXMubm9ybWFsaXplVXJsKHVybCk7XG5cbiAgICAvLyBFeGFjdCBtYXRjaFxuICAgIGlmIChibG9ja2VkVXJscy5oYXMobm9ybWFsaXplZCkpIHJldHVybiB0cnVlO1xuXG4gICAgLy8gUGFyZW50L2NvbnRhaW5zIG1hdGNoXG4gICAgZm9yIChjb25zdCBibG9ja2VkIG9mIGJsb2NrZWRVcmxzKSB7XG4gICAgICBpZiAobm9ybWFsaXplZCA9PT0gYmxvY2tlZCkgcmV0dXJuIHRydWU7XG4gICAgICBpZiAobm9ybWFsaXplZC5zdGFydHNXaXRoKGJsb2NrZWQpKSByZXR1cm4gdHJ1ZTtcbiAgICAgIGlmIChub3JtYWxpemVkLmluY2x1ZGVzKGJsb2NrZWQpKSByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9LFxufTtcbiIsImltcG9ydCB7IGNvbmZpZyB9IGZyb20gXCJAL3V0aWxzL2NvbmZpZ1wiO1xuaW1wb3J0IHsgU3RhdGVNYW5hZ2VyIH0gZnJvbSBcIkAvdXRpbHMvc3RvcmFnZVwiO1xuaW1wb3J0IHsgQ2hhbGxlbmdlLCBzaG91bGRCbG9jayB9IGZyb20gXCJAL3V0aWxzL2NoYWxsZW5nZS11dGlsc1wiO1xuXG5sZXQgYmxvY2tlZFVybHMgPSBuZXcgU2V0PHN0cmluZz4oKTtcbmxldCB3c0Nvbm5lY3Rpb246IFdlYlNvY2tldCB8IG51bGwgPSBudWxsO1xubGV0IHJlY29ubmVjdFRpbWVvdXQ6IFJldHVyblR5cGU8dHlwZW9mIHNldFRpbWVvdXQ+IHwgbnVsbCA9IG51bGw7XG5cbi8vIEluaXRpYWxpemUgd2hlbiB0aGUgc2VydmljZSB3b3JrZXIgd2FrZXMgdXBcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUJhY2tncm91bmQoKCkgPT4ge1xuICBpbml0aWFsaXplRXh0ZW5zaW9uKCk7XG5cbiAgYnJvd3Nlci5ydW50aW1lLm9uSW5zdGFsbGVkLmFkZExpc3RlbmVyKCgpID0+IHtcbiAgICBjb25zb2xlLmxvZyhcIktsYXJpdGkgZXh0ZW5zaW9uIGluc3RhbGxlZFwiKTtcbiAgICBpbml0aWFsaXplRXh0ZW5zaW9uKCk7XG4gIH0pO1xuXG4gIGJyb3dzZXIucnVudGltZS5vblN0YXJ0dXAuYWRkTGlzdGVuZXIoKCkgPT4ge1xuICAgIGNvbnNvbGUubG9nKFwiS2xhcml0aSBleHRlbnNpb24gc3RhcnRpbmdcIik7XG4gICAgaW5pdGlhbGl6ZUV4dGVuc2lvbigpO1xuICB9KTtcblxuICAvLyBMaXN0ZW4gZm9yIG1lc3NhZ2VzXG4gIGJyb3dzZXIucnVudGltZS5vbk1lc3NhZ2UuYWRkTGlzdGVuZXIoKHJlcXVlc3QsIF9zZW5kZXIsIHNlbmRSZXNwb25zZSkgPT4ge1xuICAgIGlmIChyZXF1ZXN0LmFjdGlvbiA9PT0gXCJ1c2VyX2xvZ2dlZF9pblwiKSB7XG4gICAgICB1cGRhdGVDaGFsbGVuZ2VzQW5kQmxvY2tpbmcoKS50aGVuKCgpID0+IHtcbiAgICAgICAgY29ubmVjdFdlYlNvY2tldCgpO1xuICAgICAgICBjaGVja0FjdGl2ZVRhYigpO1xuICAgICAgICBzZW5kUmVzcG9uc2UoeyBzdWNjZXNzOiB0cnVlIH0pO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBpZiAocmVxdWVzdC5hY3Rpb24gPT09IFwidXNlcl9sb2dnZWRfb3V0XCIpIHtcbiAgICAgIGlmICh3c0Nvbm5lY3Rpb24pIHtcbiAgICAgICAgd3NDb25uZWN0aW9uLmNsb3NlKCk7XG4gICAgICAgIHdzQ29ubmVjdGlvbiA9IG51bGw7XG4gICAgICB9XG4gICAgICBpZiAocmVjb25uZWN0VGltZW91dCkge1xuICAgICAgICBjbGVhclRpbWVvdXQocmVjb25uZWN0VGltZW91dCk7XG4gICAgICAgIHJlY29ubmVjdFRpbWVvdXQgPSBudWxsO1xuICAgICAgfVxuICAgICAgYmxvY2tlZFVybHMuY2xlYXIoKTtcbiAgICAgIHNlbmRSZXNwb25zZSh7IHN1Y2Nlc3M6IHRydWUgfSk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBpZiAoXG4gICAgICByZXF1ZXN0LmFjdGlvbiA9PT0gXCJjaGFsbGVuZ2VzX3VwZGF0ZWRcIiAmJlxuICAgICAgQXJyYXkuaXNBcnJheShyZXF1ZXN0LmNoYWxsZW5nZXMpXG4gICAgKSB7XG4gICAgICB1cGRhdGVCbG9ja2luZ1J1bGVzKHJlcXVlc3QuY2hhbGxlbmdlcyk7XG4gICAgICBjaGVja0FjdGl2ZVRhYigpO1xuICAgICAgc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogdHJ1ZSB9KTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIGlmIChyZXF1ZXN0LmFjdGlvbiA9PT0gXCJyZWZyZXNoX2NoYWxsZW5nZXNcIikge1xuICAgICAgdXBkYXRlQ2hhbGxlbmdlc0FuZEJsb2NraW5nKCkudGhlbigoKSA9PiB7XG4gICAgICAgIHNlbmRSZXNwb25zZSh7IHN1Y2Nlc3M6IHRydWUgfSk7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIGlmIChyZXF1ZXN0LmFjdGlvbiA9PT0gXCJjaGVja19jb25uZWN0aW9uXCIpIHtcbiAgICAgIGlmICghd3NDb25uZWN0aW9uIHx8IHdzQ29ubmVjdGlvbi5yZWFkeVN0YXRlICE9PSBXZWJTb2NrZXQuT1BFTikge1xuICAgICAgICBjb25uZWN0V2ViU29ja2V0KCk7XG4gICAgICB9XG4gICAgICBjb25zdCBpc0Nvbm5lY3RlZCA9XG4gICAgICAgIHdzQ29ubmVjdGlvbiAmJiB3c0Nvbm5lY3Rpb24ucmVhZHlTdGF0ZSA9PT0gV2ViU29ja2V0Lk9QRU47XG4gICAgICBzZW5kUmVzcG9uc2UoeyBzdGF0dXM6IGlzQ29ubmVjdGVkID8gXCJjb25uZWN0ZWRcIiA6IFwiZGlzY29ubmVjdGVkXCIgfSk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH0pO1xuXG4gIC8vIEFsYXJtc1xuICBicm93c2VyLmFsYXJtcy5jcmVhdGUoXCJrZWVwQWxpdmVcIiwgeyBwZXJpb2RJbk1pbnV0ZXM6IDUgLyA2MCB9KTtcbiAgYnJvd3Nlci5hbGFybXMuY3JlYXRlKFwiY2hlY2tBY3RpdmVUYWJcIiwgeyBwZXJpb2RJbk1pbnV0ZXM6IDEwIC8gNjAgfSk7XG4gIGJyb3dzZXIuYWxhcm1zLmNyZWF0ZShcImNoZWNrVGltZWRDaGFsbGVuZ2VzXCIsIHsgcGVyaW9kSW5NaW51dGVzOiAxIH0pO1xuXG4gIGJyb3dzZXIuYWxhcm1zLm9uQWxhcm0uYWRkTGlzdGVuZXIoKGFsYXJtKSA9PiB7XG4gICAgaWYgKGFsYXJtLm5hbWUgPT09IFwia2VlcEFsaXZlXCIpIHtcbiAgICAgIGNvbnNvbGUubG9nKFwiS2VlcCBhbGl2ZSBhbGFybSB0cmlnZ2VyZWRcIik7XG4gICAgICBmZXRjaFN0YXRlRnJvbUFwaSgpO1xuICAgIH0gZWxzZSBpZiAoYWxhcm0ubmFtZSA9PT0gXCJjaGVja0FjdGl2ZVRhYlwiKSB7XG4gICAgICBjb25zb2xlLmxvZyhcIkNoZWNrIGFjdGl2ZSB0YWIgYWxhcm0gdHJpZ2dlcmVkXCIpO1xuICAgICAgY2hlY2tBY3RpdmVUYWIoKTtcbiAgICB9IGVsc2UgaWYgKGFsYXJtLm5hbWUgPT09IFwiY2hlY2tUaW1lZENoYWxsZW5nZXNcIikge1xuICAgICAgY29uc29sZS5sb2coXCJDaGVjayB0aW1lZCBjaGFsbGVuZ2VzIGFsYXJtIHRyaWdnZXJlZFwiKTtcbiAgICAgIFN0YXRlTWFuYWdlci5nZXRTdGF0ZSgpLnRoZW4oKHsgY2hhbGxlbmdlcyB9KSA9PiB7XG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KGNoYWxsZW5nZXMpKSB7XG4gICAgICAgICAgdXBkYXRlQmxvY2tpbmdSdWxlcyhjaGFsbGVuZ2VzKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9KTtcblxuICAvLyBUYWIgZXZlbnRzXG4gIGJyb3dzZXIudGFicy5vbkFjdGl2YXRlZC5hZGRMaXN0ZW5lcihhc3luYyAoYWN0aXZlSW5mbykgPT4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCB0YWIgPSBhd2FpdCBicm93c2VyLnRhYnMuZ2V0KGFjdGl2ZUluZm8udGFiSWQpO1xuICAgICAgYXdhaXQgY2hlY2tBbmRSZWRpcmVjdFRhYih0YWIpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKFwiRXJyb3IgaW4gdGFiIGFjdGl2YXRpb24gaGFuZGxlcjpcIiwgZXJyb3IpO1xuICAgIH1cbiAgfSk7XG5cbiAgYnJvd3Nlci53aW5kb3dzLm9uRm9jdXNDaGFuZ2VkLmFkZExpc3RlbmVyKCh3aW5kb3dJZCkgPT4ge1xuICAgIGNvbnNvbGUubG9nKFwiV2luZG93IGZvY3VzIGNoYW5nZWQ6XCIsIHdpbmRvd0lkKTtcbiAgICBpZiAod2luZG93SWQgPT09IGJyb3dzZXIud2luZG93cy5XSU5ET1dfSURfTk9ORSkgcmV0dXJuO1xuICAgIGJyb3dzZXIudGFicy5xdWVyeSh7IGFjdGl2ZTogdHJ1ZSwgd2luZG93SWQgfSkudGhlbigodGFicykgPT4ge1xuICAgICAgaWYgKCF0YWJzIHx8IHRhYnMubGVuZ3RoID09PSAwKSByZXR1cm47XG4gICAgICBjaGVja0FuZFJlZGlyZWN0VGFiKHRhYnNbMF0pO1xuICAgIH0pO1xuICB9KTtcblxuICBicm93c2VyLnRhYnMub25VcGRhdGVkLmFkZExpc3RlbmVyKCh0YWJJZCwgY2hhbmdlSW5mbywgdGFiKSA9PiB7XG4gICAgaWYgKCF0YWIgfHwgIXRhYi5hY3RpdmUpIHJldHVybjtcbiAgICBpZiAoIWNoYW5nZUluZm8udXJsICYmIGNoYW5nZUluZm8uc3RhdHVzICE9PSBcImxvYWRpbmdcIikgcmV0dXJuO1xuICAgIGNoZWNrQW5kUmVkaXJlY3RUYWIodGFiKTtcbiAgfSk7XG59KTtcblxuLy8gSW5pdGlhbGl6ZSBleHRlbnNpb25cbmFzeW5jIGZ1bmN0aW9uIGluaXRpYWxpemVFeHRlbnNpb24oKSB7XG4gIHRyeSB7XG4gICAgY29uc3QgeyBhY2Nlc3NfdG9rZW4gfSA9IGF3YWl0IFN0YXRlTWFuYWdlci5nZXRTdGF0ZSgpO1xuICAgIGlmIChhY2Nlc3NfdG9rZW4pIHtcbiAgICAgIGF3YWl0IHVwZGF0ZUNoYWxsZW5nZXNBbmRCbG9ja2luZygpO1xuICAgICAgY29ubmVjdFdlYlNvY2tldCgpO1xuICAgIH1cbiAgICBhd2FpdCBjaGVja0FjdGl2ZVRhYigpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgY29uc29sZS5lcnJvcihcIkluaXRpYWxpemF0aW9uIGVycm9yOlwiLCBlKTtcbiAgfVxufVxuXG4vLyBGZXRjaCBjaGFsbGVuZ2VzIGFuZCB1cGRhdGUgYmxvY2tpbmcgcnVsZXNcbmFzeW5jIGZ1bmN0aW9uIHVwZGF0ZUNoYWxsZW5nZXNBbmRCbG9ja2luZygpIHtcbiAgdHJ5IHtcbiAgICBjb25zdCB7IGFjY2Vzc190b2tlbiB9ID0gYXdhaXQgU3RhdGVNYW5hZ2VyLmdldFN0YXRlKCk7XG4gICAgaWYgKCFhY2Nlc3NfdG9rZW4pIHtcbiAgICAgIGNvbnNvbGUubG9nKFwiTm8gYWNjZXNzIHRva2VuLCBza2lwcGluZyBjaGFsbGVuZ2UgZmV0Y2hcIik7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChcbiAgICAgIGAke2NvbmZpZy5hcGlVcmx9L2NoYWxsZW5nZXMvbXktY2hhbGxlbmdlcz9za2lwPTAmbGltaXQ9MTAwYCxcbiAgICAgIHtcbiAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgIEF1dGhvcml6YXRpb246IGBCZWFyZXIgJHthY2Nlc3NfdG9rZW59YCxcbiAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgfSxcbiAgICAgIH1cbiAgICApO1xuXG4gICAgaWYgKCFyZXNwb25zZS5vaykge1xuICAgICAgY29uc3QgZXJyb3JUZXh0ID0gYXdhaXQgcmVzcG9uc2UudGV4dCgpO1xuICAgICAgY29uc29sZS5lcnJvcihcIkZhaWxlZCB0byBmZXRjaCBjaGFsbGVuZ2VzOlwiLCByZXNwb25zZS5zdGF0dXMsIGVycm9yVGV4dCk7XG5cbiAgICAgIGlmIChyZXNwb25zZS5zdGF0dXMgPT09IDQwMSB8fCByZXNwb25zZS5zdGF0dXMgPT09IDQwMykge1xuICAgICAgICBjb25zb2xlLmVycm9yKFwiQXV0aGVudGljYXRpb24gZmFpbGVkIC0gdG9rZW4gZXhwaXJlZCBvciBpbnZhbGlkXCIpO1xuICAgICAgICBhd2FpdCBTdGF0ZU1hbmFnZXIuY2xlYXJTZXNzaW9uKCk7XG4gICAgICAgIGlmICh3c0Nvbm5lY3Rpb24pIHtcbiAgICAgICAgICB3c0Nvbm5lY3Rpb24uY2xvc2UoKTtcbiAgICAgICAgICB3c0Nvbm5lY3Rpb24gPSBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGlmIChyZWNvbm5lY3RUaW1lb3V0KSB7XG4gICAgICAgICAgY2xlYXJUaW1lb3V0KHJlY29ubmVjdFRpbWVvdXQpO1xuICAgICAgICAgIHJlY29ubmVjdFRpbWVvdXQgPSBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGJsb2NrZWRVcmxzLmNsZWFyKCk7XG4gICAgICB9XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgY2hhbGxlbmdlcyA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcbiAgICBhd2FpdCBTdGF0ZU1hbmFnZXIuc2V0Q2hhbGxlbmdlcyhjaGFsbGVuZ2VzKTtcbiAgICB1cGRhdGVCbG9ja2luZ1J1bGVzKGNoYWxsZW5nZXMpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoXCJFcnJvciBmZXRjaGluZyBjaGFsbGVuZ2VzOlwiLCBlcnJvcik7XG4gIH1cbn1cblxuLy8gVXBkYXRlIGJsb2NraW5nIHJ1bGVzIGJhc2VkIG9uIGNoYWxsZW5nZXNcbmZ1bmN0aW9uIHVwZGF0ZUJsb2NraW5nUnVsZXMoY2hhbGxlbmdlczogQ2hhbGxlbmdlW10pIHtcbiAgYmxvY2tlZFVybHMgPSBTdGF0ZU1hbmFnZXIuZ2V0QmxvY2tlZFVybHMoY2hhbGxlbmdlcyk7XG4gIGNvbnNvbGUubG9nKFxuICAgIGBVcGRhdGVkIGJsb2NraW5nIHJ1bGVzOiAke2Jsb2NrZWRVcmxzLnNpemV9IFVSTHMgYmxvY2tlZCBmcm9tICR7XG4gICAgICBjaGFsbGVuZ2VzLmZpbHRlcihzaG91bGRCbG9jaykubGVuZ3RoXG4gICAgfSBhY3RpdmUgY2hhbGxlbmdlc2BcbiAgKTtcbiAgY2hlY2tBY3RpdmVUYWIoKTtcbn1cblxuLy8gQ2hlY2sgaWYgYSBVUkwgaXMgYmxvY2tlZFxuZnVuY3Rpb24gaXNVcmxCbG9ja2VkKHVybDogc3RyaW5nKSB7XG4gIHJldHVybiBTdGF0ZU1hbmFnZXIuaXNVcmxCbG9ja2VkKHVybCwgYmxvY2tlZFVybHMpO1xufVxuXG4vLyBIZWxwZXIgdG8gY2hlY2sgYSBzaW5nbGUgdGFiIGFuZCByZWRpcmVjdCBpZiBibG9ja2VkXG4vLyBhc3luYyBmdW5jdGlvbiBjaGVja0FuZFJlZGlyZWN0VGFiKHRhYjogYnJvd3Nlci5UYWJzLlRhYikge1xuXG5hc3luYyBmdW5jdGlvbiBjaGVja0FuZFJlZGlyZWN0VGFiKHRhYjogeyBpZD86IG51bWJlcjsgdXJsPzogc3RyaW5nIH0pIHtcbiAgaWYgKCF0YWIgfHwgIXRhYi51cmwpIHJldHVybjtcbiAgY29uc3QgdXJsID0gdGFiLnVybDtcblxuICAvLyBTa2lwIGludGVybmFsIGNocm9tZSBwYWdlc1xuICBpZiAodXJsLnN0YXJ0c1dpdGgoXCJjaHJvbWU6Ly9cIikgfHwgdXJsLnN0YXJ0c1dpdGgoXCJjaHJvbWUtZXh0ZW5zaW9uOi8vXCIpKVxuICAgIHJldHVybjtcblxuICBpZiAoaXNVcmxCbG9ja2VkKHVybCkpIHtcbiAgICB0cnkge1xuICAgICAgYXdhaXQgYnJvd3Nlci50YWJzLnVwZGF0ZSh0YWIuaWQhLCB7IHVybDogXCJodHRwOi8va2xhcml0aS5zby9sb2NrXCIgfSk7XG4gICAgICBjb25zb2xlLmxvZyhcIlJlZGlyZWN0ZWQgYmxvY2tlZCB0YWI6XCIsIHVybCk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBjb25zb2xlLmVycm9yKFwiRXJyb3IgcmVkaXJlY3RpbmcgYmxvY2tlZCB0YWI6XCIsIGVycik7XG4gICAgfVxuICB9XG59XG5cbi8vIENoZWNrIG9ubHkgdGhlIGFjdGl2ZSB0YWIgYW5kIGNsb3NlIGl0IGlmIGJsb2NrZWRcbmFzeW5jIGZ1bmN0aW9uIGNoZWNrQWN0aXZlVGFiKCkge1xuICB0cnkge1xuICAgIGNvbnN0IHRhYnMgPSBhd2FpdCBicm93c2VyLnRhYnMucXVlcnkoe1xuICAgICAgYWN0aXZlOiB0cnVlLFxuICAgICAgY3VycmVudFdpbmRvdzogdHJ1ZSxcbiAgICB9KTtcbiAgICBpZiAoIXRhYnMgfHwgdGFicy5sZW5ndGggPT09IDApIHJldHVybjtcbiAgICBhd2FpdCBjaGVja0FuZFJlZGlyZWN0VGFiKHRhYnNbMF0pO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoXCJFcnJvciBjaGVja2luZyBhY3RpdmUgdGFiOlwiLCBlcnJvcik7XG4gIH1cbn1cblxuLy8gS2VlcC1hbGl2ZTogbGlnaHR3ZWlnaHQgc3RhdGUgcmVmcmVzaFxuYXN5bmMgZnVuY3Rpb24gZmV0Y2hTdGF0ZUZyb21BcGkoKSB7XG4gIHRyeSB7XG4gICAgY29uc3QgeyBhY2Nlc3NfdG9rZW4gfSA9IGF3YWl0IFN0YXRlTWFuYWdlci5nZXRTdGF0ZSgpO1xuICAgIGlmIChhY2Nlc3NfdG9rZW4pIHtcbiAgICAgIGF3YWl0IHVwZGF0ZUNoYWxsZW5nZXNBbmRCbG9ja2luZygpO1xuICAgICAgaWYgKCF3c0Nvbm5lY3Rpb24gfHwgd3NDb25uZWN0aW9uLnJlYWR5U3RhdGUgIT09IFdlYlNvY2tldC5PUEVOKSB7XG4gICAgICAgIGNvbm5lY3RXZWJTb2NrZXQoKTtcbiAgICAgIH1cbiAgICB9XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcihcIkVycm9yIGZldGNoaW5nIHN0YXRlIGZyb20gQVBJOlwiLCBlcnJvcik7XG4gIH1cbn1cblxuLy8gV2ViU29ja2V0IGNvbm5lY3Rpb24gZm9yIHJlYWwtdGltZSBjaGFsbGVuZ2UgdXBkYXRlc1xuZnVuY3Rpb24gY29ubmVjdFdlYlNvY2tldChyZXRyeUNvdW50ID0gMCkge1xuICB0cnkge1xuICAgIGlmICh3c0Nvbm5lY3Rpb24gJiYgd3NDb25uZWN0aW9uLnJlYWR5U3RhdGUgPT09IFdlYlNvY2tldC5PUEVOKSByZXR1cm47XG4gICAgaWYgKHdzQ29ubmVjdGlvbikgd3NDb25uZWN0aW9uLmNsb3NlKCk7XG5cbiAgICB3c0Nvbm5lY3Rpb24gPSBuZXcgV2ViU29ja2V0KGNvbmZpZy53c1VybCk7XG5cbiAgICB3c0Nvbm5lY3Rpb24ub25vcGVuID0gKCkgPT4ge1xuICAgICAgY29uc29sZS5sb2coXCJDaGFsbGVuZ2UgV2ViU29ja2V0IGNvbm5lY3RlZFwiKTtcbiAgICAgIFN0YXRlTWFuYWdlci5zZXRDb25uZWN0aW9uU3RhdHVzKHRydWUpO1xuICAgIH07XG5cbiAgICB3c0Nvbm5lY3Rpb24ub25tZXNzYWdlID0gKGV2ZW50KSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBkYXRhID0gSlNPTi5wYXJzZShldmVudC5kYXRhKTtcbiAgICAgICAgaWYgKFxuICAgICAgICAgIGRhdGEudHlwZSA9PT0gXCJjaGFsbGVuZ2VfdG9nZ2xlZFwiIHx8XG4gICAgICAgICAgZGF0YS50eXBlID09PSBcImNoYWxsZW5nZV91cGRhdGVkXCJcbiAgICAgICAgKSB7XG4gICAgICAgICAgdXBkYXRlQ2hhbGxlbmdlc0FuZEJsb2NraW5nKCkudGhlbigoKSA9PiBjaGVja0FjdGl2ZVRhYigpKTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihcIkVycm9yIHBhcnNpbmcgV2ViU29ja2V0IG1lc3NhZ2U6XCIsIGVycm9yKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgd3NDb25uZWN0aW9uLm9uZXJyb3IgPSAoZXJyb3IpID0+IHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJDaGFsbGVuZ2UgV2ViU29ja2V0IGVycm9yOlwiLCBlcnJvcik7XG4gICAgICBTdGF0ZU1hbmFnZXIuc2V0Q29ubmVjdGlvblN0YXR1cyhmYWxzZSk7XG4gICAgfTtcblxuICAgIHdzQ29ubmVjdGlvbi5vbmNsb3NlID0gKCkgPT4ge1xuICAgICAgY29uc29sZS5sb2coXCJXZWJTb2NrZXQgZGlzY29ubmVjdGVkXCIpO1xuICAgICAgd3NDb25uZWN0aW9uID0gbnVsbDtcbiAgICAgIFN0YXRlTWFuYWdlci5zZXRDb25uZWN0aW9uU3RhdHVzKGZhbHNlKTtcblxuICAgICAgaWYgKHJlY29ubmVjdFRpbWVvdXQpIGNsZWFyVGltZW91dChyZWNvbm5lY3RUaW1lb3V0KTtcblxuICAgICAgY29uc3QgYmFzZURlbGF5ID0gTWF0aC5taW4oMzAwMDAsIE1hdGgucG93KDIsIHJldHJ5Q291bnQpICogMTAwMCk7XG4gICAgICBjb25zdCBqaXR0ZXIgPSBNYXRoLnJhbmRvbSgpICogMTAwMDtcbiAgICAgIGNvbnN0IGRlbGF5ID0gYmFzZURlbGF5ICsgaml0dGVyO1xuXG4gICAgICBjb25zb2xlLmxvZyhgUmVjb25uZWN0aW5nIGluICR7TWF0aC5yb3VuZChkZWxheSl9bXMuLi5gKTtcblxuICAgICAgcmVjb25uZWN0VGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBTdGF0ZU1hbmFnZXIuZ2V0U3RhdGUoKS50aGVuKCh7IGFjY2Vzc190b2tlbiB9KSA9PiB7XG4gICAgICAgICAgaWYgKGFjY2Vzc190b2tlbikgY29ubmVjdFdlYlNvY2tldChyZXRyeUNvdW50ICsgMSk7XG4gICAgICAgIH0pO1xuICAgICAgfSwgZGVsYXkpO1xuICAgIH07XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcihcIkVycm9yIGNyZWF0aW5nIGNoYWxsZW5nZSBXZWJTb2NrZXQ6XCIsIGVycm9yKTtcbiAgICBTdGF0ZU1hbmFnZXIuc2V0Q29ubmVjdGlvblN0YXR1cyhmYWxzZSk7XG4gIH1cbn1cbiIsIi8vIHNyYy9pbmRleC50c1xudmFyIF9NYXRjaFBhdHRlcm4gPSBjbGFzcyB7XG4gIGNvbnN0cnVjdG9yKG1hdGNoUGF0dGVybikge1xuICAgIGlmIChtYXRjaFBhdHRlcm4gPT09IFwiPGFsbF91cmxzPlwiKSB7XG4gICAgICB0aGlzLmlzQWxsVXJscyA9IHRydWU7XG4gICAgICB0aGlzLnByb3RvY29sTWF0Y2hlcyA9IFsuLi5fTWF0Y2hQYXR0ZXJuLlBST1RPQ09MU107XG4gICAgICB0aGlzLmhvc3RuYW1lTWF0Y2ggPSBcIipcIjtcbiAgICAgIHRoaXMucGF0aG5hbWVNYXRjaCA9IFwiKlwiO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBncm91cHMgPSAvKC4qKTpcXC9cXC8oLio/KShcXC8uKikvLmV4ZWMobWF0Y2hQYXR0ZXJuKTtcbiAgICAgIGlmIChncm91cHMgPT0gbnVsbClcbiAgICAgICAgdGhyb3cgbmV3IEludmFsaWRNYXRjaFBhdHRlcm4obWF0Y2hQYXR0ZXJuLCBcIkluY29ycmVjdCBmb3JtYXRcIik7XG4gICAgICBjb25zdCBbXywgcHJvdG9jb2wsIGhvc3RuYW1lLCBwYXRobmFtZV0gPSBncm91cHM7XG4gICAgICB2YWxpZGF0ZVByb3RvY29sKG1hdGNoUGF0dGVybiwgcHJvdG9jb2wpO1xuICAgICAgdmFsaWRhdGVIb3N0bmFtZShtYXRjaFBhdHRlcm4sIGhvc3RuYW1lKTtcbiAgICAgIHZhbGlkYXRlUGF0aG5hbWUobWF0Y2hQYXR0ZXJuLCBwYXRobmFtZSk7XG4gICAgICB0aGlzLnByb3RvY29sTWF0Y2hlcyA9IHByb3RvY29sID09PSBcIipcIiA/IFtcImh0dHBcIiwgXCJodHRwc1wiXSA6IFtwcm90b2NvbF07XG4gICAgICB0aGlzLmhvc3RuYW1lTWF0Y2ggPSBob3N0bmFtZTtcbiAgICAgIHRoaXMucGF0aG5hbWVNYXRjaCA9IHBhdGhuYW1lO1xuICAgIH1cbiAgfVxuICBpbmNsdWRlcyh1cmwpIHtcbiAgICBpZiAodGhpcy5pc0FsbFVybHMpXG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICBjb25zdCB1ID0gdHlwZW9mIHVybCA9PT0gXCJzdHJpbmdcIiA/IG5ldyBVUkwodXJsKSA6IHVybCBpbnN0YW5jZW9mIExvY2F0aW9uID8gbmV3IFVSTCh1cmwuaHJlZikgOiB1cmw7XG4gICAgcmV0dXJuICEhdGhpcy5wcm90b2NvbE1hdGNoZXMuZmluZCgocHJvdG9jb2wpID0+IHtcbiAgICAgIGlmIChwcm90b2NvbCA9PT0gXCJodHRwXCIpXG4gICAgICAgIHJldHVybiB0aGlzLmlzSHR0cE1hdGNoKHUpO1xuICAgICAgaWYgKHByb3RvY29sID09PSBcImh0dHBzXCIpXG4gICAgICAgIHJldHVybiB0aGlzLmlzSHR0cHNNYXRjaCh1KTtcbiAgICAgIGlmIChwcm90b2NvbCA9PT0gXCJmaWxlXCIpXG4gICAgICAgIHJldHVybiB0aGlzLmlzRmlsZU1hdGNoKHUpO1xuICAgICAgaWYgKHByb3RvY29sID09PSBcImZ0cFwiKVxuICAgICAgICByZXR1cm4gdGhpcy5pc0Z0cE1hdGNoKHUpO1xuICAgICAgaWYgKHByb3RvY29sID09PSBcInVyblwiKVxuICAgICAgICByZXR1cm4gdGhpcy5pc1Vybk1hdGNoKHUpO1xuICAgIH0pO1xuICB9XG4gIGlzSHR0cE1hdGNoKHVybCkge1xuICAgIHJldHVybiB1cmwucHJvdG9jb2wgPT09IFwiaHR0cDpcIiAmJiB0aGlzLmlzSG9zdFBhdGhNYXRjaCh1cmwpO1xuICB9XG4gIGlzSHR0cHNNYXRjaCh1cmwpIHtcbiAgICByZXR1cm4gdXJsLnByb3RvY29sID09PSBcImh0dHBzOlwiICYmIHRoaXMuaXNIb3N0UGF0aE1hdGNoKHVybCk7XG4gIH1cbiAgaXNIb3N0UGF0aE1hdGNoKHVybCkge1xuICAgIGlmICghdGhpcy5ob3N0bmFtZU1hdGNoIHx8ICF0aGlzLnBhdGhuYW1lTWF0Y2gpXG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgY29uc3QgaG9zdG5hbWVNYXRjaFJlZ2V4cyA9IFtcbiAgICAgIHRoaXMuY29udmVydFBhdHRlcm5Ub1JlZ2V4KHRoaXMuaG9zdG5hbWVNYXRjaCksXG4gICAgICB0aGlzLmNvbnZlcnRQYXR0ZXJuVG9SZWdleCh0aGlzLmhvc3RuYW1lTWF0Y2gucmVwbGFjZSgvXlxcKlxcLi8sIFwiXCIpKVxuICAgIF07XG4gICAgY29uc3QgcGF0aG5hbWVNYXRjaFJlZ2V4ID0gdGhpcy5jb252ZXJ0UGF0dGVyblRvUmVnZXgodGhpcy5wYXRobmFtZU1hdGNoKTtcbiAgICByZXR1cm4gISFob3N0bmFtZU1hdGNoUmVnZXhzLmZpbmQoKHJlZ2V4KSA9PiByZWdleC50ZXN0KHVybC5ob3N0bmFtZSkpICYmIHBhdGhuYW1lTWF0Y2hSZWdleC50ZXN0KHVybC5wYXRobmFtZSk7XG4gIH1cbiAgaXNGaWxlTWF0Y2godXJsKSB7XG4gICAgdGhyb3cgRXJyb3IoXCJOb3QgaW1wbGVtZW50ZWQ6IGZpbGU6Ly8gcGF0dGVybiBtYXRjaGluZy4gT3BlbiBhIFBSIHRvIGFkZCBzdXBwb3J0XCIpO1xuICB9XG4gIGlzRnRwTWF0Y2godXJsKSB7XG4gICAgdGhyb3cgRXJyb3IoXCJOb3QgaW1wbGVtZW50ZWQ6IGZ0cDovLyBwYXR0ZXJuIG1hdGNoaW5nLiBPcGVuIGEgUFIgdG8gYWRkIHN1cHBvcnRcIik7XG4gIH1cbiAgaXNVcm5NYXRjaCh1cmwpIHtcbiAgICB0aHJvdyBFcnJvcihcIk5vdCBpbXBsZW1lbnRlZDogdXJuOi8vIHBhdHRlcm4gbWF0Y2hpbmcuIE9wZW4gYSBQUiB0byBhZGQgc3VwcG9ydFwiKTtcbiAgfVxuICBjb252ZXJ0UGF0dGVyblRvUmVnZXgocGF0dGVybikge1xuICAgIGNvbnN0IGVzY2FwZWQgPSB0aGlzLmVzY2FwZUZvclJlZ2V4KHBhdHRlcm4pO1xuICAgIGNvbnN0IHN0YXJzUmVwbGFjZWQgPSBlc2NhcGVkLnJlcGxhY2UoL1xcXFxcXCovZywgXCIuKlwiKTtcbiAgICByZXR1cm4gUmVnRXhwKGBeJHtzdGFyc1JlcGxhY2VkfSRgKTtcbiAgfVxuICBlc2NhcGVGb3JSZWdleChzdHJpbmcpIHtcbiAgICByZXR1cm4gc3RyaW5nLnJlcGxhY2UoL1suKis/XiR7fSgpfFtcXF1cXFxcXS9nLCBcIlxcXFwkJlwiKTtcbiAgfVxufTtcbnZhciBNYXRjaFBhdHRlcm4gPSBfTWF0Y2hQYXR0ZXJuO1xuTWF0Y2hQYXR0ZXJuLlBST1RPQ09MUyA9IFtcImh0dHBcIiwgXCJodHRwc1wiLCBcImZpbGVcIiwgXCJmdHBcIiwgXCJ1cm5cIl07XG52YXIgSW52YWxpZE1hdGNoUGF0dGVybiA9IGNsYXNzIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihtYXRjaFBhdHRlcm4sIHJlYXNvbikge1xuICAgIHN1cGVyKGBJbnZhbGlkIG1hdGNoIHBhdHRlcm4gXCIke21hdGNoUGF0dGVybn1cIjogJHtyZWFzb259YCk7XG4gIH1cbn07XG5mdW5jdGlvbiB2YWxpZGF0ZVByb3RvY29sKG1hdGNoUGF0dGVybiwgcHJvdG9jb2wpIHtcbiAgaWYgKCFNYXRjaFBhdHRlcm4uUFJPVE9DT0xTLmluY2x1ZGVzKHByb3RvY29sKSAmJiBwcm90b2NvbCAhPT0gXCIqXCIpXG4gICAgdGhyb3cgbmV3IEludmFsaWRNYXRjaFBhdHRlcm4oXG4gICAgICBtYXRjaFBhdHRlcm4sXG4gICAgICBgJHtwcm90b2NvbH0gbm90IGEgdmFsaWQgcHJvdG9jb2wgKCR7TWF0Y2hQYXR0ZXJuLlBST1RPQ09MUy5qb2luKFwiLCBcIil9KWBcbiAgICApO1xufVxuZnVuY3Rpb24gdmFsaWRhdGVIb3N0bmFtZShtYXRjaFBhdHRlcm4sIGhvc3RuYW1lKSB7XG4gIGlmIChob3N0bmFtZS5pbmNsdWRlcyhcIjpcIikpXG4gICAgdGhyb3cgbmV3IEludmFsaWRNYXRjaFBhdHRlcm4obWF0Y2hQYXR0ZXJuLCBgSG9zdG5hbWUgY2Fubm90IGluY2x1ZGUgYSBwb3J0YCk7XG4gIGlmIChob3N0bmFtZS5pbmNsdWRlcyhcIipcIikgJiYgaG9zdG5hbWUubGVuZ3RoID4gMSAmJiAhaG9zdG5hbWUuc3RhcnRzV2l0aChcIiouXCIpKVxuICAgIHRocm93IG5ldyBJbnZhbGlkTWF0Y2hQYXR0ZXJuKFxuICAgICAgbWF0Y2hQYXR0ZXJuLFxuICAgICAgYElmIHVzaW5nIGEgd2lsZGNhcmQgKCopLCBpdCBtdXN0IGdvIGF0IHRoZSBzdGFydCBvZiB0aGUgaG9zdG5hbWVgXG4gICAgKTtcbn1cbmZ1bmN0aW9uIHZhbGlkYXRlUGF0aG5hbWUobWF0Y2hQYXR0ZXJuLCBwYXRobmFtZSkge1xuICByZXR1cm47XG59XG5leHBvcnQge1xuICBJbnZhbGlkTWF0Y2hQYXR0ZXJuLFxuICBNYXRjaFBhdHRlcm5cbn07XG4iXSwibmFtZXMiOlsiYnJvd3NlciIsImJsb2NrZWRVcmxzIl0sIm1hcHBpbmdzIjoiOztBQUNBLFdBQVMsaUJBQWlCLEtBQUs7QUFDOUIsUUFBSSxPQUFPLFFBQVEsT0FBTyxRQUFRLFdBQVksUUFBTyxFQUFFLE1BQU0sSUFBRztBQUNoRSxXQUFPO0FBQUEsRUFDUjtBQ0hPLFFBQU1BLFlBQVUsV0FBVyxTQUFTLFNBQVMsS0FDaEQsV0FBVyxVQUNYLFdBQVc7QUNXZixRQUFNLFVBQVU7QUNkVCxRQUFNLGVBQWU7QUFFckIsUUFBTSxrQkFBa0Is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QUFLLHNCQUFzQixLQUFLLGNBQWMsUUFBUSxTQUFTLEVBQUUsQ0FBQztBQUFBLE1BQ3hFO0FBQ0ksWUFBTSxxQkFBcUIsS0FBSyxzQkFBc0IsS0FBSyxhQUFhO0FBQ3hFLGFBQU8sQ0FBQyxDQUFDLG9CQUFvQixLQUFLLENBQUMsVUFBVSxNQUFNLEtBQUssSUFBSSxRQUFRLENBQUMsS0FBSyxtQkFBbUIsS0FBSyxJQUFJLFFBQVE7QUFBQSxJQUNoSDtBQUFBLElBQ0EsWUFBWSxLQUFLO0FBQ2YsWUFBTSxNQUFNLHFFQUFxRTtBQUFBLElBQ25GO0FBQUEsSUFDQSxXQUFXLEtBQUs7QUFDZCxZQUFNLE1BQU0sb0VBQW9FO0FBQUEsSUFDbEY7QUFBQSxJQUNBLFdBQVcsS0FBSztBQUNkLFlBQU0sTUFBTSxvRUFBb0U7QUFBQSxJQUNsRjtBQUFBLElBQ0Esc0JBQXNCLFNBQVM7QUFDN0IsWUFBTSxVQUFVLEtBQUssZUFBZSxPQUFPO0FBQzNDLFlBQU0sZ0JBQWdCLFFBQVEsUUFBUSxTQUFTLElBQUk7QUFDbkQsYUFBTyxPQUFPLElBQUksYUFBYSxHQUFHO0FBQUEsSUFDcEM7QUFBQSxJQUNBLGVBQWUsUUFBUTtBQUNyQixhQUFPLE9BQU8sUUFBUSx1QkFBdUIsTUFBTTtBQUFBLElBQ3JEO0FBQUEsRUFDRjtBQUNBLE1BQUksZUFBZTtBQUNuQixlQUFhLFlBQVksQ0FBQyxRQUFRLFNBQVMsUUFBUSxPQUFPLEtBQUs7QUFDL0QsTUFBSSxzQkFBc0IsY0FBYyxNQUFNO0FBQUEsSUFDNUMsWUFBWSxjQUFjLFFBQVE7QUFDaEMsWUFBTSwwQkFBMEIsWUFBWSxNQUFNLE1BQU0sRUFBRTtBQUFBLElBQzVEO0FBQUEsRUFDRjtBQUNBLFdBQVMsaUJBQWlCLGNBQWMsVUFBVTtBQUNoRCxRQUFJLENBQUMsYUFBYSxVQUFVLFNBQVMsUUFBUSxLQUFLLGFBQWE7QUFDN0QsWUFBTSxJQUFJO0FBQUEsUUFDUjtBQUFBLFFBQ0EsR0FBRyxRQUFRLDBCQUEwQixhQUFhLFVBQVUsS0FBSyxJQUFJLENBQUM7QUFBQSxNQUM1RTtBQUFBLEVBQ0E7QUFDQSxXQUFTLGlCQUFpQixjQUFjLFVBQVU7QUFDaEQsUUFBSSxTQUFTLFNBQVMsR0FBRztBQUN2QixZQUFNLElBQUksb0JBQW9CLGNBQWMsZ0NBQWdDO0FBQzlFLFFBQUksU0FBUyxTQUFTLEdBQUcsS0FBSyxTQUFTLFNBQVMsS0FBSyxDQUFDLFNBQVMsV0FBVyxJQUFJO0FBQzVFLFlBQU0sSUFBSTtBQUFBLFFBQ1I7QUFBQSxRQUNBO0FBQUEsTUFDTjtBQUFBLEVBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OyIsInhfZ29vZ2xlX2lnbm9yZUxpc3QiOlswLDEsMiw3XX0=
