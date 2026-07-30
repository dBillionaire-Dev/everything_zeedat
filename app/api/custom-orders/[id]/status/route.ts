import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceRoleClient } from '@/lib/supabase/service-role';
import { sendCustomOrderStatusUpdate } from '@/lib/email-service';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Same admin gate as app/api/orders/[id]/status/route.ts -- see that
    // file for why the auth check and the write use two different clients.
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
    const { status, admin_notes } = body as { status?: string; admin_notes?: string };

    if (!status && admin_notes === undefined) {
      return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
    }

    const supabase = createServiceRoleClient();

    const updates: Record<string, string> = { updated_at: new Date().toISOString() };
    if (status) updates.status = status;
    if (admin_notes !== undefined) updates.admin_notes = admin_notes;

    const { data: customOrder, error } = await supabase
      .from('custom_order_requests')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Only notify on an actual status change, not on a plain notes edit --
    // admins jot down internal notes far more often than they change status,
    // and those aren't customer-facing.
    if (status && customOrder.email) {
      sendCustomOrderStatusUpdate({
        customerName: customOrder.customer_name,
        customerEmail: customOrder.email,
        referenceId: `CO-${customOrder.id.slice(0, 8).toUpperCase()}`,
        status: customOrder.status,
      }).catch(err => console.error('Custom order status email failed (non-fatal):', err));
    }

    return NextResponse.json({ success: true, customOrder });
  } catch (error) {
    console.error('Custom order status update error:', error);
    return NextResponse.json(
      { error: 'Failed to update request', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
