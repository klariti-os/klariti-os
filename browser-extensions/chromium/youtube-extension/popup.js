// Fetch and update the button state when the popup is opened
chrome.storage.local.get("isRecommendationsHidden", (data) => {
  const isRecommendationsHidden = data.isRecommendationsHidden !== undefined ? data.isRecommendationsHidden : false;
  const toggleSwitch = document.getElementById("toggleSwitch");
  
  // Update the checkbox state based on stored value
  toggleSwitch.checked = isRecommendationsHidden;
  
  // Update the status message
  const statusMessage = document.getElementById("statusMessage");
  if (isRecommendationsHidden) {
    statusMessage.textContent = "YouTube recommendations hidden.";
    statusMessage.className = "status-message success";
  } else {
    statusMessage.textContent = "YouTube recommendations shown.";
    statusMessage.className = "status-message success";
  }
});

// Event listener for the toggle switch
document.getElementById("toggleSwitch").addEventListener("change", (event) => {
  const statusMessage = document.getElementById("statusMessage");
  const isChecked = event.target.checked;

  // Save the new state to storage
  chrome.storage.local.set({ isRecommendationsHidden: isChecked }, () => {
    chrome.runtime.sendMessage({ action: "toggleRecommendations" }, (response) => {
      if (response.success) {
        if (isChecked) {
          statusMessage.textContent = "YouTube recommendations hidden.";
          statusMessage.className = "status-message success";
        } else {
          statusMessage.textContent = "YouTube recommendations shown.";
          statusMessage.className = "status-message success";
        }
      } else {
        statusMessage.textContent = "Something went wrong.";
        statusMessage.className = "status-message error";
      }
    });
  });
});
