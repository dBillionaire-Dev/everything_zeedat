# Automated Notifications System

## Overview

The Gifts by EverythingZeedat platform includes a comprehensive automated notification system that sends emails and generates WhatsApp messages when customers submit custom gift orders. This guide explains how the system works and what customers receive.

## What Happens When a Customer Submits a Custom Order

### 1. Form Submission
Customer fills out the custom order form with:
- Full name
- WhatsApp number
- Email address
- Occasion (e.g., Wedding, Birthday, Corporate Gift)
- Budget range (Under ₦10k, ₦10-25k, ₦25-50k, ₦50k+)
- Detailed description of their vision
- Preferred delivery date (optional)

### 2. Server Processing
When the form is submitted, the system:
1. **Validates** all required fields
2. **Saves the request** to Supabase database with status "NEW"
3. **Generates a unique Reference ID** (format: CO-XXXXXXXX)
4. **Sends customer confirmation email** (HTML formatted with branding)
5. **Sends admin notification email**
6. **Logs WhatsApp message** ready for admin to send

### 3. Customer Experience
- **Immediate Feedback:** Success page with reference ID displayed
- **Email Confirmation:** Arrives within seconds
- **Tracking:** Reference ID allows customer to track their request

## Email Templates

### Customer Confirmation Email

**Header:** Pink gradient banner with "💝 We Received Your Request!"

**Content:**
```
Hi [Customer Name],

Thank you for reaching out to Gifts by EverythingZeedat! 
We're thrilled that you've chosen us to create a special gift.

✓ Request Received Successfully
Your custom gift request has been received and logged. Our gift experts 
are reviewing your details and will get back to you within 24 HOURS with 
personalized recommendations and a quotation.

📋 REQUEST DETAILS SNAPSHOT
├─ Reference ID: CO-XXXXXXXX
├─ Occasion: [Occasion]
├─ Budget Range: [Budget]
├─ Preferred Delivery: [Date if provided]
└─ Description: "[Customer's full description]"

💬 Message us on WhatsApp
[Quick link to WhatsApp with reference ID]

What happens next?
Our team will review your custom order request and reach out within 
24 hours via email or WhatsApp. We'll provide detailed recommendations, 
pricing, and availability based on your preferences.

📱 Contact Information:
WhatsApp: +234 813 128 8947
Instagram: @gifts.by.everythingzeedat
```

**Styling:**
- Warm blush/cream color scheme matching brand
- Easy-to-read typography
- Reference ID highlighted in box
- WhatsApp button in bright green
- Professional footer with contact links

### Admin Notification Email

**Subject:** "[ADMIN] New Custom Order: [Customer Name] - [Reference ID]"

**Content:**
```
🎁 NEW CUSTOM ORDER REQUEST

Customer: [Name]
Phone: [WhatsApp number]
Reference: [CO-XXXXXXXX]

Occasion: [Occasion]
Budget: [Budget Range]
Preferred Delivery: [Date or "Not specified"]

Description:
[Full customer description]

⏰ ACTION REQUIRED: Respond within 24 hours
```

**Features:**
- Concise, scannable layout
- All customer contact info
- Full order details
- 24-hour reminder
- Clickable phone numbers for WhatsApp

## WhatsApp Integration

### Automatic Message Generation

The system generates pre-formatted WhatsApp messages that include:
- Personalized greeting
- Reference ID
- Order details (occasion, budget, description)
- Delivery date if specified
- Professional closing

**Example Message:**
```
Hi Chioma,

🎁 Thank you for choosing Gifts by EverythingZeedat!

We received your custom gift request:

Reference ID: CO-5A2B3C1D
Occasion: Wedding Anniversary
Budget: ₦10,000 - ₦25,000
Description: "Elegant hamper with wine, chocolates, 
luxury items for our 5th wedding anniversary..."

Our team is reviewing your request and will get back to you 
within 24 hours with personalized recommendations and pricing.

Keep this reference ID handy for tracking your order!

Thank you! 💝
```

### How Admins Send WhatsApp Messages

**Option 1: Via Deep Link**
- System automatically generates WhatsApp links
- Click link to open WhatsApp Web or App
- Message is pre-filled and ready to send

**Option 2: Manual Send**
- Copy the formatted message from server logs
- Open WhatsApp and paste
- Send to customer

**Option 3: WhatsApp Business API** (Future Enhancement)
- Fully automated message delivery
- Read receipts and delivery tracking
- Message templates

## Timeline & SLAs

| Time | Action |
|------|--------|
| Immediate | Customer receives success page with reference ID |
| Within 1 sec | Confirmation email sent |
| Within 1 sec | Admin notification email sent |
| Within 1 sec | WhatsApp message logged in system |
| Within 24 hours | Admin should contact customer via WhatsApp/email |
| Within 48 hours | Formal proposal with pricing delivered |

## Customer Reference ID System

### Purpose
- Unique identifier for tracking
- Enables customers to follow up
- Links all communications

### Format
- **CO-XXXXXXXX** (CO = Custom Order)
- Generated from database ID
- Displayed on success page
- Included in all communications
- Stored in database for admin lookup

### How Customers Use It
1. Receive ID on success page
2. Check their email for confirmation
3. Can message WhatsApp with reference ID
4. Admin can track and respond quickly

## Error Handling

### What if email doesn't send?

**Customer sees:**
- Error message on screen
- Instructions to try again
- WhatsApp contact option as fallback

**Order status:**
- Still saved to database
- Admin should follow up via WhatsApp
- Customer can reference from email if needed

### What if database save fails?

**Customer sees:**
- Error message
- Suggestion to submit form again
- WhatsApp contact option

**Notification:**
- Emails won't be sent
- Admin won't be notified until successful save

## Security & Privacy

### Data Protection
- ✓ Emails sent via secure SMTP connection
- ✓ Customer data stored in encrypted Supabase database
- ✓ Row Level Security policies protect data
- ✓ No PII stored in logs (except reference ID)

### Email Security
- ✓ App password authentication (not regular password)
- ✓ 2-Step verification on Gmail account
- ✓ No sensitive data in email headers
- ✓ HTML sanitization to prevent injection

### Best Practices
- Delete old request records after 1 year
- Store passwords in environment variables only
- Use separate admin Gmail account if possible
- Enable Gmail 2-Step verification
- Monitor email sending logs

## Customization Options

### Change Email Template

Edit `/lib/email-service.ts` function `generateEmailHTML()`:
- Update colors, branding
- Add/remove fields
- Change messaging or tone
- Add promotional content

### Change WhatsApp Message Format

Edit `/lib/whatsapp-service.ts` function `generateWhatsAppMessage()`:
- Customize greeting
- Adjust message flow
- Add company-specific info
- Change emoji usage

### Change Email Frequency or Recipients

Edit `/app/api/custom-orders/route.ts`:
- Add/remove email recipients
- Send additional notifications
- Modify email timing
- Add SMS notifications

## Troubleshooting

### Customer didn't receive email?

1. Check email address is correct in form
2. Check Gmail spam folder
3. Verify `GMAIL_EMAIL` environment variable
4. Verify `GMAIL_APP_PASSWORD` is correct
5. Check Google Account security settings

### Admin not receiving notifications?

1. Verify admin email receiving works
2. Check email filters/labels
3. Check Gmail spam folder
4. Verify app password setup
5. Check Vercel environment variables

### WhatsApp links not working?

1. Phone number must be international format
2. Ensure + or country code included
3. Test link manually: `https://wa.me/2348131288947`
4. Check for special characters in message

## Analytics & Monitoring

### Metrics to Track
- Email delivery rate
- Email open rate (if using tracking pixel)
- Response time to custom orders
- Conversion rate (requests → orders)
- Customer satisfaction with response

### How to Monitor
1. Check Gmail inbox for delivery
2. Review Supabase logs for API errors
3. Monitor Vercel function logs
4. Track custom order status changes
5. Set up alerts for high response times

## Future Enhancements

- [ ] SMS notifications as backup
- [ ] WhatsApp Business API for direct delivery
- [ ] Email read receipts
- [ ] Automated follow-up sequences
- [ ] Customer SMS reminders
- [ ] Delivery status SMS updates
- [ ] Customer feedback email after delivery
- [ ] Automated quote generation

---

For technical implementation details, see: `/lib/email-service.ts` and `/lib/whatsapp-service.ts`
