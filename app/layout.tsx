import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist, Playfair_Display } from 'next/font/google'
import './globals.css'
import Navigation from '@/components/navigation'
import { CartProvider } from '@/lib/cart-context'
import { WishlistProvider } from '@/lib/wishlist-context'
import { ActiveOrdersProvider } from '@/lib/active-orders-context'

const geist = Geist({ subsets: ['latin'] })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-serif' })

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://everythingzeedat.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Gifts by EverythingZeedat',
    template: '%s | Gifts by EverythingZeedat',
  },
  description: 'Premium personalized gifts for every occasion. Hampers, gift boxes, and custom orders, delivered across Nigeria.',
  keywords: ['gifts Nigeria', 'personalized gifts', 'gift hampers Abuja', 'custom gift boxes', 'gifts by everythingzeedat'],
  icons: {
    icon: [
      {
        url: '/favicon-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/favicon-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/favicon.ico',
        type: 'image/x-icon',
      },
    ],
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'Gifts by EverythingZeedat',
    description: 'Premium personalized gifts for every occasion. Hampers, gift boxes, and custom orders, delivered across Nigeria.',
    url: siteUrl,
    siteName: 'Gifts by EverythingZeedat',
    locale: 'en_NG',
    type: 'website',
    images: [
          {
            url: "/og-image.png",
            width: 1200,
            height: 630,
            alt: "Gifts by EverythingZeedat",
          },
        ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gifts by EverythingZeedat',
    description: 'Premium personalized gifts for every occasion. Hampers, gift boxes, and custom orders, delivered across Nigeria.',
    images: ["/og-image.png"],
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#faf8f6',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geist.className} ${playfair.variable}`}>
      <body className="antialiased">
        <CartProvider>
          <WishlistProvider>
            <ActiveOrdersProvider>
              <Navigation />
              <main>
                {children}
              </main>
            </ActiveOrdersProvider>
          </WishlistProvider>
        </CartProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
