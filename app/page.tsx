'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Gift, Heart, Sparkles } from 'lucide-react'
import { api } from '@/lib/api'
import type { Product } from '@/lib/api'
import { useWishlist } from '@/lib/wishlist-context'

export default function Home() {
  const [featured, setFeatured] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { toggle, isSaved } = useWishlist()

  useEffect(() => {
    api.products
      .list({ featured: true })
      .then(data => setFeatured(data.slice(0, 4)))
      .catch(err => console.error('[v0] Error fetching featured products:', err))
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#faf8f6] to-[#f4e4d0] py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#2a2a2a] mb-4 leading-tight">
                Gifts for Every Heart
              </h1>
              <p className="text-lg text-[#8b8b8b] mb-6 leading-relaxed">
                Discover thoughtfully curated, personalized gifts that celebrate life&apos;s special moments. From luxury hampers to custom treasures, each gift tells a story.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/shop"
                  className="bg-[#d4a5a5] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#c4956f] transition-colors flex items-center gap-2 justify-center sm:justify-start"
                >
                  Explore Shop <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/custom-orders"
                  className="border-2 border-[#d4a5a5] text-[#d4a5a5] px-6 py-3 rounded-lg font-medium hover:bg-[#e8d4d4] transition-colors"
                >
                  Request Custom Gift
                </Link>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="relative w-72 h-72 md:w-96 md:h-96 rounded-full overflow-hidden border-8 border-[#d4a5a5] shadow-2xl">
                <Image
                  src="/hero.png"
                  alt="Luxury Gift Hamper"
                  fill
                  priority
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#2a2a2a] text-center mb-12">
            Why Choose Zeedat Gifts
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Sparkles,
                title: 'Handcurated Collections',
                description: 'Each gift is thoughtfully selected and beautifully presented for maximum impact.'
              },
              {
                icon: Heart,
                title: 'Personalization',
                description: 'Add custom touches, engraving, and personalized notes to make gifts unforgettable.'
              },
              {
                icon: Gift,
                title: 'Custom Orders',
                description: "Tell us your vision and budget, and we'll create the perfect custom gift experience."
              }
            ].map((feature, idx) => {
              const Icon = feature.icon
              return (
                <div key={idx} className="bg-white p-6 rounded-xl border border-[#e8dfd9] text-center">
                  <div className="w-12 h-12 mx-auto mb-4 bg-[#e8d4d4] rounded-lg flex items-center justify-center">
                    <Icon className="w-6 h-6 text-[#d4a5a5]" />
                  </div>
                  <h3 className="font-serif text-xl font-semibold text-[#2a2a2a] mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-[#8b8b8b]">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 md:py-20 bg-[#f9f7f4]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#2a2a2a]">
              Featured Collections
            </h2>
            <Link href="/shop" className="text-[#d4a5a5] hover:text-[#c4956f] font-medium flex items-center gap-2">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array(4).fill(0).map((_, i) => (
                <div key={i} className="bg-white rounded-xl overflow-hidden border border-[#e8dfd9] animate-pulse">
                  <div className="aspect-square bg-[#e8d4d4]" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-[#e8d4d4] rounded w-3/4" />
                    <div className="h-3 bg-[#e8d4d4] rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : featured.length === 0 ? (
            <p className="text-center text-[#8b8b8b] py-8">
              No featured products yet — check back soon, or{' '}
              <Link href="/shop" className="text-[#d4a5a5] hover:text-[#c4956f]">browse the full shop</Link>.
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.map(product => (
                <Link key={product.id} href={`/shop/${product.slug}`} className="group">
                  <div className="bg-white rounded-xl overflow-hidden border border-[#e8dfd9] hover:border-[#d4a5a5] transition-colors">
                    <div className="aspect-square bg-[#e8d4d4] flex items-center justify-center overflow-hidden">
                      {product.images?.[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <Gift className="w-16 h-16 text-[#d4a5a5] opacity-40" />
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-serif font-semibold text-[#2a2a2a] text-sm line-clamp-1">{product.name}</h3>
                      <p className="text-[#8b8b8b] text-xs mt-1 capitalize">{product.category.replace('-', ' ')}</p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="font-semibold text-[#2a2a2a]">₦{product.price.toLocaleString()}</span>
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            toggle({ productId: product.id, name: product.name, price: product.price, slug: product.slug, image: product.images?.[0] })
                          }}
                          className={`p-1 rounded transition-colors ${
                            isSaved(product.id) ? 'bg-[#d4a5a5]' : 'bg-[#e8d4d4] hover:bg-[#d4a5a5]'
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${isSaved(product.id) ? 'fill-white text-white' : 'text-[#d4a5a5]'}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-[#d4a5a5]">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">
            Need Something Special?
          </h2>
          <p className="text-[#f4e4d0] mb-8 max-w-2xl mx-auto">
            Can&apos;t find what you&apos;re looking for? Our gift experts are ready to create your perfect custom gift.
          </p>
          <Link
            href="/custom-orders"
            className="inline-block bg-white text-[#d4a5a5] px-8 py-3 rounded-lg font-medium hover:bg-[#f9f7f4] transition-colors"
          >
            Request Custom Gift
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#2a2a2a] text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <span className="font-serif font-semibold text-[#b8b8b8] text-lg">
                Zeedat Gifts
              </span>
              <p className="text-[#b8b8b8] text-sm">Premium personalized gifts for every occasion.</p>
            </div>
            <div>
              <h5 className="font-semibold mb-3">Shop</h5>
              <ul className="space-y-2 text-sm text-[#b8b8b8]">
                <li><Link href="/shop" className="hover:text-white">All Products</Link></li>
                <li><Link href="/shop" className="hover:text-white">Hampers</Link></li>
                <li><Link href="/shop" className="hover:text-white">Gift Boxes</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-3">Company</h5>
              <ul className="space-y-2 text-sm text-[#b8b8b8]">
                <li><Link href="/about" className="hover:text-white">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-3">Connect</h5>
              <p className="text-sm text-[#b8b8b8]">
                WhatsApp: <a href="https://wa.me/2348131288947" target="_blank" rel="noopener noreferrer" className="hover:text-white">+234 813 128 8947</a>
              </p>
            </div>
          </div>
          <div className="border-t border-[#4a4a4a] pt-8 text-center text-sm text-[#b8b8b8]">
            <p>
              <a href="https://nex.is-a.dev/" target="_blank" rel="noopener noreferrer" className="hover:text-white">
                &copy; {new Date().getFullYear()} Gifts by EverythingZeedat. All rights reserved.
              </a>
            </p>
          </div>
        </div>
      </footer>
    </>
  )
}
