import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface Props {
  networkMetrics: {
    total_connections: number;
    active_connections: number;
    avg_strength: number;
  };
}

export function NetworkStrengthChart({ networkMetrics }: Props) {
  const data = [
    {
      name: "Active",
      value: networkMetrics.active_connections,
    },
    {
      name: "Inactive",
      value:
        networkMetrics.total_connections - networkMetrics.active_connections,
    },
  ];

  const COLORS = ["var(--green-500-hex)", "var(--gray-300-hex)"];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Network Overview</CardTitle>
        <CardDescription>
          Average Network Strength: {networkMetrics.avg_strength}%
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
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
                label
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
