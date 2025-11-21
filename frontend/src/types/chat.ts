// Chat & Conversation Types

export type Platform = 'whatsapp' | 'telegram' | 'web' | 'voice'
export type MessageRole = 'user' | 'assistant' | 'system'

export interface OptionButton {
  id: string
  label: string
  value: string
}

export interface ProductCard {
  id: string
  name: string
  image: string
  rating?: number
  deliveryTime?: string
  price?: string
  description?: string
  action: {
    label: string
    value: string
  }
}

export interface ChatMessage {
  id: string
  
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  buttons?: OptionButton[]
  cards?: ProductCard[]
}

export interface MessageBlock {
  type: 'options' | 'cards' | 'form' | 'map' | 'image'
  data: unknown
}

export interface OptionChip {
  id: string
  label: string
  payload?: unknown
}

export interface Card {
  id: string
  title: string
  subtitle?: string
  image?: string
  price?: number
  rating?: number
  action?: string
  metadata?: Record<string, unknown>
}

export interface Session {
  id: string
  phoneNumber: string
  platform: Platform
  currentStep: string
  module?: string
  authenticated: boolean
  auth_token?: string
  user_name?: string
  location?: {
    lat: number
    lng: number
  }
  data?: Record<string, unknown>
  createdAt: number
  updatedAt: number
}

export interface ConversationContext {
  sessionId: string
  phoneNumber: string
  module: string
  intent?: string
  entities?: Record<string, unknown>
  location?: {
    lat: number
    lng: number
  }
  history?: ChatMessage[]
}
