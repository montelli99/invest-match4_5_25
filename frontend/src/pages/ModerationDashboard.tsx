import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { RuleEffectivenessDashboard } from "components/RuleEffectivenessDashboard";
import { BatchOperationControls } from "components/BatchOperationControls";
import { ActionTemplateConfig } from "components/ActionTemplateConfig";
import { PatternTester } from "components/PatternTester";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import brain from "brain";
import { RuleEffectiveness, Report, ModAction } from "types";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from "recharts";
import { useInterval } from "@/hooks/use-interval";
import { useAdminStore } from "utils/adminStore";
import { AlertTriangle, FileText, Clock, CheckCircle, PieChart as PieChartIcon, BarChart as BarChartIcon, Activity, Shield, Users, Filter, TrendingUp } from "lucide-react";
import { useWebSocket } from "utils/use-websocket";
import { WS_API_URL } from "app";
import { Separator } from "@/components/ui/separator";

interface Template {
  id: string;
  name: string;
  parameters: {
    duration?: number;
    reason?: string;
    notification?: string;
    review_required: boolean;
  };
}

interface TimeMetrics {
  avgReviewTime: number;
  avgResponseTime: number;
  timeToAction: number;
  resolutionTime: number;
  escalationTime: number;
}

interface QualityMetrics {
  accuracyRate: number;
  consistencyScore: number;
  userFeedbackScore: number;
  falsePositiveRate: number;
  escalationRate: number;
  resolutionQuality: number;
}

interface PerformanceMetrics {
  timeMetrics: TimeMetrics;
  qualityMetrics: QualityMetrics;
  userAppeals: number;
  appealSuccessRate: number;
  automatedActions: number;
  manualActions: number;
}

interface RiskScore {
  score: number;
  factors: Record<string, number>;
  confidence: number;
  lastUpdated: string;
}

interface ContentRuleDetail {
  id: string;
  type: "profile" | "message";
  pattern: string;
  action: string;
  severity: string;
  createdBy: string;
  isActive: boolean;
  priority: "low" | "medium" | "high" | "critical";
  category: "spam" | "harassment" | "fraud" | "inappropriate" | "custom";
  description?: string;
  lastMatched?: string;
  matchCount: number;
  falsePositiveCount: number;
  effectivenessScore?: number;
}

export default function ModerationDashboard() {
  const navigate = useNavigate();
  
  // Redirect to the unified dashboard with a small delay to show the message
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/unified-moderation-dashboard');
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [navigate]);
  
  // Legacy state (kept for backwards compatibility)
  const [effectiveness, setEffectiveness] = useState<RuleEffectiveness[]>([]);
  const [rules, setRules] = useState<Array<ContentRuleDetail>>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [actions, setActions] = useState<ModAction[]>([]);
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [activeReportId, setActiveReportId] = useState<string | null>(null);
  const [riskScores, setRiskScores] = useState<Record<string, RiskScore>>({});
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  // WebSocket connection for real-time updates
  const { lastMessage } = useWebSocket(`${WS_API_URL}/moderation/ws`);
  
  useEffect(() => {
    if (lastMessage) {
      try {
        const data = JSON.parse(lastMessage.data);
        
        if (data.type === 'metrics_update') {
          setMetrics(prev => ({ ...prev, ...data.metrics }));
        } else if (data.type === 'report_update') {
          setReports(prev => {
            const reportIndex = prev.findIndex(r => r.id === data.report.id);
            if (reportIndex >= 0) {
              const updatedReports = [...prev];
              updatedReports[reportIndex] = data.report;
              return updatedReports;
            }
            return [data.report, ...prev];
          });
        } else if (data.type === 'rule_update') {
          setRules(prev => {
            const ruleIndex = prev.findIndex(r => r.id === data.rule.id);
            if (ruleIndex >= 0) {
              const updatedRules = [...prev];
              updatedRules[ruleIndex] = data.rule;
              return updatedRules;
            }
            return [data.rule, ...prev];
          });
        } else if (data.type === 'action_update') {
          setActions(prev => [data.action, ...prev]);
        }
      } catch (e) {
        console.error('Failed to parse WebSocket message:', e);
      }
    }
  }, [lastMessage]);
  
  const [templates, setTemplates] = useState<Template[]>([
    {
      id: "warn",
      name: "warn",
      parameters: {
        reason: "",
        notification: "Your content has been flagged for review.",
        review_required: false
      }
    },
    {
      id: "mute",
      name: "mute",
      parameters: {
        duration: 24,
        reason: "",
        notification: "Your account has been temporarily muted.",
        review_required: true
      }
    },
    {
      id: "suspend",
      name: "suspend",
      parameters: {
        duration: 72,
        reason: "",
        notification: "Your account has been suspended.",
        review_required: true
      }
    }
  ]);

  useEffect(() => {
    fetchEffectiveness();
    fetchRules();
    fetchReports();
    fetchActions();
    fetchMetrics();
    
    // Simulate risk scores for demo purposes
    const demoRiskScores: Record<string, RiskScore> = {};
    reports.slice(0, 5).forEach(report => {
      demoRiskScores[report.id] = {
        score: Math.floor(Math.random() * 100),
        factors: {
          content_keywords: Math.random() * 0.5,
          reporter_reputation: Math.random() * 0.3,
          time_sensitivity: Math.random() * 0.2,
          severity: Math.random() * 0.8,
        },
        confidence: 0.7 + Math.random() * 0.3,
        lastUpdated: new Date().toISOString()
      };
    });
    setRiskScores(demoRiskScores);
  }, []);

  // Polling backup for real-time updates if WebSocket fails
  useInterval(() => {
    fetchReports();
    fetchActions();
    fetchMetrics();
  }, 60000); // Update every minute as a backup

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const response = await brain.get_moderation_metrics({ token: {} });
      const data = await response.json();
      setMetrics({
        timeMetrics: {
          avgReviewTime: data.metrics.time_metrics.avg_review_time,
          avgResponseTime: data.metrics.time_metrics.avg_response_time,
          timeToAction: data.metrics.time_metrics.time_to_action,
          resolutionTime: data.metrics.time_metrics.resolution_time,
          escalationTime: data.metrics.time_metrics.escalation_time
        },
        qualityMetrics: {
          accuracyRate: data.metrics.quality_metrics.accuracy_rate,
          consistencyScore: data.metrics.quality_metrics.consistency_score,
          userFeedbackScore: data.metrics.quality_metrics.user_feedback_score,
          falsePositiveRate: data.metrics.quality_metrics.false_positive_rate,
          escalationRate: data.metrics.quality_metrics.escalation_rate,
          resolutionQuality: data.metrics.quality_metrics.resolution_quality
        },
        userAppeals: data.metrics.user_appeals,
        appealSuccessRate: data.metrics.appeal_success_rate,
        automatedActions: data.metrics.automated_actions,
        manualActions: data.metrics.manual_actions
      });
    } catch (error) {
      console.error("Failed to fetch metrics:", error);
      toast.error("Failed to load moderation metrics");
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    try {
      const response = await brain.get_content_reports({ status: null }, { token: {} });
      const data = await response.json();
      setReports(data.reports);
    } catch (error) {
      console.error("Failed to fetch reports:", error);
      toast.error("Failed to load content reports");
    }
  };

  const fetchActions = async () => {
    try {
      const response = await brain.get_moderation_actions({ report_id: null }, { token: {} });
      const data = await response.json();
      setActions(data.actions);
    } catch (error) {
      console.error("Failed to fetch actions:", error);
      toast.error("Failed to load moderation actions");
    }
  };

  const fetchEffectiveness = async () => {
    try {
      const response = await brain.get_rule_effectiveness({ token: {} });
      const data = await response.json();
      setEffectiveness(data.effectiveness);
    } catch (error) {
      console.error("Failed to fetch effectiveness:", error);
      toast.error("Failed to load rule effectiveness data");
    }
  };

  const fetchRules = async () => {
    try {
      setLoading(true);
      const response = await brain.get_content_rules({ token: {} });
      const data = await response.json();
      setRules(data.rules.map((rule: any) => ({
        id: rule.id,
        type: rule.type,
        pattern: rule.pattern,
        action: rule.action,
        severity: rule.severity,
        createdBy: rule.created_by,
        isActive: rule.is_active,
        priority: rule.priority || 'medium',
        category: rule.category || 'custom',
        description: rule.description,
        lastMatched: rule.last_matched,
        matchCount: rule.match_count || 0,
        falsePositiveCount: rule.false_positive_count || 0,
        effectivenessScore: rule.effectiveness_score
      })));
    } catch (error) {
      console.error("Failed to fetch rules:", error);
      toast.error("Failed to load content rules");
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateUpdate = (templateId: string, parameters: any) => {
    setTemplates(prev =>
      prev.map(template =>
        template.id === templateId
          ? { ...template, parameters }
          : template
      )
    );
  };

  // Filter reports based on search term and status
  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      const matchesSearch = searchTerm ? 
        report.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.id.toLowerCase().includes(searchTerm.toLowerCase())
        : true;
      
      const matchesStatus = filterStatus ? report.status === filterStatus : true;
      
      return matchesSearch && matchesStatus;
    });
  }, [reports, searchTerm, filterStatus]);
  
  // Calculate summary statistics
  const reportStats = useMemo(() => {
    return {
      pending: reports.filter(r => r.status === 'pending').length,
      reviewed: reports.filter(r => r.status === 'reviewed').length,
      resolved: reports.filter(r => r.status === 'resolved').length,
      total: reports.length,
      highRisk: Object.values(riskScores).filter(r => r.score >= 75).length,
      mediumRisk: Object.values(riskScores).filter(r => r.score >= 50 && r.score < 75).length,
      lowRisk: Object.values(riskScores).filter(r => r.score < 50).length,
    };
  }, [reports, riskScores]);
  
  // Generate charts data
  const timeMetricsChartData = useMemo(() => {
    if (!metrics) return [];
    
    return [
      { name: 'Review', value: metrics.timeMetrics.avgReviewTime },
      { name: 'Response', value: metrics.timeMetrics.avgResponseTime },
      { name: 'Action', value: metrics.timeMetrics.timeToAction },
      { name: 'Resolution', value: metrics.timeMetrics.resolutionTime },
      { name: 'Escalation', value: metrics.timeMetrics.escalationTime },
    ];
  }, [metrics]);
  
  const qualityMetricsChartData = useMemo(() => {
    if (!metrics) return [];
    
    return [
      { name: 'Accuracy', value: metrics.qualityMetrics.accuracyRate * 100 },
      { name: 'Consistency', value: metrics.qualityMetrics.consistencyScore * 100 },
      { name: 'Feedback', value: metrics.qualityMetrics.userFeedbackScore * 100 },
      { name: 'Quality', value: metrics.qualityMetrics.resolutionQuality * 100 },
      { name: 'False Pos', value: metrics.qualityMetrics.falsePositiveRate * 100 },
    ];
  }, [metrics]);
  
  const actionsChartData = useMemo(() => {
    if (!metrics) return [];
    
    return [
      { name: 'Automated', value: metrics.automatedActions },
      { name: 'Manual', value: metrics.manualActions },
    ];
  }, [metrics]);
  
  const renderMetricsCards = () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium">Response Times</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </div>
          <CardDescription>Performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeMetricsChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" domain={[0, 'dataMax + 100']} />
                <YAxis type="category" dataKey="name" width={70} />
                <Tooltip 
                  formatter={(value: number) => [`${value.toFixed(1)}s`, 'Time']} 
                  labelFormatter={(name) => `${name} Time`}
                />
                <Bar dataKey="value" fill="var(--primary)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-1 grid grid-cols-3 gap-2 text-xs text-muted-foreground">
            <div className="flex items-center">
              <div className="mr-1 h-2 w-2 rounded-full bg-primary"></div>
              <span>Response: {metrics?.timeMetrics.avgResponseTime.toFixed(1)}s</span>
            </div>
            <div className="flex items-center">
              <div className="mr-1 h-2 w-2 rounded-full bg-primary"></div>
              <span>Resolution: {metrics?.timeMetrics.resolutionTime.toFixed(1)}s</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium">Quality Metrics</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </div>
          <CardDescription>Accuracy and consistency</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={qualityMetricsChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip 
                  formatter={(value: number) => [`${value.toFixed(1)}%`, 'Score']} 
                  labelFormatter={(name) => `${name} Score`}
                />
                <Bar dataKey="value" fill="var(--primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center">
              <div className="mr-1 h-2 w-2 rounded-full bg-primary"></div>
              <span>Accuracy: {(metrics?.qualityMetrics.accuracyRate || 0) * 100}%</span>
            </div>
            <div className="flex items-center">
              <div className="mr-1 h-2 w-2 rounded-full bg-primary"></div>
              <span>False Positives: {(metrics?.qualityMetrics.falsePositiveRate || 0) * 100}%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium">Actions Distribution</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </div>
          <CardDescription>Automated vs Manual</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={actionsChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill="var(--primary)" />
                  <Cell fill="var(--muted)" />
                </Pie>
                <Tooltip formatter={(value) => [`${value}`, 'Actions']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-1 grid grid-cols-2 gap-4 text-xs">
            <div>
              <div className="text-muted-foreground">Automated</div>
              <div className="text-xl font-bold">{metrics?.automatedActions || 0}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Manual</div>
              <div className="text-xl font-bold">{metrics?.manualActions || 0}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium">Appeals & Outcomes</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </div>
          <CardDescription>User appeals tracking</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[180px] flex flex-col items-center justify-center">
            <div className="text-3xl font-bold">{metrics?.userAppeals || 0}</div>
            <div className="text-xl text-muted-foreground">Total Appeals</div>
            <div className="mt-2 h-2 w-full bg-muted">
              <div 
                className="h-full bg-primary" 
                style={{ width: `${(metrics?.appealSuccessRate || 0) * 100}%` }}
              />
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              Success Rate: {((metrics?.appealSuccessRate || 0) * 100).toFixed(1)}%
            </div>
          </div>
          <div className="mt-1 flex items-center justify-center text-xs">
            <div className="rounded-full bg-muted px-2 py-1">
              Average Resolution: {metrics?.timeMetrics.resolutionTime.toFixed(1)}s
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderReportsList = () => (
    <Card>
      <CardHeader>
        <CardTitle>Recent Reports</CardTitle>
        <CardDescription>Latest content reports requiring attention</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {reports.slice(0, 5).map((report) => (
            <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="font-medium">{report.type}</div>
                <div className="text-sm text-muted-foreground">{report.content}</div>
              </div>
              <Badge
                variant={
                  report.status === "pending"
                    ? "secondary"
                    : report.status === "reviewed"
                    ? "default"
                    : "outline"
                }
              >
                {report.status}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card className="border-primary">
        <CardHeader>
          <CardTitle>Redirecting to Enhanced Dashboard</CardTitle>
          <CardDescription>
            The moderation system has been upgraded with powerful new features. You'll be redirected to the new dashboard in a moment...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center">
            <Button 
              onClick={() => navigate('/unified-moderation-dashboard')} 
              className="mx-auto"
            >
              Go to Enhanced Dashboard Now
            </Button>
          </div>
          <Progress className="mt-4" value={100} />
        </CardContent>
      </Card>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Content Moderation Dashboard</h1>
        <Badge variant="outline" className="text-sm">
          {reports.length} Active Reports
        </Badge>
      </div>

      {renderMetricsCards()}

      <Tabs defaultValue="effectiveness" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="effectiveness">Rule Effectiveness</TabsTrigger>
          <TabsTrigger value="batch">Batch Operations</TabsTrigger>
          <TabsTrigger value="templates">Action Templates</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          {renderReportsList()}
        </TabsContent>

        <TabsContent value="effectiveness" className="mt-6">
          <RuleEffectivenessDashboard effectiveness={effectiveness} />
        </TabsContent>

        <TabsContent value="batch" className="mt-6">
          <BatchOperationControls 
            rules={rules} 
            onOperationComplete={fetchRules}
          />
        </TabsContent>

        <TabsContent value="templates" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <ActionTemplateConfig
                key={template.id}
                template={template.name}
                parameters={template.parameters}
                onParametersChange={(params) => handleTemplateUpdate(template.id, params)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="reports" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Content Reports</CardTitle>
              <CardDescription>Manage and review reported content</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <Card className="flex-1">
                    <CardHeader>
                      <CardTitle className="text-amber-500">Pending</CardTitle>
                      <CardDescription>Reports awaiting review</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {reports.filter(r => r.status === "pending").length}
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="flex-1">
                    <CardHeader>
                      <CardTitle className="text-blue-500">In Review</CardTitle>
                      <CardDescription>Reports being reviewed</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {reports.filter(r => r.status === "reviewed").length}
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="flex-1">
                    <CardHeader>
                      <CardTitle className="text-green-500">Resolved</CardTitle>
                      <CardDescription>Reports resolved</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {reports.filter(r => r.status === "resolved").length}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="border rounded-lg">
                  <div className="grid grid-cols-5 gap-4 p-4 font-medium border-b bg-muted/50">
                    <div>Type</div>
                    <div className="col-span-2">Content</div>
                    <div>Status</div>
                    <div>Actions</div>
                  </div>
                  <div className="divide-y">
                    {reports.map((report) => (
                      <div key={report.id} className="grid grid-cols-5 gap-4 p-4 items-center">
                        <div className="font-medium">{report.type}</div>
                        <div className="col-span-2 text-sm text-muted-foreground">
                          {report.content}
                        </div>
                        <div>
                          <Badge
                            variant={
                              report.status === "pending"
                                ? "secondary"
                                : report.status === "reviewed"
                                ? "default"
                                : "outline"
                            }
                          >
                            {report.status}
                          </Badge>
                        </div>
                        <div className="space-x-2">
                          {report.status === "pending" && (
                            <Badge
                              variant="outline"
                              className="cursor-pointer hover:bg-secondary"
                              onClick={() => {
                                brain.update_report_status({
                                  report_id: report.id,
                                  new_status: "reviewed",
                                  review_notes: "Started review process",
                                  token: {}
                                }).then(() => {
                                  fetchReports();
                                  toast.success("Report status updated");
                                }).catch(() => {
                                  toast.error("Failed to update report status");
                                });
                              }}
                            >
                              Review
                            </Badge>
                          )}
                          {report.status === "reviewed" && (
                            <Badge
                              variant="outline"
                              className="cursor-pointer hover:bg-secondary"
                              onClick={() => {
                                brain.update_report_status({
                                  report_id: report.id,
                                  new_status: "resolved",
                                  review_notes: "Content moderated and resolved",
                                  token: {}
                                }).then(() => {
                                  fetchReports();
                                  toast.success("Report resolved");
                                }).catch(() => {
                                  toast.error("Failed to resolve report");
                                });
                              }}
                            >
                              Resolve
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
