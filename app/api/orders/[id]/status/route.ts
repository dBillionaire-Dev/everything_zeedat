import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceRoleClient } from '@/lib/supabase/service-role';
import { sendOrderStatusUpdate } from '@/lib/email-service';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Gate access: only an authenticated admin (per the admin_users
    // allowlist) may call this route. We use the regular cookie-based
    // server client here specifically because it carries the caller's
    // session -- the service-role client below has no concept of "who is
    // calling," so the auth check has to happen against this one first.
    const authClient = await createClient();
    const {
      data: { user },
    } = await authClient.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { data: adminRow } = await authClient
      .from('admin_users')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();

    if (!adminRow) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const body = await request.json();
    const { status, payment_status } = body as {
      status?: string;
      payment_status?: string;
    };

    if (!status && !payment_status) {
      return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
    }

    // Perform the actual write with the service-role client, same reasoning
    // as the guest-checkout routes: this code path has already validated
    // who's calling, so there's no need to also fight RLS here.
    const supabase = createServiceRoleClient();

    const updates: Record<string, string> = { updated_at: new Date().toISOString() };
    if (status) updates.status = status;
    if (payment_status) updates.payment_status = payment_status;

    const { data: order, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Best-effort notification -- the update itself already succeeded.
    if (order.email) {
      sendOrderStatusUpdate({
        customerName: order.customer_name,
        customerEmail: order.email,
        reference: order.reference,
        status: order.status,
        paymentStatus: order.payment_status,
        paymentJustConfirmed: Boolean(payment_status === 'PAID'),
      }).catch(err => console.error('[v0] Order status email failed (non-fatal):', err));
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error('[v0] Order status update error:', error);
    return NextResponse.json(
      { error: 'Failed to update order', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
