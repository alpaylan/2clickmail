
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    PUBLIC_URL: "http://twoclickmail.com",
    SERVER_URL: "https://twoclickmail.fly.dev",
    DEV_PUBLIC_URL: "https://localhost:3000",
    DEV_SERVER_URL: "http://localhost:5000",
  }
}

module.exports = nextConfig
