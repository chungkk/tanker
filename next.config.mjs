/** @type {import('next').NextConfig} */
const nextConfig = {
  // better-sqlite3 là native C++ addon, cần exclude khỏi webpack bundling
  serverExternalPackages: ['better-sqlite3'],
};

export default nextConfig;
