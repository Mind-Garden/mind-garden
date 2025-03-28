import { redirect } from 'next/navigation';

import { getAuthenticatedUserId } from '@/actions/auth';
import {
  getPersonalizedCategories,
  selectAllFromAttributes,
  selectAllFromCategories,
} from '@/actions/data-intake';
import DataIntakeForm from '@/components/data-intake/data-intake-form';
import Footer from '@/components/layout/footer';
import { Header } from '@/components/layout/header';

export default async function DailyHabitsPage() {
  const userId = await getAuthenticatedUserId();

  const categories = await selectAllFromCategories();
  const personalizedCategories = await getPersonalizedCategories();
  const attributes = await selectAllFromAttributes();

  if (!categories || !attributes || !personalizedCategories) {
    console.error('Failed to fetch categories or attributes.');
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
