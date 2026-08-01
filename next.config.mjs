import path from "node:path"
import { fileURLToPath } from "node:url"

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: path.dirname(fileURLToPath(import.meta.url)),
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "luar.com.br" },
      { protocol: "https", hostname: "www.luar.com.br" },
      { protocol: "https", hostname: "s2-techtudo.glbimg.com" },
      { protocol: "https", hostname: "lotusesoterismo.com.br" },
      { protocol: "https", hostname: "unolife.com.br" },
      { protocol: "https", hostname: "www.astrocentro.com.br" },
      { protocol: "https", hostname: "i0.wp.com" },
    ],
  },
}

export default nextConfig
