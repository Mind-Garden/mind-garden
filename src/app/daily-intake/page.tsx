import { redirect } from 'next/navigation';

import {
  getPersonalizedCategories,
  selectAllFromAttributes,
  selectAllFromCategories,
} from '@/actions/data-intake';
import DataIntakeForm from '@/components/data-intake/data-intake-form';
import Footer from '@/components/footer';
import { Header } from '@/components/header';
import { createClient } from '@/supabase/server';

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
  const personalizedCategories = await getPersonalizedCategories();
  const attributes = await selectAllFromAttributes();

  if (!categories || !attributes || !personalizedCategories) {
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
          personalizedCategories={personalizedCategories}
        />
      </main>

      <Footer />
    </div>
  );
}
