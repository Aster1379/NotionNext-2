import { siteConfig } from '@/lib/config'
import { loadExternalResource } from '@/lib/utils'
import { useEffect } from 'react'

export default function Coze() {
  const botId = siteConfig('COZE_BOT_ID')
  const cozeToken = siteConfig('COZE_PAT_TOKEN', '')

  useEffect(() => {
    if (!botId || !cozeToken) {
      console.error('Missing botId or cozeToken')
      return
    }

    const script = document.createElement('script')
    script.src = 'https://lf-cdn.coze.cn/obj/unpkg/flow-platform/chat-app-sdk/1.2.0-beta.10/libs/cn/index.js'
    script.onload = () => {
      if (window.CozeWebSDK) {
        new window.CozeWebSDK.WebChatClient({
          config: { bot_id: botId },
          auth: {
            type: 'token',
            token: cozeToken
          }
        })
        console.log('Coze initialized successfully')
      } else {
        console.error('CozeWebSDK not loaded')
      }
    }
    document.body.appendChild(script)
  }, [botId, cozeToken])

  return <> </>
}
