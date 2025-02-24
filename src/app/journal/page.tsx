// Core Imports
import { redirect } from 'next/navigation';

// Utility
import { createClient } from '@/utils/supabase/server';

// UI
import { JournalEntryCard } from '@/components/journal-entry';
import Footer from '@/components/footer';
import { JournalSwipe } from '@/components/journal-swipe';
import { Header } from '@/components/header';

export default async function JournalPage() {
  const supabase = await createClient();

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData?.user) {
    redirect('/error');
  }

  const userId = authData.user.id;
  const { data: profileData, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (profileError) {
    redirect('/error');
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <JournalEntryCard userId={userId} />
        <div className="mb-8">
          {/* Journal Entries */}
          <JournalSwipe userId={userId} />
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
