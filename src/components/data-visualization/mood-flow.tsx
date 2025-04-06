'use client';

import {
  ArrowDown,
  ArrowUp,
  Info,
  LoaderCircle,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { selectMoodDataByDateRange } from '@/actions/data-visualization';
import ScaleIcon from '@/components/data-intake/scale-icon';
import { Badge } from '@/components/shadcn/badge';
import { Button } from '@/components/shadcn/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/shadcn/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/shadcn/tabs';
import { formatDate, getStartDate, TimeRange } from '@/lib/time';
import { getLocalISOString } from '@/lib/utils';
import { MoodDataPoint } from '@/supabase/schema';

interface EnhancedMoodFlowProps {
  userId: string;
  title?: string;
}

const moodTypes = [
  {
    id: '5',
    color: 'bg-emerald-200',
    hoverColor: 'hover:bg-emerald-300',
    label: 'Excellent',
    description: 'Feeling great and energetic',
  },
  {
    id: '4',
    color: 'bg-sky-200',
    hoverColor: 'hover:bg-sky-300',
    label: 'Good',
    description: 'Feeling positive and content',
  },
  {
    id: '3',
    color: 'bg-violet-200',
    hoverColor: 'hover:bg-violet-300',
    label: 'Neutral',
    description: 'Neither good nor bad',
  },
  {
    id: '2',
    color: 'bg-amber-200',
    hoverColor: 'hover:bg-amber-300',
    label: 'Poor',
    description: 'Feeling down or upset',
  },
  {
    id: '1',
    color: 'bg-rose-200',
    hoverColor: 'hover:bg-rose-300',
    label: 'Terrible',
    description: 'Feeling very negative',
  },
];

export default function MoodFlow({
  userId,
  title = 'Mood Flow',
}: Readonly<EnhancedMoodFlowProps>) {
  const [moodData, setMoodData] = useState<
    Array<{ date: string; mood: number; formattedDate: string }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const [showAnnotations, setShowAnnotations] = useState(true);

  // Get date ranges based on selected time period
  const todaysDate = getLocalISOString();

  useEffect(() => {
    const fetchMoodData = async () => {
      setLoading(true);
      try {
        const startDate = getStartDate(timeRange);
        const response = await selectMoodDataByDateRange(
          userId,
          startDate,
          todaysDate,
        );

        if (
          Array.isArray(response.data) &&
          response.data.every(
            (item) => 'entry_date' in item && 'scale_rating' in item,
          )
        ) {
          const moodData = response.data as MoodDataPoint[];

          // Convert to date and mood format
          const formattedData = moodData
            .map((item) => ({
              date: item.entry_date,
              mood: item.scale_rating,
              formattedDate: formatDate(item.entry_date),
            }))
            .sort(
              (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
            );

          setMoodData(formattedData);
        } else {
          console.error('Unexpected response data format', response.data);
          setMoodData([]);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching mood data:', error);
        setLoading(false);
        setMoodData([]);
      }
    };

    fetchMoodData();
  }, [userId, timeRange]);

  // Calculate mood insights
  const moodInsights = useMemo(() => {
    if (moodData.length < 2) return null;

    // Calculate average mood
    const totalMood = moodData.reduce((sum, item) => sum + item.mood, 0);
    const averageMood = totalMood / moodData.length;

    // Calculate mood trend (positive or negative)
    const firstHalf = moodData.slice(0, Math.floor(moodData.length / 2));
    const secondHalf = moodData.slice(Math.floor(moodData.length / 2));

    const firstHalfAvg =
      firstHalf.reduce((sum, item) => sum + item.mood, 0) / firstHalf.length;
    const secondHalfAvg =
      secondHalf.reduce((sum, item) => sum + item.mood, 0) / secondHalf.length;

    const trendDirection =
      secondHalfAvg > firstHalfAvg
        ? 'improving'
        : secondHalfAvg < firstHalfAvg
          ? 'declining'
          : 'stable';

    // Find significant mood swings (changes of 2 or more points between consecutive entries)
    const moodSwings = [];
    for (let i = 1; i < moodData.length; i++) {
      const change = moodData[i].mood - moodData[i - 1].mood;
      if (Math.abs(change) >= 2) {
        moodSwings.push({
          from: moodData[i - 1],
          to: moodData[i],
          change,
          index: i,
        });
      }
    }

    return {
      averageMood,
      trendDirection,
      moodSwings,
    };
  }, [moodData]);

  // Get mood info by value
  const getMoodInfo = (value: number) => {
    return moodTypes.find((mood) => Number(mood.id) === value) || moodTypes[2]; // Default to neutral
  };

  // Get color for the chart based on trend direction (replacement for tailwind colors)
  const getChartColors = () => {
    if (!moodInsights) return { stroke: '#5EB17F', fill: '#9ACBAD' };

    switch (moodInsights.trendDirection) {
      case 'improving':
        return { stroke: '#047857', fill: '#6EE7B7' }; // emerald colors
      case 'declining':
        return { stroke: '#BE123C', fill: '#FDA4AF' }; // rose colors
      default:
        return { stroke: '#6D28D9', fill: '#C4B5FD' }; // violet colors for stable
    }
  };

  const chartColors = getChartColors();
  const gradientId = 'moodGradient';

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              {moodInsights?.trendDirection === 'improving' ? (
                <TrendingUp className="h-5 w-5 text-emerald-500" />
              ) : moodInsights?.trendDirection === 'declining' ? (
                <TrendingDown className="h-5 w-5 text-rose-500" />
              ) : (
                <TrendingUp className="h-5 w-5 text-violet-500" />
              )}
              {title}
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Tabs
              value={timeRange}
              onValueChange={(value) => setTimeRange(value as TimeRange)}
              className="w-auto"
            >
              <TabsList className="grid grid-cols-4 w-auto">
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="month">Month</TabsTrigger>
                <TabsTrigger value="3months">3M</TabsTrigger>
                <TabsTrigger value="year">Year</TabsTrigger>
              </TabsList>
            </Tabs>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowAnnotations(!showAnnotations)}
              className={showAnnotations ? 'bg-primary/10' : ''}
            >
              <Info className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        {loading ? (
          <div className="flex items-center justify-center h-[400px]">
            <LoaderCircle className="h-10 w-10 text-primary animate-spin" />
          </div>
        ) : moodData.length === 0 ? (
          <div className="h-[400px] flex flex-col items-center justify-center text-center gap-2 text-muted-foreground">
            <span>No mood data found for this period.</span>
            <span className="text-sm">
              Log your moods to see your flow here.
            </span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Mood Insights */}
            {moodInsights && showAnnotations && (
              <div className="p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Mood Insights</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Average Mood
                    </div>
                    <div className="flex items-center gap-2">
                      <ScaleIcon
                        scaleRating={Math.round(moodInsights.averageMood)}
                      />
                      <span className="text-xl font-semibold">
                        {moodInsights.averageMood.toFixed(1)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {
                          getMoodInfo(Math.round(moodInsights.averageMood))
                            .label
                        }
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Trend</div>
                    <div className="flex items-center gap-2">
                      {moodInsights.trendDirection === 'improving' ? (
                        <>
                          <Badge className="bg-emerald-500">Improving</Badge>
                          <ArrowUp className="h-4 w-4 text-emerald-500" />
                        </>
                      ) : moodInsights.trendDirection === 'declining' ? (
                        <>
                          <Badge className="bg-rose-500">Declining</Badge>
                          <ArrowDown className="h-4 w-4 text-rose-500" />
                        </>
                      ) : (
                        <Badge className="bg-violet-500">Stable</Badge>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Mood Swings
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xl font-semibold">
                        {moodInsights.moodSwings.length}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        significant changes
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Mood Chart */}
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={moodData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                >
                  <defs>
                    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor={chartColors.fill}
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor={chartColors.fill}
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="rgba(0,0,0,0.1)"
                  />
                  <XAxis
                    dataKey="formattedDate"
                    tick={{ fontSize: 12 }}
                    tickMargin={10}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[1, 5]}
                    ticks={[1, 2, 3, 4, 5]}
                    tickFormatter={(value) => value}
                    tick={(props) => {
                      const { x, y, payload } = props;
                      const moodValue = Number(payload.value);
                      return (
                        <g transform={`translate(${x},${y})`}>
                          <foreignObject width="24" height="24" x="-24" y="-12">
                            <div className="h-full flex items-center justify-center">
                              <ScaleIcon scaleRating={moodValue} />
                            </div>
                          </foreignObject>
                        </g>
                      );
                    }}
                    tickMargin={10}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        const moodInfo = getMoodInfo(data.mood);

                        return (
                          <div
                            className={`${moodInfo.color} p-3 rounded-lg shadow-md border border-border`}
                          >
                            <div className="font-medium">
                              {data.formattedDate}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <ScaleIcon scaleRating={Number(moodInfo.id)} />
                              <div>
                                <div className="font-medium">
                                  {moodInfo.label}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  Level: {data.mood}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />

                  {/* Reference lines for mood levels */}
                  <ReferenceLine
                    y={3}
                    stroke="rgba(0,0,0,0.1)"
                    strokeDasharray="3 3"
                  />

                  {/* Mood flow area */}
                  <Area
                    type="monotone"
                    dataKey="mood"
                    stroke={chartColors.stroke}
                    strokeWidth={2}
                    fill={`url(#${gradientId})`}
                    activeDot={{
                      r: 5,
                      stroke: '#fff',
                      strokeWidth: 2,
                    }}
                  />

                  {/* Annotations for significant mood swings */}
                  {showAnnotations &&
                    moodInsights?.moodSwings.map((swing, i) => (
                      <ReferenceLine
                        key={i}
                        x={swing.to.formattedDate}
                        stroke={swing.change > 0 ? '#10B981' : '#EF4444'}
                        strokeWidth={2}
                        strokeDasharray="3 3"
                        label={({ viewBox }) => {
                          const x = viewBox.x;
                          const y = viewBox.y - 15;

                          return (
                            <g>
                              <text
                                x={x}
                                y={y}
                                textAnchor="middle"
                                fill={swing.change > 0 ? '#10B981' : '#EF4444'}
                                fontSize={16}
                              >
                                {swing.change > 0 ? '↑' : '↓'}
                              </text>
                            </g>
                          );
                        }}
                      />
                    ))}
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap justify-between gap-2 text-xs text-muted-foreground">
              {showAnnotations &&
                moodInsights &&
                moodInsights?.moodSwings?.length > 0 && (
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                      <span>Mood Improvement</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-rose-500 rounded-full"></div>
                      <span>Mood Decline</span>
                    </div>
                  </div>
                )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
