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
    "pptx-preview",
  ],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "credentialless",
          },
        ],
      },
    ];
  },
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

      config.module = {
        ...config.module,
        exprContextCritical: false,
      };

      if (webpack) {
        config.plugins.push(
          new webpack.NormalModuleReplacementPlugin(/^node:/, (resource: { request: string }) => {
            resource.request = resource.request.replace(/^node:/, "");
          })
        );
      }
    }

    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      { module: /fonteditor-core/ },
      { module: /@jsquash/ },
      { message: /Critical dependency: the request of a dependency is an expression/ },
      { message: /Circular dependency between chunks with runtime/ },
    ];

    return config;
  },
};

export default nextConfig;
