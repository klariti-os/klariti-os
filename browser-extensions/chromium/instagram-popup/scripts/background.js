let isToggleOn = false; 
targetUrl = "https://www.instagram.com"

// listen for change in state
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.toggleState !== undefined) {
    isToggleOn = message.toggleState; 
    console.log(isToggleOn)
    if(isToggleOn){
        closeTabsWithUrl(targetUrl)
    }
  }
});

// function to close insta tabs
function closeTabsWithUrl(targetUrl) {
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        if (tab.url && tab.url.includes(targetUrl)) {
          console.log(`Closing tab with URL: ${tab.url}`);
          chrome.tabs.remove(tab.id); 
        }
      });
    });
};

//listen for new tabs 
chrome.tabs.onCreated.addListener((tab) => {
    if (tab.url && tab.url.includes(targetUrl) && isToggleOn) {
      closeTabsWithUrl(targetUrl); 
    }
});
  

// listen for updates to tabs
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url && changeInfo.url.includes(targetUrl) && isToggleOn) {
    closeTabsWithUrl(targetUrl) 
  }
});