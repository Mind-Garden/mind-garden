'use client';

import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  startOfMonth,
  subMonths,
} from 'date-fns';
import { AnimatePresence, motion, type PanInfo } from 'framer-motion';
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';

import {
  getAddedCategories,
  getAllAddedRespCategory,
  getPersonalizedCategories,
} from '@/actions/data-intake';
import { getDataHeatmap } from '@/actions/data-visualization';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type {
  IAddedCategory,
  IAddedResp,
  IPersonalizedCategories,
} from '@/supabase/schema';

type Data = {
  date: string;
  journal_text: string;
  start: string;
  scale_rating: string;
};

interface HeatmapProps {
  readonly userId: string;
  readonly personalized: boolean;
}

export default function Heatmap({ userId, personalized }: HeatmapProps) {
  // State to track the current month being displayed
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [habitData, setHabitData] =
    useState<Record<string, IAddedResp[] | null>>();
  const [data, setData] = useState<Data[] | null>(null);
  const [addHabit, setAddedHabit] = useState<IAddedCategory[] | null>();
  const [personalizedCategories, setpersonalizedCategories] = useState<
    IPersonalizedCategories[] | null
  >();
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [trackingMethodsByCategory, setTrackingMethodsByCategory] = useState<
    Record<string, string[]>
  >({});

  useEffect(() => {
    const fetchData = async () => {
      if (personalized) {
        const addedHabits = await getAddedCategories(userId);
        setAddedHabit(addedHabits);
        const personalizedCategories = await getPersonalizedCategories();
        setpersonalizedCategories(personalizedCategories);
        let boolResp = {};

        if (addedHabits && personalizedCategories) {
          for (const resp of addedHabits) {
            const name = personalizedCategories.find(
              (cat) => cat.id == resp.added_habit,
            )?.name;
            if (name && resp.tracking_method.includes('boolean')) {
              //get data for category.added_habit that is yes/no question
              const catResp = await getAllAddedRespCategory(
                userId,
                resp.added_habit,
              );

              boolResp = { ...boolResp, [name]: catResp };
            } else if (
              (name && resp.tracking_method.includes('breakfast')) ||
              resp.tracking_method.includes('lunch') ||
              resp.tracking_method.includes('dinner')
            ) {
              // get data for category.added_habit that is yes/no question
              const catResp = await getAllAddedRespCategory(
                userId,
                resp.added_habit,
              );

              if (name) {
                boolResp = { ...boolResp, [name]: catResp };
              }
            }
          }
        }

        setHabitData(boolResp);

        // Set up categories and tracking methods
        if (boolResp) {
          const categoryNames = Object.keys(boolResp);
          setCategories(categoryNames);

          const methodsMap: Record<string, string[]> = {};
          categoryNames.forEach((category) => {
            methodsMap[category] = getTrackingMethodsForCategory(
              category,
              addedHabits,
              personalizedCategories,
            );
          });

          setTrackingMethodsByCategory(methodsMap);
        }
      } else {
        const habitData = await getDataHeatmap(userId);
        setData(habitData.data);
      }
    };
    fetchData();
  }, [userId]);

  // Get all days in the current month
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Calculate the day of the week for the first day of the month (0 = Sunday, 6 = Saturday)
  const startDay = getDay(monthStart);

  // Navigation functions for changing months
  const previousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  // Navigation functions for changing categories
  const previousCategory = () => {
    if (categories.length === 0) return;
    setDirection(-1);
    setCurrentCategoryIndex((prev) =>
      prev === 0 ? categories.length - 1 : prev - 1,
    );
  };

  const nextCategory = () => {
    if (categories.length === 0) return;
    setDirection(1);
    setCurrentCategoryIndex((prev) =>
      prev === categories.length - 1 ? 0 : prev + 1,
    );
  };

  // Function to get habit data for a specific date
  const getHabitDataForDate = (category: string, date: Date) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    let out;
    if (habitData && habitData[category]) {
      out = habitData[category]?.find(
        (data) => data.entry_date === formattedDate,
      );
    }
    return out;
  };

  // Function to calculate the completion value for a day
  const getValue = (method: string, data?: IAddedResp) => {
    if (data && data.tracking_method) {
      return data.tracking_method[method];
    }
    return false;
  };

  // Function to get the appropriate background color based on completion value
  const getBackgroundColor = (value: boolean) => {
    if (!value) return 'bg-muted';
    if (value) return '!bg-green-500';
    return '!bg-green-700';
  };

  const getDataForDate = (date: Date) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    return data?.find((data) => data.date === formattedDate);
  };

  // Function to calculate the completion percentage for a day
  const getCompletionPercentage = (data?: Data) => {
    if (!data) return 0;
    const completed = [data.journal_text, data.start, data.scale_rating].filter(
      (item) => item != null,
    ).length;
    return (completed / 3) * 100;
  };

  // Function to get the appropriate background color based on completion percentage
  const getBackgroundColorData = (percentage: number) => {
    if (percentage === 0) return 'bg-muted';
    if (percentage <= 34) return '!bg-blue-300';
    if (percentage <= 67) return '!bg-blue-500';
    return '!bg-blue-700';
  };

  // Function to get all tracking methods for a category
  const getTrackingMethodsForCategory = (
    category: string,
    habits?: IAddedCategory[] | null,
    personalized?: IPersonalizedCategories[] | null,
  ): string[] => {
    const habitsToUse = habits || addHabit;
    const personalizedToUse = personalized || personalizedCategories;

    if (
      habitsToUse &&
      personalizedToUse &&
      (category == 'meal' || category == 'cooking')
    ) {
      let out: string[] = [];
      for (const cat of habitsToUse) {
        const name = personalizedToUse.find(
          (c) => c.id == cat.added_habit,
        )?.name;
        if (name == 'meal' || name === 'cooking') {
          if (
            cat.tracking_method.includes('breakfast') &&
            !out.includes('breakfast')
          ) {
            out = [...out, 'breakfast'];
          }
          if (cat.tracking_method.includes('lunch') && !out.includes('lunch')) {
            out = [...out, 'lunch'];
          }
          if (
            cat.tracking_method.includes('dinner') &&
            !out.includes('dinner')
          ) {
            out = [...out, 'dinner'];
          }
        }
      }
      return out;
    }
    return ['boolean']; // Default for other categories
  };

  // Swipe handlers
  const handleDragEnd = (
    e: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    setIsDragging(false);

    const swipe =
      Math.abs(info.offset.x) > 50 || Math.abs(info.velocity.x) > 0.3;

    if (swipe && personalized) {
      if (info.offset.x > 0) {
        previousCategory();
      } else {
        nextCategory();
      }
    } else if (swipe && !personalized) {
      if (info.offset.x > 0) {
        previousMonth();
      } else {
        nextMonth();
      }
    }
  };

  // Animation variants
  const containerVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -1000 : 1000,
      opacity: 0,
    }),
  };

  // Day variants for animations
  const dayVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: (index: number) => ({
      scale: 1,
      opacity: 1,
      transition: {
        delay: index * 0.01,
        duration: 0.2,
      },
    }),
    hover: { scale: 1.1, transition: { duration: 0.2 } },
  };

  // Render the calendar grid for a specific category and tracking method
  const renderHeatmap = (category: string, trackingMethod: string) => {
    let displayName = '';
    let key = 'heatmap';
    if (personalized) {
      displayName =
        trackingMethod === 'boolean'
          ? category
          : `${category} - ${trackingMethod}`;

      key = `${category}-${trackingMethod}`;
    }

    return (
      <div key={key} className="mb-10 font-body">
        <h3 className="text-xl font-semibold mb-4 capitalize">{displayName}</h3>

        {/* Day labels */}
        <div className="grid grid-cols-7 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center text-sm font-medium">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells for days before the start of the month */}
          {Array.from({ length: startDay }).map((_, index) => (
            <div key={`empty-${index}`} className="aspect-square"></div>
          ))}

          {/* Days of the month */}
          <TooltipProvider>
            {daysInMonth.map((day, index) => {
              let dayData;
              let dayDataResp;
              let completionValue;
              let backgroundColor;
              if (personalized) {
                dayDataResp = getHabitDataForDate(category, day);
                completionValue = getValue(trackingMethod, dayDataResp);
                backgroundColor = getBackgroundColor(completionValue);
              } else {
                dayData = getDataForDate(day);
                completionValue = getCompletionPercentage(dayData);
                backgroundColor = getBackgroundColorData(completionValue);
              }
              return (
                <Tooltip
                  key={day.toString()}
                  delayDuration={isDragging ? 1000 : 300}
                >
                  <TooltipTrigger asChild>
                    <motion.div
                      className={cn(
                        'aspect-square rounded-md flex items-center justify-center cursor-pointer transition-colors',
                        backgroundColor,
                      )}
                      variants={dayVariants}
                      initial="initial"
                      animate="animate"
                      whileHover="hover"
                      custom={index}
                    >
                      <span className="text-sm">{format(day, 'd')}</span>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-sm">
                      <p className="font-medium">
                        {format(day, 'MMMM d, yyyy')}
                      </p>
                      {dayData ? (
                        <div className="mt-1">
                          {personalized && (
                            <p>
                              {trackingMethod === 'boolean'
                                ? category
                                : `${category} - ${trackingMethod}`}
                              : {completionValue ? '✅' : '❌'}
                            </p>
                          )}
                          {!personalized && (
                            <div className="mt-1">
                              <p>
                                Journal: {dayData.journal_text ? '✅' : '❌'}
                              </p>
                              <p>
                                Data Intake:{' '}
                                {dayData.scale_rating ? '✅' : '❌'}
                              </p>
                              <p>Sleep: {dayData.start ? '✅' : '❌'}</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="mt-1">No data recorded</p>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </TooltipProvider>
        </div>
      </div>
    );
  };

  // Get current category and its tracking methods
  const currentCategory = categories[currentCategoryIndex] || '';
  const currentTrackingMethods =
    trackingMethodsByCategory[currentCategory] || [];

  return personalized ? (
    <div className="w-full max-w-3xl mx-auto p-4 font-body">
      <div className="flex flex-col items-center justify-center mb-6 space-y-2">
        {/* Month Navigation */}
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" onClick={previousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <motion.h3
            key={format(currentMonth, 'MMMM-yyyy')}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-lg font-medium min-w-[140px] text-center"
          >
            {format(currentMonth, 'MMMM yyyy')}
          </motion.h3>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        {/* Swipe Text animation */}
        <motion.div
          className="text-gray-500 text-sm text-center"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: [0, 1, 0] }}
          transition={{
            opacity: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
          }}
        >
          Swipe to see habits tracked
        </motion.div>
      </div>

      {/* Category navigation */}
      {categories.length > 0 && personalized && (
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={previousCategory}
            className="flex items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous Habit
          </Button>
          <motion.div
            key={currentCategory}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-base font-medium"
          >
            {currentCategoryIndex + 1} / {categories.length}
          </motion.div>
          <Button
            variant="outline"
            size="sm"
            onClick={nextCategory}
            className="flex items-center gap-1"
          >
            Next Habit
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Swipeable container for heatmaps */}
      {personalized && (
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentCategory}
            custom={direction}
            variants={containerVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.1}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={handleDragEnd}
            className="touch-pan-y"
          >
            {/* Render heatmaps for current category and its tracking methods */}
            {currentCategory &&
              renderHeatmap &&
              currentTrackingMethods.map((method) =>
                renderHeatmap(currentCategory, method),
              )}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Mobile swipe indicator */}
      {categories.length > 1 && personalized && (
        <div className="mt-6 text-center text-sm text-muted-foreground md:hidden">
          <p>Swipe left or right to change habits</p>
        </div>
      )}

      {/* Show loading or empty state if no data */}
      {personalized && !habitData && (
        <div className="text-center py-10">
          <p>Loading habit data...</p>
        </div>
      )}

      {personalized && habitData && Object.keys(habitData).length === 0 && (
        <div className="text-center py-10">
          <p>No habit categories found.</p>
        </div>
      )}
    </div>
  ) : (
    <div className="w-full max-w-3xl mx-auto p-4 font-body">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Daily Progress</h2>
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" onClick={previousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <motion.h3
            key={format(currentMonth, 'MMMM-yyyy')}
            initial={{ opacity: 0, y: direction > 0 ? 20 : -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-lg font-medium min-w-[140px] text-center"
          >
            {format(currentMonth, 'MMMM yyyy')}
          </motion.h3>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* render heatmap*/}
      <div className="mb-6">{data && renderHeatmap('', '')}</div>

      {/* Mobile swipe indicator */}
      <div className="mt-6 text-center text-sm text-muted-foreground md:hidden">
        <p>Swipe left or right to change months</p>
      </div>
    </div>
  );
}
