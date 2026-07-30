import LegalPageLayout from '@/components/legal-page-layout'
import { WHATSAPP_DISPLAY, WHATSAPP_NUMBER } from '@/lib/constants'

export const metadata = {
  title: 'Refund & Returns Policy',
}

export default function RefundPolicyPage() {
  return (
    <LegalPageLayout title="Refund & Returns Policy" lastUpdated="30 July 2026">
      <div className="bg-[#f9f7f4] border-l-4 border-[#d4a5a5] rounded-lg p-4 text-sm text-[#8b8b8b]">
        <strong className="text-[#2a2a2a]">Note:</strong> this is a starter draft to help Gifts by
        EverythingZeedat get set up quickly. The specifics here — especially the reporting windows and refund
        timelines — are placeholders. Please replace them with your actual policy before treating this as
        final.
      </div>

      <section>
        <h2 className="text-2xl font-serif font-bold mb-3">1. Damaged or Incorrect Items</h2>
        <p>
          If your order arrives damaged, incorrect, or incomplete, please contact us within{' '}
          <strong>48 hours of delivery</strong> with your order reference and photos of the item. We&apos;ll
          work with you on a replacement, correction, or refund as appropriate.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-serif font-bold mb-3">2. Custom & Personalized Orders</h2>
        <p>
          Because custom and personalized gifts (engraved items, personalized messages, made-to-order hampers,
          etc.) are prepared specifically for you, they are <strong>not eligible for return or refund</strong>{' '}
          once preparation has begun, except in cases of a genuine error on our part.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-serif font-bold mb-3">3. General Merchandise Returns</h2>
        <p>
          Given the nature of gift items (many are perishable or delicate), we generally do not accept returns
          once an order has been delivered, other than for the damaged/incorrect-item cases above. If there&apos;s
          a specific concern, reach out — we consider requests on a case-by-case basis.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-serif font-bold mb-3">4. Cancellations</h2>
        <p>
          Orders can be cancelled free of charge before payment is confirmed or preparation begins. Once
          confirmed and in preparation, cancellation may not be possible — particularly for custom orders.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-serif font-bold mb-3">5. How Refunds Are Issued</h2>
        <p>
          Approved refunds are returned via the original payment method where possible, or by bank transfer,
          and are typically processed within a few business days of approval.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-serif font-bold mb-3">6. Not Covered</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Change of mind after an order has been dispatched</li>
          <li>Delivery issues caused by an incorrect address provided by the customer</li>
          <li>Normal variation in handmade or naturally-varying items (e.g. fresh flowers, baked goods)</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-serif font-bold mb-3">7. How to Request a Refund or Report an Issue</h2>
        <p>
          Message us on WhatsApp at{' '}
          <a href={`https://wa.me/${WHATSAPP_NUMBER}`} className="text-[#d4a5a5] hover:text-[#c4956f]">
            {WHATSAPP_DISPLAY}
          </a>{' '}
          with your order reference number, a description of the issue, and photos if applicable.
        </p>
      </section>
    </LegalPageLayout>
  )
}
