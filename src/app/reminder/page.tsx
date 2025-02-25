'use client';

// Core Imports
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// Third-Party
import { Bell } from 'lucide-react';

// Utility
import { createClient } from '@/utils/supabase/client';

// UI
import { Particles } from '@/components/magicui/particles';
import { Button } from '@/components/ui/button';
import { ProfileDropdown } from '@/components/profile-dropdown';
import { ReminderButton } from '@/components/reminder-button';
import Footer from '@/components/footer';
import { ReminderEntryCard } from '@/components/reminder-entry';

export default function ReminderPage() {
  const supabase = createClient();
  const router = useRouter();

  const [userId, setUserId] = useState<string | null>(null);
  const [reminderTime, setReminderTime] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserAndReminder = async () => {
      const { data: authData, error: authError } =
        await supabase.auth.getUser();
      if (authError || !authData?.user) {
        router.push('/error');
        return;
      }

      setUserId(authData.user.id);

      const { data, error } = await supabase
        .from('users')
        .select('reminder_time')
        .eq('id', authData.user.id)
        .single();

      if (!error && data?.reminder_time) {
        setReminderTime(data.reminder_time);
      }
    };

    fetchUserAndReminder();
  }, []);

  useEffect(() => {
    if (!reminderTime) return;

    const checkReminder = () => {
      const now = new Date();
      const [reminderHour, reminderMinute] = reminderTime
        .split(':')
        .map(Number);

      if (
        now.getHours() === reminderHour &&
        now.getMinutes() === reminderMinute
      ) {
        showNotification();
      }
    };

    const interval = setInterval(checkReminder, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [reminderTime]);

  const showNotification = () => {
    if (Notification.permission === 'granted') {
      new Notification('Mind Garden Reminder', {
        body: 'Time to write in your journal!',
        icon: '/logo.png',
      });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          new Notification('Mind Garden Reminder', {
            body: 'Time to write in your journal!',
            icon: '/logo.png',
          });
        }
      });
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundImage: `url(/gradient.svg)`,
        backgroundSize: 'cover',
      }}
    >
      {/* Particles Background */}
      <Particles
        className="absolute inset-0 z-0"
        quantity={200}
        ease={80}
        color={'#000000'}
        refresh
      />

      {/* Header */}
      <header className="border-b bg-white/50 backdrop-blur-sm mt-4 mx-4 rounded-full">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <img
              src="/logo.png"
              alt="Mind Garden Logo"
              className="h-7 w-7 mr-2"
            />
            <p className="text-2xl font-semibold text-green-700">Mind Garden</p>
          </div>
          <div className="flex items-center gap-4">
            {/* Reminder Button */}
            <ReminderButton />
            {/* Notifications */}
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            {/* Profile Dropdown */}
            <ProfileDropdown />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <ReminderEntryCard userId={userId} />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
