// components/ChatWidget/index.jsx
'use client'
import { useState, useRef, useEffect } from 'react'
import ChatIcon from './ChatIcon'
import MessageList from './MessageList'
import './ChatWidget.css'

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // 从本地存储加载对话历史
  useEffect(() => {
    const savedMessages = localStorage.getItem('deepseek-chat-history')
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages))
    }
  }, [])

  // 保存对话历史到本地存储
  useEffect(() => {
    localStorage.setItem('deepseek-chat-history', JSON.stringify(messages))
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          conversationHistory: messages.slice(-10)
        })
      })

      const data = await response.json()

      const aiMessage = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date().toISOString(),
        relevantPosts: data.relevantPosts,
        usedMathModel: data.usedMathModel
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      
      const errorMessage = {
        role: 'assistant',
        content: '抱歉，出现了错误。请稍后重试。',
        timestamp: new Date().toISOString(),
        isError: true
      }
      
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleNewChat = () => {
    setMessages([])
    localStorage.removeItem('deepseek-chat-history')
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <>
      <ChatIcon onClick={() => setIsOpen(!isOpen)} />
      
      {isOpen && (
        <div className="chat-widget">
          <div className="chat-header">
            <h3>DeepSeek 助手</h3>
            <div className="chat-actions">
              <button onClick={handleNewChat} className="new-chat-btn">
                新对话
              </button>
              <button onClick={() => setIsOpen(false)} className="close-btn">
                ×
              </button>
            </div>
          </div>

          <MessageList messages={messages} isLoading={isLoading} />
          
          <div className="chat-input-area">
            <div className="input-container">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="输入您的问题..."
                disabled={isLoading}
                rows={3}
              />
              <button 
                onClick={handleSendMessage} 
                disabled={!inputMessage.trim() || isLoading}
                className="send-btn"
              >
                {isLoading ? '发送中...' : '发送'}
              </button>
            </div>
            <div className="model-hint">
              💡 自动检测数学问题并使用 DeepSeek Math 模型
            </div>
          </div>
        </div>
      )}
    </>
  )
}
