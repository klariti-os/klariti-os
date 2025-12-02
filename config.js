// API Configuration
// Update this URL when deploying to production
const API_BASE_URL = "http://127.0.0.1:8081"; // Change to your deployed API URL

// Convert http(s) to ws(s) for WebSocket
const getWebSocketUrl = (apiUrl) => {
  const wsUrl = apiUrl.replace(/^http/, "ws");
  return `${wsUrl}/challenges/ws`;
  // ws://127.0.0.1:8081/challenges/ws
};

const config = {
  apiUrl: API_BASE_URL,
  wsUrl: getWebSocketUrl(API_BASE_URL),
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = config;
}
