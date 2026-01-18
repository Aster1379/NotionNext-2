import { siteConfig } from '@/lib/config'
import { useEffect, useRef } from 'react'

export default function Coze() {
  // 使用Ref记录加载状态，避免重复初始化
  const isInitialized = useRef(false)

  // 从环境变量读取配置（务必与Playground成功值一致）
  const botId = siteConfig('COZE_BOT_ID', '7591009318518964262')
  const patToken = siteConfig('COZE_PAT_TOKEN', 'cztei_lhEhgwMEks8NpGZFRonZ2OtXGuzIxKNGQPH5jjl5ahR4HTvK6sMzPf4IdDPCVlb9t') // 请替换为你的有效令牌
  const sdkUrl = siteConfig('COZE_SRC_URL', 'https://lf-cdn.coze.cn/obj/unpkg/flow-platform/chat-app-sdk/1.2.0/libs/cn/index.js')

  useEffect(() => {
    // 防止重复执行
    if (isInitialized.current) return
    isInitialized.current = true

    console.log('[Coze] 开始集成流程，环境检查...')
    console.log('[Coze] BotId 是否存在:', !!botId)
    console.log('[Coze] Token 是否存在:', !!patToken)

    if (!botId || !patToken) {
      console.error('[Coze] 错误：缺少必要的 COZE_BOT_ID 或 COZE_PAT_TOKEN 环境变量')
      return
    }

    // 主初始化函数
    const initializeCoze = () => {
      console.log('[Coze] 执行初始化，使用的Token前6位:', patToken.substring(0, 6))
      try {
        // 关键：这完全复刻了控制台成功的代码
        window.cozeClient = new window.CozeWebSDK.WebChatClient({
          config: {
            type: 'bot',
            bot_id: botId,
            isIframe: false,
          },
          auth: {
            type: 'token',
            token: patToken,
            // 简化：直接返回当前token。如果控制台成功，这里也应成功。
            onRefreshToken: async () => {
              console.log('[Coze] onRefreshToken回调被调用（简化处理）')
              return patToken
            }
          },
          userInfo: {
            id: 'user',
            url: 'https://lf-coze-web-cdn.coze.cn/obj/eden-cn/lm-lgvj/ljhwZthlaukjlkulzlp/coze/coze-logo.png',
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
              expressionText: 'Powered by NotionNext',
            },
            conversations: {
              isNeed: true,
            },
            chatBot: {
              title: 'Coze Bot',
              uploadable: true,
              width: 390,
            },
          },
        })
        console.log('[Coze] 🎉 客户端初始化调用成功！')
      } catch (error) {
        console.error('[Coze] 初始化过程中捕获到异常:', error)
      }
    }

    // 情况1：如果SDK已加载（例如通过别的方式），直接初始化
    if (window.CozeWebSDK) {
      console.log('[Coze] SDK已全局存在，直接初始化')
      initializeCoze()
      return
    }

    // 情况2：SDK未加载，动态创建脚本标签（这是最可靠的方式）
    console.log('[Coze] SDK未加载，开始动态注入脚本...')
    const scriptId = 'coze-web-sdk-script'

    // 防止重复添加脚本
    if (document.getElementById(scriptId)) {
      console.log('[Coze] 脚本标签已存在，等待加载...')
      // 监听现有脚本的加载
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
      console.log('[Coze] SDK脚本加载成功，等待全局对象就绪...')
      // 即使onload触发，有时全局对象还差一点，用短暂延迟保证稳定
      setTimeout(() => {
        if (window.CozeWebSDK) {
          initializeCoze()
        } else {
          console.error('[Coze] 脚本加载但全局对象 CozeWebSDK 未找到')
        }
      }, 50)
    }

    script.onerror = (error) => {
      console.error('[Coze] SDK脚本加载失败:', error)
    }

    // 将脚本添加到body末尾
    document.body.appendChild(script)
    console.log(`[Coze] 已添加脚本标签: ${sdkUrl}`)

  }, [botId, patToken, sdkUrl]) // 依赖项

  // 组件不渲染任何内容
  return null
}
