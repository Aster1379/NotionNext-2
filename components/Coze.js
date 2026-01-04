import { siteConfig } from '@/lib/config'
import { loadExternalResource } from '@/lib/utils'
import { useEffect } from 'react'

export default function Coze() {
  // 保持SDK升级后的地址不变
  const cozeSrc = siteConfig(
    'COZE_SRC_URL',
    'https://lf-cdn.coze.cn/obj/unpkg/flow-platform/chat-app-sdk/1.2.0-beta.6/libs/cn/index.js'
  )
  
  const title = siteConfig('COZE_TITLE', 'NotionNext助手')
  const botId = siteConfig('COZE_BOT_ID')
  // 新增PAT token配置项（需要你从Coze控制台获取）
  const cozeToken = siteConfig('COZE_PAT_TOKEN', 'pat_Wq3suBwaP7yhlLDCtUTKvxEiazya9rHrTkSRov0cn0lMucdTkR9y4JxbUqAfbsDr')

  const loadCoze = async () => {
    await loadExternalResource(cozeSrc)
    const CozeWebSDK = window?.CozeWebSDK
    if (CozeWebSDK) {
      const cozeClient = new CozeWebSDK.WebChatClient({ 
        config: { bot_id: botId },
        // 新增鉴权配置，解决unauth不支持问题
        auth: {
          type: 'token',
          token: cozeToken
        },
        componentProps: { title: title } 
      })
      console.log('coze', cozeClient)
    }
  }

  useEffect(() => {
    if (!botId || !cozeToken) {
      console.warn('Missing botId or cozeToken, skip Coze initialization')
      return
    }
    loadCoze()
  }, [botId, cozeToken])

  return <>
}
