import type { NextConfig } from "next";
import fs from "fs";
import { createRequire } from "module";
import path from "path";
import { fileURLToPath } from "url";

function findAppRootDir(...starts: string[]): string {
  const tried = starts.map((s) => path.resolve(s));
  const fsRoot = path.parse(tried[0] || process.cwd()).root;
  for (const start of tried) {
    let dir = start;
    while (dir !== fsRoot) {
      const marker = path.join(dir, "node_modules", "tailwindcss", "package.json");
      if (fs.existsSync(marker)) {
        return dir;
      }
      dir = path.dirname(dir);
    }
  }
  return path.resolve(process.cwd());
}

// Next may compile this file outside the repo; `import.meta.url` is not reliable alone.
// Prefer the nearest ancestor of this file *or* cwd that contains installed `tailwindcss`.
const projectRoot = findAppRootDir(
  path.dirname(fileURLToPath(import.meta.url)),
  process.cwd(),
);

const appRequire = createRequire(path.join(projectRoot, "package.json"));
const tailwindcssDir = path.dirname(appRequire.resolve("tailwindcss/package.json"));

const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL;
const adminHostname = (() => {
  if (!adminUrl) return null;
  try {
    return new URL(adminUrl).hostname;
  } catch {
    return null;
  }
})();

const nextConfig: NextConfig = {
  // When a parent folder has package-lock.json, Next infers the wrong workspace root and
  // Turbopack fails to resolve `tailwindcss`. Pin tracing + Turbopack to this app directory.
  outputFileTracingRoot: projectRoot,
  turbopack: {
    root: projectRoot,
    resolveAlias: {
      tailwindcss: tailwindcssDir,
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "sprykuhdavbnagzlahqk.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "drive.google.com",
      },
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      ...(adminHostname
        ? [
            { protocol: "https" as const, hostname: adminHostname, pathname: "/**" },
            { protocol: "http" as const, hostname: adminHostname, pathname: "/**" },
          ]
        : []),
      { protocol: "http", hostname: "localhost", port: "3003", pathname: "/**" },
      { protocol: "http", hostname: "localhost", port: "3000", pathname: "/**" },
    ],
  },
  async redirects() {
    return [
      {
        source: "/election-guide.mp4",
        destination: "https://res.cloudinary.com/tsgtyztc/video/upload/v1791387936/election-guide.mp4",
        permanent: false,
      },
      {
        source: "/media/election-guide.mp4",
        destination: "https://res.cloudinary.com/tsgtyztc/video/upload/v1791387936/election-guide.mp4",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
