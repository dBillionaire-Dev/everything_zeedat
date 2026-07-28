// WhatsApp notification service
// This generates WhatsApp message templates with order details

export interface WhatsAppMessageData {
  customerName: string;
  customerPhone: string;
  occasion: string;
  budgetRange: string;
  description: string;
  referenceId: string;
  preferredDeliveryDate?: string;
}

const budgetLabels: Record<string, string> = {
  'under-10k': 'Under ₦10,000',
  '10k-25k': '₦10,000 - ₦25,000',
  '25k-50k': '₦25,000 - ₦50,000',
  '50k-plus': '₦50,000+',
};

export function generateWhatsAppMessage(data: WhatsAppMessageData): string {
  const message = `
Hi ${data.customerName},

🎁 Thank you for choosing Gifts by EverythingZeedat!

We received your custom gift request:

*Reference ID:* ${data.referenceId}
*Occasion:* ${data.occasion}
*Budget:* ${budgetLabels[data.budgetRange] || data.budgetRange}
*Description:* "${data.description}"
${data.preferredDeliveryDate ? `*Preferred Delivery:* ${new Date(data.preferredDeliveryDate).toLocaleDateString()}` : ''}

Our team is reviewing your request and will get back to you within 24 hours with personalized recommendations and pricing.

Keep this reference ID handy for tracking your order!

Thank you! 💝
`.trim();

  return message;
}

export function generateWhatsAppLink(
  phoneNumber: string,
  message: string
): string {
  // Remove all non-digit characters from phone number
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  
  // WhatsApp Web API expects phone number without + sign
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}

export function generateAdminWhatsAppMessage(data: WhatsAppMessageData): string {
  const message = `
*NEW CUSTOM ORDER REQUEST*

Customer: ${data.customerName}
Phone: ${data.customerPhone}
Reference: ${data.referenceId}

Occasion: ${data.occasion}
Budget: ${budgetLabels[data.budgetRange] || data.budgetRange}

Description:
${data.description}

${data.preferredDeliveryDate ? `Preferred Delivery: ${new Date(data.preferredDeliveryDate).toLocaleDateString()}` : 'No specific delivery date'}

⏰ Respond within 24 hours
`.trim();

  return message;
}

// ============================================================================
// Regular cart/checkout order WhatsApp messages
// ============================================================================

export interface OrderWhatsAppItem {
  name: string;
  price: number;
  quantity: number;
}

export interface OrderWhatsAppMessageData {
  customerName: string;
  customerPhone: string;
  reference: string;
  items: OrderWhatsAppItem[];
  total: number;
  deliveryDate: string;
}

function formatItemsList(items: OrderWhatsAppItem[]): string {
  return items.map(item => `- ${item.name} x${item.quantity} (₦${(item.price * item.quantity).toLocaleString()})`).join('\n');
}

/**
 * The message a *customer* is handed to send to Zeedat's WhatsApp after
 * placing an order — this is what "leads them to WhatsApp with a
 * customized message" after checkout.
 */
export function generateCustomerOrderWhatsAppMessage(data: OrderWhatsAppMessageData): string {
  return `
Hi Zeedat! I just placed an order on the website.

*Reference:* ${data.reference}
*Name:* ${data.customerName}

*Items:*
${formatItemsList(data.items)}

*Total:* ₦${data.total.toLocaleString()}
*Delivery Date:* ${new Date(data.deliveryDate).toLocaleDateString()}

Looking forward to confirming payment and details with you! 💝
`.trim();
}

export function generateCustomerOrderWhatsAppLink(data: OrderWhatsAppMessageData): string {
  return generateWhatsAppLink('2348131288947', generateCustomerOrderWhatsAppMessage(data));
}

/** Internal message logged for admin visibility (mirrors the custom-order pattern). */
export function generateAdminOrderWhatsAppMessage(data: OrderWhatsAppMessageData): string {
  return `
*NEW ORDER*

Customer: ${data.customerName}
Phone: ${data.customerPhone}
Reference: ${data.reference}

Items:
${formatItemsList(data.items)}

Total: ₦${data.total.toLocaleString()}
Delivery Date: ${new Date(data.deliveryDate).toLocaleDateString()}
`.trim();
}
