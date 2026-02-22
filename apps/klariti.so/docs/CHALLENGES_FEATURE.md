# Challenges Feature - User Guide

## Overview

The Challenges feature allows users to create, join, and manage productivity challenges. The system supports two types of challenges:

1. **Time-Based Challenges**: Challenges with specific start and end dates
2. **Toggle Challenges**: On/off challenges that can be activated/deactivated anytime

## Features

### 🎯 Challenge Management

- **Create Challenges**: Create custom challenges with names, descriptions, and settings
- **View All Challenges**: Browse all available challenges created by the community
- **My Challenges**: Track challenges you've joined
- **Created Challenges**: Manage challenges you've created
- **Join Challenges**: Participate in challenges created by others
- **Toggle Status**: For toggle-type challenges, activate/deactivate as needed

### 🛠️ Challenge Configuration

#### Common Settings (All Challenges)
- **Name**: Required, max 100 characters
- **Description**: Optional, max 255 characters
- **Challenge Type**: Time-based or Toggle (cannot be changed after creation)
- **Strict Mode**: Enable stricter tracking and enforcement
- **Distracting Websites**: List of URLs to block during the challenge

#### Time-Based Challenge Settings
- **Start Date**: When the challenge begins
- **End Date**: When the challenge ends
- **Status**: Automatically calculated (Upcoming, In Progress, Ended)

#### Toggle Challenge Settings
- **Active/Inactive**: Current state of the challenge
- **Toggle Control**: Creators can activate/deactivate anytime

## Pages

### `/challenges` - Main Challenges Page
The dedicated challenges page with three tabs:
- **All Challenges**: Browse all available challenges
- **My Challenges**: Challenges you're participating in
- **Created by Me**: Challenges you've created

### `/playground` - Dashboard
Integrated challenges section at the top of the playground dashboard, plus other development tools.

## API Integration

The frontend connects to the FastAPI backend using the following endpoints:

### Challenge Endpoints
- `POST /challenges/` - Create new challenge
- `GET /challenges/` - Get all challenges (with pagination & filters)
- `GET /challenges/{id}` - Get specific challenge
- `PATCH /challenges/{id}` - Update challenge (creator only)
- `PATCH /challenges/{id}/toggle` - Toggle challenge status

### User-Specific Endpoints
- `GET /challenges/my-challenges` - Get challenges you've joined
- `GET /challenges/my-created-challenges` - Get challenges you've created
- `POST /challenges/{id}/join` - Join a challenge
- `PATCH /challenges/{id}/participation` - Update participation state

## Components

### `CreateChallengeForm`
Location: `/src/components/challenges/CreateChallengeForm.tsx`

Form component for creating new challenges with:
- Dynamic fields based on challenge type
- Website blocking configuration
- Real-time validation
- Error handling

### `ChallengeCard`
Location: `/src/components/challenges/ChallengeCard.tsx`

Display component for individual challenges with:
- Status badges (Active, Completed, Upcoming, etc.)
- Challenge details and metadata
- Action buttons (Join, Toggle, etc.)
- Creator indicators
- Two variants: `default` and `compact`

### `ChallengeList`
Location: `/src/components/challenges/ChallengeList.tsx`

List component with:
- Tab navigation (All, My Challenges, Created)
- Auto-refresh on actions
- Loading and error states
- Empty state messaging
- Create challenge button

## Service Layer

Location: `/src/services/challenges.ts`

TypeScript service with:
- Type-safe API calls
- Automatic token handling
- Error handling
- Full TypeScript types matching OpenAPI schema

## Authentication

All challenge endpoints require authentication:
- JWT token stored in `localStorage` as `access_token`
- Automatically attached to requests via `Authorization: Bearer <token>` header
- Protected routes redirect to `/auth` if not authenticated

## Usage Examples

### Creating a Time-Based Challenge

```typescript
import { createChallenge, ChallengeType } from '@/services/challenges';

const challenge = await createChallenge({
  name: "30-Day No Social Media",
  description: "Stay off social media for 30 days",
  challenge_type: ChallengeType.TIME_BASED,
  strict_mode: true,
  start_date: "2025-01-01T00:00:00",
  end_date: "2025-01-30T23:59:59",
  distracting_websites: [
    { url: "https://facebook.com", name: "Facebook" },
    { url: "https://twitter.com", name: "Twitter" }
  ]
});
```

### Creating a Toggle Challenge

```typescript
const challenge = await createChallenge({
  name: "Deep Work Mode",
  description: "Block distractions when in deep work",
  challenge_type: ChallengeType.TOGGLE,
  is_active: false,
  strict_mode: true,
  distracting_websites: [
    { url: "https://youtube.com", name: "YouTube" }
  ]
});
```

### Joining a Challenge

```typescript
import { joinChallenge } from '@/services/challenges';

await joinChallenge(challengeId);
```

## Status Badges

Challenges display different status badges:

- **✅ Completed**: Challenge is marked as completed
- **🔵 Active**: Toggle challenge is currently active
- **⚪ Inactive**: Toggle challenge is currently inactive
- **🟡 Upcoming**: Time-based challenge hasn't started yet
- **🟢 In Progress**: Time-based challenge is currently running
- **⚫ Ended**: Time-based challenge has finished

## Security & Permissions

- **Creator Permissions**: Only challenge creators can:
  - Update challenge details
  - Toggle challenge status (for toggle-type)
  - Modify strict mode settings

- **Participant Permissions**: Any authenticated user can:
  - View all challenges
  - Join challenges
  - Update their own participation state
  - View their challenges

## Future Enhancements

Potential features to add:
- [ ] Challenge analytics and progress tracking
- [ ] Social features (comments, likes, shares)
- [ ] Challenge templates
- [ ] Notifications and reminders
- [ ] Chrome extension integration with website blocking
- [ ] Mobile app support
- [ ] Challenge leaderboards
- [ ] Achievement badges

## Troubleshooting

### "Failed to create challenge"
- Ensure you're logged in
- Check that all required fields are filled
- For time-based challenges, end date must be after start date
- Verify API endpoint is accessible

### "Failed to join challenge"
- Ensure you're logged in
- Check that the challenge still exists
- You may have already joined this challenge

### Challenges not loading
- Check your internet connection
- Verify API backend is running
- Clear localStorage and log in again
- Check browser console for errors

## Development

### Environment Setup

Make sure your `.env.local` file has:
```
NEXT_PUBLIC_API_URL=http://127.0.0.1:8081
```

### Running the Backend

```bash
cd api-klariti
uvicorn main:app --reload --port 8081
```

### Running the Frontend

```bash
cd klariti.so
npm run dev
```

## Related Files

- `/src/services/challenges.ts` - API service layer
- `/src/components/challenges/` - Challenge components
- `/src/app/challenges/page.tsx` - Challenges page
- `/src/app/playground/page.tsx` - Dashboard with challenges
- `/src/contexts/AuthContext.tsx` - Authentication context
- `/api-klariti/api/routes/challenges.py` - Backend API routes (assumed)
