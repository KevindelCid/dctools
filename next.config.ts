import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuración para Vercel deployment
  experimental: {
    // Habilitar optimizaciones para producción
    optimizePackageImports: ['lucide-react']
  }
};

export default nextConfig;
