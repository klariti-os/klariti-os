# Quick Start Guide - Challenges Dashboard

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- Python 3.8+ installed (for backend)
- Git

### 1. Setup Backend (api-klariti)

```bash
cd api-klariti

# Install dependencies
pip install -r requirements.txt

# Run database migrations (if needed)
alembic upgrade head

# Start the API server
uvicorn main:app --reload --port 8081
```

Backend will be available at: `http://127.0.0.1:8081`

### 2. Setup Frontend (klariti.so)

```bash
cd klariti.so

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
```

Edit `.env.local`:
```bash
NEXT_PUBLIC_API_URL=http://127.0.0.1:8081
```

```bash
# Start the development server
npm run dev
```

Frontend will be available at: `http://localhost:3000`

### 3. Create a Test User

Open your browser to `http://localhost:3000/auth`

**Register a new account:**
- Username: `testuser`
- Password: `testpass123`

Or use existing credentials if you have an account.

### 4. Test the Challenges Feature

1. **Navigate to Challenges**
   - Click "Challenges" in the navigation
   - Or go to `http://localhost:3000/challenges`

2. **Create Your First Challenge**
   - Click "+ New Challenge"
   - Fill in the form:
     - Name: "7-Day Social Media Detox"
     - Description: "Stay off social media for a week"
     - Type: Time-Based
     - Start: Today
     - End: 7 days from now
     - Add distracting websites:
       - `https://facebook.com` (Facebook)
       - `https://twitter.com` (Twitter)
   - Click "Create Challenge"

3. **View All Challenges**
   - Click "All Challenges" tab
   - You should see your created challenge

4. **Join a Challenge**
   - Create another user account (or ask a friend)
   - Browse "All Challenges"
   - Click "Join Challenge" on any challenge

5. **Toggle Challenge (for Toggle-Type)**
   - Create a toggle challenge
   - Go to "Created by Me" tab
   - Click "Activate" or "Deactivate"

## 📁 Project Structure

```
klariti.so/
├── src/
│   ├── app/
│   │   ├── challenges/page.tsx       # Main challenges page
│   │   └── playground/page.tsx       # Dashboard
│   ├── components/
│   │   └── challenges/
│   │       ├── CreateChallengeForm.tsx
│   │       ├── ChallengeCard.tsx
│   │       ├── ChallengeList.tsx
│   │       └── ChallengeStats.tsx
│   ├── services/
│   │   └── challenges.ts             # API calls
│   └── contexts/
│       └── AuthContext.tsx           # Auth management
```

## 🧪 API Endpoints to Test

### Using curl:

```bash
# 1. Register
curl -X POST http://127.0.0.1:8081/register \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "testpass123"}'

# 2. Login
curl -X POST http://127.0.0.1:8081/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=testuser&password=testpass123"
# Save the access_token from response

# 3. Create Challenge
curl -X POST http://127.0.0.1:8081/challenges/ \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Challenge",
    "description": "A test challenge",
    "challenge_type": "time_based",
    "start_date": "2025-11-16T00:00:00",
    "end_date": "2025-11-23T23:59:59"
  }'

# 4. Get All Challenges
curl -X GET http://127.0.0.1:8081/challenges/ \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# 5. Join Challenge (replace 1 with actual challenge ID)
curl -X POST http://127.0.0.1:8081/challenges/1/join \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# 6. Get My Challenges
curl -X GET http://127.0.0.1:8081/challenges/my-challenges \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 🐛 Troubleshooting

### Backend Issues

**Error: "ModuleNotFoundError"**
```bash
pip install -r requirements.txt --upgrade
```

**Error: "Address already in use"**
```bash
# Kill process on port 8081
lsof -ti:8081 | xargs kill -9
# Or use a different port
uvicorn main:app --reload --port 8082
```

**Database errors**
```bash
# Reset database
rm auth.db
alembic upgrade head
```

### Frontend Issues

**Error: "fetch failed"**
- Check backend is running
- Verify `NEXT_PUBLIC_API_URL` in `.env.local`
- Check browser console for CORS errors

**Error: "Unauthorized"**
- Log out and log back in
- Clear localStorage: `localStorage.clear()`
- Check token in browser DevTools > Application > Local Storage

**TypeScript errors**
```bash
npm run build
# Fix any type errors shown
```

**Components not showing**
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

## 📝 Development Tips

### Hot Reload
Both frontend and backend support hot reload:
- Frontend: Edit any `.tsx` file and see changes instantly
- Backend: Edit any `.py` file and server restarts automatically

### Browser DevTools
- **Console**: See API calls and errors
- **Network**: Inspect API requests/responses
- **React DevTools**: Inspect component state
- **Application > Local Storage**: View stored tokens

### VS Code Extensions (Recommended)
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- Python
- Thunder Client (API testing)

## 🎯 Quick Test Scenarios

### Scenario 1: Create and Join
1. User A creates a challenge
2. User B joins the challenge
3. Both see the challenge in "My Challenges"

### Scenario 2: Toggle Challenge
1. User creates a toggle-type challenge
2. Activates it from "Created by Me"
3. Deactivates it later
4. Status updates immediately

### Scenario 3: Time-Based Challenge
1. Create challenge with future start date
2. Status shows "Upcoming"
3. Change start date to past
4. Status shows "In Progress"

### Scenario 4: Website Blocking
1. Create challenge with distracting websites
2. Add multiple URLs (Facebook, Twitter, YouTube)
3. View challenge card shows all websites
4. Chrome extension (future) will block these

## 🔧 Configuration

### Backend Config
Edit `api-klariti/core/config.py`:
```python
class Settings:
    API_V1_STR = "/api/v1"
    PROJECT_NAME = "Klariti OS Central API"
    
    # JWT Settings
    SECRET_KEY = "your-secret-key"
    ALGORITHM = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES = 10080  # 7 days
```

### Frontend Config
Edit `klariti.so/.env.local`:
```bash
# API URL
NEXT_PUBLIC_API_URL=http://127.0.0.1:8081

# Optional: Analytics, etc.
NEXT_PUBLIC_GA_ID=
```

## 📊 Database Schema

Challenges are stored with:
- `id`: Primary key
- `name`: Challenge name
- `description`: Optional description
- `challenge_type`: "time_based" or "toggle"
- `creator_id`: User who created it
- `completed`: Boolean flag
- `strict_mode`: Boolean flag
- Related tables: `time_based_details`, `toggle_details`, `distracting_websites`

## 🎨 Customization

### Change Colors
Edit `klariti.so/tailwind.config.ts`:
```typescript
theme: {
  extend: {
    colors: {
      primary: '#3b82f6', // blue-600
      secondary: '#8b5cf6', // purple-600
    }
  }
}
```

### Add New Challenge Types
1. Update backend enum in `models/challenge.py`
2. Update frontend `ChallengeType` enum in `services/challenges.ts`
3. Add new fields to `CreateChallengeForm`
4. Update `ChallengeCard` display logic

## 🚢 Production Deployment

### Backend (FastAPI)
```bash
# Using gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8081

# Or using uvicorn
uvicorn main:app --host 0.0.0.0 --port 8081 --workers 4
```

### Frontend (Next.js)
```bash
# Build
npm run build

# Start production server
npm start

# Or deploy to Vercel
vercel --prod
```

### Environment Variables (Production)
```bash
# Backend
DATABASE_URL=postgresql://...
SECRET_KEY=your-production-secret
CORS_ORIGINS=https://yourdomain.com

# Frontend
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

## 📚 Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [OpenAPI Schema Viewer](http://127.0.0.1:8081/docs) (when backend is running)

## ✅ Success Checklist

- [ ] Backend running on port 8081
- [ ] Frontend running on port 3000
- [ ] Can register a new user
- [ ] Can login successfully
- [ ] Can create a challenge
- [ ] Can view all challenges
- [ ] Can join a challenge
- [ ] Can see challenge stats
- [ ] Can toggle challenge (toggle-type)
- [ ] Navigation links work
- [ ] No console errors

## 🎉 You're Ready!

If you've completed all the steps above, you're ready to start using and developing the Challenges feature!

**Next Steps:**
1. Explore the code in `/src/components/challenges/`
2. Try creating different types of challenges
3. Customize the UI to match your brand
4. Add new features (see CHALLENGES_IMPLEMENTATION.md for ideas)

Happy coding! 🚀
