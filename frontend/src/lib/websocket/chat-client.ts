// WebSocket Client for Real-time Chat

import { io, Socket } from 'socket.io-client'
import type { ChatMessage, Session } from '@/types/chat'

// Auto-detect WebSocket URL based on current origin
const getWsUrl = () => {
  if (typeof window === 'undefined') {
    // Server-side: use localhost
    return process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3200'
  }
  
  // Client-side: always use localhost for now (same server)
  // Production will proxy through nginx/same domain
  return process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3200'
}

interface ChatEventHandlers {
  onMessage?: (message: ChatMessage) => void
  onSessionUpdate?: (session: Session) => void
  onTyping?: (isTyping: boolean) => void
  onError?: (error: Error) => void
  onConnect?: () => void
  onDisconnect?: () => void
}

interface SendMessagePayload {
  message: string
  sessionId: string
  module?: string
  type?: 'text' | 'button_click' | 'quick_reply'
  action?: string
  metadata?: Record<string, unknown>
}

interface OptionClickPayload {
  sessionId: string
  optionId: string
  payload?: unknown
}

class ChatWebSocketClient {
  private socket: Socket | null = null
  private handlers: ChatEventHandlers = {}
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5

  constructor() {
    this.connect()
  }

  private connect() {
    if (this.socket?.connected) {
      return
    }

    const wsUrl = getWsUrl()
    console.log(`🔌 Connecting to WebSocket: ${wsUrl}/ai-agent`)

    this.socket = io(`${wsUrl}/ai-agent`, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
    })

    this.setupEventListeners()
  }

  private setupEventListeners() {
    if (!this.socket) return

    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected')
      this.reconnectAttempts = 0
      this.handlers.onConnect?.()
    })

    this.socket.on('disconnect', () => {
      console.log('❌ WebSocket disconnected')
      this.handlers.onDisconnect?.()
    })

    this.socket.on('message', (message: ChatMessage) => {
      this.handlers.onMessage?.(message)
    })

    this.socket.on('session:update', (session: Session) => {
      this.handlers.onSessionUpdate?.(session)
    })

    this.socket.on('session:joined', (data: { sessionId: string; history: ChatMessage[] }) => {
      console.log('📥 Session joined:', data.sessionId, 'History:', data.history.length)
      // Emit history messages to handler
      data.history.forEach(msg => this.handlers.onMessage?.(msg))
    })

    this.socket.on('typing', (isTyping: boolean) => {
      this.handlers.onTyping?.(isTyping)
    })

    this.socket.on('error', (error: Error) => {
      console.error('❌ WebSocket error:', error)
      this.handlers.onError?.(error)
    })

    this.socket.on('connect_error', (error: Error) => {
      console.error('❌ WebSocket connection error:', error)
      this.handlers.onError?.(error)
    })

    this.socket.on('reconnect_attempt', (attemptNumber: number) => {
      this.reconnectAttempts = attemptNumber
      console.log(`🔄 Reconnection attempt ${attemptNumber}/${this.maxReconnectAttempts}`)
    })

    this.socket.on('reconnect_failed', () => {
      console.error('❌ WebSocket reconnection failed')
      this.handlers.onError?.(new Error('Failed to reconnect to WebSocket'))
    })
  }

  // Register event handlers
  on(handlers: ChatEventHandlers) {
    this.handlers = { ...this.handlers, ...handlers }
  }

  // Join a session room
  joinSession(sessionId: string, authData?: {
    userId?: number
    phone?: string
    email?: string
    token?: string
    name?: string
  }) {
    if (!this.socket?.connected) {
      console.warn('⚠️ Socket not connected, attempting to connect...')
      this.connect()
    }
    console.log('📱 Joining session:', sessionId, authData ? '(authenticated)' : '(guest)')
    this.socket?.emit('session:join', { 
      sessionId,
      ...authData 
    })
  }

  // Leave a session room
  leaveSession(sessionId: string) {
    console.log('👋 Leaving session:', sessionId)
    this.socket?.emit('session:leave', { sessionId })
  }

  // Send a message
  sendMessage(payload: SendMessagePayload) {
    if (!this.socket?.connected) {
      throw new Error('WebSocket not connected')
    }
    console.log('📤 Sending message:', payload)
    this.socket.emit('message:send', payload)
  }

  // Send typing indicator
  sendTyping(sessionId: string, isTyping: boolean) {
    this.socket?.emit('typing', { sessionId, isTyping })
  }

  // Handle option click
  handleOptionClick(payload: OptionClickPayload) {
    if (!this.socket?.connected) {
      throw new Error('WebSocket not connected')
    }
    console.log('🖱️ Handling option click:', payload)
    this.socket.emit('option:click', payload)
  }

  // Update location
  updateLocation(sessionId: string, lat: number, lng: number) {
    console.log('📍 Updating location:', { sessionId, lat, lng })
    this.socket?.emit('location:update', { sessionId, lat, lng })
  }

  // Check connection status
  isConnected(): boolean {
    return this.socket?.connected || false
  }

  // Disconnect
  disconnect() {
    this.socket?.disconnect()
    this.socket = null
  }

  // Reconnect manually
  reconnect() {
    this.disconnect()
    this.connect()
  }
}

// Singleton instance
let chatWSClient: ChatWebSocketClient | null = null

export const getChatWSClient = (): ChatWebSocketClient => {
  if (!chatWSClient) {
    chatWSClient = new ChatWebSocketClient()
  }
  return chatWSClient
}

export const disconnectChatWS = () => {
  chatWSClient?.disconnect()
  chatWSClient = null
}
