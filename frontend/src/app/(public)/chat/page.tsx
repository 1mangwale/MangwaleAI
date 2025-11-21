'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, MapPin, ArrowLeft, Map, User, RotateCcw } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import Script from 'next/script'
import { getChatWSClient } from '@/lib/websocket/chat-client'
import { parseButtonsFromText, parseCardsFromText } from '@/lib/utils/helpers'
import { ProductCard } from '@/components/chat/ProductCard'
import { InlineLogin } from '@/components/chat/InlineLogin'
import { VoiceInput } from '@/components/chat/VoiceInput'
import { TTSButton } from '@/components/chat/TTSButton'
import dynamic from 'next/dynamic'
import type { ChatMessage } from '@/types/chat'
import { useAuthStore } from '@/store/authStore'

// Use Google Maps based location picker for better UX
// Backend still uses OSRM for distance calculations (cost-effective)
const LocationPicker = dynamic(
  () => import('@/components/map/LocationPicker'),
  { ssr: false }
)

const modules = [
  { id: 'food', name: 'Food', emoji: '🍔' },
  { id: 'ecom', name: 'Shopping', emoji: '🛒' },
  { id: 'rooms', name: 'Hotels', emoji: '🏨' },
  { id: 'movies', name: 'Movies', emoji: '🎬' },
  { id: 'services', name: 'Services', emoji: '🔧' },
  { id: 'parcel', name: 'Parcel', emoji: '📦' },
  { id: 'ride', name: 'Ride', emoji: '🚗' },
  { id: 'health', name: 'Health', emoji: '❤️' },
]

export default function ChatPage() {
  const searchParams = useSearchParams()
  const moduleParam = searchParams.get('module')
  const { isAuthenticated, user, _hasHydrated } = useAuthStore()
  
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hi! 👋 Welcome to Mangwale. I\'m here to help you with deliveries, food, shopping, and more. Feel free to ask me anything about Nashik or just chat!\n\nYou can browse without logging in, but you\'ll need to login when placing orders. How can I help you today?',
      timestamp: 0,
    }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [selectedModule, setSelectedModule] = useState<string | null>(moduleParam)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [showLocationPicker, setShowLocationPicker] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [userProfile, setUserProfile] = useState<{
    name?: string
    phone?: string
  } | null>(null)
  
  // Generate or retrieve persistent session ID from localStorage
  const [sessionIdState] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('mangwale-chat-session-id')
      if (stored) {
        console.log('🔄 Reusing existing session:', stored)
        return stored
      }
    }
    const newSessionId = `web-${Date.now()}`
    if (typeof window !== 'undefined') {
      localStorage.setItem('mangwale-chat-session-id', newSessionId)
      console.log('🆕 Created new session:', newSessionId)
    }
    return newSessionId
  })
  
  // Always connected with REST API (no WebSocket connection state)
  const [isConnected, setIsConnected] = useState(true)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const wsClientRef = useRef<ReturnType<typeof getChatWSClient> | null>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  // Load user profile from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Profile now comes from auth store, no need for separate localStorage
      // Keeping this for backward compatibility during migration
      const storedProfile = localStorage.getItem('mangwale-user-profile')
      if (storedProfile && !user) {
        try {
          const profile = JSON.parse(storedProfile)
          setUserProfile(profile)
        } catch (e) {
          console.error('Failed to parse user profile:', e)
        }
      } else if (user) {
        // Sync auth store user to userProfile state
        setUserProfile({
          name: user.f_name + (user.l_name ? ` ${user.l_name}` : ''),
          phone: user.phone,
        })
      }
    }
  }, [user])

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfile(false)
      }
    }

    if (showProfile) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showProfile])

  // REMOVE MANDATORY AUTH CHECK - Let users chat first, login when prompted naturally
  // The LLM can engage users, build rapport, then suggest login for orders/tracking
  // useEffect(() => {
  //   if (_hasHydrated && !isAuthenticated) {
  //     router.push('/login')
  //   }
  // }, [_hasHydrated, isAuthenticated, router])

  // AUTO-REQUEST LOCATION after login (delivery app needs current location)
  // Only run once when user first logs in
  useEffect(() => {
    if (typeof window === 'undefined') return; // Skip on server
    
    if (isAuthenticated && user && !showLocationPicker && !localStorage.getItem('user-location-captured')) {
      // Check if we have location in session
      const hasLocation = localStorage.getItem('mangwale-user-location')
      if (!hasLocation) {
        console.log('📍 User authenticated but no location - auto-prompting for location')
        // Auto-open location picker after 2 seconds (only once)
        const timer = setTimeout(() => {
          setShowLocationPicker(true)
        }, 2000)
        
        return () => clearTimeout(timer)
      }
    }
  }, [isAuthenticated, user, showLocationPicker]) // Added showLocationPicker to deps to prevent re-triggers

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // WebSocket connection setup
  useEffect(() => {
    if (!_hasHydrated) return

    const wsClient = getChatWSClient()
    wsClientRef.current = wsClient

    wsClient.on({
      onConnect: () => {
        console.log('✅ WebSocket connected')
        setIsConnected(true)
        wsClient.joinSession(sessionIdState, authData)
      },
      onDisconnect: () => {
        console.log('❌ WebSocket disconnected')
        setIsConnected(false)
      },
      onMessage: (message) => {
        console.log('📥 Received message:', message)
        
        const { cleanText, buttons: parsedButtons } = parseButtonsFromText(message.text)
        
        setMessages(prev => [...prev, {
          id: message.id || `bot-${prev.length}-${Date.now()}`,
          role: message.sender === 'user' ? 'user' : 'assistant',
          content: cleanText,
          timestamp: message.timestamp || Date.now(),
          buttons: parsedButtons.length > 0 ? parsedButtons : undefined,
        }])
        setIsTyping(false)
      },
      onError: (error) => {
        console.error('❌ WebSocket error:', error)
        setMessages(prev => [...prev, {
          id: `error-${prev.length}`,
          role: 'assistant',
          content: 'Connection lost. Please refresh the page.',
          timestamp: Date.now(),
        }])
      },
    })

    if (wsClient.isConnected()) {
      wsClient.joinSession(sessionIdState, authData)
    }

    return () => {
      wsClient.leaveSession(sessionIdState)
    }
  }, [sessionIdState, _hasHydrated])

  const handleSend = (textInput?: string, buttonAction?: string) => {
    const messageText = textInput || input.trim()
    if (!messageText) return

    if (!isConnected) {
      setMessages(prev => [...prev, {
        id: `error-${prev.length}`,
        role: 'assistant',
        content: 'Connection lost. Please refresh the page.',
        timestamp: Date.now(),
      }])
      return
    }

    try {
      console.log('🚀 Sending message via WebSocket:', messageText)
      
      // Add user message immediately
      setMessages(prev => [...prev, {
        id: `msg-${prev.length}-${Date.now()}`,
        role: 'user',
        content: messageText,
        timestamp: Date.now(),
      }])

      if (!textInput) setInput('')
      setIsTyping(true)

      // Send via WebSocket
      wsClientRef.current?.sendMessage({
        message: messageText,
        sessionId: sessionIdState,
        platform: 'web',
        type: buttonAction ? 'button_click' : 'text',
        action: buttonAction,
      })
    } catch (error) {
      console.error('Failed to send message:', error)
      setIsTyping(false)
      setMessages(prev => [...prev, {
        id: `error-${prev.length}`,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: Date.now(),
      }])
    }
  }

  const handleSendClick = () => {
    void handleSend()
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleModuleSelect = (moduleId: string) => {
    setSelectedModule(moduleId)
    const selectedModuleData = modules.find(m => m.id === moduleId)
    
    setMessages(prev => [
      ...prev,
      {
        id: `module-${prev.length}-${Date.now()}`,
        role: 'assistant',
        content: `Great! I'm now your ${selectedModuleData?.name} assistant. What would you like to do?`,
        timestamp: Date.now(),
      }
    ])
  }

  const handleShareLocation = async () => {
    if (!navigator.geolocation) {
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: '❌ Geolocation is not supported by your browser.',
        timestamp: Date.now(),
      }])
      return
    }

    setIsGettingLocation(true)
    
    setMessages(prev => [...prev, {
      id: `sys-${Date.now()}`,
      role: 'assistant',
      content: '📍 Requesting your location... Please allow location access.',
      timestamp: Date.now(),
    }])

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        
        // Send location to backend via WebSocket for session tracking
        if (wsClientRef.current) {
          wsClientRef.current.updateLocation(sessionIdState, latitude, longitude)
          
          // Send as text message for the conversation flow
          // This will add the message to chat and send to backend
          const locationText = `📍 My current location is: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
          await handleSend(locationText)
        }
        
        setIsGettingLocation(false)
      },
      (error) => {
        let errorMsg = '❌ Unable to get your location. '
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMsg += 'Please enable location permissions in your browser settings.'
            break
          case error.POSITION_UNAVAILABLE:
            errorMsg += 'Location information is unavailable.'
            break
          case error.TIMEOUT:
            errorMsg += 'Location request timed out.'
            break
          default:
            errorMsg += 'An unknown error occurred.'
        }
        
        setMessages(prev => [...prev, {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: errorMsg,
          timestamp: Date.now(),
        }])
        
        setIsGettingLocation(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }

  const handleLocationConfirm = async (location: {
    lat: number
    lng: number
    address: string
    road?: string
    house?: string
    floor?: string
    contact_person_name: string
    contact_person_number: string
    address_type: string
  }) => {
    setShowLocationPicker(false)
    
    // Update user profile in auth store and localStorage
    const profile = {
      name: location.contact_person_name,
      phone: location.contact_person_number
    }
    
    // Update auth store if user is authenticated
    if (user) {
      const { updateUser } = useAuthStore.getState()
      updateUser({
        f_name: location.contact_person_name.split(' ')[0],
        l_name: location.contact_person_name.split(' ').slice(1).join(' ') || undefined,
        phone: location.contact_person_number,
      })
    }
    
    // Also save to localStorage for backward compatibility
    localStorage.setItem('mangwale-user-profile', JSON.stringify(profile))
    setUserProfile(profile)
    
    // Save location data for delivery app
    const locationData = {
      lat: location.lat,
      lng: location.lng,
      address: location.address,
      timestamp: Date.now()
    }
    localStorage.setItem('mangwale-user-location', JSON.stringify(locationData))
    localStorage.setItem('user-location-captured', 'true')
    
    // Send location to backend via WebSocket
    if (wsClientRef.current) {
      wsClientRef.current.updateLocation(sessionIdState, location.lat, location.lng)
    }
    
    // Format the complete address message for display
    let fullAddress = `${location.address}\n`
    fullAddress += `Contact: ${location.contact_person_name} (${location.contact_person_number})\n`
    fullAddress += `Type: ${location.address_type}`
    
    if (location.house) {
      fullAddress += `\nHouse/Flat: ${location.house}`
    }
    if (location.floor) {
      fullAddress += `, Floor: ${location.floor}`
    }
    if (location.road) {
      fullAddress += `\nRoad: ${location.road}`
    }
    
    // Add location shared message with formatted details
    const displayMessage = `📍 Location shared:\n${fullAddress}\n\nCoordinates: ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`
    
    // Send to backend - handleSend will add the message to chat
    await handleSend(displayMessage)
  }

  const currentModule = selectedModule ? modules.find(m => m.id === selectedModule) : null

  return (
    <>
      {/* Load Google Maps Script */}
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}&libraries=places`}
        strategy="lazyOnload"
        onLoad={() => console.log('✅ Google Maps API loaded')}
      />

      <div className="flex flex-col h-screen bg-[#fffff6] overflow-hidden">
      {/* Header - Mobile Responsive with Profile */}
      <div className="bg-gradient-to-r from-[#059211] to-[#047a0e] text-white px-3 sm:px-4 py-3 sm:py-4 shadow-lg">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <Link href="/" className="hover:bg-white/10 p-1.5 sm:p-2 rounded-lg transition-colors flex-shrink-0">
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
            <h1 className="text-base sm:text-xl font-bold truncate">
              {currentModule 
                ? `${currentModule.emoji} ${currentModule.name}`
                : '💬 Mangwale AI'
              }
            </h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Connection Status */}
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-300 animate-pulse' : 'bg-red-400'}`} />
              <span className="text-xs sm:text-sm font-medium hidden sm:inline">{isConnected ? 'Connected' : 'Disconnected'}</span>
              <span className="text-xs font-medium sm:hidden">{isConnected ? '●' : '○'}</span>
            </div>

            {/* Clear/Reset Chat Button */}
            <button
              onClick={() => {
                if (confirm('Clear chat and start over?')) {
                  localStorage.removeItem('mangwale-chat-session-id')
                  window.location.reload()
                }
              }}
              className="hover:bg-white/10 p-1.5 sm:p-2 rounded-full transition-colors flex-shrink-0"
              title="Clear chat and start over"
            >
              <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            
            {/* User Profile Button */}
            <div ref={profileRef} className="relative">
              <button
                onClick={() => setShowProfile(!showProfile)}
                className="hover:bg-white/10 p-1.5 sm:p-2 rounded-full transition-colors flex-shrink-0"
                title="Your Profile"
              >
                {userProfile ? (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white text-green-600 rounded-full flex items-center justify-center font-bold text-sm">
                    {userProfile.name ? userProfile.name[0].toUpperCase() : userProfile.phone ? userProfile.phone[0] : 'U'}
                  </div>
                ) : (
                  <User className="w-5 h-5 sm:w-6 sm:h-6" />
                )}
              </button>
              
              {/* Profile Dropdown */}
              {showProfile && (
                <div className="absolute right-0 top-12 bg-white text-gray-900 rounded-lg shadow-2xl z-50 w-64 border-2 border-gray-200 overflow-hidden">
                  {userProfile ? (
                    <>
                      <div className="bg-gradient-to-br from-green-50 to-green-100 px-4 py-4 border-b-2 border-green-200">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                            {userProfile.name ? userProfile.name[0].toUpperCase() : userProfile.phone ? userProfile.phone[0] : 'U'}
                          </div>
                          <div className="flex-1 min-w-0">
                            {userProfile.name && (
                              <h3 className="font-bold text-base text-gray-900 truncate">{userProfile.name}</h3>
                            )}
                            {userProfile.phone && (
                              <p className="text-sm text-gray-600">{userProfile.phone}</p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="px-4 py-3">
                        <button
                          onClick={() => {
                            // Clear ALL auth data
                            useAuthStore.getState().clearAuth()
                            localStorage.removeItem('mangwale-user-profile')
                            localStorage.removeItem('mangwale-chat-session-id')
                            localStorage.removeItem('mangwale-user-location')
                            localStorage.removeItem('user-location-captured')
                            setUserProfile(null)
                            setShowProfile(false)
                            // Disconnect WebSocket before reload
                            wsClientRef.current?.disconnect()
                            window.location.reload()
                          }}
                          className="w-full px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          Sign Out
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="px-4 py-4 text-center text-gray-600">
                      <User className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm">No profile information</p>
                      <p className="text-xs text-gray-500 mt-1">Continue chatting to save your profile</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Module Selection - Mobile Responsive */}
      {!selectedModule && (
        <div className="bg-white border-b border-gray-200 px-3 sm:px-4 py-3 sm:py-4 shadow-sm">
          <div className="container mx-auto">
            <p className="text-xs sm:text-sm text-gray-900 font-bold mb-2 sm:mb-3">Choose a service:</p>
            <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {modules.map((mod) => (
                <button
                  key={mod.id}
                  onClick={() => handleModuleSelect(mod.id)}
                  className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-3 bg-gradient-to-br from-gray-50 to-gray-100 hover:from-[#059211] hover:to-[#047a0e] hover:text-white border-2 border-gray-200 hover:border-[#059211] rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 whitespace-nowrap shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95"
                >
                  <span className="text-base sm:text-xl">{mod.emoji}</span>
                  <span>{mod.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Messages Area - Mobile Responsive */}
      <div className="flex-1 overflow-y-auto px-2 sm:px-4 py-3 sm:py-6">
        <div className="container mx-auto max-w-3xl">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex mb-3 sm:mb-4 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div className={`max-w-[85%] sm:max-w-[80%] ${message.role === 'user' ? 'flex justify-end' : ''}`}>
                <div
                  className={`rounded-2xl px-3 sm:px-5 py-2 sm:py-3 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-[#059211] to-[#047a0e] text-white rounded-br-sm shadow-lg'
                      : 'bg-gradient-to-br from-white to-gray-50 text-gray-900 rounded-bl-sm shadow-md border border-gray-200'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words flex-1 text-gray-900 font-medium">{message.content}</p>
                    {/* Add TTS button for bot messages */}
                    {message.role === 'assistant' && message.content && (
                      <TTSButton 
                        text={message.content}
                        language="hi-IN"
                        className="mt-1 flex-shrink-0"
                      />
                    )}
                  </div>
                  {message.timestamp > 0 && (
                    <p className={`text-xs mt-1 sm:mt-1.5 ${
                      message.role === 'user' ? 'text-green-100' : 'text-gray-400'
                    }`}>
                      {new Date(message.timestamp).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  )}
                </div>

                {/* Render buttons for AI messages - Mobile Responsive */}
                {message.role === 'assistant' && message.buttons && message.buttons.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2 sm:mt-3">
                    {message.buttons.map((button) => (
                      <button
                        key={button.id}
                        onClick={() => {
                          // Special button: trigger login modal
                          if (button.value === '__LOGIN__' || button.value === '__AUTHENTICATE__') {
                            setShowLoginModal(true)
                          } else {
                            // Send with button action ID for better backend handling
                            const action = button.id || button.value
                            handleSend(button.value, action)
                          }
                        }}
                        className="px-3 sm:px-5 py-1.5 sm:py-2.5 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-[#059211] hover:to-[#047a0e] border-2 border-[#059211] text-[#059211] hover:text-white rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
                      >
                        {button.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* Render product/restaurant cards for AI messages */}
                {message.role === 'assistant' && message.cards && message.cards.length > 0 && (
                  <div className="flex flex-col gap-3 mt-3">
                    {message.cards.map((card) => (
                      <ProductCard
                        key={card.id}
                        card={card}
                        onAction={(value) => handleSend(value)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start mb-4">
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl px-5 py-4 shadow-lg border border-gray-200">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 bg-[#059211] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2.5 h-2.5 bg-[#059211] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2.5 h-2.5 bg-[#059211] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area - Mobile Responsive */}
      <div className="bg-white border-t-2 border-gray-200 px-2 sm:px-4 py-2 sm:py-4 shadow-lg safe-area-bottom">
        <div className="container mx-auto max-w-3xl">
          <div className="flex items-end gap-1.5 sm:gap-3">
            {/* Quick Location Button */}
            <button 
              onClick={handleShareLocation}
              disabled={isGettingLocation}
              className="p-2 sm:p-3 bg-gray-100 text-gray-600 hover:bg-[#059211] hover:text-white rounded-full transition-all duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              title="Share my current location"
            >
              <MapPin className={`w-4 h-4 sm:w-5 sm:h-5 ${isGettingLocation ? 'animate-pulse' : ''}`} />
            </button>
            
            {/* Map Picker Button */}
            <button 
              onClick={() => setShowLocationPicker(true)}
              className="p-2 sm:p-3 bg-gray-100 text-gray-600 hover:bg-[#059211] hover:text-white rounded-full transition-all duration-200 shadow-md flex-shrink-0"
              title="Choose location on map"
            >
              <Map className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            
            {/* Input Field */}
            <div className="flex-1 bg-gray-100 rounded-3xl px-3 sm:px-5 py-2 sm:py-3 flex items-center gap-2 sm:gap-3 shadow-inner border border-gray-200">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-500 text-sm sm:text-base font-medium"
              />
              <VoiceInput 
                onTranscription={(text) => {
                  setInput(text)
                  // Auto-send the transcribed text
                  setTimeout(() => handleSend(text), 100)
                }}
                language="hi-IN"
                className="text-gray-500 hover:text-[#059211] transition-colors flex-shrink-0"
              />
            </div>

            {/* Send Button */}
            <button
              onClick={handleSendClick}
              disabled={!input.trim() || isTyping}
              className="p-3 sm:p-4 bg-gradient-to-r from-[#059211] to-[#047a0e] text-white rounded-full hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg transform hover:scale-110 active:scale-95 flex-shrink-0"
            >
              <Send className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Location Picker Modal */}
      {showLocationPicker && (
        <LocationPicker
          onLocationConfirm={handleLocationConfirm}
          onCancel={() => setShowLocationPicker(false)}
        />
      )}

      {/* Inline Login Modal - Appears when user needs to authenticate */}
      {showLoginModal && (
        <InlineLogin
          onClose={() => setShowLoginModal(false)}
          onSuccess={() => {
            setShowLoginModal(false)
            // Optionally prompt for location after login
            setTimeout(() => setShowLocationPicker(true), 1000)
          }}
        />
      )}
    </div>
    </>
  )
}
