'use client';
import {
  Bell,
  ListCheck,
  ListTodo,
  Moon,
  NotebookPen,
  User,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface DashboardProps {
  readonly userId: string;
}

export default function Dashboard({ userId }: DashboardProps) {
  const router = useRouter();

  return (
    <div className="font-body">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-6xl mx-auto">
        {/* Daily Data Intake */}
        <Card className="p-5 bg-white/50 dark:bg-black/20 rounded-2xl border-none shadow-lg hover:shadow-xl transition-transform hover:scale-105 hover:bg-white/70 dark:hover:bg-black/50">
          <div className="flex flex-col h-full">
            <div className="p-3 bg-gradient-to-r from-blue-200 to-violet-200 rounded-xl w-fit">
              <ListCheck className="h-5 w-5 text-violet-500" />
            </div>
            <h3 className="text-lg font-header font-bold mt-3">Daily Data</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Track your habits
            </p>
            <Button
              onClick={() => router.push('/daily-intake')}
              variant="ghost"
              className="mt-1 justify-start px-0 hover:bg-gray-200 hover:pl-4"
            >
              Enter today →
            </Button>
          </div>
        </Card>

        {/* Journal Entry */}
        <Card className="p-5 bg-white/50 dark:bg-black/20 rounded-2xl border-none shadow-lg hover:shadow-xl transition-transform hover:scale-105 hover:bg-white/70 dark:hover:bg-black/50">
          <div className="flex flex-col h-full">
            <div className="p-3 bg-gradient-to-r from-blue-200 to-violet-200 rounded-xl w-fit">
              <NotebookPen className="h-5 w-5 text-violet-500" />
            </div>
            <h3 className="text-lg font-header font-bold mt-3">Journal</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Reflect on your day
            </p>
            <Button
              onClick={() => router.push('/journal')}
              variant="ghost"
              className="mt-1 justify-start px-0 hover:bg-gray-200 hover:pl-4"
            >
              Write entry →
            </Button>
          </div>
        </Card>

        {/* Sleep Tracker */}
        <Card className="p-5 bg-white/50 dark:bg-black/20 rounded-2xl border-none shadow-lg hover:shadow-xl transition-transform hover:scale-105 hover:bg-white/70 dark:hover:bg-black/50">
          <div className="flex flex-col h-full">
            <div className="p-3 bg-gradient-to-r from-blue-200 to-violet-200 rounded-xl w-fit">
              <Moon className="h-5 w-5 text-violet-500" />
            </div>
            <h3 className="text-lg font-header font-bold mt-3">Sleep</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Track your rest
            </p>
            <Button
              onClick={() => router.push('/sleep-tracker')}
              variant="ghost"
              className="mt-1 justify-start px-0 hover:bg-gray-200 hover:pl-4"
            >
              Log sleep →
            </Button>
          </div>
        </Card>

        {/* To-Do List */}
        <Card className="p-5 bg-white/50 dark:bg-black/20 rounded-2xl border-none shadow-lg hover:shadow-xl transition-transform hover:scale-105 hover:bg-white/70 dark:hover:bg-black/50">
          <div className="flex flex-col h-full">
            <div className="p-3 bg-gradient-to-r from-blue-200 to-violet-200 rounded-xl w-fit">
              <ListTodo className="h-5 w-5 text-violet-500" />
            </div>
            <h3 className="text-lg font-header font-bold mt-3">To-Do List</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Organize your tasks
            </p>
            <Button
              onClick={() => router.push('/task-manager')}
              variant="ghost"
              className="mt-1 justify-start px-0 hover:bg-gray-200 hover:pl-4"
            >
              Task Manager →
            </Button>
          </div>
        </Card>

        {/* Reminders */}
        <Card className="p-5 bg-white/50 dark:bg-black/20 rounded-2xl border-none shadow-lg hover:shadow-xl transition-transform hover:scale-105 hover:bg-white/70 dark:hover:bg-black/50">
          <div className="flex flex-col h-full">
            <div className="p-3 bg-gradient-to-r from-blue-200 to-violet-200 rounded-xl w-fit">
              <Bell className="h-5 w-5 text-violet-500" />
            </div>
            <h3 className="text-lg font-header font-bold mt-3">Reminders</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Customize your reminders
            </p>
            <Button
              onClick={() => router.push('/reminders')}
              variant="ghost"
              className="mt-1 justify-start px-0 hover:bg-gray-200 hover:pl-4"
            >
              Reminders →
            </Button>
          </div>
        </Card>

        {/* Profile */}
        <Card className="p-5 bg-white/50 dark:bg-black/20 rounded-2xl border-none shadow-lg hover:shadow-xl transition-transform hover:scale-105 hover:bg-white/70 dark:hover:bg-black/50">
          <div className="flex flex-col h-full">
            <div className="p-3 bg-gradient-to-r from-blue-200 to-violet-200 rounded-xl w-fit">
              <User className="h-5 w-5 text-violet-500" />
            </div>
            <h3 className="text-lg font-header font-bold mt-3">Profile</h3>
            <p className="text-sm text-muted-foreground mt-1">Your account</p>
            <Button
              onClick={() => router.push('/profile')}
              variant="ghost"
              className="mt-1 justify-start px-0 hover:bg-gray-200 hover:pl-4"
            >
              Settings →
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
