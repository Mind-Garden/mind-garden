'use client';
import {
  ArrowRight,
  Bell,
  ListCheck,
  ListTodo,
  Moon,
  NotebookPen,
  User,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/shadcn/button';
import { Card } from '@/components/shadcn/card';

export default function QuickLinks() {
  const router = useRouter();

  return (
    <div className="font-body">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-6xl mx-auto">
        {/* Profile */}
        <Card className="p-5 bg-white/50 rounded-2xl border-none shadow-lg hover:shadow-xl transition-transform hover:scale-105 hover:bg-white/70">
          <div className="flex flex-col h-full">
            <div className="p-3 bg-gradient-to-r from-emerald-200 to-sky-200 rounded-xl w-fit">
              <User className="h-5 w-5 text-black" />
            </div>
            <h3 className="text-lg font-header font-bold mt-3">Profile</h3>
            <p className="text-sm text-muted-foreground mt-1">Your account</p>
            <Button
              onClick={() => router.push('/profile')}
              variant="ghost"
              className="mt-1 justify-start px-0 hover:bg-gradient-to-r hover:from-emerald-200 hover:to-sky-200 hover:pl-4"
            >
              Settings <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </Card>

        {/* Daily Habits */}
        <Card className="p-5 bg-white/50 rounded-2xl border-none shadow-lg hover:shadow-xl transition-transform hover:scale-105 hover:bg-white/70">
          <div className="flex flex-col h-full">
            <div className="p-3 bg-gradient-to-r from-sky-200 to-violet-200 rounded-xl w-fit">
              <ListCheck className="h-5 w-5 text-black" />
            </div>
            <h3 className="text-lg font-header font-bold mt-3">Daily Habits</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Track your habits
            </p>
            <Button
              onClick={() => router.push('/daily-habits')}
              variant="ghost"
              className="mt-1 justify-start px-0 hover:bg-gradient-to-r hover:from-sky-200 hover:to-violet-200 hover:pl-4"
            >
              Enter today <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </Card>

        {/* Journal Entry */}
        <Card className="p-5 bg-white/50 rounded-2xl border-none shadow-lg hover:shadow-xl transition-transform hover:scale-105 hover:bg-white/70">
          <div className="flex flex-col h-full">
            <div className="p-3 bg-emerald-100 rounded-xl w-fit">
              <NotebookPen className="h-5 w-5 text-emerald-600" />
            </div>
            <h3 className="text-lg font-header font-bold mt-3">Journal</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Reflect on your day
            </p>
            <Button
              onClick={() => router.push('/journal')}
              variant="ghost"
              className="mt-1 justify-start px-0 hover:bg-emerald-100 hover:pl-4"
            >
              Write entry <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </Card>

        {/* Sleep Tracker */}
        <Card className="p-5 bg-white/50 rounded-2xl border-none shadow-lg hover:shadow-xl transition-transform hover:scale-105 hover:bg-white/70">
          <div className="flex flex-col h-full">
            <div className="p-3 bg-teal-100 rounded-xl w-fit">
              <Moon className="h-5 w-5 text-teal-600" />
            </div>
            <h3 className="text-lg font-header font-bold mt-3">Sleep</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Track your rest
            </p>
            <Button
              onClick={() => router.push('/sleep-tracker')}
              variant="ghost"
              className="mt-1 justify-start px-0 hover:bg-teal-100 hover:pl-4"
            >
              Log sleep <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </Card>

        {/* To-Do List */}
        <Card className="p-5 bg-white/50 rounded-2xl border-none shadow-lg hover:shadow-xl transition-transform hover:scale-105 hover:bg-white/70">
          <div className="flex flex-col h-full">
            <div className="p-3 bg-blue-100 rounded-xl w-fit">
              <ListTodo className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-header font-bold mt-3">To-Do List</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Organize your tasks
            </p>
            <Button
              onClick={() => router.push('/task-manager')}
              variant="ghost"
              className="mt-1 justify-start px-0 hover:bg-sky-100 hover:pl-4"
            >
              Task Manager <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </Card>

        {/* Reminders */}
        <Card className="p-5 bg-white/50 rounded-2xl border-none shadow-lg hover:shadow-xl transition-transform hover:scale-105 hover:bg-white/70">
          <div className="flex flex-col h-full">
            <div className="p-3 bg-violet-100 rounded-xl w-fit">
              <Bell className="h-5 w-5 text-violet-600" />
            </div>
            <h3 className="text-lg font-header font-bold mt-3">Reminders</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Customize your reminders
            </p>
            <Button
              onClick={() => router.push('/reminders')}
              variant="ghost"
              className="mt-1 justify-start px-0 hover:bg-violet-100 hover:pl-4"
            >
              Reminders <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
