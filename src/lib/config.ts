export const getApiBaseUrl = (): string => {
  // If explicitly configured in environment
  if (process.env.NEXT_PUBLIC_API_URL) {
    if (process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_API_URL.includes("localhost")) {
      // In production, forbid localhost URL
      return "https://api.instantplacement.in/api/v1";
    }
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/+$/, "");
  }

  // Client-side detection
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    if (hostname.includes("alwaysdata.net")) {
      return `https://${hostname}/api/v1`;
    }
    if (hostname.endsWith(".trycloudflare.com") || hostname.includes("ngrok")) {
      return "/api/v1";
    }
    if (hostname.includes("staging")) {
      return "https://staging-api.instantplacement.in/api/v1";
    }
    if (hostname === "instantplacement.in" || hostname.endsWith(".instantplacement.in")) {
      return "https://api.instantplacement.in/api/v1";
    }
    // Only in non-production allow localhost
    if (process.env.NODE_ENV !== "production" && (hostname === "localhost" || hostname === "127.0.0.1")) {
      return "http://localhost:5100/api/v1";
    }
  }

  // Server-side in production
  if (process.env.NODE_ENV === "production") {
    return "https://api.instantplacement.in/api/v1";
  }

  // Local development default
  return "http://localhost:5100/api/v1";
};
