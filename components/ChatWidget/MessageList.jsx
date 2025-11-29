// components/ChatWidget/MessageList.jsx
import { useEffect, useRef } from 'react'

export default function MessageList({ messages, isLoading }) {
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const renderRelevantPosts = (posts) => {
    if (!posts || posts.length === 0) return null

    return (
      <div className="relevant-posts">
        <h4>📚 相关文章</h4>
        {posts.map((post, index) => (
          <span 
            key={index}
            className="relevant-post"
            onClick={() => window.open(`/blog/${post.slug}`, '_blank')}
            title={`查看: ${post.title}`}
          >
            {post.title}
          </span>
        ))}
      </div>
    )
  }

  const renderMessage = (message, index) => {
    const isUser = message.role === 'user'
    const isError = message.isError
    
    return (
      <div 
        key={index} 
        className={`message ${isUser ? 'user' : 'assistant'}`}
      >
        <div className="message-content">
          {message.content}
          
          {!isUser && message.usedMathModel && (
            <span className="model-badge">Math</span>
          )}
        </div>
        
        <div className="message-timestamp">
          {formatTime(message.timestamp)}
        </div>
        
        {!isUser && !isError && renderRelevantPosts(message.relevantPosts)}
        
        {isError && (
          <div style={{ color: '#ff4757', fontSize: '12px', marginTop: '5px' }}>
            ⚠️ 消息发送失败
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="message-list">
      {messages.length === 0 && (
        <div className="welcome-message">
          <div className="welcome-content">
            <h3>👋 你好！我是DeepSeek助手</h3>
            <p>我可以：</p>
            <ul>
              <li>💬 回答你的各种问题</li>
              <li>🧮 解答数学问题（自动使用Math模型）</li>
              <li>📖 基于你的博客内容提供建议</li>
              <li>💡 提供编程和技术指导</li>
            </ul>
            <p>试试问我一些关于你博客的问题吧！</p>
          </div>
        </div>
      )}
      
      {messages.map(renderMessage)}
      
      {isLoading && (
        <div className="message assistant">
          <div className="message-content">
            <div className="loading-dots">思考中</div>
          </div>
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  )
}
