import { siteConfig } from '@/lib/config'
import { loadExternalResource } from '@/lib/utils'
import { useEffect } from 'react'

/**
 * Coze-AI机器人集成组件
 * 适配2026年Coze最新SDK规范
 */
export default function Coze() {
  // 更新SDK地址为最新稳定版本
  const cozeSrc = siteConfig(
    'COZE_SRC_URL',
    'https://lf-cdn.coze.cn/obj/unpkg/flow-platform/chat-app-sdk/1.2.0-beta.6/libs/cn/index.js'
  )
  
  const title = siteConfig('COZE_TITLE', 'NotionNext助手')
  const botId = siteConfig('COZE_BOT_ID')
  // 新增鉴权配置
  const cozeToken = siteConfig('COZE_PAT_TOKEN', '') // 从Coze控制台获取Personal Access Token

  const loadCoze = async () => {
    await loadExternalResource(cozeSrc)
    const CozeWebSDK = window?.CozeWebSDK

    if (CozeWebSDK) {
      const cozeClient = new CozeWebSDK.WebChatClient({
        // 基础配置升级
        config: {
          type: 'bot', // 若为应用类型则改为'app'
          bot_id: botId,
          // isIframe: true  // 可选：使用iframe模式嵌入
        },
        // 新增鉴权机制
        auth: {
          type: 'token',
          token: cozeToken,
          // 可选：token过期自动刷新函数
          onRefreshToken: async () => {
            // 此处实现token刷新逻辑
            return cozeToken
          }
        },
        // UI配置调整
        componentProps: {
          title: title
          // icon: 'https://your-bot-icon-url.png'  // 可选：自定义机器人图标
        },
        // 可选：指定挂载容器
        el: document.getElementById('coze-container')
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

  return <div id="coze-container"></div>
}
