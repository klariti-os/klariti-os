// popup.js - Handle authentication and display challenges

// Import config
// Note: config.js is loaded before this script in popup.html

// UI Elements
const authSection = document.getElementById('authSection');
const challengesSection = document.getElementById('challengesSection');
const loadingSection = document.getElementById('loadingSection');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const authError = document.getElementById('authError');
const userName = document.getElementById('userName');
const challengesList = document.getElementById('challengesList');
const connectionStatus = document.getElementById('connectionStatus');

// State
let currentUser = null;
let challenges = [];
let wsConnection = null;

// Initialize popup
async function init() {
  // Check if user is already logged in
  const { access_token, username } = await chrome.storage.local.get(['access_token', 'username']);
  
  if (access_token && username) {
    currentUser = { access_token, username };
    await showChallengesView();
  } else {
    showAuthView();
  }
}

// Show authentication view
function showAuthView() {
  loadingSection.style.display = 'none';
  authSection.style.display = 'flex';
  challengesSection.style.display = 'none';
}

// Show challenges view
async function showChallengesView() {
  loadingSection.style.display = 'none';
  authSection.style.display = 'none';
  challengesSection.style.display = 'flex';
  
  userName.textContent = currentUser.username;
  
  // Fetch challenges
  await fetchChallenges();
  
  // Connect to WebSocket
  connectWebSocket();
}

// Handle login
loginBtn.addEventListener('click', async () => {
  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();
  
  if (!username || !password) {
    showAuthError('Please enter username and password');
    return;
  }
  
  loginBtn.disabled = true;
  loginBtn.textContent = 'Logging in...';
  authError.style.display = 'none';
  
  try {
    // Create form data for OAuth2 password flow
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    
    const response = await fetch(`${config.apiUrl}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Login failed');
    }
    
    const data = await response.json();
    
    // Store credentials
    await chrome.storage.local.set({
      access_token: data.access_token,
      username: username,
    });
    
    currentUser = { access_token: data.access_token, username };
    
    // Notify background script
    chrome.runtime.sendMessage({ action: 'user_logged_in', username });
    
    await showChallengesView();
  } catch (error) {
    showAuthError(error.message);
  } finally {
    loginBtn.disabled = false;
    loginBtn.textContent = 'Login';
  }
});

// Handle logout
logoutBtn.addEventListener('click', async () => {
  // Close WebSocket
  if (wsConnection) {
    wsConnection.close();
    wsConnection = null;
  }
  
  // Clear storage
  await chrome.storage.local.remove(['access_token', 'username', 'challenges']);
  
  // Notify background script
  chrome.runtime.sendMessage({ action: 'user_logged_out' });
  
  currentUser = null;
  challenges = [];
  usernameInput.value = '';
  passwordInput.value = '';
  
  showAuthView();
});

// Show auth error
function showAuthError(message) {
  authError.textContent = message;
  authError.style.display = 'block';
}

// Fetch challenges
async function fetchChallenges() {
  try {
    challengesList.innerHTML = '<div class="loading">Loading challenges...</div>';
    
    // Use the correct endpoint that matches klariti.so frontend
    const response = await fetch(`${config.apiUrl}/challenges/my-challenges?skip=0&limit=100`, {
      headers: {
        'Authorization': `Bearer ${currentUser.access_token}`,
        'Content-Type': 'application/json'
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to fetch challenges:', response.status, errorText);
      throw new Error(`Failed to fetch challenges: ${response.status}`);
    }
    
    challenges = await response.json();
    
    // Store challenges in local storage
    await chrome.storage.local.set({ challenges });
    
    // Update UI
    renderChallenges();
    
    // Notify background script to update blocking rules
    chrome.runtime.sendMessage({ action: 'challenges_updated', challenges });
  } catch (error) {
    console.error('Error fetching challenges:', error);
    challengesList.innerHTML = `<div class="error-message">Failed to load challenges: ${error.message}</div>`;
  }
}

// Render challenges
function renderChallenges() {
  if (challenges.length === 0) {
    challengesList.innerHTML = '<div class="no-challenges">No active challenges. Create one at klariti.so!</div>';
    return;
  }
  
  challengesList.innerHTML = challenges.map(challenge => {
    const isActive = challenge.challenge_type === 'toggle' 
      ? challenge.toggle_details?.is_active 
      : isTimeBasedActive(challenge);
    
    const statusClass = challenge.completed ? 'completed' : (isActive ? 'active' : 'paused');
    const statusText = challenge.completed ? 'Completed' : (isActive ? 'Active' : 'Paused');
    
    const websites = challenge.distracting_websites || [];
    const websiteText = websites.length > 0 
      ? `Blocking: ${websites.map(w => w.name || w.url).join(', ')}`
      : 'No websites blocked';
    
    return `
      <div class="challenge-item ${isActive && !challenge.completed ? 'active' : ''}">
        <div class="challenge-name">
          ${escapeHtml(challenge.name)}
          <span class="status-badge status-${statusClass}">${statusText}</span>
        </div>
        <div class="challenge-status">
          ${challenge.strict_mode ? '🔒 Strict Mode' : ''}
        </div>
        <div class="challenge-websites">${websiteText}</div>
      </div>
    `;
  }).join('');
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

// WebSocket connection
function connectWebSocket() {
  try {
    wsConnection = new WebSocket(config.wsUrl);
    
    wsConnection.onopen = () => {
      console.log('WebSocket connected');
      connectionStatus.textContent = '🟢 Connected';
      connectionStatus.className = 'connection-status connected';
    };
    
    wsConnection.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('WebSocket message:', data);
        
        if (data.type === 'challenge_toggled') {
          // Refresh challenges when a toggle occurs
          fetchChallenges();
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    wsConnection.onerror = (error) => {
      console.error('WebSocket error:', error);
      connectionStatus.textContent = '🔴 Connection Error';
      connectionStatus.className = 'connection-status disconnected';
    };
    
    wsConnection.onclose = () => {
      console.log('WebSocket disconnected');
      connectionStatus.textContent = '🔴 Disconnected';
      connectionStatus.className = 'connection-status disconnected';
      
      // Attempt to reconnect after 3 seconds
      setTimeout(() => {
        if (currentUser) {
          connectWebSocket();
        }
      }, 3000);
    };
  } catch (error) {
    console.error('Error creating WebSocket:', error);
    connectionStatus.textContent = '🔴 Connection Failed';
    connectionStatus.className = 'connection-status disconnected';
  }
}

// Utility function to escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Handle Enter key for login
usernameInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    passwordInput.focus();
  }
});

passwordInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    loginBtn.click();
  }
});

// Initialize on load
init();
