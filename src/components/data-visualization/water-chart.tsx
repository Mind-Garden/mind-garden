'use client';

import { LoaderCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

import { selectWaterDataByDateRange } from '@/actions/data-visualization';
import AnimatedLineGraph from '@/components/data-visualization/line-graph';
import { getLocalISOString } from '@/lib/utils';
import { DataPoint } from '@/supabase/schema';

interface WaterChartProps {
  userId: string;
}

export default function WaterChart({ userId }: Readonly<WaterChartProps>) {
  const [data, setData] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  const todaysDate = getLocalISOString();
  const lastMonthDate = getLocalISOString(
    new Date(new Date().setMonth(new Date().getMonth() - 1)),
  );
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const response = await selectWaterDataByDateRange(
        userId,
        lastMonthDate,
        todaysDate,
      );

      if (
        Array.isArray(response.data) &&
        response.data.every(
          (item: any) => 'entry_date' in item && 'water' in item,
        )
      ) {
        const filteredData: DataPoint[] = response.data
          .map((item: any) => ({
            x: item.entry_date,
            y: item.water,
          }))
          .filter((item) => item.y !== null);

        setData(filteredData);
        setLoading(false);
      } else {
        console.error('Unexpected response data format', response.data);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="container mx-auto font-body">
      {(() => {
        if (loading) {
          return (
            <div className="flex items-center justify-center h-[400px]">
              <LoaderCircle className="h-12 w-12 text-gray-500 animate-spin" />
            </div>
          );
        }

        if (!data || data.length === 0) {
          return <div className="h-16 text-center">No data yet! :( </div>;
        }
        return (
          <AnimatedLineGraph
            data={data}
            yAxisLabel="Cups of Water"
            lineColor="skyblue"
            shadowColour="skyblue"
          />
        );
      })()}
    </div>
  );
}
