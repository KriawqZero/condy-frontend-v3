import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permite carregar recursos /_next/* a partir de outro domínio em dev
  allowedDevOrigins: ["https://dev.condy.com.br"],
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
  output: "standalone",
};

export default nextConfig;
