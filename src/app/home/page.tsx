import { redirect } from 'next/navigation';
import { createClient } from '@/supabase/server';
import Footer from '@/components/footer';
import { Header } from '@/components/header';
import Dashboard from '@/components/dashboard';
import MoodFlow from '@/components/mood-flow';
import MoodBar from '@/components/mood-bar';
import SleepChart from '@/components/sleep-chart';
import BarLineChart from '@/components/bar-line-chart';
import WaterChart from '@/components/water-chart';
import AIResponse from '@/components/ai-response';
import HabitHeatmap from '@/components/heatmap';

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

        {/* Content */}
        {/* Dashboard */}

        <div className="mb-8">
          <Dashboard userId={userId} />
        </div>

        {/* MoodFlow */}
        <div className="mb-8">
          <MoodFlow userId={userId} />
        </div>
        {/* MoodBar */}
        <div>
          <MoodBar userId={userId} />
          <AIResponse userId={userId} type="mood" title="Mood Summary" />
        </div>
        <div className="mb-8">
          <HabitHeatmap userId={userId} />
        </div>
        <div className="mb-8">
          <AIResponse userId={userId} type="sleep" title="Sleep Summary" />
        </div>
        <div className="mb-8">
          <SleepChart userId={userId} />
        </div>
        <div className="pt-10 pb-10">
          <BarLineChart userId={userId} />
        </div>
        <div className="pt-10 pb-10">
          <WaterChart userId={userId} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
