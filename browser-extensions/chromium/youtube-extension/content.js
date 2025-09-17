// Function to apply the hidden or shown state to recommendations
function applyRecommendationState(isRecommendationsHidden) {
  const recommendationsSection = document.querySelector("ytd-rich-grid-renderer");
  if (recommendationsSection) {
    recommendationsSection.style.display = isRecommendationsHidden ? "none" : "";
  }
}

// Poll every 500ms to check if the recommendations section is present
const pollInterval = setInterval(() => {
  const recommendationsSection = document.querySelector("ytd-rich-grid-renderer");
  if (recommendationsSection) {
    // Once we find the recommendations section, stop polling
    clearInterval(pollInterval);
    // Fetch the saved state from localStorage and apply it
    chrome.storage.local.get("isRecommendationsHidden", (data) => {
      const isRecommendationsHidden = data.isRecommendationsHidden !== undefined ? data.isRecommendationsHidden : false;
      applyRecommendationState(isRecommendationsHidden);
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
    }
  }
});
