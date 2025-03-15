import { redirect } from 'next/navigation';
import { createClient } from '@/supabase/server';
import Footer from '@/components/footer';
import { Header } from '@/components/header';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Dashboard from '@/components/dashboard';
import MoodFlow from '@/components/mood-flow';
import MoodBar from '@/components/mood-bar';
import SleepChart from '@/components/sleep-chart';
import BarLineChart from '@/components/bar-line-chart';
import WaterChart from '@/components/water-chart';
import AIResponse from '@/components/ai-response';
import HabitHeatmap from '@/components/heatmap';
import { MoveRight } from 'lucide-react';
import HabitHeatmapGrid from '@/components/habit-heatmap';

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
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8 space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">
            Welcome back, {profileData?.first_name}
          </h1>
          <p className="text-lg text-muted-foreground">
            Here's an overview of your wellness journey.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          {/* Left Column */}
          <div className="space-y-6 lg:col-span-5">
            {/* Today's Overview */}
            <Card className="overflow-hidden border-none shadow-md">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950/20 dark:to-green-950/20">
                <CardTitle>Today's Overview</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <Dashboard userId={userId} />
              </CardContent>
            </Card>

            {/* Habit Tracker Heatmap */}
            <Card className="overflow-hidden border-none shadow-md">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950/20 dark:to-green-950/20">
                <CardTitle>Habit Tracker</CardTitle>
                <CardDescription>Your daily progress</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <HabitHeatmap userId={userId} />
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6 lg:col-span-7">
            {/* Habit Tracker Swiper */}
            <Card className="overflow-hidden border-none shadow-md">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950/20 dark:to-green-950/20">
                <div className="flex items-center justify-between">
                  <CardTitle>Habit Trackers</CardTitle>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <span>Swipe for more</span>
                    <MoveRight className="ml-1 h-4 w-4" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <HabitHeatmapGrid userId={userId} />
              </CardContent>
            </Card>

            {/* Mood Section */}
            <Card className="overflow-hidden border-none shadow-md">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950/20 dark:to-green-950/20">
                <CardTitle>Mood Analysis</CardTitle>
                <CardDescription>Track your emotional patterns</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="md:col-span-1">
                    <MoodFlow userId={userId} />
                  </div>
                  <div className="md:col-span-1">
                    <MoodBar userId={userId} />
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <AIResponse
                    userId={userId}
                    type="mood"
                    title="Mood Summary"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Sleep Section */}
            <Card className="overflow-hidden border-none shadow-md">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950/20 dark:to-green-950/20">
                <CardTitle>Sleep Analysis</CardTitle>
                <CardDescription>
                  Your sleep patterns and insights
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <SleepChart userId={userId} />
                <div className="pt-4 border-t">
                  <AIResponse
                    userId={userId}
                    type="sleep"
                    title="Sleep Summary"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Charts Section */}
            <Card className="overflow-hidden border-none shadow-md">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950/20 dark:to-green-950/20">
                <CardTitle>Charts</CardTitle>
                <CardDescription>
                  Activity and water intake tracking
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-8">
                <div>
                  <h3 className="text-lg font-medium mb-4">Daily Activity</h3>
                  <BarLineChart userId={userId} />
                </div>
                <div className="pt-4 border-t">
                  <h3 className="text-lg font-medium mb-4">
                    Water Intake History
                  </h3>
                  <WaterChart userId={userId} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
