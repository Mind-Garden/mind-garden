'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { IPersonalizedCategories } from '@/supabase/schema';

interface AddHabitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Array<IPersonalizedCategories>;
  onAddHabit: (
    categoryId: string,
    trackingMethod: 'boolean' | 'scale' | 'breakfast' | 'lunch' | 'dinner',
  ) => void;
}

const trackingOptions: Record<string, { value: string; label: string }[]> = {
  smoking: [
    { value: 'boolean', label: 'Did you smoke today?' },
    { value: 'scale', label: 'How many cigarettes did you have?' },
  ],
  alcohol: [
    { value: 'boolean', label: 'Did you drink today?' },
    { value: 'scale', label: 'How many drinks did you have?' },
  ],
  sick: [
    { value: 'boolean', label: 'Were you sick today?' },
    { value: 'scale', label: 'How sick did you feel today?' },
  ],
  meal: [
    { value: 'breakfast', label: 'Did you eat breakfast?' },
    { value: 'lunch', label: 'Did you eat lunch?' },
    { value: 'dinner', label: 'Did you eat dinner?' },
    { value: 'scale', label: 'How many meals did you have today?' },
  ],
  cooking: [
    { value: 'breakfast', label: 'Did you make breakfast?' },
    { value: 'lunch', label: 'Did you make lunch?' },
    { value: 'dinner', label: 'Did you make dinner?' },
    { value: 'scale', label: 'How many meals did you cook today?' },
  ],
};

export default function AddHabitDialog({
  open,
  onOpenChange,
  categories,
  onAddHabit,
}: AddHabitDialogProps) {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [trackingMethod, setTrackingMethod] = useState<
    'boolean' | 'scale' | 'breakfast' | 'lunch' | 'dinner'
  >('boolean');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!selectedCategory) {
      setError('Please select a category');
      return;
    }

    onAddHabit(selectedCategory, trackingMethod);
    onOpenChange(false);
    setSelectedCategory('');
    setTrackingMethod('boolean');
    setError('');
  };

  const selectedCategoryName =
    categories.find((category) => category.id === selectedCategory)?.name || '';
  const options = trackingOptions[selectedCategoryName] || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Habit</DialogTitle>
          <DialogDescription>
            Create a new habit to track in your daily form.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {selectedCategory && (
            <div className="grid gap-2">
              <Label>Tracking Method</Label>
              <RadioGroup
                value={trackingMethod}
                onValueChange={(value) =>
                  setTrackingMethod(value as typeof trackingMethod)
                }
                className="flex flex-col space-y-1"
              >
                {options.length > 0 ? (
                  options.map(({ value, label }) => (
                    <div key={value} className="mb-1">
                      <RadioGroupItem value={value} id={`tracking-${value}`} />
                      <Label className="ml-1" htmlFor={`tracking-${value}`}>
                        {label}
                      </Label>
                    </div>
                  ))
                ) : (
                  <Label>Please choose a category.</Label>
                )}
              </RadioGroup>
            </div>
          )}
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>Add Habit</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
