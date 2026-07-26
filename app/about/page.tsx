import Link from 'next/link'
import { Heart, Sparkles, Gift } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="bg-gradient-to-r from-[#e8d4d4] to-[#f4e4d0] py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#2a2a2a] mb-4">
            About Zeedat Gifts
          </h1>
          <p className="text-lg text-[#8b8b8b] max-w-2xl mx-auto">
            We believe that the perfect gift tells a story. Every gift from Zeedat is thoughtfully curated and beautifully presented to create unforgettable moments.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#2a2a2a] mb-8 text-center">
            Our Mission
          </h2>
          <div className="bg-[#f9f7f4] rounded-xl p-8 mb-12">
            <p className="text-lg text-[#8b8b8b] leading-relaxed mb-4">
              At Gifts by EverythingZeedat, our mission is to make gift-giving extraordinary. We understand that finding the perfect gift can be challenging, which is why we curate premium collections and offer bespoke custom services to ensure every gift is meaningful and memorable.
            </p>
            <p className="text-lg text-[#8b8b8b] leading-relaxed">
              Whether you&apos;re celebrating a milestone, expressing gratitude, or simply making someone smile, we&apos;re here to help you find or create the perfect gift that resonates with the recipient.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 md:py-20 bg-[#f9f7f4]">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#2a2a2a] mb-12 text-center">
            Our Values
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Heart,
                title: 'Thoughtfulness',
                description: 'Every gift is selected with care and consideration for the recipient.'
              },
              {
                icon: Sparkles,
                title: 'Quality',
                description: 'We partner with premium brands and artisans to ensure excellence.'
              },
              {
                icon: Gift,
                title: 'Personalization',
                description: 'We believe personal touches make gifts truly special and unique.'
              }
            ].map((value, idx) => {
              const Icon = value.icon
              return (
                <div key={idx} className="bg-white rounded-xl p-8 border border-[#e8dfd9]">
                  <div className="w-12 h-12 bg-[#e8d4d4] rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-[#d4a5a5]" />
                  </div>
                  <h3 className="font-serif font-semibold text-xl text-[#2a2a2a] mb-2">
                    {value.title}
                  </h3>
                  <p className="text-[#8b8b8b]">{value.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#2a2a2a] mb-4">
            Ready to Find Your Perfect Gift?
          </h2>
          <p className="text-lg text-[#8b8b8b] mb-8">
            Browse our collections or tell us about your vision for a custom gift.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/shop"
              className="inline-block bg-[#d4a5a5] text-white px-8 py-3 rounded-lg font-medium hover:bg-[#c4956f] transition-colors"
            >
              Shop Now
            </Link>
            <Link
              href="/custom-orders"
              className="inline-block border-2 border-[#d4a5a5] text-[#d4a5a5] px-8 py-3 rounded-lg font-medium hover:bg-[#e8d4d4] transition-colors"
            >
              Request Custom Gift
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
