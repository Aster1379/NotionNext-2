import { siteConfig } from '@/lib/config'
import { loadExternalResource } from '@/lib/utils'
import { useEffect } from 'react'

export default function Coze() {
  // 使用最新稳定版SDK
  const cozeSrc = siteConfig(
    'COZE_SRC_URL',
    'https://lf-cdn.coze.cn/obj/unpkg/flow-platform/chat-app-sdk/1.2.0/libs/cn/index.js'
  )
  const title = siteConfig('COZE_TITLE', 'NotionNext助手')
  const botId = siteConfig('COZE_BOT_ID') // 确保与Playground测试成功的ID一致
  const cozeToken = siteConfig('COZE_PAT_TOKEN', '') // 务必已替换为Playground测试成功的新令牌

  // 修复：移除之前有问题的refreshToken函数
  // const refreshToken = async () => cozeToken // 旧代码，已删除

  const loadCoze = async () => {
    // 诊断日志：确认前端获取到的值
    console.log('[Coze Debug] 环境变量 botId:', botId)
    console.log('[Coze Debug] 环境变量 token 前6位:', cozeToken ? cozeToken.substring(0, 6) + '...' : '(空)')

    if (!botId || !cozeToken) {
      console.error('[Coze Error] 缺少 botId 或 token，请检查环境变量 COZE_BOT_ID 和 COZE_PAT_TOKEN')
      return
    }

    try {
      // 加载SDK脚本
      await loadExternalResource(cozeSrc)
      const CozeWebSDK = window?.CozeWebSDK

      if (!CozeWebSDK) {
        throw new Error('CozeWebSDK 全局对象未加载成功，请检查脚本地址或网络')
      }

      console.log('[Coze Debug] SDK加载成功，开始初始化...')

      // 重要修改：完全按照官方Playground成功示例的结构
      const cozeClient = new CozeWebSDK.WebChatClient({
        // 修复：config 对象只包含 bot_id，确保没有 server 参数
        config: {
          bot_id: botId,
          // 重要：已移除 server: 'https://api.coze.cn' 这一行
        },
        // 修复：auth 对象严格遵循官方格式
        auth: {
          type: 'token',
          token: cozeToken, // 使用从环境变量获取的新令牌
          // 重要修改：onRefreshToken 必须返回一个新的令牌字符串
          // 当前测试阶段，可暂时让它也返回同一个有效令牌（仅用于调试）
          onRefreshToken: async function () {
            console.log('[Coze Debug] onRefreshToken 回调被触发')
            // 注意：在生产环境中，这里应调用你的后端接口来获取一个全新的、有效的令牌
            // 示例安全做法：
            // const response = await fetch('/api/refresh-coze-token');
            // const { newToken } = await response.json();
            // return newToken;
            
            // 临时调试方案（确认令牌有效时可使用）：
            // 直接返回当前令牌。如果初始化就因此报401，说明当前cozeToken可能仍有问题。
            return cozeToken
          }
        },
        componentProps: {
          title: title || 'AI助手',
          theme: 'light',
          show_switch_theme: true,
          width: 400,
          height: 600,
          // 可选：固定位置，避免布局跳动
          position: 'fixed',
          right: '20px',
          bottom: '20px'
        },
        onError: (error) => {
          console.error('[Coze SDK Error]', error)
          // 可根据错误类型细化处理，例如网络错误提示
          if (error.message && error.message.includes('network')) {
            console.warn('网络异常，可尝试重新加载')
          }
        },
        // 可选：监听消息
        onMessage: (message) => {
          console.log('[Coze Message]', message)
        }
      })

      console.log('[Coze Debug] 客户端初始化完成，等待WebSocket连接...')

    } catch (error) {
      console.error('[Coze Initialization Failed]', error)
    }
  }

  useEffect(() => {
    // 确保只在客户端执行
    if (typeof window !== 'undefined') {
      loadCoze()
    }
  }, []) // 空依赖数组，只运行一次

  // 本组件不渲染任何内容
  return null
}
