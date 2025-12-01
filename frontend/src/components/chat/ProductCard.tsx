import { Star } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import type { ProductCard as ProductCardType, VariantOption } from '@/types/chat'

// CDN base URL for product images
const CDN_BASE_URL = 'https://storage.mangwale.ai/mangwale/product';
const S3_BASE_URL = 'https://mangwale-ai.s3.ap-south-1.amazonaws.com/mangwale/product';

/**
 * Get the full image URL from various image path formats
 * Handles: full URLs, relative paths, filenames
 */
function getImageUrl(image: string): string {
  if (!image) return '';
  
  // Already a full URL (CDN, S3, or other)
  if (image.startsWith('http://') || image.startsWith('https://')) {
    return image;
  }
  
  // Handle relative paths like '/product/2024-12-03-xxx.png'
  if (image.startsWith('/product/')) {
    return `${CDN_BASE_URL}${image.replace('/product', '')}`;
  }
  
  // Handle paths like 'product/2024-12-03-xxx.png'
  if (image.startsWith('product/')) {
    return `${CDN_BASE_URL}/${image.replace('product/', '')}`;
  }
  
  // Just a filename like '2024-12-03-xxx.png'
  return `${CDN_BASE_URL}/${image}`;
}

interface ProductCardProps {
  card: ProductCardType
  onAction: (value: string) => void
}

export function ProductCard({ card, onAction }: ProductCardProps) {
  const [imageError, setImageError] = useState(false)
  
  // Initialize selections with first option of each group
  const [selections, setSelections] = useState<Record<string, VariantOption>>(() => {
    const initial: Record<string, VariantOption> = {}
    if (card.variantGroups) {
      card.variantGroups.forEach(group => {
        if (group.options.length > 0) {
          initial[group.id] = group.options[0]
        }
      })
    }
    return initial
  })

  const handleSelection = (groupId: string, option: VariantOption) => {
    setSelections(prev => ({ ...prev, [groupId]: option }))
  }

  // Calculate current price
  const currentPrice = (() => {
    let price = card.price
    Object.values(selections).forEach(option => {
      if (option.price) price = option.price
    })
    return price
  })()

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

          {currentPrice && (
            <p className="text-xl font-bold text-[#059211] mb-3">{currentPrice}</p>
          )}

          {/* Variants */}
          {card.variantGroups?.map(group => (
            <div key={group.id} className="mb-3">
              <p className="text-xs font-semibold text-gray-500 mb-1 uppercase">{group.name}</p>
              <div className="flex flex-wrap gap-2">
                {group.options.map(option => {
                  const isSelected = selections[group.id]?.id === option.id
                  
                  if (group.type === 'color') {
                    return (
                      <button
                        key={option.id}
                        onClick={() => handleSelection(group.id, option)}
                        className={`w-6 h-6 rounded-full border-2 transition-all ${
                          isSelected 
                            ? 'border-[#059211] ring-1 ring-[#059211] scale-110' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        style={{ backgroundColor: option.colorCode || option.value }}
                        title={option.label}
                      />
                    )
                  }
                  
                  return (
                    <button
                      key={option.id}
                      onClick={() => handleSelection(group.id, option)}
                      className={`px-2 py-1 text-xs rounded-md border transition-all ${
                        isSelected 
                          ? 'bg-[#059211] text-white border-[#059211]' 
                          : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {option.label}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}

          {card.description && (
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
              {card.description}
            </p>
          )}

          <button
            onClick={() => {
              // Append selections to action value if needed, or just pass as is
              // For now, we pass the base action value. 
              // In a real app, we'd likely want to encode the selection.
              // e.g. onAction(`${card.action.value}?variants=${JSON.stringify(selections)}`)
              onAction(card.action.value)
            }}
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
                  src={getImageUrl(card.image)}
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
