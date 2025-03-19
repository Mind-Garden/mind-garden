'use client';

//Core imports
import { useEffect, useState } from 'react';

// Third party imports
import { Clock, Moon, Info, AlertCircle, LoaderCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Utility
import {
  insertSleepEntry,
  selectSleepEntryByDate,
  updateSleepEntry,
} from '@/actions/data-intake';
import { getLocalISOString, convertTo24HourSleepEntry } from '@/lib/utils';
import { ISleepEntries } from '@/supabase/schema';

//UI
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RatingScale } from '@/components/ui/rating-scale';

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
  const [sleepQuality, setSleepQuality] = useState<number>(0);

  const calculateDuration = () => {
    const parseTime = (timeStr: string) => {
      const [time, period] = timeStr.split(' ');
      const [hoursStr, minutes] = time.split(':').map(Number);

      let hours = hoursStr;

      if (period === 'PM' && hours < 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;

      return hours * 60 + minutes;
    };

    const start = parseTime(startTime);
    let end = parseTime(endTime);

    // Handle overnight sleep
    if (end < start) end += 24 * 60;

    const durationMinutes = end - start;
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;

    return `${hours}h ${minutes}m`;
  };

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
      setSleepQuality(data.quality);
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

  const handleSaveEntry = async () => {
    // don't allow empty inserts
    if (!startTime.trim() || !endTime.trim()) {
      toast.warn('Both start and end times are required!');
      return;
    }

    if (new Date(startTime) >= new Date(endTime)) {
      toast.warn('Start time must be before end time!');
      return;
    }

    if (sleepQuality == 0) {
      toast.warn('Please enter your sleep quality!');
      return;
    }

    const formattedStartTime = convertTo24HourSleepEntry(startTime);
    const formattedEndTime = convertTo24HourSleepEntry(endTime);

    const result = todayEntry?.id
      ? await updateSleepEntry(
          todayEntry.id,
          formattedStartTime,
          formattedEndTime,
          sleepQuality,
        )
      : await insertSleepEntry(
          formattedStartTime,
          formattedEndTime,
          userId,
          sleepQuality,
        );

    if (result?.error) {
      toast.warn('Error saving sleep entry!');
      return;
    }

    toast.success(
      `Sleep entry ${todayEntry?.id ? 'updated' : 'saved'} successfully!`,
    );

    if (result?.data && result.data.length > 0) {
      setTodayEntry(result.data[0]);
      setEntryExists(true);
    }
  };

  return (
    <div className="max-w-md mx-auto pt-8">
      <Card className="bg-white/50 backdrop-blur-sm w-full max-w-md border-none">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Moon className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold">Sleep Entry</h2>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Track your sleep patterns for better health
          </p>
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          <div className="space-y-4">
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="startTime"
                  className="text-sm font-medium flex items-center gap-1.5"
                >
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  Start Time
                </Label>
                <div className="text-xs text-muted-foreground">Bedtime</div>
              </div>
              <div className="relative">
                <input
                  id="startTime"
                  type="time"
                  value={startTime.split(' ')[0]}
                  onChange={(e) => {
                    const newTime = e.target.value;
                    const period = endTime.split(' ')[1];
                    setStartTime(`${newTime} ${period}`);
                  }}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="endTime"
                  className="text-sm font-medium flex items-center gap-1.5"
                >
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  End Time
                </Label>
                <div className="text-xs text-muted-foreground">Wake up</div>
              </div>
              <div className="relative">
                <input
                  id="endTime"
                  type="time"
                  value={endTime.split(' ')[0]}
                  onChange={(e) => {
                    const newTime = e.target.value;
                    const period = endTime.split(' ')[1];
                    setEndTime(`${newTime} ${period}`);
                  }}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-3 flex items-center justify-between">
              <span className="text-sm font-medium">Sleep Duration</span>
              {startTime && endTime && (
                <span className="text-sm font-bold">{calculateDuration()}</span>
              )}
            </div>
          </div>

          <div className="space-y-3 border-t pt-4">
            <label className="text-sm font-medium">
              How would you rate your sleep quality?
            </label>
            <RatingScale
              value={sleepQuality}
              onChange={setSleepQuality}
              leftLabel="Poor"
              rightLabel="Excellent"
            />
          </div>

          {entryExists && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 text-amber-800 border border-amber-200">
              <AlertCircle className="h-4 w-4" />
              <p className="text-sm">
                You've already logged a sleep entry for today.
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          {!entryExists ? (
            <Button
              className="w-full"
              size="lg"
              onClick={() => handleSaveEntry()}
            >
              Save Sleep Entry
            </Button>
          ) : (
            todayEntry?.id && (
              <Button
                className="w-full"
                size="lg"
                onClick={() => handleSaveEntry()}
              >
                Update Sleep Entry
              </Button>
            )
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
