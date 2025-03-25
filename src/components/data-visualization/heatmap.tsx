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
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';

import { getDataHeatmap } from '@/actions/data-visualization';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

// Define the type for a single day's habit data
type HabitData = {
  date: string;
  journal_text: string;
  start: string;
  scale_rating: string;
};

interface HeatmapProps {
  readonly userId: string;
}

export default function HabitHeatmap({ userId }: HeatmapProps) {
  // State to track the current month being displayed
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [habitData, setHabitData] = useState<HabitData[] | null>(null);
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const habitData = await getDataHeatmap(userId);
      setHabitData(habitData.data);
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
  const previousMonth = () => {
    setDirection(-1);
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const nextMonth = () => {
    setDirection(1);
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  // Function to get habit data for a specific date
  const getHabitDataForDate = (date: Date) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    return habitData?.find((data) => data.date === formattedDate);
  };

  // Function to calculate the completion percentage for a day
  const getCompletionPercentage = (data?: HabitData) => {
    if (!data) return 0;
    const completed = [data.journal_text, data.start, data.scale_rating].filter(
      (item) => item != null,
    ).length;
    return (completed / 3) * 100;
  };

  // Function to get the appropriate background color based on completion percentage
  const getBackgroundColor = (percentage: number) => {
    if (percentage === 0) return 'bg-muted';
    if (percentage <= 34) return '!bg-blue-300';
    if (percentage <= 67) return '!bg-blue-500';
    return '!bg-blue-700';
  };

  // Swipe handlers
  const handleDragEnd = (e: any, { offset, velocity }: any) => {
    setIsDragging(false);

    const swipe = Math.abs(offset.x) > 50 || Math.abs(velocity.x) > 0.3;

    if (swipe) {
      if (offset.x > 0) {
        previousMonth();
      } else {
        nextMonth();
      }
    }
  };

  // Calendar variants for animations
  const calendarVariants = {
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

  return (
    <div className="w-full max-w-3xl mx-auto p-4 font-body">
      <div className="flex items-center justify-center mb-6">
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

      {/* Day labels */}
      <div className="grid grid-cols-7 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center text-sm font-medium">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid with swipe gesture */}
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={format(currentMonth, 'MM-yyyy')}
          custom={direction}
          variants={calendarVariants}
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
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for days before the start of the month */}
            {Array.from({ length: startDay }).map((_, index) => (
              <div key={`empty-${index}`} className="aspect-square"></div>
            ))}

            {/* Days of the month */}
            <TooltipProvider>
              {daysInMonth.map((day, index) => {
                const dayData = getHabitDataForDate(day);
                const completionPercentage = getCompletionPercentage(dayData);
                const backgroundColor =
                  getBackgroundColor(completionPercentage);

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
                            <p>Journal: {dayData.journal_text ? '✅' : '❌'}</p>
                            <p>
                              Data Intake: {dayData.scale_rating ? '✅' : '❌'}
                            </p>
                            <p>Sleep: {dayData.start ? '✅' : '❌'}</p>
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
        </motion.div>
      </AnimatePresence>

      {/* Mobile swipe indicator */}
      <div className="mt-6 text-center text-sm text-muted-foreground md:hidden">
        <p>Swipe left or right to change months</p>
      </div>
    </div>
  );
}
