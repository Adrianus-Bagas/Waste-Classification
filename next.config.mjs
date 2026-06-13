/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath: "/Waste-Classification",
  assetPrefix: "/Waste-Classification",
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
