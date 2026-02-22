# Authentication Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    KLARITI AUTHENTICATION FLOW                   │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐
│   Browser    │
│   Requests   │
│  /dashboard  │
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│ ProtectedRoute   │◄──────┐
│   Component      │       │
└──────┬───────────┘       │
       │                   │
       │ Check Auth        │
       ▼                   │
┌──────────────────┐       │
│  AuthContext     │       │
│  - user          │       │
│  - isLoading     │       │
└──────┬───────────┘       │
       │                   │
       ├──► User exists?   │
       │    └─ YES ─────┐  │
       │                │  │
       └──► NO          │  │
            │           │  │
            ▼           ▼  │
      ┌─────────┐  ┌────────────┐
      │ Redirect│  │   Show     │
      │ to /auth│  │  Protected │
      └────┬────┘  │  Content   │
           │       └────────────┘
           ▼
    ┌───────────────┐
    │  Login Page   │
    │  /auth        │
    └───────┬───────┘
            │
            │ User enters credentials
            ▼
    ┌───────────────────────┐
    │   AuthContext.login() │
    └───────────┬───────────┘
                │
                │ POST /login
                ▼
    ┌──────────────────────┐
    │   FastAPI Backend    │
    │   api-klariti        │
    └───────────┬──────────┘
                │
                │ Validate credentials
                ▼
    ┌──────────────────────┐
    │  Return JWT Token    │
    └───────────┬──────────┘
                │
                │ Store token in cookie
                ▼
    ┌──────────────────────┐
    │  GET /me             │
    └───────────┬──────────┘
                │
                │ Fetch user data
                ▼
    ┌──────────────────────┐
    │  Update AuthContext  │
    │  user = {id, name}   │
    └───────────┬──────────┘
                │
                │ Redirect to dashboard
                ▼
    ┌──────────────────────┐
    │   /playground        │
    │   (Now Authorized)   │
    └──────────────────────┘


═══════════════════════════════════════════════════════════════════
                        TOKEN VERIFICATION FLOW
═══════════════════════════════════════════════════════════════════

┌──────────────────┐
│  App Loads       │
│  (useEffect)     │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Check Cookie     │
│ for auth_token   │
└────────┬─────────┘
         │
         ├──► Token exists?
         │    └─ YES ─────┐
         │                │
         └──► NO          │
              │           │
              │           ▼
              │    ┌──────────────┐
              │    │ GET /me      │
              │    │ with Bearer  │
              │    │    token     │
              │    └──────┬───────┘
              │           │
              │           ├──► Valid?
              │           │    └─ YES ─┐
              │           │            │
              │           └──► NO      │
              │                │       │
              ▼                ▼       ▼
      ┌──────────┐    ┌──────────┐  ┌──────────┐
      │ No User  │    │ Remove   │  │ Set User │
      │ (Public) │    │ Cookie   │  │ in State │
      └──────────┘    └──────────┘  └──────────┘


═══════════════════════════════════════════════════════════════════
                          LOGOUT FLOW
═══════════════════════════════════════════════════════════════════

┌──────────────────┐
│  User Clicks     │
│  Logout Button   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ AuthContext      │
│   .logout()      │
└────────┬─────────┘
         │
         ├──► Remove cookie
         │
         ├──► Clear user state
         │
         └──► User = null
              │
              ▼
      ┌──────────────┐
      │ Navigation   │
      │ Updates      │
      │ (shows login)│
      └──────────────┘
              │
              ▼
      ┌──────────────┐
      │ Protected    │
      │ routes now   │
      │ redirect to  │
      │ /auth        │
      └──────────────┘


═══════════════════════════════════════════════════════════════════
                      COMPONENT HIERARCHY
═══════════════════════════════════════════════════════════════════

RootLayout (layout.tsx)
  │
  ├─► AuthProvider (wraps entire app)
  │     │
  │     └─► Provides: { user, login, logout, isLoading }
  │
  └─► BaseLayout
        │
        ├─► Navigation (shows login/logout dynamically)
        │
        └─► Page Content
              │
              ├─► Public Pages (/, /manifesto, /join, etc.)
              │
              └─► Protected Pages
                    │
                    └─► ProtectedRoute Component
                          │
                          ├─► Checks auth status
                          ├─► Redirects if not authenticated
                          └─► Shows content if authenticated


═══════════════════════════════════════════════════════════════════
                        FILE STRUCTURE
═══════════════════════════════════════════════════════════════════

klariti.so/
  ├─ src/
  │   ├─ app/
  │   │   ├─ layout.tsx          ← AuthProvider wrapper
  │   │   ├─ auth/
  │   │   │   └─ page.tsx        ← Login page
  │   │   └─ playground/
  │   │       ├─ page.tsx        ← Protected (Dashboard)
  │   │       └─ ios/
  │   │           └─ page.tsx    ← Protected
  │   │
  │   ├─ components/
  │   │   ├─ ProtectedRoute.tsx  ← Route protection
  │   │   └─ layout/
  │   │       └─ Navigation.tsx  ← Dynamic nav
  │   │
  │   ├─ contexts/
  │   │   └─ AuthContext.tsx     ← Auth state management
  │   │
  │   └─ config/
  │       └─ api.ts              ← API configuration
  │
  ├─ .env.local                  ← Environment variables
  ├─ .env.example                ← Env template
  ├─ AUTHENTICATION.md           ← Full documentation
  ├─ QUICKSTART.md               ← Setup guide
  └─ IMPLEMENTATION_SUMMARY.md   ← This summary


═══════════════════════════════════════════════════════════════════
                      API ENDPOINTS USED
═══════════════════════════════════════════════════════════════════

POST   /login
       ├─ Body: username, password (form-urlencoded)
       └─ Returns: { access_token, token_type }

GET    /me
       ├─ Headers: Authorization: Bearer <token>
       └─ Returns: { id, username }

POST   /register (optional - not implemented in frontend yet)
       ├─ Body: { username, password }
       └─ Returns: Success message


═══════════════════════════════════════════════════════════════════
                    COOKIE/TOKEN STORAGE
═══════════════════════════════════════════════════════════════════

Cookie Name: auth_token
Expires: 7 days
Domain: localhost (dev) / your-domain.com (prod)
HttpOnly: No (client-side accessible via js-cookie)
Secure: No (dev) / Yes (prod with HTTPS)
SameSite: Lax

```

## Key Points

1. **Automatic Authentication Check**: When the app loads, it automatically checks for a token and verifies it
2. **Seamless Protection**: Protected routes automatically redirect unauthenticated users
3. **Persistent Sessions**: Once logged in, the session persists across page reloads for 7 days
4. **Clean State Management**: All auth state is managed in one context, accessible anywhere
5. **No Manual Token Handling**: Developers don't need to manually attach tokens to requests - the context handles it
6. **Graceful Failures**: If the token is invalid or expired, it's automatically removed and the user is redirected

## Security Considerations

- Tokens are stored in cookies, not localStorage (better against XSS)
- CORS is properly configured on the backend
- Token verification happens on every protected route access
- Failed auth attempts are logged (console.error)
- Tokens have expiration (7 days, configurable)
