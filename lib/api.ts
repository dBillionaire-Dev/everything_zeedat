'use client'

import { createClient } from './supabase/client';

// Types
export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  category: 'hampers' | 'gift-boxes' | 'occasion-gifts' | 'accessories';
  occasion_tags: string[];
  images: string[];
  is_customizable: boolean;
  customization_options: Record<string, any>;
  stock_status: 'in-stock' | 'low-stock' | 'out-of-stock';
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  name_snapshot: string;
  unit_price_snapshot: number;
  quantity: number;
  customization_details: Record<string, any> | null;
  created_at: string;
}

export interface Order {
  id: string;
  reference: string;
  customer_name: string;
  phone: string;
  email: string | null;
  delivery_address: string;
  city: string;
  state: string;
  delivery_date: string;
  notes: string | null;
  subtotal: number;
  delivery_fee: number;
  total: number;
  status: 'RECEIVED' | 'CONFIRMED' | 'PREPARING' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
  payment_status: 'PENDING' | 'PAID' | 'FAILED';
  payment_method: 'PAYSTACK' | 'WHATSAPP_MANUAL';
  paystack_reference: string | null;
  created_at: string;
  updated_at: string;
  items?: Array<{ name: string; price: number; quantity: number; customization?: Record<string, string> }>;
}

export interface CustomOrderRequest {
  id: string;
  customer_name: string;
  phone: string;
  email: string | null;
  occasion: string;
  budget_range: 'under-10k' | '10k-25k' | '25k-50k' | '50k-plus';
  description: string;
  reference_image_url: string | null;
  preferred_delivery_date: string | null;
  status: 'NEW' | 'REVIEWED' | 'QUOTED' | 'CONFIRMED' | 'DECLINED';
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

// Helper to generate order reference
function generateOrderReference(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

// API namespace object for client-side usage
export const api = {
  products: {
    async list(options?: { category?: string; featured?: boolean }) {
      const supabase = createClient();
      let query = supabase.from('products').select('*');

      if (options?.category) {
        query = query.eq('category', options.category);
      }

      if (options?.featured) {
        query = query.eq('is_featured', true);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Product[];
    },

    async getBySlug(slug: string) {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) throw error;
      return data as Product;
    },

    async getById(ids: string[]) {
      if (!ids.length) return [];
      const supabase = createClient();
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .in('id', ids);

      if (error) throw error;
      return data as Product[];
    },
  },

  orders: {
    async create(order: Omit<Order, 'id' | 'reference' | 'created_at' | 'updated_at'>) {
      const supabase = createClient();
      const reference = generateOrderReference();

      const { data, error } = await supabase
        .from('orders')
        .insert([{ ...order, reference }])
        .select()
        .single();

      if (error) throw error;

      // Create order items
      if (order.items && order.items.length > 0) {
        await this.createItems(
          data.id,
          order.items.map(item => ({
            order_id: data.id,
            product_id: null,
            name_snapshot: item.name,
            unit_price_snapshot: item.price,
            quantity: item.quantity,
            customization_details: item.customization || null,
          }))
        );
      }

      return data as Order;
    },

    async getByReference(reference: string) {
      const supabase = createClient();
      // Public order-tracking now goes through a security-definer RPC rather
      // than a direct table SELECT, since orders.select is admin-only under
      // RLS. See scripts/002_admin_auth_and_security.sql.
      const { data, error } = await supabase
        .rpc('get_order_by_reference', { p_reference: reference })
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Order not found');
      return data as unknown as Order;
    },

    async list() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Order[];
    },

    async updateStatus(orderId: string, status: Order['status']) {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw error;
      return data as Order;
    },

    async createItems(orderId: string, items: Omit<OrderItem, 'id' | 'created_at'>[]) {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('order_items')
        .insert(items.map(item => ({ ...item, order_id: orderId })))
        .select();

      if (error) throw error;
      return data as OrderItem[];
    },

    async getItems(orderId: string) {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);

      if (error) throw error;
      return data as OrderItem[];
    },
  },

  customOrders: {
    async create(
      request: Omit<CustomOrderRequest, 'id' | 'created_at' | 'updated_at' | 'status' | 'admin_notes'>
    ) {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('custom_order_requests')
        .insert([request])
        .select()
        .single();

      if (error) throw error;
      return data as CustomOrderRequest;
    },

    async list() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('custom_order_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as CustomOrderRequest[];
    },

    async update(
      id: string,
      updates: Partial<Pick<CustomOrderRequest, 'status' | 'admin_notes'>>
    ) {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('custom_order_requests')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as CustomOrderRequest;
    },
  },
}
