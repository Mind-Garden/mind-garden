'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/supabase/client';
import { Header } from '@/components/header';
import Footer from '@/components/footer';
import { ReminderCard } from '@/components/reminder-card';
import {LoaderCircle} from "lucide-react";

export default function RemindersPage() {
  const supabase = getSupabaseClient();
  const router = useRouter();

  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null | undefined>(null);
  const [reminderTime, setReminderTime] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserAndReminder = async () => {
      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (authError || !authData?.user) {
        router.push('/error');
        return;
      }

      const userId = authData.user.id;
      const email = authData.user.email;

      setUserId(userId); // Set userId first
      setEmail(email);

      // Fetch reminders time only if userId is set
      const { data, error } = await supabase
        .from('reminders')
        .select('reminder_time')
        .eq('id', userId)
        .single();

      if (!error && data.reminder_time) {
        setReminderTime(data.reminder_time);
      }
    };

    fetchUserAndReminder();
  }, [supabase, router]); // Added dependencies

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
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        {userId ? (
          <ReminderCard userId={userId} email={email} />
        ) : (
          <div className="flex justify-center items-center">
            <LoaderCircle className="justify-center h-10 w-10 animate-spin" />
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
