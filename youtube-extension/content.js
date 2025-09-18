// Function to apply the hidden or shown state to recommendations
function applyRecommendationState(isRecommendationsHidden) {
  const recommendationsSection = document.querySelector("ytd-rich-grid-renderer");
  if (recommendationsSection) {
    recommendationsSection.style.display = isRecommendationsHidden ? "none" : "";
  }
}

// Poll every 500ms to check if the recommendations section is present
const domPollInterval = setInterval(() => {
  const recommendationsSection = document.querySelector("ytd-rich-grid-renderer");
  if (recommendationsSection) {
    // Once we find the recommendations section, stop polling for DOM
    clearInterval(domPollInterval);
    
    // Apply the current state from storage
    chrome.storage.local.get("isRecommendationsHidden", (data) => {
      const isRecommendationsHidden = data.isRecommendationsHidden !== undefined ? data.isRecommendationsHidden : false;
      applyRecommendationState(isRecommendationsHidden);
      
      // Inform the background script that this page is ready
      chrome.runtime.sendMessage({ action: "contentScriptReady" });
    });
  }
}, 500); // Check every 500ms

// Listen for toggle recommendation action from background.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "toggleRecommendations") {
    const recommendationsSection = document.querySelector("ytd-rich-grid-renderer");

    if (recommendationsSection) {
      if (request.hide) {
        recommendationsSection.style.display = "none"; // Hide the recommendations
      } else {
        recommendationsSection.style.display = ""; // Show the recommendations again
      }
      
      // Store the API force state in the DOM for potential UI indication
      document.documentElement.dataset.apiForceHide = request.apiForceHide;
      
      sendResponse({ 
        success: true,
        apiForceHide: request.apiForceHide
      });
    } else {
      sendResponse({ success: false, error: "Recommendations section not found" });
    }
    return true; // Keep the message channel open for async response
  }
});
