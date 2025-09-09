'use client'
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import { ExpediaWidgetManager } from "@/contexts/ExpediaWidgetManager";

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
          src="https://creator.expediagroup.com/products/widgets/assets/eg-widgets.js"
          strategy="afterInteractive"
          onLoad={() => {
            console.log('✅ Expedia script loaded');
          }}
          onError={(e) => {
            console.error('❌ Expedia script failed to load:', e);
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ExpediaWidgetManager>{children}</ExpediaWidgetManager>
      </body>
    </html>
  );
}
