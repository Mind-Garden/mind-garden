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
import { Input } from '@/components/ui/input';
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
  onAddHabit: (categoryId: string, trackingMethod: 'boolean' | 'scale') => void;
}

export default function AddHabitDialog({
  open,
  onOpenChange,
  categories,
  onAddHabit,
}: AddHabitDialogProps) {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [trackingMethod, setTrackingMethod] = useState<'boolean' | 'scale'>(
    'boolean',
  );
  const [error, setError] = useState('');

  const handleSubmit = () => {
    // Validate inputs

    if (!selectedCategory) {
      setError('Please select a category');
      return;
    }

    // Call the onAddHabit function with the form data
    onAddHabit(selectedCategory, trackingMethod);

    // Reset form
    setSelectedCategory('');
    setTrackingMethod('boolean');
    setError('');

    //reload
  };

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

          <div className="grid gap-2">
            <Label>Tracking Method</Label>
            <RadioGroup
              value={trackingMethod}
              onValueChange={(value) =>
                setTrackingMethod(value as 'boolean' | 'scale')
              }
              className="flex flex-col space-y-1"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="boolean" id="tracking-boolean" />
                {categories.find(
                  (category) =>
                    category.id === selectedCategory &&
                    category.name === 'smoking',
                ) ? (
                  <Label htmlFor="tracking-boolean">Did you smoke today?</Label>
                ) : categories.find(
                    (category) =>
                      category.id === selectedCategory &&
                      category.name === 'alcohol',
                  ) ? (
                  <Label htmlFor="tracking-boolean">Did you drink today?</Label>
                ) : categories.find(
                    (category) =>
                      category.id === selectedCategory &&
                      category.name === 'sick',
                  ) ? (
                  <Label htmlFor="tracking-boolean">Were you sick today?</Label>
                ) : (
                  <Label htmlFor="tracking-boolean">Yes/No Question</Label>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="scale" id="tracking-scale" />
                {categories.find(
                  (category) =>
                    category.id === selectedCategory &&
                    category.name === 'smoking',
                ) ? (
                  <Label htmlFor="tracking-scale">
                    How many cigarettes did you have?
                  </Label>
                ) : categories.find(
                    (category) =>
                      category.id === selectedCategory &&
                      category.name === 'alcohol',
                  ) ? (
                  <Label htmlFor="tracking-scale">
                    How many drinks did you have?
                  </Label>
                ) : categories.find(
                    (category) =>
                      category.id === selectedCategory &&
                      category.name === 'sick',
                  ) ? (
                  <Label htmlFor="tracking-scale">
                    How sick did you feel today?
                  </Label>
                ) : (
                  <Label htmlFor="tracking-scale">Scale (1-5)</Label>
                )}
              </div>
            </RadioGroup>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Add Habit</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
