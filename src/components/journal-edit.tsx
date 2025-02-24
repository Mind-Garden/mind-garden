'use client';

// Core imports
import { useState } from 'react';

// Third Party
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Utility
import {
  deleteJournalEntry,
  updateJournalEntry,
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
import { Brain, NotebookPen } from 'lucide-react';
import { JournalEntry } from '@/components/journal-swipe'; // Import JournalEntry interface

export function JournalEntryEditCard(item: Readonly<JournalEntry>) {
  const [entry, setEntry] = useState(item.journal_text);
  const [isUpdating, setIsUpdating] = useState(false);

  const formattedDate = new Date(
    item.entry_date + 'T00:00:00Z',
  ).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });

  // Handles updating the journal entry
  const handleUpdate = async () => {
    if (!entry.trim()) {
      toast.warn('Entry cannot be empty!');
      return;
    }

    setIsUpdating(true);

    const result = await updateJournalEntry(item.id, entry);
    setIsUpdating(false);

    result?.error
      ? toast.error('Failed to update journal entry.')
      : toast.success('Journal entry updated successfully!');
  };

  const handleDelete = async () => {
    const result = await deleteJournalEntry(item.id);

    result?.error
      ? toast.error('Failed to delete journal entry.')
      : toast.success('Journal entry deleted successfully!');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <Card className="bg-white/50 backdrop-blur-sm rounded-2xl">
        {/* Header */}
        <CardHeader>
          <div className="flex items-center space-x-2">
            <CardTitle>Edit Journal Entry from </CardTitle>
            <NotebookPen className="h-6 w-6" />
            <CardTitle className="text-lg font-semibold text-gray-800">
              {formattedDate}
            </CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <CardDescription>Modify your thoughts</CardDescription>
            <Brain className="h-4 w-4" />
          </div>
        </CardHeader>

        {/* Content */}
        <CardContent className="space-y-10">
          <TextArea
            placeholder="Edit your thoughts..."
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
          />
        </CardContent>

        {/* Footer */}
        <CardFooter className="flex justify-top gap-2">
          <Button onClick={handleUpdate} disabled={isUpdating}>
            {isUpdating ? 'Updating...' : 'Update Entry'}
          </Button>
          <Button onClick={handleDelete}> Delete Entry </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
