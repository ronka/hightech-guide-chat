import { withBotId } from "botid/next/config";

// Pages that serve a different body (HTML vs. markdown) depending on the
// Accept header — kept in sync with MARKDOWN_NEGOTIATED_ROUTES in src/proxy.ts.
const MARKDOWN_NEGOTIATED_PATHS = [
  "/",
  "/cv-analysis",
  "/cracking-the-job-interview",
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack(config) {
    config.experiments = { ...config.experiments, topLevelAwait: true };
    return config;
  },
  async headers() {
    // Declared here (not in proxy.ts) because response headers set via
    // NextResponse.next() in Proxy/Middleware don't reliably survive the
    // Full Route Cache for statically-optimized pages — this layer does.
    return MARKDOWN_NEGOTIATED_PATHS.map((source) => ({
      source,
      headers: [{ key: "Vary", value: "Accept" }],
    }));
  },
};

export default withBotId(nextConfig);
