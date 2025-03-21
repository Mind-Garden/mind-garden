import { redirect } from 'next/navigation';

import Footer from '@/components/footer';
import { Header } from '@/components/header';
import DeleteAccount from '@/components/profile/delete-account';
import ModifyAccount from '@/components/profile/modify-account-info';
import ModifyPassword from '@/components/profile/modify-password';
import { createClient } from '@/supabase/server';

export default async function ProfilePage() {
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
        <div className="max-w-2xl mx-auto space-y-8">
          <ModifyAccount profileData={profileData} userId={userId} />
          <ModifyPassword />
          <DeleteAccount userId={userId} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
