/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    webpackBuildWorker: true,
  },
  turbopack: {
    root: "/app",
  },
};

export default nextConfig;
