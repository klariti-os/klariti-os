# API Configuration Quick Reference

## Overview

The API base URL is centralized in one place and loaded from environment variables for easy configuration across different environments (development, staging, production).

## Configuration Files

### 1. Environment Variable (`.env.local`)

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8081
```

**Note:** `.env.local` is git-ignored and contains your local development settings.

### 2. API Configuration Module (`src/config/api.ts`)

```typescript
// API Configuration
// Load from environment variable or fallback to default
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8081";

export const config = {
  apiUrl: API_BASE,
};

// Export as default for convenience
export default API_BASE;
```

## Usage in Your Code

### Method 1: Using the named export

```typescript
import { API_BASE } from "@/config/api";

const response = await fetch(`${API_BASE}/auth/login`, {
  method: "POST",
  // ...
});
```

### Method 2: Using the default export

```typescript
import API_BASE from "@/config/api";

const response = await fetch(`${API_BASE}/auth/me`, {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
```

### Method 3: Using the config object

```typescript
import { config } from "@/config/api";

const response = await fetch(`${config.apiUrl}/challenges`, {
  method: "GET",
});
```

## Current Implementation

The `API_BASE` variable is already used in:
- `src/contexts/AuthContext.tsx` - For authentication endpoints

## Changing the API URL

### For Development

Edit `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8081
```

### For Production

Set environment variable in your deployment platform:
```env
NEXT_PUBLIC_API_URL=https://api.klariti.org
```

### For Different Environments

You can create multiple env files:

- `.env.local` - Local development (git-ignored)
- `.env.development` - Development environment
- `.env.staging` - Staging environment  
- `.env.production` - Production environment

Next.js automatically loads the correct file based on `NODE_ENV`.

## Backend Configuration

Make sure your FastAPI backend accepts requests from your frontend:

```python
# api-klariti/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8081",
        "http://127.0.0.1:8081",
        # Add production URLs here
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)
```

## Starting the Backend on Port 8081

```bash
cd api-klariti
uvicorn main:app --reload --port 8081
```

Or add to your `package.json` scripts:
```json
{
  "scripts": {
    "start:api": "cd ../api-klariti && uvicorn main:app --reload --port 8081"
  }
}
```

## Testing the Configuration

Run the test script:
```bash
./test-auth.sh
```

Or manually test:
```bash
# Check if API is accessible
curl http://127.0.0.1:8081/auth/me

# Should return 401 Unauthorized (expected without token)
```

## Troubleshooting

### Environment variable not updating

1. Restart the Next.js dev server after changing `.env.local`
2. Make sure the variable name starts with `NEXT_PUBLIC_` to be accessible in the browser

### CORS errors

1. Check that your frontend URL is in the backend's `allow_origins` list
2. Make sure the backend is running on the port specified in `NEXT_PUBLIC_API_URL`

### Connection refused

1. Verify the backend is running: `curl http://127.0.0.1:8081`
2. Check that the port in `.env.local` matches the backend port
3. Check firewall settings if using a remote backend

## Best Practices

1. ✅ Never commit `.env.local` to git (it's in `.gitignore`)
2. ✅ Always use `API_BASE` instead of hardcoding URLs
3. ✅ Keep `.env.example` updated with all required variables
4. ✅ Use descriptive variable names prefixed with `NEXT_PUBLIC_` for client-side access
5. ✅ Validate environment variables on app startup if they're critical

## Example: Adding New API Endpoints

When you add new features, use the `API_BASE` constant:

```typescript
import { API_BASE } from "@/config/api";

// Get user challenges
export async function getChallenges(token: string) {
  const response = await fetch(`${API_BASE}/challenges`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.json();
}

// Create a new challenge
export async function createChallenge(token: string, data: any) {
  const response = await fetch(`${API_BASE}/challenges`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return response.json();
}
```
