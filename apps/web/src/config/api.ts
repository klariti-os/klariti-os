// API Configuration
// Load from environment variable or fallback to default
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export const config = {
  apiUrl: API_BASE,
};

// Export as default for convenience
export default API_BASE;
