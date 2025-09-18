// Function to update UI based on state
function updateUI(isRecommendationsHidden, apiForceHide, userPreferenceHide) {
  const toggleSwitch = document.getElementById("toggleSwitch");
  
  // Update the checkbox state based on user preference, not the effective state
  toggleSwitch.checked = userPreferenceHide !== undefined ? userPreferenceHide : isRecommendationsHidden;
  
  // Disable the toggle if API is forcing hide
  toggleSwitch.disabled = apiForceHide && isRecommendationsHidden;
  
  // Disable the strict mode checkbox if API is forcing hide (lock is activated)
  const strictModeCheckbox = document.getElementById("strictModeCheckbox");
  strictModeCheckbox.disabled = apiForceHide && isRecommendationsHidden;
  
  // Add a class to the switch when it's disabled by API
  const switchContainer = document.querySelector(".switch");
  if (apiForceHide && isRecommendationsHidden) {
    switchContainer.classList.add("api-forced");
    // Add a special style for forced API state if it doesn't exist
    if (!document.getElementById("apiForceStyle")) {
      const styleEl = document.createElement("style");
      styleEl.id = "apiForceStyle";
      styleEl.textContent = `
        .switch.api-forced .slider {
          background-color: #f44336 !important;
          box-shadow: 0 0 5px #f44336;
        }
        .switch.api-forced input:disabled + .slider:before {
          background-color: #ffcdd2;
        }
        h1::after {
          content: " 🔒";
          font-size: 20px;
        }
        /* Style for disabled strict mode checkbox */
        .checkbox-container input:disabled + label {
          color: #999;
          cursor: not-allowed;
        }
        .checkbox-container input:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `;
      document.head.appendChild(styleEl);
    }
  } else {
    switchContainer.classList.remove("api-forced");
  }
  
  // Update the status message (hidden in the UI, but kept for debugging)
  const statusMessage = document.getElementById("statusMessage");
  if (isRecommendationsHidden) {
    if (apiForceHide) {
      statusMessage.textContent = "API Force: ON";
      statusMessage.className = "status-message warning";
    } else {
      statusMessage.textContent = "ON";
      statusMessage.className = "status-message success";
    }
  } else {
    statusMessage.textContent = "OFF";
    statusMessage.className = "status-message success";
  }
}

// Listen for state changes from the background script
chrome.storage.onChanged.addListener((changes) => {
  // When any relevant state changes, get all current states
  if (changes.isRecommendationsHidden || changes.apiForceHide || changes.userPreferenceHide) {
    chrome.storage.local.get(["isRecommendationsHidden", "apiForceHide", "userPreferenceHide"], (data) => {
      const isRecommendationsHidden = data.isRecommendationsHidden !== undefined ? data.isRecommendationsHidden : false;
      const apiForceHide = data.apiForceHide !== undefined ? data.apiForceHide : false;
      const userPreferenceHide = data.userPreferenceHide !== undefined ? data.userPreferenceHide : isRecommendationsHidden;
      
      updateUI(isRecommendationsHidden, apiForceHide, userPreferenceHide);
    });
  }
  
  if (changes.strictMode) {
    document.getElementById("strictModeCheckbox").checked = changes.strictMode.newValue;
  }
});

// Fetch and update the UI when the popup is opened
chrome.storage.local.get(["isRecommendationsHidden", "strictMode", "apiForceHide", "userPreferenceHide"], (data) => {
  const isRecommendationsHidden = data.isRecommendationsHidden !== undefined ? data.isRecommendationsHidden : false;
  const strictMode = data.strictMode !== undefined ? data.strictMode : false;
  const apiForceHide = data.apiForceHide !== undefined ? data.apiForceHide : false;
  const userPreferenceHide = data.userPreferenceHide !== undefined ? data.userPreferenceHide : isRecommendationsHidden;
  
  // Update UI with current values
  updateUI(isRecommendationsHidden, apiForceHide, userPreferenceHide);
  document.getElementById("strictModeCheckbox").checked = strictMode;
});

// Event listener for the toggle switch
document.getElementById("toggleSwitch").addEventListener("change", (event) => {
  const statusMessage = document.getElementById("statusMessage");
  const isChecked = event.target.checked;
  
  // Check if strict mode is enabled
  const strictModeEnabled = document.getElementById("strictModeCheckbox").checked;

  // Check current API state before sending the toggle command
  chrome.storage.local.get(["apiForceHide"], (data) => {
    const apiForceHide = data.apiForceHide !== undefined ? data.apiForceHide : false;
    
    // If API is forcing hide and user is trying to uncheck, prevent it
    if (apiForceHide && !isChecked) {
      event.preventDefault();
      // Revert the checkbox state immediately
      event.target.checked = true;
      
      statusMessage.textContent = "API is forcing recommendations to be hidden.";
      statusMessage.className = "status-message warning";
      return;
    }
    
    // Update user preference - this is what the toggle actually controls
    chrome.storage.local.set({ userPreferenceHide: isChecked }, () => {
      chrome.runtime.sendMessage({ 
        action: "toggleRecommendations",
        strictMode: strictModeEnabled
      }, (response) => {
        if (response && response.success) {
          // Update UI with the response data
          updateUI(
            response.effectiveHide, 
            response.apiForceHide,
            response.userPreferenceHide
          );
        } else {
          console.error("Failed to toggle recommendations");
          statusMessage.textContent = "Something went wrong.";
          statusMessage.className = "status-message error";
        }
      });
    });
  });
});

// Event listener for the strict mode checkbox
document.getElementById("strictModeCheckbox").addEventListener("change", (event) => {
  const isChecked = event.target.checked;
  const toggleSwitch = document.getElementById("toggleSwitch");
  const statusMessage = document.getElementById("statusMessage");
  
  // Check if API lock is activated before allowing changes
  chrome.storage.local.get(["apiForceHide", "isRecommendationsHidden"], (data) => {
    const apiForceHide = data.apiForceHide !== undefined ? data.apiForceHide : false;
    const isRecommendationsHidden = data.isRecommendationsHidden !== undefined ? data.isRecommendationsHidden : false;
    
    // If API is forcing hide, prevent strict mode changes
    if (apiForceHide && isRecommendationsHidden) {
      event.preventDefault();
      // Revert the checkbox state to its previous value
      chrome.storage.local.get(["strictMode"], (data) => {
        const strictMode = data.strictMode !== undefined ? data.strictMode : false;
        event.target.checked = strictMode;
      });
      
      // Show warning message
      statusMessage.textContent = "Cannot change strict mode while lock is active.";
      statusMessage.className = "status-message warning";
      statusMessage.style.display = "block";
      
      // Hide the message after 3 seconds
      setTimeout(() => {
        statusMessage.style.display = "none";
      }, 3000);
      
      return;
    }
    
    // If API lock is not active, proceed with the change
    // Save the strict mode setting
    chrome.storage.local.set({ strictMode: isChecked }, () => {
      // If strict mode is being enabled and the toggle is ON, 
      // immediately check for YouTube tabs to close
      if (isChecked && toggleSwitch.checked) {
        chrome.runtime.sendMessage({ 
          action: "strictModeEnabled",
          isRecommendationsHidden: toggleSwitch.checked
        });
      }
    });
  });
});
