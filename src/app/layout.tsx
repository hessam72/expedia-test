'use client'
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script
          id="expedia-widgets"
          src="https://affiliates.expediagroup.com/products/widgets/assets/eg-widgets.js"
          strategy="afterInteractive"
          onLoad={() => {
            console.log('✅ Expedia script loaded');
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new Event('expediaScriptLoaded'));
            }
          }}
          onError={(e) => {
            console.error('❌ Expedia script failed to load:', e);
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
