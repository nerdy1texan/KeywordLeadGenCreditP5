/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */

await import("./src/env.mjs");

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: [],
    missingSuspenseWithCSRBailout: true,
  },
  images: {
    domains: [
      "avatars.githubusercontent.com",
      "lh3.googleusercontent.com",
      "daisyui.com",
      "localhost",
      "keywordleadgen.com",
      "www.keywordleadgen.com"
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async redirects() {
    return [
      {
        source: "/privacy-policy",
        destination: "/pages/privacy-policy",
        permanent: true,
      },
      {
        source: "/terms",
        destination: "/pages/terms-and-conditions",
        permanent: true,
      },
    ];
  },
  output: 'standalone',
  poweredByHeader: false,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

import nextra from "nextra";

const withNextra = nextra({
  theme: "nextra-theme-docs",
  themeConfig: "./nextra-theme.config.tsx",
});

export default withNextra(config);
