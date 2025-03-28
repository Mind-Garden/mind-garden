import { redirect } from 'next/navigation';

import { getAuthenticatedUserId } from '@/actions/auth';
import Footer from '@/components/layout/footer';
import { Header } from '@/components/layout/header';
import TaskManager from '@/components/tasks/task-manager';
import { createClient } from '@/supabase/server';

export default async function TaskManagerPage() {
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
    <div className="min-h-screen flex flex-col font-body">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <TaskManager userId={userId} firstName={profileData?.first_name} />
      </main>

      <Footer />
    </div>
  );
}
