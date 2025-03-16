'use client';

import { useState, useEffect } from 'react';
import LineGraph, { type DataPoint } from '@/components/ui/line-graph';
import { selectWaterDataByDateRange } from '@/actions/data-visualization';
import { getLocalISOString } from '@/lib/utils';
import { LoaderCircle } from 'lucide-react';

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
            entry_date: item.entry_date,
            value: item.water,
          }))
          .filter((item: DataPoint) => item.value !== null);

        setData(filteredData);
        setLoading(false);
      } else {
        console.error('Unexpected response data format', response.data);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="container mx-auto py-8">
      {loading ? (
        <div className="flex items-center justify-center h-[400px]">
          <LoaderCircle className="h-12 w-12 text-gray-500 animate-spin" />
        </div>
      ) : !data || data.length === 0 ? (
        <div className="h-16 text-center">No data yet! :( </div>
      ) : (
        <LineGraph
          data={data}
          title="Water Intake History"
          yAxisLabel="Cups of Water"
          tooltipLabel="Cups of Water"
          color="hsl(215, 70%, 60%)"
        />
      )}
    </div>
  );
}
