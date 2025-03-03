'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {
  getReminderTime,
  updateReminderTime,
  insertReminderTime,
} from '@/actions/reminders';
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

// Helper to convert hour + AM/PM to 24-hour time
function formatTime(hour: number, amPm: 'AM' | 'PM'): string {
  let hour24 = hour;
  if (amPm === 'PM' && hour !== 12) hour24 += 12;
  if (amPm === 'AM' && hour === 12) hour24 = 0; // 12 AM is 0:00 in 24-hour
  return `${hour24.toString().padStart(2, '0')}:00`;  // "HH:mm"
}

// Helper to display 24-hour time as 12-hour time with AM/PM
function formatDisplayTime(hour24: number): { hour: number; amPm: 'AM' | 'PM' } {
  const amPm = hour24 >= 12 ? 'PM' : 'AM';
  const hour12 = hour24 % 12 || 12;
  return { hour: hour12, amPm };
}

export function ReminderCard({ userId, email }: ReminderProps) {
  const [hour, setHour] = useState<number>(9);
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
          const [hourStr] = reminderData[0].reminder_time.split(':');
          const hour24 = parseInt(hourStr, 10);
          const { hour: displayHour, amPm: displayAmPm } = formatDisplayTime(hour24);

          setHour(displayHour);
          setAmPm(displayAmPm);
        } else {
          // Insert default if no time exists
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
            const { hour: displayHour, amPm: displayAmPm } = formatDisplayTime(hour24);

            setHour(displayHour);
            setAmPm(displayAmPm);
          }
        }
      } catch (error) {
        console.error('Error fetching reminders time:', error);
        toast.error('Failed to load reminder time.');
      }
    };

    fetchReminderTime();
  }, [userId, email]);

  const handleUpdateReminder = async () => {
    if (!userId) return;

    setLoading(true);
    const formattedTime = formatTime(hour, amPm);
    const success = await updateReminderTime(userId, formattedTime);
    setLoading(false);

    if (success) {
      toast.success('Reminder time updated successfully!');
    } else {
      toast.error('Error updating reminder time.');
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Set Reminder Time</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-4">

          {/* Time Picker Dialog */}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">Pick a Time</Button>
            </DialogTrigger>
            <DialogContent className="w-auto bg-white p-4 rounded-lg shadow-lg flex flex-col items-center">
              <DialogTitle>Select Reminder Time</DialogTitle>

              {/* Hour Picker */}
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

              {/* AM/PM Selector */}
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
