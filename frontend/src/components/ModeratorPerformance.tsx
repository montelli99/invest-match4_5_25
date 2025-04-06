import { useState } from "react";
import { CalendarIcon, DownloadIcon, InfoIcon, RefreshCwIcon, UserIcon, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, subDays } from "date-fns";
import { useToast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface ModeratorStats {
  userId: string;
  userName: string;
  avatarUrl: string | null;
  reportsProcessed: number;
  averageResponseTime: number; // in minutes
  accuracyRate: number; // percentage
  falsePositiveRate: number; // percentage
  resolutionRate: number; // percentage
  escalationRate: number; // percentage
  reportsPerContentType: Record<string, number>;
  actionsDistribution: Record<string, number>;
  performanceTrend: Array<{
    date: string;
    reportsProcessed: number;
    averageResponseTime: number;
    accuracyRate: number;
  }>;
}

interface TeamStats {
  totalReportsProcessed: number;
  averageResponseTime: number;
  averageAccuracyRate: number;
  reportDistribution: Record<string, number>;
  activeUsers: number;
  totalUsers: number;
}

interface ModeratorPerformanceProps {
  initialTab?: string;
}

const moderators: ModeratorStats[] = [
  {
    userId: "mod-1",
    userName: "Sarah Johnson",
    avatarUrl: null,
    reportsProcessed: 342,
    averageResponseTime: 12.5,
    accuracyRate: 96.7,
    falsePositiveRate: 3.2,
    resolutionRate: 88.5,
    escalationRate: 11.5,
    reportsPerContentType: {
      "Profile": 126,
      "Message": 187,
      "Document": 29
    },
    actionsDistribution: {
      "Approve": 245,
      "Reject": 68,
      "Escalate": 29
    },
    performanceTrend: [
      { date: "2025-03-01", reportsProcessed: 18, averageResponseTime: 13.2, accuracyRate: 95.8 },
      { date: "2025-03-02", reportsProcessed: 23, averageResponseTime: 12.8, accuracyRate: 96.1 },
      { date: "2025-03-03", reportsProcessed: 21, averageResponseTime: 12.6, accuracyRate: 96.4 },
      { date: "2025-03-04", reportsProcessed: 19, averageResponseTime: 12.5, accuracyRate: 96.9 },
      { date: "2025-03-05", reportsProcessed: 22, averageResponseTime: 12.2, accuracyRate: 97.1 },
      { date: "2025-03-06", reportsProcessed: 24, averageResponseTime: 12.0, accuracyRate: 97.2 },
      { date: "2025-03-07", reportsProcessed: 20, averageResponseTime: 12.5, accuracyRate: 96.7 }
    ]
  },
  {
    userId: "mod-2",
    userName: "Michael Chen",
    avatarUrl: null,
    reportsProcessed: 298,
    averageResponseTime: 10.2,
    accuracyRate: 95.4,
    falsePositiveRate: 4.6,
    resolutionRate: 92.1,
    escalationRate: 7.9,
    reportsPerContentType: {
      "Profile": 98,
      "Message": 162,
      "Document": 38
    },
    actionsDistribution: {
      "Approve": 192,
      "Reject": 82,
      "Escalate": 24
    },
    performanceTrend: [
      { date: "2025-03-01", reportsProcessed: 15, averageResponseTime: 10.8, accuracyRate: 94.7 },
      { date: "2025-03-02", reportsProcessed: 18, averageResponseTime: 10.5, accuracyRate: 95.1 },
      { date: "2025-03-03", reportsProcessed: 19, averageResponseTime: 10.3, accuracyRate: 95.2 },
      { date: "2025-03-04", reportsProcessed: 17, averageResponseTime: 10.2, accuracyRate: 95.4 },
      { date: "2025-03-05", reportsProcessed: 16, averageResponseTime: 10.0, accuracyRate: 95.6 },
      { date: "2025-03-06", reportsProcessed: 21, averageResponseTime: 9.8, accuracyRate: 95.9 },
      { date: "2025-03-07", reportsProcessed: 18, averageResponseTime: 10.2, accuracyRate: 95.4 }
    ]
  },
  {
    userId: "mod-3",
    userName: "Emily Rodriguez",
    avatarUrl: null,
    reportsProcessed: 412,
    averageResponseTime: 8.7,
    accuracyRate: 98.2,
    falsePositiveRate: 1.8,
    resolutionRate: 94.3,
    escalationRate: 5.7,
    reportsPerContentType: {
      "Profile": 145,
      "Message": 214,
      "Document": 53
    },
    actionsDistribution: {
      "Approve": 291,
      "Reject": 98,
      "Escalate": 23
    },
    performanceTrend: [
      { date: "2025-03-01", reportsProcessed: 22, averageResponseTime: 9.1, accuracyRate: 97.8 },
      { date: "2025-03-02", reportsProcessed: 24, averageResponseTime: 8.9, accuracyRate: 98.0 },
      { date: "2025-03-03", reportsProcessed: 23, averageResponseTime: 8.8, accuracyRate: 98.1 },
      { date: "2025-03-04", reportsProcessed: 25, averageResponseTime: 8.7, accuracyRate: 98.2 },
      { date: "2025-03-05", reportsProcessed: 26, averageResponseTime: 8.6, accuracyRate: 98.3 },
      { date: "2025-03-06", reportsProcessed: 24, averageResponseTime: 8.5, accuracyRate: 98.4 },
      { date: "2025-03-07", reportsProcessed: 22, averageResponseTime: 8.7, accuracyRate: 98.2 }
    ]
  },
  {
    userId: "mod-4",
    userName: "David Kim",
    avatarUrl: null,
    reportsProcessed: 278,
    averageResponseTime: 14.3,
    accuracyRate: 93.5,
    falsePositiveRate: 6.5,
    resolutionRate: 86.7,
    escalationRate: 13.3,
    reportsPerContentType: {
      "Profile": 92,
      "Message": 147,
      "Document": 39
    },
    actionsDistribution: {
      "Approve": 171,
      "Reject": 70,
      "Escalate": 37
    },
    performanceTrend: [
      { date: "2025-03-01", reportsProcessed: 14, averageResponseTime: 14.8, accuracyRate: 93.1 },
      { date: "2025-03-02", reportsProcessed: 16, averageResponseTime: 14.6, accuracyRate: 93.2 },
      { date: "2025-03-03", reportsProcessed: 15, averageResponseTime: 14.5, accuracyRate: 93.3 },
      { date: "2025-03-04", reportsProcessed: 14, averageResponseTime: 14.3, accuracyRate: 93.5 },
      { date: "2025-03-05", reportsProcessed: 15, averageResponseTime: 14.1, accuracyRate: 93.7 },
      { date: "2025-03-06", reportsProcessed: 17, averageResponseTime: 14.0, accuracyRate: 93.9 },
      { date: "2025-03-07", reportsProcessed: 15, averageResponseTime: 14.3, accuracyRate: 93.5 }
    ]
  }
];

const teamStats: TeamStats = {
  totalReportsProcessed: 1330,
  averageResponseTime: 11.4,
  averageAccuracyRate: 96.0,
  reportDistribution: {
    "Profile": 461,
    "Message": 710,
    "Document": 159
  },
  activeUsers: 4,
  totalUsers: 6
};

export function ModeratorPerformance({ initialTab = "overview" }: ModeratorPerformanceProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [dateRange, setDateRange] = useState("7d");
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const { toast } = useToast();

  const handleRefresh = () => {
    toast.success("Moderator performance metrics refreshed");
  };

  const handleDownload = () => {
    toast.success("Moderator performance report downloading");
  };

  // Sort moderators by reports processed (descending)
  const sortedModerators = [...moderators].sort((a, b) => b.reportsProcessed - a.reportsProcessed);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-medium">Moderator Performance</h3>
          <p className="text-sm text-muted-foreground">
            Track and analyze moderator activity and effectiveness
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[140px]">
              <CalendarIcon className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          {dateRange === "custom" && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[200px] pl-3 text-left font-normal">
                  {date ? format(date, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          )}
          <Button size="icon" variant="outline" onClick={handleRefresh}>
            <RefreshCwIcon className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="outline" onClick={handleDownload}>
            <DownloadIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue={initialTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="individual">Individual Performance</TabsTrigger>
          <TabsTrigger value="comparison">Team Comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Reports Processed
                </CardTitle>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <InfoIcon className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Total number of reports processed in the selected period</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{teamStats.totalReportsProcessed}</div>
                <p className="text-xs text-muted-foreground">
                  +{Math.floor(teamStats.totalReportsProcessed * 0.12)} from previous period
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Average Response Time
                </CardTitle>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <InfoIcon className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Average time to process a report in minutes</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{teamStats.averageResponseTime} min</div>
                <p className="text-xs text-muted-foreground">
                  -{(teamStats.averageResponseTime * 0.05).toFixed(1)} min from previous period
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Average Accuracy Rate
                </CardTitle>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <InfoIcon className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Percentage of correct moderation decisions</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{teamStats.averageAccuracyRate}%</div>
                <p className="text-xs text-muted-foreground">
                  +{(teamStats.averageAccuracyRate * 0.02).toFixed(1)}% from previous period
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Moderators
                </CardTitle>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <InfoIcon className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Number of active moderators out of total team</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{teamStats.activeUsers}/{teamStats.totalUsers}</div>
                <p className="text-xs text-muted-foreground">
                  {teamStats.activeUsers / teamStats.totalUsers * 100}% team availability
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Top Performers</CardTitle>
                <CardDescription>
                  Moderators with highest report volume and accuracy
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sortedModerators.slice(0, 3).map((moderator) => (
                    <div key={moderator.userId} className="flex items-center">
                      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary">
                        <UserIcon className="h-5 w-5" />
                      </div>
                      <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">{moderator.userName}</p>
                        <p className="text-sm text-muted-foreground">
                          {moderator.reportsProcessed} reports, {moderator.accuracyRate}% accuracy
                        </p>
                      </div>
                      <div className="ml-auto font-medium">
                        {(moderator.performanceTrend[moderator.performanceTrend.length - 1].accuracyRate > 
                          moderator.performanceTrend[0].accuracyRate) ? (
                          <span className="text-green-600">↑</span>
                        ) : (
                          <span className="text-red-600">↓</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Report Distribution</CardTitle>
                <CardDescription>
                  Breakdown of reports by content type
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(teamStats.reportDistribution).map(([type, count]) => {
                    const percentage = Math.round((count / teamStats.totalReportsProcessed) * 100);
                    return (
                      <div key={type} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{type}</span>
                            <Badge variant="secondary">{count}</Badge>
                          </div>
                          <span className="text-sm">{percentage}%</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="individual" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Individual Moderator Performance</CardTitle>
                  <CardDescription>
                    Select a moderator to view detailed performance metrics
                  </CardDescription>
                </div>
                <Select
                  value={selectedUser || ""}
                  onValueChange={(value) => setSelectedUser(value)}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select moderator" />
                  </SelectTrigger>
                  <SelectContent>
                    {moderators.map((mod) => (
                      <SelectItem key={mod.userId} value={mod.userId}>
                        {mod.userName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {selectedUser ? (
                <div className="space-y-6">
                  {(() => {
                    const mod = moderators.find(m => m.userId === selectedUser);
                    if (!mod) return <p>Moderator not found</p>;
                    
                    return (
                      <>
                        <div className="flex items-center space-x-4">
                          <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center">
                            <Users className="h-6 w-6" />
                          </div>
                          <div>
                            <h3 className="text-lg font-medium">{mod.userName}</h3>
                            <p className="text-sm text-muted-foreground">ID: {mod.userId}</p>
                          </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-4">
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Reports Processed</p>
                            <p className="text-2xl font-medium">{mod.reportsProcessed}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Avg. Response Time</p>
                            <p className="text-2xl font-medium">{mod.averageResponseTime} min</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Accuracy Rate</p>
                            <p className="text-2xl font-medium">{mod.accuracyRate}%</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">False Positive Rate</p>
                            <p className="text-2xl font-medium">{mod.falsePositiveRate}%</p>
                          </div>
                        </div>

                        <Separator />

                        <div className="space-y-4">
                          <h4 className="text-sm font-medium">Actions Distribution</h4>
                          <div className="grid gap-4 md:grid-cols-3">
                            {Object.entries(mod.actionsDistribution).map(([action, count]) => {
                              const percentage = Math.round((count / mod.reportsProcessed) * 100);
                              let color = "bg-green-100 text-green-800";
                              if (action === "Reject") color = "bg-amber-100 text-amber-800";
                              if (action === "Escalate") color = "bg-red-100 text-red-800";
                              
                              return (
                                <div key={action} className="rounded-lg border p-3">
                                  <div className="flex items-center justify-between">
                                    <Badge className={color} variant="secondary">{action}</Badge>
                                    <span className="text-sm font-medium">{percentage}%</span>
                                  </div>
                                  <p className="mt-2 text-2xl font-bold">{count}</p>
                                  <Progress value={percentage} className="h-2 mt-2" />
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <Separator />

                        <div className="space-y-4">
                          <h4 className="text-sm font-medium">Content Types Processed</h4>
                          <div className="grid gap-4 md:grid-cols-3">
                            {Object.entries(mod.reportsPerContentType).map(([type, count]) => {
                              const percentage = Math.round((count / mod.reportsProcessed) * 100);
                              
                              return (
                                <div key={type} className="rounded-lg border p-3">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">{type}</span>
                                    <span className="text-sm">{percentage}%</span>
                                  </div>
                                  <p className="mt-2 text-2xl font-bold">{count}</p>
                                  <Progress value={percentage} className="h-2 mt-2" />
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <Separator />

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium">Performance Metrics</h4>
                            <Badge variant={mod.accuracyRate > 95 ? "success" : "warning"}>
                              {mod.accuracyRate > 95 ? "High Performer" : "Average Performer"}
                            </Badge>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <p className="text-sm">Resolution Rate</p>
                              <p className="text-sm font-medium">{mod.resolutionRate}%</p>
                            </div>
                            <Progress value={mod.resolutionRate} className="h-2" />
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <p className="text-sm">Escalation Rate</p>
                              <p className="text-sm font-medium">{mod.escalationRate}%</p>
                            </div>
                            <Progress value={mod.escalationRate} className="h-2" />
                          </div>
                        </div>
                      </>
                    );
                  })()} 
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Users className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">Select a Moderator</h3>
                  <p className="text-sm text-muted-foreground max-w-md mt-1">
                    Choose a moderator from the dropdown to view their detailed performance metrics and statistics.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Team Performance Comparison</CardTitle>
              <CardDescription>
                Side-by-side comparison of all moderators
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left text-sm p-2">Moderator</th>
                      <th className="text-left text-sm p-2">Reports</th>
                      <th className="text-left text-sm p-2">Avg. Time</th>
                      <th className="text-left text-sm p-2">Accuracy</th>
                      <th className="text-left text-sm p-2">False +</th>
                      <th className="text-left text-sm p-2">Resolution</th>
                      <th className="text-left text-sm p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedModerators.map((mod) => (
                      <tr key={mod.userId} className="border-b hover:bg-muted/50">
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <UserIcon className="h-4 w-4 text-primary" />
                            </div>
                            <span className="text-sm font-medium">{mod.userName}</span>
                          </div>
                        </td>
                        <td className="p-2">{mod.reportsProcessed}</td>
                        <td className="p-2">{mod.averageResponseTime} min</td>
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            <Progress value={mod.accuracyRate} className="h-2 w-16" />
                            <span className="text-sm">{mod.accuracyRate}%</span>
                          </div>
                        </td>
                        <td className="p-2">{mod.falsePositiveRate}%</td>
                        <td className="p-2">{mod.resolutionRate}%</td>
                        <td className="p-2">
                          <Badge variant={mod.accuracyRate > 95 ? "success" : "warning"}>
                            {mod.accuracyRate > 95 ? "High" : "Average"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
            <CardFooter>
              <p className="text-xs text-muted-foreground">
                Performance metrics based on the last {dateRange === "7d" ? "7 days" : dateRange === "30d" ? "30 days" : "90 days"} of activity. Rankings updated daily.
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
