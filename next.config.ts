// next.config.ts
import type { NextConfig } from "next";

const config: NextConfig = {
  typescript: {
    // Ignore TypeScript errors during build
    ignoreBuildErrors: true,
  },
  eslint: {
    // Skip ESLint during build (already covered by --no-lint)
    ignoreDuringBuilds: true,
  },
  // Add your other Next.js configurations here if you have any

  // This is the crucial part for Konva
  webpack: (config, { isServer }) => {
    // We want to edit the webpack config for the server-side bundle only
    if (isServer) {
      // Konva's main entry point references the `canvas` module, which we don't want to bundle.
      // We can safely ignore it since we are using Konva on the client-side only.
      // The `externals` array is where we define modules that shouldn't be bundled.
      // We use a safe spread operator to avoid errors if `config.externals` is undefined.
      config.externals = [...(config.externals || []), "canvas"];
    }
    return config;
  },

  // Defaults every deployment to noindex — same reasoning as swales-services'
  // next.config.mjs: cert-transparency logs expose a new domain to crawlers
  // regardless of robots.txt/Search Console submission. Set
  // ALLOW_INDEXING=true in Vercel's env vars only on the deployment that
  // should really be searchable.
  // TODO at the swales.app cutover: set ALLOW_INDEXING=true on the
  // production env var for whichever domain becomes canonical — see
  // "Cutover stage" in ../swales-backend/docs/status.md. Don't just delete
  // this block; it should keep defaulting to noindex for any
  // non-canonical domain (staging/test) even after cutover.
  async headers() {
    if (process.env.ALLOW_INDEXING === "true") return [];
    return [
      {
        source: "/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default config;
