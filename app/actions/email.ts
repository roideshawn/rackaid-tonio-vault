"use server";

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendDispatchEmail(customerEmail: string, trackingNumber: string, template: string) {
  try {
    // 1. Inject the real tracking number into the Admin's custom template
    const personalizedMessage = template.replace('{TRACKING_NUMBER}', trackingNumber);

    // 2. Send the email via Resend
    const { data, error } = await resend.emails.send({
      from: 'Rackaid Tonio <onboarding@resend.dev>', // Resend's default testing domain
      
      // FOR DEMO MODE: Hardcoding your verified Resend email so the test successfully sends.
      // WHEN LIVE: Change this back to `to: [customerEmail]`
      to: ['roideshawn@gmail.com'], 
      
      subject: 'Your Vault Order has been Dispatched',
      html: `
        <div style="font-family: Helvetica, Arial, sans-serif; background-color: #050505; padding: 60px 20px; text-align: center;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #0a0a0a; border: 1px solid #333; padding: 40px; border-radius: 16px;">
            <h1 style="color: #D4AF37; text-transform: uppercase; letter-spacing: 4px; font-size: 24px; margin-bottom: 30px;">
              Rackaid Tonio
            </h1>
            <p style="color: #e4e4e7; font-size: 16px; line-height: 1.6; font-weight: 300;">
              ${personalizedMessage}
            </p>
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #333;">
              <p style="color: #71717a; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">
                Official Storefront Notification
              </p>
              <p style="color: #52525b; font-size: 10px; margin-top: 10px;">
                Demo Routing: Originally intended for ${customerEmail}
              </p>
            </div>
          </div>
        </div>
      `
    });

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error('Email failed to send:', error);
    return { success: false, error: error.message };
  }
}