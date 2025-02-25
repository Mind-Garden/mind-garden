'use client';

import { redirect } from 'next/navigation';
import { Particles } from '@/components/magicui/particles';
import Footer from '@/components/footer';
import ResetPassword from '@/components/reset-password';
import { toast } from 'react-toastify';
import { useEffect, useState } from 'react';
import { authenticateResetCode } from '@/actions/auth';

export default function ResetPasswordPage() {
  const [session, setSession] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
      const fetchSession = async () => {
        const { data, error } = await authenticateResetCode(code);

        if (error) {
          setError(error);
          setSession(null);
          toast('Failed to authenticate with reset code.');
          redirect('/');
        } else {
          setSession(data);
        }
      };

      fetchSession();
    }
  }, []);

  if (error) {
    redirect('/error');
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Particles
        className="absolute inset-0 z-0"
        quantity={200}
        ease={80}
        color={'#000000'}
        refresh
      />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-8">
          {session ? <ResetPassword session={session} /> : null}
        </div>
      </main>
      <Footer />
    </div>
  );
}
