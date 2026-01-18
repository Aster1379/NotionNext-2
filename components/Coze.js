import { siteConfig } from '@/lib/config'
import { useEffect, useRef } from 'react'

export default function Coze() {
  const isInitialized = useRef(false)

  // 核心：仅读取环境变量，不做任何额外处理
  const botId = siteConfig('COZE_BOT_ID')
  const patToken = siteConfig('COZE_PAT_TOKEN')
  const sdkUrl = siteConfig('COZE_SRC_URL', 'https://lf-cdn.coze.cn/obj/unpkg/flow-platform/chat-app-sdk/1.2.0/libs/cn/index.js')

  useEffect(() => {
    // 防止重复初始化
    if (isInitialized.current || !botId || !patToken) {
      return
    }
    isInitialized.current = true

    console.log('[Coze] 环境变量已加载，开始初始化')

    const initializeCoze = () => {
      try {
        new window.CozeWebSDK.WebChatClient({
          config: {
            type: 'bot',
            bot_id: botId,
            isIframe: false,
          },
          auth: {
            type: 'token',
            token: patToken,
            onRefreshToken: async () => patToken // 简化为直接返回原令牌
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
            footer: { isShow: false }, // 暂时关闭页脚，避免复杂配置
            conversations: { isNeed: true },
            chatBot: {
              title: siteConfig('COZE_BOT_TITLE', '助手'),
              uploadable: false, // 暂时关闭上传，简化配置
              width: 390,
            },
          },
        })
        console.log('[Coze] 初始化调用完成')
      } catch (error) {
        console.error('[Coze] 初始化错误:', error)
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
      }
    }
    document.body.appendChild(script)

  }, [botId, patToken, sdkUrl])

  // 本组件不渲染任何内容
  return null
}
