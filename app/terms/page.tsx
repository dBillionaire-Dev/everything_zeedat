import LegalPageLayout from '@/components/legal-page-layout'
import { WHATSAPP_DISPLAY, WHATSAPP_NUMBER } from '@/lib/constants'

export const metadata = {
  title: 'Terms of Service',
}

export default function TermsPage() {
  return (
    <LegalPageLayout title="Terms of Service" lastUpdated="30 July 2026">
      <div className="bg-[#f9f7f4] border-l-4 border-[#d4a5a5] rounded-lg p-4 text-sm text-[#8b8b8b]">
        <strong className="text-[#2a2a2a]">Note:</strong> this is a starter draft to help Gifts by
        EverythingZeedat get set up quickly. Please review and edit each section to accurately reflect actual
        business practices before treating it as final.
      </div>

      <section>
        <h2 className="text-2xl font-serif font-bold mb-3">1. About Us</h2>
        <p>
          Gifts by EverythingZeedat is a Nigerian gifting business offering hampers, gift boxes, occasion
          gifts, and made-to-order custom pieces. By using this website or placing an order with us, you agree
          to these terms.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-serif font-bold mb-3">2. Products & Pricing</h2>
        <p>
          All prices are listed in Nigerian Naira (₦) and are subject to change without notice. Custom order
          pricing is quoted individually based on the details you provide and is not final until confirmed.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-serif font-bold mb-3">3. Placing an Order</h2>
        <p>
          You can shop as a guest — no account is required. Submitting an order through this site is a
          <strong> request to purchase</strong>, not a final, binding sale. Your order is confirmed once we
          verify the details and payment with you directly, typically over WhatsApp.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-serif font-bold mb-3">4. Payment</h2>
        <p>
          At present, payment is coordinated and confirmed directly with our team via WhatsApp after you place
          an order online. Once online card/bank payment (via Paystack) becomes available, that option will be
          clearly shown at checkout.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-serif font-bold mb-3">5. Delivery</h2>
        <p>
          We deliver across Nigeria. Delivery dates provided at checkout are estimates — actual delivery may be
          affected by logistics, weather, or other circumstances outside our control. We&apos;ll keep you
          informed of any changes.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-serif font-bold mb-3">6. Customization Requests</h2>
        <p>
          Customization options (such as engraving or personalized messages) shown on a product page, and
          fully custom gift requests submitted separately, are subject to feasibility and any additional cost
          shown or quoted to you before your order is confirmed.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-serif font-bold mb-3">7. Cancellations</h2>
        <p>
          You may request a cancellation before your order enters preparation. Once preparation has begun —
          especially for custom or personalized items — cancellation may no longer be possible. See our{' '}
          <a href="/refund-policy" className="text-[#d4a5a5] hover:text-[#c4956f]">Refund & Returns Policy</a>{' '}
          for details.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-serif font-bold mb-3">8. Intellectual Property</h2>
        <p>
          All content on this site — including photos, product designs, and text — belongs to Gifts by
          EverythingZeedat and may not be reused without permission.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-serif font-bold mb-3">9. Limitation of Liability</h2>
        <p>
          We do our best to ensure every gift arrives as described and on time. To the extent permitted by
          law, we are not liable for indirect or consequential losses arising from delays or issues outside
          our reasonable control.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-serif font-bold mb-3">10. Governing Law</h2>
        <p>These terms are governed by the laws of the Federal Republic of Nigeria.</p>
      </section>

      <section>
        <h2 className="text-2xl font-serif font-bold mb-3">11. Changes to These Terms</h2>
        <p>
          We may update these terms occasionally. Continued use of the site after changes means you accept the
          updated terms.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-serif font-bold mb-3">12. Contact</h2>
        <p>
          Questions about these terms? Reach us on WhatsApp at{' '}
          <a href={`https://wa.me/${WHATSAPP_NUMBER}`} className="text-[#d4a5a5] hover:text-[#c4956f]">
            {WHATSAPP_DISPLAY}
          </a>.
        </p>
      </section>
    </LegalPageLayout>
  )
}
