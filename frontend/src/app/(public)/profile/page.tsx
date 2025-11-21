'use client'

import { useState } from 'react'
import {
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Wallet,
  Settings,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight,
  Plus,
  Edit,
  Trash2,
} from 'lucide-react'
import Link from 'next/link'

interface Address {
  id: string
  type: 'home' | 'work' | 'other'
  label: string
  address: string
  lat: number
  lng: number
  isDefault: boolean
}

interface PaymentMethod {
  id: string
  type: 'card' | 'upi' | 'wallet'
  label: string
  details: string
  isDefault: boolean
}

const MOCK_USER = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '+91 98765 43210',
  avatar: '👤',
  joinedDate: '2024-01-15',
  walletBalance: 1250,
}

const MOCK_ADDRESSES: Address[] = [
  {
    id: '1',
    type: 'home',
    label: 'Home',
    address: '123 Main Street, Koramangala, Bangalore 560001',
    lat: 12.9352,
    lng: 77.6245,
    isDefault: true,
  },
  {
    id: '2',
    type: 'work',
    label: 'Office',
    address: '456 Tech Park, Whitefield, Bangalore 560066',
    lat: 12.9698,
    lng: 77.7500,
    isDefault: false,
  },
]

const MOCK_PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: '1',
    type: 'card',
    label: 'HDFC Credit Card',
    details: '**** **** **** 4321',
    isDefault: true,
  },
  {
    id: '2',
    type: 'upi',
    label: 'Google Pay',
    details: 'john@oksbi',
    isDefault: false,
  },
  {
    id: '3',
    type: 'wallet',
    label: 'Mangwale Wallet',
    details: `₹${MOCK_USER.walletBalance} available`,
    isDefault: false,
  },
]

export default function ProfilePage() {
  const [addresses] = useState(MOCK_ADDRESSES)
  const [paymentMethods] = useState(MOCK_PAYMENT_METHODS)
  const [activeTab, setActiveTab] = useState<'account' | 'addresses' | 'payments' | 'settings'>(
    'account'
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-4xl">
              {MOCK_USER.avatar}
            </div>
            <div>
              <h1 className="text-3xl font-bold">{MOCK_USER.name}</h1>
              <p className="text-blue-100 mt-1">{MOCK_USER.email}</p>
              <p className="text-blue-100 text-sm mt-1">
                Member since {new Date(MOCK_USER.joinedDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Wallet Card */}
          <div className="mt-6 bg-white/10 backdrop-blur-lg rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Wallet className="w-8 h-8" />
              <div>
                <p className="text-sm text-blue-100">Wallet Balance</p>
                <p className="text-2xl font-bold">₹{MOCK_USER.walletBalance}</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors">
              Add Money
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('account')}
              className={`py-4 border-b-2 font-medium transition-colors ${
                activeTab === 'account'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Account
            </button>
            <button
              onClick={() => setActiveTab('addresses')}
              className={`py-4 border-b-2 font-medium transition-colors ${
                activeTab === 'addresses'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Addresses
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`py-4 border-b-2 font-medium transition-colors ${
                activeTab === 'payments'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Payments
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-4 border-b-2 font-medium transition-colors ${
                activeTab === 'settings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Settings
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Account Tab */}
        {activeTab === 'account' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Personal Information</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <User className="w-5 h-5 text-gray-400" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="font-medium text-gray-900">{MOCK_USER.name}</p>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700">
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-4">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-gray-900">{MOCK_USER.email}</p>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700">
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-4">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium text-gray-900">{MOCK_USER.phone}</p>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700">
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-4">
                <Link
                  href="/orders"
                  className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="text-2xl">📦</div>
                  <div>
                    <p className="font-medium text-gray-900">My Orders</p>
                    <p className="text-xs text-gray-500">View order history</p>
                  </div>
                </Link>
                <Link
                  href="/chat"
                  className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="text-2xl">💬</div>
                  <div>
                    <p className="font-medium text-gray-900">Chat Assistant</p>
                    <p className="text-xs text-gray-500">Get help instantly</p>
                  </div>
                </Link>
                <Link
                  href="/search"
                  className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="text-2xl">🔍</div>
                  <div>
                    <p className="font-medium text-gray-900">Search</p>
                    <p className="text-xs text-gray-500">Find anything</p>
                  </div>
                </Link>
                <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="text-2xl">❤️</div>
                  <div>
                    <p className="font-medium text-gray-900">Favorites</p>
                    <p className="text-xs text-gray-500">Saved items</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Addresses Tab */}
        {activeTab === 'addresses' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Saved Addresses</h2>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                <Plus className="w-4 h-4" />
                Add Address
              </button>
            </div>

            {addresses.map((address) => (
              <div
                key={address.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900">{address.label}</h3>
                        {address.isDefault && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 mt-1">{address.address}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-gray-100">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Payment Methods</h2>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                <Plus className="w-4 h-4" />
                Add Method
              </button>
            </div>

            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      {method.type === 'card' && <CreditCard className="w-5 h-5 text-gray-600" />}
                      {method.type === 'upi' && <Phone className="w-5 h-5 text-gray-600" />}
                      {method.type === 'wallet' && <Wallet className="w-5 h-5 text-gray-600" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900">{method.label}</h3>
                        {method.isDefault && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 mt-1">{method.details}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-gray-100">
                      <Edit className="w-4 h-4" />
                    </button>
                    {method.type !== 'wallet' && (
                      <button className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-gray-400" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Notifications</p>
                    <p className="text-sm text-gray-500">Manage notification preferences</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
              <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-t border-gray-200">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-gray-400" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Privacy & Security</p>
                    <p className="text-sm text-gray-500">Control your data and security</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
              <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-t border-gray-200">
                <div className="flex items-center gap-3">
                  <HelpCircle className="w-5 h-5 text-gray-400" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Help & Support</p>
                    <p className="text-sm text-gray-500">Get help and FAQs</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
              <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-t border-gray-200">
                <div className="flex items-center gap-3">
                  <Settings className="w-5 h-5 text-gray-400" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900">App Settings</p>
                    <p className="text-sm text-gray-500">Language, theme, and more</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <button className="w-full bg-white rounded-lg shadow-sm border border-red-200 p-4 flex items-center justify-center gap-2 text-red-600 font-medium hover:bg-red-50 transition-colors">
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
