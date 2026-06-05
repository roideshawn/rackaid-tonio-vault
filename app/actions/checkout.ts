'use server';

import Stripe from 'stripe';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-04-22.dahlia',   // ← Current latest
});

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url: string;
}

export async function createCheckoutSession(cartItems: CartItem[]) {
  try {
    const lineItems = cartItems.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          images: item.image_url ? [item.image_url] : [],
        },
        unit_amount: Math.round(item.price * 100), // Stripe expects cents
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/shop`,
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB'],
      },
      // We embed the cart payload here to decode it inside the webhook
      metadata: {
        cart_payload: JSON.stringify(cartItems.map(i => ({ id: i.id, q: i.quantity, p: i.price }))),
      }
    });

    return { success: true, url: session.url };
  } catch (error: any) {
    console.error('Stripe Checkout Error:', error);
    return { success: false, error: error.message };
  }
}