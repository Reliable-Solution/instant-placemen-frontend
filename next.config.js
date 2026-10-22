/** @type {import('next').NextConfig} */
const nextConfig = {
    allowedDevOrigins: [
    "*.trycloudflare.com",
  ],
  output: "standalone",
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "assets.workindia.in" },
      { protocol: "https", hostname: "apna.co" },
      { protocol: "https", hostname: "logo.clearbit.com" },
      { protocol: "https", hostname: "cdn-icons-png.flaticon.com" },
    ],
  },
  async rewrites() {
    const backendBase =
      process.env.BACKEND_INTERNAL_URL ||
      (process.env.NEXT_PUBLIC_API_URL
        ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/v1\/?$/, "").replace(/\/+$/, "")
        : "http://127.0.0.1:5100");

    return [
      {
        source: "/api/:path*",
        destination: `${backendBase}/api/:path*`,
      },
      {
        source: "/uploads/:path*",
        destination: `${backendBase}/uploads/:path*`,
      },
      // socket.io (chat) — same-origin so it works through Cloudflare tunnels.
      // NOTE: engine.io only answers on "/socket.io/" (with trailing slash), and
      // Next 308-redirects "/socket.io/" → "/socket.io", so the destination MUST
      // re-add the slash or the backend returns 404.
      {
        source: "/socket.io",
        destination: `${backendBase}/socket.io/`,
      },
      {
        source: "/socket.io/:path*",
        destination: `${backendBase}/socket.io/:path*`,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
          {
            key: "Content-Type",
            value: "application/javascript",
          },
          {
            key: "Service-Worker-Allowed",
            value: "/",
          },
        ],
      },
      {
        source: "/manifest.webmanifest",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
