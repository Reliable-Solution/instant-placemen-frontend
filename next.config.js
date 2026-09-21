/** @type {import('next').NextConfig} */
const nextConfig = {
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
    return [
      {
        source: "/api/:path*",
        destination: "http://127.0.0.1:5100/api/:path*",
      },
      {
        source: "/uploads/:path*",
        destination: "http://127.0.0.1:5100/uploads/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
