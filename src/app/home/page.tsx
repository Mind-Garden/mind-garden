import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import Footer from '@/components/footer';
import { Header } from '@/components/header';

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

  if (profileError) {
    redirect('/error');
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        Welcome to Mind Garden, {profileData?.first_name}!
      </main>

      <Footer />
    </div>
  );
}
