import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // We will control this switch from Vercel
  const isMaintenance = process.env.MAINTENANCE_MODE === 'true';

  // We want to lock down the site, BUT keep the Admin portal, images, and APIs open so you can work!
  const isProtectedPath = !request.nextUrl.pathname.startsWith('/admin') &&
                          !request.nextUrl.pathname.startsWith('/api') &&
                          !request.nextUrl.pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|ico)$/) &&
                          !request.nextUrl.pathname.startsWith('/_next');

  if (isMaintenance && isProtectedPath) {
    // Return a stylish, hardcoded maintenance screen directly from the server
    return new NextResponse(
      `<!DOCTYPE html>
      <html lang="en">
        <body style="background: black; color: white; display: flex; align-items: center; justify-content: center; height: 100vh; font-family: monospace; text-align: center; flex-direction: column;">
          <h1 style="color: #dc2626; letter-spacing: 0.2em; text-transform: uppercase; font-size: 2.5rem; margin: 0;">Vault Closed</h1>
          <p style="color: #a1a1aa; margin-top: 1rem; font-size: 1.2rem;">We are upgrading the storefront infrastructure.<br/>Check back soon.</p>
        </body>
      </html>`,
      { status: 503, headers: { 'content-type': 'text/html' } }
    );
  }

  return NextResponse.next();
}