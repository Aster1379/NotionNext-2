import { siteConfig } from '@/lib/config'
import { loadExternalResource } from '@/lib/utils'
import { useEffect } from 'react'

export default function Coze() {
  const cozeSrc = siteConfig( 
    'COZE_SRC_URL', 
    'https://lf-cdn.coze.cn/obj/unpkg/flow-platform/chat-app-sdk/1.2.0-beta.10/libs/cn/index.js' 
  )
  const title = siteConfig('COZE_TITLE', 'NotionNext助手')
  const botId = siteConfig('COZE_BOT_ID')
  const cozeToken = siteConfig('COZE_PAT_TOKEN', '')
  let lastCallTime = 0

  // 修复令牌刷新逻辑
  const refreshToken = async () => cozeToken

  // 调用频率控制
  const callWithRateLimit = async (func) => {
    const now = Date.now()
    if (now - lastCallTime < 6000) {
      await new Promise(resolve => setTimeout(resolve, 6000 - (now - lastCallTime)))
    }
    lastCallTime = Date.now()
    return func()
  }

  // 带重试逻辑的初始化
  const loadCoze = async (retry = 0) => {
    try {
      await callWithRateLimit(() => loadExternalResource(cozeSrc))
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
        console.log('coze client initialized successfully')
      } else {
        throw new Error('CozeWebSDK not loaded')
      }
    } catch (error) {
      console.error('Coze initialization failed attempt', retry + 1, ':', error)
      if (retry < 3) {
        setTimeout(() => loadCoze(retry + 1), 2000)
      } else {
        console.error('All retries failed, please check your configuration and network')
      }
    }
  }

  useEffect(() => {
    if (!botId || !cozeToken) {
      console.warn('Missing botId or cozeToken, skip Coze initialization')
      return
    }
    loadCoze()
  }, [botId, cozeToken])

  return <> </>
}
