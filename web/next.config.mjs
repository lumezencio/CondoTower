/** @type {import("next").NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  devIndicators: { buildActivity: false, appIsrStatus: false }, // oculta indicadores padrão
  experimental: { optimizePackageImports: ["lucide-react"] }
};
export default nextConfig;
