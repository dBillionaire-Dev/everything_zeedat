'use client'

import Link from 'next/link'
import { ArrowLeft, Trash2, ShoppingCart, Heart } from 'lucide-react'
import { useWishlist } from '@/lib/wishlist-context'
import { useCart } from '@/lib/cart-context'

export default function WishlistPage() {
  const { items, remove } = useWishlist()
  const { addItem } = useCart()

  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gradient-to-r from-[#e8d4d4] to-[#f4e4d0] py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#2a2a2a]">Your Wishlist</h1>
          <p className="text-[#8b8b8b] mt-2 text-lg">Gifts you're saving for later</p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {items.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-[#f9f7f4] flex items-center justify-center mx-auto mb-4">
              <Heart className="w-7 h-7 text-[#d4a5a5]" />
            </div>
            <p className="text-lg text-[#8b8b8b] mb-6">Nothing saved yet</p>
            <Link href="/shop" className="inline-flex items-center gap-2 text-[#d4a5a5] hover:text-[#c4956f] font-medium">
              <ArrowLeft className="w-4 h-4" />
              Browse Gifts
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {items.map(item => (
                <div key={item.productId} className="border border-[#e8dfd9] rounded-lg p-4 flex items-center gap-4">
                  {item.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.image} alt={item.name} className="w-20 h-20 rounded-lg flex-shrink-0 object-cover" />
                  ) : (
                    <div className="w-20 h-20 bg-[#e8d4d4] rounded-lg flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <Link href={`/shop/${item.slug}`} className="font-serif font-semibold text-[#2a2a2a] hover:text-[#d4a5a5]">
                      {item.name}
                    </Link>
                    <p className="text-[#d4a5a5] font-bold mt-1">₦{item.price.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        addItem({ productId: item.productId, name: item.name, price: item.price, quantity: 1, image: item.image, slug: item.slug })
                        remove(item.productId)
                      }}
                      className="flex items-center gap-2 bg-[#d4a5a5] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#c4956f] transition-colors"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Add to Cart
                    </button>
                    <button
                      onClick={() => remove(item.productId)}
                      className="p-2 hover:bg-[#f9f7f4] rounded text-[#d4a5a5]"
                      aria-label="Remove from wishlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <Link href="/shop" className="inline-flex items-center gap-2 text-[#d4a5a5] hover:text-[#c4956f] font-medium mt-8">
              <ArrowLeft className="w-4 h-4" />
              Continue Shopping
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
