'use client';

//Core imports
import { useState } from 'react';

// Third party imports
import { Moon, Clock } from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Utility
import { insertSleepEntry } from '@/utils/supabase/dbfunctions';

//UI
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { TextArea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface SleepTrackerProps {
  readonly userId: string;
}

const getCurrentDateTime = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  now.setMinutes(now.getMinutes() - offset);

  return now.toISOString().slice(0, 16);
};

export function SleepEntryCard({ userId }: SleepTrackerProps) {
  const [startTime, setStartTime] = useState(getCurrentDateTime);
  const [endTime, setEndTime] = useState(getCurrentDateTime);

  const handleInsert = async () => {
    // dont allow empty inserts
    if (!startTime.trim() || !endTime.trim()) {
      toast.warn('Both start and end times are required!');
      return;
    }

    if (new Date(startTime) >= new Date(endTime)) {
      toast.warn('Start time must be before end time!');
      return;
    }

    const result = await insertSleepEntry(startTime, endTime, userId);

    if (result?.error) {
      if (typeof result.error === 'string') {
        toast.warn(result.error);
      } else {
        toast.warn('Error saving sleep entry!');
      }
      return;
    }

    toast.success('Sleep entry saved successfully!');
    setStartTime('');
    setEndTime('');
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
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full md:w-64"
            />
          </div>
          <div className="space-y-2">
            <label>End Time: </label>
            <input
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full md:w-64"
            />
          </div>
        </CardContent>

        {/* Footer */}
        <CardFooter>
          {/* This will save our journal entry and make the textarea blank */}
          <Button onClick={handleInsert}>Save Sleep Entry</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
