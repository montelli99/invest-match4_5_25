import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface BarKey {
  key: string;
  color: string;
  name?: string;
}

interface Props {
  data: Array<{ [key: string]: any }>;
  barKeys: BarKey[];
  xAxisKey: string;
  height?: number;
  showLegend?: boolean;
  isLoading?: boolean;
  isError?: boolean;
  xAxisFormatter?: (value: any) => string;
  yAxisFormatter?: (value: any) => string;
  tooltipFormatter?: (value: any) => string;
  animate?: boolean;
  stacked?: boolean;
}

export const BarChartComponent = ({
  data,
  barKeys,
  xAxisKey,
  height = 300,
  showLegend = true,
  isLoading = false,
  isError = false,
  xAxisFormatter,
  yAxisFormatter,
  tooltipFormatter,
  animate = true,
  stacked = false,
}: Props) => {
  if (isLoading) {
    return (
      <Card className="p-4">
        <Skeleton className="h-[300px] w-full" />
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="p-4 flex items-center justify-center h-[300px]">
        <div className="text-center">
          <p className="text-destructive">Failed to load chart data</p>
        </div>
      </Card>
    );
  }

  return (
    <div style={{ height: `${height}px`, width: "100%" }}>
      <ResponsiveContainer>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xAxisKey} tickFormatter={xAxisFormatter} />
          <YAxis tickFormatter={yAxisFormatter} />
          <Tooltip formatter={yAxisFormatter} labelFormatter={xAxisFormatter} />
          {showLegend && (
            <Legend
              verticalAlign="top"
              height={36}
              formatter={(value) => {
                const barKey = barKeys.find((k) => k.key === value);
                return barKey?.name || value;
              }}
            />
          )}
          {barKeys.map((barKey) => (
            <Bar
              key={barKey.key}
              dataKey={barKey.key}
              name={barKey.name || barKey.key}
              fill={barKey.color}
              isAnimationActive={animate}
              stackId={stacked ? "stack" : undefined}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
