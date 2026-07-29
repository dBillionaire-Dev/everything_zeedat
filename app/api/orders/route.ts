import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/service-role';
import { generateOrderReference } from '@/lib/order-reference';
import { sendOrderConfirmation, sendOrderNotificationToAdmin } from '@/lib/email-service';
import { generateCustomerOrderWhatsAppLink, generateAdminOrderWhatsAppMessage } from '@/lib/whatsapp-service';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

interface OrderItemInput {
  name: string;
  price: number;
  quantity: number;
  customization?: Record<string, string>;
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rateLimit = await checkRateLimit({ key: `orders:${ip}`, limit: 5, windowMinutes: 15 });
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many orders placed recently. Please try again in a few minutes, or reach out on WhatsApp.' },
        { status: 429 }
      );
    }

    const body = await request.json();

    const {
      customerName,
      phone,
      email,
      deliveryAddress,
      city,
      state,
      deliveryDate,
      notes,
      subtotal,
      deliveryFee,
      total,
      items,
    } = body as {
      customerName: string;
      phone: string;
      email?: string;
      deliveryAddress: string;
      city: string;
      state: string;
      deliveryDate: string;
      notes?: string;
      subtotal: number;
      deliveryFee: number;
      total: number;
      items: OrderItemInput[];
    };

    if (!customerName || !phone || !deliveryAddress || !city || !state || !deliveryDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    const supabase = createServiceRoleClient();
    const reference = generateOrderReference();

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([
        {
          reference,
          customer_name: customerName,
          phone,
          email: email || null,
          delivery_address: deliveryAddress,
          city,
          state,
          delivery_date: deliveryDate,
          notes: notes || null,
          subtotal,
          delivery_fee: deliveryFee,
          total,
          payment_method: 'WHATSAPP_MANUAL',
        },
      ])
      .select()
      .single();

    if (orderError) {
      console.error('[v0] Order insert error:', orderError);
      throw orderError;
    }

    const { error: itemsError } = await supabase.from('order_items').insert(
      items.map(item => ({
        order_id: order.id,
        product_id: null,
        name_snapshot: item.name,
        unit_price_snapshot: item.price,
        quantity: item.quantity,
        customization_details: item.customization || null,
      }))
    );

    if (itemsError) {
      console.error('[v0] Order items insert error:', itemsError);
      throw itemsError;
    }

    // Best-effort notifications — the order itself is already saved, so a
    // flaky email provider shouldn't fail the whole request.
    const emailData = {
      customerName,
      customerEmail: email,
      customerPhone: phone,
      reference,
      orderDate: order.created_at,
      items,
      subtotal,
      deliveryFee,
      total,
      deliveryAddress,
      city,
      state,
      deliveryDate,
      notes,
    };

    await Promise.allSettled([
      sendOrderConfirmation(emailData),
      sendOrderNotificationToAdmin(emailData),
    ]);

    const whatsappLink = generateCustomerOrderWhatsAppLink({
      customerName,
      customerPhone: phone,
      reference,
      items,
      total,
      deliveryDate,
    });

    console.log(
      `[v0] Admin WhatsApp message for ${reference}:\n${generateAdminOrderWhatsAppMessage({
        customerName,
        customerPhone: phone,
        reference,
        items,
        total,
        deliveryDate,
      })}`
    );

    return NextResponse.json({ success: true, reference, orderId: order.id, whatsappLink }, { status: 201 });
  } catch (error) {
    console.error('[v0] Orders API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to place order. Please try again or contact us via WhatsApp.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
