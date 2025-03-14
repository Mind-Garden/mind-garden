'use client';

import {
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface DataPoint {
  entry_date: string;
  value: number;
}

export interface LineGraphProps {
  data: DataPoint[];
  title?: string;
  color?: string;
  yAxisLabel?: string;
  xAxisLabel?: string;
  tooltipLabel?: string;
  showGrid?: boolean;
  height?: number;
}

const CustomTooltip = ({ active, payload, label, tooltipLabel }: any) => {
  if (active && payload && payload.length) {
    return (
      <Card>
        <CardContent className="p-2">
          <p className="text-sm font-medium">
            {new Date(label).toLocaleDateString()}
          </p>
          <p className="text-sm text-muted-foreground">
            {tooltipLabel}: {payload[0].value}
          </p>
        </CardContent>
      </Card>
    );
  }

  return null;
};

export default function LineGraph({
  data,
  title = 'Tracking Data',
  color = 'hsl(var(--primary))',
  yAxisLabel = 'Value',
  xAxisLabel = 'Date',
  tooltipLabel = 'Value',
  showGrid = true,
  height = 300,
}: LineGraphProps) {
  return (
    <Card className="bg-white/50 break-inside-avoid backdrop-blur-sm rounded-2xl border-none mb-6 relative transition-opacity">
      <CardHeader className="pb-3">
        <CardTitle className="text-3xl text-center">{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 10,
              right: 30,
              left: 0,
              bottom: 0,
            }}
          >
            {showGrid && (
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
            )}
            <XAxis dataKey="entry_date" tickLine={false} tickMargin={8} />
            <YAxis
              tickLine={false}
              tickMargin={8}
              label={{
                value: yAxisLabel,
                angle: -90,
                position: 'insideLeft',
                style: { textAnchor: 'middle' },
              }}
            />
            <Tooltip content={<CustomTooltip tooltipLabel={tooltipLabel} />} />
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              dot={{ r: 4, fill: 'hsl(var(--background))', strokeWidth: 2 }}
              activeDot={{
                r: 6,
                fill: 'hsl(var(--background))',
                strokeWidth: 2,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
