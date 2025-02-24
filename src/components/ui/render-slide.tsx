'use client';

// UI components
import { JournalEntry } from '@/components/journal-swipe';
import { JournalEntryEditCard } from '../journal-edit';

const renderSlide = (item: JournalEntry) => {
  return <JournalEntryEditCard {...item} />;
};

export default renderSlide;
