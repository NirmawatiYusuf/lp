import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  async redirects() {
    return [
      { source: "/blog", destination: "/writing", permanent: true },
      { source: "/blog/:course", destination: "/writing/kuliah/:course", permanent: true },
      { source: "/blog/:course/:slug", destination: "/writing/:slug", permanent: true },
    ];
  },
};

export default nextConfig;
