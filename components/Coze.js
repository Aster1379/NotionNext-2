import { siteConfig } from '@/lib/config'
import { loadExternalResource } from '@/lib/utils'
import { useEffect } from 'react'

export default function Coze() {
  // 建议更新SDK为最新版本（与官方示例一致）
  const cozeSrc = siteConfig(
    'COZE_SRC_URL',
    'https://lf-cdn.coze.cn/obj/unpkg/flow-platform/chat-app-sdk/1.2.0-beta.19/libs/cn/index.js' // 版本从 beta.12 更新为 beta.19
  )
  const title = siteConfig('COZE_TITLE', 'NotionNext助手')
  const botId = siteConfig('COZE_BOT_ID')
  const cozeToken = siteConfig('COZE_PAT_TOKEN', '')

  // 修正的令牌刷新函数
  // 重要：在实际部署中，此函数应调用你的后端安全接口来刷新令牌，避免在前端硬编码或返回固定令牌
  const refreshToken = async () => {
    // 示例：这里应该是一个安全的异步请求，从你的后端获取新的有效令牌
    // const response = await fetch('/api/your-coze-refresh-endpoint');
    // const data = await response.json();
    // return data.newToken;
    
    // 临时方案：仅用于调试，返回当前令牌。长期使用必须实现上述安全逻辑。
    console.warn('注意：refreshToken当前返回固定令牌。请实现安全的令牌刷新后端接口。');
    return cozeToken;
  }

  const loadCoze = async () => {
    // 如果缺少关键配置，静默失败
    if (!botId || !cozeToken) {
      console.warn('Coze: botId 或 token 未配置，助手将不加载。')
      return
    }

    try {
      // 1. 加载SDK脚本
      await loadExternalResource(cozeSrc)
      
      // 2. 确保全局SDK对象已就绪
      const CozeWebSDK = window?.CozeWebSDK
      if (!CozeWebSDK) {
        throw new Error('CozeWebSDK 全局对象未找到，请检查脚本加载。')
      }

      // 3. 初始化客户端 - 关键修改部分
      const cozeClient = new CozeWebSDK.WebChatClient({
        // 修改点1: 移除 `server` 配置，使用SDK默认连接
        config: { 
          bot_id: botId,
          // 已移除：server: 'https://api.coze.cn'
        },
        // 修改点2: 保持 `type: 'token'` 但修正 refreshToken 逻辑
        auth: {
          type: 'token',
          token: cozeToken,
          onRefreshToken: refreshToken // 指向修正后的函数
        },
        componentProps: { 
          title: title,
          theme: 'light',
          show_switch_theme: true,
          width: 400,
          height: 600
        },
        onError: (error) => {
          console.error('[Coze SDK 错误]:', error)
          // 可根据错误类型进行更精细处理，例如仅在网络错误时重试
          if (error?.message?.includes('Network')) {
            setTimeout(() => {
              console.log('网络错误，尝试重新连接...')
              window.location.reload()
            }, 5000)
          }
        },
        onMessage: (message) => {
          // 可在此处处理收到的消息，例如通知、统计等
          console.debug('[Coze 消息]:', message)
        }
      })
      
      console.log('🎉 Coze 客户端初始化成功。')
      
    } catch (error) {
      console.error('🚨 Coze 初始化彻底失败:', error)
    }
  }

  // 仅在必要依赖项准备好后执行一次
  useEffect(() => {
    loadCoze()
  }, []) // 依赖项为空数组，确保只运行一次

  // 本组件不渲染任何可见DOM元素
  return null
}
