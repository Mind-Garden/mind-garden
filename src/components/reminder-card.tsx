'use client';

import { useEffect, useState } from 'react';
import {
  getReminderTime,
  updateReminderTime,
  insertReminderTime,
} from '@/actions/notifications';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from '@/components/ui/dialog';

interface ReminderProps {
  userId: string | null;
  email: string | null | undefined;
}

// Helper function to convert 12-hour time to 24-hour format string
function formatTime(hour: number, amPm: 'AM' | 'PM'): string {
  let hour24 = hour;
  if (amPm === 'PM' && hour !== 12) hour24 += 12;
  if (amPm === 'AM' && hour === 12) hour24 = 0;
  return `${hour24.toString().padStart(2, '0')}:00`;  // Always :00 since we're removing minute selection
}

// Helper function to display time in 12-hour format
function formatDisplayTime(hour24: number): string {
  const period = hour24 >= 12 ? 'PM' : 'AM';
  const hour12 = hour24 % 12 || 12;
  return `${hour12} ${period}`;
}

export function ReminderCard({ userId, email }: ReminderProps) {
  const [hour, setHour] = useState<number>(9); // default to 9
  const [amPm, setAmPm] = useState<'AM' | 'PM'>('AM');
  const [loading, setLoading] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);

  useEffect(() => {
    if (!userId || !email) return;

    const fetchReminderTime = async () => {
      try {
        const reminderData = await getReminderTime(userId);

        if (
          reminderData &&
          Array.isArray(reminderData) &&
          reminderData.length > 0 &&
          reminderData[0].reminder_time
        ) {
          const [hourStr, minuteStr] = reminderData[0].reminder_time.split(':');
          const hour24 = parseInt(hourStr, 10);

          setHour(hour24 % 12 || 12);  // Convert to 12-hour
          setAmPm(hour24 >= 12 ? 'PM' : 'AM');
        } else {
          await insertReminderTime(userId, email);
          const newReminder = await getReminderTime(userId);
          if (
            newReminder &&
            Array.isArray(newReminder) &&
            newReminder.length > 0 &&
            newReminder[0].reminder_time
          ) {
            const [hourStr] = newReminder[0].reminder_time.split(':');
            const hour24 = parseInt(hourStr, 10);
            setHour(hour24 % 12 || 12);
            setAmPm(hour24 >= 12 ? 'PM' : 'AM');
          }
        }
      } catch (error) {
        console.error('Error fetching reminders time:', error);
      }
    };

    fetchReminderTime();
  }, [userId, email]);

  const handleUpdateReminder = async () => {
    if (!userId) return;

    setLoading(true);
    const formattedTime = formatTime(hour, amPm);  // Convert selected hour/am-pm to "HH:mm"
    const success = await updateReminderTime(userId, formattedTime);
    setLoading(false);

    if (success) {
      alert('Reminder time updated successfully!');
    } else {
      console.error('Error updating reminders time');
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Set Reminder Time</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-4">

          {/* Open time picker in a dialog */}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">Pick a Time</Button>
            </DialogTrigger>
            <DialogContent className="w-auto bg-white p-4 rounded-lg shadow-lg flex flex-col items-center">
              <DialogTitle>Select Reminder Time</DialogTitle>

              <div className="grid grid-cols-4 gap-2 my-4">
                {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                  <Button
                    key={h}
                    variant={h === hour ? 'default' : 'outline'}
                    onClick={() => setHour(h)}
                  >
                    {h}
                  </Button>
                ))}
              </div>

              <div className="flex gap-4">
                <Button
                  variant={amPm === 'AM' ? 'default' : 'outline'}
                  onClick={() => setAmPm('AM')}
                >
                  AM
                </Button>
                <Button
                  variant={amPm === 'PM' ? 'default' : 'outline'}
                  onClick={() => setAmPm('PM')}
                >
                  PM
                </Button>
              </div>

              <Button className="mt-4 w-full" onClick={() => setOpen(false)}>
                Confirm Time
              </Button>
            </DialogContent>
          </Dialog>

          <p className="text-lg font-semibold">
            Selected Time: {hour} {amPm}
          </p>

          <Button onClick={handleUpdateReminder} disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
