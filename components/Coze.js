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
  
  const loadCoze = async () => {
    await loadExternalResource(cozeSrc)
    const CozeWebSDK = window?.CozeWebSDK
    if (CozeWebSDK) {
      const cozeClient = new CozeWebSDK.WebChatClient({
        config: { bot_id: botId },
        auth: {
          type: 'token',
          token: cozeToken
        },
        componentProps: { 
          title: title,
          theme: 'light',
          show_switch_theme: true
        },
        onMessage: (message) => {
          console.log('New message:', message)
        },
        onError: (error) => {
          console.error('Coze error:', error)
          // 错误时自动重新加载SDK
          setTimeout(() => window.location.reload(), 3000)
        }
      })
      console.log('coze client initialized successfully')
    } else {
      console.error('CozeWebSDK not found')
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
