import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Config for web workers
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        'react-dom/server': false,
      };
    }
    config.module.rules.push({
      test: /\.worker\.ts$/,
      use: {
        loader: 'worker-loader',
        options: {
          filename: 'static/chunks/[name].[contenthash].js',
          publicPath: '/_next/',
        },
      },
    });

    return config;
  },
};

export default nextConfig;
