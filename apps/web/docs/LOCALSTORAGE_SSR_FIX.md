# localStorage SSR Fix

## Problem
The application was crashing with `ReferenceError: localStorage is not defined` when accessing pages during server-side rendering (SSR).

## Root Cause
Next.js performs server-side rendering, but `localStorage` is a browser-only API and doesn't exist in the Node.js environment. Accessing it directly during SSR causes the application to crash.

## Solution
Added checks to ensure `localStorage` is only accessed in the browser environment using `typeof window === "undefined"`.

## Files Fixed

### 1. `/src/app/auth/page.tsx`
**Before:**
```typescript
const checkIsLoggedIn = useCallback(() => {
  const token = localStorage.getItem("access_token");
  return !!token;
}, []);
```

**After:**
```typescript
const checkIsLoggedIn = useCallback(() => {
  if (typeof window === "undefined") return false;
  const token = localStorage.getItem("access_token");
  return !!token;
}, []);
```

### 2. `/src/services/challenges.ts`
**Before:**
```typescript
const getAuthHeaders = () => {
  const token = localStorage.getItem("access_token");
  if (!token) {
    console.warn("No access token found in localStorage");
  }
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};
```

**After:**
```typescript
const getAuthHeaders = () => {
  if (typeof window === "undefined") {
    return {
      "Content-Type": "application/json",
    };
  }
  const token = localStorage.getItem("access_token");
  if (!token) {
    console.warn("No access token found in localStorage");
  }
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};
```

### 3. `/src/contexts/AuthContext.tsx`
**Before:**
```typescript
const checkAuth = async () => {
  const token = localStorage.getItem("access_token");
  if (token) {
    // ... rest of code
  }
  setIsLoading(false);
};
```

**After:**
```typescript
const checkAuth = async () => {
  if (typeof window === "undefined") {
    setIsLoading(false);
    return;
  }
  
  const token = localStorage.getItem("access_token");
  if (token) {
    // ... rest of code
  }
  setIsLoading(false);
};
```

## How It Works

### The Check
```typescript
if (typeof window === "undefined") {
  // We're on the server
  return defaultValue;
}
// We're in the browser, safe to use localStorage
```

- **On the server:** `window` is undefined, so the check returns true and we return early
- **In the browser:** `window` exists, so the check returns false and we can safely access `localStorage`

## Best Practices for localStorage in Next.js

### ✅ DO:
```typescript
// Always check for browser environment
if (typeof window !== "undefined") {
  const value = localStorage.getItem("key");
}

// Use in useEffect (only runs in browser)
useEffect(() => {
  const value = localStorage.getItem("key");
  setState(value);
}, []);

// Use in event handlers (only run in browser)
const handleClick = () => {
  localStorage.setItem("key", "value");
};
```

### ❌ DON'T:
```typescript
// Direct access at module/component level
const token = localStorage.getItem("token"); // CRASHES ON SSR

// In render without check
function Component() {
  const value = localStorage.getItem("key"); // CRASHES ON SSR
  return <div>{value}</div>;
}
```

## Testing

### Before Fix:
- ❌ Page crashes with `ReferenceError: localStorage is not defined`
- ❌ GET /auth returns 500 error
- ❌ Server console shows error

### After Fix:
- ✅ Pages load successfully during SSR
- ✅ localStorage is accessed only in browser
- ✅ Auth flow works correctly
- ✅ No console errors

## Related Files
Other files using localStorage that are already safe:
- Event handlers in `/src/app/auth/page.tsx` (login flow)
- Event handlers in `/src/contexts/AuthContext.tsx` (login/logout)
- These only run in the browser, so no check needed

## Prevention

To prevent this issue in the future:

1. **Always check for `window`** before using browser-only APIs:
   - `localStorage`
   - `sessionStorage`
   - `document`
   - `navigator`
   - etc.

2. **Use `useEffect`** for initialization code that needs browser APIs

3. **Create helper utilities:**
```typescript
// utils/storage.ts
export const getLocalStorage = (key: string): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(key);
};

export const setLocalStorage = (key: string, value: string): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, value);
};
```

4. **Enable TypeScript strict mode** to catch more errors early

## Impact
This fix resolves the SSR crashes and allows the application to render properly on both server and client.
