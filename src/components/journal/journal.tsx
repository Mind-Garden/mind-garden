'use client';

import { motion } from 'framer-motion';
import {
  BookOpen,
  CalendarDays,
  Edit,
  LoaderCircle,
  NotebookPen,
  PenLine,
  Save,
  Trash2,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import {
  deleteJournalEntry,
  fetchJournalEntries,
  saveJournalEntry,
  updateJournalEntry,
} from '@/actions/journal';
import { RandomPromptCard } from '@/components/journal/random-prompt-card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import FloatingShapes from '@/components/ui/floating-shapes';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TextArea } from '@/components/ui/textarea';
import { getDate, undoConversion } from '@/lib/utils';
import type { IJournalEntries } from '@/supabase/schema';

interface NewJournalProps {
  readonly userId: string;
}

export default function Journal({ userId }: NewJournalProps) {
  const [date, setDate] = useState<Date>(getDate());
  const [newEntry, setNewEntry] = useState('');
  const [entries, setEntries] = useState<IJournalEntries[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  // Helper function to convert entry_date string to Date object with proper UTC handling
  const parseEntryDate = (dateString: string) => {
    return new Date(dateString + 'T00:00:00Z');
  };

  // Helper to check if two dates represent the same day
  const isSameDay = (date1: Date, dateString: string) => {
    const date2 = parseEntryDate(dateString);
    return (
      date1.getUTCFullYear() === date2.getUTCFullYear() &&
      date1.getUTCMonth() === date2.getUTCMonth() &&
      date1.getUTCDate() === date2.getUTCDate()
    );
  };

  // Fetch journal entries for the given user
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data, error } = await fetchJournalEntries(userId);
      if (error) {
        setError(error);
        setLoading(false);
        return;
      }
      if (data) {
        setEntries(data.toReversed());
      }
      setLoading(false);
    };

    if (userId) {
      fetchData();
    }
  }, [userId]);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoaderCircle className="h-12 w-12 text-blue-500 animate-spin" />
      </div>
    );
  if (error) return <div>Error: {error}</div>;

  // Get entries count for each date
  const getEntriesCount = (day: Date) => {
    // Convert the day to UTC midnight for comparison
    const utcDay = new Date(day);

    return entries.filter((entry) => isSameDay(utcDay, entry.entry_date))
      .length;
  };

  // Get entries for the selected date
  const selectedDateEntries = entries.filter((entry) =>
    isSameDay(date, entry.entry_date),
  );

  // Save a new journal entry
  const handleSaveEntry = async () => {
    //dont allow empty inserts
    if (!newEntry.trim()) {
      toast.warn('Journal entry cannot be empty!');
      return;
    }

    const result = await saveJournalEntry(newEntry, userId);

    //error checking
    if (result?.error || (!result?.error && !result?.data)) {
      toast.warn('Error during Journal Entry'); // need this logic incase supabase silent fails
    } else {
      toast.success('Successfully added journal entry!');
    }
    if (error) {
      throw error;
    }

    if (result?.data?.[0]) {
      // Add the new entry to the local state
      setEntries([result.data[0], ...entries]);
      setNewEntry('');
    }
  };

  // Delete a journal entry
  const handleDeleteEntry = async (id: string) => {
    const result = await deleteJournalEntry(id);

    result?.error
      ? toast.error('Failed to delete journal entry.')
      : toast.success('Journal entry deleted successfully!');

    // Update the local state
    setEntries(entries.filter((entry) => entry.id !== id));
  };

  // Start editing an entry
  const startEditing = (entry: IJournalEntries) => {
    setEditingEntryId(entry.id);
    setEditingText(entry.journal_text);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingEntryId(null);
    setEditingText('');
  };

  // Save edited entry
  const saveEditedEntry = async (id: string) => {
    if (!editingText.trim()) {
      toast.warn('Journal entry cannot be empty!');
      return;
    }

    try {
      const result = await updateJournalEntry(id, editingText);

      if (result?.error) {
        toast.error('Failed to update journal entry.');
        return;
      }

      // Update the local state
      setEntries((prevEntries) => {
        const updatedEntry = {
          ...prevEntries.find((entry) => entry.id === id)!,
          journal_text: editingText,
        };
        const filteredEntries = prevEntries.filter((entry) => entry.id !== id);
        return [updatedEntry, ...filteredEntries];
      });

      toast.success('Journal entry updated successfully!');
      setEditingEntryId(null);
      setEditingText('');
    } catch (err) {
      toast.error('An error occurred while updating the entry.');
    }
  };

  // Format date for display
  const formattedDate = undoConversion(date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
      {/* First Row */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Calendar Card */}
        <div className="relative bg-white rounded-2xl shadow-lg p-6 overflow-hidden flex justify-center border-blue-500 border-2">
          <FloatingShapes
            className="bg-blue-100 z-10"
            colors={['bg-blue-100']}
          />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <CalendarDays className="h-6 w-6 text-blue-500 mr-3" />
                <h4 className="text-2xl font-title font-semibold text-gray-800 dark:text-white">
                  Journal Calendar
                </h4>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex justify-center items-center"
            >
              <Calendar
                mode="single"
                selected={undoConversion(date)}
                onSelect={(date: Date | undefined) => date && setDate(date)}
                className="rounded-md"
                components={{
                  DayContent: ({ date: dayDate }: { date: Date }) => {
                    const count = getEntriesCount(dayDate);
                    return (
                      <div className="relative w-full h-full p-2">
                        <span>{dayDate.getDate()}</span>
                        {count > 0 && (
                          <div className="absolute -top-1 -right-1 h-4 w-4 bg-blue-500 rounded-full flex items-center justify-center text-[10px] text-white z-50">
                            {count}
                          </div>
                        )}
                      </div>
                    );
                  },
                }}
              />
            </motion.div>
          </div>
        </div>

        {/* Journal Entry Form */}
        <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 overflow-hidden border-blue-500 border-2">
          <motion.div
            initial={{ opacity: 0.5, scale: 0.8, x: -100, y: 50 }}
            animate={{
              opacity: [0.5, 1, 0.5],
              scale: [0.8, 1, 0.8],
              x: [-100, 100, 150, -150, 0], // Moves further left and right
              y: [50, 50, 50, 50, 50], // Keeps the Y value stable
            }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <NotebookPen className="h-6 w-6 text-blue-500 mr-3" />
                <h4 className="text-2xl font-title font-semibold text-gray-800 dark:text-white">
                  New Entry
                </h4>
              </div>
              <span className="text-sm font-medium text-blue-500 bg-blue-50 dark:bg-blue-900/50 py-1 px-3 rounded-full">
                {getDate().toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-4"
            >
              <RandomPromptCard />

              <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4">
                <TextArea
                  placeholder="What's on your mind today?"
                  value={newEntry}
                  onChange={(e) => setNewEntry(e.target.value)}
                  className="min-h-[150px] bg-transparent border-none focus:outline-none focus:ring-0 p-0 placeholder:text-gray-400 text-gray-600"
                />
              </div>

              <Button
                onClick={handleSaveEntry}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white"
              >
                <PenLine className="w-4 h-4 mr-2" />
                Save Entry
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Second Row - Entries List */}
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 overflow-hidden border-blue-500 border-2">
        <FloatingShapes className="bg-blue-100 z-10" colors={['bg-blue-100']} />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <BookOpen className="h-6 w-6 text-blue-500 mr-3" />
              <h4 className="text-2xl font-title font-semibold text-gray-800 dark:text-white">
                Journal Entries from {formattedDate}
              </h4>
            </div>
            <span className="text-sm font-medium text-blue-500 bg-blue-50 dark:bg-blue-900/50 py-1 px-3 rounded-full">
              {selectedDateEntries.length}{' '}
              {selectedDateEntries.length === 1 ? 'entry' : 'entries'}
            </span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <ScrollArea className="h-[500px] pr-4">
              {selectedDateEntries.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <NotebookPen className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    No entries for this date
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {selectedDateEntries.map((entry, index) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-5 mb-4 border-blue-100 border-2">
                        {editingEntryId === entry.id ? (
                          <TextArea
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            className="min-h-[150px] bg-transparent border-none focus-visible:ring-0 p-0 text-gray-600 dark:text-gray-300"
                          />
                        ) : (
                          <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                            {entry.journal_text}
                          </p>
                        )}
                      </div>

                      <div className="flex justify-end gap-3">
                        {editingEntryId === entry.id ? (
                          <>
                            <Button
                              variant="outline"
                              onClick={cancelEditing}
                              className="border-gray-200 text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                            >
                              <X className="w-4 h-4 mr-2" />
                              Cancel
                            </Button>
                            <Button
                              onClick={() => saveEditedEntry(entry.id)}
                              className="bg-blue-500 hover:bg-blue-600 text-white"
                            >
                              <Save className="w-4 h-4 mr-2" />
                              Save Changes
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="outline"
                              onClick={() => startEditing(entry)}
                              className="border-gray-200 text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() => handleDeleteEntry(entry.id)}
                              className="bg-red-500 hover:bg-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </Button>
                          </>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
