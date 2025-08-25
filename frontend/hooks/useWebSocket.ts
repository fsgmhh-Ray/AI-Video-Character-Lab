import { useState, useEffect, useRef, useCallback } from 'react'

interface WebSocketMessage {
  type: string
  [key: string]: any
}

interface UseWebSocketOptions {
  url: string
  onMessage?: (message: WebSocketMessage) => void
  onOpen?: () => void
  onClose?: () => void
  onError?: (error: Event) => void
  reconnectInterval?: number
  maxReconnectAttempts?: number
}

export function useWebSocket({
  url,
  onMessage,
  onOpen,
  onClose,
  onError,
  reconnectInterval = 3000,
  maxReconnectAttempts = 5
}: UseWebSocketOptions) {
  const [isConnected, setIsConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const shouldReconnectRef = useRef(true)

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return
    }

    try {
      const ws = new WebSocket(url)
      wsRef.current = ws

      ws.onopen = () => {
        setIsConnected(true)
        setError(null)
        reconnectAttemptsRef.current = 0
        onOpen?.()
      }

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)
          setLastMessage(message)
          onMessage?.(message)
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err)
        }
      }

      ws.onclose = (event) => {
        setIsConnected(false)
        onClose?.()
        
        // 自动重连
        if (shouldReconnectRef.current && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++
            connect()
          }, reconnectInterval)
        }
      }

      ws.onerror = (event) => {
        setError('WebSocket连接错误')
        onError?.(event)
      }

    } catch (err) {
      setError('无法创建WebSocket连接')
      console.error('WebSocket connection error:', err)
    }
  }, [url, onMessage, onOpen, onClose, onError, reconnectInterval, maxReconnectAttempts])

  const disconnect = useCallback(() => {
    shouldReconnectRef.current = false
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    
    setIsConnected(false)
  }, [])

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message))
    } else {
      setError('WebSocket未连接')
    }
  }, [])

  const sendPing = useCallback(() => {
    sendMessage({ type: 'ping' })
  }, [sendMessage])

  const subscribeToTask = useCallback((taskId: string) => {
    sendMessage({ type: 'subscribe_task', task_id: taskId })
  }, [sendMessage])

  const unsubscribeFromTask = useCallback((taskId: string) => {
    sendMessage({ type: 'unsubscribe_task', task_id: taskId })
  }, [sendMessage])

  useEffect(() => {
    connect()
    
    return () => {
      disconnect()
    }
  }, [connect, disconnect])

  // 心跳检测
  useEffect(() => {
    if (!isConnected) return

    const heartbeatInterval = setInterval(() => {
      sendPing()
    }, 30000) // 30秒发送一次心跳

    return () => {
      clearInterval(heartbeatInterval)
    }
  }, [isConnected, sendPing])

  return {
    isConnected,
    lastMessage,
    error,
    sendMessage,
    sendPing,
    subscribeToTask,
    unsubscribeFromTask,
    connect,
    disconnect
  }
}

// 专门用于任务进度跟踪的Hook
export function useTaskProgress(taskId: string, userId: string) {
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState<string>('pending')
  const [message, setMessage] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  const { isConnected, lastMessage, subscribeToTask, unsubscribeFromTask } = useWebSocket({
    url: `ws://localhost:8000/ws/progress/${taskId}?user_id=${userId}`,
    onMessage: (message) => {
      switch (message.type) {
        case 'task_progress_update':
          if (message.task_id === taskId) {
            setProgress(message.progress)
            setStatus(message.status)
            setMessage(message.message || '')
            setError(null)
          }
          break
          
        case 'task_completed':
          if (message.task_id === taskId) {
            setProgress(100)
            setStatus('completed')
            setMessage('任务完成')
            setError(null)
          }
          break
          
        case 'task_failed':
          if (message.task_id === taskId) {
            setProgress(0)
            setStatus('failed')
            setError(message.error || '任务失败')
          }
          break
      }
    }
  })

  useEffect(() => {
    if (isConnected && taskId) {
      subscribeToTask(taskId)
    }
    
    return () => {
      if (taskId) {
        unsubscribeFromTask(taskId)
      }
    }
  }, [isConnected, taskId, subscribeToTask, unsubscribeFromTask])

  return {
    progress,
    status,
    message,
    error,
    isConnected
  }
} 