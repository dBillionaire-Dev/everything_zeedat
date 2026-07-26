import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendCustomOrderConfirmation, sendCustomOrderNotificationToAdmin } from '@/lib/email-service';
import { generateAdminWhatsAppMessage } from '@/lib/whatsapp-service';

export async function POST(request: NextRequest) {
  try {
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
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('custom_order_requests')
      .insert([
        {
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
      console.error('[v0] Supabase error:', error);
      throw error;
    }

    // Generate reference ID from database ID
    const referenceId = `CO-${data.id.slice(0, 8).toUpperCase()}`;

    // Send confirmation email to customer
    await sendCustomOrderConfirmation({
      customerName,
      customerEmail,
      customerPhone,
      occasion,
      budgetRange,
      description,
      preferredDeliveryDate,
      referenceId,
    });

    // Send admin notification
    await sendCustomOrderNotificationToAdmin({
      customerName,
      customerEmail,
      customerPhone,
      occasion,
      budgetRange,
      description,
      preferredDeliveryDate,
      referenceId,
    });

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
    console.log(`[v0] Admin WhatsApp Message for ${referenceId}:\n${adminWhatsAppMessage}`);

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
    console.error('[v0] API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to submit custom order request. Please try again or contact us via WhatsApp.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
