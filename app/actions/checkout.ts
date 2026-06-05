"use server";

import Stripe from 'stripe';
import { headers } from 'next/headers';

// Initialize Stripe without locking the apiVersion
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function createCheckoutSession(cartItems: any[]) {
  try {
    const headersList = await headers();
    const origin = headersList.get('origin') || 'http://localhost:3000';

    const lineItems = cartItems.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          images: item.image_url ? [item.image_url] : [],
          metadata: {
            productId: item.id,
          }
        },
        unit_amount: Math.round(item.price * 100), 
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB'], 
      },
      line_items: lineItems,
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/shop`,
      metadata: {
        cart_data: JSON.stringify(cartItems.map(i => ({ id: i.id, name: i.name, quantity: i.quantity, price: i.price }))),
      }
    });

    return { url: session.url };
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    throw new Error(error.message);
  }
}