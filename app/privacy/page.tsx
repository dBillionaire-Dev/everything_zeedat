import LegalPageLayout from '@/components/legal-page-layout'
import { WHATSAPP_DISPLAY, WHATSAPP_NUMBER } from '@/lib/constants'

export const metadata = {
  title: 'Privacy Policy',
}

export default function PrivacyPage() {
  return (
    <LegalPageLayout title="Privacy Policy" lastUpdated="30 July 2026">
      <div className="bg-[#f9f7f4] border-l-4 border-[#d4a5a5] rounded-lg p-4 text-sm text-[#8b8b8b]">
        <strong className="text-[#2a2a2a]">Note:</strong> this is a starter draft to help Gifts by
        EverythingZeedat get set up quickly. Please review and edit each section to accurately reflect actual
        business practices — and consider having it checked by someone familiar with Nigerian data protection
        law (the NDPA) — before treating it as final.
      </div>

      <section>
        <h2 className="text-2xl font-serif font-bold mb-3">1. Introduction</h2>
        <p>
          Gifts by EverythingZeedat (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) respects your privacy.
          This policy explains what information we collect when you use this website, how we use it, and the
          choices you have.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-serif font-bold mb-3">2. Information We Collect</h2>
        <p className="mb-3">When you place an order or submit a custom gift request, we collect:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Your name, phone number, and delivery address</li>
          <li>Your email address, if you choose to provide one</li>
          <li>Order details — items, customization choices, delivery date, and any notes</li>
          <li>Reference images you upload for a custom order request</li>
          <li>Payment status of your order (and, once online payment is available, payment records processed by our payment provider)</li>
        </ul>
        <p className="mt-3">
          We do not require an account to shop with us. Your shopping cart and wishlist are stored only in your
          own browser (using local storage), not on our servers, and are never shared with anyone.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-serif font-bold mb-3">3. How We Use Your Information</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>To process, prepare, and deliver your order</li>
          <li>To send you order confirmations and updates (if you provided an email)</li>
          <li>To respond to custom gift requests and coordinate details over WhatsApp or email</li>
          <li>To improve our products and service</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-serif font-bold mb-3">4. Third-Party Services</h2>
        <p className="mb-3">We rely on a small number of trusted service providers to run this site:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>Supabase</strong> — our database and file storage provider, which securely holds order and product information</li>
          <li><strong>Gmail / Google Workspace</strong> — used to send order confirmation and update emails</li>
          <li><strong>Paystack</strong> — once online payment is enabled, Paystack will process card/bank payments directly; we do not store your card details ourselves</li>
        </ul>
        <p className="mt-3">
          These providers only receive the information necessary to perform their function and are bound by
          their own privacy and security practices.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-serif font-bold mb-3">5. Data Retention</h2>
        <p>
          We keep order information for as long as reasonably necessary to fulfill your order, handle any
          follow-up questions or disputes, and meet our own recordkeeping obligations.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-serif font-bold mb-3">6. Your Rights</h2>
        <p>
          You can ask us to access, correct, or delete the personal information we hold about you at any time
          by reaching out via WhatsApp at{' '}
          <a href={`https://wa.me/${WHATSAPP_NUMBER}`} className="text-[#d4a5a5] hover:text-[#c4956f]">
            {WHATSAPP_DISPLAY}
          </a>{' '}
          or through our Contact page.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-serif font-bold mb-3">7. Children&apos;s Privacy</h2>
        <p>This site is not directed at children, and we do not knowingly collect information from minors.</p>
      </section>

      <section>
        <h2 className="text-2xl font-serif font-bold mb-3">8. Changes to This Policy</h2>
        <p>
          We may update this policy from time to time. Significant changes will be reflected by updating the
          &quot;Last updated&quot; date at the top of this page.
        </p>
      </section>
    </LegalPageLayout>
  )
}
