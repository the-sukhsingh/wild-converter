import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  serverExternalPackages: [
    "fonteditor-core",
    "potrace",
    "utif",
    "omggif",
    "heic2any",
    "docx-to-pdf-wasm",
    "pptxgenjs",
  ],
  turbopack: {},
  webpack: (config, { isServer, webpack }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
        stream: false,
        https: false,
        http: false,
        url: false,
        zlib: false,
      };

      if (webpack) {
        config.plugins.push(
          new webpack.NormalModuleReplacementPlugin(/^node:/, (resource: { request: string }) => {
            resource.request = resource.request.replace(/^node:/, "");
          })
        );
      }
    }
    return config;
  },
};

export default nextConfig;
