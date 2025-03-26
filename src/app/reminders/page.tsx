import { LoaderCircle } from 'lucide-react';
import React from 'react';

import { getAuthenticatedUserId } from '@/actions/auth';
import Footer from '@/components/layout/footer';
import { Header } from '@/components/layout/header';
import ReminderCard from '@/components/reminders/reminder-card';

export default async function RemindersPage() {
  const userId = await getAuthenticatedUserId();

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
