import { siteConfig } from '@/lib/config'
import { loadExternalResource } from '@/lib/utils'
import { useEffect } from 'react'

export default function Coze() {
  const cozeSrc = siteConfig( 'COZE_SRC_URL', 'https://lf-cdn.coze.cn/obj/unpkg/flow-platform/chat-app-sdk/1.2.0-beta.10/libs/cn/index.js' )
  const title = siteConfig('COZE_TITLE', 'NotionNext助手')
  const botId = siteConfig('COZE_BOT_ID')
  const cozeToken = siteConfig('COZE_PAT_TOKEN', '')

  // 空的刷新函数，满足SDK要求
  const refreshToken = async () => cozeToken

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
      console.log('coze client initialized successfully')
    }
  }

  useEffect(() => {
    if (!botId || !cozeToken) return
    loadCoze()
  }, [botId, cozeToken])

  return <> </>
}
