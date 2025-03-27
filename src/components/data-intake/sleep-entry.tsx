'use client';

import 'react-toastify/dist/ReactToastify.css';

import { AlertCircle, Clock, LoaderCircle, Moon } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import {
  insertSleepEntry,
  selectSleepEntryByDate,
  updateSleepEntry,
} from '@/actions/data-intake';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/shadcn/card';
import { Label } from '@/components/shadcn/label';
import FloatingShapes from '@/components/ui/floating-shapes';
import { RatingScale } from '@/components/ui/rating-scale';
import { convertTo24HourSleepEntry, getLocalISOString } from '@/lib/utils';
import { ISleepEntries } from '@/supabase/schema';

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

  // loading state while fetching data
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

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1 },
    }),
  };

  const buttonClickVariants = {
    tap: { scale: 0.95 },
  };

  return (
    <motion.div variants={cardVariants} initial="hidden" animate="visible">
      <Card className="bg-white/50 backdrop-blur-sm border-teal-400 border-2 overflow-hidden rounded-2xl">
        <FloatingShapes colors={['bg-teal-100', 'bg-teal-200']} />
        <CardHeader className="pb-2">
          <motion.div
            variants={sectionVariants}
            custom={0}
            initial="hidden"
            animate="visible"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Moon className="h-6 w-6 text-teal-500" />
                <h2 className="text-2xl font-title font-bold">Sleep Entry</h2>
              </div>
            </div>
            <p className="text-md font-semibold font-header text-muted-foreground mt-3">
              Track your sleep patterns for better health
            </p>
          </motion.div>
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          {/* Input area */}
          <motion.div
            variants={sectionVariants}
            custom={1}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
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
          </motion.div>

          {/* Rating Scale */}
          <motion.div
            variants={sectionVariants}
            custom={2}
            initial="hidden"
            animate="visible"
            className="space-y-3 border-t pt-4"
          >
            <label className="text-sm font-medium">
              How would you rate your sleep quality?
            </label>
            <RatingScale
              value={sleepQuality}
              onChange={setSleepQuality}
              leftLabel="Poor"
              rightLabel="Excellent"
            />
          </motion.div>

          {entryExists && (
            <motion.div
              variants={sectionVariants}
              custom={3}
              initial="hidden"
              animate="visible"
              className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 text-amber-800 border border-amber-200"
            >
              <AlertCircle className="h-4 w-4" />
              <p className="text-sm">
                You've already logged a sleep entry for today.
              </p>
            </motion.div>
          )}
        </CardContent>
        <CardFooter>
          {/* Button to save or update */}
          {!entryExists ? (
            <motion.button
              variants={buttonClickVariants}
              whileTap="tap"
              className="w-full bg-teal-400 hover:bg-teal-500 px-4 py-2 rounded-lg font-medium text-white"
              onClick={() => handleSaveEntry()}
            >
              Save Sleep Entry
            </motion.button>
          ) : (
            todayEntry?.id && (
              <motion.button
                variants={buttonClickVariants}
                whileTap="tap"
                className="w-full bg-teal-400 hover:bg-teal-500 px-4 py-2 rounded-lg font-medium text-white"
                onClick={() => handleSaveEntry()}
              >
                Update Sleep Entry
              </motion.button>
            )
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
}
