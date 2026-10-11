/** @type {import('next').NextConfig} */
const nextConfig = {
  // Không cần header "X-Powered-By: Next.js"
  poweredByHeader: false,

  // CORS: cho phép frontend ở domain khác gọi API
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type' },
          { key: 'Access-Control-Max-Age', value: '86400' },
        ],
      },
    ];
  },
};

export default nextConfig;
