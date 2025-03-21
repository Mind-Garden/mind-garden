import { redirect } from 'next/navigation';
import { createClient } from '@/supabase/server';
import Footer from '@/components/footer';
import { SleepEntryCard } from '@/components/sleep-entry';
import { Header } from '@/components/header';

export default async function SleepTrackerPage() {
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

  if (profileError || !profileData) {
    redirect('/error');
  }

  return (
    <div className="min-h-screen flex flex-col font-body">
      <Header />

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-8">
          <SleepEntryCard userId={userId} />
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
