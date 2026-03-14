/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use an empty turbopack config to silence the webpack migration warning
  // The @imgly/background-removal library is loaded dynamically on client-side
  // so no special webpack/turbopack config is needed for WASM
  turbopack: {},
};

export default nextConfig;
