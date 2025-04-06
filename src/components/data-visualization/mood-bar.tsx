'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Frown, Info, LoaderCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

import { selectMoodFrequency } from '@/actions/data-visualization';
import { Badge } from '@/components/shadcn//badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/shadcn//card';
import { Tabs, TabsList, TabsTrigger } from '@/components/shadcn/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/shadcn/tooltip';
import { getLocalISOString } from '@/lib/utils';
import { MoodCountData, MoodDistribution, moodTypes } from '@/supabase/schema';

import ScaleIcon from '../data-intake/scale-icon';

interface MoodDistributionProps {
  userId: string;
  title?: string;
}

type TimeRange = 'week' | 'month' | '3months' | 'year';

export default function MoodDistributionComponent({
  userId,
  title = 'Mood Distribution',
}: Readonly<MoodDistributionProps>) {
  const [moodDistribution, setMoodDistribution] = useState<MoodDistribution[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const [totalEntries, setTotalEntries] = useState(0);
  const [dominantMood, setDominantMood] = useState<
    (typeof moodTypes)[0] | null
  >(null);

  // Create a map of moods for easy lookup
  const moodMap = Object.fromEntries(moodTypes.map((mood) => [mood.id, mood]));

  // Get date ranges based on selected time period
  const todaysDate = getLocalISOString();

  const getStartDate = () => {
    const today = new Date();
    switch (timeRange) {
      case 'week':
        return getLocalISOString(new Date(today.setDate(today.getDate() - 7)));
      case 'month':
        return getLocalISOString(
          new Date(today.setMonth(today.getMonth() - 1)),
        );
      case '3months':
        return getLocalISOString(
          new Date(today.setMonth(today.getMonth() - 3)),
        );
      case 'year':
        return getLocalISOString(
          new Date(today.setFullYear(today.getFullYear() - 1)),
        );
      default:
        return getLocalISOString(
          new Date(today.setMonth(today.getMonth() - 1)),
        );
    }
  };

  useEffect(() => {
    const fetchMoodData = async () => {
      setLoading(true);
      try {
        const startDate = getStartDate();
        const response = await selectMoodFrequency(
          userId,
          startDate,
          todaysDate,
        );

        const moodData = response.data as MoodCountData[];

        // Calculate total count
        const totalCount = moodData.reduce(
          (sum, item) => sum + (item.count || 0),
          0,
        );

        if (totalCount === 0) {
          setMoodDistribution([]);
          setTotalEntries(0);
          setDominantMood(null);
          setLoading(false);
          return;
        }

        // Convert counts into percentage distribution
        const distribution = moodData.map((mood) => ({
          id: mood.scale_rating.toString(),
          count: mood.count,
          percentage: Math.round((mood.count / totalCount) * 100),
        }));

        // Sort by mood id for consistent order (5 to 1)
        distribution.sort((a, b) => Number(b.id) - Number(a.id));

        // Find dominant mood (highest count)
        const highestCount = Math.max(
          ...distribution.map((item) => item.count),
        );
        const dominant = distribution.find(
          (item) => item.count === highestCount,
        );

        // Update state
        setMoodDistribution(distribution);
        setTotalEntries(totalCount);
        setDominantMood(dominant ? moodMap[dominant.id] : null);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching mood data:', error);
        setLoading(false);
      }
    };

    fetchMoodData();
  }, [userId, timeRange]);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold">{title}</CardTitle>
          <Tabs
            value={timeRange}
            onValueChange={(value: string) => setTimeRange(value as TimeRange)}
            className="w-auto"
          >
            <TabsList className="grid grid-cols-4 w-auto">
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="3months">3M</TabsTrigger>
              <TabsTrigger value="year">Year</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        {loading ? (
          <div className="flex items-center justify-center h-[200px]">
            <LoaderCircle className="h-10 w-10 text-primary animate-spin" />
          </div>
        ) : moodDistribution.length === 0 ? (
          <div className="h-[200px] flex flex-col items-center justify-center text-center gap-2 text-muted-foreground">
            <Frown className="w-12 h-12 text-muted-foreground/50" />
            <span>No mood data found for this period.</span>
            <span className="text-sm">
              Log your moods to see your distribution here.
            </span>
          </div>
        ) : (
          <>
            {/* Mood Summary */}
            <div className="mb-6 p-2 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Info className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Summary</span>
              </div>

              <div className="flex items-center gap-2 mt-3">
                <Badge variant="outline" className="bg-primary/10">
                  {totalEntries} total entries
                </Badge>
                {dominantMood && (
                  <Badge
                    style={{
                      color: 'black',
                    }}
                    className={`border ${dominantMood.color} border-black ${dominantMood.hoverColor}`}
                  >
                    Mostly {dominantMood.label}
                  </Badge>
                )}
              </div>
            </div>

            {/* Mood Distribution Visualization */}
            <div className="space-y-6">
              {/* Mood Icons with Percentages */}
              <div className="grid grid-cols-5 gap-2">
                <AnimatePresence>
                  {moodDistribution.map((item) => {
                    const mood = moodMap[item.id];
                    return (
                      <TooltipProvider key={item.id} delayDuration={50}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <motion.div
                              className="flex flex-col items-center"
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <motion.div
                                className={`w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center mb-2 cursor-pointer ${mood.color} ${mood.hoverColor}`}
                                whileHover={{
                                  scale: 1.05,
                                  transition: { duration: 0.2 },
                                }}
                              >
                                <ScaleIcon scaleRating={Number(item.id)} />
                              </motion.div>
                              <div className="text-center">
                                <div className="font-medium text-lg">
                                  {item.percentage}%
                                </div>
                                <div className="text-xs text-muted-foreground hidden md:block">
                                  {mood.label}
                                </div>
                              </div>
                            </motion.div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="text-center">
                              <p className="font-medium">{mood.label}</p>
                              <p className="text-xs text-muted-foreground">
                                {mood.description}
                              </p>
                              <p className="text-sm mt-1">
                                {item.count} entries ({item.percentage}%)
                              </p>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    );
                  })}
                </AnimatePresence>
              </div>

              {/* Mood Distribution Bar */}
              <div className="space-y-2">
                <div className="text-sm font-medium">Distribution</div>
                <div className="h-8 w-full rounded-full overflow-hidden flex">
                  {moodDistribution.map((item, index) => {
                    const mood = moodMap[item.id];
                    return (
                      <motion.div
                        key={item.id}
                        className={`h-full ${mood.color} ${mood.hoverColor} relative`}
                        initial={{ width: 0 }}
                        animate={{ width: `${item.percentage}%` }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      >
                        {item.percentage >= 10 && (
                          <div className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                            {item.percentage}%
                          </div>
                        )}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-black/10 transition-opacity" />
                      </motion.div>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="flex justify-between text-xs text-muted-foreground pt-1">
                  <div>Excellent</div>
                  <div>Good</div>
                  <div>Neutral</div>
                  <div>Poor</div>
                  <div>Terrible</div>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
