/**
 * Centralized API base URL resolver.
 * Supports BOTH:
 * 1. Automatic smart hostname detection (staging.instantplacement.in -> staging-api, instantplacement.in -> api)
 *    so NO manual .env changes are needed from your senior on the server!
 * 2. Explicit environment variable override (NEXT_PUBLIC_API_URL) if provided.
 */
export const getApiBaseUrl = (): string => {
  // Client-side detection (runs in browser on staging.instantplacement.in or instantplacement.in)
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;

    // 1. Automatic Staging Server detection -> staging-api
    if (hostname === "staging.instantplacement.in" || hostname.includes("staging")) {
      return "https://staging-api.instantplacement.in/api/v1";
    }

    // 2. Automatic Production Server detection -> api
    if (hostname === "instantplacement.in" || hostname.endsWith(".instantplacement.in")) {
      return "https://api.instantplacement.in/api/v1";
    }

    // 3. Cloudflare tunnels / ngrok / alwaysdata
    if (hostname.endsWith(".trycloudflare.com") || hostname.includes("ngrok")) {
      return "/api/v1";
    }
    if (hostname.includes("alwaysdata.net")) {
      return `https://${hostname}/api/v1`;
    }

    // 4. Localhost
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return process.env.NEXT_PUBLIC_API_URL || "http://localhost:5100/api/v1";
    }
  }

  // Server-side / Build-time: check environment variable first
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/+$/, "");
  }

  // Server-side production fallback
  if (process.env.NODE_ENV === "production") {
    return "https://api.instantplacement.in/api/v1";
  }

  // Local development default
  return "http://localhost:5100/api/v1";
};
