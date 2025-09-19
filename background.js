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
            // Only open lock page if there are YouTube tabs to close
            if (tabs.length > 0) {
              // First open the klariti resources page
              chrome.tabs.create({ url: "https://klariti.so/lock" });
              
              // Then close all YouTube tabs
              tabs.forEach(tab => {
                chrome.tabs.remove(tab.id);
              });
            }
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
    
    // Immediately check for any open YouTube tabs
    checkAndHandleOpenYouTubeTabs();
  });
}

// Function to check and handle any already-open YouTube tabs
async function checkAndHandleOpenYouTubeTabs() {
  try {
    // Query for any open YouTube tabs - using broader pattern to catch all YouTube URLs
    const youTubeTabs = await chrome.tabs.query({ url: "*://*.youtube.com/*" });
    console.log(`Found ${youTubeTabs.length} existing YouTube tabs to check`);
    
    if (youTubeTabs.length > 0) {
      // Check if strict mode should redirect
      const shouldRedirect = await shouldRedirectYouTube();
      
      if (shouldRedirect) {
        console.log('Strict mode is active, handling existing YouTube tabs');
        // Open lock page once
        await chrome.tabs.create({ url: "https://klariti.so/lock" });
        
        // Close all YouTube tabs
        for (const tab of youTubeTabs) {
          try {
            await chrome.tabs.remove(tab.id);
            console.log(`Closed existing YouTube tab ${tab.id}`);
          } catch (error) {
            console.error(`Error closing YouTube tab ${tab.id}:`, error);
          }
        }
      }
    }
    
    // Also check the currently active tab specifically
    await checkActiveTab();
  } catch (error) {
    console.error('Error checking for existing YouTube tabs:', error);
  }
}

// Function to check if the active tab is YouTube and handle accordingly
async function checkActiveTab() {
  try {
    // Get the currently active tab in the current window
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs.length > 0) {
      const activeTab = tabs[0];
      
      // If active tab is YouTube
      if (activeTab.url && activeTab.url.includes('youtube.com')) {
        console.log(`Active tab is YouTube: ${activeTab.url}`);
        await handleYouTubeTab(activeTab.id, activeTab.url);
      }
    }
  } catch (error) {
    console.error('Error checking active tab:', error);
  }
}

// Start polling when the extension is installed
chrome.runtime.onInstalled.addListener(initializeExtension);

// Handle browser startup and extension activation
chrome.runtime.onStartup.addListener(() => {
  console.log('Browser started, initializing extension and checking for YouTube tabs');
  initializeExtension();
});

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
          // Only open lock page if there are YouTube tabs to close
          if (tabs.length > 0) {
            // First open the klariti resources page
            chrome.tabs.create({ url: "https://klariti.so/lock" });
            
            // Then close all YouTube tabs
            tabs.forEach(tab => {
              chrome.tabs.remove(tab.id);
            });
          }
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
  
  // Handle strict mode being enabled
  if (request.action === "strictModeEnabled") {
    // First check if API is forcing hide
    chrome.storage.local.get(["apiForceHide", "isRecommendationsHidden"], (data) => {
      const apiForceHide = data.apiForceHide !== undefined ? data.apiForceHide : false;
      const recommendationsHidden = data.isRecommendationsHidden !== undefined ? data.isRecommendationsHidden : false;
      
      // If API is forcing hide, don't allow strict mode changes
      if (apiForceHide && recommendationsHidden) {
        console.log("API lock is active, ignoring strict mode change request");
        sendResponse({ 
          success: false, 
          error: "Cannot change strict mode while API lock is active"
        });
        return;
      }
      
      // Otherwise, proceed with the strict mode change
      const isHidden = request.isRecommendationsHidden;
      
      // If recommendations are hidden and strict mode was just enabled,
      // immediately check for and close any YouTube tabs
      if (isHidden) {
        chrome.tabs.query({ url: "https://www.youtube.com/*" }, (tabs) => {
          // Only open lock page if there are YouTube tabs to close
          if (tabs.length > 0) {
            // First open the klariti resources page
            chrome.tabs.create({ url: "https://klariti.so/lock" });
            
            // Then close all YouTube tabs
            tabs.forEach(tab => {
              chrome.tabs.remove(tab.id);
            });
          }
        });
      }
      
      sendResponse({ success: true });
    });
  }

  return true; // Ensure asynchronous handling
});

// Create two alarms - one for keeping service worker alive and API polling, and another for more frequent tab checking
chrome.alarms.create('keepAlive', { periodInMinutes: 1 });
chrome.alarms.create('checkYouTubeTabs', { periodInMinutes: 0.1 }); // Check every 6 seconds

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'keepAlive') {
    // Do a quick state refresh to keep the service worker active
    fetchStateFromApi();
  } else if (alarm.name === 'checkYouTubeTabs') {
    // Frequently check for any YouTube tabs
    checkAndHandleOpenYouTubeTabs();
  }
});

// Listen for changes to strict mode or recommendation states in storage
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local') {
    const relevantChanges = ['strictMode', 'isRecommendationsHidden', 'apiForceHide', 'userPreferenceHide'];
    const hasRelevantChanges = relevantChanges.some(key => changes[key]);
    
    if (hasRelevantChanges) {
      console.log('Detected relevant storage changes, checking YouTube tabs');
      // Check if we need to take action on any YouTube tabs
      checkAndHandleOpenYouTubeTabs();
    }
  }
});

// Listen for tab activation (when user switches to a tab)
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    console.log(`Tab activated: ${activeInfo.tabId}`);
    // Get tab info
    const tab = await chrome.tabs.get(activeInfo.tabId);
    
    // Check if the activated tab is YouTube
    if (tab.url && tab.url.includes('youtube.com')) {
      console.log(`User activated YouTube tab: ${tab.url}`);
      await handleYouTubeTab(tab.id, tab.url);
    }
  } catch (error) {
    console.error('Error in tab activation handler:', error);
  }
});

// Listen for window focus changes
chrome.windows.onFocusChanged.addListener(async (windowId) => {
  // windowId === chrome.windows.WINDOW_ID_NONE when focus moves outside Chrome
  if (windowId !== chrome.windows.WINDOW_ID_NONE) {
    console.log(`Window focused: ${windowId}, checking active tab`);
    // When a window gets focus, check its active tab
    await checkActiveTab();
  }
});

// Function to check if strict mode is active and redirections should happen
async function shouldRedirectYouTube() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['isRecommendationsHidden', 'strictMode', 'apiForceHide', 'userPreferenceHide'], (data) => {
      const strictMode = data.strictMode || false;
      const apiForceHide = data.apiForceHide || false;
      const isHidden = data.isRecommendationsHidden || false;
      const userPreferenceHide = data.userPreferenceHide || false;
      
      // For extra safety, check multiple conditions:
      // 1. Is strict mode enabled?
      // 2. Is API forcing hide OR is the user preference to hide OR is the effective state hidden?
      const shouldRedirect = strictMode && (apiForceHide || userPreferenceHide || isHidden);
      
      console.log(`Strict mode: ${strictMode}, API force hide: ${apiForceHide}, User preference: ${userPreferenceHide}, Effective state: ${isHidden}`);
      console.log(`Should redirect: ${shouldRedirect}`);
      
      resolve(shouldRedirect);
    });
  });
}

// Function to determine if a URL is YouTube
function isYouTubeUrl(url) {
  if (!url) return false;
  
  // Check for various YouTube URL patterns
  const youtubePatterns = [
    'youtube.com',
    'youtu.be',
    'm.youtube.com',
    'www.youtube.com'
  ];
  
  return youtubePatterns.some(pattern => url.includes(pattern));
}

// Function to handle YouTube tabs based on current strict mode settings
async function handleYouTubeTab(tabId, url) {
  // Skip processing if this isn't a YouTube URL
  if (!isYouTubeUrl(url)) {
    return;
  }
  
  console.log(`Handling YouTube tab ${tabId} with URL: ${url}`);
  
  // Check if we should redirect
  const shouldRedirect = await shouldRedirectYouTube();
  if (shouldRedirect) {
    console.log(`Strict mode active: Redirecting YouTube tab ${tabId} to lock page`);
    
    try {
      // First create the lock page in a new tab
      await chrome.tabs.create({ url: 'https://klariti.so/lock' });
      
      // Then close the YouTube tab with some error handling
      try {
        await chrome.tabs.remove(tabId);
        console.log(`Successfully closed YouTube tab ${tabId}`);
      } catch (error) {
        console.error(`Error closing YouTube tab ${tabId}:`, error);
      }
    } catch (error) {
      console.error('Error handling YouTube redirection:', error);
    }
  } else {
    console.log(`Strict mode inactive: Allowing YouTube tab ${tabId} to remain open`);
    // Apply the effect based on current settings
    applyEffectToYouTubeTab(tabId);
  }
}

// Function to apply the correct effect to a YouTube tab based on current settings
async function applyEffectToYouTubeTab(tabId) {
  try {
    // Get current settings
    const data = await chrome.storage.local.get([
      "isRecommendationsHidden", 
      "apiForceHide", 
      "userPreferenceHide", 
      "strictMode"
    ]);
    
    const isRecommendationsHidden = data.isRecommendationsHidden !== undefined ? data.isRecommendationsHidden : false;
    const apiForceHide = data.apiForceHide !== undefined ? data.apiForceHide : false;
    const strictMode = data.strictMode !== undefined ? data.strictMode : false;
    
    console.log(`Applying effects to YouTube tab ${tabId}: isHidden=${isRecommendationsHidden}, apiForce=${apiForceHide}, strictMode=${strictMode}`);
    
    // If strict mode is on and recommendations should be hidden, we should have already redirected
    // This is just a safety check in case something went wrong
    if (strictMode && isRecommendationsHidden) {
      console.log(`Strict mode check in applyEffect: Redirecting YouTube tab ${tabId}`);
      await handleYouTubeTab(tabId, "youtube.com");
      return;
    }
    
    // Otherwise apply the current effect to the tab
    chrome.tabs.sendMessage(tabId, { 
      action: "toggleRecommendations", 
      hide: isRecommendationsHidden,
      apiForceHide: apiForceHide
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.log(`Content script might not be ready yet: ${chrome.runtime.lastError.message}`);
        // This is normal if the content script hasn't loaded yet
        // The content script will check for the current state once it's ready
      } else if (response && response.success) {
        console.log(`Successfully applied effect to tab ${tabId}`);
      }
    });
  } catch (error) {
    console.error(`Error applying effect to YouTube tab ${tabId}:`, error);
  }
}

// Listen for tab updates to catch when someone navigates to YouTube
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Process when the URL changes or page completes loading
  // Check for URL changes specifically to catch navigation to YouTube
  if (changeInfo.url && changeInfo.url.includes('youtube.com')) {
    console.log(`Detected URL change to YouTube: ${changeInfo.url}`);
    handleYouTubeTab(tabId, changeInfo.url);
  }
  // Also check tab.url for cases where changeInfo.url isn't set
  else if (tab.url && tab.url.includes('youtube.com')) {
    console.log(`Detected YouTube tab updated: ${tab.url}`);
    handleYouTubeTab(tabId, tab.url);
  }
  
  // Check if the page has finished loading and it's a YouTube page
  if (changeInfo.status === 'complete' && tab.url && tab.url.includes('youtube.com')) {
    console.log(`YouTube page fully loaded: ${tab.url}`);
    applyEffectToYouTubeTab(tabId);
  }
});

// Listen for tab creation to catch new YouTube tabs being opened
chrome.tabs.onCreated.addListener((tab) => {
  if (tab.pendingUrl && tab.pendingUrl.includes('youtube.com')) {
    console.log(`Detected new YouTube tab with pendingUrl: ${tab.pendingUrl}`);
    handleYouTubeTab(tab.id, tab.pendingUrl);
  } else if (tab.url && tab.url.includes('youtube.com')) {
    console.log(`Detected new YouTube tab with url: ${tab.url}`);
    handleYouTubeTab(tab.id, tab.url);
  }
});

// Listen for navigation events to catch YouTube access via history navigation or bookmarks
chrome.webNavigation && chrome.webNavigation.onCommitted.addListener((details) => {
  if (details.url && details.url.includes('youtube.com')) {
    console.log(`Detected navigation to YouTube via ${details.transitionType}: ${details.url}`);
    handleYouTubeTab(details.tabId, details.url);
  }
});
