import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://esm.sh https://cdn.jsdelivr.net blob:; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src-elem 'self' 'unsafe-inline' https://cdn.jsdelivr.net; connect-src 'self' https://esm.sh https://cdn.jsdelivr.net http://127.0.0.1:3001 ws://127.0.0.1:3001 blob: data:; img-src 'self' blob: data: https:; font-src 'self' data: https://cdn.jsdelivr.net; worker-src 'self' blob: data:; child-src 'self' blob: data:;",
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
