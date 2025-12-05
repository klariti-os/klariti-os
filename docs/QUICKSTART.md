# Quick Start Guide - Klariti Authentication

## Prerequisites
- Node.js and npm installed
- Python 3.8+ installed
- FastAPI backend dependencies installed

## Step-by-Step Setup

### 1. Backend Setup (api-klariti)

```bash
cd api-klariti

# Install dependencies if not already done
pip install -r requirements.txt

# Start the backend server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at http://localhost:8000

### 2. Frontend Setup (klariti.so)

```bash
cd klariti.so

# Install dependencies (already done)
npm install

# Create environment file
cp .env.example .env.local

# Start the development server
npm run dev
```

The frontend will be available at http://localhost:3000

### 3. Test the Authentication

1. **Visit the homepage**: http://localhost:3000
2. **Try accessing the dashboard**: http://localhost:3000/playground
   - You should be redirected to the login page
3. **Login with credentials**:
   - Use the register endpoint first if needed, or use existing credentials
   - Navigate to http://localhost:3000/auth
4. **After successful login**:
   - You'll be redirected to the dashboard
   - The navigation will show "Dashboard" and "Logout" buttons
5. **Test logout**:
   - Click the "Logout" button
   - Try accessing the dashboard again - you should be redirected to login

## Creating a Test User

You can create a test user via the API:

```bash
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "testpass123"}'
```

Or use an API client like Postman/Insomnia to hit the registration endpoint.

## What's Protected

Currently, the following routes require authentication:
- `/playground` (Dashboard)
- `/playground/ios`

All other routes remain publicly accessible.

## Troubleshooting

### Backend not starting?
- Make sure you're in the `api-klariti` directory
- Check that all dependencies are installed: `pip install -r requirements.txt`
- Verify the database is set up correctly

### Frontend not connecting to backend?
- Ensure backend is running on port 8000
- Check `.env.local` has the correct API URL
- Look for CORS errors in the browser console

### Login not working?
- Verify the user exists in the database
- Check the browser console for errors
- Ensure the API is responding at http://localhost:8000/auth/login

## Next Steps

- Add more protected routes as needed
- Customize the login page design
- Implement user registration on the frontend
- Add user profile functionality
