'use client';

import {
  Droplets,
  Frown,
  Info,
  LoaderCircle,
  Target,
  Waves,
} from 'lucide-react';
import { useEffect, useState } from 'react';
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

import { selectWaterDataByDateRange } from '@/actions/data-visualization';
import { Badge } from '@/components/shadcn/badge';
import { Button } from '@/components/shadcn/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/shadcn/card';
import { Progress } from '@/components/shadcn/progress';
import { getLocalISOString } from '@/lib/utils';

interface WaterChartProps {
  userId: string;
  dailyGoal?: number; // Cups of water per day goal
}

export interface WaterDataPoint {
  date: string;
  water: number;
}

type TimeRange = 'week' | 'month' | '3months';

const GRADIENT_ID = 'waterGradient';

/**
 * Formats a date string to a more readable format
 */
const formatDate = (dateString: string): string => {
  try {
    const date = new Date(`${dateString}T00:00:00Z`);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC',
    });
  } catch (e) {
    return dateString;
  }
};

/**
 * WaterChart component displays water consumption data in a chart and summary cards
 */
export default function WaterChart({
  userId,
  dailyGoal = 8,
}: Readonly<WaterChartProps>) {
  const [data, setData] = useState<WaterDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  const [todayWater, setTodayWater] = useState(0);
  const [averageWater, setAverageWater] = useState(0);

  const todaysDate = getLocalISOString();

  /**
   * Calculate start date based on the selected time range
   */
  const getStartDate = (): string => {
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
      default:
        return getLocalISOString(new Date(today.setDate(today.getDate() - 7)));
    }
  };

  /**
   * Fetch and process water consumption data
   */
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const startDate = getStartDate();

      try {
        const response = await selectWaterDataByDateRange(
          userId,
          startDate,
          todaysDate,
        );

        if (
          Array.isArray(response.data) &&
          response.data.every(
            (item: any) => 'entry_date' in item && 'water' in item,
          )
        ) {
          const processedData = response.data
            .map((item: any) => ({
              date: item.entry_date,
              water: item.water ?? 0,
            }))
            .filter((item) => item.date !== null)
            .sort(
              (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
            );

          setData(processedData);
          updateMetrics(processedData);
        } else {
          console.error('Unexpected response data format', response.data);
        }
      } catch (error) {
        console.error('Error fetching water data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, timeRange, todaysDate]);

  /**
   * Calculate today's water intake and average water intake
   */
  const updateMetrics = (processedData: WaterDataPoint[]): void => {
    // Calculate today's water intake
    const today = new Date().toISOString().split('T')[0];
    const todayEntry = processedData.find((item) => item.date.includes(today));
    setTodayWater(todayEntry?.water ?? 0);

    // Calculate average water intake
    if (processedData.length > 0) {
      const sum = processedData.reduce((acc, curr) => acc + curr.water, 0);
      setAverageWater(Math.round((sum / processedData.length) * 10) / 10);
    }
  };

  // Calculate percentage of daily goal achieved
  const goalPercentage = Math.min(
    Math.round((todayWater / dailyGoal) * 100),
    100,
  );

  /**
   * Render hydration status badge based on goal percentage
   */
  const renderHydrationStatus = () => {
    if (goalPercentage >= 100) {
      return {
        badge: (
          <Badge className="bg-green-500 hover:bg-green-600">
            Goal Achieved!
          </Badge>
        ),
        message: 'Great job staying hydrated today!',
      };
    } else if (goalPercentage >= 75) {
      return {
        badge: (
          <Badge className="bg-sky-500 hover:bg-sky-600">Almost There!</Badge>
        ),
        message: `${dailyGoal - todayWater} more cups to reach your goal`,
      };
    } else if (goalPercentage >= 50) {
      return {
        badge: (
          <Badge className="bg-yellow-500 hover:bg-yellow-600">
            Halfway There
          </Badge>
        ),
        message: `${dailyGoal - todayWater} more cups to reach your goal`,
      };
    } else {
      return {
        badge: (
          <Badge variant="outline" className="border-red-200 text-red-500">
            Need More Water
          </Badge>
        ),
        message: `${dailyGoal - todayWater} more cups to reach your goal`,
      };
    }
  };

  const { badge, message } = renderHydrationStatus();

  /**
   * Render time range selector buttons
   */
  const renderTimeRangeButtons = () => {
    const timeRanges: TimeRange[] = ['week', 'month', '3months'];

    return (
      <div className="flex gap-2">
        {timeRanges.map((range) => (
          <Button
            key={range}
            variant={timeRange === range ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange(range)}
          >
            {range === '3months'
              ? '3 Months'
              : range.charAt(0).toUpperCase() + range.slice(1)}
          </Button>
        ))}
      </div>
    );
  };

  /**
   * Render chart content based on loading state and data availability
   */
  const renderChartContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-[300px]">
          <LoaderCircle className="h-12 w-12 text-sky-500 animate-spin" />
        </div>
      );
    }

    if (data.length === 0) {
      return (
        <div className="h-[300px] flex flex-col items-center justify-center text-center gap-2 text-muted-foreground">
          <Frown className="w-5 h-5" />
          <span>No water tracking data found.</span>

          <span className="text-sm">
            Start tracking your water intake to see your progress here.
          </span>
        </div>
      );
    }

    return (
      <div className="h-[300px] mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
          >
            <defs>
              <linearGradient id={GRADIENT_ID} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#bae6fd" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="rgba(0,0,0,0.1)"
            />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              tick={{ fontSize: 12 }}
              tickMargin={10}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(value) => `${value}`}
              tick={{ fontSize: 12 }}
              tickMargin={10}
              axisLine={false}
              tickLine={false}
              domain={[0, 'dataMax + 2']}
              label={{
                value: 'Cups',
                angle: -90,
                position: 'insideLeft',
                style: { textAnchor: 'middle', fontSize: 12, fill: '#888' },
              }}
            />
            <Tooltip
              contentStyle={{
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                padding: '8px 12px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              }}
              formatter={(value: number) => [`${value} cups`, 'Water Intake']}
              labelFormatter={(label) => formatDate(label)}
              cursor={{
                stroke: '#94a3b8',
                strokeWidth: 1,
                strokeDasharray: '3 3',
              }}
            />
            <ReferenceLine
              y={dailyGoal}
              stroke="#f97316"
              strokeWidth={1.5}
              strokeDasharray="3 3"
              label={{
                value: 'Goal',
                position: 'right',
                fill: '#f97316',
                fontSize: 12,
              }}
            />
            <Area
              type="monotone"
              dataKey="water"
              stroke="#3b82f6"
              strokeWidth={2}
              fill={`url(#${GRADIENT_ID})`}
              activeDot={{
                r: 6,
                fill: '#3b82f6',
                stroke: '#fff',
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <Card className="w-full overflow-hidden font-body">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Droplets className="h-5 w-5 text-sky-500" />
              Water Intake History
            </CardTitle>
          </div>
          {renderTimeRangeButtons()}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-sky-50 dark:bg-sky-950/20">
          {/* Today's Intake Card */}
          <div className="flex flex-col justify-center items-center p-4 bg-white dark:bg-gray-950 rounded-lg shadow-sm">
            <div className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
              <Droplets className="h-4 w-4 text-sky-500" />
              Today's Intake
            </div>
            <div className="text-3xl font-bold text-sky-600 dark:text-sky-400 mb-2">
              {todayWater} <span className="text-sm font-normal">cups</span>
            </div>
            <Progress
              value={goalPercentage}
              className="h-2 w-full bg-sky-100"
            />
            <div className="flex justify-between w-full mt-2 text-xs text-muted-foreground">
              <span>0 cups</span>
              <span className="flex items-center gap-1">
                <Target className="h-3 w-3" />
                {dailyGoal} cups
              </span>
            </div>
          </div>

          {/* Average Daily Card */}
          <div className="flex flex-col justify-center items-center p-4 bg-white dark:bg-gray-950 rounded-lg shadow-sm">
            <div className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
              <Waves className="h-4 w-4 text-sky-500" />
              Average Daily
            </div>
            <div className="text-3xl font-bold text-sky-600 dark:text-sky-400">
              {averageWater} <span className="text-sm font-normal">cups</span>
            </div>
            <div className="mt-2 text-xs text-center text-muted-foreground">
              Based on your{' '}
              {timeRange === 'week'
                ? 'weekly'
                : timeRange === 'month'
                  ? 'monthly'
                  : '3-month'}{' '}
              data
            </div>
          </div>

          {/* Hydration Status Card */}
          <div className="flex flex-col justify-center items-center p-4 bg-white dark:bg-gray-950 rounded-lg shadow-sm">
            <div className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
              <Info className="h-4 w-4 text-sky-500" />
              Hydration Status
            </div>
            <div className="text-xl font-bold text-center">{badge}</div>
            <div className="mt-2 text-xs text-center text-muted-foreground">
              {message}
            </div>
          </div>
        </div>

        <div className="p-4 pt-0">{renderChartContent()}</div>
      </CardContent>
    </Card>
  );
}
