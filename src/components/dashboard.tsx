'use client';
import { useRouter } from 'next/navigation';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import HabitHeatmap from '@/components/heatmap';
import HabitHeatmapGrid from './habit-heatmap';
import { User, Moon, NotebookPen, ListCheck, Bell } from 'lucide-react';

interface DashboardProps {
  readonly userId: string;
}

export default function Dashboard({ userId }: DashboardProps) {
  const router = useRouter();

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-6xl mx-auto">
        {/* Daily Data Intake */}
        <Card className="p-5 bg-white/50 dark:bg-black/20 backdrop-blur-sm rounded-2xl border-none shadow-lg hover:shadow-xl transition-transform hover:scale-105">
          <div className="flex flex-col h-full">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-xl w-fit">
              <ListCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-medium mt-3">Daily Data</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Track your habits
            </p>
            <Button
              onClick={() => router.push('/daily-intake')}
              variant="ghost"
              className="mt-auto justify-start px-0 hover:bg-transparent hover:text-primary"
            >
              Enter today →
            </Button>
          </div>
        </Card>

        {/* Journal Entry */}
        <Card className="p-5 bg-white/50 dark:bg-black/20 backdrop-blur-sm rounded-2xl border-none shadow-lg hover:shadow-xl transition-transform hover:scale-105">
          <div className="flex flex-col h-full">
            <div className="p-3 bg-violet-100 dark:bg-violet-900/50 rounded-xl w-fit">
              <NotebookPen className="h-5 w-5 text-violet-600 dark:text-violet-400" />
            </div>
            <h3 className="text-lg font-medium mt-3">Journal</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Reflect on your day
            </p>
            <Button
              onClick={() => router.push('/journal')}
              variant="ghost"
              className="mt-auto justify-start px-0 hover:bg-transparent hover:text-primary"
            >
              Write entry →
            </Button>
          </div>
        </Card>

        {/* Sleep Tracker */}
        <Card className="p-5 bg-white/50 dark:bg-black/20 backdrop-blur-sm rounded-2xl border-none shadow-lg hover:shadow-xl transition-transform hover:scale-105">
          <div className="flex flex-col h-full">
            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl w-fit">
              <Moon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-lg font-medium mt-3">Sleep</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Track your rest
            </p>
            <Button
              onClick={() => router.push('/sleep-tracker')}
              variant="ghost"
              className="mt-auto justify-start px-0 hover:bg-transparent hover:text-primary"
            >
              Log sleep →
            </Button>
          </div>
        </Card>

        {/* Profile */}
        <Card className="p-5 bg-white/50 dark:bg-black/20 backdrop-blur-sm rounded-2xl border-none shadow-lg hover:shadow-xl transition-transform hover:scale-105">
          <div className="flex flex-col h-full">
            <div className="p-3 bg-sky-100 dark:bg-sky-900/50 rounded-xl w-fit">
              <User className="h-5 w-5 text-sky-600 dark:text-sky-400" />
            </div>
            <h3 className="text-lg font-medium mt-3">Profile</h3>
            <p className="text-sm text-muted-foreground mt-1">Your account</p>
            <Button
              onClick={() => router.push('/profile')}
              variant="ghost"
              className="mt-auto justify-start px-0 hover:bg-transparent hover:text-primary"
            >
              Settings →
            </Button>
          </div>
        </Card>
        {/* Reminders */}
        <Card className="p-5 bg-white/50 dark:bg-black/20 backdrop-blur-sm rounded-2xl border-none shadow-lg hover:shadow-xl transition-transform hover:scale-105">
          <div className="flex flex-col h-full">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-xl w-fit">
              <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-medium mt-3">Reminders</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Customize your reminders
            </p>
            <Button
              onClick={() => router.push('/reminders')}
              variant="ghost"
              className="mt-auto justify-start px-0 hover:bg-transparent hover:text-primary"
            >
              Settings →
            </Button>
          </div>
        </Card>
      </div>
      <HabitHeatmapGrid userId={userId} />
    </div>
  );
}
