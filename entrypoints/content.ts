export default defineContentScript({
  matches: ["<all_urls>"],
  runAt: "document_start",

  main() {
    console.log("Klariti content script loaded");

    browser.runtime.onMessage.addListener((request, _sender, sendResponse) => {
      console.log("Content script received message:", request);

      // Handle YouTube recommendation hiding if needed
      if (request.action === "toggleRecommendations") {
        // YouTube-specific functionality can be handled here
        sendResponse({ success: true });
        return true;
      }

      sendResponse({ success: true });
      return true;
    });
  },
});
