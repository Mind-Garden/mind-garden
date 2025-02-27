'use client';

// Core Imports
import { useEffect, useState } from 'react';

// MUI Components
import { StaticTimePicker } from '@mui/x-date-pickers/StaticTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';


// Utility
import {
  getReminderTime,
  updateReminderTime,
} from '@/utils/supabase/dbfunctions';

// UI
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog';

interface ReminderEntryProps {
  userId: string | null;
}

export function ReminderEntryCard({ userId }: ReminderEntryProps) {
  const [reminderTime, setReminderTime] = useState<Dayjs | null>(dayjs());
  const [loading, setLoading] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);

  useEffect(() => {
    if (!userId) return;

    const fetchReminderTime = async () => {
      try {
        const reminderData = await getReminderTime(userId);

        if (reminderData && reminderData.reminder_time) {
          setReminderTime(dayjs(reminderData.reminder_time));
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
    const formattedTime = reminderTime.format('HH:mm'); // Convert Dayjs object to HH:mm format
    const success = await updateReminderTime(userId, formattedTime);
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
        <div className="flex flex-col items-center gap-4">
          {/* Open time picker in a dialog */}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">Pick a Time</Button>
            </DialogTrigger>
            <DialogContent className="w-auto bg-white p-4 rounded-lg shadow-lg flex flex-col items-center">
              <DialogTitle>Select Reminder Time</DialogTitle>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <StaticTimePicker
                  value={reminderTime}
                  onChange={(newTime) => setReminderTime(newTime)}
                  slotProps={{
                    actionBar: { actions: [] },
                  }}
                />
              </LocalizationProvider>
              <Button className="mt-4 w-full" onClick={() => setOpen(false)}>
                Confirm Time
              </Button>
            </DialogContent>
          </Dialog>

          <p className="text-lg font-semibold">
            Selected Time: {reminderTime ? reminderTime.format('hh:mm A') : 'Not set'}
          </p>

          <Button onClick={handleUpdateReminder} disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
