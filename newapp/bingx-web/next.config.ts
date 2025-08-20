import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuration plus permissive pour le développement
  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
    "10.0.0.114",
  ],
  eslint: {
    // Désactiver ESLint pendant le build de dev
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Permettre les builds avec erreurs TypeScript en dev
    ignoreBuildErrors: true,
  },
  experimental: {
    // Optimisations pour le dev
    optimizePackageImports: ['@heroicons/react'],
  },
};

export default nextConfig;