import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/service-role';
import { sendCustomOrderConfirmation, sendCustomOrderNotificationToAdmin } from '@/lib/email-service';
import { generateAdminWhatsAppMessage } from '@/lib/whatsapp-service';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { generateCustomOrderReference } from '@/lib/order-reference';

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rateLimit = await checkRateLimit({ key: `custom-orders:${ip}`, limit: 5, windowMinutes: 15 });
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests submitted recently. Please try again in a few minutes, or reach out on WhatsApp.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    
    const {
      customerName,
      customerEmail,
      customerPhone,
      occasion,
      budgetRange,
      description,
      preferredDeliveryDate,
      referenceImage,
    } = body;

    // Validate required fields
    if (!customerName || !customerEmail || !customerPhone || !occasion || !budgetRange || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create custom order in Supabase
    const supabase = createServiceRoleClient();
    const referenceId = generateCustomOrderReference();

    const { data, error } = await supabase
      .from('custom_order_requests')
      .insert([
        {
          reference: referenceId,
          customer_name: customerName,
          phone: customerPhone,
          email: customerEmail,
          occasion,
          budget_range: budgetRange,
          description,
          preferred_delivery_date: preferredDeliveryDate || null,
          reference_image_url: referenceImage || null,
          status: 'NEW',
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    // Best-effort notifications — the request is already saved above, so a
    // flaky email provider (e.g. missing/expired Gmail app password)
    // shouldn't turn a successful submission into an error for the customer.
    const emailPayload = {
      customerName,
      customerEmail,
      customerPhone,
      occasion,
      budgetRange,
      description,
      preferredDeliveryDate,
      referenceId,
    };

    const [confirmationResult, adminResult] = await Promise.allSettled([
      sendCustomOrderConfirmation(emailPayload),
      sendCustomOrderNotificationToAdmin(emailPayload),
    ]);

    if (confirmationResult.status === 'rejected') {
      console.error('Customer confirmation email failed (non-fatal):', confirmationResult.reason);
    }
    if (adminResult.status === 'rejected') {
      console.error('Admin notification email failed (non-fatal):', adminResult.reason);
    }

    // Generate admin WhatsApp message (for manual forwarding if needed)
    const adminWhatsAppMessage = generateAdminWhatsAppMessage({
      customerName,
      customerPhone,
      occasion,
      budgetRange,
      description,
      preferredDeliveryDate,
      referenceId,
    });
    console.log(`Admin WhatsApp Message for ${referenceId}:\n${adminWhatsAppMessage}`);

    return NextResponse.json(
      {
        success: true,
        message: 'Custom order request submitted successfully!',
        referenceId,
        orderId: data.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to submit custom order request. Please try again or contact us via WhatsApp.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
