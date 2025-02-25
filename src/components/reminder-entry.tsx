'use client';

// Core Imports
import { useEffect, useState } from 'react';

// Utility
import {
  getReminderTime,
  updateReminderTime,
} from '@/utils/supabase/dbfunctions';

// UI
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ReminderEntryProps {
  userId: string | null;
}

export function ReminderEntryCard({ userId }: ReminderEntryProps) {
  const [reminderTime, setReminderTime] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!userId) return;

    const fetchReminderTime = async () => {
      try {
        const reminderData = await getReminderTime(userId);

        if (reminderData && reminderData.reminder_time) {
          // Convert Date object back to HH:mm string for the input field
          const timeString = reminderData.reminder_time
            .toISOString()
            .substring(11, 16); // Extract HH:mm
          setReminderTime(timeString);
        }
      } catch (error) {
        console.error('Error fetching reminder time:', error);
      }
    };

    fetchReminderTime();
  }, [userId]);

  const handleUpdateReminder = async () => {
    if (!userId || !reminderTime) return;

    setLoading(true);
    const success = await updateReminderTime(userId, reminderTime);
    setLoading(false);

    if (success) {
      alert('Reminder time updated successfully!');
    } else {
      console.error('Error updating reminder time');
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Set Reminder Time</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <Input
            type="time"
            value={reminderTime}
            onChange={(e) => setReminderTime(e.target.value)}
            className="w-full"
          />
          <Button onClick={handleUpdateReminder} disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
