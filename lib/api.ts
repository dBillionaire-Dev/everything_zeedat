'use client'

import { createClient } from './supabase/client';
import { generateOrderReference } from './order-reference';

// Types
export interface CustomizationOption {
  id: string;
  label: string;
  type: 'text' | 'select';
  extraCost: number;
  choices?: string[]; // only used when type === 'select'
}

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
  customization_options: { options: CustomizationOption[] };
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
  image_snapshot: string | null;
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
  payment_status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  payment_method: 'PAYSTACK' | 'WHATSAPP_MANUAL';
  paystack_reference: string | null;
  refund_issued_at: string | null;
  created_at: string;
  updated_at: string;
  items?: Array<{ name: string; price: number; quantity: number; customization?: Record<string, string> }>;
}

export interface CustomOrderRequest {
  id: string;
  reference: string;
  customer_name: string;
  phone: string;
  email: string | null;
  occasion: string;
  budget_range: 'under-10k' | '10k-25k' | '25k-50k' | '50k-plus';
  description: string;
  delivery_address: string | null;
  city: string | null;
  state: string | null;
  reference_image_url: string | null;
  preferred_delivery_date: string | null;
  status: 'NEW' | 'REVIEWED' | 'QUOTED' | 'CONFIRMED' | 'PREPARING' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'DECLINED';
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface LegalPage {
  id: string;
  slug: 'privacy' | 'terms' | 'refund-policy';
  title: string;
  content: string;
  updated_at: string;
}

export interface Review {
  id: string;
  name: string;
  email: string;
  rating: number;
  review_text: string;
  is_visible: boolean;
  is_featured: boolean;
  created_at: string;
}

export interface SiteSettings {
  id: string;
  reviews_submission_enabled: boolean;
  default_delivery_fee: number;
  updated_at: string;
}

export interface DeliveryZone {
  id: string;
  state: string;
  fee: number;
  created_at: string;
  updated_at: string;
}

// Helper to generate order reference
// (defined in ./order-reference.ts — see that file for why it's not defined
// here directly, in a file marked 'use client')

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

    async getOne(id: string) {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Product;
    },

    async create(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('products')
        .insert([product])
        .select()
        .single();

      if (error) throw error;
      return data as Product;
    },

    async update(id: string, updates: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at'>>) {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('products')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Product;
    },

    async remove(id: string) {
      const supabase = createClient();
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
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
            image_snapshot: null,
            customization_details: item.customization || null,
          }))
        );
      }

      return data as Order;
    },

    async getByReference(reference: string, phone: string) {
      const supabase = createClient();
      // Public order-tracking goes through a security-definer RPC rather
      // than a direct table SELECT, since orders.select is admin-only under
      // RLS. The RPC also requires the phone number on the order to match,
      // so a reference number alone can no longer be used to pull up
      // someone else's name/address/phone. See scripts/002 and scripts/003.
      const { data, error } = await supabase
        .rpc('get_order_by_reference', { p_reference: reference, p_phone: phone })
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Order not found. Check your reference number and phone number.');
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

    async remove(orderId: string) {
      const supabase = createClient();
      // order_items has ON DELETE CASCADE on its order_id foreign key
      // (see scripts/001_create_schema.sql), so this removes the order's
      // line items automatically too.
      const { error } = await supabase.from('orders').delete().eq('id', orderId);
      if (error) throw error;
    },
  },

  customOrders: {
    async getByReference(reference: string, phone: string) {
      const supabase = createClient();
      const { data, error } = await supabase
        .rpc('get_custom_order_by_reference', { p_reference: reference, p_phone: phone })
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Request not found. Check your reference number and phone number.');
      return data as unknown as CustomOrderRequest;
    },

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

    async remove(id: string) {
      const supabase = createClient();
      const { error } = await supabase.from('custom_order_requests').delete().eq('id', id);
      if (error) throw error;
    },
  },

  legalPages: {
    async getBySlug(slug: 'privacy' | 'terms' | 'refund-policy') {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('legal_pages')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) throw error;
      return data as LegalPage;
    },

    async update(slug: 'privacy' | 'terms' | 'refund-policy', updates: { title: string; content: string }) {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('legal_pages')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('slug', slug)
        .select()
        .single();

      if (error) throw error;
      return data as LegalPage;
    },
  },

  reviews: {
    // Same query works for both the public homepage and the admin
    // dashboard -- RLS decides how much comes back based on who's asking
    // (see scripts/008_reviews.sql).
    async list() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Review[];
    },

    async create(review: { name: string; email: string; rating: number; review_text: string }) {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('reviews')
        .insert([review])
        .select()
        .single();

      if (error) throw error;
      return data as Review;
    },

    // Deliberately narrow: only ever toggles visibility/featured, never the
    // review content itself -- there's no "edit a review" feature by design.
    async setVisibility(id: string, is_visible: boolean) {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('reviews')
        .update({ is_visible })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Review;
    },

    async setFeatured(id: string, is_featured: boolean) {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('reviews')
        .update({ is_featured })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Review;
    },

    async remove(id: string) {
      const supabase = createClient();
      const { error } = await supabase.from('reviews').delete().eq('id', id);
      if (error) throw error;
    },
  },

  siteSettings: {
    async get() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .limit(1)
        .single();

      if (error) throw error;
      return data as SiteSettings;
    },

    async setReviewsSubmissionEnabled(id: string, enabled: boolean) {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('site_settings')
        .update({ reviews_submission_enabled: enabled, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as SiteSettings;
    },

    async setDefaultDeliveryFee(id: string, fee: number) {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('site_settings')
        .update({ default_delivery_fee: fee, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as SiteSettings;
    },
  },

  deliveryZones: {
    async list() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('delivery_zones')
        .select('*')
        .order('state', { ascending: true });

      if (error) throw error;
      return data as DeliveryZone[];
    },

    async create(zone: { state: string; fee: number }) {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('delivery_zones')
        .insert([zone])
        .select()
        .single();

      if (error) throw error;
      return data as DeliveryZone;
    },

    async update(id: string, updates: { state?: string; fee?: number }) {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('delivery_zones')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as DeliveryZone;
    },

    async remove(id: string) {
      const supabase = createClient();
      const { error } = await supabase.from('delivery_zones').delete().eq('id', id);
      if (error) throw error;
    },
  },
}
