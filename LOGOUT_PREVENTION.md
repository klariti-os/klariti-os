# Logout Prevention for Active Challenges

## Overview
This document describes the implementation of logout prevention when users have active challenges in the Chromium extension.

## Implementation Details

### Changes Made to `popup.html`

#### 1. Set Logout Button to Hidden by Default
```html
<button id="logoutBtn" class="btn btn-secondary btn-logout" style="display: none;">Logout</button>
```

This prevents any timing exploits during the loading period where a user might try to quickly click logout before challenges are loaded.

### Changes Made to `popup.js`

#### 1. Added Security Check in Logout Handler
```javascript
logoutBtn.addEventListener('click', async () => {
  // Security check: Prevent logout if there are active challenges
  if (hasActiveChallenges()) {
    console.warn('Logout prevented: Active challenges exist');
    alert('Cannot logout while you have active challenges. Please pause or complete your challenges first.');
    return;
  }
  // ... rest of logout logic
});
```

This provides a second layer of protection, ensuring that even if someone tries to programmatically trigger the logout (via console or timing exploit), it will be blocked if there are active challenges.

#### 2. Added `hasActiveChallenges()` Function
```javascript
function hasActiveChallenges() {
  return challenges.some(challenge => {
    if (challenge.completed) return false;
    
    const isActive = challenge.challenge_type === 'toggle' 
      ? challenge.toggle_details?.is_active 
      : isTimeBasedActive(challenge);
    
    return isActive;
  });
}
```

This function checks if there are any active challenges by:
- Filtering out completed challenges
- For toggle challenges: checking if `toggle_details.is_active` is true
- For time-based challenges: checking if the current time is within the start and end dates

#### 3. Added `updateLogoutButtonVisibility()` Function
```javascript
function updateLogoutButtonVisibility() {
  if (hasActiveChallenges()) {
    logoutBtn.style.display = 'none';
  } else {
    logoutBtn.style.display = 'flex';
  }
}
```

This function:
- Hides the logout button (`display: none`) when there are active challenges
- Shows the logout button (`display: flex`) when there are no active challenges

#### 4. Updated `renderChallenges()` Function
The function now calls `updateLogoutButtonVisibility()` after rendering challenges:
- When there are no challenges (logout button will be shown)
- After rendering all challenges (logout button visibility will be updated based on active challenges)

## Security Measures

This implementation uses **multiple layers of protection** to prevent logout exploits:

### Layer 1: Default Hidden State
The logout button starts with `display: none` in the HTML. This prevents timing exploits where a user might try to click logout during the brief loading period before challenges are fetched.

### Layer 2: Dynamic Visibility Control
The `updateLogoutButtonVisibility()` function is called whenever challenges are rendered or updated, ensuring the button state is always in sync with the current challenge state.

### Layer 3: Logout Handler Validation
Even if someone bypasses the UI (e.g., via browser console or programmatic trigger), the logout handler itself checks for active challenges and blocks the logout with an alert message.

These three layers ensure that logout is **impossible** when there are active challenges, regardless of the method used to attempt it.


## Behavior

### When User Has Active Challenges
- The logout button is completely hidden from the UI
- Users cannot logout while they have active challenges
- This prevents users from circumventing their challenges by logging out

### When User Has No Active Challenges
- The logout button is visible and functional
- Users can logout normally
- This includes cases where:
  - There are no challenges at all
  - All challenges are completed
  - All challenges are paused (toggle challenges set to inactive, or time-based challenges outside their time window)

## Challenge Types

### Toggle Challenges
A toggle challenge is considered active when:
- `challenge.challenge_type === 'toggle'`
- `challenge.toggle_details.is_active === true`
- `challenge.completed === false`

### Time-Based Challenges
A time-based challenge is considered active when:
- `challenge.challenge_type === 'time_based'`
- Current time is between `time_based_details.start_date` and `time_based_details.end_date`
- `challenge.completed === false`

## Real-time Updates

The logout button visibility is updated:
1. When challenges are initially loaded
2. When challenges are re-fetched from the API
3. When WebSocket messages update challenge states (e.g., when a toggle challenge is activated/deactivated)

This ensures the logout button visibility is always in sync with the current state of challenges.
