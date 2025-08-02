// next.config.ts
import type { NextConfig } from "next";

const config: NextConfig = {
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
};

export default config;
