'use client';

// Core imports
import { useRouter } from 'next/navigation';

// Third party
import { BellRing } from 'lucide-react';

// UI
import { Button } from '@/components/ui/button';

export function ReminderButton() {
  const { push } = useRouter();

  return (
    <Button onClick={() => push('/reminders')} variant="ghost" size="icon">
      <BellRing className="h-5 w-5" />
    </Button>
  );
}
