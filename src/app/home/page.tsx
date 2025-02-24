import { redirect } from 'next/navigation';
import { Bell } from 'lucide-react';
import { createClient } from '@/utils/supabase/server';
import { Particles } from '@/components/magicui/particles';
import { Button } from '@/components/ui/button';
import { ProfileDropdown } from '@/components/profile-dropdown';
import { JournalButton } from '@/components/journal-button';
import Footer from '@/components/footer'
import DataIntakeForm from "@/components/data-intake-form";
import {selectAllFromAttributes, selectAllFromCategories} from "@/utils/supabase/dbfunctions";
import { SleepTrackerButton } from '@/components/sleep-tracker-button'

export default async function Dashboard() {
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

  const categories = await selectAllFromCategories();
  const attributes = await selectAllFromAttributes();

  if (!categories || !attributes) {
    console.error('Failed to fetch categories or attributes.');
    redirect('/error');
  }

  if (profileError) {
    redirect('/error');
  }

  return (
    <div className="min-h-screen flex flex-col inset-0 z-0 bg-gradient animate-gradient">
      <Particles
        // Particles background
        className="absolute inset-0 z-0"
        quantity={200}
        ease={80}
        color={'#000000'}
        refresh
      />

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
            {/* Button to go into journal page */}
            <JournalButton />
            {/* Button to go into sleep tracker page */}
            <SleepTrackerButton />
            {/* Notifications for next sprint not currently implemented */}
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <ProfileDropdown />
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        <DataIntakeForm
          userId={userId}
          categories={categories}
          attributes={attributes}
        />
      </main>

      <Footer />
    </div>
  );
}
