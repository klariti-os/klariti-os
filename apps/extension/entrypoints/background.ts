const API_URL = "http://localhost:4200";

interface Intent {
  id: string;
  name: string;
  goal: string;
  is_active: boolean;
}

/** Fetch the session cookie to get auth, then call an API endpoint */
async function apiFetch(path: string, options: RequestInit = {}) {
  return fetch(`${API_URL}${path}`, {
    credentials: "include",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });
}

/** Classify a URL via the API */
async function classifyUrl(url: string): Promise<string | null> {
  try {
    const res = await apiFetch("/api/classify/", {
      method: "POST",
      body: JSON.stringify({ url }),
    });
    if (!res.ok) {
      console.warn("[klariti] classify failed:", res.status, await res.text());
      return null;
    }
    const data = await res.json();
    console.log("[klariti] classify result:", url, data);
    return data?.category ?? null;
  } catch (err) {
    console.error("[klariti] classify error:", err);
    return null;
  }
}

/** Get the currently active intent's goal */
async function getActiveGoal(): Promise<string | null> {
  try {
    const res = await apiFetch("/api/intents/");
    if (!res.ok) return null;
    const intents: Intent[] = await res.json();
    const active = intents.find((i) => i.is_active);
    return active?.goal ?? null;
  } catch {
    return null;
  }
}

export default defineBackground(() => {
  browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type === "CLASSIFY_URL" && message.url) {
      classifyUrl(message.url).then((category) => sendResponse({ category }));
      return true; // keep channel open for async response
    }

    if (message?.type === "GET_ACTIVE_GOAL") {
      getActiveGoal().then((goal) => sendResponse({ goal }));
      return true;
    }
  });
});
