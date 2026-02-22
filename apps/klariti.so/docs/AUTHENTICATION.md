# Authentication Setup for Klariti.so

## Overview

This document describes the authentication layer added to the Klariti.so Next.js application. The authentication system integrates with the existing FastAPI backend (`api-klariti`) to provide secure access to protected routes.

## Features

- **JWT-based Authentication**: Uses JWT tokens stored in cookies for secure authentication
- **Protected Routes**: Dashboard (playground) is only accessible to authenticated users
- **Persistent Sessions**: Authentication state persists across page reloads
- **Automatic Redirects**: Unauthenticated users are redirected to the login page
- **Navigation Integration**: Dynamic navigation showing login/logout and dashboard links based on auth state

## Components

### 1. AuthContext (`src/contexts/AuthContext.tsx`)
Provides authentication state and methods throughout the application:
- `user`: Current authenticated user object
- `login(username, password)`: Authenticate user
- `logout()`: Clear authentication and redirect
- `isLoading`: Loading state for authentication checks

### 2. ProtectedRoute Component (`src/components/ProtectedRoute.tsx`)
Wrapper component that protects routes requiring authentication. Automatically redirects unauthenticated users to `/auth`.

### 3. Login Page (`src/app/auth/page.tsx`)
User-friendly login interface that:
- Accepts username and password
- Shows error messages for failed login attempts
- Redirects to dashboard on successful login
- Prevents authenticated users from accessing the login page

### 4. Navigation Updates (`src/components/layout/Navigation.tsx`)
Dynamic navigation that shows:
- **Logged out**: Login button
- **Logged in**: Dashboard link and Logout button

## Usage

### Protecting a Route

To protect any page, wrap it with the `ProtectedRoute` component:

```tsx
"use client";

import ProtectedRoute from "@/components/ProtectedRoute";

export default function MyProtectedPage() {
  return (
    <ProtectedRoute>
      <div>
        {/* Your protected content here */}
      </div>
    </ProtectedRoute>
  );
}
```

### Using Auth Context in Components

Access authentication state in any component:

```tsx
"use client";

import { useAuth } from "@/contexts/AuthContext";

export default function MyComponent() {
  const { user, logout } = useAuth();

  return (
    <div>
      {user && <p>Welcome, {user.username}!</p>}
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

## Environment Configuration

Create a `.env.local` file in the root of `klariti.so`:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8081
```

For production, update this to your production API URL.

You can also import the `API_BASE` constant directly in your code:

```tsx
import { API_BASE } from "@/config/api";
// or
import API_BASE from "@/config/api";

console.log(API_BASE); // http://127.0.0.1:8081
```

## API Endpoints Used

The frontend communicates with these backend endpoints (no `/auth` prefix):

- `POST /login` - Authenticate user and receive JWT token
- `GET /me` - Verify token and get current user info
- `POST /register` - Register new user (if needed)

## Setup Instructions

1. **Install Dependencies**:
   ```bash
   cd klariti.so
   npm install
   ```

2. **Configure Environment**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your API URL
   ```

3. **Start the Backend**:
   ```bash
   cd ../api-klariti
   uvicorn main:app --reload --port 8081
   ```

4. **Start the Frontend**:
   ```bash
   cd ../klariti.so
   npm run dev
   ```

5. **Access the Application**:
   - Homepage: http://localhost:3000
   - Login: http://localhost:3000/auth
   - Dashboard: http://localhost:3000/playground (requires login)

## Testing

To test the authentication:

1. Start both the API backend and Next.js frontend
2. Navigate to http://localhost:3000/playground - you should be redirected to login
3. Create a test user via the API or use existing credentials
4. Login at http://localhost:3000/auth
5. You should be redirected to the playground/dashboard
6. The navigation should show "Dashboard" and "Logout" buttons
7. Click Logout to clear the session

## Security Notes

- JWT tokens are stored in HTTP-only cookies (when possible)
- Tokens expire after 7 days by default
- CORS is configured in the backend to allow requests from the frontend
- All API requests include the Bearer token in the Authorization header

## Troubleshooting

### "Login failed" error
- Ensure the API backend is running on port 8000
- Check that CORS is configured correctly in `api-klariti/main.py`
- Verify the user credentials are correct

### Infinite redirect loop
- Clear browser cookies
- Check that the token verification endpoint (`/auth/me`) is working
- Ensure the API URL in `.env.local` is correct

### Protected route not working
- Verify the page is marked as `"use client"`
- Ensure `ProtectedRoute` wrapper is correctly applied
- Check browser console for errors

## Future Enhancements

- [ ] Add registration page in the frontend
- [ ] Implement "Remember me" functionality
- [ ] Add password reset flow
- [ ] Implement refresh tokens for better security
- [ ] Add loading skeletons instead of blank screens
- [ ] Add user profile page
