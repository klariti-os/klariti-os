/**
 * YouTube content script — runs on youtube.com.
 *
 * On the homepage it scans rendered video elements, sends each URL to the
 * background script for classification via the API, and then applies the
 * active intent's goal mode:
 *
 *   FOCUS  → red overlay on ALL videos
 *   WORK   → same as FOCUS
 *   STUDY  → red overlay on videos whose category ≠ Education
 *   CASUAL → allow everything
 */

export default defineContentScript({
  matches: ["*://*.youtube.com/*"],
  runAt: "document_idle",

  async main() {
    // Only act on the homepage / feed
    const isHomepage = () =>
      location.pathname === "/" || location.pathname === "/feed/subscriptions";

    if (!isHomepage()) return;

    // Cache of already-classified video URLs → category
    const cache = new Map<string, string | null>();
    // Set of video URLs currently being classified (in-flight)
    const inflight = new Set<string>();
    // Set of element IDs already processed
    let processedIds = new Set<string>();
    let processCounter = 0;
    // Track the last-known goal so we can detect changes
    let lastKnownGoal: string | null = null;

    function getProcessId(el: Element): string {
      let id = el.getAttribute("data-klariti-id");
      if (!id) {
        id = `klariti-${processCounter++}`;
        el.setAttribute("data-klariti-id", id);
      }
      return id;
    }

    /** Extract the video URL from a YouTube renderer element (desktop + mobile) */
    function getVideoUrl(el: Element): string | null {
      // Desktop classic: a#thumbnail, a.ytd-thumbnail
      // Desktop lockup:   a.yt-lockup-view-model__content-image
      // Mobile:           a.media-item-thumbnail-container, a[href*="/watch"]
      const anchor = el.querySelector(
        "a#thumbnail, a.ytd-thumbnail, a.yt-lockup-view-model__content-image, a.media-item-thumbnail-container, a[href*='/watch']"
      ) as HTMLAnchorElement | null;
      if (!anchor?.href) return null;
      try {
        const url = new URL(anchor.href, location.origin);
        if (url.pathname === "/watch" && url.searchParams.has("v")) {
          return `https://www.youtube.com/watch?v=${url.searchParams.get("v")}`;
        }
        // shorts
        if (url.pathname.startsWith("/shorts/")) {
          return anchor.href;
        }
      } catch {
        // ignore malformed
      }
      return null;
    }

    /** Ask the background script to classify a URL */
    async function classify(url: string): Promise<string | null> {
      if (cache.has(url)) return cache.get(url) ?? null;
      if (inflight.has(url)) {
        // Wait for the in-flight request
        return new Promise((resolve) => {
          const check = setInterval(() => {
            if (!inflight.has(url)) {
              clearInterval(check);
              resolve(cache.get(url) ?? null);
            }
          }, 100);
        });
      }

      inflight.add(url);
      try {
        const result = await browser.runtime.sendMessage({
          type: "CLASSIFY_URL",
          url,
        });
        const category = result?.category ?? null;
        cache.set(url, category);
        return category;
      } catch {
        return null;
      } finally {
        inflight.delete(url);
      }
    }

    /** Get the active intent goal from the background */
    async function getActiveGoal(): Promise<string | null> {
      try {
        const result = await browser.runtime.sendMessage({
          type: "GET_ACTIVE_GOAL",
        });
        return result?.goal ?? null;
      } catch {
        return null;
      }
    }

    /** Remove all Klariti effects (overlays + unhide containers) so we can re-apply for a new goal */
    function clearEffects() {
      // Remove all overlays
      document.querySelectorAll(".klariti-overlay").forEach((el) => el.remove());
      // Unhide any containers hidden by FOCUS/WORK mode
      const containers = document.querySelectorAll(
        "ytd-rich-grid-renderer, ytd-section-list-renderer, #contents.ytd-rich-grid-renderer, ytd-browse[page-subtype='home'] #primary, " +
        "ytm-rich-grid-renderer, ytm-section-list-renderer, .tab-content, .rich-grid-renderer-contents"
      );
      containers.forEach((c) => {
        (c as HTMLElement).style.display = "";
      });
      // Reset processed tracking so every video is re-evaluated
      processedIds = new Set<string>();
    }

    /** Find the thumbnail container element (desktop + mobile) */
    function findThumbnail(el: Element): HTMLElement | null {
      return el.querySelector(
        // Desktop classic
        "ytd-thumbnail, .ytd-thumbnail, " +
        // Desktop lockup
        "yt-thumbnail-view-model, a.yt-lockup-view-model__content-image, " +
        // Mobile
        "ytm-thumbnail-cover, a.media-item-thumbnail-container, .video-thumbnail-container-large"
      ) as HTMLElement | null;
    }

    /** Add a red overlay covering the thumbnail area */
    function addBlockOverlay(thumbnailEl: HTMLElement, category?: string | null) {
      if (thumbnailEl.querySelector(".klariti-overlay")) return;
      thumbnailEl.style.position = "relative";
      thumbnailEl.style.overflow = "hidden";
      const overlay = document.createElement("div");
      overlay.className = "klariti-overlay";
      Object.assign(overlay.style, {
        position: "absolute",
        inset: "0",
        background: "rgba(194, 59, 34, 0.85)",
        borderRadius: "12px",
        zIndex: "999",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "4px",
        pointerEvents: "none",
      });
      const label = document.createElement("span");
      Object.assign(label.style, {
        color: "#fff",
        fontFamily: "ui-monospace, monospace",
        fontSize: "10px",
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        opacity: "0.9",
      });
      label.textContent = "Blocked by Klariti";
      overlay.appendChild(label);
      const cat = document.createElement("span");
      Object.assign(cat.style, {
        color: "rgba(255,255,255,0.65)",
        fontFamily: "ui-monospace, monospace",
        fontSize: "9px",
        letterSpacing: "0.04em",
      });
      cat.textContent = category || "Unknown";
      overlay.appendChild(cat);
      thumbnailEl.appendChild(overlay);
    }

    /** Process a single video renderer element */
    async function processVideo(el: Element, goal: string) {
      const pid = getProcessId(el);
      if (processedIds.has(pid)) return;
      processedIds.add(pid);

      const htmlEl = el as HTMLElement;

      const videoUrl = getVideoUrl(el);
      if (!videoUrl) return;

      const category = await classify(videoUrl);

      // If classification failed (null), don't block — only block when we
      // have a definitive non-education category.
      const categoryLower = category?.toLowerCase() ?? null;
      const isEducation =
        categoryLower === "education"

      if (goal === "FOCUS" || goal === "WORK") {
        // Block ALL videos
        const thumbnail = findThumbnail(htmlEl);
        if (thumbnail) addBlockOverlay(thumbnail, category);
      } else if (goal === "STUDY") {
        // Only block videos we *know* are not educational.
        // If category is null (API error / unknown), leave it alone.
        if (category !== null && !isEducation) {
          const thumbnail = findThumbnail(htmlEl);
          if (thumbnail) addBlockOverlay(thumbnail, category);
        }
      }
      // CASUAL → do nothing, allow everything
    }

    /** Scan all visible video renderers on the page */
    async function scan() {
      const goal = await getActiveGoal();
      lastKnownGoal = goal;
      if (!goal) return; // no active intent — do nothing
      if (goal === "CASUAL") return; // allow everything

      const renderers = document.querySelectorAll(
        // Desktop
        "ytd-rich-item-renderer, ytd-video-renderer, ytd-compact-video-renderer, ytd-grid-video-renderer, ytd-reel-item-renderer, " +
        // Mobile
        "ytm-rich-item-renderer, ytm-video-with-context-renderer, ytm-compact-video-renderer, ytm-reel-item-renderer"
      );

      // Process in small batches to avoid blocking the UI
      const batch = Array.from(renderers);
      for (let i = 0; i < batch.length; i += 5) {
        const slice = batch.slice(i, i + 5);
        await Promise.all(slice.map((el) => processVideo(el, goal)));
      }
    }

    // Initial scan after a short delay (let YouTube hydrate)
    setTimeout(scan, 1500);

    // Observe DOM mutations for dynamically loaded videos (infinite scroll)
    const observer = new MutationObserver((mutations) => {
      let hasNew = false;
      for (const m of mutations) {
        if (m.addedNodes.length > 0) {
          hasNew = true;
          break;
        }
      }
      if (hasNew) {
        // Debounce
        clearTimeout(scanTimer);
        scanTimer = setTimeout(scan, 500);
      }
    });

    let scanTimer: ReturnType<typeof setTimeout>;

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Also re-scan on navigation (YouTube is an SPA)
    let lastUrl = location.href;
    setInterval(() => {
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        if (isHomepage()) {
          clearEffects();
          setTimeout(scan, 1500);
        }
      }
    }, 1000);

    // Poll for goal changes — re-run logic when the active intent changes
    setInterval(async () => {
      if (!isHomepage()) return;
      const goal = await getActiveGoal();
      if (goal !== lastKnownGoal) {
        lastKnownGoal = goal;
        clearEffects();
        scan();
      }
    }, 3000);
  },
});
