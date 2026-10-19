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
      (process.env.NEXT_PUBLIC_API_URL && !process.env.NEXT_PUBLIC_API_URL.includes("localhost") && !process.env.NEXT_PUBLIC_API_URL.startsWith("/")
        ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/v1\/?$/, "")
        : process.env.NODE_ENV === "production"
        ? "https://api.instantplacement.in"
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
    ];
  },
};

module.exports = nextConfig;
