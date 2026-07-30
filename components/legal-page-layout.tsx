import Link from 'next/link'

export default function LegalPageLayout({
  title,
  lastUpdated,
  children,
}: {
  title: string
  lastUpdated: string
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gradient-to-r from-[#e8d4d4] to-[#f4e4d0] py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#2a2a2a] mb-2">{title}</h1>
          <p className="text-sm text-[#8b8b8b]">Last updated: {lastUpdated}</p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="prose-legal text-[#2a2a2a] leading-relaxed">
          {children}
        </div>

        <div className="mt-12 pt-8 border-t border-[#e8dfd9] text-sm text-[#8b8b8b]">
          <p>
            Questions about this page? Reach out via{' '}
            <Link href="/contact" className="text-[#d4a5a5] hover:text-[#c4956f] font-medium">
              our Contact page
            </Link>.
          </p>
        </div>
      </div>
    </div>
  )
}
