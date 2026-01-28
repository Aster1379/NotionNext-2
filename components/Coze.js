import { siteConfig } from '@/lib/config'
import { useEffect, useRef } from 'react'

export default function Coze() {
  const isInitialized = useRef(false)

  // 【核心修正】传入空对象{}作为第三个参数，绕过NOTION_CONFIG的读取
  const botId = siteConfig('COZE_BOT_ID', '7591009318518964262', {})
  const patToken = siteConfig('COZE_PAT_TOKEN', '', {})
  const sdkUrl = siteConfig('COZE_SRC_URL', 'https://lf-cdn.coze.cn/obj/unpkg/flow-platform/chat-app-sdk/1.2.0/libs/cn/index.js', {})

  // 部署后验证日志
  console.group('[Coze 配置验证]')
  console.log('生效的 Bot ID:', botId)
  console.log('Token 已设置:', patToken ? '是' : '否（请检查配置）')
  console.log('SDK 地址:', sdkUrl)
  console.groupEnd()

  useEffect(() => {
    // 严格检查：缺少关键配置则静默退出
    if (isInitialized.current || !botId || !patToken) {
      if (!botId || !patToken) {
        console.warn('[Coze] 初始化中止：缺少 COZE_BOT_ID 或 COZE_PAT_TOKEN 配置。')
      }
      return
    }
    isInitialized.current = true

    console.log('[Coze] 开始初始化...')

    const initializeCoze = () => {
      try {
        new window.CozeWebSDK.WebChatClient({
          config: {
            type: 'bot',
            bot_id: botId, // 此时应为正确的 7591009318518964262
            isIframe: false,
          },
          auth: {
            type: 'token',
            token: patToken,
            // 简化处理，生产环境应实现安全的后端刷新
            onRefreshToken: async () => {
              console.log('[Coze] Token刷新回调被触发')
              return patToken
            }
          },
          userInfo: {
            id: 'user',
            nickname: 'User',
          },
          ui: {
            base: {
              layout: 'pc',
              lang: 'en',
              zIndex: 1000
            },
            header: { isShow: true, isNeedClose: true },
            asstBtn: { isNeed: true },
            footer: { isShow: false }, // 简化UI，避免页脚问题
            conversations: { isNeed: true },
            chatBot: {
              title: siteConfig('COZE_BOT_TITLE', '助手', {}),
              uploadable: false, // 关闭上传简化配置
              width: 390,
            },
          },
        })
        console.log('[Coze] 🎉 客户端初始化调用成功')
      } catch (error) {
        console.error('[Coze] 初始化过程中发生错误:', error)
      }
    }

    // 动态加载SDK
    if (window.CozeWebSDK) {
      initializeCoze()
      return
    }

    const script = document.createElement('script')
    script.src = sdkUrl
    script.async = true
    script.onload = () => {
      if (window.CozeWebSDK) {
        initializeCoze()
      } else {
        console.error('[Coze] SDK脚本已加载，但未找到全局对象 CozeWebSDK')
      }
    }
    script.onerror = () => {
      console.error('[Coze] 无法加载SDK脚本，请检查网络或地址: ', sdkUrl)
    }
    document.body.appendChild(script)

  }, [botId, patToken, sdkUrl]) // 依赖项

  // 本组件不渲染任何可见内容
  return null
}
