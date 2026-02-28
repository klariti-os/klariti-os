# Real-time Challenge Updates with WebSockets

This document explains the WebSocket implementation for real-time challenge updates across multiple users and browser sessions.

## Overview

The system now supports real-time updates when users toggle challenges. When one user toggles a challenge, all other users viewing the challenges page will see the change immediately without needing to refresh.

## Architecture

### Backend (FastAPI)

#### 1. WebSocket Connection Manager (`api-klariti/core/websocket.py`)

A centralized manager that handles all WebSocket connections:
- **Connect**: Accepts new WebSocket connections
- **Disconnect**: Removes closed connections
- **Broadcast**: Sends messages to all connected clients
- **Personal Messages**: Send messages to specific clients

#### 2. WebSocket Endpoint (`api-klariti/api/routes/challenges.py`)

```
WS: ws://your-api-url/challenges/ws
```

Features:
- Accepts WebSocket connections
- Keeps connections alive with ping/pong
- Handles connection errors and disconnections gracefully

#### 3. Toggle Endpoint Update

The `PATCH /{challenge_id}/toggle` endpoint now:
1. Updates the challenge in the database
2. Broadcasts the change to all connected WebSocket clients
3. Returns the updated challenge

**Message format:**
```json
{
  "type": "challenge_toggled",
  "challenge_id": 123,
  "is_active": true,
  "challenge": {
    "id": 123,
    "name": "Focus Challenge",
    "toggle_details": {
      "is_active": true
    },
    ...
  }
}
```

### Frontend (Next.js)

#### 1. WebSocket Hook (`klariti.so/src/hooks/useChallengeWebSocket.ts`)

A custom React hook that manages the WebSocket connection:

**Features:**
- Automatic connection on mount
- Auto-reconnection with exponential backoff (5 attempts max)
- Ping/pong to keep connection alive (every 30 seconds)
- Environment-aware WebSocket URL (uses `NEXT_PUBLIC_API_URL`)
- Proper cleanup on unmount
- TypeScript type safety

**Usage:**
```tsx
const { isConnected, reconnectAttempts } = useChallengeWebSocket({
  onChallengeToggled: (challengeId, isActive, challenge) => {
    // Handle real-time update
  },
  onConnect: () => console.log("Connected"),
  onDisconnect: () => console.log("Disconnected"),
  onError: (error) => console.error("Error:", error),
});
```

#### 2. Updated ChallengeList Component

**Changes:**
- Imports and uses `useChallengeWebSocket` hook
- Implements `handleChallengeUpdate` callback to update challenges in real-time
- Shows visual connection status indicator (green pulse dot)
- Optimistic UI updates for local user actions
- WebSocket updates for remote user actions

**Update Flow:**

1. **Local User Toggle:**
   - Optimistic update → UI changes immediately
   - API call → Confirms with server
   - WebSocket broadcast → Notifies other users
   - On error → Reverts by reloading

2. **Remote User Toggle:**
   - WebSocket message received
   - State updated with new challenge data
   - UI re-renders only affected challenge card

## Environment Configuration

The WebSocket URL is automatically derived from `NEXT_PUBLIC_API_URL`:

**.env.local:**
```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8081
```

The WebSocket URL is constructed by replacing `http` with `ws`:
- `http://127.0.0.1:8081` → `ws://127.0.0.1:8081/challenges/ws`
- `https://api.klariti.so` → `wss://api.klariti.so/challenges/ws`

## Features

✅ **Real-time Updates**: Changes appear instantly across all connected clients  
✅ **Optimistic UI**: Local actions feel instant  
✅ **Auto-Reconnect**: Reconnects automatically on connection loss (up to 5 attempts)  
✅ **Connection Status**: Visual indicator shows when live updates are active  
✅ **Keep-Alive**: Ping/pong messages maintain connection  
✅ **Error Handling**: Graceful degradation if WebSocket fails  
✅ **Environment-Aware**: Uses configured API URL, no hardcoded values  
✅ **TypeScript**: Full type safety  

## Testing

### Test Real-time Updates:

1. Open the challenges page in two different browser windows/tabs
2. Toggle a challenge in one window
3. Observe the change appear immediately in the other window

### Test Connection Status:

1. Look for the green pulse indicator showing "Live updates enabled"
2. Stop the backend server
3. Observe reconnection attempts in the console
4. Restart the server and verify it reconnects

## CORS Configuration

The backend allows WebSocket connections from the frontend origins configured in `main.py`:

```python
allow_origins=[
    "http://localhost:3000", 
    "http://localhost:3002",
    "http://127.0.0.1:3000",
    # Add your production domain here
]
```

## Future Enhancements

Potential improvements:
- [ ] User-specific channels (only receive updates for joined challenges)
- [ ] Broadcast challenge creation/deletion events
- [ ] Show "X users online" counter
- [ ] Show who toggled the challenge
- [ ] Offline queue for actions when disconnected
- [ ] WebSocket authentication (currently open)

## Troubleshooting

**WebSocket not connecting:**
1. Check `NEXT_PUBLIC_API_URL` is set correctly
2. Verify backend is running
3. Check CORS configuration includes your frontend URL
4. Look for errors in browser console and backend logs

**Updates not appearing:**
1. Check connection status indicator
2. Verify WebSocket is connected (check console logs)
3. Test with browser DevTools Network tab (filter by WS)

**Excessive reconnections:**
- Normal after server restart
- If persistent, check for network issues or CORS problems
