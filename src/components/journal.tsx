'use client';

import { useState, useEffect } from 'react';

import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { TextArea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from './ui/badge';

import { PenLine, Trash2, CalendarDays, Save, X, Edit, NotebookPen, LoaderCircle } from 'lucide-react';

import { RandomPromptCard } from './random-prompt-card';
import { deleteJournalEntry, fetchJournalEntries, saveJournalEntry, updateJournalEntry } from '@/utils/supabase/dbfunctions';
import { toast } from 'react-toastify';
import { IJournalEntries } from '@/utils/supabase/schema';

import { getDate, undoConversion } from '@/lib/utility';





interface NewJournalProps {
  readonly userId: string;
}

export default function NewJournal({ userId }: NewJournalProps) {

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

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <LoaderCircle className="h-12 w-12 text-gray-500 animate-spin" />
    </div>
  );
  if (error) return <div>Error: {error}</div>;

  // Get entries count for each date
  const getEntriesCount = (day: Date) => {
    // Convert the day to UTC midnight for comparison
    const utcDay = new Date(day);

    return entries.filter(entry =>
      isSameDay(utcDay, entry.entry_date)
    ).length;
  };

  // Get entries for the selected date
  const selectedDateEntries = entries.filter(entry =>
    isSameDay(date, entry.entry_date)
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
      setEntries(prevEntries => {
        const updatedEntry = { ...prevEntries.find(entry => entry.id === id)!, journal_text: editingText };
        const filteredEntries = prevEntries.filter(entry => entry.id !== id);
        return [updatedEntry, ...filteredEntries];
      });

      toast.success('Journal entry updated successfully!');
      setEditingEntryId(null);
      setEditingText('');
    } catch (err) {
      toast.error('An error occurred while updating the entry.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
      {/* First Row */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Calendar Card */}
        <Card className="bg-white/50 backdrop-blur-sm rounded-2xl border-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5" />
              Your Journal Calendar
            </CardTitle>
          </CardHeader>
            <CardContent>
            <Calendar
              mode="single"

              selected={undoConversion(date)}

              onSelect={(date: Date | undefined) => date && setDate(date)}
              className="rounded-md flex items-center justify-center"
              components={{
              DayContent: ({ date: dayDate }: { date: Date }) => {
                const count = getEntriesCount(dayDate);
                return (
                <div className="relative w-full h-full p-2">
                  <span>{dayDate.getDate()}</span>
                  {count > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center rounded-full text-[10px] z-50"
                  >
                    {count}
                  </Badge>
                  )}
                </div>
                );
              },
              }}
            />
            </CardContent>
        </Card>

        {/* Journal Entry Form */}
        <Card className="bg-white/50 backdrop-blur-sm rounded-2xl border-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <NotebookPen className="w-5 h-5" />
              New Journal Entry
            </CardTitle>
          </CardHeader>

          <CardContent>
            <RandomPromptCard />
            <TextArea
              placeholder="What's on your mind?"
              value={newEntry}
              onChange={(e) => setNewEntry(e.target.value)}
              className="min-h-[200px]"
            />
          </CardContent>
          <CardFooter>
            <Button onClick={handleSaveEntry} className="w-full">
              <PenLine className="w-4 h-4 mr-2" />
              Save Entry
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Second Row - Entries List */}
      <Card className="bg-white/50 backdrop-blur-sm rounded-2xl border-none">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              Entries for{' '}
              {undoConversion(date).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </CardTitle>
            <Badge variant="secondary">
              {selectedDateEntries.length} {selectedDateEntries.length === 1 ? 'entry' : 'entries'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px] pr-4">
            {selectedDateEntries.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No entries for this date</p>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedDateEntries.map((entry) => (
                  <Card key={entry.id} className="border">
                    <CardContent className="pt-6">
                      {editingEntryId === entry.id ? (
                        <TextArea
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          className="min-h-[150px]"
                        />
                      ) : (
                        <p className="whitespace-pre-wrap">{entry.journal_text}</p>
                      )}
                    </CardContent>
                    <CardFooter className="justify-between">
                      {editingEntryId === entry.id ? (
                        <div className="flex gap-2">
                          <Button variant="outline" onClick={cancelEditing}>
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                          </Button>
                          <Button variant="default" onClick={() => saveEditedEntry(entry.id)}>
                            <Save className="w-4 h-4 mr-2" />
                            Save Entry
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Button variant="outline" onClick={() => startEditing(entry)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Entry
                          </Button>
                          <Button variant="destructive" onClick={() => handleDeleteEntry(entry.id)}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Entry
                          </Button>
                        </div>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}