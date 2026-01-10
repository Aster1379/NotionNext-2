import { siteConfig } from '@/lib/config'
import { loadExternalResource } from '@/lib/utils'
import { useEffect } from 'react'

export default function Coze() {
  const cozeSrc = siteConfig( 
    'COZE_SRC_URL', 
    'https://lf-cdn.coze.cn/obj/unpkg/flow-platform/chat-app-sdk/1.2.0-beta.12/libs/cn/index.js' 
  )
  const title = siteConfig('COZE_TITLE', 'NotionNext助手')
  const botId = siteConfig('COZE_BOT_ID')
  const cozeToken = siteConfig('COZE_PAT_TOKEN', '')

  // 令牌刷新函数，返回原令牌
  const refreshToken = async () => cozeToken

  const loadCoze = async () => {
    try {
      await loadExternalResource(cozeSrc)
      const CozeWebSDK = window?.CozeWebSDK
      if (CozeWebSDK) {
        const cozeClient = new CozeWebSDK.WebChatClient({
          config: { 
            bot_id: botId,
            // 新增：配置服务器地址（国内版专用）
            server: 'https://api.coze.cn'
          },
          auth: {
            type: 'token',
            token: cozeToken,
            onRefreshToken: refreshToken
          },
          componentProps: { 
            title: title,
            // 新增：配置主题与网站风格匹配
            theme: 'light',
            // 新增：显示主题切换按钮
            show_switch_theme: true,
            // 新增：窗口大小配置
            width: 400,
            height: 600
          },
          // 新增：错误处理回调
          onError: (error) => {
            console.error('Coze Error:', error)
            // 错误时自动刷新页面
            setTimeout(() => window.location.reload(), 3000)
          },
          // 新增：消息回调
          onMessage: (message) => {
            console.log('New Message:', message)
          }
        })
        console.log('coze client initialized successfully')
      } else {
        console.error('CozeWebSDK not loaded')
      }
    } catch (error) {
      console.error('Coze initialization failed:', error)
    }
  }

  useEffect(() => {
    if (!botId || !cozeToken) return
    loadCoze()
  }, [botId, cozeToken])

  return <> </>
}
