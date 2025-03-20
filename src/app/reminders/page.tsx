import React from 'react';
import { Header } from '@/components/header';
import Footer from '@/components/footer';
import ReminderCard from '@/components/reminder-card';
import { LoaderCircle } from 'lucide-react';
import { createClient } from '@/supabase/server';
import { redirect } from 'next/navigation';

export default async function RemindersPage() {
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData?.user) {
    redirect('/error');
  }

  const userId = authData.user.id;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-8">
          {userId ? (
            <ReminderCard userId={userId} />
          ) : (
            <LoaderCircle className="justify-center h-10 w-10 animate-spin" />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
