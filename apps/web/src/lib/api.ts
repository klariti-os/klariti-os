import { createApiClient } from "@klariti/api/client";
import API_BASE from "@/lib/configs/api";

export const api = createApiClient({
  baseUrl: API_BASE,
  baseHeaders: {
    Authorization: () => {
      if (typeof window === "undefined") return "";
      const token = localStorage.getItem("access_token");
      return token ? `Bearer ${token}` : "";
    },
  },
});
