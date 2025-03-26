import { redirect } from 'next/navigation';

import { getAuthenticatedUserId } from '@/actions/auth';
import Footer from '@/components/layout/footer';
import { Header } from '@/components/layout/header';
import DeleteAccount from '@/components/profile/delete-account';
import ModifyAccount from '@/components/profile/modify-account-info';
import ModifyPassword from '@/components/profile/modify-password';
import { createClient } from '@/supabase/server';

export default async function ProfilePage() {
  const userId = await getAuthenticatedUserId();
  const supabase = await createClient();

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
