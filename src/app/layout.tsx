import './globals.css';

import { ToastContainer } from 'react-toastify';

import ParticlesBackground from '@/components/ui/particles-background';
import { dosis, mulish, pacifico } from '@/lib/fonts';

export const metadata = {
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
    <html
      lang="en"
      className={`${pacifico.variable} ${dosis.variable} ${mulish.variable}`}
    >
      <body
        className={
          'antialiased min-h-screen flex flex-col inset-0 z-0 bg-gradient animate-gradient'
        }
      >
        {/* Particle Background */}
        <ParticlesBackground />

        {/* Content Wrapper */}
        <div className="flex-grow">
          {/* Children content goes here */}
          {children}
        </div>

        <ToastContainer position="top-right" autoClose={3000} />
      </body>
    </html>
  );
}
