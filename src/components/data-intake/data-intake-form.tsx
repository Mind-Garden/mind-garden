'use client';

import { motion } from 'framer-motion';
import { LoaderCircle, Plus } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

import {
  addResp,
  addUserHabit, // New function to add habits to user's list
  getAddedCategories,
  getAddedResp,
  insertResponses,
  selectResponsesByDate,
  updateResponses,
} from '@/actions/data-intake';
import AddHabitDialog from '@/components/data-intake/add-habit-dialog';
import AttributeIcon from '@/components/data-intake/attribute-icon';
import QuantityTracker from '@/components/data-intake/quantity-tracker';
import ScaleIcon from '@/components/data-intake/scale-icon';
import ToggleButton from '@/components/data-intake/toggle-button';
import YesNoForm from '@/components/data-intake/yes-no-form';
import { Button } from '@/components/shadcn/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/shadcn/card';
import Counter from '@/components/ui/counter';
import FloatingShapes from '@/components/ui/floating-shapes';
import { RatingScale } from '@/components/ui/rating-scale';
import { capitalizeWords, getLocalISOString } from '@/lib/utils';
import type {
  IAddedCategory,
  IAttributes,
  ICategories,
  IPersonalizedCategories,
} from '@/supabase/schema';

interface DataIntakeFormProps {
  userId: string;
  categories: Array<ICategories>;
  attributes: Array<IAttributes>;
  personalizedCategories: Array<IPersonalizedCategories>;
}

function DataIntakeForm({
  userId,
  categories,
  attributes,
  personalizedCategories,
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
  const [showAddHabitDialog, setShowAddHabitDialog] = useState(false);
  const [addedCategories, setAddedCategories] = useState<IAddedCategory[]>();
  const [smoking, setSmoking] = useState(0);
  const [drinks, setDrinks] = useState(0);
  const [sick, setSick] = useState(0);
  const [meals, setMeals] = useState(0);
  const [cooking, setCooking] = useState(0);
  const [smokingBool, setSmokingBool] = useState<boolean | null>(null);
  const [drinksBool, setDrinksBool] = useState<boolean | null>(null);
  const [sickBool, setSickBool] = useState<boolean | null>(null);
  const [breakfastBool, setBreakfastBool] = useState<boolean | null>(null);
  const [lunchBool, setLunchBool] = useState<boolean | null>(null);
  const [dinnerBool, setDinnerBool] = useState<boolean | null>(null);
  const [breakfastCookingBool, setBreakfastCookingBool] = useState<
    boolean | null
  >(null);
  const [lunchCookingBool, setLunchCookingBool] = useState<boolean | null>(
    null,
  );
  const [dinnerCookingBool, setDinnerCookingBool] = useState<boolean | null>(
    null,
  );

  const setVars = async (
    // Set variables for habits like smoking or alcohol
    trackingMethod: Record<string, any>,
    method: string,
    setScaleFunc: (value: number) => void,
    setBoolFunc: (value: boolean | null) => void,
  ) => {
    if (method == 'scale') {
      setScaleFunc(trackingMethod[method]);
    } else if (method == 'boolean') {
      setBoolFunc(trackingMethod[method]);
    }
  };

  const setFoodVars = async (
    // Set variables for habits like meal or cooking
    trackingMethod: Record<string, any>,
    method: string,
    setScaleFunc: (value: number) => void,
    setBreakFunc: (value: boolean | null) => void,
    setLunchFunc: (value: boolean | null) => void,
    setDinnerFunc: (value: boolean | null) => void,
  ) => {
    if (method == 'scale') {
      setScaleFunc(trackingMethod[method]);
    } else if (method == 'breakfast') {
      setBreakFunc(trackingMethod[method]);
    } else if (method == 'lunch') {
      setLunchFunc(trackingMethod[method]);
    } else if (method == 'dinner') {
      setDinnerFunc(trackingMethod[method]);
    }
  };

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
      const addedResponse = await getAddedResp(userId, getLocalISOString());

      if (addedResponse) {
        for (const resp of addedResponse) {
          const name = personalizedCategories.find(
            (cat) => cat.id == resp.habit,
          )?.name;
          const trackingMethod = resp.tracking_method as Record<string, any>;

          for (const method in trackingMethod) {
            // Set variables from responses
            switch (name) {
              case 'smoking':
                setVars(trackingMethod, method, setSmoking, setSmokingBool);
                break;
              case 'alcohol':
                setVars(trackingMethod, method, setDrinks, setDrinksBool);
                break;
              case 'sick':
                setVars(trackingMethod, method, setSick, setSickBool);
                break;
              case 'meal':
                setFoodVars(
                  trackingMethod,
                  method,
                  setMeals,
                  setBreakfastBool,
                  setLunchBool,
                  setDinnerBool,
                );
                break;
              case 'cooking':
                setFoodVars(
                  trackingMethod,
                  method,
                  setCooking,
                  setBreakfastCookingBool,
                  setLunchCookingBool,
                  setDinnerCookingBool,
                );
                break;
            }
          }
        }
      }
      setCurrentSelection(new Set(response?.attribute_ids ?? []));
      setScaleSelection(response?.scale_rating ?? null);
      setResponseId(response?.id ?? null);
      setCompletedForm(!!response);

      const added = await getAddedCategories(userId);
      if (added) setAddedCategories(added);
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

  const updateAddedCategories = (newCategory: string, newTracking: string) => {
    setAddedCategories((prevCategories) => {
      // Check if the category already exists
      const existingCategory = prevCategories?.find(
        (cat) => cat.added_habit === newCategory,
      );

      if (existingCategory) {
        // Update existing category
        return prevCategories?.map((cat) =>
          cat.added_habit === newCategory
            ? {
                ...cat,
                tracking_method: [
                  ...new Set([...cat.tracking_method, newTracking]),
                ], // Prevent duplicates
              }
            : cat,
        );
      } else if (prevCategories) {
        // Add new category
        return [
          ...prevCategories,
          {
            user: userId,
            added_habit: newCategory,
            tracking_method: [newTracking],
          },
        ];
      }
    });
  };

  const insertHabit = async (
    // Insert new habit like smoking or alcohol
    added_habit: string,
    trackingMethod: string[],
    scaleValue: number,
    boolValue: boolean | null,
  ) => {
    let responses = {};
    for (const method of trackingMethod) {
      if (method == 'scale') {
        responses = { ...responses, scale: scaleValue };
      } else {
        responses = { ...responses, boolean: boolValue };
      }
    }
    await addResp(userId, added_habit, responses, getLocalISOString());
  };

  const insertHabitFood = async (
    // Insert new habit like meal or cooking
    added_habit: string,
    trackingMethod: string[],
    scaleValue: number,
    breakfastValue: boolean | null,
    lunchValue: boolean | null,
    dinnerValue: boolean | null,
  ) => {
    let responses = {};
    for (const method of trackingMethod) {
      if (method == 'scale') {
        responses = { ...responses, scale: scaleValue };
      } else if (method == 'breakfast') {
        responses = { ...responses, breakfast: breakfastValue };
      } else if (method == 'lunch') {
        responses = { ...responses, lunch: lunchValue };
      } else if (method == 'dinner') {
        responses = { ...responses, dinner: dinnerValue };
      }
    }
    await addResp(userId, added_habit, responses, getLocalISOString());
  };

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

    //insert new rows.
    addedCategories?.map((category) => {
      const name = personalizedCategories.find(
        (cat) => cat.id == category.added_habit,
      )?.name;
      if (name == 'smoking') {
        insertHabit(
          category.added_habit,
          category.tracking_method,
          smoking,
          smokingBool,
        );
      } else if (name == 'alcohol') {
        insertHabit(
          category.added_habit,
          category.tracking_method,
          drinks,
          drinksBool,
        );
      } else if (name == 'meal') {
        insertHabitFood(
          category.added_habit,
          category.tracking_method,
          meals,
          breakfastBool,
          lunchBool,
          dinnerBool,
        );
      } else if (name == 'cooking') {
        insertHabitFood(
          category.added_habit,
          category.tracking_method,
          cooking,
          breakfastCookingBool,
          lunchCookingBool,
          dinnerCookingBool,
        );
      } else if (name == 'sick') {
        insertHabit(
          category.added_habit,
          category.tracking_method,
          sick,
          sickBool,
        );
      }
    });

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

  // Handle adding a new habit
  const handleAddHabit = async (
    categoryId: string,
    trackingMethod: 'boolean' | 'scale' | 'breakfast' | 'lunch' | 'dinner',
  ) => {
    try {
      // Call to database to save the new habit
      // This would add the habit to the user's list of tracked habits
      const result = await addUserHabit(userId, categoryId, trackingMethod);

      // Refresh the attributes list after adding a new habit
      // Note: In a real implementation, you might want to update the local state
      // or trigger a refetch of the attributes list
      if (result != 'duplicate') {
        updateAddedCategories(categoryId, trackingMethod);

        // Close the dialog
        setShowAddHabitDialog(false);
      } else {
        toast.error('You have already added this habit.');
      }
    } catch (error) {
      console.error('Error adding habit:', error);
    }
  };

  const renderTrackerComponent = (method: string, name: string | undefined) => {
    // Show component based on what habits have been added
    const trackerMap: Record<string, any> = {
      'scale:smoking': (
        <QuantityTracker
          key={method + name}
          value={smoking}
          onChange={setSmoking}
          question="How many cigarettes today?"
          disabled={submitting || !scaleSelection}
        />
      ),
      'scale:alcohol': (
        <QuantityTracker
          key={method + name}
          value={drinks}
          onChange={setDrinks}
          question="How many drinks today?"
          disabled={submitting || !scaleSelection}
        />
      ),
      'scale:meal': (
        <QuantityTracker
          key={method + name}
          value={meals}
          onChange={setMeals}
          question="How many meals today?"
          disabled={submitting || !scaleSelection}
        />
      ),
      'scale:cooking': (
        <QuantityTracker
          key={method + name}
          value={cooking}
          onChange={setCooking}
          question="How many home-cooked meals today?"
          disabled={submitting || !scaleSelection}
        />
      ),
      'scale:sick': (
        <RatingScale
          key={method + name}
          value={sick}
          onChange={setSick}
          leftLabel="Sick"
          rightLabel="Healthy"
          disabled={submitting || !scaleSelection}
        />
      ),
      'boolean:alcohol': (
        <YesNoForm
          key={method + name}
          question="Did you drink today?"
          onChange={setDrinksBool}
          initialValue={drinksBool}
          disabled={submitting || !scaleSelection}
        />
      ),
      'boolean:smoking': (
        <YesNoForm
          key={method + name}
          question="Did you smoke today?"
          onChange={setSmokingBool}
          initialValue={smokingBool}
          disabled={submitting || !scaleSelection}
        />
      ),
      'boolean:sick': (
        <YesNoForm
          key={method + name}
          question="Were you sick today?"
          onChange={setSickBool}
          initialValue={sickBool}
          disabled={submitting || !scaleSelection}
        />
      ),
      'breakfast:meal': (
        <YesNoForm
          key={method + name}
          question="Did you eat breakfast today?"
          onChange={setBreakfastBool}
          initialValue={breakfastBool}
          disabled={submitting || !scaleSelection}
        />
      ),
      'lunch:meal': (
        <YesNoForm
          key={method + name}
          question="Did you eat lunch today?"
          onChange={setLunchBool}
          initialValue={lunchBool}
          disabled={submitting || !scaleSelection}
        />
      ),
      'dinner:meal': (
        <YesNoForm
          key={method + name}
          question="Did you eat dinner today?"
          onChange={setDinnerBool}
          initialValue={dinnerBool}
          disabled={submitting || !scaleSelection}
        />
      ),
      'breakfast:cooking': (
        <YesNoForm
          key={method + name}
          question="Did you make breakfast today?"
          onChange={setBreakfastCookingBool}
          initialValue={breakfastCookingBool}
          disabled={submitting || !scaleSelection}
        />
      ),
      'lunch:cooking': (
        <YesNoForm
          key={method + name}
          question="Did you make lunch today?"
          onChange={setLunchCookingBool}
          initialValue={lunchCookingBool}
          disabled={submitting || !scaleSelection}
        />
      ),
      'dinner:cooking': (
        <YesNoForm
          key={method + name}
          question="Did you make dinner today?"
          onChange={setDinnerCookingBool}
          initialValue={dinnerCookingBool}
          disabled={submitting || !scaleSelection}
        />
      ),
    };

    return (
      trackerMap[`${method}:${name}`] || (
        <div key={method + name}>Something else</div>
      )
    );
  };

  if (loadingSelection) {
    return (
      <div className="flex min-h-screen justify-center items-center">
        <LoaderCircle className="justify-center h-10 w-10 animate-spin min-h-screen" />
      </div>
    );
  }

  return (
    <motion.div
      className="font-body w-full max-w-4xl mx-auto pb-2 rounded-2xl bg-white/50 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header Section */}
      <motion.div
        className="backdrop-blur-sm px-2 rounded-t-2xl"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-4 py-4">
          <motion.div
            className="flex items-center justify-between h-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <p className="text-3xl font-semibold text-black font-title pl-2">
              Daily Habit Form
            </p>
            <div className="flex items-center gap-4 pr-4">
              <motion.div whileHover={{ scale: 1.05 }}>
                <Button
                  variant="outline"
                  className="rounded-xl bg-transparent border-black-100/50 hover:bg-black/10"
                  onClick={() => setShowAddHabitDialog(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Habit
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }}>
                <Button
                  variant="outline"
                  className={`rounded-xl bg-transparent border-black-100/50 ${
                    !submitting && scaleSelection
                      ? 'hover:bg-gradient-to-r from-emerald-200 via-sky-200 to-violet-200'
                      : 'hover:bg-black/10'
                  }`}
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  Submit
                </Button>
              </motion.div>
            </div>
          </motion.div>
          <motion.div
            className="pl-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            {completedForm ? (
              <p className="text-sm text-gray-500">
                You have completed your habit form for the day! You may edit and
                resubmit at any time.
              </p>
            ) : (
              <p className="text-sm text-gray-500">
                You have yet to complete your habit form for the day. Place your
                selections and submit.
              </p>
            )}
          </motion.div>
        </div>
      </motion.div>

      {/* Form Content */}
      <div className="relative px-4">
        {/* Loading Spinner */}
        {submitting && (
          <motion.div
            className="absolute inset-0 bg-gray-100/70 flex items-center justify-center rounded-2xl z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <LoaderCircle className="h-12 w-12 text-gray-500 animate-spin" />
          </motion.div>
        )}

        {/* Scale Selection */}
        <motion.div
          className={`flex flex-col items-center py-4 bg-white/50 rounded-full z-10 transition-opacity ${
            submitting ? 'opacity-50' : 'opacity-100'
          }`}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <p className="font-bold text-xl">Rate Your Day</p>
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
        </motion.div>

        {/* Emotions Category */}
        {emotionsCategory && (
          <motion.div
            className="relative rounded-2xl overflow-hidden p-[2px] mb-5 bg-gradient-to-r from-emerald-300 via-sky-300 to-violet-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Card
              key={emotionsCategory.id}
              className={`bg-white rounded-[14px] h-full overflow-hidden border-none break-inside-avoid backdrop-blur-sm relative transition-opacity ${
                submitting || !scaleSelection ? 'text-gray-500 bg-gray-100' : ''
              }`}
            >
              {!submitting && scaleSelection && (
                <FloatingShapes
                  colors={['bg-emerald-200', 'bg-teal-200', 'bg-violet-200']}
                />
              )}
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-semibold">
                  {capitalizeWords(emotionsCategory.name)}
                </CardTitle>
                <p className="text-sm text-muted-foreground my-1">
                  How did you feel today?
                </p>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap justify-center gap-2">
                  {attributesByCategory
                    .get(emotionsCategory.id)
                    ?.map((attr) => (
                      <ToggleButton<string>
                        key={attr.id}
                        value={attr.id}
                        isSelected={currentSelection.has(attr.id)}
                        onChange={handleToggle}
                        disabled={submitting || !scaleSelection}
                      >
                        <span className="flex items-center">
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
          </motion.div>
        )}

        {/* Card Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          {/* School Category Card */}
          {schoolCategory && (
            <motion.div
              className="relative rounded-2xl overflow-hidden p-[2px] bg-gradient-to-r from-emerald-300 via-sky-300 to-violet-300"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <Card
                key={schoolCategory.id}
                className={`bg-white rounded-[14px] h-full overflow-hidden border-none break-inside-avoid backdrop-blur-sm relative transition-opacity ${
                  submitting || !scaleSelection
                    ? 'text-gray-500 bg-gray-100'
                    : ''
                }`}
              >
                {!submitting && scaleSelection && (
                  <FloatingShapes
                    colors={['bg-emerald-200', 'bg-teal-200', 'bg-violet-200']}
                  />
                )}
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">
                    {capitalizeWords(schoolCategory.name)}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    How many hours did you study today?
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
                      How would you rate your school day?
                    </label>
                    <RatingScale
                      value={studyRating ?? 0}
                      onChange={setStudyRating}
                      leftLabel="Poor"
                      rightLabel="Excellent"
                      disabled={submitting || !scaleSelection}
                    />
                  </div>
                  <div className="flex flex-wrap justify-center gap-2 border-t pt-4">
                    {attributesByCategory
                      .get(schoolCategory.id)
                      ?.map((attr) => (
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
            </motion.div>
          )}

          {/* Work Category Card */}
          {workCategory && (
            <motion.div
              className="relative rounded-2xl overflow-hidden p-[2px] bg-gradient-to-r from-emerald-300 via-sky-300 to-violet-300"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              <Card
                key={workCategory.id}
                className={`bg-white rounded-[14px] h-full overflow-hidden border-none break-inside-avoid backdrop-blur-sm relative transition-opacity ${
                  submitting || !scaleSelection
                    ? 'text-gray-500 bg-gray-100'
                    : ''
                }`}
              >
                {!submitting && scaleSelection && (
                  <FloatingShapes
                    colors={['bg-emerald-200', 'bg-teal-200', 'bg-violet-200']}
                  />
                )}
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">
                    {capitalizeWords(workCategory.name)}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    How many hours did you work today?
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
                      How would you rate your work day?
                    </label>
                    <RatingScale
                      value={workRating ?? 0}
                      onChange={setWorkRating}
                      leftLabel="Poor"
                      rightLabel="Excellent"
                      disabled={submitting || !scaleSelection}
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
            </motion.div>
          )}

          {/* Water Intake Card */}
          <motion.div
            className="relative rounded-2xl overflow-hidden p-[2px] bg-gradient-to-r from-emerald-300 via-sky-300 to-violet-300"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <Card
              className={`bg-white rounded-[14px] h-full overflow-hidden border-none break-inside-avoid backdrop-blur-sm relative transition-opacity ${
                submitting || !scaleSelection ? 'text-gray-500 bg-gray-100' : ''
              }`}
            >
              {!submitting && scaleSelection && (
                <FloatingShapes
                  colors={['bg-emerald-200', 'bg-teal-200', 'bg-violet-200']}
                />
              )}
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Water</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  How many cups of water did you drink today?
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-center gap-4">
                  <Counter
                    value={water ?? 0}
                    onChange={setWater}
                    disabled={submitting || !scaleSelection}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Additional Categories */}
          {addedCategories &&
            addedCategories.map((category, index) => {
              const name = personalizedCategories.find(
                (cat) => cat.id == category.added_habit,
              )?.name;
              const methods = category.tracking_method;
              return (
                <motion.div
                  key={name}
                  className="relative rounded-2xl overflow-hidden p-[2px] bg-gradient-to-r from-emerald-300 via-sky-300 to-violet-300"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.9 + index * 0.1, duration: 0.5 }}
                >
                  <Card
                    className={`bg-white rounded-[14px] break-inside-avoid backdrop-blur-sm border-none relative transition-opacity w-full h-full opacity-100
                        ${submitting || !scaleSelection ? 'text-gray-500 bg-gray-100' : ''}`}
                  >
                    {!submitting && scaleSelection && (
                      <FloatingShapes
                        colors={[
                          'bg-emerald-200',
                          'bg-teal-200',
                          'bg-violet-200',
                        ]}
                      />
                    )}
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">
                        {capitalizeWords(name ?? '')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {methods.map((method) =>
                        renderTrackerComponent(method, name),
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
        </motion.div>
      </div>

      {/* Add Habit Dialog */}
      <AddHabitDialog
        open={showAddHabitDialog}
        onOpenChange={setShowAddHabitDialog}
        categories={personalizedCategories}
        onAddHabit={handleAddHabit}
      />
    </motion.div>
  );
}

export default React.memo(DataIntakeForm);
