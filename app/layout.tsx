import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import Cart from "./components/Cart";
import AudioPlayer from "./components/AudioPlayer";
import SiteBackground from "./components/SiteBackground";
import StatusBanner from "./components/StatusBanner";
import { CartProvider } from "./context/CartContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Rackaid Tonio | Official Vault",
  description: "Exclusive luxury drops and signature collections.",
};

// Ensures the mobile browser tab matches the dark aesthetic
export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-black text-white min-h-screen flex flex-col overflow-x-hidden`}>
        <CartProvider>
          {/* Global Background Layer (Supabase Image + Shuffling Logos) */}
          <SiteBackground />
          
          {/* Global UI Elements */}
          <StatusBanner />
          <Navbar />
          <AudioPlayer />
          
          {/* Main Page Content */}
          {/* pt-24 accounts for the space taken by the fixed StatusBanner & Navbar */}
          <main className="flex-1 flex flex-col pt-24 relative z-10">
            {children}
          </main>
          
          {/* Global Slide-out Cart */}
          <Cart />
        </CartProvider>
      </body>
    </html>
  );
}