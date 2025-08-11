import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Autorise explicitement les origines utilisées en dev pour éviter l'avertissement Cross origin
  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
    "10.0.0.114",
  ],
};

export default nextConfig;
