'use client';

import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
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
import { Button } from '@/components/ui/button';
import AnimatedLineGraph from '@/components/ui/line-graph';
import type { DataPoint, IAddedResp } from '@/supabase/schema';

interface HabitLineChartProps {
  readonly userId: string;
}

export default function HabitLineCharts({ userId }: HabitLineChartProps) {
  // State to track the current month being displayed
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [habitData, setHabitData] =
    useState<Record<string, IAddedResp[] | null>>();
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [trackingMethodsByCategory, setTrackingMethodsByCategory] = useState<
    Record<string, string[]>
  >({});

  useEffect(() => {
    const fetchData = async () => {
      const addedHabits = await getAddedCategories(userId);
      const personalizedCategories = await getPersonalizedCategories();
      let quantitativeResp = {};

      if (addedHabits && personalizedCategories) {
        for (const resp of addedHabits) {
          const name = personalizedCategories.find(
            (cat) => cat.id == resp.added_habit,
          )?.name;
          if (name && resp.tracking_method.includes('scale')) {
            //get data for category.added_habit that is quantitative
            const catResp = await getAllAddedRespCategory(
              userId,
              resp.added_habit,
            );

            quantitativeResp = { ...quantitativeResp, [name]: catResp };
          }
        }
      }

      setHabitData(quantitativeResp);

      // Set up categories and tracking methods
      if (quantitativeResp) {
        const categoryNames = Object.keys(quantitativeResp);
        setCategories(categoryNames);

        const methodsMap: Record<string, string[]> = {};
        categoryNames.forEach((category) => {
          methodsMap[category] = ['scale'];
        });

        setTrackingMethodsByCategory(methodsMap);
      }
    };
    fetchData();
  }, [userId]);

  // Get all days in the current month
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

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

  // Swipe handlers
  const handleDragEnd = (
    e: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    setIsDragging(false);

    const swipe =
      Math.abs(info.offset.x) > 50 || Math.abs(info.velocity.x) > 0.3;

    if (swipe) {
      if (info.offset.x > 0) {
        previousCategory();
      } else {
        nextCategory();
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

  // Fetches data for the current month being displayed in DataPoint format for the line chart
  const getMonthData = (category: string, trackingMethod: string) => {
    const data: DataPoint[] = daysInMonth
      .map((day) => {
        const habitData = getHabitDataForDate(category, day);
        const entryDate = habitData?.entry_date;
        const value = getValue(trackingMethod, habitData);

        // Skip this entry if either entryDate or value is null or undefined
        if (!entryDate || value === null || value === undefined) return null;

        return {
          x: entryDate,
          y: value,
        };
      })
      .filter((item): item is DataPoint => item !== null);

    return data;
  };

  // Render the line charts for a category
  const renderCharts = (category: string, trackingMethod: string) => {
    const displayName =
      trackingMethod === 'scale' ? category : `${category} - ${trackingMethod}`;

    // Fetch data for the line chart
    const data = getMonthData(category, trackingMethod); // Get the data

    return (
      <div key={`${category}-${trackingMethod}`} className="mb-10">
        <h3 className="text-xl font-semibold mb-4 capitalize">{displayName}</h3>

        {/* Line chart rendering */}
        <div className="container mx-auto">
          {(() => {
            if (data.length === 0) {
              return <div className="h-16 text-center">No data yet! :( </div>;
            }

            return (
              <AnimatedLineGraph data={data} yAxisLabel="Tracking Value" />
            );
          })()}
        </div>
      </div>
    );
  };

  // Get current category and its tracking methods
  const currentCategory = categories[currentCategoryIndex] || '';
  const currentTrackingMethods =
    trackingMethodsByCategory[currentCategory] || [];

  return (
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
      {categories.length > 0 && (
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

      {/* Swipeable container for habit line cahrts */}
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
          {/* Render line chart for current category and its tracking methods */}
          {currentCategory &&
            currentTrackingMethods.map((method) =>
              renderCharts(currentCategory, method),
            )}
        </motion.div>
      </AnimatePresence>

      {/* Mobile swipe indicator */}
      {categories.length > 1 && (
        <div className="mt-6 text-center text-sm text-muted-foreground md:hidden">
          <p>Swipe left or right to change habits</p>
        </div>
      )}

      {/* Show loading or empty state if no data */}
      {!habitData && (
        <div className="text-center py-10">
          <p>Loading habit data...</p>
        </div>
      )}

      {habitData && Object.keys(habitData).length === 0 && (
        <div className="text-center py-10">
          <p>No habit categories found.</p>
        </div>
      )}
    </div>
  );
}
