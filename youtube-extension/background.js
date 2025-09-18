let isRecommendationsHidden = false; // User's preference
let isApiStateForceHide = false; // API state (true = force hide)
let pollingInterval = null;

// Function to fetch state from API
async function fetchStateFromApi() {
  try {
    const response = await fetch('https://k-switch.onrender.com/api/state');
    if (!response.ok) {
      throw new Error('Failed to fetch state from API');
    }
    const data = await response.json();
    
    // If state is 1, API is forcing hide recommendations
    const apiForceHide = data.state === 1;
    
    // Only update if API state changed
    if (apiForceHide !== isApiStateForceHide) {
      // Get previous state before updating
      const previousApiState = isApiStateForceHide;
      
      // Update our API state tracking
      isApiStateForceHide = apiForceHide;
      
      // Store the API state for reference
      chrome.storage.local.set({ apiForceHide }, async () => {
        // Get current user preference
        const { userPreferenceHide, strictMode } = await chrome.storage.local.get(["userPreferenceHide", "strictMode"]);
        
        // When API switches from ON to OFF, also set user preference to OFF
        let updatedUserPreference = userPreferenceHide;
        if (previousApiState === true && apiForceHide === false) {
          // API state changed from ON to OFF, so sync user preference to OFF as well
          updatedUserPreference = false;
          // Update the stored user preference
          chrome.storage.local.set({ userPreferenceHide: false });
        }
        
        // Determine effective state: if API says force hide OR user wants to hide
        const effectiveHide = apiForceHide || updatedUserPreference;
        
        // Update the main state variable
        isRecommendationsHidden = effectiveHide;
        
        // If API is forcing hide and strict mode is on, do the special strict mode action
        if (apiForceHide && strictMode) {
          // In strict mode with API forcing hide, close YouTube tabs and open klariti resources
          chrome.tabs.query({ url: "https://www.youtube.com/*" }, (tabs) => {
            // First open the klariti resources page
            chrome.tabs.create({ url: "https://klariti.so/lock" });
            
            // Then close all YouTube tabs
            tabs.forEach(tab => {
              chrome.tabs.remove(tab.id);
            });
          });
        } else {
          // Otherwise apply the effective state to all YouTube tabs
          chrome.tabs.query({ url: "https://www.youtube.com/*" }, (tabs) => {
            tabs.forEach(tab => {
              chrome.tabs.sendMessage(tab.id, { 
                action: "toggleRecommendations", 
                hide: effectiveHide,
                apiForceHide: apiForceHide
              });
            });
          });
        }
        
        // Update the stored effective state and user preference if it changed
        chrome.storage.local.set({ 
          isRecommendationsHidden: effectiveHide,
          apiForceHide: apiForceHide,
          // Include the possibly updated user preference
          userPreferenceHide: updatedUserPreference
        });
      });
    }
  } catch (error) {
    console.error('Error fetching state:', error);
  }
}

// Function to start API polling
function startApiPolling() {
  if (pollingInterval === null) {
    // First fetch immediately
    fetchStateFromApi();
    // Then set up polling interval
    pollingInterval = setInterval(fetchStateFromApi, 300);
    console.log('API polling started');
  }
}

// Initialize the extension
function initializeExtension() {
  // Check local storage for any existing state
  chrome.storage.local.get(["isRecommendationsHidden", "strictMode", "apiForceHide", "userPreferenceHide"], (data) => {
    // Initialize overall state
    if (data.isRecommendationsHidden !== undefined) {
      isRecommendationsHidden = data.isRecommendationsHidden;
    }
    
    // Initialize API state
    if (data.apiForceHide !== undefined) {
      isApiStateForceHide = data.apiForceHide;
    }
    
    // Initialize user preference if not set
    if (data.userPreferenceHide === undefined) {
      // Default to same as overall state, or false if that's not defined
      chrome.storage.local.set({ 
        userPreferenceHide: data.isRecommendationsHidden !== undefined ? data.isRecommendationsHidden : false 
      });
    }
    
    // Initialize strict mode if it's not set
    if (data.strictMode === undefined) {
      chrome.storage.local.set({ strictMode: false });
    }
    
    // Start API polling
    startApiPolling();
  });
}

// Start polling when the extension is installed
chrome.runtime.onInstalled.addListener(initializeExtension);

// Also start polling when the service worker starts
// This ensures polling continues after browser restart or extension update
initializeExtension();

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Handle toggle action from popup
  if (request.action === "toggleRecommendations") {
    // Get the current API state
    chrome.storage.local.get(["apiForceHide", "strictMode"], async (data) => {
      const apiForceHide = data.apiForceHide !== undefined ? data.apiForceHide : false;
      const strictMode = request.strictMode !== undefined ? request.strictMode : data.strictMode;
      
      // Toggle user preference - this is what the user wants
      const newUserPreference = !isRecommendationsHidden;
      
      // Update user preference state
      chrome.storage.local.set({ userPreferenceHide: newUserPreference });
      
      // Calculate effective state:
      // If API forces hide (apiForceHide=true), recommendations are always hidden
      // Otherwise, use user preference
      const effectiveHide = apiForceHide ? true : newUserPreference;
      isRecommendationsHidden = effectiveHide;
      
      if (strictMode && effectiveHide) {
        // In strict mode and effectively hiding recommendations, close YouTube tabs and open klariti resources
        chrome.tabs.query({ url: "https://www.youtube.com/*" }, (tabs) => {
          // First open the klariti resources page
          chrome.tabs.create({ url: "https://klariti.so/resources" });
          
          // Then close all YouTube tabs
          tabs.forEach(tab => {
            chrome.tabs.remove(tab.id);
          });
        });
        
        sendResponse({ 
          success: true, 
          effectiveHide: effectiveHide, 
          userPreferenceHide: newUserPreference,
          apiForceHide: apiForceHide
        });
      } else {
        // Regular mode or showing recommendations
        // Save the new effective state to local storage
        chrome.storage.local.set({ isRecommendationsHidden: effectiveHide }, () => {
          // Send a message to the content script to hide or show recommendations
          chrome.tabs.query({ url: "https://www.youtube.com/*" }, (tabs) => {
            tabs.forEach(tab => {
              chrome.tabs.sendMessage(tab.id, { 
                action: "toggleRecommendations", 
                hide: effectiveHide,
                apiForceHide: apiForceHide
              });
            });
          });
        });
        
        sendResponse({ 
          success: true, 
          effectiveHide: effectiveHide,
          userPreferenceHide: newUserPreference,
          apiForceHide: apiForceHide
        });
      }
    });
    
    return true; // Keep the message channel open for async response
  }
  
  // Handle content script ready notification
  if (request.action === "contentScriptReady") {
    // Send the current state to the content script that just reported ready
    if (sender.tab && sender.tab.id) {
      chrome.tabs.sendMessage(sender.tab.id, { 
        action: "toggleRecommendations", 
        hide: isRecommendationsHidden,
        apiForceHide: isApiStateForceHide
      });
    }
    sendResponse({ 
      success: true,
      effectiveHide: isRecommendationsHidden,
      apiForceHide: isApiStateForceHide
    });
  }

  return true; // Ensure asynchronous handling
});

// Keep the service worker alive by using an alarm that triggers every minute
chrome.alarms.create('keepAlive', { periodInMinutes: 1 });
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'keepAlive') {
    // Do a quick state refresh to keep the service worker active
    fetchStateFromApi();
  }
});
