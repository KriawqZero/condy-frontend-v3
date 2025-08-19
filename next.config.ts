import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Ignorar erros de ESLint durante o build
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ignorar erros de TypeScript durante o build
    ignoreBuildErrors: true,
  },
  compiler: {
    styledComponents: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
