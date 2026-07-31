import Link from 'next/link'
import { WHATSAPP_NUMBER, WHATSAPP_DISPLAY, INSTAGRAM_URL, INSTAGRAM_HANDLE } from '@/lib/constants'

export default function Footer() {
  return (
    <footer className="bg-[#2a2a2a] text-white py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <span className="font-serif font-semibold text-[#b8b8b8] text-lg">
              Zeedat Gifts
            </span>
            <p className="text-[#b8b8b8] text-sm mt-2">Premium personalized gifts for every occasion.</p>
            <p className='text-[#b8b8b8] text-sm mt-2 hover:text-white'><a href='https://nex.is-a.dev/' target='_blank'>Powered by NexDev</a></p>
          </div>
          <div>
            <h5 className="font-semibold mb-3">Shop</h5>
            <ul className="space-y-2 text-sm text-[#b8b8b8]">
              <li><Link href="/shop" className="hover:text-white">All Products</Link></li>
              <li><Link href="/custom-orders" className="hover:text-white">Custom Orders</Link></li>
              <li><Link href="/order-tracking" className="hover:text-white">Track Order</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="font-semibold mb-3">Company</h5>
            <ul className="space-y-2 text-sm text-[#b8b8b8]">
              <li><Link href="/about" className="hover:text-white">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
              <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
              <li><Link href="/refund-policy" className="hover:text-white">Refund & Returns</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="font-semibold mb-3">Connect</h5>
            <ul className="space-y-2 text-sm text-[#b8b8b8]">
              <li>
                WhatsApp: <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" className="hover:text-white">{WHATSAPP_DISPLAY}</a>
              </li>
              <li>
                Instagram: <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="hover:text-white">{INSTAGRAM_HANDLE}</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-[#4a4a4a] pt-8 text-center text-sm text-[#b8b8b8]">
          <p>&copy; {new Date().getFullYear()} Gifts by EverythingZeedat. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
