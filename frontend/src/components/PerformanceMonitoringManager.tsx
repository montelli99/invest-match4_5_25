import { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from "@radix-ui/react-icons";
import { AlertCircle, Activity, BarChart as BarChartIcon, Clock, Database, RefreshCw, ShieldAlert, ZapOff, Cpu, CheckCircle } from "lucide-react";
import type { EffectivenessMetrics } from "../utils/moderationExports";

/**
 * TrendIndicator component props
 */
interface TrendIndicatorProps {
  value: number;
  previousValue: number;
  inverse?: boolean;
  className?: string;
}

/**
 * TrendIndicator component - Shows trend direction and percentage change
 */
const TrendIndicator: React.FC<TrendIndicatorProps> = ({ value, previousValue, inverse = false, className }) => {
  const difference = value - previousValue;
  const percentChange = previousValue !== 0 ? (difference / previousValue) * 100 : 0;
  
  // For inverse metrics (like error rates), lower is better
  const isPositive = inverse ? percentChange < 0 : percentChange > 0;
  const isNeutral = Math.abs(percentChange) < 1;
  
  return (
    <div className={`flex items-center gap-1 text-sm ${className}`}>
      {isNeutral ? (
        <MinusIcon className="text-yellow-500" />
      ) : isPositive ? (
        <ArrowUpIcon className="text-green-500" />
      ) : (
        <ArrowDownIcon className="text-red-500" />
      )}
      <span className={`${isNeutral ? "text-yellow-500" : isPositive ? "text-green-500" : "text-red-500"}`}>
        {Math.abs(percentChange).toFixed(1)}%
      </span>
    </div>
  );
};

/**
 * Performance metrics interface
 */
interface PerformanceMetrics {
  // Response time metrics
  avgResponseTime: number;
  p95ResponseTime: number;
  maxResponseTime: number;
  
  // Cache metrics
  cacheHitRate: number;
  cacheMissRate: number;
  cacheSize: number;
  
  // Error metrics
  errorRate: number;
  errorCount: number;
  successRate: number;
  
  // Resource usage
  cpuUsage: number;
  memoryUsage: number;
  dbConnections: number;
  
  // Rule effectiveness
  ruleEffectiveness: number;
  falsePositiveRate: number;
  automationRate: number;
}

/**
 * Performance data point interface for time series data
 */
interface PerformanceDataPoint {
  timestamp: string;
  responseTime: number;
  cacheHitRate: number;
  errorRate: number;
  cpuUsage: number;
  memoryUsage: number;
  ruleEffectiveness: number;
}

/**
 * Props for PerformanceMonitoringManager component
 */
interface Props {
  token: { idToken: string };
  refreshInterval?: number; // in milliseconds
}

/**
 * PerformanceMonitoringManager component - Monitors system performance metrics
 */
export function PerformanceMonitoringManager({ token, refreshInterval = 60000 }: Props) {
  // State for metrics data
  const [timeRange, setTimeRange] = useState<"1h" | "24h" | "7d" | "30d">("24h");
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({
    avgResponseTime: 120,
    p95ResponseTime: 350,
    maxResponseTime: 890,
    cacheHitRate: 78.5,
    cacheMissRate: 21.5,
    cacheSize: 256,
    errorRate: 2.3,
    errorCount: 157,
    successRate: 97.7,
    cpuUsage: 42.8,
    memoryUsage: 61.2,
    dbConnections: 24,
    ruleEffectiveness: 85.6,
    falsePositiveRate: 8.2,
    automationRate: 67.3
  });
  
  // Previous metrics for trends
  const [previousMetrics, setPreviousMetrics] = useState<PerformanceMetrics>({
    avgResponseTime: 135,
    p95ResponseTime: 380,
    maxResponseTime: 950,
    cacheHitRate: 72.1,
    cacheMissRate: 27.9,
    cacheSize: 220,
    errorRate: 3.1,
    errorCount: 185,
    successRate: 96.9,
    cpuUsage: 48.5,
    memoryUsage: 65.8,
    dbConnections: 22,
    ruleEffectiveness: 80.2,
    falsePositiveRate: 9.8,
    automationRate: 61.5
  });
  
  // Historical performance data
  const [performanceHistory, setPerformanceHistory] = useState<PerformanceDataPoint[]>([]);
  
  // Generate historical data based on time range
  useEffect(() => {
    // In a real implementation, this would fetch from an API
    const generateHistoricalData = () => {
      const now = new Date();
      const data: PerformanceDataPoint[] = [];
      
      let dataPoints: number;
      let timeIncrement: number;
      
      switch (timeRange) {
        case "1h":
          dataPoints = 60;
          timeIncrement = 60 * 1000; // 1 minute
          break;
        case "24h":
          dataPoints = 24;
          timeIncrement = 60 * 60 * 1000; // 1 hour
          break;
        case "7d":
          dataPoints = 7 * 24;
          timeIncrement = 60 * 60 * 1000; // 1 hour
          break;
        case "30d":
          dataPoints = 30;
          timeIncrement = 24 * 60 * 60 * 1000; // 1 day
          break;
      }
      
      for (let i = dataPoints - 1; i >= 0; i--) {
        const timestamp = new Date(now.getTime() - (i * timeIncrement));
        
        // Create random but somewhat realistic variations in metrics
        const baseResponseTime = performanceMetrics.avgResponseTime;
        const baseCacheHitRate = performanceMetrics.cacheHitRate;
        const baseErrorRate = performanceMetrics.errorRate;
        const baseCpuUsage = performanceMetrics.cpuUsage;
        const baseMemoryUsage = performanceMetrics.memoryUsage;
        const baseRuleEffectiveness = performanceMetrics.ruleEffectiveness;
        
        // Add some daily/hourly patterns and random variations
        const hourFactor = (timestamp.getHours() / 24) * 30; // Higher values during peak hours
        const randomFactor = (Math.random() - 0.5) * 20;
        
        data.push({
          timestamp: timestamp.toISOString(),
          responseTime: Math.max(50, baseResponseTime + hourFactor + randomFactor),
          cacheHitRate: Math.min(100, Math.max(40, baseCacheHitRate + (Math.random() - 0.5) * 10)),
          errorRate: Math.max(0, baseErrorRate + (Math.random() - 0.5) * 2),
          cpuUsage: Math.min(100, Math.max(10, baseCpuUsage + hourFactor/2 + randomFactor/2)),
          memoryUsage: Math.min(100, Math.max(20, baseMemoryUsage + (Math.random() - 0.5) * 15)),
          ruleEffectiveness: Math.min(100, Math.max(60, baseRuleEffectiveness + (Math.random() - 0.5) * 8))
        });
      }
      
      return data;
    };
    
    setPerformanceHistory(generateHistoricalData());
  }, [timeRange, performanceMetrics]);
  
  // Simulate fetching updated metrics at regular intervals
  useEffect(() => {
    const fetchMetrics = async () => {
      setIsLoading(true);
      
      try {
        // In a real implementation, this would fetch from an API
        // For now, we'll simulate by slightly modifying the current metrics
        
        // First, save current metrics as previous for trend calculation
        setPreviousMetrics({...performanceMetrics});
        
        // Then update with new "fetched" metrics (simulated variations)
        setPerformanceMetrics(prev => ({
          avgResponseTime: Math.max(50, prev.avgResponseTime + (Math.random() - 0.5) * 20),
          p95ResponseTime: Math.max(150, prev.p95ResponseTime + (Math.random() - 0.5) * 40),
          maxResponseTime: Math.max(300, prev.maxResponseTime + (Math.random() - 0.5) * 100),
          cacheHitRate: Math.min(100, Math.max(50, prev.cacheHitRate + (Math.random() - 0.5) * 5)),
          cacheMissRate: 100 - Math.min(100, Math.max(50, prev.cacheHitRate + (Math.random() - 0.5) * 5)),
          cacheSize: Math.max(100, prev.cacheSize + (Math.random() - 0.5) * 30),
          errorRate: Math.max(0, prev.errorRate + (Math.random() - 0.5) * 1),
          errorCount: Math.max(0, prev.errorCount + (Math.random() - 0.5) * 30),
          successRate: 100 - Math.max(0, prev.errorRate + (Math.random() - 0.5) * 1),
          cpuUsage: Math.min(100, Math.max(10, prev.cpuUsage + (Math.random() - 0.5) * 10)),
          memoryUsage: Math.min(100, Math.max(20, prev.memoryUsage + (Math.random() - 0.5) * 8)),
          dbConnections: Math.max(1, prev.dbConnections + (Math.random() - 0.5) * 5),
          ruleEffectiveness: Math.min(100, Math.max(60, prev.ruleEffectiveness + (Math.random() - 0.5) * 3)),
          falsePositiveRate: Math.max(0, prev.falsePositiveRate + (Math.random() - 0.5) * 2),
          automationRate: Math.min(100, Math.max(40, prev.automationRate + (Math.random() - 0.5) * 5))
        }));
        
        setLastUpdated(new Date());
      } catch (error) {
        console.error("Error fetching performance metrics:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Initial fetch
    fetchMetrics();
    
    // Set up interval for refreshing
    const intervalId = setInterval(fetchMetrics, refreshInterval);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [refreshInterval]);
  
  // Format time based on range
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    switch (timeRange) {
      case "1h":
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      case "24h":
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      case "7d":
        return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit' });
      case "30d":
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };
  
  // Get formatted timestamps for charts
  const chartData = useMemo(() => {
    return performanceHistory.map(point => ({
      ...point,
      formattedTime: formatTime(point.timestamp)
    }));
  }, [performanceHistory, timeRange]);
  
  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Performance Monitoring</CardTitle>
            <CardDescription>
              System performance metrics and analytics
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={(value) => setTimeRange(value as "1h" | "24h" | "7d" | "30d")}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">Last Hour</SelectItem>
                <SelectItem value="24h">Last 24 Hours</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={() => setLastUpdated(new Date())} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          Last updated: {lastUpdated.toLocaleString()}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid grid-cols-4 w-[600px]">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="response-times" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Response Times
            </TabsTrigger>
            <TabsTrigger value="errors" className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Errors & Caching
            </TabsTrigger>
            <TabsTrigger value="resources" className="flex items-center gap-2">
              <Cpu className="h-4 w-4" />
              Resources
            </TabsTrigger>
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    Response Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-2xl font-bold">{performanceMetrics.avgResponseTime.toFixed(1)}ms</div>
                      <div className="text-sm text-muted-foreground">Avg Response Time</div>
                    </div>
                    <TrendIndicator 
                      value={performanceMetrics.avgResponseTime} 
                      previousValue={previousMetrics.avgResponseTime}
                      inverse={true} // Lower is better for response time
                    />
                  </div>
                  <div className="h-[100px] mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <Line 
                          type="monotone" 
                          dataKey="responseTime" 
                          name="Response Time" 
                          stroke="var(--primary)" 
                          strokeWidth={2} 
                          dot={false} 
                        />
                        <Tooltip 
                          formatter={(value: any) => [`${value}ms`, 'Response Time']}
                          labelFormatter={(label) => label}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 text-primary" />
                    Rule Effectiveness
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-2xl font-bold">{performanceMetrics.ruleEffectiveness.toFixed(1)}%</div>
                      <div className="text-sm text-muted-foreground">Overall Effectiveness</div>
                    </div>
                    <TrendIndicator 
                      value={performanceMetrics.ruleEffectiveness} 
                      previousValue={previousMetrics.ruleEffectiveness}
                    />
                  </div>
                  <div className="h-[100px] mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <Area 
                          type="monotone" 
                          dataKey="ruleEffectiveness" 
                          name="Effectiveness" 
                          stroke="var(--primary)" 
                          fill="var(--primary)" 
                          fillOpacity={0.2} 
                        />
                        <Tooltip 
                          formatter={(value: any) => [`${value.toFixed(1)}%`, 'Effectiveness']}
                          labelFormatter={(label) => label}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Database className="h-4 w-4 text-primary" />
                    Cache Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-2xl font-bold">{performanceMetrics.cacheHitRate.toFixed(1)}%</div>
                      <div className="text-sm text-muted-foreground">Cache Hit Rate</div>
                    </div>
                    <TrendIndicator 
                      value={performanceMetrics.cacheHitRate} 
                      previousValue={previousMetrics.cacheHitRate}
                    />
                  </div>
                  <div className="h-[100px] mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <Line 
                          type="monotone" 
                          dataKey="cacheHitRate" 
                          name="Cache Hit Rate" 
                          stroke="var(--primary)" 
                          strokeWidth={2} 
                          dot={false} 
                        />
                        <Tooltip 
                          formatter={(value: any) => [`${value.toFixed(1)}%`, 'Cache Hit Rate']}
                          labelFormatter={(label) => label}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <ZapOff className="h-4 w-4 text-primary" />
                    Error Rates
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-2xl font-bold">{performanceMetrics.errorRate.toFixed(2)}%</div>
                      <div className="text-sm text-muted-foreground">Error Rate</div>
                    </div>
                    <TrendIndicator 
                      value={performanceMetrics.errorRate} 
                      previousValue={previousMetrics.errorRate}
                      inverse={true} // Lower is better for errors
                    />
                  </div>
                  <div className="h-[100px] mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <Area 
                          type="monotone" 
                          dataKey="errorRate" 
                          name="Error Rate" 
                          stroke="var(--destructive)" 
                          fill="var(--destructive)" 
                          fillOpacity={0.2} 
                        />
                        <Tooltip 
                          formatter={(value: any) => [`${value.toFixed(2)}%`, 'Error Rate']}
                          labelFormatter={(label) => label}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-4 gap-4">
              <Card className="col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">System Health</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">CPU Usage</span>
                        <span className="text-sm font-medium">{performanceMetrics.cpuUsage.toFixed(1)}%</span>
                      </div>
                      <Progress value={performanceMetrics.cpuUsage} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Memory Usage</span>
                        <span className="text-sm font-medium">{performanceMetrics.memoryUsage.toFixed(1)}%</span>
                      </div>
                      <Progress value={performanceMetrics.memoryUsage} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Cache Utilization</span>
                        <span className="text-sm font-medium">{(performanceMetrics.cacheHitRate).toFixed(1)}%</span>
                      </div>
                      <Progress value={performanceMetrics.cacheHitRate} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">DB Connections</span>
                        <span className="text-sm font-medium">{Math.round(performanceMetrics.dbConnections)} active</span>
                      </div>
                      <Progress value={performanceMetrics.dbConnections / 50 * 100} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Key Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">P95 Response Time</div>
                      <div className="text-xl font-semibold">{performanceMetrics.p95ResponseTime.toFixed(0)}ms</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">Success Rate</div>
                      <div className="text-xl font-semibold">{performanceMetrics.successRate.toFixed(2)}%</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">False Positive Rate</div>
                      <div className="text-xl font-semibold">{performanceMetrics.falsePositiveRate.toFixed(2)}%</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">Automation Rate</div>
                      <div className="text-xl font-semibold">{performanceMetrics.automationRate.toFixed(1)}%</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Response Times Tab */}
          <TabsContent value="response-times">
            <div className="grid grid-cols-1 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Response Time Metrics</CardTitle>
                  <CardDescription>
                    Analysis of system response times across operations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis 
                          dataKey="formattedTime" 
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tickFormatter={(value) => `${value}ms`}
                        />
                        <Tooltip 
                          formatter={(value: any) => [`${value}ms`, 'Response Time']}
                          labelFormatter={(label) => label}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="responseTime" 
                          name="Response Time" 
                          stroke="var(--primary)" 
                          strokeWidth={2} 
                          activeDot={{ r: 6 }} 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Average Response Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div className="text-4xl font-bold">{performanceMetrics.avgResponseTime.toFixed(1)}<span className="text-lg font-normal">ms</span></div>
                      <TrendIndicator 
                        value={performanceMetrics.avgResponseTime} 
                        previousValue={previousMetrics.avgResponseTime} 
                        inverse={true}
                      />
                    </div>
                    <div className="text-sm text-muted-foreground mt-2">
                      {performanceMetrics.avgResponseTime < 100 ? (
                        "Excellent response times"
                      ) : performanceMetrics.avgResponseTime < 300 ? (
                        "Good response times"
                      ) : (
                        "Response times need improvement"
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">P95 Response Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div className="text-4xl font-bold">{performanceMetrics.p95ResponseTime.toFixed(0)}<span className="text-lg font-normal">ms</span></div>
                      <TrendIndicator 
                        value={performanceMetrics.p95ResponseTime} 
                        previousValue={previousMetrics.p95ResponseTime} 
                        inverse={true}
                      />
                    </div>
                    <div className="text-sm text-muted-foreground mt-2">
                      95% of requests are faster than this
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Max Response Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div className="text-4xl font-bold">{performanceMetrics.maxResponseTime.toFixed(0)}<span className="text-lg font-normal">ms</span></div>
                      <TrendIndicator 
                        value={performanceMetrics.maxResponseTime} 
                        previousValue={previousMetrics.maxResponseTime} 
                        inverse={true}
                      />
                    </div>
                    <div className="text-sm text-muted-foreground mt-2">
                      Slowest request observed
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Alert variant={performanceMetrics.avgResponseTime > 300 ? "destructive" : "default"}>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Response Time Analysis</AlertTitle>
                <AlertDescription>
                  {performanceMetrics.avgResponseTime < 100 ? (
                    "System is performing excellently with fast response times across all operations."
                  ) : performanceMetrics.avgResponseTime < 300 ? (
                    "Response times are acceptable but there's room for optimization in high-traffic periods."
                  ) : (
                    "Response times are higher than recommended. Consider optimizing database queries, implementing caching, or scaling resources."
                  )}
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>
          
          {/* Errors & Caching Tab */}
          <TabsContent value="errors">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Error Rate Trend</CardTitle>
                  <CardDescription>
                    System error rates over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis 
                          dataKey="formattedTime" 
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tickFormatter={(value) => `${value}%`}
                        />
                        <Tooltip 
                          formatter={(value: any) => [`${value.toFixed(2)}%`, 'Error Rate']}
                          labelFormatter={(label) => label}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="errorRate" 
                          name="Error Rate" 
                          stroke="var(--destructive)" 
                          fill="var(--destructive)" 
                          fillOpacity={0.2} 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <div>
                      <div className="text-2xl font-bold">{performanceMetrics.errorRate.toFixed(2)}%</div>
                      <div className="text-sm text-muted-foreground">Current Error Rate</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{performanceMetrics.errorCount}</div>
                      <div className="text-sm text-muted-foreground">Total Errors</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{performanceMetrics.successRate.toFixed(2)}%</div>
                      <div className="text-sm text-muted-foreground">Success Rate</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Cache Performance</CardTitle>
                  <CardDescription>
                    Cache hit rates and efficiency metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Cache Hits', value: performanceMetrics.cacheHitRate },
                            { name: 'Cache Misses', value: performanceMetrics.cacheMissRate }
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                        >
                          <Cell fill="var(--primary)" />
                          <Cell fill="var(--muted)" />
                        </Pie>
                        <Tooltip formatter={(value: any) => `${value.toFixed(1)}%`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <div>
                      <div className="text-2xl font-bold">{performanceMetrics.cacheHitRate.toFixed(1)}%</div>
                      <div className="text-sm text-muted-foreground">Cache Hit Rate</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{performanceMetrics.cacheMissRate.toFixed(1)}%</div>
                      <div className="text-sm text-muted-foreground">Cache Miss Rate</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{performanceMetrics.cacheSize.toFixed(0)}MB</div>
                      <div className="text-sm text-muted-foreground">Cache Size</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle>System Reliability Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Success Rate</span>
                        <span className="text-sm">{performanceMetrics.successRate.toFixed(2)}%</span>
                      </div>
                      <Progress value={performanceMetrics.successRate} className="h-2" />
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Cache Efficiency</span>
                        <span className="text-sm">{performanceMetrics.cacheHitRate.toFixed(1)}%</span>
                      </div>
                      <Progress value={performanceMetrics.cacheHitRate} className="h-2" />
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Rule Effectiveness</span>
                        <span className="text-sm">{performanceMetrics.ruleEffectiveness.toFixed(1)}%</span>
                      </div>
                      <Progress value={performanceMetrics.ruleEffectiveness} className="h-2" />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 pt-2">
                      <div>
                        <div className="text-sm text-muted-foreground">False Positive Rate</div>
                        <div className="text-lg font-semibold">{performanceMetrics.falsePositiveRate.toFixed(2)}%</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Automation Rate</div>
                        <div className="text-lg font-semibold">{performanceMetrics.automationRate.toFixed(1)}%</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">DB Connections</div>
                        <div className="text-lg font-semibold">{Math.round(performanceMetrics.dbConnections)}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Resources Tab */}
          <TabsContent value="resources">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>CPU Usage</CardTitle>
                  <CardDescription>
                    System CPU utilization over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis 
                          dataKey="formattedTime" 
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tickFormatter={(value) => `${value}%`}
                        />
                        <Tooltip 
                          formatter={(value: any) => [`${value.toFixed(1)}%`, 'CPU Usage']}
                          labelFormatter={(label) => label}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="cpuUsage" 
                          name="CPU Usage" 
                          stroke="var(--primary)" 
                          fill="var(--primary)" 
                          fillOpacity={0.2} 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <div>
                      <div className="text-2xl font-bold">{performanceMetrics.cpuUsage.toFixed(1)}%</div>
                      <div className="text-sm text-muted-foreground">Current CPU Usage</div>
                    </div>
                    <Badge variant={performanceMetrics.cpuUsage > 80 ? "destructive" : performanceMetrics.cpuUsage > 60 ? "warning" : "secondary"}>
                      {performanceMetrics.cpuUsage > 80 ? "High" : performanceMetrics.cpuUsage > 60 ? "Moderate" : "Normal"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Memory Usage</CardTitle>
                  <CardDescription>
                    System memory utilization over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis 
                          dataKey="formattedTime" 
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tickFormatter={(value) => `${value}%`}
                        />
                        <Tooltip 
                          formatter={(value: any) => [`${value.toFixed(1)}%`, 'Memory Usage']}
                          labelFormatter={(label) => label}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="memoryUsage" 
                          name="Memory Usage" 
                          stroke="var(--primary)" 
                          fill="var(--primary)" 
                          fillOpacity={0.2} 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <div>
                      <div className="text-2xl font-bold">{performanceMetrics.memoryUsage.toFixed(1)}%</div>
                      <div className="text-sm text-muted-foreground">Current Memory Usage</div>
                    </div>
                    <Badge variant={performanceMetrics.memoryUsage > 80 ? "destructive" : performanceMetrics.memoryUsage > 60 ? "warning" : "secondary"}>
                      {performanceMetrics.memoryUsage > 80 ? "High" : performanceMetrics.memoryUsage > 60 ? "Moderate" : "Normal"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle>Resource Allocation Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {performanceMetrics.cpuUsage > 75 && (
                      <Alert variant="warning">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>High CPU Usage</AlertTitle>
                        <AlertDescription>
                          CPU usage consistently above 75%. Consider scaling up compute resources or optimizing heavy operations.
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {performanceMetrics.memoryUsage > 80 && (
                      <Alert variant="warning">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>High Memory Usage</AlertTitle>
                        <AlertDescription>
                          Memory usage consistently above 80%. Consider increasing memory allocation or optimizing memory-intensive operations.
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {performanceMetrics.cacheMissRate > 40 && (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Cache Optimization Needed</AlertTitle>
                        <AlertDescription>
                          High cache miss rate suggests room for improvement. Review cache policies and consider increasing cache size.
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {performanceMetrics.dbConnections > 40 && (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Database Connection Pool Near Limit</AlertTitle>
                        <AlertDescription>
                          Database connection count approaching limits. Consider increasing connection pool size or optimizing connection usage.
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {performanceMetrics.errorRate > 5 && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Elevated Error Rate</AlertTitle>
                        <AlertDescription>
                          System error rate above acceptable threshold. Investigate error sources and implement fixes.
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {performanceMetrics.cpuUsage <= 75 && performanceMetrics.memoryUsage <= 80 && performanceMetrics.cacheMissRate <= 40 && performanceMetrics.dbConnections <= 40 && performanceMetrics.errorRate <= 5 && (
                      <Alert variant="success" className="bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-200">
                        <CheckCircle className="h-4 w-4" />
                        <AlertTitle>Healthy Resource Utilization</AlertTitle>
                        <AlertDescription>
                          All system resources are within optimal operating parameters. No immediate actions required.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" size="sm">
          <BarChartIcon className="h-4 w-4 mr-2" />
          Export Report
        </Button>
        <Button size="sm">
          <Activity className="h-4 w-4 mr-2" />
          Configure Alerts
        </Button>
      </CardFooter>
    </Card>
  );
}
