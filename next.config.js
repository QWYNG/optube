/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'ddragon.leagueoflegends.com'
      }
    ]
  }
}

module.exports = nextConfig
