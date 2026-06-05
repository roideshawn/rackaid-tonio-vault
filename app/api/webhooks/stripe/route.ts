import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-04-22.dahlia',
});

// We must use the SERVICE_ROLE_KEY to bypass RLS since webhooks come from an unauthenticated Stripe server
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (error: any) {
    console.error(`Webhook Error: ${error.message}`);
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    // Decode the cart items we packed into the metadata earlier
    const cartPayload = JSON.parse(session.metadata?.cart_payload || '[]');
    
    // 1. Insert the Master Order
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        stripe_session_id: session.id,
        customer_email: session.customer_details?.email || 'Unknown',
        total_amount: (session.amount_total || 0) / 100,
        status: 'processing',
        shipping_address: session.shipping_details?.address || {},
      })
      .select()
      .single();

    if (orderError || !order) {
      console.error('Failed to insert order:', orderError);
      return new NextResponse('Database Error', { status: 500 });
    }

    // 2. Insert individual line items mapped to the products table
    const orderItemsData = cartPayload.map((item: any) => ({
      order_id: order.id,
      product_id: item.id,
      quantity: item.q,
      price_at_time: item.p,
    }));

    const { error: itemsError } = await supabaseAdmin.from('order_items').insert(orderItemsData);
    
    if (itemsError) {
      console.error('Failed to insert order items:', itemsError);
      return new NextResponse('Database Error on Items', { status: 500 });
    }
    
    // Future expansion: Deduct from inventory stock here
  }

  return new NextResponse('Webhook Received', { status: 200 });
}