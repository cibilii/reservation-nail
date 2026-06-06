import "./globals.css";
import FloatingCallButton from "./components/FloatingCallButton";
import Particles from "./components/Particles";
import ThemeToggle from "./components/ThemeToggle";
import { Toaster } from "sonner";

// app/layout.js

export const metadata = {
  title: 'سالن زیبایی نیل | رزرو آنلاین ناخن و مو',
  description: 'بهترین خدمات ناخن و مو با رزرو آنلاین آسان و سریع',
  keywords: ['سالن زیبایی', 'رزرو آنلاین', 'ناخن', 'مو'],
  authors: [{ name: 'سالن زیبایی نیل' }],
  openGraph: {
    title: 'سالن زیبایی نیل | رزرو آنلاین ناخن و مو',
    description: 'رزرو آنلاین خدمات ناخن و مو',
    type: 'website',
    locale: 'fa_IR',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1.0,
  themeColor: '#8b5cf6',
};

export default function RootLayout({ children }) {
  return (
    <html lang="fa" dir="rtl" className="dark">
      <head>
        {/* Preload فونت محلی – بدون event handler */}
        <link
          rel="preload"
          href="/fonts/Vazirmatn[wght].woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        
        <meta name="color-scheme" content="dark light" />
      </head>
      <body className="min-h-screen font-sans antialiased transition-colors duration-500"
        style={{ fontFamily: "'Vazirmatn', 'Tahoma', sans-serif" }}>
        <Particles />
        <div className="relative z-10 flex flex-col min-h-screen">
          <main className="flex-1">{children}</main>
          <footer className="relative z-10 py-6 text-center text-sm opacity-40">
            <div className="glass-card inline-block px-6 py-3">
              © {new Date().getFullYear()} سالن زیبایی نیل | تمامی حقوق محفوظ است
            </div>
          </footer>
        </div>
        <FloatingCallButton />
        <ThemeToggle />
        <Toaster
          position="top-center"
          richColors
          toastOptions={{
            style: {
              fontFamily: 'Vazirmatn, Tahoma, sans-serif',
              background: 'var(--glass-bg)',
              backdropFilter: 'blur(20px)',
              border: '1px solid var(--glass-border)',
              color: 'var(--text-primary)',
            },
          }}
        />
      </body>
    </html>
  );
}