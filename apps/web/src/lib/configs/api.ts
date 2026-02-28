// API Configuration
// Load from environment variable or fallback to default
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4200";

export const config = {
  apiUrl: API_BASE,
};

// Export as default for convenience
export default API_BASE;
