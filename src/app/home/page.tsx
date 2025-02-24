import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import Footer from '@/components/footer';
import DataIntakeForm from '@/components/data-intake-form';
import {
  selectAllFromAttributes,
  selectAllFromCategories,
} from '@/utils/supabase/dbfunctions';
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
    <div className="min-h-screen flex flex-col">
      <Header />

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
