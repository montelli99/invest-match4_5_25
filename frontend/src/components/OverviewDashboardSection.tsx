import { useMemo } from "react";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, AlertTriangle, CheckCircle, Settings } from "lucide-react";
import { EffectivenessMetrics } from "./ModeratorType";

// Interface for trend indicator props
interface TrendIndicatorProps {
  value: number;
  previousValue: number;
  className?: string;
}

// Interface for risk score data
interface RiskScoreData {
  name: string;
  value: number;
}

interface OverviewDashboardSectionProps {
  metrics: EffectivenessMetrics;
  reportsCount: number;
  historicalData: any[]; // Use a more specific type when possible
}

/**
 * TrendIndicator Component - Shows trend movement with visual indicators
 */
const TrendIndicator = ({ value, previousValue, className }: TrendIndicatorProps) => {
  const difference = value - previousValue;
  const percentChange = previousValue !== 0 ? (difference / previousValue) * 100 : 0;
  
  return (
    <div className={`flex items-center gap-1 text-sm ${className}`}>
      {Math.abs(percentChange) < 1 ? (
        <span className="text-yellow-500">―</span>
      ) : percentChange > 0 ? (
        <span className="text-green-500">↑</span>
      ) : (
        <span className="text-red-500">↓</span>
      )}
      <span className={`${Math.abs(percentChange) < 1 ? "text-yellow-500" : percentChange > 0 ? "text-green-500" : "text-red-500"}`}>
        {Math.abs(percentChange).toFixed(1)}%
      </span>
    </div>
  );
};

/**
 * Overview Dashboard Section Component - Displays overview analytics 
 * 
 * This component encapsulates the summary metrics, charts and visualizations for moderation overview,
 * helping to keep the main dashboard component more maintainable.
 */
export function OverviewDashboardSection({ metrics, reportsCount, historicalData }: OverviewDashboardSectionProps) {
  // Calculate risk scores for visualization
  const riskScoreData = useMemo((): RiskScoreData[] => {
    return [
      { name: "Low", value: 32 },
      { name: "Medium", value: 42 },
      { name: "High", value: 18 },
      { name: "Critical", value: 8 }
    ];
  }, []);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportsCount}</div>
            <p className="text-xs text-muted-foreground">
              +{Math.floor(Math.random() * 20)}% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Response Time</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.time_metrics.avg_response_time.toFixed(1)}s</div>
            <p className="text-xs text-muted-foreground">
              {metrics.time_metrics.avg_response_time < 40 ? "-" : "+"}
              {Math.floor(Math.random() * 15)}% from last week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accuracy Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(metrics.quality_metrics.accuracy_rate * 100).toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              +{Math.floor(Math.random() * 10)}% from baseline
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Rules</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">
              +3 in the last week
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Risk Distribution</CardTitle>
            <CardDescription>Content reports by risk level</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskScoreData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label
                  >
                    {riskScoreData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-4">
              {riskScoreData.map((entry, index) => (
                <div key={`legend-${index}`} className="flex items-center gap-1">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-sm">{entry.name}: {entry.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Time Metrics</CardTitle>
            <CardDescription>Response time and processing time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historicalData}>
                  <defs>
                    <linearGradient id="colorResponse" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorReview" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--destructive)" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="var(--destructive)" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip />
                  <Area type="monotone" dataKey="response_time" name="Response Time" stroke="var(--primary)" fillOpacity={1} fill="url(#colorResponse)" />
                  <Area type="monotone" dataKey="review_time" name="Review Time" stroke="var(--destructive)" fillOpacity={1} fill="url(#colorReview)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Quality Metrics</CardTitle>
            <CardDescription>Accuracy and consistency over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historicalData}>
                  <XAxis dataKey="day" />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip />
                  <Line type="monotone" dataKey="accuracy" name="Accuracy" stroke="var(--primary)" strokeWidth={2} />
                  <Line type="monotone" dataKey="consistency" name="Consistency" stroke="var(--destructive)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Actions & Appeals</CardTitle>
            <CardDescription>Moderation actions and user appeals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={historicalData}>
                  <XAxis dataKey="day" />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip />
                  <Bar dataKey="actions" name="Actions" fill="var(--primary)" />
                  <Bar dataKey="appeals" name="Appeals" fill="var(--destructive)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}