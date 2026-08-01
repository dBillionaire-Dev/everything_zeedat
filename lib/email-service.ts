import nodemailer from 'nodemailer';
import { WHATSAPP_NUMBER, WHATSAPP_DISPLAY, INSTAGRAM_URL, INSTAGRAM_HANDLE, SITE_URL as siteUrl } from './constants';

// Initialize Gmail transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_EMAIL,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export interface CustomOrderEmailData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress?: string;
  city?: string;
  state?: string;
  occasion: string;
  budgetRange: string;
  description: string;
  preferredDeliveryDate?: string;
  referenceId: string;
}

function getFirstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0];
}

// ============================================================================
// Custom order request status update (sent to the customer whenever an
// admin changes a request's status)
// ============================================================================

const CUSTOM_ORDER_STATUS_COPY: Record<string, { label: string; blurb: string }> = {
  NEW: { label: 'Received', blurb: "We've received your custom gift request and will review it shortly." },
  REVIEWED: { label: 'Reviewed', blurb: "We've reviewed your request and are working out the details." },
  QUOTED: { label: 'Quote Ready', blurb: "We've put together a quote for your custom gift! We'll reach out on WhatsApp with the details." },
  CONFIRMED: { label: 'Confirmed', blurb: "Your custom gift request is confirmed and we're getting started!" },
  PREPARING: { label: 'Preparing', blurb: "We're preparing your custom gift with care." },
  OUT_FOR_DELIVERY: { label: 'Out for Delivery', blurb: 'Your custom gift is on its way!' },
  DELIVERED: { label: 'Delivered', blurb: 'Your custom gift has been delivered. We hope it brought a smile!' },
  DECLINED: { label: 'Declined', blurb: "Unfortunately we're not able to fulfill this request. Feel free to reach out on WhatsApp if you'd like to discuss alternatives." },
};

export interface CustomOrderStatusUpdateEmailData {
  customerName: string;
  customerEmail?: string | null;
  referenceId: string;
  status: string;
}

export async function sendCustomOrderStatusUpdate(data: CustomOrderStatusUpdateEmailData): Promise<boolean> {
  if (!data.customerEmail) return false;

  try {
    const statusInfo = CUSTOM_ORDER_STATUS_COPY[data.status] || { label: data.status, blurb: 'Your request status has been updated.' };
    const firstName = getFirstName(data.customerName);

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #faf8f6; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #d4a5a5 0%, #c4956f 100%); color: white; padding: 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
          .content { padding: 30px; color: #2a2a2a; }
          .status-badge { display: inline-block; background-color: #f9f7f4; border-left: 4px solid #d4a5a5; padding: 15px 20px; border-radius: 6px; margin: 20px 0; font-weight: 600; color: #2a2a2a; }
          .cta-button { display: inline-block; background-color: #25d366; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px; }
          .footer { background-color: #f9f7f4; padding: 20px; text-align: center; font-size: 12px; color: #8b8b8b; border-top: 1px solid #e8dfd9; }
          .footer-link { color: #d4a5a5; text-decoration: none; }
          .reference-id { font-family: monospace; background-color: #faf8f6; padding: 2px 6px; border-radius: 3px; color: #d4a5a5; font-weight: 600; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header"><h1>🎁 Custom Order Update</h1></div>
          <div class="content">
            <p>Hi <strong>${firstName}</strong>,</p>
            <p>${statusInfo.blurb}</p>

            <div class="status-badge">
              Request ${`<span class="reference-id">${data.referenceId}</span>`} is now: ${statusInfo.label}
            </div>

            ${
              data.status === 'DELIVERED'
                ? `
                <div style="text-align: center; margin: 25px 0; padding: 20px; background-color: #fdf6f0; border-radius: 8px;">
                  <p style="margin: 0 0 12px 0; font-size: 15px; color: #2a2a2a;">
                    💕 Thank you for trusting Gifts by EverythingZeedat with your custom gift! We'd love to hear about your experience.
                  </p>
                  <a href="${siteUrl}/#reviews" class="cta-button" style="background-color: #d4a5a5; margin-bottom: 24px;">
                    Leave a Review
                  </a>
                </div>

                <div style="margin-top: 30px;">
                  <p style="margin: 0 0 12px 0; font-size: 15px; color: #2a2a2a;">
                    <strong>P.S:</strong> If you have any concern about your order, kindly message us on WhatsApp
                  </p>
                  <a
                    href="https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                      `Hi Zeedat, my custom order (${data.referenceId}) has been delivered. I have a concern.`
                    )}"
                    class="cta-button"
                    style="background-color: #25d366;"
                  >
                    💬 Contact Us
                  </a>
                </div>
                `
                : `
                <div style="text-align: center; margin: 25px 0;">
                  <a href="https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                    `Hi Zeedat, following up on my custom order request — Reference: ${data.referenceId}`
                  )}" class="cta-button">
                    💬 Message Us on WhatsApp
                  </a>
                </div>
                `
            }
          </div>
          <div class="footer">
            <p style="margin: 0 0 10px 0;"><strong>Gifts by EverythingZeedat</strong></p>
            <p style="margin: 0;">📱 WhatsApp: <a href="https://wa.me/${WHATSAPP_NUMBER}" class="footer-link">${WHATSAPP_DISPLAY}</a> · 📷 <a href="${INSTAGRAM_URL}" class="footer-link">${INSTAGRAM_HANDLE}</a></p>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: process.env.GMAIL_EMAIL,
      to: data.customerEmail,
      subject: `Custom Order Update: ${statusInfo.label} - Reference: ${data.referenceId}`,
      html,
    });

    console.log(`Custom order status update email sent for ${data.referenceId}`);
    return true;
  } catch (error) {
    console.error('Custom order status update email failed:', error);
    return false;
  }
}
// Generate HTML email with form snapshot
function generateEmailHTML(data: CustomOrderEmailData): string {
  const budgetLabels: Record<string, string> = {
    'under-10k': 'Under ₦10,000',
    '10k-25k': '₦10,000 - ₦25,000',
    '25k-50k': '₦25,000 - ₦50,000',
    '50k-plus': '₦50,000+',
  };
   const firstName = getFirstName(data.customerName);

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #faf8f6;
          margin: 0;
          padding: 20px;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .header {
          background: linear-gradient(135deg, #d4a5a5 0%, #c4956f 100%);
          color: white;
          padding: 30px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 600;
        }
        .content {
          padding: 30px;
          color: #2a2a2a;
        }
        .greeting {
          font-size: 16px;
          margin-bottom: 20px;
          line-height: 1.6;
        }
        .snapshot {
          background-color: #f9f7f4;
          border-left: 4px solid #d4a5a5;
          padding: 20px;
          margin: 20px 0;
          border-radius: 6px;
        }
        .snapshot-title {
          font-weight: 600;
          color: #d4a5a5;
          margin-bottom: 15px;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .snapshot-item {
          margin-bottom: 12px;
          font-size: 14px;
          line-height: 1.5;
        }
        .snapshot-label {
          font-weight: 600;
          color: #2a2a2a;
          display: inline-block;
          min-width: 120px;
        }
        .snapshot-value {
          color: #666;
        }
        .message {
          background-color: #e8d4d4;
          padding: 15px;
          border-radius: 6px;
          margin: 20px 0;
          font-size: 14px;
          line-height: 1.6;
          color: #2a2a2a;
        }
        .cta-section {
          margin: 25px 0;
          text-align: center;
        }
        .cta-button {
          display: inline-block;
          background-color: #d4a5a5;
          color: white;
          padding: 12px 30px;
          border-radius: 6px;
          text-decoration: none;
          font-weight: 600;
          font-size: 14px;
          margin: 10px 5px;
        }
        .footer {
          background-color: #f9f7f4;
          padding: 20px;
          text-align: center;
          font-size: 12px;
          color: #8b8b8b;
          border-top: 1px solid #e8dfd9;
        }
        .footer-link {
          color: #d4a5a5;
          text-decoration: none;
        }
        .reference-id {
          font-family: monospace;
          background-color: #faf8f6;
          padding: 2px 6px;
          border-radius: 3px;
          color: #d4a5a5;
          font-weight: 600;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>💝 We Received Your Request!</h1>
        </div>
        <div class="content">
          <div class="greeting">
            <p>Hi <strong>${firstName}</strong>,</p>
            <p>Thank you for reaching out to <strong>Gifts by EverythingZeedat</strong>! We're thrilled that you've chosen us to create a special gift.</p>
          </div>

          <div class="message">
            <strong>✓ Request Received Successfully</strong>
            <p style="margin: 10px 0 0 0;">Your custom gift request has been received and logged. Our gift experts are reviewing your details and will get back to you within <strong>24 hours</strong> with personalized recommendations and a quotation.</p>
          </div>

          <div class="snapshot">
            <div class="snapshot-title">📋 Request Details Snapshot</div>
            <div class="snapshot-item">
              <span class="snapshot-label">Reference ID:</span>
              <span class="snapshot-value"><span class="reference-id">${data.referenceId}</span></span>
            </div>
            <div class="snapshot-item">
              <span class="snapshot-label">Occasion:</span>
              <span class="snapshot-value">${data.occasion}</span>
            </div>
            <div class="snapshot-item">
              <span class="snapshot-label">Budget Range:</span>
              <span class="snapshot-value">${budgetLabels[data.budgetRange] || data.budgetRange}</span>
            </div>
            ${data.deliveryAddress ? `
            <div class="snapshot-item">
              <span class="snapshot-label">Delivery Address:</span>
              <span class="snapshot-value">${data.deliveryAddress}, ${data.city}, ${data.state}</span>
            </div>
            ` : ''}
            ${data.preferredDeliveryDate ? `
            <div class="snapshot-item">
              <span class="snapshot-label">Preferred Delivery:</span>
              <span class="snapshot-value">${new Date(data.preferredDeliveryDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            ` : ''}
            <div class="snapshot-item">
              <span class="snapshot-label">Description:</span>
              <span class="snapshot-value" style="display: block; margin-top: 5px;">"${data.description}"</span>
            </div>
          </div>

          <div class="cta-section">
            <p style="margin: 0 0 15px 0; font-size: 14px; color: #666;">
              Need to reach us faster? Connect via WhatsApp:
            </p>
            <a href="https://wa.me/${WHATSAPP_NUMBER}?text=Hi%20Zeedat%2C%20I%20submitted%20a%20custom%20order%20request%20with%20ID%3A%20${data.referenceId}" class="cta-button" style="background-color: #25d366;">
              💬 Message us on WhatsApp
            </a>
          </div>

          <p style="font-size: 13px; color: #8b8b8b; line-height: 1.6;">
            <strong>What happens next?</strong><br>
            Our team will review your custom order request and reach out within 24 hours via email or WhatsApp. We'll provide detailed recommendations, pricing, and availability based on your preferences.
          </p>
        </div>
        <div class="footer">
          <p style="margin: 0 0 10px 0;">
            <strong>Gifts by EverythingZeedat</strong>
          </p>
          <p style="margin: 0 0 10px 0;">
            📱 WhatsApp: <a href="https://wa.me/${WHATSAPP_NUMBER}" class="footer-link">${WHATSAPP_DISPLAY}</a><br>
            📷 Instagram: <a href="${INSTAGRAM_URL}" class="footer-link">${INSTAGRAM_HANDLE}</a>
          </p>
          <p style="margin: 0; font-size: 11px;">
            This is an automated email. Please do not reply to this email. Use WhatsApp for inquiries.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export async function sendCustomOrderConfirmation(data: CustomOrderEmailData): Promise<boolean> {
  try {
    // Send email to customer
    await transporter.sendMail({
      from: process.env.GMAIL_EMAIL,
      to: data.customerEmail,
      subject: `Custom Gift Request Received - Reference: ${data.referenceId}`,
      html: generateEmailHTML(data),
    });

    console.log(`Email sent successfully to ${data.customerEmail} for reference ${data.referenceId}`);
    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
}

export async function sendCustomOrderNotificationToAdmin(data: CustomOrderEmailData): Promise<boolean> {
  try {
    // Send notification to admin
    const adminEmail = process.env.GMAIL_EMAIL; // Using same email for admin notification
    const firstName = getFirstName(data.customerName);

    const adminEmailHTML = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; background-color: #faf8f6; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
          .header { background: #d4a5a5; color: white; padding: 15px; text-align: center; }
          .content { padding: 20px; }
          .detail { margin: 10px 0; padding: 10px; background: #f9f7f4; }
          .label { font-weight: bold; color: #2a2a2a; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>🎁 New Custom Order Request</h2>
          </div>
          <div class="content">
            <p><strong>Reference ID:</strong> ${data.referenceId}</p>
            <div class="detail">
              <p class="label">Customer Name:</p>
              <p>${data.customerName}</p>
            </div>
            <div class="detail">
              <p class="label">Contact Email:</p>
              <p>${data.customerEmail}</p>
            </div>
            <div class="detail">
              <p class="label">WhatsApp:</p>
              <p><a href="https://wa.me/${data.customerPhone.replace(/\D/g, '')}">${data.customerPhone}</a></p>
            </div>
            <div class="detail">
              <p class="label">Delivery Address:</p>
              <p>${data.deliveryAddress || 'Not provided'}${data.city ? `, ${data.city}` : ''}${data.state ? `, ${data.state}` : ''}</p>
            </div>
            <div class="detail">
              <p class="label">Occasion:</p>
              <p>${data.occasion}</p>
            </div>
            <div class="detail">
              <p class="label">Budget Range:</p>
              <p>${data.budgetRange}</p>
            </div>
            <div class="detail">
              <p class="label">Preferred Delivery Date:</p>
              <p>${data.preferredDeliveryDate || 'Not specified'}</p>
            </div>
            <div class="detail">
              <p class="label">Description:</p>
              <p>${data.description}</p>
            </div>
            <div style="margin: 20px 0; padding: 15px; background: #fdf6f0; border-left: 4px solid #d4a5a5; border-radius: 6px;">
              <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: bold; color: #2a2a2a; text-transform: uppercase;">Suggested message to send them:</p>
              <p style="margin: 0; font-size: 14px; color: #2a2a2a; font-style: italic; white-space: pre-line;">Hi ${firstName}!

              Thank you for your custom gift request (Ref: ${data.referenceId}) for ${data.occasion}.

              I've reviewed your details and would love to help bring your vision to life, could we chat a bit more here on WhatsApp so I can share a personalized quote?

              Looking forward to creating something special for you!              💕

~ <em>Zeedat</em> from <strong>Gifts by EverythingZeedat</strong></p>
            </div>
            <p style="margin-top: 20px; font-size: 12px; color: #666;">
              Respond to customer within 24 hours.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: process.env.GMAIL_EMAIL,
      to: adminEmail,
      subject: `[ADMIN] New Custom Order: ${data.customerName} - ${data.referenceId}`,
      html: adminEmailHTML,
    });

    console.log(`Admin notification sent for reference ${data.referenceId}`);
    return true;
  } catch (error) {
    console.error('Admin notification failed:', error);
    throw error;
  }
}

// ============================================================================
// Regular cart/checkout order emails (guest orders, no account required)
// ============================================================================

export interface OrderEmailItem {
  name: string;
  price: number;
  quantity: number;
}

export interface OrderEmailData {
  customerName: string;
  customerEmail?: string | null;
  customerPhone: string;
  reference: string;
  orderDate: string;
  items: OrderEmailItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  deliveryAddress: string;
  city: string;
  state: string;
  deliveryDate: string;
  notes?: string | null;
}

function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString()}`;
}

function orderItemsHTML(items: OrderEmailItem[]): string {
  return items
    .map(
      item => `
        <div class="snapshot-item">
          <span class="snapshot-value">${item.name} × ${item.quantity} — ${formatNaira(item.price * item.quantity)}</span>
        </div>`
    )
    .join('');
}

export async function sendOrderConfirmation(data: OrderEmailData): Promise<boolean> {
  if (!data.customerEmail) return false;

  try {
    const firstName = getFirstName(data.customerName);
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #faf8f6; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #d4a5a5 0%, #c4956f 100%); color: white; padding: 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 26px; font-weight: 600; }
          .content { padding: 30px; color: #2a2a2a; }
          .snapshot { background-color: #f9f7f4; border-left: 4px solid #d4a5a5; padding: 20px; margin: 20px 0; border-radius: 6px; }
          .snapshot-title { font-weight: 600; color: #d4a5a5; margin-bottom: 15px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; }
          .snapshot-item { margin-bottom: 10px; font-size: 14px; line-height: 1.5; }
          .totals { margin-top: 15px; padding-top: 15px; border-top: 1px solid #e8dfd9; font-size: 14px; }
          .total-row { display: flex; justify-content: space-between; margin-bottom: 6px; }
          .cta-button { display: inline-block; background-color: #25d366; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px; }
          .footer { background-color: #f9f7f4; padding: 20px; text-align: center; font-size: 12px; color: #8b8b8b; border-top: 1px solid #e8dfd9; }
          .footer-link { color: #d4a5a5; text-decoration: none; }
          .reference-id { font-family: monospace; background-color: #faf8f6; padding: 2px 6px; border-radius: 3px; color: #d4a5a5; font-weight: 600; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header"><h1>🎁 Order Received!</h1></div>
          <div class="content">
            <p>Hi <strong>${firstName}</strong>,</p>
            <p>Thank you so much for shopping with <strong>Gifts by EverythingZeedat</strong>! 💕 We've received your order and here's a summary for your records.</p>

            <div class="snapshot">
              <div class="snapshot-title">📋 Order ${`<span class="reference-id">${data.reference}</span>`}</div>
              <p style="font-size: 13px; color: #8b8b8b; margin: -5px 0 15px 0;">Placed on ${new Date(data.orderDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              ${orderItemsHTML(data.items)}
              <div class="totals">
                <div class="total-row"><span>Subtotal</span><span>${formatNaira(data.subtotal)}</span></div>
                <div class="total-row"><span>Delivery</span><span>${formatNaira(data.deliveryFee)}</span></div>
                <div class="total-row"><strong>Total</strong><strong>${formatNaira(data.total)}</strong></div>
              </div>
            </div>

            <p style="font-size: 14px;">Delivering to: ${data.deliveryAddress}, ${data.city}, ${data.state} on ${new Date(data.deliveryDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}.</p>

            <div style="text-align: center; margin: 25px 0;">
              <p style="margin: 0 0 15px 0; font-size: 14px; color: #666;">Confirm your order and payment details on WhatsApp:</p>
              <a href="https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hi Zeedat, I placed an order — Reference: ${data.reference}`)}" class="cta-button">💬 Confirm on WhatsApp</a>
            </div>

            <p style="font-size: 13px; color: #8b8b8b;">You can track your order any time using your reference number and phone number at any point on our site's Order Tracking page.</p>
          </div>
          <div class="footer">
            <p style="margin: 0 0 10px 0;"><strong>Gifts by EverythingZeedat</strong></p>
            <p style="margin: 0;">📱 WhatsApp: <a href="https://wa.me/${WHATSAPP_NUMBER}" class="footer-link">${WHATSAPP_DISPLAY}</a> · 📷 <a href="${INSTAGRAM_URL}" class="footer-link">${INSTAGRAM_HANDLE}</a></p>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: process.env.GMAIL_EMAIL,
      to: data.customerEmail,
      subject: `Order Received - Reference: ${data.reference}`,
      html,
    });

    console.log(`Order confirmation email sent for ${data.reference}`);
    return true;
  } catch (error) {
    console.error('Order confirmation email failed:', error);
    // Don't let a flaky email provider fail the whole order — the order is
    // already saved in the database at this point.
    return false;
  }
}

export async function sendOrderNotificationToAdmin(data: OrderEmailData): Promise<boolean> {
  try {
    const adminEmail = process.env.GMAIL_EMAIL;

    const itemsRows = data.items
      .map(item => `<div class="detail"><p>${item.name} × ${item.quantity} — ${formatNaira(item.price * item.quantity)}</p></div>`)
      .join('');
    const firstName = getFirstName(data.customerName);

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; background-color: #faf8f6; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
          .header { background: #d4a5a5; color: white; padding: 15px; text-align: center; }
          .content { padding: 20px; }
          .detail { margin: 10px 0; padding: 10px; background: #f9f7f4; }
          .label { font-weight: bold; color: #2a2a2a; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header"><h2>🛍️ New Order</h2></div>
          <div class="content">
            <p><strong>Reference:</strong> ${data.reference}</p>
            <div class="detail"><p class="label">Customer:</p><p>${data.customerName}</p></div>
            <div class="detail"><p class="label">WhatsApp:</p><p><a href="https://wa.me/${data.customerPhone.replace(/\D/g, '')}">${data.customerPhone}</a></p></div>
            ${data.customerEmail ? `<div class="detail"><p class="label">Email:</p><p>${data.customerEmail}</p></div>` : ''}
            <div class="detail"><p class="label">Delivery:</p><p>${data.deliveryAddress}, ${data.city}, ${data.state} — ${new Date(data.deliveryDate).toLocaleDateString()}</p></div>
            ${data.notes ? `<div class="detail"><p class="label">Notes:</p><p>${data.notes}</p></div>` : ''}
            <div class="detail"><p class="label">Items:</p>${itemsRows}</div>
            <div class="detail"><p class="label">Total:</p><p>${formatNaira(data.total)} (subtotal ${formatNaira(data.subtotal)} + delivery ${formatNaira(data.deliveryFee)})</p></div>
            <div style="margin: 20px 0; padding: 15px; background: #fdf6f0; border-left: 4px solid #d4a5a5; border-radius: 6px;">
              <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: bold; color: #2a2a2a; text-transform: uppercase;">Suggested message to send them:</p>
              <p style="margin: 0; font-size: 14px; color: #2a2a2a; font-style: italic; white-space: pre-line;">Hi ${firstName}!

              Thank you for your order (Ref: ${data.reference}) with Gifts by EverythingZeedat 🎁.

              I'd like to confirm a few details and share payment options with you, could we chat here on WhatsApp when you have a moment?
              Looking forward to getting your gift ready! 💕

~ <em>Zeedat<em> from <strong>Gifts by EverythingZeedat</strong></p>
            </div>
            <p style="margin-top: 20px; font-size: 12px; color: #666;">Reach out to confirm payment and delivery details.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: process.env.GMAIL_EMAIL,
      to: adminEmail,
      subject: `[ADMIN] New Order: ${data.customerName} - ${data.reference}`,
      html,
    });

    console.log(`Admin order notification sent for ${data.reference}`);
    return true;
  } catch (error) {
    console.error('Admin order notification failed:', error);
    return false;
  }
}

// ============================================================================
// Order status / payment update notification (sent to the customer whenever
// an admin changes an order's status or confirms payment)
// ============================================================================

const STATUS_COPY: Record<string, { label: string; blurb: string }> = {
  RECEIVED: { label: 'Order Received', blurb: "We've got your order and we're getting it ready." },
  CONFIRMED: { label: 'Confirmed', blurb: 'Your order has been confirmed!' },
  PREPARING: { label: 'Preparing', blurb: "We're preparing your gift with care." },
  OUT_FOR_DELIVERY: { label: 'Out for Delivery', blurb: "Your gift is on its way!" },
  DELIVERED: { label: 'Delivered', blurb: 'Your gift has been delivered. We hope it brought a smile!' },
  CANCELLED: { label: 'Cancelled', blurb: 'This order has been cancelled.' },
};

export interface OrderStatusUpdateEmailData {
  customerName: string;
  customerEmail?: string | null;
  reference: string;
  status: string;
  paymentStatus: string;
  paymentJustConfirmed?: boolean;
  refundJustIssued?: boolean;
}

export async function sendOrderStatusUpdate(data: OrderStatusUpdateEmailData): Promise<boolean> {
  if (!data.customerEmail) return false;

  try {
    const statusInfo = STATUS_COPY[data.status] || { label: data.status, blurb: 'Your order status has been updated.' };
    const firstName = getFirstName(data.customerName);

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #faf8f6; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #d4a5a5 0%, #c4956f 100%); color: white; padding: 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
          .content { padding: 30px; color: #2a2a2a; }
          .status-badge { display: inline-block; background-color: #f9f7f4; border-left: 4px solid #d4a5a5; padding: 15px 20px; border-radius: 6px; margin: 20px 0; font-weight: 600; color: #2a2a2a; }
          .payment-note { background-color: #eefaf0; border-left: 4px solid #22c55e; padding: 15px 20px; border-radius: 6px; margin: 20px 0; font-size: 14px; }
          .cta-button { display: inline-block; background-color: #d4a5a5; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px; }
          .footer { background-color: #f9f7f4; padding: 20px; text-align: center; font-size: 12px; color: #8b8b8b; border-top: 1px solid #e8dfd9; }
          .footer-link { color: #d4a5a5; text-decoration: none; }
          .reference-id { font-family: monospace; background-color: #faf8f6; padding: 2px 6px; border-radius: 3px; color: #d4a5a5; font-weight: 600; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header"><h1>🎁 Order Update</h1></div>
          <div class="content">
            <p>Hi <strong>${firstName}</strong>,</p>
            <p>${statusInfo.blurb}</p>

            <div class="status-badge">
              Order ${`<span class="reference-id">${data.reference}</span>`} is now: ${statusInfo.label}
            </div>

            ${
              data.paymentJustConfirmed
                ? `<div class="payment-note">✅ We've also confirmed receipt of your payment for this order. Thank you!</div>`
                : ''
            }

            ${
              data.refundJustIssued
                ? `<div class="payment-note">💸 We've issued a refund for this order. Please allow a few business days for it to reflect, depending on your bank.</div>`
                : ''
            }

            ${
              data.status === 'DELIVERED'
                ? `
            <div style="text-align: center; margin: 25px 0; padding: 20px; background-color: #fdf6f0; border-radius: 8px;">
              <p style="margin: 0 0 12px 0; font-size: 15px; color: #2a2a2a;">
                💕 Thank you for shopping with us! We'd love to hear what you thought.
              </p>
              <a href="${siteUrl}/#reviews" class="cta-button" style="margin-bottom: 24px;">Leave a Review</a>
            </div>

            <div style="margin-top: 30px;">
              <p style="margin: 0 0 12px 0; font-size: 15px; color: #2a2a2a;">
                <strong>P.S:</strong> If you have any concern about your order, kindly message us on WhatsApp
              </p>
              <a
                href="https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                  `Hi Zeedat, my order (${data.reference}) has been delivered. I have a concern.`
                )}"
                class="cta-button"
                style="background-color: #25d366;"
              >
                💬 Contact Us
              </a>
            </div>
            `
                : ''
            }

            <p style="font-size: 13px; color: #8b8b8b; margin-top: 20px;">
              You can check full details any time using your reference number and phone number on our Order Tracking page.
            </p>
          </div>
          <div class="footer">
            <p style="margin: 0 0 10px 0;"><strong>Gifts by EverythingZeedat</strong></p>
            <p style="margin: 0;">📱 WhatsApp: <a href="https://wa.me/${WHATSAPP_NUMBER}" class="footer-link">${WHATSAPP_DISPLAY}</a> · 📷 <a href="${INSTAGRAM_URL}" class="footer-link">${INSTAGRAM_HANDLE}</a></p>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: process.env.GMAIL_EMAIL,
      to: data.customerEmail,
      subject: `Order Update: ${statusInfo.label} - Reference: ${data.reference}`,
      html,
    });

    console.log(`Order status update email sent for ${data.reference}`);
    return true;
  } catch (error) {
    console.error('Order status update email failed:', error);
    return false;
  }
}
