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
