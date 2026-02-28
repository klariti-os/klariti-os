export const API_BASE_URL = "https://api-klariti.onrender.com";

export const getWebSocketUrl = (apiUrl: string) => {
  const wsUrl = apiUrl.replace(/^https/, "wss");
  return `${wsUrl}/challenges/ws`;
};

export const config = {
  apiUrl: API_BASE_URL,
  wsUrl: getWebSocketUrl(API_BASE_URL),
};

export default config;
