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
import BarLineChart from '@/components/bar-line-chart';
import WaterChart from '@/components/water-chart';
import HabitHeatmap from '@/components/heatmap';
import HabitHeatmapGrid from '@/components/habit-heatmap';
import HealthDashboard from '@/components/health-dashboard';
import HabitLineCharts from '@/components/add-habit-charts';
import { motion } from 'framer-motion';
import MoodFlow from '@/components/mood-flow';

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

  const data = [
    { x: '2023-01-01', y: 100 },
    { x: '2023-02-01', y: 80 },
    { x: '2023-03-01', y: 150 },
    { x: '2023-04-01', y: 130 },
    { x: '2023-05-01', y: 180 },
    { x: '2023-06-01', y: 350 },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8 space-y-2">
          <h1 className="text-4xl font-bold tracking-tight font-title">
            Welcome back, {profileData?.first_name}
          </h1>
          <p className="pl-1 text-xl text-bold text-muted-foreground font-header font-semibold">
            Here's an overview of your wellness journey.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-12 small:grid-cols-1">
          {/* Left Column */}
          <div className="space-y-6 lg:col-span-4 small:col-span-1">
            {/* Quick Links */}
            <Card className="overflow-hidden border-none shadow-md">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950/20 dark:to-green-950/20 font-title">
                <CardTitle>Quick Links</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <Dashboard userId={userId} />
              </CardContent>
            </Card>

            {/* Habit Tracker Heatmap */}
            <Card className="overflow-hidden border-none shadow-md">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950/20 dark:to-green-950/20">
                <CardTitle className="font-title mb-1">
                  Daily Progress Heatmap
                </CardTitle>
                <CardDescription className="font-header text-md font-semibold">
                  Did you input your progress for today?
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <HabitHeatmap userId={userId} />
              </CardContent>
            </Card>

            {/* Habit Tracker Swiper */}
            <Card className="overflow-hidden border-none shadow-md">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950/20 dark:to-green-950/20 font-title">
                <div className="flex items-center justify-between">
                  <CardTitle>Habit Trackers</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <HabitHeatmapGrid userId={userId} />
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6 lg:col-span-8 small:col-span-1">
            {/* Mood Section */}
            <Card className="overflow-hidden border-none shadow-md">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950/20 dark:to-green-950/20">
                <CardTitle className="font-title">
                  Mood and Sleep Summaries
                </CardTitle>
                <CardDescription className="font-header text-md font-semibold">
                  Gain insights into your well-being
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <HealthDashboard userId={userId} />
              </CardContent>
            </Card>

            {/* Charts Section */}
            <Card className="overflow-hidden border-none shadow-md">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950/20 dark:to-green-950/20">
                <CardTitle className="font-title">Charts</CardTitle>
                <CardDescription className="font-header text-md font-semibold">
                  Activity and water intake tracking
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-8">
                <div>
                  <h3 className="text-lg font-body font-semibold mb-4">
                    Daily Activity
                  </h3>
                  <BarLineChart userId={userId} />
                </div>
                <div className="pt-4 border-t">
                  <h3 className="text-lg font-body font-semibold mb-4">
                    Water Intake History
                  </h3>
                  <WaterChart userId={userId} />
                </div>
                <div className="pt-4 border-t">
                  <h3 className="text-lg font-medium mb-4">
                    Habit Tracker Line Charts
                  </h3>
                  <HabitLineCharts userId={userId} />
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
