import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Giữ link cũ (bản prototype) không bị chết sau khi đổi cấu trúc URL.
  async redirects() {
    return [
      { source: "/projects", destination: "/work", permanent: true },
      { source: "/note", destination: "/blog", permanent: true },
      {
        source: "/roadmap",
        has: [{ type: "query", key: "id", value: "(?<id>[a-z0-9-]+)" }],
        destination: "/roadmap/:id",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
