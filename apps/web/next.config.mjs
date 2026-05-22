/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    typedRoutes: true,
    serverActions: {
      bodySizeLimit: '2mb'
    }
  },
  // Transpile workspace packages
  transpilePackages: ['@motofinance/db', '@motofinance/shared', '@motofinance/ui'],
  // M3 (Capacitor): habilitar `output: 'export'` quando empacotar para stores.
  // Em M1/M2 mantemos SSR para Server Actions funcionarem.
  images: {
    formats: ['image/avif', 'image/webp']
  }
};

export default nextConfig;
