import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    console.error(`Webhook signature verification failed: ${error.message}`);
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const cartItems = JSON.parse(session.metadata?.cart_data || '[]');
    
    try {
      const { data: order, error: orderError } = await supabaseAdmin
        .from('orders')
        .insert([{
          customer_email: session.customer_details?.email,
          customer_name: session.customer_details?.name,
          total_amount: (session.amount_total || 0) / 100, 
          stripe_session_id: session.id,
          payment_status: 'paid',
          shipping_address: session.shipping_details?.address,
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItemsToInsert = cartItems.map((item: any) => ({
        order_id: order.id,
        product_id: item.id,
        product_name: item.name,
        quantity: item.quantity,
        price_at_time: item.price,
      }));

      const { error: itemsError } = await supabaseAdmin
        .from('order_items')
        .insert(orderItemsToInsert);

      if (itemsError) throw itemsError;

      console.log(`Order ${order.id} successfully recorded in the ledger.`);

    } catch (err: any) {
      console.error('Error writing order to Supabase:', err);
      return new NextResponse('Error writing to database', { status: 500 });
    }
  }

  return new NextResponse('Webhook Received', { status: 200 });
}