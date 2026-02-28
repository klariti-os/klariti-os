# API Configuration Update Summary

## ✅ Changes Made

### 1. Centralized API Base URL
- Created `API_BASE` constant in `src/config/api.ts`
- Loads from environment variable `NEXT_PUBLIC_API_URL`
- Fallback default: `http://127.0.0.1:8081`

### 2. Updated Environment Files
- `.env.local` - Set to `http://127.0.0.1:8081`
- `.env.example` - Updated template with new port

### 3. Updated Test Script
- `test-auth.sh` now uses `API_BASE` variable
- Dynamically tests the configured API endpoint
- Updated instructions to use port 8081

### 4. Updated Backend CORS
- Added `http://127.0.0.1:8081` to allowed origins
- Allows both localhost and 127.0.0.1 variants
- Ready for frontend-backend communication

### 5. Updated Documentation
- `AUTHENTICATION.md` - Updated setup instructions
- `API_CONFIG.md` - New comprehensive guide for API configuration

## 📁 Files Modified

```
klariti.so/
  ├─ .env.local                    ← API URL updated to port 8081
  ├─ .env.example                  ← Template updated
  ├─ src/config/api.ts             ← Added API_BASE constant
  ├─ test-auth.sh                  ← Uses API_BASE variable
  ├─ AUTHENTICATION.md             ← Updated instructions
  └─ API_CONFIG.md                 ← NEW: Complete config guide

api-klariti/
  └─ main.py                       ← Updated CORS for new port
```

## 🚀 How to Use

### Import the API_BASE in your code:

```typescript
// Method 1: Named export
import { API_BASE } from "@/config/api";

// Method 2: Default export
import API_BASE from "@/config/api";

// Method 3: Config object
import { config } from "@/config/api";
const url = config.apiUrl;
```

### Example usage:

```typescript
import { API_BASE } from "@/config/api";

// In your fetch calls
const response = await fetch(`${API_BASE}/challenges`, {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
```

## 🔧 Starting the Servers

### Backend (Port 8081):
```bash
cd api-klariti
uvicorn main:app --reload --port 8081
```

### Frontend (Port 3000):
```bash
cd klariti.so
npm run dev
```

## ✨ Benefits

1. **Easy Configuration**: Change API URL in one place (`.env.local`)
2. **Environment Flexibility**: Different URLs for dev, staging, production
3. **Type Safety**: TypeScript support with the config module
4. **Consistency**: All API calls use the same base URL
5. **No Hardcoding**: No need to update URLs in multiple files
6. **Testability**: Easy to switch between local and remote APIs

## 📝 Next Steps

1. Start both servers with the new port configuration
2. Test the authentication flow
3. Run `./test-auth.sh` to verify everything works
4. When deploying to production, set `NEXT_PUBLIC_API_URL` in your hosting platform

## 🎯 Current Configuration

- **API Base URL**: `http://127.0.0.1:8081`
- **Frontend URL**: `http://localhost:3000`
- **Auth Endpoints** (no `/auth` prefix):
  - `POST ${API_BASE}/login`
  - `GET ${API_BASE}/me`
  - `POST ${API_BASE}/register`

---

All done! Your API configuration is now centralized and easily manageable through environment variables. 🎉
