import 'react-toastify/dist/ReactToastify.css';
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

        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={true}
          closeOnClick
          pauseOnFocusLoss
          draggable={false}
          pauseOnHover
          className="w-auto max-w-[350px] text-sm py-3 px-2 !font-body"
          toastClassName="bg-white/70 backdrop-blur-md border border-gray-300 shadow-md rounded-xl text-sm text-gray-800 overflow-hidden mb-4"
          progressClassName="Toastify__progress-bar--animated h-1 w-full absolute bottom-0 rounded-b-full"
        />
      </body>
    </html>
  );
}
