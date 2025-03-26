import { getAuthenticatedUserId } from '@/actions/auth';
import { SleepEntryCard } from '@/components/data-intake/sleep-entry';
import Footer from '@/components/layout/footer';
import { Header } from '@/components/layout/header';

export default async function SleepTrackerPage() {
  const userId = await getAuthenticatedUserId();

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
