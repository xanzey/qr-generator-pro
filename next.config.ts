import type {NextConfig} from 'next';

const isGithubActions = process.env.GITHUB_ACTIONS === 'true'

const repo = 'qr-generator' // Replace with your repository name

const nextConfig: NextConfig = {
  /* config options here */
  output: 'export',
  basePath: isGithubActions ? `/${repo}` : '',
  assetPrefix: isGithubActions ? `/${repo}/` : '',
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
