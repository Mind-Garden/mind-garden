import { getAuthenticatedUserId } from '@/actions/auth';
import Journal from '@/components/journal/journal';
import Footer from '@/components/layout/footer';
import { Header } from '@/components/layout/header';

export default async function JournalPage() {
  const userId = await getAuthenticatedUserId();

  return (
    <div className="min-h-screen flex flex-col font-body">
      <Header />

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <Journal userId={userId} />
      </main>

      <Footer />
    </div>
  );
}
