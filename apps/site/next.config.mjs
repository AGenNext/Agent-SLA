const isGithubPages = process.env.GITHUB_PAGES === "true";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: isGithubPages ? "/Agent-SLA" : "",
  assetPrefix: isGithubPages ? "/Agent-SLA/" : "",
  images: {
    unoptimized: true
  }
};

export default nextConfig;
