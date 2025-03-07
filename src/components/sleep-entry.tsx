'use client';

//Core imports
import { useEffect, useState } from 'react';

// Third party imports
import { Moon, Clock } from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Utility
import {
  insertSleepEntry,
  selectSleepEntryByDate,
  updateSleepEntry,
} from '@/actions/data-intake';
import { getLocalISOString } from '@/lib/utils';
import { ISleepEntries } from '@/supabase/schema';

//UI
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SleepTrackerProps {
  readonly userId: string;
}

export function SleepEntryCard({ userId }: SleepTrackerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');
  const [entryExists, setEntryExists] = useState<boolean | null>(null);
  const [todayEntry, setTodayEntry] = useState<ISleepEntries | null>(null);

  const getEntry = async () => {
    setLoading(true);
    const entryDate = getLocalISOString();
    const { data, error } = await selectSleepEntryByDate(userId, entryDate);
    if (error) {
      toast.warn('Error checking existing sleep entry!');
      setError(error);
      setLoading(false);
      return;
    }
    if (data) {
      setTodayEntry(data);
      setEntryExists(true);

      setStartTime(data.start);
      setEndTime(data.end);
    } else {
      setEntryExists(false);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (userId) {
      getEntry();
    }
  }, [userId]);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoaderCircle className="h-12 w-12 text-gray-500 animate-spin" />
      </div>
    );
  if (error) return <div>Error: {error}</div>;

  const handleSaveEntry = async (entryId?: string) => {
    // don't allow empty inserts
    if (!startTime.trim() || !endTime.trim()) {
      toast.warn('Both start and end times are required!');
      return;
    }

    if (new Date(startTime) >= new Date(endTime)) {
      toast.warn('Start time must be before end time!');
      return;
    }

    const result = entryId
      ? await updateSleepEntry(entryId, startTime, endTime)
      : await insertSleepEntry(startTime, endTime, userId);

    if (result?.error) {
      toast.warn('Error saving sleep entry!');
      return;
    }

    toast.success(`Sleep entry ${entryId ? 'updated' : 'saved'} successfully!`);

    if (result?.data && result.data.length > 0) {
      setTodayEntry(result.data[0]);
      setEntryExists(true);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-8">
      <Card className="bg-white/50 backdrop-blur-sm rounded-2xl border-none">
        {/* Header */}
        <CardHeader>
          {/* Title and Icon */}
          <div className="flex items-center space-x-2">
            <CardTitle>Sleep Entry</CardTitle>
            <Moon className="h-6 w-6" />
          </div>
          {/* Description and Icon */}
          <div className="flex items-center space-x-2">
            <CardDescription>Log your sleep times for the day</CardDescription>
            <Clock className="h-4 w-4" />
          </div>
        </CardHeader>

        {/* Content */}
        <CardContent className="space-y-10">
          <div className="space-y-2">
            <label>Start Time: </label>
            <input
              type="time"
              step="60"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label>End Time: </label>
            <input
              type="time"
              step="60"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
        </CardContent>
        {entryExists && (
          <div className="text-muted-foreground pl-6 pb-5">
            <p>You’ve already logged a sleep entry for today.</p>
          </div>
        )}
        {/* Footer */}
        <CardFooter>
          {!entryExists ? (
            <Button onClick={() => handleSaveEntry()}>Save Sleep Entry</Button>
          ) : (
            todayEntry?.id && (
              <Button onClick={() => handleSaveEntry(todayEntry.id)}>
                Update Sleep Entry
              </Button>
            )
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
