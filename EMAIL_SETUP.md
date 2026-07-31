# Email & WhatsApp Notifications Setup

This guide explains how to set up automated email and WhatsApp notifications for custom gift orders.

## Overview

When customers submit a custom gift request form, the system will:
1. **Send a confirmation email** to the customer with their order details and reference ID
2. **Send an admin notification email** to your Gmail inbox
3. **Generate a WhatsApp message** ready to send to the admin (logged in console during deployment)

## Setup Instructions

### Step 1: Generate Gmail App Password

1. Go to your Google Account: https://myaccount.google.com/
2. Navigate to **Security** (left menu)
3. Enable **2-Step Verification** if not already enabled
4. Scroll down and find **App passwords**
5. Select "Mail" and "Windows Computer" (or your device)
6. Google will generate a 16-character password
7. **Copy this password** - you'll need it shortly

### Step 2: Add Environment Variables to Vercel

1. Go to your Vercel Project Settings
2. Click on **Settings** → **Environment Variables**
3. Add the following two variables:

| Variable Name | Value |
|---------------|-------|
| `GMAIL_EMAIL` | Your Gmail address (e.g., `zeedat@gmail.com`) |
| `GMAIL_APP_PASSWORD` | The 16-character app password from Step 1 |

4. Click **Save**

### Step 3: Verify Setup

Once deployed, when a customer submits the custom order form:
- They'll see a success page with their reference ID
- A confirmation email will be sent to their email address
- An admin notification will be sent to your `GMAIL_EMAIL` inbox
- The server logs will show the WhatsApp message ready to send

## Testing Locally

To test locally during development:

1. Create a `.env.local` file in the project root:
```
GMAIL_EMAIL=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-char-password
```

2. Restart the dev server: `pnpm dev`

3. Submit a test custom order form

4. Check:
   - Your email inbox for the confirmation email
   - Your email inbox for the admin notification
   - Server console logs for the formatted WhatsApp message

## Email Templates

### Customer Confirmation Email
- **To:** Customer's email
- **Subject:** "Custom Gift Request Received - Reference: [ID]"
- **Contains:**
  - Thank you message
  - Request details snapshot (occasion, budget, description, etc.)
  - Reference ID for tracking
  - 24-hour response guarantee
  - WhatsApp contact link
  - Next steps

### Admin Notification Email
- **To:** Your Gmail address
- **Subject:** "[ADMIN] New Custom Order: [Customer Name] - [Reference ID]"
- **Contains:**
  - Customer contact information
  - Full order details
  - Budget range
  - Preferred delivery date
  - Reminder to respond within 24 hours

## WhatsApp Integration

The system generates a pre-formatted WhatsApp message that can be manually sent via:
- **WhatsApp Web:** https://wa.me/[customer-number]
- **WhatsApp App:** Save customer number and send the pre-formatted message

The WhatsApp message includes:
- Customer name
- Reference ID
- Occasion and budget
- Description
- Preferred delivery date
- Direct link to contact

## Troubleshooting

### Emails Not Sending?

1. **Check Gmail App Password**
   - Verify you used the correct 16-character app password (not your regular password)
   - Ensure 2-Step Verification is enabled on your Google Account

2. **Check Environment Variables**
   - Confirm `GMAIL_EMAIL` and `GMAIL_APP_PASSWORD` are set in Vercel
   - Redeploy the project after adding env vars

3. **Check Email Filters**
   - Emails might be going to spam folder
   - Check your Gmail spam/trash folders

4. **Gmail Security**
   - Ensure "Less secure app access" is not blocking the connection
   - Modern Gmail with app passwords should work fine

### Customer Not Receiving Confirmation?

1. Check their spam/junk folder
2. Verify the email address was entered correctly in the form
3. Check server logs for email sending errors

### Still Having Issues?

1. Check the server logs: `pnpm dev` and look for `[v0]` tagged messages
2. Verify both environment variables are exactly correct (including spaces)
3. Ensure your Gmail account has 2-Step Verification enabled
4. Try sending a test email first to confirm setup

## Security Notes

- Never commit `GMAIL_EMAIL` or `GMAIL_APP_PASSWORD` to version control
- Use environment variables only
- App passwords are safe to use - they're different from your regular Google password
- Consider creating a dedicated Gmail account for your business to separate notifications

## Next Steps

After setup is complete:

1. Test with a sample custom order submission
2. Set up an email signature for professional outreach
3. Consider setting up labels/filters for custom order notifications
4. Create a template response for common requests
5. Train team members on the 24-hour response requirement

## Support

For issues or questions:
- Check the application error logs
- Review the email service implementation in `/lib/email-service.ts`
- Check the API route in `/app/api/custom-orders/route.ts`
