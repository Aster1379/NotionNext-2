import { siteConfig } from '@/lib/config'
import { loadExternalResource } from '@/lib/utils'
import { useEffect } from 'react'

export default function Coze() {
  // 1. 加载SDK（使用与Playground一致的稳定版本）
  const cozeSrc = siteConfig(
    'COZE_SRC_URL',
    'https://lf-cdn.coze.cn/obj/unpkg/flow-platform/chat-app-sdk/1.2.0/libs/cn/index.js'
  )

  // 2. 从环境变量读取配置（关键：与Playground测试成功的值完全相同）
  const botId = siteConfig('COZE_BOT_ID', '7591009318518964262') // 务必与Playground的bot_id一致
  const patToken = siteConfig('COZE_PAT_TOKEN', '') // 填入在Playground测试成功的完整PAT令牌

  // 3. 可自定义的UI文案（可按需修改或通过环境变量配置）
  const userAvatar = siteConfig('COZE_USER_AVATAR', 'https://lf-coze-web-cdn.coze.cn/obj/eden-cn/lm-lgvj/ljhwZthlaukjlkulzlp/coze/coze-logo.png')
  const botTitle = siteConfig('COZE_BOT_TITLE', 'Coze Bot')
  const footerText = siteConfig('COZE_FOOTER_TEXT', 'Powered by NotionNext')

  /**
   * 关键修复：安全的令牌刷新函数
   * 注意：此函数必须返回一个全新的、有效的令牌字符串。
   * 在生产环境中，你应该调用自己的后端接口来刷新令牌，避免在前端硬编码密钥。
   */
  const handleRefreshToken = async () => {
    console.log('[Coze] onRefreshToken 回调被触发，正在获取新令牌...');
    // >>>>> 生产环境安全方案（强烈建议）<<<<<
    // try {
    //   // 调用你自己的后端API端点，该端点应返回一个新的有效PAT
    //   const response = await fetch('/api/coze/refresh-token');
    //   const data = await response.json();
    //   if (data.newToken) {
    //     return data.newToken;
    //   }
    //   throw new Error('无法从后端获取新令牌');
    // } catch (error) {
    //   console.error('[Coze] 刷新令牌失败:', error);
    //   // 可以尝试返回原令牌，或抛出错误让SDK处理
    //   return patToken;
    // }

    // >>>>> 临时调试方案（仅当确定当前PAT长期有效时使用）<<<<<
    // 重要：如果初始化时就触发此回调并报401，说明当前`patToken`可能已过期或被SDK认为无效。
    // 如果Playground测试成功但这里失败，请重点检查环境变量`COZE_PAT_TOKEN`是否已正确更新并部署。
    return patToken;
  };

  const loadCoze = async () => {
    // 基础校验
    if (!botId || !patToken) {
      console.warn('[Coze] 缺少必要的配置: COZE_BOT_ID 或 COZE_PAT_TOKEN');
      return;
    }
    console.log('[Coze] 开始加载，Bot ID:', botId);

    try {
      // 动态加载SDK脚本
      await loadExternalResource(cozeSrc);
      if (!window.CozeWebSDK) {
        throw new Error('CozeWebSDK 对象未加载成功');
      }

      // 核心配置：与Playground完全一致
      const client = new window.CozeWebSDK.WebChatClient({
        config: {
          type: 'bot',          // 明确指定类型为机器人
          bot_id: botId,        // 使用环境变量中的Bot ID
          isIframe: false,
        },
        auth: {
          type: 'token',
          token: patToken,      // 使用环境变量中的初始令牌
          onRefreshToken: handleRefreshToken // 指向安全的刷新函数
        },
        userInfo: {
          id: 'user',
          url: userAvatar,
          nickname: 'User',
        },
        ui: {
          base: {
            icon: 'https://lf-coze-web-cdn.coze.cn/obj/eden-cn/lm-lgvj/ljhwZthlaukjlkulzlp/coze/chatsdk-logo.png',
            layout: 'pc',
            lang: 'en',
            zIndex: 1000
          },
          header: {
            isShow: true,
            isNeedClose: true,
          },
          asstBtn: {
            isNeed: true
          },
          footer: {
            isShow: true,
            expressionText: footerText, // 使用配置的页脚文本
          },
          conversations: {
            isNeed: true,
          },
          chatBot: {
            title: botTitle, // 使用配置的聊天框标题
            uploadable: true,
            width: 390,
          },
        },
      });

      console.log('[Coze] 客户端初始化成功，等待连接...');

    } catch (error) {
      console.error('[Coze] 初始化失败:', error);
    }
  };

  // 在组件挂载时执行
  useEffect(() => {
    loadCoze();
  }, []);

  // 此组件不渲染任何可见DOM
  return null;
}
