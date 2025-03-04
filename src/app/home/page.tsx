import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import Footer from '@/components/footer';
import { Header } from '@/components/header';
import Dashboard from '@/components/dashboard';

export default async function Home() {
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
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2 opacity-50">
            Welcome to Mind Garden, {profileData?.first_name}!
          </h1>
          <p className="text-lg text-muted-foreground">
            Cultivate your daily habits and track your progress.
          </p>
        </div>
        <Dashboard />
      </main>

      <Footer />
    </div>
  );
}
