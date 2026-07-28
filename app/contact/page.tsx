import Link from 'next/link'
import { Phone, Mail, MapPin } from 'lucide-react'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="bg-gradient-to-r from-[#e8d4d4] to-[#f4e4d0] py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#2a2a2a] mb-4">
            Get in Touch
          </h1>
          <p className="text-lg text-[#8b8b8b]">
            We&apos;d love to hear from you. Reach out with any questions or inquiries.
          </p>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div>
            <h2 className="text-2xl font-serif font-bold text-[#2a2a2a] mb-8">Contact Information</h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-[#e8d4d4] rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-[#d4a5a5]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#2a2a2a] mb-1">WhatsApp</h3>
                  <a
                    href="https://wa.me/2348131288947"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#8b8b8b] hover:text-[#d4a5a5] transition-colors"
                  >
                    +234 813 128 8947
                  </a>
                  <p className="text-sm text-[#8b8b8b] mt-1">Available 9 AM - 6 PM WAT</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 bg-[#e8d4d4] rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-[#d4a5a5]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#2a2a2a] mb-1">Instagram</h3>
                  <a
                    href="https://instagram.com/gifts.by.everythingzeedat"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#8b8b8b] hover:text-[#d4a5a5] transition-colors"
                  >
                    @gifts.by.everythingzeedat
                  </a>
                  <p className="text-sm text-[#8b8b8b] mt-1">Follow for updates & inspiration</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 bg-[#e8d4d4] rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-[#d4a5a5]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#2a2a2a] mb-1">Location</h3>
                  <p className="text-[#8b8b8b]">Abuja, Nigeria</p>
                  <p className="text-sm text-[#8b8b8b] mt-1">Nationwide delivery available</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Contact */}
          <div>
            <h2 className="text-2xl font-serif font-bold text-[#2a2a2a] mb-8">Quick Contact</h2>
            <div className="space-y-4">
              <p className="text-[#8b8b8b]">
                For the fastest response, reach out to us via WhatsApp. We typically respond within an hour during business hours.
              </p>

              <div className="space-y-3">
                <a
                  href="https://wa.me/2348131288947"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-[#25D366] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#1fa855] transition-colors text-center"
                >
                  Chat on WhatsApp
                </a>

                <Link
                  href="/custom-orders"
                  className="block w-full bg-[#d4a5a5] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#c4956f] transition-colors text-center"
                >
                  Submit Custom Order Request
                </Link>
              </div>

              <div className="bg-[#f9f7f4] rounded-lg p-4 mt-6">
                <h4 className="font-semibold text-[#2a2a2a] mb-2">Business Hours</h4>
                <ul className="space-y-1 text-sm text-[#8b8b8b]">
                  <li>Monday - Friday: 9 AM - 6 PM WAT</li>
                  <li>Saturday: 10 AM - 4 PM WAT</li>
                  <li>Sunday: Closed</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
