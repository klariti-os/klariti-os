// background.js - Handle website blocking based on active challenges

importScripts('config.js');

let blockedUrls = new Set();
let wsConnection = null;
let reconnectTimeout = null;

// Initialize extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('Klariti extension installed');
  initializeExtension();
});

// Initialize on startup
chrome.runtime.onStartup.addListener(() => {
  console.log('Klariti extension starting');
  initializeExtension();
});

async function initializeExtension() {
  const { access_token } = await chrome.storage.local.get('access_token');
  
  if (access_token) {
    // Fetch challenges and set up blocking
    await updateChallengesAndBlocking();
    // Connect to WebSocket for real-time updates
    connectWebSocket();
  }
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'user_logged_in') {
    handleUserLogin();
  } else if (request.action === 'user_logged_out') {
    handleUserLogout();
  } else if (request.action === 'challenges_updated') {
    updateBlockingRules(request.challenges);
  }
  
  // Keep the message channel open for async responses
  return true;
});

// Handle user login
async function handleUserLogin() {
  await updateChallengesAndBlocking();
  connectWebSocket();
}

// Handle user logout
async function handleUserLogout() {
  // Disconnect WebSocket
  if (wsConnection) {
    wsConnection.close();
    wsConnection = null;
  }
  
  // Clear blocked URLs
  blockedUrls.clear();
  
  // Clear any reconnect timeout
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }
}

// Fetch challenges and update blocking rules
async function updateChallengesAndBlocking() {
  try {
    const { access_token } = await chrome.storage.local.get('access_token');
    
    if (!access_token) {
      console.log('No access token, skipping challenge fetch');
      return;
    }
    
    console.log('Fetching challenges from API...');
    
    // Use the correct endpoint that matches klariti.so frontend
    const response = await fetch(`${config.apiUrl}/challenges/my-challenges?skip=0&limit=100`, {
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json'
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to fetch challenges:', response.status, errorText);
      return;
    }
    
    const challenges = await response.json();
    console.log('Fetched challenges:', challenges);
    
    // Store challenges
    await chrome.storage.local.set({ challenges });
    
    // Update blocking rules
    updateBlockingRules(challenges);
  } catch (error) {
    console.error('Error fetching challenges:', error);
  }
}

// Update blocking rules based on challenges
function updateBlockingRules(challenges) {
  // Clear existing blocked URLs
  blockedUrls.clear();
  
  console.log('Updating blocking rules for', challenges.length, 'challenges');
  
  // Collect URLs from all active, non-completed challenges
  challenges.forEach(challenge => {
    console.log('Processing challenge:', challenge.name, 'Type:', challenge.challenge_type, 'Completed:', challenge.completed);
    
    // Check if challenge is completed
    if (challenge.completed) {
      console.log('  Skipping completed challenge:', challenge.name);
      return;
    }
    
    // Check if challenge is active
    const isActive = challenge.challenge_type === 'toggle'
      ? challenge.toggle_details?.is_active
      : isTimeBasedActive(challenge);
    
    console.log('  Challenge active:', isActive);
    
    if (!isActive) {
      console.log('  Skipping inactive challenge:', challenge.name);
      return;
    }
    
    // Add websites to blocked list
    if (challenge.distracting_websites && challenge.distracting_websites.length > 0) {
      console.log('  Adding', challenge.distracting_websites.length, 'websites to block list');
      challenge.distracting_websites.forEach(website => {
        const normalized = normalizeUrl(website.url);
        console.log('    Blocking:', website.url, '->', normalized);
        blockedUrls.add(normalized);
      });
    } else {
      console.log('  No websites to block for this challenge');
    }
  });
  
  console.log('Final blocked URLs:', Array.from(blockedUrls));
}

// Check if time-based challenge is active
function isTimeBasedActive(challenge) {
  if (challenge.challenge_type !== 'time_based' || !challenge.time_based_details) {
    return false;
  }
  
  const now = new Date();
  const start = new Date(challenge.time_based_details.start_date);
  const end = new Date(challenge.time_based_details.end_date);
  
  return now >= start && now <= end;
}

// Normalize URL to match against
function normalizeUrl(url) {
  // Remove protocol
  let normalized = url.replace(/^https?:\/\//, '');
  // Remove www.
  normalized = normalized.replace(/^www\./, '');
  // Remove trailing slash
  normalized = normalized.replace(/\/$/, '');
  return normalized.toLowerCase();
}

// Check if a URL is blocked
function isUrlBlocked(url) {
  if (!url) return false;
  
  const normalized = normalizeUrl(url);
  console.log('Checking if URL is blocked:', url, '->', normalized);
  
  // Check exact match
  if (blockedUrls.has(normalized)) {
    console.log('  BLOCKED (exact match)');
    return true;
  }
  
  // Check if any blocked URL is a parent domain or matches
  for (const blockedUrl of blockedUrls) {
    if (normalized.includes(blockedUrl) || normalized.startsWith(blockedUrl)) {
      console.log('  BLOCKED (matches:', blockedUrl, ')');
      return true;
    }
  }
  
  console.log('  NOT BLOCKED');
  return false;
}

// Listen for tab updates to block websites
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Only check when URL is present in the change
  if (changeInfo.url) {
    console.log('Tab updated with URL:', changeInfo.url);
    
    if (isUrlBlocked(changeInfo.url)) {
      console.log('BLOCKING tab:', tabId, 'URL:', changeInfo.url);
      
      // Redirect to block page
      chrome.tabs.update(tabId, {
        url: createBlockPage(changeInfo.url)
      });
    }
  }
});

// Listen for navigation events
chrome.webNavigation.onBeforeNavigate.addListener((details) => {
  if (details.frameId === 0) { // Only main frame
    console.log('Navigation to:', details.url);
    
    if (isUrlBlocked(details.url)) {
      console.log('BLOCKING navigation:', details.url);
      
      chrome.tabs.update(details.tabId, {
        url: createBlockPage(details.url)
      });
    }
  }
});

// Create a block page HTML
function createBlockPage(blockedUrl) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Website Blocked - Klariti</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
    .container {
      text-align: center;
      padding: 40px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      backdrop-filter: blur(10px);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      max-width: 500px;
    }
    h1 {
      font-size: 48px;
      margin: 0 0 20px 0;
    }
    h2 {
      font-size: 24px;
      margin: 0 0 30px 0;
      font-weight: 400;
    }
    p {
      font-size: 16px;
      line-height: 1.6;
      margin-bottom: 30px;
      opacity: 0.9;
    }
    .blocked-url {
      background: rgba(255, 255, 255, 0.2);
      padding: 12px 20px;
      border-radius: 8px;
      font-family: monospace;
      word-break: break-all;
      margin-bottom: 30px;
    }
    .btn {
      display: inline-block;
      padding: 12px 30px;
      background: white;
      color: #667eea;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      transition: transform 0.2s;
    }
    .btn:hover {
      transform: scale(1.05);
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🎯</h1>
    <h2>Stay Focused!</h2>
    <p>This website is blocked as part of your active Klariti challenge.</p>
    <div class="blocked-url">${escapeHtml(blockedUrl)}</div>
    <p>You're doing great! Keep up the good work and stay focused on what matters.</p>
    <a href="https://klariti.so/dashboard" class="btn">View Dashboard</a>
  </div>
</body>
</html>
  `;
  
  return 'data:text/html;charset=utf-8,' + encodeURIComponent(html);
}

// Escape HTML
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// WebSocket connection for real-time updates
function connectWebSocket() {
  try {
    wsConnection = new WebSocket(config.wsUrl);
    
    wsConnection.onopen = () => {
      console.log('Background WebSocket connected');
    };
    
    wsConnection.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('Background WebSocket message:', data);
        
        if (data.type === 'challenge_toggled') {
          // Refresh challenges when a toggle occurs
          console.log('Challenge toggled, refreshing...');
          updateChallengesAndBlocking();
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    wsConnection.onerror = (error) => {
      console.error('Background WebSocket error:', error);
    };
    
    wsConnection.onclose = () => {
      console.log('Background WebSocket disconnected');
      wsConnection = null;
      
      // Attempt to reconnect after 5 seconds
      reconnectTimeout = setTimeout(() => {
        chrome.storage.local.get('access_token', ({ access_token }) => {
          if (access_token) {
            console.log('Attempting WebSocket reconnect...');
            connectWebSocket();
          }
        });
      }, 5000);
    };
  } catch (error) {
    console.error('Error creating background WebSocket:', error);
  }
}

// Periodic check for time-based challenges (every minute)
chrome.alarms.create('checkTimedChallenges', { periodInMinutes: 1 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'checkTimedChallenges') {
    console.log('Periodic check: updating challenges...');
    chrome.storage.local.get(['access_token', 'challenges'], ({ access_token, challenges }) => {
      if (access_token && challenges) {
        // Check if any time-based challenge status changed
        updateBlockingRules(challenges);
      }
    });
  }
});
