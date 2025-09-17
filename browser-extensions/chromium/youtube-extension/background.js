let isRecommendationsHidden = false;

// Load the stored state when the extension is initialized
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get("isRecommendationsHidden", (data) => {
    if (data.isRecommendationsHidden !== undefined) {
      isRecommendationsHidden = data.isRecommendationsHidden;
    } else {
      // Default to false if not set
      isRecommendationsHidden = false;
    }
  });
});

// Listen for the toggle action in the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "toggleRecommendations") {
    // Toggle the recommendation visibility
    isRecommendationsHidden = !isRecommendationsHidden;

    // Save the new state to local storage
    chrome.storage.local.set({ isRecommendationsHidden }, () => {
      // Send a message to the content script to hide or show recommendations
      chrome.tabs.query({ url: "https://www.youtube.com/*" }, (tabs) => {
        tabs.forEach(tab => {
          chrome.tabs.sendMessage(tab.id, { action: "toggleRecommendations", hide: isRecommendationsHidden });
        });
      });
    });

    sendResponse({ success: true });
  }

  return true; // Ensure asynchronous handling
});
