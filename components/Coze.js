import { siteConfig } from '@/lib/config'
import { useEffect, useRef } from 'react'

export default function Coze() {
  const isInitialized = useRef(false)

  // 关键修改：全部从环境变量读取，不设置任何硬编码的默认值
  const botId = siteConfig('COZE_BOT_ID') // 必须通过环境变量配置
  const patToken = siteConfig('COZE_PAT_TOKEN') // 必须通过环境变量配置
  const sdkUrl = siteConfig(
    'COZE_SRC_URL', 
    'https://lf-cdn.coze.cn/obj/unpkg/flow-platform/chat-app-sdk/1.2.0/libs/cn/index.js'
  )

  useEffect(() => {
    if (isInitialized.current) return
    isInitialized.current = true

    console.log('[Coze] 开始集成流程...')

    // 增强的环境变量检查
    if (!botId || botId.trim() === '') {
      console.error('[Coze] 错误：COZE_BOT_ID 环境变量未设置或为空')
      return
    }
    
    if (!patToken || patToken.trim() === '') {
      console.error('[Coze] 错误：COZE_PAT_TOKEN 环境变量未设置或为空')
      return
    }

    // 安全日志：只显示令牌长度，不显示内容
    console.log(`[Coze] 配置检查通过，Token长度: ${patToken.length}`)

    const initializeCoze = () => {
      try {
        window.cozeClient = new window.CozeWebSDK.WebChatClient({
          config: {
            type: 'bot',
            bot_id: botId, // 使用环境变量值
            isIframe: false,
          },
          auth: {
            type: 'token',
            token: patToken, // 使用环境变量值
            onRefreshToken: async () => {
              console.log('[Coze] onRefreshToken回调被调用')
              // 重要：在生产中，这里应调用你的安全后端接口
              // 临时返回当前token（确保环境变量已配置）
              return patToken
            }
          },
          // ... 其余UI配置保持不变（这部分不包含敏感信息） ...
          userInfo: {
            id: 'user',
            url: siteConfig('COZE_USER_AVATAR', 'https://lf-coze-web-cdn.coze.cn/obj/eden-cn/lm-lgvj/ljhwZthlaukjlkulzlp/coze/coze-logo.png'),
            nickname: 'User',
          },
          ui: {
            base: {
              icon: 'https://lf-coze-web-cdn.coze.cn/obj/eden-cn/lm-lgvj/ljhwZthlaukjlkulzlp/coze/chatsdk-logo.png',
              layout: 'pc',
              lang: 'en',
              zIndex: 1000
            },
            header: {
              isShow: true,
              isNeedClose: true,
            },
            asstBtn: {
              isNeed: true
            },
            footer: {
              isShow: true,
              expressionText: siteConfig('COZE_FOOTER_TEXT', 'Powered by NotionNext'),
            },
            conversations: {
              isNeed: true,
            },
            chatBot: {
              title: siteConfig('COZE_BOT_TITLE', 'AI Assistant'),
              uploadable: true,
              width: 390,
            },
          },
        })
        console.log('[Coze] 🎉 客户端初始化成功！')
      } catch (error) {
        console.error('[Coze] 初始化异常:', error)
      }
    }

    // 动态加载SDK的逻辑保持不变
    if (window.CozeWebSDK) {
      initializeCoze()
      return
    }

    const scriptId = 'coze-web-sdk-script'
    if (document.getElementById(scriptId)) {
      const checkInterval = setInterval(() => {
        if (window.CozeWebSDK) {
          clearInterval(checkInterval)
          initializeCoze()
        }
      }, 100)
      return
    }

    const script = document.createElement('script')
    script.id = scriptId
    script.src = sdkUrl
    script.async = true

    script.onload = () => {
      setTimeout(() => {
        if (window.CozeWebSDK) {
          initializeCoze()
        } else {
          console.error('[Coze] 脚本加载但全局对象未找到')
        }
      }, 50)
    }

    script.onerror = (error) => {
      console.error('[Coze] SDK脚本加载失败:', error)
    }

    document.body.appendChild(script)
    console.log(`[Coze] 已加载SDK脚本`)

  }, [botId, patToken, sdkUrl])

  return null
}
