'use client';

// Core imports
import { useRouter } from 'next/navigation';

// Third party
import { NotebookPen } from 'lucide-react';

// UI
import { Button } from '@/components/ui/button';

export function JournalButton() {
  const { push } = useRouter();

  return (
    <Button onClick={() => push('/journal')} variant="ghost" size="icon">
      <NotebookPen className="h-5 w-5" />
    </Button>
  );
}
