# 🎯 Klariti Browser Extension

A Chrome/Chromium extension that helps you stay focused by blocking distracting websites based on your active challenges from Klariti.

## Features

- 🔐 **Secure Authentication** - Login with your Klariti account credentials
- 📋 **Challenge Management** - View all your active challenges in the extension popup
- 🚫 **Website Blocking** - Automatically blocks websites from active challenges
- 🔄 **Real-time Sync** - WebSocket connection keeps challenges updated in real-time
- ✅ **Smart Blocking** - Only blocks websites when challenges are active and not completed
- 📱 **Multiple Challenges** - Supports participation in multiple challenges simultaneously
- ⏰ **Time-based & Toggle Challenges** - Works with both challenge types

## Installation

### Development Installation

1. Clone the repository and navigate to the extension directory:
```bash
cd klariti-chromium
```

2. Update the API URL in `config.js`:
```javascript
const API_BASE_URL = "http://127.0.0.1:8081"; // Change to your deployed API URL
```

3. Load the extension in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right corner)
   - Click "Load unpacked"
   - Select the `klariti-chromium` directory

4. Pin the extension to your toolbar for easy access

## Configuration

### API URL Setup

Before using the extension, update the API URL in `config.js`:

```javascript
// For local development
const API_BASE_URL = "http://127.0.0.1:8081";

// For production
const API_BASE_URL = "https://your-api-domain.com";
```

### Backend CORS Configuration

Make sure your API backend allows Chrome extension requests. The API should include:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"chrome-extension://.*",
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)
```

## Usage

### 1. Login

- Click the Klariti extension icon in your browser toolbar
- Enter your username and password
- Click "Login"

### 2. View Challenges

Once logged in, you'll see:
- Your username at the top
- A list of all challenges you're participating in
- Challenge status (Active, Paused, Completed)
- Websites being blocked for each challenge
- Real-time connection status (🟢 Connected / 🔴 Disconnected)

### 3. Website Blocking

The extension automatically:
- Blocks websites from **active** challenges
- Allows websites from **paused** or **completed** challenges
- Shows a friendly block page when you try to access a blocked website
- Updates blocking rules in real-time via WebSocket

### 4. Multiple Challenges

If you're participating in multiple challenges:
- All active challenges are respected
- A website is blocked if **ANY** active challenge includes it
- Completing or pausing one challenge won't unblock websites that are in other active challenges

### 5. Logout

- Click the "Logout" button to sign out
- All website blocking will be disabled
- You'll need to login again to re-enable blocking

## How It Works

### Architecture

1. **Popup (popup.js)** - Handles user authentication and displays challenges
2. **Background Script (background.js)** - Manages website blocking and WebSocket connection
3. **Content Script (content.js)** - Minimal script for future enhancements
4. **Config (config.js)** - Centralized API configuration

### Blocking Logic

```javascript
// A website is blocked if ALL of these are true:
1. User is logged in
2. Challenge is NOT completed
3. Challenge is active (toggle=on OR within time range)
4. Website URL matches the challenge's distracting websites
```

### Real-time Updates

The extension uses WebSocket connections to:
- Receive challenge toggle notifications instantly
- Update blocking rules when challenges change on the web app
- Maintain sync between the extension and web dashboard

## Development

### File Structure

```
klariti-chromium/
├── config.js           # API configuration
├── manifest.json       # Extension manifest
├── popup.html         # Extension popup UI
├── popup.js           # Popup logic and authentication
├── background.js      # Website blocking and WebSocket
├── content.js         # Content script (minimal)
├── snwtr.png         # Extension icon
└── README.md         # This file
```

### Testing

1. Start your local API server:
```bash
cd api-klariti
uvicorn main:app --reload --port 8081
```

2. Load the extension in Chrome (see Installation above)

3. Test authentication and blocking:
   - Login with valid credentials
   - Create a challenge on klariti.so
   - Add a website to block (e.g., youtube.com)
   - Activate the challenge
   - Try visiting the blocked website

### Debugging

- Open Chrome DevTools for the popup: Right-click extension icon → Inspect popup
- View background script logs: Go to `chrome://extensions/` → Click "service worker" under Klariti
- Check content script logs: Open DevTools on any webpage (F12)

## API Endpoints Used

- `POST /login` - User authentication
- `GET /challenges/participating` - Fetch user's challenges
- `WS /challenges/ws` - WebSocket for real-time updates

## Permissions

The extension requires these permissions:

- `tabs` - To detect and block website access
- `activeTab` - To check current tab URL
- `storage` - To store authentication tokens and challenges
- `alarms` - To periodically check time-based challenges
- `webRequest` - To intercept and block navigation requests
- `<all_urls>` - To block any website in challenges

## Security

- Authentication tokens are stored in Chrome's local storage
- WebSocket connections are authenticated via the API
- No sensitive data is logged or transmitted outside Klariti servers

## Troubleshooting

### Extension not blocking websites

1. Check you're logged in (click extension icon)
2. Verify challenge is **active** and not completed
3. Check WebSocket connection status (should show 🟢 Connected)
4. Confirm website URL matches exactly what's in the challenge

### CORS errors in console

Update your API's CORS configuration to allow Chrome extensions:
```python
allow_origin_regex=r"chrome-extension://.*"
```

### WebSocket connection fails

1. Verify API URL in `config.js` is correct
2. Check if API WebSocket endpoint is running
3. Ensure firewall allows WebSocket connections

### Can't login

1. Verify API URL is correct in `config.js`
2. Check that API server is running
3. Verify credentials are correct
4. Check browser console for error messages

## License

See LICENSE file in the root directory.

## Support

For issues or questions:
- Open an issue on GitHub
- Visit klariti.so for more information

---

Built with ❤️ for focused productivity
