import { siteConfig } from '@/lib/config'
import { useEffect, useRef } from 'react'

export default function Coze() {
  const isInitialized = useRef(false)

  // 1. 读取配置时增加调试日志
  const botId = siteConfig('COZE_BOT_ID')
  const patToken = siteConfig('COZE_PAT_TOKEN')
  const sdkUrl = siteConfig('COZE_SRC_URL', 'https://lf-cdn.coze.cn/obj/unpkg/flow-platform/chat-app-sdk/1.2.0/libs/cn/index.js') // 建议使用稳定版

  // 立即诊断：在组件渲染时就打印
  console.group('[Coze Debug] 配置读取结果');
  console.log('COZE_BOT_ID:', botId ? `"${botId}" (长度: ${botId.length})` : 'undefined (致命错误)');
  console.log('COZE_PAT_TOKEN:', patToken ? '已设置 (出于安全不显示)' : 'undefined (致命错误)');
  console.log('COZE_SRC_URL:', sdkUrl);
  console.groupEnd();

  useEffect(() => {
    // 2. 严格检查：任何一个关键配置缺失就立即停止，绝不继续
    if (!botId || !patToken) {
      console.error('[Coze] 初始化中止: COZE_BOT_ID 或 COZE_PAT_TOKEN 未正确配置。请检查 blog.config.js 及环境变量。');
      return;
    }

    if (isInitialized.current) {
      return;
    }
    isInitialized.current = true;

    console.log('[Coze] 所有配置就绪，开始加载SDK...');

    const initializeCoze = () => {
      try {
        console.log('[Coze] 正在创建客户端，使用 Bot ID:', botId);
        new window.CozeWebSDK.WebChatClient({
          config: {
            type: 'bot',
            bot_id: botId, // 如果前面检查通过，这里一定是正确的ID
            isIframe: false,
          },
          auth: {
            type: 'token',
            token: patToken,
            onRefreshToken: async () => {
              console.warn('[Coze] onRefreshToken被调用，返回当前Token');
              return patToken; // 临时方案
            }
          },
          userInfo: {
            id: 'user',
            nickname: 'User',
          },
          ui: {
            base: { layout: 'pc', lang: 'en', zIndex: 1000 },
            header: { isShow: true, isNeedClose: true },
            asstBtn: { isNeed: true },
            footer: { isShow: false },
            conversations: { isNeed: true },
            chatBot: {
              title: siteConfig('COZE_BOT_TITLE', '助手'),
              uploadable: false,
              width: 390,
            },
          },
        });
        console.log('[Coze] 初始化调用完成');
      } catch (error) {
        console.error('[Coze] 初始化过程中捕获错误:', error);
      }
    };

    // 动态加载SDK的逻辑不变
    if (window.CozeWebSDK) {
      initializeCoze();
      return;
    }

    const script = document.createElement('script');
    script.src = sdkUrl;
    script.async = true;
    script.onerror = () => console.error('[Coze] SDK脚本加载失败');
    script.onload = () => {
      if (window.CozeWebSDK) {
        initializeCoze();
      } else {
        console.error('[Coze] 脚本加载完毕，但 window.CozeWebSDK 未定义');
      }
    };
    document.body.appendChild(script);

  }, [botId, patToken, sdkUrl]);

  return null;
}
