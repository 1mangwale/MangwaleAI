import { Star } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import type { ProductCard as ProductCardType } from '@/types/chat'

interface ProductCardProps {
  card: ProductCardType
  onAction: (value: string) => void
}

export function ProductCard({ card, onAction }: ProductCardProps) {
  const [imageError, setImageError] = useState(false)

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < Math.floor(rating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-gray-200 text-gray-200'
            }`}
          />
        ))}
        <span className="text-sm font-medium text-gray-700 ml-1">{rating}</span>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg hover:shadow-xl p-5 max-w-sm border-2 border-gray-100 hover:border-[#059211] transition-all duration-200">
      <div className="flex gap-4">
        {/* Left side - Content */}
        <div className="flex-1">
          <h3 className="font-bold text-lg text-gray-900 mb-2">{card.name}</h3>
          
          {card.rating && (
            <div className="mb-2">{renderStars(card.rating)}</div>
          )}
          
          {card.deliveryTime && (
            <p className="text-sm font-medium text-gray-600 mb-3">
              🚚 {card.deliveryTime}
            </p>
          )}

          {card.price && (
            <p className="text-xl font-bold text-[#059211] mb-3">{card.price}</p>
          )}

          {card.description && (
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
              {card.description}
            </p>
          )}

          <button
            onClick={() => onAction(card.action.value)}
            className="w-full bg-gradient-to-r from-[#059211] to-[#047a0e] hover:shadow-xl text-white font-bold py-3 px-6 rounded-full transition-all duration-200 shadow-lg flex items-center justify-center gap-2 transform hover:scale-105"
          >
            {card.action.label}
            <span>→</span>
          </button>
        </div>

        {/* Right side - Image */}
        {card.image && (
          <div className="w-28 h-28 flex-shrink-0">
            <div className="w-full h-full rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 shadow-md">
              {imageError ? (
                <div className="w-full h-full flex items-center justify-center text-5xl">
                  🍕
                </div>
              ) : (
                <Image
                  src={card.image}
                  alt={card.name}
                  width={112}
                  height={112}
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                  unoptimized
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
