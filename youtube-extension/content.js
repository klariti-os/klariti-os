// Function to apply the hidden or shown state to recommendations
function applyRecommendationState(isRecommendationsHidden) {
  // Target the main recommendation grid on the homepage
  const recommendationsSection = document.querySelector("ytd-rich-grid-renderer");
  if (recommendationsSection) {
    recommendationsSection.style.display = isRecommendationsHidden ? "none" : "";
    console.log(`Applied ${isRecommendationsHidden ? 'hidden' : 'visible'} state to main recommendations grid`);
  }
  
  // Also hide recommended videos on watch page (sidebar recommendations)
  const sidebarRecommendations = document.querySelector("ytd-watch-next-secondary-results-renderer");
  if (sidebarRecommendations) {
    sidebarRecommendations.style.display = isRecommendationsHidden ? "none" : "";
    console.log(`Applied ${isRecommendationsHidden ? 'hidden' : 'visible'} state to sidebar recommendations`);
  }
  
  // Add a style tag to ensure recommendations stay hidden during dynamic content loading
  if (isRecommendationsHidden) {
    ensurePersistentStyles(true);
  } else {
    ensurePersistentStyles(false);
  }
}

// Function to add persistent CSS styles to hide recommendations
function ensurePersistentStyles(isHidden) {
  // Check if our style tag already exists
  let styleTag = document.getElementById("klariti-persistent-styles");
  
  // If no style tag exists yet, create one
  if (!styleTag && isHidden) {
    styleTag = document.createElement("style");
    styleTag.id = "klariti-persistent-styles";
    document.head.appendChild(styleTag);
  }
  
  // Update or clear the styles based on visibility state
  if (styleTag) {
    if (isHidden) {
      styleTag.textContent = `
        ytd-rich-grid-renderer, 
        ytd-watch-next-secondary-results-renderer,
        ytd-compact-video-renderer {
          display: none !important;
        }
      `;
    } else {
      // If not hidden, remove the style tag
      styleTag.remove();
    }
  }
}

// Poll more frequently (200ms) to check if the recommendations section is present
// This ensures quicker effect application when opening a new tab
const domPollInterval = setInterval(() => {
  const recommendationsSection = document.querySelector("ytd-rich-grid-renderer");
  if (recommendationsSection) {
    // Once we find the recommendations section, stop polling for DOM
    clearInterval(domPollInterval);
    
    // Apply the current state from storage
    chrome.storage.local.get(["isRecommendationsHidden", "apiForceHide", "strictMode"], (data) => {
      const isRecommendationsHidden = data.isRecommendationsHidden !== undefined ? data.isRecommendationsHidden : false;
      const apiForceHide = data.apiForceHide !== undefined ? data.apiForceHide : false;
      
      console.log(`Content script found recommendations section, applying state: ${isRecommendationsHidden}`);
      applyRecommendationState(isRecommendationsHidden);
      
      // Store the API force state in the DOM for potential UI indication
      document.documentElement.dataset.apiForceHide = apiForceHide;
      
      // Inform the background script that this page is ready
      chrome.runtime.sendMessage({ 
        action: "contentScriptReady",
        url: window.location.href
      });
    });
  }
}, 200); // Check every 200ms for faster response

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
