'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ShoppingCart, Menu, X, Heart } from 'lucide-react'

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const links = [
    { href: '/shop', label: 'Shop' },
    { href: '/custom-orders', label: 'Custom Orders' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ]

  return (
    <header className="bg-white border-b border-[#e8dfd9]">
      <nav className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full" style={{ backgroundColor: '#d4a5a5' }} />
          <span className="font-serif text-xl font-semibold text-[#2a2a2a] hidden sm:inline">
            Zeedat Gifts
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[#2a2a2a] hover:text-[#d4a5a5] transition-colors text-sm font-medium"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button className="p-2 hover:bg-[#e8d4d4] rounded-lg transition-colors">
            <Heart className="w-5 h-5 text-[#d4a5a5]" />
          </button>
          <Link href="/cart" className="p-2 hover:bg-[#e8d4d4] rounded-lg transition-colors relative">
            <ShoppingCart className="w-5 h-5 text-[#d4a5a5]" />
            <span className="absolute top-0 right-0 bg-[#d4a5a5] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              0
            </span>
          </Link>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 hover:bg-[#e8d4d4] rounded-lg"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5 text-[#2a2a2a]" />
            ) : (
              <Menu className="w-5 h-5 text-[#2a2a2a]" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-[#e8dfd9] py-4">
          <div className="flex flex-col gap-3 px-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[#2a2a2a] hover:text-[#d4a5a5] py-2 font-medium text-sm"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}
