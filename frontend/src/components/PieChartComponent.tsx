import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  data: Array<{ name: string; value: number }>;
  height?: number;
  colors?: string[];
  showLegend?: boolean;
  isLoading?: boolean;
  isError?: boolean;
  valueFormatter?: (value: number) => string;
  tooltipFormatter?: (value: any) => string;
  animate?: boolean;
  startAngle?: number;
  endAngle?: number;
}

export const PieChartComponent = ({
  data,
  height = 300,
  colors = [
    "var(--chart-1-hex)",
    "var(--chart-2-hex)",
    "var(--chart-3-hex)",
    "var(--chart-4-hex)",
  ],
  showLegend = true,
  isLoading = false,
  isError = false,
  valueFormatter = (value: number) => `${value}%`,
  tooltipFormatter,
  animate = true,
  startAngle = 0,
  endAngle = 360,
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
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            fill="#8884d8"
            paddingAngle={5}
            dataKey="value"
            startAngle={startAngle}
            endAngle={endAngle}
            isAnimationActive={animate}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={colors[index % colors.length]}
              />
            ))}
          </Pie>
          <Tooltip formatter={valueFormatter} />
        </PieChart>
      </ResponsiveContainer>
      {showLegend && (
        <div className="mt-4 space-y-2">
          {data.map((entry, index) => (
            <div key={entry.name} className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: colors[index % colors.length] }}
              />
              <span>{entry.name}</span>
              <span className="text-muted-foreground">
                {valueFormatter(entry.value)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
