'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface SickRatingProps {
  onChange: (value: number) => void;
}

const ratingStyles: Record<number, string> = {
  1: 'bg-green-100 hover:bg-green-200 text-green-800',
  2: 'bg-lime-100 hover:bg-lime-200 text-lime-800',
  3: 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800',
  4: 'bg-orange-100 hover:bg-orange-200 text-orange-800',
  5: 'bg-red-100 hover:bg-red-200 text-red-800',
};

const activeRatingStyles: Record<number, string> = {
  1: 'bg-green-200 text-green-900',
  2: 'bg-lime-200 text-lime-900',
  3: 'bg-yellow-200 text-yellow-900',
  4: 'bg-orange-200 text-orange-900',
  5: 'bg-red-200 text-red-900',
};

export default function SickRating({ onChange }: SickRatingProps) {
  const [rating, setRating] = useState<number | null>(null);

  const handleRatingClick = (value: number) => {
    setRating(value);
    onChange(value);
  };

  return (
    <Card className="py-2 px-3 bg-white/10 backdrop-blur-sm rounded-xl">
      <CardContent>
        <div className="grid grid-cols-5 gap-2 mt-5">
          {[1, 2, 3, 4, 5].map((value) => (
            <Button
              key={value}
              type="button"
              variant={rating === value ? 'default' : 'outline'}
              className={cn(
                'h-16 relative ring-offset-2',
                ratingStyles[value],
                rating === value &&
                  `ring-2 ring-ring ${activeRatingStyles[value]}`,
              )}
              onClick={() => handleRatingClick(value)}
            >
              <span>{value}</span>
            </Button>
          ))}
        </div>
        <div className="flex items-center justify-between mt-2 mb-1 text-xs">
          <span>Healthy</span>
          <span>Very Sick</span>
        </div>
      </CardContent>
    </Card>
  );
}
