import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Generates typed `Link`/`router.push` href unions from the actual route
  // tree, catching typos/dead links at compile time. Stable (non-experimental)
  // as of this Next.js version.
  typedRoutes: true,

  // Required for Docker/K8s slim runtime images.
  output: "standalone",

  // Tree-shake heavy icon/package barrels in client chunks.
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },

  images: {
    // PRD-mandated media storage is Cloudinary — declared now so the config
    // is correct the moment real media (artist/band photos & video posters)
    // is fetched via next/image, with zero further next.config changes.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
    // 80 is the quality the Hero background (src/features/landing/hero)
    // requests for its cinematic imagery — a deliberately lower-than-default
    // value since these are large, full-bleed photos where the file-size
    // savings matter more than pixel-perfect fidelity. Explicit allow-list
    // required starting Next.js 16; declaring it now avoids a breaking
    // change later.
    qualities: [75, 80],
  },
};

export default nextConfig;
