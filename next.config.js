/** @type {import('next').NextConfig} */
const path = require('path')
const fs = require('fs')

// 尝试加载 blog.config，如果失败则使用默认值
let BLOG = {}
try {
  BLOG = require('./blog.config')
} catch (error) {
  console.warn('blog.config.js not found or invalid, using defaults')
  BLOG = {
    LANG: 'zh-CN',
    NOTION_PAGE_ID: process.env.NOTION_PAGE_ID || '',
    BUNDLE_ANALYZER: false
  }
}

// 安全地获取主题
const THEME = (function() {
  try {
    // 检查主题目录是否存在
    const themePath = path.resolve(__dirname, 'themes')
    if (!fs.existsSync(themePath)) {
      return process.env.THEME || 'default'
    }
    
    // 尝试从 blog.config 获取主题
    if (BLOG.THEME) return BLOG.THEME
    
    // 扫描可用主题
    const themes = fs.readdirSync(themePath).filter(file => {
      const fullPath = path.join(themePath, file)
      return fs.statSync(fullPath).isDirectory()
    })
    
    return themes.includes('default') ? 'default' : (themes[0] || 'default')
  } catch (error) {
    console.warn('Error detecting theme:', error.message)
    return 'default'
  }
})()

// 安全的语言检测
const locales = (function() {
  const defaultLang = BLOG.LANG || 'zh-CN'
  const langs = [defaultLang]
  
  try {
    const pageId = BLOG.NOTION_PAGE_ID || process.env.NOTION_PAGE_ID || ''
    if (pageId && pageId.includes(',')) {
      const siteIds = pageId.split(',')
      for (const siteId of siteIds) {
        // 简单的语言前缀检测
        const match = siteId.match(/^([a-z]{2}):/)
        if (match && !langs.includes(match[1])) {
          langs.push(match[1])
        }
      }
    }
  } catch (error) {
    console.warn('Error detecting locales:', error.message)
  }
  
  return langs
})()

// 只有在非导出构建时启用多语言
const i18nConfig = (function() {
  if (process.env.EXPORT || process.env.NEXT_BUILD_STANDALONE) {
    return undefined
  }
  
  if (locales.length <= 1) {
    return undefined
  }
  
  return {
    defaultLocale: locales[0],
    locales: locales
  }
})()

// 动态导入 bundle analyzer，避免影响构建
const withBundleAnalyzer = (function() {
  try {
    return require('@next/bundle-analyzer')({
      enabled: BLOG.BUNDLE_ANALYZER === true || process.env.ANALYZE === 'true'
    })
  } catch (error) {
    // 返回一个透明包装器
    return config => config
  }
})()

const nextConfig = {
  // 构建检查配置
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  },
  
  // 输出配置
  output: process.env.NEXT_BUILD_STANDALONE === 'true' ? 'standalone' : undefined,
  
  // 构建超时设置
  staticPageGenerationTimeout: 300,
  
  // 性能优化
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  swcMinify: true,
  
  // 模块优化
  modularizeImports: {
    '@heroicons/react/24/outline': {
      transform: '@heroicons/react/24/outline/{{member}}'
    },
    '@heroicons/react/24/solid': {
      transform: '@heroicons/react/24/solid/{{member}}'
    },
    'lodash-es': {
      transform: 'lodash-es/{{member}}'
    }
  },
  
  // 多语言配置
  i18n: i18nConfig,
  
  // 图片配置
  images: {
    // Vercel 环境下让平台处理优化
    unoptimized: process.env.VERCEL === '1' ? false : BLOG.IMAGE_UNOPTIMIZED === true,
    
    // 图片格式优化
    formats: ['image/avif', 'image/webp'],
    
    // 响应式图片尺寸
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    
    // 允许的域名
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.notion.so',
      },
      {
        protocol: 'https',
        hostname: '**.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'gravatar.com',
      },
      {
        protocol: 'https',
        hostname: '**.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'p1.qhimg.com',
      },
    ].filter(Boolean),
    
    // 最低缓存时间
    minimumCacheTTL: 60 * 60 * 24,
  },
  
  // 重定向配置
  async redirects() {
    if (process.env.EXPORT) return []
    
    const redirects = []
    
    // RSS 重定向
    if (BLOG.ENABLE_RSS !== false) {
      redirects.push({
        source: '/feed',
        destination: '/rss/feed.xml',
        permanent: true,
      })
    }
    
    return redirects
  },
  
  // 重写规则
  async rewrites() {
    if (process.env.EXPORT) return []
    
    const rewrites = []
    
    // 多语言路径重写
    if (locales.length > 1) {
      const langPattern = locales.join('|')
      rewrites.push(
        {
          source: `/:locale(${langPattern})/:path*`,
          destination: '/:path*',
        },
        {
          source: `/:locale(${langPattern})`,
          destination: '/',
        }
      )
    }
    
    // 静态页面重写
    rewrites.push({
      source: '/:path*.html',
      destination: '/:path*',
    })
    
    return rewrites
  },
  
  // 自定义 headers
  async headers() {
    if (process.env.EXPORT) return []
    
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          // CORS 头
          {
            key: 'Access-Control-Allow-Origin',
            value: '*'
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, OPTIONS'
          },
        ],
      },
    ]
  },
  
  // Webpack 配置
  webpack: (config, { dev, isServer, webpack }) => {
    // 主题别名
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname),
      '@theme-components': path.resolve(__dirname, 'themes', THEME),
    }
    
    // 优化模块解析
    config.resolve.modules = [
      path.resolve(__dirname, 'node_modules'),
      'node_modules',
    ]
    
    // 开发环境 source map
    if (dev) {
      config.devtool = 'eval-source-map'
    }
    
    // 生产环境优化
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            defaultVendors: {
              test: /[\\/]node_modules[\\/]/,
              priority: -10,
              reuseExistingChunk: true,
            },
            default: {
              minChunks: 2,
              priority: -20,
              reuseExistingChunk: true,
            },
          },
        },
      }
    }
    
    return config
  },
  
  // 实验性功能
  experimental: {
    // 滚动恢复
    scrollRestoration: BLOG.ENABLE_SCROLL_RESTORATION !== false,
    
    // 优化包导入
    optimizePackageImports: ['@heroicons/react', 'lodash', 'date-fns'],
    
    // 提升构建性能
    externalDir: true,
    
    // 优化服务器组件
    serverComponentsExternalPackages: ['sharp', 'onnxruntime-node'],
  },
  
  // 页面排除规则（静态导出时）
  exportPathMap: async function(defaultPathMap, { dev, dir, outDir, distDir, buildId }) {
    if (!process.env.EXPORT) {
      return defaultPathMap
    }
    
    // 静态导出时排除动态页面
    const { defaultPathMap: paths } = defaultPathMap
    const excludePaths = ['/sitemap.xml', '/auth', '/api/**']
    
    for (const path of excludePaths) {
      delete paths[path]
    }
    
    return paths
  },
  
  // 环境变量
  env: {
    NEXT_PUBLIC_THEME: THEME,
    NEXT_PUBLIC_AVAILABLE_LOCALES: JSON.stringify(locales),
  },
  
  // 生产环境配置
  productionBrowserSourceMaps: BLOG.SOURCE_MAPS === true,
  
  // 允许的构建时间
  onDemandEntries: {
    maxInactiveAge: 60 * 60 * 1000,
    pagesBufferLength: 5,
  },
}

// 应用 bundle analyzer（如果启用）
module.exports = withBundleAnalyzer(nextConfig)
