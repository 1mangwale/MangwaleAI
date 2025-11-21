import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  
  // Allow cross-origin requests from our domain structure
  allowedDevOrigins: [
    'chat.mangwale.ai',
    'admin.mangwale.ai',
  ],
  
  // Domain-based routing with rewrites
  async rewrites() {
    return {
      beforeFiles: [
        // Proxy API requests to backend
        {
          source: '/api/chat/:path*',
          destination: 'http://localhost:3200/chat/:path*',
        },
        // chat.mangwale.ai - Root shows chat interface
        {
          source: '/',
          destination: '/chat',
          has: [
            {
              type: 'host',
              value: 'chat.mangwale.ai',
            },
          ],
        },
        // admin.mangwale.ai - Root redirects to admin dashboard
        {
          source: '/',
          destination: '/admin',
          has: [
            {
              type: 'host',
              value: 'admin.mangwale.ai',
            },
          ],
        },
      ],
    };
  },
  
  // Ensure proper CORS for API routes
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: 'https://chat.mangwale.ai, https://admin.mangwale.ai' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },
};

export default nextConfig;
