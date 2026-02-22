# Toggle for Participants & CORS Fix

## Summary
Fixed two critical issues:
1. **Enabled toggle switches for challenge participants** (not just creators)
2. **Fixed CORS error** preventing PATCH requests to the backend

---

## Issue 1: Participants Couldn't Toggle Challenges

### Problem
Only challenge creators could toggle their toggle-type challenges. Participants who joined the challenge couldn't control the toggle state.

### Solution
Updated both `ChallengeCard.tsx` and `ChallengeList.tsx` to show toggle switches for all participants.

### Changes Made

#### 1. `/src/components/challenges/ChallengeList.tsx`
**Before:**
```tsx
onToggle={
  currentTab === "created" ? handleToggleChallenge : undefined
}
```

**After:**
```tsx
onToggle={
  currentTab === "created" || currentTab === "my-challenges" 
    ? handleToggleChallenge 
    : undefined
}
```

Now toggle is available on:
- ✅ "Created by Me" tab (creators)
- ✅ "My Challenges" tab (participants)
- ❌ "All Challenges" tab (not joined yet)

#### 2. `/src/components/challenges/ChallengeCard.tsx`

**Before (both variants):**
```tsx
{isCreator && challenge.challenge_type === ChallengeType.TOGGLE && onToggle && (
  // Toggle switch
)}
```

**After (both variants):**
```tsx
{challenge.challenge_type === ChallengeType.TOGGLE && onToggle && (
  // Toggle switch
)}
```

Removed the `isCreator` check, so now:
- ✅ Anyone with access to the toggle can use it
- ✅ Visibility is controlled by `onToggle` callback being passed
- ✅ Works for both default and compact variants

---

## Issue 2: CORS Error on PATCH Requests

### Error Message
```
Access to fetch at 'http://127.0.0.1:8081/challenges/20/toggle' 
from origin 'http://localhost:3000' has been blocked by CORS policy: 
Response to preflight request doesn't pass access control check: 
It does not have HTTP ok status.
```

### Root Cause
**Syntax error in `/api-klariti/main.py`:**

Missing comma between `"PATCH"` and `"DELETE"` in the `allow_methods` list:

```python
allow_methods=["GET", "POST", "PUT", "PATCH" "DELETE", "OPTIONS"],
                                              ↑ Missing comma!
```

This caused Python to concatenate the strings:
- `"PATCH" "DELETE"` → `"PATCHDELETE"` (invalid HTTP method)
- PATCH requests were not allowed, causing CORS to fail

### Solution
**File: `/api-klariti/main.py`**

**Before:**
```python
allow_methods=["GET", "POST", "PUT", "PATCH" "DELETE", "OPTIONS"],
```

**After:**
```python
allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
                                              ↑ Added comma
```

### What This Fixes

✅ **PATCH requests now work** - Toggle endpoint uses PATCH  
✅ **Preflight OPTIONS passes** - CORS preflight succeeds  
✅ **All HTTP methods allowed:**
- GET (read operations)
- POST (create operations)
- PUT (full update operations)
- PATCH (partial update operations) ← **NOW WORKS**
- DELETE (delete operations)
- OPTIONS (CORS preflight)

---

## How to Test

### 1. Restart the Backend
The CORS fix requires restarting the FastAPI server:

```bash
cd api-klariti
uvicorn main:app --reload --port 8081
```

### 2. Test Participant Toggle

1. **Create a toggle challenge** (as User A)
2. **Join the challenge** (as User B)
3. **Go to "My Challenges" tab** (User B)
4. **You should see the toggle switch** next to the challenge
5. **Click the toggle** - it should work without CORS errors!

### 3. Verify in Browser Console

Before fix:
```
❌ Access to fetch blocked by CORS policy
❌ PATCH http://127.0.0.1:8081/challenges/20/toggle net::ERR_FAILED
```

After fix:
```
✅ PATCH http://127.0.0.1:8081/challenges/20/toggle 200 OK
✅ Challenge toggled successfully
```

---

## Tab Behavior Summary

| Tab | Toggle Visible? | Who Can See It? |
|-----|----------------|-----------------|
| **All Challenges** | ❌ No | N/A (not joined yet) |
| **My Challenges** | ✅ Yes | Participants who joined toggle challenges |
| **Created by Me** | ✅ Yes | Challenge creators for toggle challenges |

---

## Technical Details

### Toggle Visibility Logic

The toggle switch appears when **ALL** conditions are met:
1. ✅ `challenge.challenge_type === ChallengeType.TOGGLE`
2. ✅ `onToggle` callback is provided (passed by parent)
3. ✅ `showActions === true`

### API Endpoint Called
```
PATCH /challenges/{challenge_id}/toggle
```

### Request Flow
1. User clicks toggle switch
2. `handleToggleChallenge(challengeId)` called
3. `toggleChallengeStatus(challengeId)` in service layer
4. PATCH request sent with auth token
5. Backend toggles `is_active` field
6. Response returns updated challenge
7. Challenge list refreshes
8. Toggle switch animates to new position

---

## Files Modified

### Frontend
1. `/src/components/challenges/ChallengeCard.tsx`
   - Removed `isCreator` check from toggle visibility
   - Updated both default and compact variants

2. `/src/components/challenges/ChallengeList.tsx`
   - Added `currentTab === "my-challenges"` to toggle callback

### Backend
3. `/api-klariti/main.py`
   - Fixed missing comma in CORS `allow_methods`

---

## Benefits

✅ **Better UX** - Participants can control their own challenge state  
✅ **More intuitive** - Toggle visible where it makes sense  
✅ **No CORS errors** - Backend properly configured  
✅ **Consistent** - Works on all tabs where user has access  
✅ **Secure** - Backend still validates permissions  

---

## Security Note

The backend should validate that:
1. User is authenticated
2. User has joined the challenge OR is the creator
3. Challenge is toggle-type

The frontend just controls UI visibility - **real authorization happens on the backend**.

---

## Future Enhancements

Potential improvements:
- [ ] Add loading state during toggle (disable button)
- [ ] Show error toast if toggle fails
- [ ] Add undo functionality
- [ ] Batch toggle multiple challenges
- [ ] Show who last toggled the challenge
- [ ] Add toggle history/audit log
