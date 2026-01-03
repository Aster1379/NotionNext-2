/** @type {import('next').NextConfig} */

// 移除顶部的 require 语句，改为动态导入
const path = require('path')

// 简化的默认配置
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // 移除 output 配置或保持简单
  // output: process.env.VERCEL ? 'standalone' : undefined,
  
  // 图片配置（简化）
  images: {
    domains: [
      'www.notion.so',
      'images.unsplash.com',
      'gravatar.com',
      'avatars.githubusercontent.com',
      'p1.qhimg.com',
    ],
    unoptimized: process.env.VERCEL === '1', // Vercel 环境下不优化
  },
  
  // 禁用实验性功能
  experimental: {
    // scrollRestoration: true, // 可能引起问题，先注释
  },
  
  // 移除复杂的 webpack 配置
  webpack: (config, { dev, isServer }) => {
    // 简化 webpack 配置
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
        },
      }
    }
    return config
  },
  
  // 移除可能导致问题的功能
  // 注释掉 i18n、redirects、rewrites、headers
  // 这些可以在 blog.config.js 中配置
}

module.exports = nextConfig
