'use client';

import { AnimatePresence, motion, type PanInfo } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

import AIResponse from '@/components/ai-response';
import MoodBar from '@/components/data-visualization/mood-bar';
import MoodFlow from '@/components/data-visualization/mood-flow';
import SleepChart from '@/components/data-visualization/sleep-chart';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface HealthDashboardProps {
  userId: string;
}

export default function HealthDashboard({ userId }: HealthDashboardProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  // Sections to rotate for the dashboard
  const sections = [
    {
      id: 'mood',
      title: 'Mood Analysis',
      description: 'Track your emotional patterns',
      content: (
        <>
          <div className="grid md:grid-cols-2">
            <div className="md:col-span-1">
              <MoodFlow userId={userId} />
            </div>
            <div className="md:col-span-1">
              <MoodBar userId={userId} />
            </div>
          </div>
          <div className="pt-4 border-t">
            <AIResponse userId={userId} type="mood" title="Mood Summary" />
          </div>
        </>
      ),
    },
    {
      id: 'sleep',
      title: 'Sleep Analysis',
      description: 'Your sleep patterns and insights',
      content: (
        <>
          <SleepChart userId={userId} />
          <div className="pt-4 border-t">
            <AIResponse userId={userId} type="sleep" title="Sleep Summary" />
          </div>
        </>
      ),
    },
  ];

  const handleDragEnd = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    const threshold = 50;
    if (info.offset.x < -threshold && activeIndex < sections.length - 1) {
      setDirection(1);
      setActiveIndex(activeIndex + 1);
    } else if (info.offset.x > threshold && activeIndex > 0) {
      setDirection(-1);
      setActiveIndex(activeIndex - 1);
    }
  };

  const handleNext = () => {
    if (activeIndex < sections.length - 1) {
      setDirection(1);
      setActiveIndex(activeIndex + 1);
    }
  };

  const handlePrev = () => {
    if (activeIndex > 0) {
      setDirection(-1);
      setActiveIndex(activeIndex - 1);
    }
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 500 : -500,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 500 : -500,
      opacity: 0,
    }),
  };

  return (
    <div className="w-full font-body">
      {/* Tabs for navigation */}
      <div className="flex flex-col items-center space-y-3">
        {/* Section Buttons */}
        <div className="flex justify-center">
          {sections.map((section, index) => (
            <Button
              key={section.id}
              variant={activeIndex === index ? 'default' : 'outline'}
              onClick={() => {
                setDirection(index > activeIndex ? 1 : -1);
                setActiveIndex(index);
              }}
              className="rounded-full"
            >
              {section.title}
            </Button>
          ))}
        </div>

        {/* Swipe Text with Animation */}
        <motion.div
          className="text-gray-500 text-sm text-center"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: [0, 1, 0] }}
          transition={{
            opacity: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
          }}
        >
          Swipe to navigate summaries
        </motion.div>
      </div>

      {/* Swipeable content */}
      <div className="relative overflow-hidden">
        <AnimatePresence initial={true} custom={direction} mode="wait">
          <motion.div
            key={activeIndex}
            custom={direction}
            variants={variants}
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
            onDragEnd={handleDragEnd}
            className="w-full"
          >
            <Card className="overflow-hidden border-none shadow-md">
              <CardContent className="p-6 space-y-6">
                {sections[activeIndex].content}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Navigation buttons */}
        <div className="absolute inset-y-0 left-0 flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrev}
            disabled={activeIndex === 0}
            className={cn(
              'rounded-full bg-background/80 backdrop-blur-sm',
              activeIndex === 0 ? 'opacity-0' : 'opacity-100',
            )}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
        </div>
        <div className="absolute inset-y-0 right-0 flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNext}
            disabled={activeIndex === sections.length - 1}
            className={cn(
              'rounded-full bg-background/80 backdrop-blur-sm',
              activeIndex === sections.length - 1 ? 'opacity-0' : 'opacity-100',
            )}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* Indicator dots */}
      <div className="flex justify-center mt-4 space-x-2">
        {sections.map((_, index) => (
          <div
            key={index}
            className={cn(
              'h-2 rounded-full transition-all duration-300 cursor-pointer',
              activeIndex === index ? 'bg-primary w-6' : 'bg-muted w-2',
            )}
            onClick={() => {
              setDirection(index > activeIndex ? 1 : -1);
              setActiveIndex(index);
            }}
          />
        ))}
      </div>
    </div>
  );
}
