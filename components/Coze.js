import { siteConfig } from '@/lib/config'
import { loadExternalResource } from '@/lib/utils'
import { useEffect } from 'react'

export default function Coze() {
  const cozeSrc = siteConfig(
    'COZE_SRC_URL',
    'https://lf-cdn.coze.cn/obj/unpkg/flow-platform/chat-app-sdk/1.2.0-beta.6/libs/cn/index.js'
  )
  
  const title = siteConfig('COZE_TITLE', 'NotionNext助手')
  const botId = siteConfig('COZE_BOT_ID')
  const cozeToken = siteConfig('COZE_PAT_TOKEN', '')

  // 令牌刷新逻辑
  const refreshToken = async () => {
    // 开发环境模拟刷新
    if (process.env.NODE_ENV === 'development') {
      return cozeToken // 返回原令牌继续使用
    }
    // 生产环境调用后端API
    try {
      const response = await fetch('/api/refresh-coze-token', { method: 'POST' })
      if (response.ok) {
        const data = await response.json()
        return data.token
      }
    } catch (error) {
      console.error('Token refresh failed:', error)
    }
    return ''
  }

  const loadCoze = async () => {
    await loadExternalResource(cozeSrc)
    const CozeWebSDK = window?.CozeWebSDK
    if (CozeWebSDK) {
      const cozeClient = new CozeWebSDK.WebChatClient({
        config: { bot_id: botId },
        auth: {
          type: 'token',
          token: cozeToken,
          onRefreshToken: refreshToken
        },
        componentProps: { title: title }
      })
      console.log('coze client initialized', cozeClient)
    }
  }

  useEffect(() => {
    if (!botId || !cozeToken) {
      console.warn('Missing botId or cozeToken, skip Coze initialization')
      return
    }
    loadCoze()
  }, [botId, cozeToken])

  return <></>
}
