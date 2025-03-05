import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ToastContainer } from 'react-toastify';
import { Particles } from '@/components/magicui/particles';
import {dosis, mulish, pacifico} from "@/lib/fonts";

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Mind Garden',
  description:
    'Our mission is to cultivate a space where personal growth and mindfulness flourish through intuitive, data-driven tools',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${pacifico.variable} ${dosis.variable} ${mulish.variable}`}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col inset-0 z-0 bg-gradient animate-gradient`}
      >
        {/* Particles Background */}
        <Particles
          className="absolute inset-0 z-0"
          quantity={200}
          ease={80}
          color={'#000000'}
          refresh
        />
        {/* Toast (Notification) position */}
        {children}
        <ToastContainer position="top-right" autoClose={3000} />
      </body>
    </html>
  );
}
