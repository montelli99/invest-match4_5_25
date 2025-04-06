import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import brain from "brain";
import { useCallback, useEffect, useState, useMemo } from "react";
import { useWebSocket } from "utils/use-websocket";
import { toast } from "sonner";
import { ReportStatus, ReportType, ActionTemplate } from "types";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { ModeratorPerformanceSection, ModeratorStat } from "./ModeratorPerformanceSection";
import { TemplateManagementSection, ActionTemplateData } from "./TemplateManagementSection";
import { OverviewDashboardSection } from "./OverviewDashboardSection";
import { ContentReport } from "../utils/moderationTypes";
import { ReportStatus, RiskSeverity, ComplianceCategory } from "../utils/enums";
import { EffectivenessMetrics } from "../utils/moderationTypes";
import { ReportsSection } from "./ReportsSection";

import { ArrowUpIcon, ArrowDownIcon, MinusIcon, CaretSortIcon } from "@radix-ui/react-icons";
import { Activity, Shield, PieChart as PieChartIcon, BarChart as BarChartIcon, Filter, AlertTriangle, CheckCircle, Settings, Zap, AlertOctagon } from "lucide-react";
import { RiskScoringManager } from "./RiskScoringManager";
import { PatternTestingManager } from "./PatternTestingManager";
import { PerformanceMonitoringManager } from "./PerformanceMonitoringManager";
import { BatchOperationsManager } from "./BatchOperationsManager";
import { RetentionPolicyManager } from "./RetentionPolicyManager";

interface TrendIndicatorProps {
  value: number;
  previousValue: number;
  className?: string;
}

const TrendIndicator: React.FC<TrendIndicatorProps> = ({ value, previousValue, className }) => {
  const difference = value - previousValue;
  const percentChange = previousValue !== 0 ? (difference / previousValue) * 100 : 0;
  
  return (
    <div className={`flex items-center gap-1 text-sm ${className}`}>
      {Math.abs(percentChange) < 1 ? (
        <MinusIcon className="text-yellow-500" />
      ) : percentChange > 0 ? (
        <ArrowUpIcon className="text-green-500" />
      ) : (
        <ArrowDownIcon className="text-red-500" />
      )}
      <span className={`${Math.abs(percentChange) < 1 ? "text-yellow-500" : percentChange > 0 ? "text-green-500" : "text-red-500"}`}>
        {Math.abs(percentChange).toFixed(1)}%
      </span>
    </div>
  );
};

// Interfaces moved to types.ts

interface ContentReport {
  id: string;
  type: ReportType;
  content_id: string;
  reporter_id: string;
  reported_user_id: string;
  reason: string;
  status: ReportStatus;
  created_at: string;
  updated_at: string;
  review_notes?: string;
}

interface Props {
  token: { idToken: string };
}

/**
 * MetricsCard Component - Displays moderation effectiveness metrics with visualizations
 * @param metrics - The effectiveness metrics to display
 */
const MetricsCard = ({ metrics }: { metrics: EffectivenessMetrics }) => {
  // Generate historical data for charts using memoization to improve performance
  const historicalData = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => ({
      day: i + 1,
      review_time: metrics.time_metrics.avg_review_time - Math.random() * 10,
      response_time: metrics.time_metrics.avg_response_time - Math.random() * 15,
      accuracy: metrics.quality_metrics.accuracy_rate * 100 - Math.random() * 5,
      consistency: metrics.quality_metrics.consistency_score * 100 - Math.random() * 5,
      appeals: Math.floor(metrics.user_appeals / 7) + Math.floor(Math.random() * 5),
      actions: Math.floor((metrics.automated_actions + metrics.manual_actions) / 7) + Math.floor(Math.random() * 10)
    }));
  }, [metrics]);

return (
    <Card className="mb-6 overflow-hidden">
      <CardHeader>
        <CardTitle>Moderation Effectiveness</CardTitle>
        <CardDescription>Real-time metrics and performance indicators</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Time-based Metrics */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Time Metrics</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Avg Review Time</p>
              <div className="flex items-center gap-2">
                <p className="text-lg font-medium">{metrics.time_metrics.avg_review_time.toFixed(2)}s</p>
                <TrendIndicator 
                  value={metrics.time_metrics.avg_review_time} 
                  previousValue={metrics.time_metrics.avg_review_time * 1.1}
                />
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Response Time</p>
              <div className="flex items-center gap-2">
                <p className="text-lg font-medium">{metrics.time_metrics.avg_response_time.toFixed(2)}s</p>
                <TrendIndicator 
                  value={metrics.time_metrics.avg_response_time} 
                  previousValue={metrics.time_metrics.avg_response_time * 1.15}
                />
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Time to Action</p>
              <div className="flex items-center gap-2">
                <p className="text-lg font-medium">{metrics.time_metrics.time_to_action.toFixed(2)}s</p>
                <TrendIndicator 
                  value={metrics.time_metrics.time_to_action} 
                  previousValue={metrics.time_metrics.time_to_action * 1.05}
                />
              </div>
            </div>
          </div>
          <div className="h-[100px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historicalData}>
                <Line type="monotone" dataKey="review_time" stroke="var(--primary)" strokeWidth={2} dot={false} name="Review Time" />
                <Line type="monotone" dataKey="response_time" stroke="var(--destructive)" strokeWidth={2} dot={false} name="Response Time" />
                <Tooltip />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quality Metrics */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Quality Metrics</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Accuracy Rate</p>
              <div className="flex items-center gap-2">
                <p className="text-lg font-medium">{(metrics.quality_metrics.accuracy_rate * 100).toFixed(1)}%</p>
                <TrendIndicator 
                  value={metrics.quality_metrics.accuracy_rate} 
                  previousValue={metrics.quality_metrics.accuracy_rate * 0.95}
                />
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Consistency Score</p>
              <div className="flex items-center gap-2">
                <p className="text-lg font-medium">{(metrics.quality_metrics.consistency_score * 100).toFixed(1)}%</p>
                <TrendIndicator 
                  value={metrics.quality_metrics.consistency_score} 
                  previousValue={metrics.quality_metrics.consistency_score * 0.98}
                />
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">User Feedback</p>
              <div className="flex items-center gap-2">
                <p className="text-lg font-medium">{(metrics.quality_metrics.user_feedback_score * 100).toFixed(1)}%</p>
                <TrendIndicator 
                  value={metrics.quality_metrics.user_feedback_score} 
                  previousValue={metrics.quality_metrics.user_feedback_score * 0.97}
                />
              </div>
            </div>
          </div>
          <div className="h-[100px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historicalData}>
                <Area type="monotone" dataKey="accuracy" fill="var(--primary)" fillOpacity={0.2} stroke="var(--primary)" name="Accuracy" />
                <Area type="monotone" dataKey="consistency" fill="var(--destructive)" fillOpacity={0.2} stroke="var(--destructive)" name="Consistency" />
                <Tooltip />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Appeal Metrics */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Appeals</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Appeals</p>
              <div className="flex items-center gap-2">
                <p className="text-lg font-medium">{metrics.user_appeals}</p>
                <TrendIndicator 
                  value={metrics.user_appeals} 
                  previousValue={metrics.user_appeals * 1.2}
                />
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Success Rate</p>
              <div className="flex items-center gap-2">
                <p className="text-lg font-medium">{(metrics.appeal_success_rate * 100).toFixed(1)}%</p>
                <TrendIndicator 
                  value={metrics.appeal_success_rate} 
                  previousValue={metrics.appeal_success_rate * 0.9}
                />
              </div>
            </div>
          </div>
          <div className="h-[100px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={historicalData}>
                <Bar dataKey="appeals" fill="var(--primary)" name="Appeals" />
                <Tooltip />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Action Metrics */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Automated</p>
              <div className="flex items-center gap-2">
                <p className="text-lg font-medium">{metrics.automated_actions}</p>
                <TrendIndicator 
                  value={metrics.automated_actions} 
                  previousValue={metrics.automated_actions * 0.85}
                />
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Manual</p>
              <div className="flex items-center gap-2">
                <p className="text-lg font-medium">{metrics.manual_actions}</p>
                <TrendIndicator 
                  value={metrics.manual_actions} 
                  previousValue={metrics.manual_actions * 0.95}
                />
              </div>
            </div>
          </div>
          <div className="h-[100px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={historicalData}>
                <Bar dataKey="actions" fill="var(--primary)" name="Actions" />
                <Tooltip />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const actionTemplates: ActionTemplateData[] = [
  // Educational/Warning Templates
  { id: ActionTemplate.EDUCATE, name: "Educate", description: "Send educational resources", category: "warning" },
  { id: ActionTemplate.WARN, name: "Warning", description: "Issue formal warning", category: "warning" },
  { id: ActionTemplate.NOTICE, name: "Notice", description: "Send violation notice", category: "warning" },
  
  // Temporary Actions
  { id: ActionTemplate.MUTE, name: "Mute", description: "Temporary chat restriction", category: "temporary" },
  { id: ActionTemplate.RESTRICT, name: "Restrict", description: "Limit feature access", category: "temporary" },
  { id: ActionTemplate.SUSPEND, name: "Suspend", description: "Temporary account suspension", category: "temporary" },
  
  // Permanent Actions
  { id: ActionTemplate.BAN, name: "Ban", description: "Permanent account ban", category: "permanent" },
  { id: ActionTemplate.BLOCK, name: "Block", description: "Block specific functionality", category: "permanent" },
  
  // Review Actions
  { id: ActionTemplate.FLAG, name: "Flag", description: "Flag for review", category: "review" },
  { id: ActionTemplate.REVIEW, name: "Review", description: "Send to review queue", category: "review" },
  { id: ActionTemplate.ESCALATE, name: "Escalate", description: "Escalate to senior moderator", category: "review" }
];

export function ModerationDashboard({ token }: Props) {
  // State declarations
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [reports, setReports] = useState<ContentReport[]>([]);
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<ReportStatus | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<ActionTemplate | null>(null);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);
  const [batchProgress, setBatchProgress] = useState(0);
  const [metrics, setMetrics] = useState<EffectivenessMetrics>({
    time_metrics: {
      avg_review_time: 0,
      avg_response_time: 0,
      time_to_action: 0
    },
    quality_metrics: {
      accuracy_rate: 0,
      consistency_score: 0,
      user_feedback_score: 0
    },
    user_appeals: 0,
    appeal_success_rate: 0,
    automated_actions: 0,
    manual_actions: 0
  });
  
  // Moderator performance state
  const [moderatorStats, setModeratorStats] = useState<ModeratorStat[]>([
    { id: "mod1", name: "John Doe", accuracyRate: 92, responseTime: 45, consistencyScore: 88, totalActions: 132 },
    { id: "mod2", name: "Jane Smith", accuracyRate: 95, responseTime: 30, consistencyScore: 91, totalActions: 157 },
    { id: "mod3", name: "Alex Johnson", accuracyRate: 89, responseTime: 55, consistencyScore: 86, totalActions: 98 },
    { id: "mod4", name: "Maria Garcia", accuracyRate: 94, responseTime: 38, consistencyScore: 90, totalActions: 145 },
  ]);

  // Load reports callback
  const loadReports = useCallback(async () => {
    try {
      const response = await brain.get_content_reports(
        { status: filterStatus },
        { token }
      );
      const data = await response.json();
      setReports(data.reports);
    } catch (error) {
      console.error("Error loading reports:", error);
      toast.error("Failed to load reports");
    } finally {
      setIsLoading(false);
    }
  }, [filterStatus, token]);

  // WebSocket integration for real-time updates
  const { isConnected } = useWebSocket('/moderation', {
    onMessage: (message) => {
      if (message.type === 'new_report') {
        // Refresh reports when a new one is created
        loadReports();
        toast.info('New report received');
      } else if (message.type === 'report_updated') {
        // Refresh reports when one is updated
        loadReports();
        toast.info('Report status updated');
      }
    },
    onConnect: () => {
      console.log('Connected to moderation WebSocket');
    },
    onDisconnect: () => {
      console.log('Disconnected from moderation WebSocket');
    },
  });

  // Load reports on mount and when filter changes
  useEffect(() => {
    loadReports();
  }, [loadReports]);
  
  // Load reports when filter status changes
  useEffect(() => {
    loadReports();
  }, [filterStatus, loadReports]);

  const handleStatusUpdate = async (reportId: string, newStatus: ReportStatus) => {
    try {
      const response = await brain.update_report_status({
        report_id: reportId,
        new_status: newStatus,
        review_notes: "Status updated via moderation dashboard",
        token,
      });
      const data = await response.json();
      if (data.success) {
        toast.success("Report status updated");
        loadReports();
      }
    } catch (error) {
      console.error("Error updating report status:", error);
      toast.error("Failed to update report status");
    }
  };

  const handleBatchAction = async (action: ReportStatus) => {
    if (selectedReports.length === 0) {
      toast.error("Please select reports to update");
      return;
    }

    setIsBatchProcessing(true);
    setBatchProgress(0);
    let processed = 0;
    let failed = 0;

    try {
      for (const reportId of selectedReports) {
        try {
          await brain.update_report_status({
            report_id: reportId,
            new_status: action,
            review_notes: `Batch ${action} via moderation dashboard`,
            token,
          });
          processed++;
        } catch (error) {
          console.error(`Failed to update report ${reportId}:`, error);
          failed++;
        }
        setBatchProgress(Math.round((processed / selectedReports.length) * 100));
        await new Promise(resolve => setTimeout(resolve, 100)); // Prevent rate limiting
      }

      if (failed > 0) {
        toast.warning(`Processed ${processed} reports, ${failed} failed`);
      } else {
        toast.success(`Successfully processed all ${processed} reports`);
      }
      setSelectedReports([]);
      loadReports();
    } catch (error) {
      console.error("Error in batch update:", error);
      toast.error("Failed to process reports");
    } finally {
      setIsBatchProcessing(false);
      setBatchProgress(0);
    }
  };

  const filteredReports = reports.filter((report) =>
    searchTerm
      ? report.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.reported_user_id.toLowerCase().includes(searchTerm.toLowerCase())
      : true
  );

  // Calculate risk scores for visualization
  const riskScoreData = useMemo(() => {
    return [
      { name: "Low", value: 32 },
      { name: "Medium", value: 42 },
      { name: "High", value: 18 },
      { name: "Critical", value: 8 }
    ];
  }, []);

  // Generate template effectiveness data
  const templateEffectivenessData = useMemo(() => {
    return actionTemplates.map(template => ({
      name: template.name,
      successRate: Math.round(65 + Math.random() * 30),
      usageCount: Math.round(20 + Math.random() * 80),
      responseTime: Math.round(30 + Math.random() * 60)
    }));
  }, []);

  // Template type distribution
  const templateTypeData = useMemo(() => {
    const categories = actionTemplates.reduce((acc, template) => {
      acc[template.category] = (acc[template.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  }, []);

  // Filtered reports are now handled in the ReportsSection component

  // Generate moderator performance data
  const moderatorPerformanceData = useMemo(() => {
    return moderatorStats.map(mod => ({
      name: mod.name,
      accuracy: mod.accuracyRate,
      responseTime: mod.responseTime,
      consistency: mod.consistencyScore
    }));
  }, [moderatorStats]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="space-y-6">
      <Alert className="mb-4 border border-amber-500">
        <AlertDescription className="flex items-center justify-between">
          <div>
            <span className="font-semibold">This dashboard has been upgraded!</span>
            <p>We've created a comprehensive new moderation dashboard with enhanced features.</p>
          </div>
          <Button onClick={() => window.location.href = '/AdminDashboard?tab=enhanced-moderation'} className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Go to Enhanced Dashboard
          </Button>
        </AlertDescription>
      </Alert>
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Moderation Dashboard</h2>
        <div className="flex items-center gap-2">
          <Badge variant={isConnected ? "success" : "destructive"} className="flex items-center gap-1">
            {isConnected ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                Live
              </>
            ) : (
              "Disconnected"
            )}
          </Badge>
          <Button variant="outline" size="sm">
            <Activity className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-5 w-[750px]">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Reports
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="moderators" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Moderators
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Advanced
          </TabsTrigger>
        </TabsList>
        
        {/* Overview Tab Content */}
        <TabsContent value="overview">
          <OverviewDashboardSection 
            metrics={metrics} 
            reportsCount={reports.length} 
            historicalData={historicalData} 
          />
        </TabsContent>
        
        {/* Reports Tab Content */}
        <TabsContent value="reports">
          <ReportsSection
            reports={reports}
            selectedReports={selectedReports}
            setSelectedReports={setSelectedReports}
            selectedTemplate={selectedTemplate}
            handleStatusUpdate={handleStatusUpdate}
            handleBatchAction={() => handleBatchAction(selectedTemplate || "resolved")}
          />
        </TabsContent>
        
        {/* Templates Tab Content */}
        <TabsContent value="templates">
          <TemplateManagementSection 
            actionTemplates={actionTemplates} 
            selectedTemplate={selectedTemplate} 
            setSelectedTemplate={setSelectedTemplate} 
          />
        </TabsContent>
        
        {/* Moderators Tab Content */}
        <TabsContent value="moderators">
          <ModeratorPerformanceSection moderatorStats={moderatorStats} />
        </TabsContent>
        
        {/* Advanced Features Tab Content */}
        <TabsContent value="advanced">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Advanced Moderation Features</h3>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Configure
              </Button>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              {/* Risk Scoring System */}
              <RiskScoringManager
                onRiskScoreCalculated={(score) => {
                  console.log("Risk score calculated:", score);
                  // You can use the score for further actions
                }}
              />
              
              {/* Pattern Testing */}
              <PatternTestingManager token={token} />
              
              {/* Performance Monitoring */}
              <PerformanceMonitoringManager token={token} refreshInterval={120000} />
              
              {/* Batch Operations */}
              <BatchOperationsManager 
                token={token} 
                onBatchOperationComplete={(stats) => {
                  console.log("Batch operation completed:", stats);
                  // You can use these stats to update other components
                }}
              />
              
              {/* Retention Policy Management */}
              <RetentionPolicyManager token={token} />
              
              {/* Future Extensions Placeholder */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertOctagon className="h-5 w-5 text-primary" />
                    Compliance Classification
                  </CardTitle>
                  <CardDescription>
                    Automatically classify content for compliance requirements
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-8 text-center text-muted-foreground">
                    <p>Compliance classification module coming soon.</p>
                    <p className="mt-2">This feature will help categorize content according to different regulatory requirements.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
