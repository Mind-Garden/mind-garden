'use client'
// Core imports
import React, { useState, useEffect } from 'react';

// Utility
import { selectJournalEntries } from '@/utils/supabase/dbfunctions';

//UI
import renderSlide from '@/components/ui/render-slide';
import SwiperUI from './ui/swiper';
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/navigation';

// Define our data structure for journal entries
export interface JournalEntry {
  id: string;
  user_id: string;
  journal_text: string;
  entry_date: string;
}

/** useJounralEntries(userID: string)
 * Custom hook to manage journal entries with pagination
 * This hook handles loading, storing, and fetching more entries as needed
 */
function useJournalEntries(userId: string) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [currentEntryId, setCurrentEntryId] = useState("");
  const [isLoading, setIsLoading] = useState(false); // used to prevent multiple fetches
  const [hasMore, setHasMore] = useState(true); // used to determine if there are more entries to fetch
  const ENTRIES_PER_PAGE = 5; 


  const fetchMoreEntries = async () => {
    // Prevent fetching more entries if we're already loading or at the end 
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const { data, error } = await selectJournalEntries(userId, currentEntryId);

      if (error) throw error;

      if (data) {
        setEntries(prev => {
          // Prevent duplicate entries by checking IDs
          const newEntries = data as unknown as JournalEntry[];
          const existingIds = new Set(prev.map(entry => entry.id));
          const uniqueNewEntries = newEntries.filter(entry => !existingIds.has(entry.id));
          
          //set the last retrieved entry ID
          const lastEntry = data[data.length - 1] as unknown as JournalEntry;
          if (lastEntry?.id) {
            setCurrentEntryId(lastEntry.id);
          }
          //check if there more entries to fetch
          setHasMore(data.length >= ENTRIES_PER_PAGE);
          return [...prev, ...uniqueNewEntries];
          
        }); 
      }
    } catch (error) {
      console.error('Error fetching journal entries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset everything when userId changes
  useEffect(() => {
    setEntries([]);
    setCurrentEntryId("");
    setHasMore(true);
    fetchMoreEntries();

  }, [userId]); // Add userId as a dependency

  return {
    entries,
    isLoading,
    hasMore,
    fetchMoreEntries
  };
}


/**
 * Main journal component that combines the hook and UI components
 * Handles data fetching and rendering of journal entries
 */
interface JournalSwipeProps {
  readonly userId: string;
}

export function JournalSwipe({ userId }: JournalSwipeProps) {
  // Use our custom hook to manage entries
  const { entries, isLoading, hasMore, fetchMoreEntries } = useJournalEntries(userId);

  return (
    <div>
      <SwiperUI 
        data={entries} 
        renderSlide={renderSlide}
        onReachEnd={() => {
          if (hasMore) {
            fetchMoreEntries();
          }
        }}
      />
      {/* Loading indicator Replace with COLMS at some point*/}
      {isLoading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      )}
    </div>
  );
}