# Debugging Guide for Challenge Blocking

## How to Debug the Extension

### 1. Open Extension Console
1. Go to `chrome://extensions`
2. Find "Klariti OS" extension
3. Click "Inspect views: service worker" (or "Inspect views: background page")
4. This opens the extension console where you can see all logs

### 2. Check What's Happening

When you activate a challenge, you should see logs like:

```
🔄 Updating blocking rules for 1 challenges
📝 Processing challenge: "My Challenge" | Type: toggle | Completed: false
  ✅ Challenge active: true
  🚫 Adding 2 websites to block list:
     • facebook.com → facebook.com
     • twitter.com → twitter.com

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 Final blocked URLs: ['facebook.com', 'twitter.com']
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Creating blocking rules for: facebook.com
Creating blocking rules for: twitter.com
✅ Added 16 declarativeNetRequest blocking rules for 2 domains
Blocked domains: Set(2) {'facebook.com', 'twitter.com'}

🔍 Checking 5 tabs for blocked URLs
📋 Currently blocked URLs: Set(2) {'facebook.com', 'twitter.com'}
✅ No blocked tabs found
```

### 3. Test Blocking

#### Step 1: Check if rules are active
In extension console, run:
```javascript
chrome.declarativeNetRequest.getDynamicRules().then(rules => {
  console.log('Active blocking rules:', rules);
});
```

You should see rules like:
```javascript
[
  {
    id: 1,
    action: { type: "redirect", redirect: { url: "https://klariti.so/lock" } },
    condition: { urlFilter: "*://*.facebook.com/*", resourceTypes: ["main_frame"] }
  },
  // ... more rules
]
```

#### Step 2: Check blocked URLs
In extension console, run:
```javascript
chrome.storage.local.get('challenges', (data) => {
  console.log('Challenges:', data.challenges);
});
```

#### Step 3: Try to visit a blocked site
1. Create a challenge with a blocked website (e.g., facebook.com)
2. Toggle the challenge ON
3. Try to visit facebook.com
4. You should be **immediately redirected** to klariti.so/lock

### 4. Common Issues

#### Issue: Sites are not being blocked

**Check 1:** Are challenges being fetched?
```javascript
// In extension console
chrome.storage.local.get('challenges', console.log);
```

**Check 2:** Is the challenge active?
```javascript
// In extension console
chrome.storage.local.get('challenges', (data) => {
  data.challenges.forEach(c => {
    console.log('Challenge:', c.name);
    console.log('  Type:', c.challenge_type);
    console.log('  Completed:', c.completed);
    console.log('  Active:', c.toggle_details?.is_active || 'N/A');
    console.log('  Websites:', c.distracting_websites);
  });
});
```

**Check 3:** Are blocking rules created?
```javascript
// In extension console
chrome.declarativeNetRequest.getDynamicRules().then(console.log);
```

**Check 4:** Is WebSocket connected?
Look for: `🔌 Challenge WebSocket connected` in console

#### Issue: Sites load briefly before being blocked

This is expected if:
- DeclarativeNetRequest rules haven't been created yet
- The URL pattern doesn't match exactly

**Solution:**
- Make sure the challenge is activated
- Check that website URL in challenge matches the site you're visiting
- Example: If challenge blocks "facebook.com", it will block:
  - facebook.com
  - www.facebook.com
  - m.facebook.com
  - Any facebook.com URL

#### Issue: Tabs don't close when challenge is toggled

**Check:**
1. Is WebSocket connected? (Look for 🔌 in console)
2. When you toggle challenge, do you see: `🔄 Challenge status changed! Refreshing blocking rules and closing blocked tabs...`
3. After that, do you see tabs being checked?

### 5. Manual Testing Steps

1. **Create a challenge** in klariti.so/dashboard
2. **Add blocked websites** (e.g., facebook.com, twitter.com)
3. **Open extension console** (chrome://extensions → Inspect)
4. **Toggle challenge ON**
5. **Watch console** - Should see:
   - Challenge fetched
   - Blocking rules updated
   - DeclarativeNetRequest rules added
   - Existing tabs checked
6. **Try to visit blocked site** - Should redirect to lock page
7. **Toggle challenge OFF** - Should see rules removed
8. **Try to visit site again** - Should work normally

### 6. Testing Real-Time Updates

1. Open a blocked site in one tab (should redirect to lock)
2. In another tab, open klariti.so/dashboard
3. Toggle the challenge OFF
4. You should see in extension console:
   ```
   📨 Challenge WebSocket message: {type: "challenge_toggled", ...}
   🔄 Challenge status changed! Refreshing blocking rules and closing blocked tabs...
   ```
5. Try to visit the previously blocked site - should work now

### 7. Force Refresh

If something seems stuck, manually refresh challenges:

```javascript
// In extension console
chrome.storage.local.get('access_token', async ({access_token}) => {
  const response = await fetch('http://127.0.0.1:8081/challenges/my-challenges?skip=0&limit=100', {
    headers: {
      'Authorization': `Bearer ${access_token}`,
      'Content-Type': 'application/json'
    }
  });
  const challenges = await response.json();
  console.log('Challenges:', challenges);
});
```

### 8. Clear Everything and Start Fresh

```javascript
// In extension console
chrome.declarativeNetRequest.updateDynamicRules({
  removeRuleIds: (await chrome.declarativeNetRequest.getDynamicRules()).map(r => r.id)
});
chrome.storage.local.clear();
console.log('Cleared all rules and storage');
```

Then reload the extension and log in again.

### 9. Expected Console Output When Working

```
Klariti extension installed
Fetching challenges from API...
Fetched challenges: [...]
🔄 Updating blocking rules for 1 challenges
📝 Processing challenge: "Focus Time" | Type: toggle | Completed: false
  ✅ Challenge active: true
  🚫 Adding 1 websites to block list:
     • facebook.com → facebook.com
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 Final blocked URLs: ['facebook.com']
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Creating blocking rules for: facebook.com
✅ Added 4 declarativeNetRequest blocking rules for 1 domains
Blocked domains: Set(1) {'facebook.com'}
🔍 Checking 3 tabs for blocked URLs
📋 Currently blocked URLs: Set(1) {'facebook.com'}
✅ No blocked tabs found
🔌 Challenge WebSocket connected
```

### 10. If Still Not Working

Check these:
1. **Extension permissions** - Make sure extension has all permissions
2. **API URL** - Check `config.js` has correct API URL
3. **Access token** - Check you're logged in:
   ```javascript
   chrome.storage.local.get('access_token', console.log);
   ```
4. **Challenge structure** - Make sure challenge has `distracting_websites` array
5. **Manifest permissions** - Check manifest.json has `declarativeNetRequest` permission
