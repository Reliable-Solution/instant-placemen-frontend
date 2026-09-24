export const getApiBaseUrl = (): string => {
  // If explicitly configured to a remote API (not localhost)
  if (process.env.NEXT_PUBLIC_API_URL && !process.env.NEXT_PUBLIC_API_URL.includes("localhost")) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/+$/, "");
  }

  // Client-side detection: if running on live or staging domain
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    if (hostname.includes("alwaysdata.net")) {
      return `https://${hostname}/api/v1`;
    }
    if (hostname === "instantplacement.in" || hostname.endsWith(".instantplacement.in")) {
      return "https://api.instantplacement.in/api/v1";
    }
  }

  // Server-side in production
  if (process.env.NODE_ENV === "production") {
    return "https://api.instantplacement.in/api/v1";
  }

  // Local development default
  return (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5100/api/v1").replace(/\/+$/, "");
};
