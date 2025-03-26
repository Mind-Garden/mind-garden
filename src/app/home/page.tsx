import { redirect } from 'next/navigation';

import { getAuthenticatedUserId } from '@/actions/auth';
import HabitLineCharts from '@/components/data-visualization/add-habit-charts';
import BarLineChart from '@/components/data-visualization/bar-line-chart';
import HealthDashboard from '@/components/data-visualization/health-dashboard';
import WaterChart from '@/components/data-visualization/water-chart';
import Heatmap from '@/components/heatmap';
import Footer from '@/components/layout/footer';
import { Header } from '@/components/layout/header';
import QuickLinks from '@/components/quick-links';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { createClient } from '@/supabase/server';

export default async function Home() {
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
      <main className="flex-1 container mx-auto px-4 py-8 w-full">
        <div className="mb-8 space-y-2 text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight font-title">
            Welcome back, {profileData?.first_name}
          </h1>
          <p className="pl-1 text-xl text-bold text-muted-foreground font-header font-semibold">
            Here's an overview of your wellness journey.
          </p>
        </div>

        <div className="grid gap-6 grid-cols-1 md:grid-cols-12">
          {/* Left Column */}
          <div className="space-y-6 md:col-span-4">
            {/* Quick Links */}
            <Card className="overflow-hidden border-none shadow-md">
              <CardHeader className="bg-gradient-to-r from-emerald-50 via-teal-50 to-violet-50 font-title">
                <CardTitle>Quick Links</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <QuickLinks />
              </CardContent>
            </Card>

            {/* Habit Tracker Heatmap */}
            <Card className="overflow-hidden border-none shadow-md">
              <CardHeader className="bg-gradient-to-r from-emerald-50 via-teal-50 to-violet-50">
                <CardTitle className="font-title mb-1">
                  Daily Progress Heatmap
                </CardTitle>
                <CardDescription className="font-header text-md font-semibold">
                  Did you input your progress for today?
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <Heatmap personalized={false} userId={userId} />
              </CardContent>
            </Card>

            {/* Habit Tracker Swiper */}
            <Card className="overflow-hidden border-none shadow-md">
              <CardHeader className="bg-gradient-to-r from-emerald-50 via-teal-50 to-violet-50 font-title">
                <div className="flex items-center justify-between">
                  <CardTitle>Habit Trackers</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <Heatmap personalized={true} userId={userId} />
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6 md:col-span-8">
            {/* Mood Section */}
            <Card className="overflow-hidden border-none shadow-md">
              <CardHeader className="bg-gradient-to-r from-emerald-50 via-teal-50 to-violet-50">
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
              <CardHeader className="bg-gradient-to-r from-emerald-50 via-teal-50 to-violet-50">
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
                    Habit Tracker Line Charts
                  </h3>
                  <HabitLineCharts userId={userId} />
                </div>
                <div className="pt-4 border-t">
                  <h3 className="text-lg font-body font-semibold mb-4">
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
