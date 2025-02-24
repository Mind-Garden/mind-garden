// Core Imports
import { redirect } from 'next/navigation';

// Third-Party
import { Bell } from 'lucide-react';

// Utility
import { createClient } from '@/utils/supabase/server';

// UI
import { Particles } from '@/components/magicui/particles';
import { Button } from '@/components/ui/button';
import { ProfileDropdown } from '@/components/profile-dropdown';
import { JournalButton } from '@/components/journal-button';
import { JournalEntryCard } from '@/components/journal-entry';
import Footer from '@/components/footer';
import { JournalSwipe } from "@/components/journal-swipe";
import { SleepTrackerButton } from '@/components/sleep-tracker-button';


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
      {/* Header */}
      <header className="border-b bg-white/50 backdrop-blur-sm mt-4 mx-4 rounded-full">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <img
              src="/logo.png"
              alt="Mind Garden Logo"
              className="h-7 w-7 mr-2"
            />
            <p className="text-2xl font-semibold text-green-700">Mind Garden</p>
          </div>
          <div className="flex items-center gap-4">
            {/* Journal Button */}
            <JournalButton />
            <SleepTrackerButton />
            {/* Notifications */}
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            {/* Profile Dropdown */}
            <ProfileDropdown />
          </div>
        </div>
      </header>

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
