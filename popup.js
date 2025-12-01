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

// Modal Elements
const challengeModal = document.getElementById('challengeModal');
const modalCloseBtn = document.getElementById('modalCloseBtn');
const modalTitle = document.getElementById('modalTitle');
const modalBadges = document.getElementById('modalBadges');
const modalDescription = document.getElementById('modalDescription');
const modalTimeDetails = document.getElementById('modalTimeDetails');
const modalStartDate = document.getElementById('modalStartDate');
const modalEndDate = document.getElementById('modalEndDate');
const modalToggleDetails = document.getElementById('modalToggleDetails');
const modalToggleStatus = document.getElementById('modalToggleStatus');
const modalToggleIndicator = document.getElementById('modalToggleIndicator');
const modalWebsiteCount = document.getElementById('modalWebsiteCount');
const modalWebsites = document.getElementById('modalWebsites');

// State
let currentUser = null;
let challenges = [];
// WebSocket handled by background script


// Initialize popup
// Initialize popup
// Initialize popup
async function init() {
  // Check if user is already logged in and load cached challenges and connection status
  const { access_token, username, challenges: storedChallenges, connectionStatus: storedStatus } = await chrome.storage.local.get(['access_token', 'username', 'challenges', 'connectionStatus']);
  
  // Update connection status immediately if available
  if (storedStatus) {
    updateConnectionStatusUI(storedStatus === 'connected');
  }

  if (access_token && username) {
    try {
      // Verify user identity matches stored data
      const response = await fetch(`${config.apiUrl}/me`, {
        headers: {
          'Authorization': `Bearer ${access_token}`
        }
      });

      if (!response.ok) {
        throw new Error('Token invalid or expired');
      }

      const userData = await response.json();
      
      // Verify username matches (case-insensitive)
      if (userData.username.toLowerCase() !== username.toLowerCase()) {
        console.warn('Stored username does not match authenticated user. Clearing session.');
        await chrome.storage.local.remove(['access_token', 'username', 'challenges']);
        showAuthView();
        return;
      }

      currentUser = { access_token, username };
      if (storedChallenges) {
        challenges = storedChallenges;
      }
      await showChallengesView();
    } catch (error) {
      console.error('Session verification failed:', error);
      // Clear invalid session
      await chrome.storage.local.remove(['access_token', 'username', 'challenges']);
      showAuthView();
    }
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
// Show challenges view
// Show challenges view
async function showChallengesView() {
  loadingSection.style.display = 'none';
  authSection.style.display = 'none';
  challengesSection.style.display = 'flex';
  
  userName.textContent = currentUser.username;
  
  // Initial render with whatever we have
  renderChallenges();
  
  // Trigger connection check in background
  chrome.runtime.sendMessage({ action: 'check_connection' }, (response) => {
    if (response && response.status) {
      updateConnectionStatusUI(response.status === 'connected');
    }
  });
  
  // Listen for updates from background script (via storage)
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local') {
      if (changes.challenges) {
        console.log('Challenges updated in storage, re-rendering...');
        challenges = changes.challenges.newValue;
        renderChallenges();
      }
      if (changes.connectionStatus) {
        console.log('Connection status updated:', changes.connectionStatus.newValue);
        updateConnectionStatusUI(changes.connectionStatus.newValue === 'connected');
      }
    }
  });
}

// Helper to update connection status UI
function updateConnectionStatusUI(isConnected) {
  if (isConnected) {
    connectionStatus.textContent = '🟢 Connected';
    connectionStatus.className = 'connection-status connected';
  } else {
    connectionStatus.textContent = '🔴 Disconnected';
    connectionStatus.className = 'connection-status disconnected';
  }
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
  // Security check: Prevent logout if there are active challenges
  if (hasActiveChallenges()) {
    console.warn('Logout prevented: Active challenges exist');
    // Optionally show a message to the user
    alert('Cannot logout while you have active challenges. Please pause or complete your challenges first.');
    return;
  }
  
  // WebSocket handled by background script
  
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

// Fetch challenges with retry logic
async function fetchChallenges(retryCount = 0) {
  const maxRetries = 3;
  const retryDelay = 2000; // 2 seconds
  
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
      // Check if it's an authentication error (401 or 403)
      if (response.status === 401 || response.status === 403) {
        console.error('Authentication failed - token may be expired');
        // Clear invalid credentials and force re-login
        await chrome.storage.local.remove(['access_token', 'username', 'challenges']);
        chrome.runtime.sendMessage({ action: 'user_logged_out' });
        currentUser = null;
        challenges = [];
        showAuthView();
        showAuthError('Session expired. Please login again.');
        return;
      }
      
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
    
    // Try to load from local storage first
    const storedData = await chrome.storage.local.get(['challenges']);
    if (storedData.challenges && storedData.challenges.length > 0) {
      console.log('Loading challenges from local storage');
      challenges = storedData.challenges;
      renderChallenges();
      
      // Still retry in background to get fresh data
      if (retryCount < maxRetries) {
        setTimeout(() => {
          fetchChallenges(retryCount + 1);
        }, retryDelay);
      }
      return;
    }
    
    // Retry logic if no cached data
    if (retryCount < maxRetries) {
      console.log(`Retrying... (${retryCount + 1}/${maxRetries})`);
      challengesList.innerHTML = `<div class="loading">Connection failed. Retrying... (${retryCount + 1}/${maxRetries})</div>`;
      
      setTimeout(() => {
        fetchChallenges(retryCount + 1);
      }, retryDelay);
    } else {
      // Max retries reached, show error but don't block UI
      challengesList.innerHTML = `<div class="error-message">Failed to load challenges. Please check if the API is running at ${config.apiUrl}. <button id="retryBtn" style="margin-left: 10px; padding: 4px 8px; cursor: pointer;">Retry</button></div>`;
      
      // Add retry button listener
      const retryBtn = document.getElementById('retryBtn');
      if (retryBtn) {
        retryBtn.addEventListener('click', () => fetchChallenges(0));
      }
    }
  }
}

// Render challenges
function renderChallenges() {
  challengesList.innerHTML = '';
  
  // Filter to only show active challenges (not completed and currently active)
  const activeChallenges = challenges.filter(challenge => {
    if (challenge.completed) {
      return false;
    }
    
    const isActive = challenge.challenge_type === 'toggle' 
      ? challenge.toggle_details?.is_active 
      : isTimeBasedActive(challenge);
    
    return isActive;
  });
  
  if (activeChallenges.length === 0) {
    challengesList.innerHTML = '<div class="no-challenges">No active challenges. Create one at klariti.so!</div>';
    updateLogoutButtonVisibility();
    return;
  }
  
  activeChallenges.forEach(challenge => {
    const isActive = challenge.challenge_type === 'toggle' 
      ? challenge.toggle_details?.is_active 
      : isTimeBasedActive(challenge);
    
    const statusClass = challenge.completed ? 'completed' : (isActive ? 'active' : 'paused');
    const statusText = challenge.completed ? 'Completed' : (isActive ? 'Active' : 'Paused');
    
    const websites = challenge.distracting_websites || [];
    const websiteText = websites.length > 0 
      ? `Blocking: ${websites.map(w => w.name || w.url).join(', ')}`
      : 'No websites blocked';
    
    const item = document.createElement('div');
    item.className = `challenge-item ${isActive && !challenge.completed ? 'active' : ''}`;
    item.style.cursor = 'pointer';
    item.innerHTML = `
      <div class="challenge-name">
        ${escapeHtml(challenge.name)}
        <span class="status-badge status-${statusClass}">${statusText}</span>
      </div>
      <div class="challenge-status">
        ${challenge.strict_mode ? '🔒 Strict Mode' : ''}
      </div>
      <div class="challenge-websites">${websiteText}</div>
    `;
    
    item.addEventListener('click', () => openModal(challenge));
    challengesList.appendChild(item);
  });
  
  // Update logout button visibility based on active challenges
  updateLogoutButtonVisibility();
}

// Check if time-based challenge is active
function isTimeBasedActive(challenge) {
  if (challenge.challenge_type !== 'time_based' || !challenge.time_based_details) {
    return false;
  }
  
  const now = new Date();
  const startString = challenge.time_based_details.start_date;
  const endString = challenge.time_based_details.end_date;
  
  const start = new Date(startString.endsWith("Z") ? startString : `${startString}Z`);
  const end = new Date(endString.endsWith("Z") ? endString : `${endString}Z`);
  
  return now >= start && now <= end;
}

// Check if there are any active challenges
function hasActiveChallenges() {
  return challenges.some(challenge => {
    if (challenge.completed) return false;
    
    const isActive = challenge.challenge_type === 'toggle' 
      ? challenge.toggle_details?.is_active 
      : isTimeBasedActive(challenge);
    
    return isActive;
  });
}

// Update logout button visibility based on active challenges
function updateLogoutButtonVisibility() {
  if (hasActiveChallenges()) {
    logoutBtn.style.display = 'flex';
  } else {
    logoutBtn.style.display = 'flex';
  }
}

// WebSocket connection handled by background script
// Popup listens to storage changes for updates

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

// Modal Functions
function openModal(challenge) {
  modalTitle.textContent = challenge.name;
  
  // Badges
  modalBadges.innerHTML = '';
  
  // Status Badge
  const isActive = challenge.challenge_type === 'toggle' 
    ? challenge.toggle_details?.is_active 
    : isTimeBasedActive(challenge);
  
  const statusBadge = document.createElement('span');
  statusBadge.className = 'modal-badge';
  if (challenge.completed) {
    statusBadge.textContent = 'Completed';
    statusBadge.style.backgroundColor = 'rgba(34, 197, 94, 0.1)';
    statusBadge.style.color = '#4ADE80';
  } else if (isActive) {
    statusBadge.textContent = 'Active';
    statusBadge.style.backgroundColor = 'rgba(34, 197, 94, 0.1)';
    statusBadge.style.color = '#4ADE80';
  } else {
    statusBadge.textContent = 'Paused';
    statusBadge.style.backgroundColor = 'rgba(245, 158, 11, 0.1)';
    statusBadge.style.color = '#FBBF24';
  }
  modalBadges.appendChild(statusBadge);
  
  // Type Badge
  const typeBadge = document.createElement('span');
  typeBadge.className = 'modal-badge';
  typeBadge.textContent = challenge.challenge_type === 'time_based' ? 'Time Based' : 'Toggle';
  typeBadge.style.backgroundColor = '#27272A';
  typeBadge.style.color = '#A1A1AA';
  typeBadge.style.border = '1px solid #3F3F46';
  modalBadges.appendChild(typeBadge);
  
  // Strict Mode Badge
  if (challenge.strict_mode) {
    const strictBadge = document.createElement('span');
    strictBadge.className = 'modal-badge';
    strictBadge.textContent = 'Strict Mode';
    strictBadge.style.backgroundColor = 'rgba(249, 115, 22, 0.1)';
    strictBadge.style.color = '#FB923C';
    modalBadges.appendChild(strictBadge);
  }
  
  // Description
  if (challenge.description) {
    modalDescription.querySelector('p').textContent = challenge.description;
    modalDescription.style.display = 'block';
  } else {
    modalDescription.style.display = 'none';
  }
  
  // Time Details
  if (challenge.challenge_type === 'time_based' && challenge.time_based_details) {
    const startString = challenge.time_based_details.start_date;
    const endString = challenge.time_based_details.end_date;
    const start = new Date(startString.endsWith("Z") ? startString : `${startString}Z`);
    const end = new Date(endString.endsWith("Z") ? endString : `${endString}Z`);
    
    modalStartDate.textContent = start.toLocaleString();
    modalEndDate.textContent = end.toLocaleString();
    modalTimeDetails.style.display = 'block';
    modalToggleDetails.style.display = 'none';
  } else if (challenge.challenge_type === 'toggle' && challenge.toggle_details) {
    // Toggle Details
    const isToggleActive = challenge.toggle_details.is_active;
    modalToggleStatus.textContent = isToggleActive ? 'Active' : 'Inactive';
    modalToggleIndicator.style.backgroundColor = isToggleActive ? '#22C55E' : '#52525B';
    modalToggleIndicator.style.boxShadow = isToggleActive ? '0 0 8px rgba(34, 197, 94, 0.5)' : 'none';
    
    modalTimeDetails.style.display = 'none';
    modalToggleDetails.style.display = 'block';
  }
  
  // Websites
  const websites = challenge.distracting_websites || [];
  modalWebsiteCount.textContent = websites.length;
  modalWebsites.innerHTML = '';
  
  if (websites.length > 0) {
    websites.forEach(site => {
      const div = document.createElement('div');
      div.className = 'website-item';
      div.innerHTML = `
        <div class="website-icon">${site.url.charAt(0).toUpperCase()}</div>
        <div class="website-url">${escapeHtml(site.url)}</div>
      `;
      modalWebsites.appendChild(div);
    });
  } else {
    modalWebsites.innerHTML = '<p style="font-size: 13px; color: #71717A; font-style: italic;">No websites blocked.</p>';
  }
  
  challengeModal.style.display = 'flex';
}

function closeModal() {
  challengeModal.style.display = 'none';
}

// Modal Event Listeners
modalCloseBtn.addEventListener('click', closeModal);
challengeModal.addEventListener('click', (e) => {
  if (e.target === challengeModal) {
    closeModal();
  }
});

// Initialize on load
// Initialize on load
try {
  init().catch(err => {
    console.error('Init error:', err);
    loadingSection.innerHTML = `<div style="color: red; padding: 20px;">Error initializing: ${err.message}</div>`;
  });
} catch (err) {
  console.error('Top-level error:', err);
  loadingSection.innerHTML = `<div style="color: red; padding: 20px;">Critical error: ${err.message}</div>`;
}
