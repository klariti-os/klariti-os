// content.js - Content script for Klariti extension
// Blocking is now handled by background.js closing tabs

console.log('Klariti content script loaded');

// Listen for messages from background script (for YouTube features)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Content script received message:', request);
  
  // Handle YouTube recommendation hiding if needed
  if (request.action === 'toggleRecommendations') {
    // YouTube-specific functionality can be handled here
    sendResponse({ success: true });
  }
  
  sendResponse({ success: true });
  return true;
});
