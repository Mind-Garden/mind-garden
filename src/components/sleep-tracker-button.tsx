'use client';

// Core imports
import { useRouter } from 'next/navigation';

// Third party
import { Moon } from 'lucide-react';

// UI
import { Button } from '@/components/ui/button';

export function SleepTrackerButton() {
  const { push } = useRouter();

  return (
    <Button onClick={() => push('/sleep-tracker')} variant="ghost" size="icon">
      <Moon className="h-5 w-5" />
    </Button>
  );
}
