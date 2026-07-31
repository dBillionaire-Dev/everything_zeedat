# Quick Start Guide - Gifts by EverythingZeedat

## 5-Minute Setup

### Step 1: Get Gmail Credentials (5 minutes)

1. Go to https://myaccount.google.com
2. Click **Security** on the left
3. Enable **2-Step Verification** if not already done
4. Scroll down to find **App passwords**
5. Select "Mail" and your device type
6. Copy the **16-character password**
7. Keep these two ready:
   - Your Gmail address (e.g., `zeedat@gmail.com`)
   - The 16-character app password

### Step 2: Add to Vercel (2 minutes)

1. Go to your Vercel project
2. Click **Settings** → **Environment Variables**
3. Add these two variables:
   - Key: `GMAIL_EMAIL`, Value: Your Gmail address
   - Key: `GMAIL_APP_PASSWORD`, Value: The 16-character password
4. Click **Save**
5. Redeploy the project

### Step 3: Test It (Done!)

Visit: **https://your-site.vercel.app/custom-orders**

Fill out the form and submit. You should receive:
- ✓ Confirmation email to customer email address
- ✓ Admin notification to your Gmail inbox
- ✓ Success page with reference ID

## Test Locally (Optional)

```bash
# Create .env.local file
GMAIL_EMAIL=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-char-password

# Run dev server
pnpm dev

# Visit http://localhost:3000/custom-orders
```

## What You Get

### When Customer Submits Custom Order:

1. **Customer Sees**
   - Instant success page with Reference ID
   - Instructions for next steps
   - WhatsApp contact link

2. **Customer Receives Email**
   - Beautiful HTML email with branding
   - Complete snapshot of their order
   - Reference ID for tracking
   - 24-hour response guarantee
   - WhatsApp contact link

3. **You Receive Email**
   - Subject: "[ADMIN] New Custom Order: [Name] - [ID]"
   - All customer contact details
   - Full order description
   - Budget and delivery preferences
   - Reminder to respond within 24 hours

4. **System Generates**
   - Pre-formatted WhatsApp message
   - Unique Reference ID (CO-XXXXXXXX)
   - Saved order in database

## Key Pages

| Page | URL | Purpose |
|------|-----|---------|
| Home | `/` | Brand showcase, featured products |
| Shop | `/shop` | Browse all gifts and hampers |
| Product | `/shop/[slug]` | View details, add to cart |
| Custom Orders | `/custom-orders` | Request personalized gifts |
| Cart | `/cart` | Review items before checkout |
| Checkout | `/checkout` | Complete purchase |
| Order Tracking | `/order-tracking/[reference]` | Track by reference ID |
| Admin Orders | `/admin/orders` | Manage all orders |
| Admin Custom | `/admin/custom-orders` | Manage custom requests |

## Important Features

✓ **Fully functional e-commerce platform**
- 12 pre-seeded products
- Shopping cart with customization
- Checkout flow
- Order management

✓ **Automated notifications**
- Email to customers
- Email to admin
- Reference ID tracking
- WhatsApp message generation

✓ **Database integration**
- Real Supabase PostgreSQL
- 4 main tables (products, orders, items, custom requests)
- Row Level Security enabled
- Real-time data sync

✓ **Admin dashboard**
- View all orders
- Manage custom requests
- Update order status
- Track customer information

✓ **Professional design**
- Warm blush/cream color scheme
- Mobile-responsive
- Serif + Sans-serif typography
- Smooth interactions

## Common Tasks

### Respond to a Custom Order

1. Check your Gmail inbox for alert
2. Read customer requirements
3. Go to `/admin/custom-orders`
4. Find the customer by Reference ID
5. Update status: REVIEWED → QUOTED
6. Add admin notes with pricing
7. Send WhatsApp message to customer
8. Update status: CONFIRMED

### Update Order Status

1. Go to `/admin/orders`
2. Find order by reference
3. Click to view details
4. Update status:
   - RECEIVED → CONFIRMED → PREPARING → OUT_FOR_DELIVERY → DELIVERED
5. Customer can track on `/order-tracking/[reference]`

### Add New Product

Edit `/supabase` and run SQL to insert:
```sql
INSERT INTO products (name, slug, description, price, category, ...)
VALUES (...)
```

Then update product list in `/app/shop/page.tsx`

## Support Links

- **Documentation:** Read PROJECT_SUMMARY.md
- **Email Setup:** Read EMAIL_SETUP.md
- **Notifications:** Read NOTIFICATIONS.md
- **Supabase:** https://app.supabase.com
- **Vercel:** https://vercel.com/dashboard

## Troubleshooting

**"Emails not sending?"**
- Check GMAIL_EMAIL is correct
- Verify GMAIL_APP_PASSWORD is the 16-character app password
- Ensure 2-Step Verification is enabled on Gmail
- Check environment variables in Vercel Settings

**"Custom order form not working?"**
- Check browser console for errors (F12)
- Verify Supabase is connected (check environment variables)
- Try clearing browser cache and refresh

**"Products not showing?"**
- Verify database schema is created (in EMAIL_SETUP.md)
- Check products are seeded (in Supabase dashboard)
- Verify Supabase credentials are correct

**"Still stuck?"**
- Read the full docs in the repo
- Check Vercel function logs
- Check Supabase query logs
- Ask AI or contact support

## Next Steps

1. ✓ Set up Gmail credentials (5 min)
2. ✓ Deploy to Vercel (2 min)
3. ✓ Test custom order form (2 min)
4. ✓ Test receiving emails (1 min)
5. Go through admin dashboard
6. Customize email templates if needed
7. Set up team access
8. Go live! 🎉

---

**Everything is production-ready.** You can take orders immediately after setup!

For questions, check the documentation files or review the code comments in:
- `/lib/email-service.ts`
- `/lib/whatsapp-service.ts`
- `/app/api/custom-orders/route.ts`
- `/app/custom-orders/page.tsx`
