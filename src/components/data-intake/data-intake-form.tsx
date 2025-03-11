'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  insertResponses,
  selectResponsesByDate,
  updateResponses,
} from '@/actions/data-intake';
import AttributeIcon from '@/components/data-intake/attribute-icon';
import ToggleButton from '@/components/data-intake/toggle-button';
import { Button } from '@/components/ui/button';
import { LoaderCircle } from 'lucide-react';
import { IAttributes, ICategories } from '@/supabase/schema';
import ScaleIcon from '@/components/data-intake/scale-icon';
import { getLocalISOString } from '@/lib/utils';

import CounterCard from '@/components/ui/counter-card';
import Counter from '@/components/ui/counter';
import { RatingScale } from '@/components/ui/rating-scale';

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
  const [currentSelection, setCurrentSelection] = useState<Set<string>>(
    new Set(),
  );
  const [responseId, setResponseId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loadingSelection, setLoadingSelection] = useState(true);
  const [completedForm, setCompletedForm] = useState(false);
  const [scaleSelection, setScaleSelection] = useState<number | null>(null);
  const [scaleError, setScaleError] = useState(false);
  const [water, setWater] = useState<number | null>(null);
  const [studyHours, setStudyHours] = useState<number | null>(null);
  const [studyRating, setStudyRating] = useState<number | null>(null);
  const [workHours, setWorkHours] = useState<number | null>(null);
  const [workRating, setWorkRating] = useState<number | null>(null);

  const emotionsCategory = categories.find(
    (category) => category.name === 'emotions',
  );
  const workCategory = categories.find((category) => category.name === 'work');
  const schoolCategory = categories.find(
    (category) => category.name === 'school',
  );

  // Fetch function extracted
  const fetchResponses = useCallback(async () => {
    setLoadingSelection(true); // Show loading state during re-fetch
    try {
      const response = await selectResponsesByDate(userId, getLocalISOString());
      setCurrentSelection(new Set(response?.attribute_ids ?? []));
      setScaleSelection(response?.scale_rating ?? null);
      setResponseId(response?.id ?? null);
      setCompletedForm(!!response);
      setWater(response?.water ?? null);
      setStudyHours(response?.study_hours ?? null);
      setStudyRating(response?.study_rating ?? null);
      setWorkHours(response?.work_hours ?? null);
      setWorkRating(response?.work_rating ?? null);
    } catch (err) {
      console.error('Error fetching table data:', err);
    } finally {
      setLoadingSelection(false);
    }
  }, [userId]);

  // Initial fetch in useEffect
  useEffect(() => {
    fetchResponses();
  }, [fetchResponses]);

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
  const handleSubmit = async (): Promise<void> => {
    // Prevent multiple submissions at once
    if (submitting) return;

    if (scaleSelection === null) {
      setScaleError(true); // Show error message
      return;
    }

    setSubmitting(true);
    setScaleError(false);

    try {
      if (!responseId) {
        // Insert new selection if no previous responses exist
        await insertResponses(
          currentSelection,
          userId,
          scaleSelection,
          water,
          workHours,
          workRating,
          studyHours,
          studyRating,
        );
      } else {
        // Update if both responses already exist
        await updateResponses(
          responseId,
          currentSelection,
          userId,
          scaleSelection,
          water,
          workHours,
          workRating,
          studyHours,
          studyRating,
        );
      }
      await fetchResponses();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setCompletedForm(currentSelection.size !== 0);
      setSubmitting(false);
    }
  };

  const handleScaleToggle = useCallback((rating: number): void => {
    setScaleSelection((prev) => (prev === rating ? null : rating));
    if (scaleSelection) setScaleError(false);
  }, []);

  if (loadingSelection) {
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
          <p className="font-bold text-xl">Rate Your Day:</p>
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
        {/* Emotions Category */}
        {emotionsCategory && (
          <Card
            key={emotionsCategory.id}
            className={`bg-white/50 break-inside-avoid backdrop-blur-sm rounded-2xl border-none mb-6 relative transition-opacity ${
              submitting || !scaleSelection
                ? 'opacity-50 pointer-events-none'
                : 'opacity-100'
            }`}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{emotionsCategory.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap justify-center gap-2">
                {attributesByCategory.get(emotionsCategory.id)?.map((attr) => (
                  <ToggleButton<string>
                    key={attr.id}
                    value={attr.id}
                    isSelected={currentSelection.has(attr.id)}
                    onChange={handleToggle}
                    disabled={submitting || !scaleSelection}
                  >
                    <span className="flex items-center gap-0.5">
                      <AttributeIcon
                        category={emotionsCategory.name}
                        attribute={attr.name}
                      />
                      {attr.name}
                    </span>
                  </ToggleButton>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Card Grid */}
        <div className={'columns-1 md:columns-2 space-y-4'}>
          {/* School Category Card */}
          {schoolCategory && (
            <Card
              key={schoolCategory.id}
              className={`bg-white/50 break-inside-avoid backdrop-blur-sm rounded-2xl border-none mb-6 relative transition-opacity ${
                submitting || !scaleSelection
                  ? 'opacity-50 pointer-events-none'
                  : 'opacity-100'
              }`}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{schoolCategory.name}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {'How many hours did you study today?'}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 pt-4 pb-4">
                  <Counter
                    value={studyHours ?? 0}
                    onChange={setStudyHours}
                    disabled={submitting || !scaleSelection}
                  />
                </div>
                <div className="space-y-3 border-t pt-4 pb-4">
                  <label className="text-sm font-medium">
                    {'How would you rate your school day?'}
                  </label>
                  <RatingScale
                    value={studyRating ?? 0}
                    onChange={setStudyRating}
                    leftLabel="Poor"
                    rightLabel="Excellent"
                  />
                </div>
                <div className="flex flex-wrap justify-center gap-2 border-t pt-4">
                  {attributesByCategory.get(schoolCategory.id)?.map((attr) => (
                    <ToggleButton<string>
                      key={attr.id}
                      value={attr.id}
                      isSelected={currentSelection.has(attr.id)}
                      onChange={handleToggle}
                      disabled={submitting || !scaleSelection}
                    >
                      <span className="flex items-center gap-0.5">
                        <AttributeIcon
                          category={schoolCategory.name}
                          attribute={attr.name}
                        />
                        {attr.name}
                      </span>
                    </ToggleButton>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Work Category Card */}
          {workCategory && (
            <Card
              key={workCategory.id}
              className={`bg-white/50 break-inside-avoid backdrop-blur-sm rounded-2xl border-none mb-6 relative transition-opacity ${
                submitting || !scaleSelection
                  ? 'opacity-50 pointer-events-none'
                  : 'opacity-100'
              }`}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{workCategory.name}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {'How many hours did you work today?'}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 pt-4 pb-4">
                  <Counter
                    value={workHours ?? 0}
                    onChange={setWorkHours}
                    disabled={submitting || !scaleSelection}
                  />
                </div>
                <div className="space-y-3 border-t pt-4 pb-4">
                  <label className="text-sm font-medium">
                    {'How would you rate your work day?'}
                  </label>
                  <RatingScale
                    value={workRating ?? 0}
                    onChange={setWorkRating}
                    leftLabel="Poor"
                    rightLabel="Excellent"
                  />
                </div>
                <div className="flex flex-wrap justify-center gap-2 border-t pt-4">
                  {attributesByCategory.get(workCategory.id)?.map((attr) => (
                    <ToggleButton<string>
                      key={attr.id}
                      value={attr.id}
                      isSelected={currentSelection.has(attr.id)}
                      onChange={handleToggle}
                      disabled={submitting || !scaleSelection}
                    >
                      <span className="flex items-center gap-0.5">
                        <AttributeIcon
                          category={workCategory.name}
                          attribute={attr.name}
                        />
                        {attr.name}
                      </span>
                    </ToggleButton>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Water Intake Card*/}
          <CounterCard
            title="water"
            description="How many cups of water did you drink today?"
            value={water ?? 0}
            onChange={setWater}
            disabled={submitting || !scaleSelection}
          />
        </div>
      </div>
    </div>
  );
}

export default React.memo(DataIntakeForm);
