'use client'

import Link from 'next/link'
import { ArrowLeft, Trash2, Plus, Minus, Heart } from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { useWishlist } from '@/lib/wishlist-context'
import { DELIVERY_FEE } from '@/lib/constants'

export default function CartPage() {
  const { items, removeItem, updateQuantity, total } = useCart()
  const { toggle, isSaved } = useWishlist()
  const deliveryFee = DELIVERY_FEE
  const grandTotal = total + deliveryFee

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="bg-gradient-to-r from-[#e8d4d4] to-[#f4e4d0] py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#2a2a2a]">
            Your Cart
          </h1>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {items.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg text-[#8b8b8b] mb-6">Your cart is empty</p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 text-[#d4a5a5] hover:text-[#c4956f] font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="space-y-4">
                {items.map(item => (
                  <div
                    key={item.productId}
                    className="border border-[#e8dfd9] rounded-lg p-4 flex gap-4"
                  >
                    {item.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-24 h-24 rounded-lg flex-shrink-0 object-cover"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-[#e8d4d4] rounded-lg flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <h3 className="font-serif font-semibold text-[#2a2a2a]">
                        {item.name}
                      </h3>
                      <p className="text-[#8b8b8b] text-sm mt-1">
                        ₦{(item.price / 1000).toFixed(0)}k each
                      </p>
                      <div className="flex items-center gap-3 mt-3">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="p-1 hover:bg-[#f9f7f4] rounded"
                        >
                          <Minus className="w-4 h-4 text-[#8b8b8b]" />
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="p-1 hover:bg-[#f9f7f4] rounded"
                        >
                          <Plus className="w-4 h-4 text-[#8b8b8b]" />
                        </button>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end justify-between">
                      <span className="font-serif font-bold text-[#d4a5a5]">
                        ₦{(item.price * item.quantity / 1000).toFixed(0)}k
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() =>
                            toggle({
                              productId: item.productId,
                              name: item.name,
                              price: item.price,
                              slug: item.slug || '',
                              image: item.image,
                            })
                          }
                          className="p-2 hover:bg-[#f9f7f4] rounded text-[#d4a5a5]"
                          aria-label={isSaved(item.productId) ? 'Saved to wishlist' : 'Save to wishlist'}
                        >
                          <Heart className={`w-4 h-4 ${isSaved(item.productId) ? 'fill-[#d4a5a5]' : ''}`} />
                        </button>
                        <button
                          onClick={() => removeItem(item.productId)}
                          className="p-2 hover:bg-[#f9f7f4] rounded text-[#d4a5a5]"
                          aria-label="Remove from cart"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Link
                href="/shop"
                className="inline-flex items-center gap-2 text-[#d4a5a5] hover:text-[#c4956f] font-medium mt-8"
              >
                <ArrowLeft className="w-4 h-4" />
                Continue Shopping
              </Link>
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <div className="bg-[#f9f7f4] rounded-xl p-6 sticky top-20">
                <h3 className="font-serif font-semibold text-lg text-[#2a2a2a] mb-4">
                  Order Summary
                </h3>
                <div className="space-y-3 mb-4 pb-4 border-b border-[#e8dfd9]">
                  <div className="flex justify-between text-[#8b8b8b]">
                    <span>Subtotal</span>
                    <span>₦{(total / 1000).toFixed(0)}k</span>
                  </div>
                  <div className="flex justify-between text-[#8b8b8b]">
                    <span>Delivery Fee</span>
                    <span>₦{(deliveryFee / 1000).toFixed(0)}k</span>
                  </div>
                </div>
                <div className="flex justify-between mb-6">
                  <span className="font-serif font-bold text-lg text-[#2a2a2a]">Total</span>
                  <span className="font-serif font-bold text-lg text-[#d4a5a5]">
                    ₦{(grandTotal / 1000).toFixed(0)}k
                  </span>
                </div>

                <div className="space-y-3">
                  <Link
                    href="/checkout"
                    className="block w-full bg-[#d4a5a5] text-white px-4 py-3 rounded-lg font-medium hover:bg-[#c4956f] transition-colors text-center"
                  >
                    Proceed to Checkout
                  </Link>
                  <p className="text-xs text-center text-[#8b8b8b]">
                    You'll confirm your order and payment on WhatsApp as the final step.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
