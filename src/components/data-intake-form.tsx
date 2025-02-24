'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  deleteResponses,
  insertResponses,
  selectResponsesByDate,
} from '@/utils/supabase/dbfunctions';
import AttributeIcon from '@/components/attribute-icon';
import ToggleButton from '@/components/toggle-button';
import { Button } from '@/components/ui/button';
import { LoaderCircle } from 'lucide-react';
import { IAttributes, ICategories } from '@/utils/supabase/schema';
import ScaleIcon from '@/components/scale-icon';

interface DataIntakeFormProps {
  userId: string;
  categories: Array<ICategories>;
  attributes: Array<IAttributes>;
}

function DataIntakeForm({
  userId,
  categories,
  attributes,
}: DataIntakeFormProps) {
  const [currentResponses, setCurrentResponses] = useState<Set<string>>(
    new Set(),
  );
  const [currentSelection, setCurrentSelection] = useState<Set<string>>(
    new Set(),
  );
  const [submitting, setSubmitting] = useState(false);
  const [loadingResponses, setLoadingResponses] = useState(true);
  const [completedForm, setCompletedForm] = useState(false);
  const [scaleSelection, setScaleSelection] = useState<number | null>(null);
  const [scaleError, setScaleError] = useState(false);

  // Fetch data
  useEffect(() => {
    let mounted = true;

    async function fetchResponses() {
      try {
        const responses = await selectResponsesByDate(
          userId,
          new Date().toISOString().split('T')[0],
        );

        if (mounted) {
          setCurrentResponses(new Set(responses?.[0]?.attribute_ids ?? []));
          setCurrentSelection(new Set(responses?.[0]?.attribute_ids ?? []));
          setScaleSelection(responses?.[0]?.scale_rating ?? null);
          setLoadingResponses(false);
          if (responses && responses.length > 0) setCompletedForm(true);
        }
      } catch (err) {
        console.error('Error fetching table data:', err);
      }
    }

    fetchResponses();
    return () => {
      mounted = false;
    };
  }, []);

  // Memoized attribute map
  const attributesByCategory = useMemo(() => {
    const map = new Map<string, Array<IAttributes>>();
    if (attributes.length && categories) {
      categories.forEach((category) => {
        map.set(
          category.id,
          attributes.filter((attr) => attr.category_id === category.id),
        );
      });
    }
    return map;
  }, [categories, attributes]);

  // Handle toggling attributes
  const handleToggle = useCallback((attributeId: string) => {
    setCurrentSelection((prev) => {
      const next = new Set(prev);
      next.has(attributeId) ? next.delete(attributeId) : next.add(attributeId);
      return new Set(next);
    });
  }, []);

  // Submit handler
  const handleSubmit = async () => {
    // Prevent multiple submissions at once
    if (submitting) return;

    if (scaleSelection === null) {
      setScaleError(true); // Show error message
      return;
    }

    setSubmitting(true);
    setScaleError(false);
    const removedResponses = new Set(
      [...currentResponses].filter((x) => !currentSelection.has(x)),
    );
    const addedResponses = new Set(
      [...currentSelection].filter((x) => !currentResponses.has(x)),
    );

    // Make sure there is something to submit
    if (addedResponses.size === 0 && removedResponses.size === 0) {
      setSubmitting(false);
      return;
    }

    try {
      await Promise.all([
        addedResponses.size > 0
          ? insertResponses(addedResponses, userId, scaleSelection)
          : Promise.resolve(),
        removedResponses.size > 0
          ? deleteResponses(removedResponses, userId)
          : Promise.resolve(),
      ]);

      setCurrentResponses(new Set(currentSelection));
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setCompletedForm(currentSelection.size !== 0);
      setSubmitting(false);
    }
  };

  const handleScaleToggle = useCallback((rating: number) => {
    setScaleSelection((prev) => (prev === rating ? null : rating));
    if (scaleSelection) setScaleError(false);
  }, []);

  if (loadingResponses) {
    return (
      <div className="flex min-h-screen justify-center items-center">
        <LoaderCircle className="justify-center h-10 w-10 animate-spin min-h-screen" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-2">
      <div className="bg-white/50 backdrop-blur-sm mt-4 mx-4 rounded-full mb-6 py-4 px-2">
        <div className="container mx-auto px-4 py-4 h-16 flex items-center justify-between">
          <div className="flex flex-col items-left pl-2">
            <p className="text-2xl font-semibold text-black">
              Daily Habit Form
            </p>
            {completedForm ? (
              <p className="text-center text-sm text-gray-500">
                You have completed your habit form for the day! You may edit and
                resubmit at any time.
              </p>
            ) : (
              <p className="text-center text-sm text-gray-500">
                You have yet to complete your habit form for the day. Place your
                selections and submit.
              </p>
            )}
          </div>
          <div className="flex items-center gap-4 pr-4">
            <Button
              variant="outline"
              className="rounded-xl bg-transparent border-green-100/50 hover:bg-white/30"
              onClick={handleSubmit}
              disabled={submitting}
            >
              Submit
            </Button>
          </div>
        </div>
      </div>

      {/* Wrap to make them relative for visual effects */}
      <div className="relative">
        {/* Loading spinner */}
        {submitting && (
          <div className="absolute inset-0 bg-gray-100/70 flex items-center justify-center rounded-2xl z-10">
            <LoaderCircle className="h-12 w-12 text-gray-500 animate-spin" />
          </div>
        )}

        {/* Scale Selection */}
        <div
          className={`flex flex-col items-center py-4 bg-white/50 rounded-full mb-6 z-10 transition-opacity ${submitting ? 'opacity-50' : 'opacity-100'}`}
        >
          <p className="font-bold text-xl">Rate your day:</p>
          <div className="flex justify-center gap-4 mt-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <ToggleButton<number>
                key={rating}
                value={rating}
                isSelected={scaleSelection === rating}
                onChange={handleScaleToggle}
                disabled={submitting}
              >
                <ScaleIcon scaleRating={rating} />
              </ToggleButton>
            ))}
          </div>

          {scaleError && (
            <p className="text-red-500 mt-2 text-sm">
              Please select a scale rating before submitting.
            </p>
          )}
        </div>

        {/* Card Grid */}
        <div className={`columns-1 md:columns-2 space-y-4`}>
          {categories.map((category) => {
            const categoryAttributes =
              attributesByCategory.get(category.id) || [];
            if (categoryAttributes.length === 0) return null;

            return (
              <Card
                key={category.id}
                className={`bg-white/50 break-inside-avoid backdrop-blur-sm rounded-2xl border-none relative transition-opacity ${
                  submitting || !scaleSelection
                    ? 'opacity-50 pointer-events-none'
                    : 'opacity-100'
                }`}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{category.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap justify-center gap-2">
                    {categoryAttributes.map((attr: IAttributes) => (
                      <ToggleButton<string>
                        key={attr.id}
                        value={attr.id}
                        isSelected={currentSelection.has(attr.id)}
                        onChange={handleToggle}
                        disabled={submitting || !scaleSelection}
                      >
                        <span className="flex items-center gap-0.5">
                          <AttributeIcon
                            category={category.name}
                            attribute={attr.name}
                          />
                          {attr.name}
                        </span>
                      </ToggleButton>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default React.memo(DataIntakeForm);
