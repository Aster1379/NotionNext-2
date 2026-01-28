import BLOG from '@/blog.config'; // 1. 直接导入原始配置
import { useGlobal } from '@/lib/global'; // 2. 导入 useGlobal
import { useEffect, useRef } from 'react';

export default function Coze() {
  const isInitialized = useRef(false);
  
  // 调试函数：模拟 siteConfig 逻辑
  const debugSiteConfig = (key) => {
    console.group(`[Coze 深度调试] 追踪键: ${key}`);
    
    // 源头A：直接读取 blog.config.js (BLOG)
    const blogConfigValue = BLOG[key];
    console.log('1. BLOG[key] 原始值:', blogConfigValue, `(类型: ${typeof blogConfigValue})`);
    
    // 源头B：尝试读取 global (来自 Notion)
    let global = {};
    let notionConfigValue = undefined;
    let themeConfigValue = undefined;
    try {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      global = useGlobal();
      notionConfigValue = global.NOTION_CONFIG?.[key];
      themeConfigValue = global.THEME_CONFIG?.[key];
      console.log('2. useGlobal() 执行成功');
      console.log('   - global.NOTION_CONFIG 存在?', !!global.NOTION_CONFIG);
      console.log('   - global.NOTION_CONFIG[key]:', notionConfigValue);
      console.log('   - global.THEME_CONFIG[key]:', themeConfigValue);
      console.log('   - global.siteInfo 存在?', !!global.siteInfo);
    } catch (error) {
      console.log('2. useGlobal() 抛出错误（可能在非组件环境）:', error.message);
    }
    
    // 模拟判定逻辑
    let finalValue = undefined;
    // 第一优先级：NOTION_CONFIG 或 THEME_CONFIG
    if (notionConfigValue !== undefined && notionConfigValue !== null) {
      finalValue = notionConfigValue;
      console.log('3. 判定: 值来自 [最高] global.NOTION_CONFIG');
    } else if (themeConfigValue !== undefined && themeConfigValue !== null) {
      finalValue = themeConfigValue;
      console.log('3. 判定: 值来自 [次高] global.THEME_CONFIG');
    }
    // 第二优先级：BLOG (blog.config.js)
    else if (blogConfigValue !== undefined && blogConfigValue !== null) {
      finalValue = blogConfigValue;
      console.log('3. 判定: 值来自 [最低] BLOG (blog.config.js)');
    } else {
      console.log('3. 判定: 所有来源均为空');
    }
    
    console.log('4. 最终返回值:', finalValue, `(类型: ${typeof finalValue})`);
    console.groupEnd();
    return finalValue;
  };
  
  // 使用调试函数读取配置
  const botId = debugSiteConfig('COZE_BOT_ID'); // 关键：用调试函数读
  const patToken = BLOG['COZE_PAT_TOKEN']; // 令牌先直接从BLOG读，简化问题
  const sdkUrl = BLOG['COZE_SRC_URL'] || 'https://lf-cdn.coze.cn/obj/unpkg/flow-platform/chat-app-sdk/1.2.0/libs/cn/index.js';
  
  useEffect(() => {
    if (isInitialized.current || !botId || !patToken) return;
    isInitialized.current = true;
    
    console.log('[Coze] 准备初始化，使用调试得到的 Bot ID:', botId);
    // ... 这里是你原有的初始化逻辑，确保使用上面得到的 botId ...
    
  }, [botId, patToken, sdkUrl]);
  
  return null;
}
