'use client';

// Core imports
import { useEffect, useState } from 'react';

// Third party imports
import { Brain, NotebookPen, RotateCcw } from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Utility
import {
  saveJournalEntry,
  getRandomPrompt,
  getUniqueEntryDates
} from '@/utils/supabase/dbfunctions';

// UI
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
import { Calendar } from "@/components/ui/calendar"
import { JournalSwipe } from './journal-swipe';

interface JournalProps {
  readonly userId: string;
}

export function Journal({ userId }: JournalProps) {
  const [entry, setEntry] = useState('');
  const [prompt, setPrompt] = useState('');
  const [date, setDate] = useState<Date | null>(null);
  const [journalKey, setJournalKey] = useState(Date.now());
  const [markedDates, setMarkedDates] = useState<Set<string>>(new Set()); // Store dates with entries

  useEffect(() => {
    getPrompt();
    fetchEntryDates();
  }, []);

  useEffect(() => {
    if (date) {
      fetchEntryDates();
      setJournalKey(Date.now());
    }
  }, [date]);

const fetchEntryDates = async () => {
  try {
    const { data, error }: { data?: { entry_date: string }[] | null, error?: any } = await getUniqueEntryDates(userId);

    // Check for any errors from the database query
    if (error) throw error;

    // Assuming the `data` is an array of objects, each having an `entry_date` field
    if (data) {
      // Create a Set with unique dates by converting each `entry_date` string to a Date object
        const uniqueDates = new Set(data.map((entry: { entry_date: string }) => {
        // Create a Date object in UTC and set the time to midnight to avoid time zone issues
        const date = new Date(entry.entry_date + 'T00:00:00Z').toLocaleDateString('en-US', {
          weekday: 'short',  // Short day name (e.g., "Sun")
          month: 'short',    // Short month name (e.g., "Feb")
          day: 'numeric',    // Numeric day (e.g., "23")
          year: 'numeric',   // Full year (e.g., "2025")
          timeZone: 'UTC',    // Ensure the date is treated as UTC
        });
        return date
        })); // Convert to string in UTC format

        // Set the marked dates in state
        setMarkedDates(uniqueDates);
    }
  } catch (error) {
    console.error('Error fetching journal entries:', error);
  }
};
  

  const handleInsert = async () => {
    if (!entry.trim()) {
      toast.warn('Journal Entry cannot be empty on inserts');
      return;
    }

    const result = await saveJournalEntry(entry, userId);
    setEntry('');

    if (result?.error || (!result?.error && !result?.data)) {
      toast.warn('Error during Journal Entry');
    } else {
      toast.success('Successfully inserted Journal Entry');
      fetchEntryDates(); // Refresh marked dates
      setJournalKey(Date.now());
    }
  };

  const getPrompt = async () => {
    const result = await getRandomPrompt();

    if (result?.error) setPrompt('Something went wrong...');
    else if (result.data) setPrompt(result.data[0].prompt);
  };

  return (
    <div className="mx-auto min-w-[72rem] max-w-6xl space-y-8">
      <Card className="bg-transparent backdrop-blur-sm rounded-2xl">
        {/* Header */}
        <CardHeader>
          <div className="flex items-center space-x-2">
            <CardTitle>Journal Entry</CardTitle>
            <NotebookPen className="h-6 w-6" />
          </div>
          <div className="flex items-center space-x-2">
            <CardDescription>Journal your thoughts</CardDescription>
            <Brain className="h-4 w-4" />
          </div>
          <div className="flex items-center space-x-2 justify-center pt-8">
            <CardDescription>Need inspiration?</CardDescription>
            <CardDescription>
              <b>{prompt}</b>
            </CardDescription>
            <button onClick={getPrompt}>
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </CardHeader>

        {/* Content */}
        <CardContent className="space-y-10">
          <div className="space-y-2">
            <TextArea
              placeholder="What's on your mind?"
              value={entry}
              onChange={(e) => setEntry(e.target.value)}
            />
          </div>
        </CardContent>

        {/* Footer */}
        <CardFooter>
          <Button onClick={handleInsert}>Save Entry</Button>
        </CardFooter>

        {/* For Viewing Journal Entries */}
        <CardContent className="p-6">
          <div className="mt-4 text-lg font-semibold text-center">
            Selected Date: {date ? date.toDateString() : "None"}
          </div>
          <div className="w-full sm:w-auto flex items-center justify-center">
            <div className="w-full sm:w-auto">
              {/* Calendar with marked dates */}
              <Calendar
                mode="single"
                selected={date ?? undefined}
                onSelect={(day) => setDate(day ?? null)}
                className="rounded-md border"
                modifiers={{
                  hasEntry: (day) => markedDates.has(day.toLocaleDateString('en-US', {
                    weekday: 'short',  // Short day name (e.g., "Sun")
                    month: 'short',    // Short month name (e.g., "Feb")
                    day: 'numeric',    // Numeric day (e.g., "23")
                    year: 'numeric',   // Full year (e.g., "2025")
                    timeZone: 'UTC',    // Ensure the date is treated as UTC
                  })), // Check if date is marked
                }}
                modifiersClassNames={{
                  hasEntry: 'bg-gradient-to-r from-indigo-500 via-blue-500 to-green-500 text-white rounded-full shadow-xl transform hover:scale-110 transition-all duration-300',
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <JournalSwipe key={journalKey} userId={userId} date={date ?? new Date()} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
