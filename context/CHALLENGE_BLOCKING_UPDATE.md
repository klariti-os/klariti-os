# Challenge-Based Website Blocking Update

## Summary
The Klariti Chrome extension now efficiently monitors and blocks websites listed in active challenges. When a user tries to visit a blocked site, the extension **immediately closes the tab** and opens the `https://klariti.so/lock` page. This approach is resource-efficient and provides clear feedback to the user.

## Changes Made

### 1. **background.js** - Core Blocking Logic

#### Added Functions:
- **`updateChallengesAndBlocking()`** - Fetches challenges from API and updates blocking rules
- **`updateBlockingRules(challenges)`** - Processes challenges and populates the blocked URLs set
- **`isTimeBasedActive(challenge)`** - Checks if time-based challenges are currently active
- **`normalizeUrl(url)`** - Normalizes URLs for consistent matching
- **`isUrlBlocked(url)`** - Checks if a URL is in the blocked list
- **`checkAllTabsForBlockedUrls()`** - Scans all open tabs and closes any matching URLs, then opens lock page
- **`connectWebSocket()`** - Establishes WebSocket connection for real-time challenge updates
- **`fetchStateFromApi()`** - Periodic refresh of challenge data

#### Blocking Behavior:
Instead of redirecting to a block page, the extension now:
1. Opens `https://klariti.so/lock` page
2. Closes the blocked tab immediately
3. This provides a cleaner UX and uses fewer resources

#### Updated Event Listeners:
- **`chrome.tabs.onUpdated`** - Closes tabs navigating to blocked URLs
- **`chrome.tabs.onCreated`** - Closes new tabs opening blocked sites
- **`chrome.tabs.onActivated`** - Closes tabs when user switches to blocked content
- **`chrome.webNavigation.onBeforeNavigate`** - Intercepts and closes navigation before it starts
- **`chrome.webNavigation.onCommitted`** - Catches and closes navigation via history/bookmarks
- **`chrome.alarms.onAlarm`** - Added `checkTimedChallenges` alarm for time-based challenges
- **`chrome.runtime.onMessage`** - Added handlers for:
  - `user_logged_in` - Refreshes challenges on login
  - `user_logged_out` - Clears blocking rules on logout
  - `challenges_updated` - Updates blocking rules when challenges change

#### Added Variables:
- `blockedUrls` - Set of normalized URLs to block
- `wsConnection` - WebSocket connection for real-time updates
- `reconnectTimeout` - Manages WebSocket reconnection
- `isRecommendationsHidden` - YouTube recommendations state
- `isApiStateForceHide` - API-driven hiding state

### 2. **content.js** - Simplified

Simplified to minimal functionality:
- No longer blocks content client-side
- Only handles YouTube-specific message passing
- All blocking is handled by background.js closing tabs

### 3. **manifest.json** - Configuration Update

- Changed service worker from `background-new.js` to `background.js`
- Content script configured to run on all URLs at document_start

## How It Works

### Challenge Detection Flow:
1. User logs in → Extension fetches challenges via API
2. Active challenges with distracting websites are identified
3. URLs are normalized and added to `blockedUrls` Set
4. WebSocket connection established for real-time updates

### Blocking Flow:
When a blocked URL is detected:
1. Extension opens `https://klariti.so/lock` in a new tab
2. Extension closes the tab with the blocked URL
3. User sees the lock page with information about their challenge

### Detection Points:
- **Tab Creation**: New tabs are checked immediately
- **Tab Update**: URL changes are intercepted
- **Tab Activation**: Switching to a tab triggers a block check
- **Navigation Events**: History/bookmark navigation is intercepted

### Real-Time Updates:
- WebSocket connection listens for challenge toggles
- When challenges are updated, blocking rules refresh automatically
- All open tabs are re-checked and closed if they match new rules
- Automatic reconnection if WebSocket disconnects

### Time-Based Challenges:
- Checked every minute via alarm
- Start/end dates compared to current time
- Rules updated when challenges become active/inactive

## Testing Checklist

- [ ] Create a challenge with blocked websites
- [ ] Verify blocked sites are immediately closed and lock page opens
- [ ] Toggle challenge off - verify sites become accessible
- [ ] Toggle challenge on - verify immediate tab closing
- [ ] Test with multiple challenges
- [ ] Test time-based challenges (start/end dates)
- [ ] Verify completed challenges don't block
- [ ] Test with tabs already open when challenge activated
- [ ] Test opening new tabs to blocked sites
- [ ] Test navigating to blocked sites from other pages
- [ ] Test using history/bookmarks to blocked sites
- [ ] Verify WebSocket updates work in real-time
- [ ] Test after browser restart
- [ ] Test after extension reload
- [ ] Verify only one lock page opens when multiple blocked tabs close
- [ ] Check that extension uses minimal CPU/memory resources

## Performance Benefits

### Resource Efficiency:
- **No constant monitoring**: Extension only checks URLs during navigation events
- **No DOM manipulation**: Doesn't inject blocking content into pages
- **Clean tab closure**: Simply closes tabs instead of loading block pages
- **Minimal memory**: Only stores blocked URL set, no per-tab state
- **Efficient matching**: Uses Set for O(1) exact lookups, minimal iteration for pattern matching

### User Experience:
- **Instant feedback**: Lock page appears immediately when blocked site is accessed
- **Clear communication**: Single lock page shows challenge information
- **No resource waste**: Blocked sites never load, saving bandwidth and CPU
- **Consistent behavior**: Same experience regardless of how site is accessed

## API Integration

### Endpoint Used:
```
GET ${config.apiUrl}/challenges/my-challenges?skip=0&limit=100
Authorization: Bearer {access_token}
```

### Expected Challenge Structure:
```json
{
  "name": "Challenge Name",
  "challenge_type": "toggle" | "time_based",
  "completed": false,
  "toggle_details": {
    "is_active": true
  },
  "time_based_details": {
    "start_date": "2025-01-01T00:00:00",
    "end_date": "2025-12-31T23:59:59"
  },
  "distracting_websites": [
    {
      "url": "facebook.com"
    },
    {
      "url": "twitter.com"
    }
  ]
}
```

### WebSocket Events:
- **Connection**: `${config.wsUrl}` (e.g., `ws://127.0.0.1:8081/challenges/ws`)
- **Events Handled**:
  - `challenge_toggled` - Refreshes all challenges
  - `challenge_updated` - Refreshes all challenges

## Notes

- URL matching is flexible (matches subdomains and paths)
- Both `www.` and non-www versions are matched
- Protocol (http/https) doesn't matter
- Blocking works even if content script fails (background handles it)
- Extension survives browser restarts and maintains blocking
- All tabs are checked every 6 seconds for YouTube (existing alarm)
- Challenges are checked every minute for time-based updates
