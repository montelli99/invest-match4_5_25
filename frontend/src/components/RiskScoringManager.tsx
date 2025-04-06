import { useState, useMemo, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { RiskCategory, RiskFactor, RiskSeverity, RiskScore } from "../utils/moderationTypes";
import { toast } from "sonner";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Filter,
  HelpCircle,
  LineChart as LineChartIcon,
  RefreshCw,
  Save,
  Search,
  Settings,
  Sliders,
  Trash2,
  XCircle,
} from "lucide-react";

/**
 * Content Item Interface
 */
interface ContentItem {
  id: string;
  type: "message" | "profile" | "document" | "comment";
  content: string;
  userId: string;
  createdAt: Date;
  reportCount: number;
  riskScore: number;
  status: "active" | "flagged" | "removed" | "approved";
}

/**
 * Risk Score Detail
 */
interface RiskScoreDetail extends RiskScore {
  id: string;
  contentId: string;
  contentType: "message" | "profile" | "document" | "comment";
  contentExcerpt: string;
  reviewStatus: "pending" | "reviewed" | "approved" | "rejected";
  reviewedBy?: string;
  reviewedAt?: Date;
}

/**
 * Risk Threshold Setting
 */
interface RiskThreshold {
  level: "low" | "medium" | "high" | "critical";
  minScore: number;
  color: string;
  autoAction?: "flag" | "hide" | "remove" | null;
  notifyModerators: boolean;
}

/**
 * RiskScoringManager component props
 */
interface Props {
  onRiskScoreCalculated?: (score: RiskScore) => void;
  token?: { idToken: string };
  showContentManagement?: boolean;
}

/**
 * RiskScoringManager component - Handles content risk scoring and assessment
 */
export function RiskScoringManager({ onRiskScoreCalculated, token, showContentManagement = false }: Props) {
  // State for risk factors
  const [contentSeverity, setContentSeverity] = useState<number>(50);
  const [userHistory, setUserHistory] = useState<number>(30);
  const [reportFrequency, setReportFrequency] = useState<number>(20);
  const [patternMatches, setPatternMatches] = useState<number>(40);
  const [category, setCategory] = useState<RiskCategory>(RiskCategory.HARASSMENT);
  
  // Risk factor weights
  const WEIGHTS = {
    contentSeverity: 0.4,
    userHistory: 0.25,
    reportFrequency: 0.15,
    patternMatches: 0.2
  };
  
  // Content management states
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [riskScores, setRiskScores] = useState<RiskScoreDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [sortField, setSortField] = useState<"score" | "createdAt">("score");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterThreshold, setFilterThreshold] = useState<string>("all");
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [showFactorSettings, setShowFactorSettings] = useState(false);
  const [showThresholdSettings, setShowThresholdSettings] = useState(false);
  const [activeTab, setActiveTab] = useState("calculator");
  
  // Risk Thresholds
  const [riskThresholds, setRiskThresholds] = useState<RiskThreshold[]>([
    {
      level: "low",
      minScore: 0,
      color: "#22c55e", // green
      autoAction: null,
      notifyModerators: false,
    },
    {
      level: "medium",
      minScore: 30,
      color: "#f59e0b", // amber
      autoAction: "flag",
      notifyModerators: false,
    },
    {
      level: "high",
      minScore: 60,
      color: "#ef4444", // red
      autoAction: "hide",
      notifyModerators: true,
    },
    {
      level: "critical",
      minScore: 85,
      color: "#7f1d1d", // dark red
      autoAction: "remove",
      notifyModerators: true,
    },
  ]);
  
  // Calculate final risk score
  const riskScore = useMemo(() => {
    const weightedScore = (
      contentSeverity * WEIGHTS.contentSeverity +
      userHistory * WEIGHTS.userHistory +
      reportFrequency * WEIGHTS.reportFrequency +
      patternMatches * WEIGHTS.patternMatches
    );
    
    let severity: RiskSeverity;
    
    if (weightedScore >= 80) {
      severity = RiskSeverity.CRITICAL;
    } else if (weightedScore >= 60) {
      severity = RiskSeverity.HIGH;
    } else if (weightedScore >= 40) {
      severity = RiskSeverity.MEDIUM;
    } else {
      severity = RiskSeverity.LOW;
    }
    
    const score: RiskScore = {
      value: Math.round(weightedScore),
      severity,
      category,
      factors: [
        { name: RiskFactor.CONTENT_SEVERITY, score: contentSeverity, weight: WEIGHTS.contentSeverity },
        { name: RiskFactor.USER_HISTORY, score: userHistory, weight: WEIGHTS.userHistory },
        { name: RiskFactor.REPORT_FREQUENCY, score: reportFrequency, weight: WEIGHTS.reportFrequency },
        { name: RiskFactor.PATTERN_MATCHES, score: patternMatches, weight: WEIGHTS.patternMatches }
      ],
      timestamp: new Date().toISOString()
    };
    
    return score;
  }, [contentSeverity, userHistory, reportFrequency, patternMatches, category]);
  
  // Notify parent of score changes
  useMemo(() => {
    if (onRiskScoreCalculated) {
      onRiskScoreCalculated(riskScore);
    }
  }, [riskScore, onRiskScoreCalculated]);
  
  // Risk distribution data for visualization
  const riskDistribution = useMemo(() => {
    const result = [
      { name: "Content Severity", value: contentSeverity * WEIGHTS.contentSeverity },
      { name: "User History", value: userHistory * WEIGHTS.userHistory },
      { name: "Report Frequency", value: reportFrequency * WEIGHTS.reportFrequency },
      { name: "Pattern Matches", value: patternMatches * WEIGHTS.patternMatches }
    ];
    return result;
  }, [contentSeverity, userHistory, reportFrequency, patternMatches]);
  
  // Color scheme for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
  
  // Load mock data on component mount if showing content management
  useEffect(() => {
    if (showContentManagement) {
      loadMockData();
    }
  }, [showContentManagement]);
  
  /**
   * Load mock risk scoring data for demonstration
   */
  const loadMockData = () => {
    setLoading(true);
    
    // Mock content items with risk scores
    const mockContentItems: ContentItem[] = [
      {
        id: "content1",
        type: "message",
        content: "Check out this investment opportunity! Guaranteed 50% returns in 24 hours!!!",
        userId: "user123",
        createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        reportCount: 5,
        riskScore: 92,
        status: "flagged",
      },
      {
        id: "content2",
        type: "comment",
        content: "Your investment strategy is terrible. You should be ashamed.",
        userId: "user456",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        reportCount: 3,
        riskScore: 65,
        status: "flagged",
      },
      {
        id: "content3",
        type: "profile",
        content: "Investment manager with 20+ years experience. Contact me for exclusive deals.",
        userId: "user789",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        reportCount: 2,
        riskScore: 45,
        status: "flagged",
      },
      {
        id: "content4",
        type: "document",
        content: "Investment Proposal - High Yield Fund Opportunity.pdf",
        userId: "user101",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
        reportCount: 1,
        riskScore: 72,
        status: "flagged",
      },
      {
        id: "content5",
        type: "message",
        content: "Anyone interested in discussing cryptocurrency regulations?",
        userId: "user202",
        createdAt: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
        reportCount: 1,
        riskScore: 15,
        status: "approved",
      },
      {
        id: "content6",
        type: "comment",
        content: "I disagree with your analysis of market trends. Here's why...",
        userId: "user303",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
        reportCount: 1,
        riskScore: 8,
        status: "approved",
      },
    ];
    
    // Generate detailed risk scores based on content items
    const mockRiskScores: RiskScoreDetail[] = mockContentItems.map(item => ({
      id: `score-${item.id}`,
      value: item.riskScore,
      severity: item.riskScore >= 80 ? RiskSeverity.CRITICAL : 
               item.riskScore >= 60 ? RiskSeverity.HIGH : 
               item.riskScore >= 40 ? RiskSeverity.MEDIUM : RiskSeverity.LOW,
      category: Math.random() > 0.5 ? RiskCategory.HARASSMENT : RiskCategory.FALSE_INFORMATION,
      factors: [
        { name: RiskFactor.CONTENT_SEVERITY, score: Math.round(Math.random() * 100), weight: WEIGHTS.contentSeverity },
        { name: RiskFactor.USER_HISTORY, score: Math.round(Math.random() * 100), weight: WEIGHTS.userHistory },
        { name: RiskFactor.REPORT_FREQUENCY, score: Math.round(Math.random() * 100), weight: WEIGHTS.reportFrequency },
        { name: RiskFactor.PATTERN_MATCHES, score: Math.round(Math.random() * 100), weight: WEIGHTS.patternMatches }
      ],
      timestamp: new Date().toISOString(),
      contentId: item.id,
      contentType: item.type,
      contentExcerpt: item.content.length > 50 ? `${item.content.substring(0, 50)}...` : item.content,
      reviewStatus: item.status === "approved" || item.status === "removed" ? "reviewed" : "pending",
      reviewedBy: item.status === "approved" || item.status === "removed" ? "moderator1" : undefined,
      reviewedAt: item.status === "approved" || item.status === "removed" ? new Date() : undefined,
    }));
    
    setContentItems(mockContentItems);
    setRiskScores(mockRiskScores);
    setLoading(false);
  };
  
  /**
   * Filter and sort content items
   */
  const getFilteredItems = () => {
    if (!showContentManagement || contentItems.length === 0) {
      return [];
    }
    
    let filtered = [...contentItems];
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(item => 
        item.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter(item => item.status === filterStatus);
    }
    
    // Apply threshold filter
    if (filterThreshold !== "all") {
      const threshold = riskThresholds.find(t => t.level === filterThreshold);
      if (threshold) {
        const nextThreshold = riskThresholds.find(t => t.level === getNextThresholdLevel(filterThreshold));
        
        if (nextThreshold) {
          filtered = filtered.filter(item => 
            item.riskScore >= threshold.minScore && item.riskScore < nextThreshold.minScore
          );
        } else {
          // For the highest threshold, just use the min score
          filtered = filtered.filter(item => item.riskScore >= threshold.minScore);
        }
      }
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      if (sortField === "score") {
        return sortOrder === "asc" ? a.riskScore - b.riskScore : b.riskScore - a.riskScore;
      } else {
        return sortOrder === "asc" 
          ? a.createdAt.getTime() - b.createdAt.getTime() 
          : b.createdAt.getTime() - a.createdAt.getTime();
      }
    });
    
    return filtered;
  };
  
  /**
   * Get the next threshold level for filtering
   */
  const getNextThresholdLevel = (level: string): string | undefined => {
    const levels = ["low", "medium", "high", "critical"];
    const currentIndex = levels.indexOf(level as "low" | "medium" | "high" | "critical");
    
    if (currentIndex !== -1 && currentIndex < levels.length - 1) {
      return levels[currentIndex + 1];
    }
    
    return undefined;
  };
  
  /**
   * Get the color for a risk score based on thresholds
   */
  const getRiskScoreColor = (score: number): string => {
    for (let i = riskThresholds.length - 1; i >= 0; i--) {
      if (score >= riskThresholds[i].minScore) {
        return riskThresholds[i].color;
      }
    }
    return "#22c55e"; // Default to green for low risk
  };
  
  /**
   * Get the threshold level for a score
   */
  const getRiskLevel = (score: number): string => {
    for (let i = riskThresholds.length - 1; i >= 0; i--) {
      if (score >= riskThresholds[i].minScore) {
        return riskThresholds[i].level;
      }
    }
    return "low";
  };
  
  /**
   * Handle review status change
   */
  const handleReviewStatusChange = (contentId: string, newStatus: "approved" | "rejected") => {
    // Update content items
    const updatedItems = contentItems.map(item => {
      if (item.id === contentId) {
        return {
          ...item,
          status: newStatus === "approved" ? "approved" : "removed"
        };
      }
      return item;
    });
    
    // Update risk scores
    const updatedScores = riskScores.map(score => {
      if (score.contentId === contentId) {
        return {
          ...score,
          reviewStatus: "reviewed",
          reviewedBy: "current-moderator", // In a real app, this would be the current user ID
          reviewedAt: new Date()
        };
      }
      return score;
    });
    
    setContentItems(updatedItems);
    setRiskScores(updatedScores);
    
    toast.success(`Content ${newStatus === "approved" ? "approved" : "removed"}`);
  };
  
  /**
   * Handle threshold change
   */
  const handleThresholdChange = (level: "low" | "medium" | "high" | "critical", field: string, value: any) => {
    const updatedThresholds = riskThresholds.map(threshold => {
      if (threshold.level === level) {
        return { ...threshold, [field]: value };
      }
      return threshold;
    });
    
    setRiskThresholds(updatedThresholds);
  };
  
  /**
   * Save settings
   */
  const saveSettings = () => {
    // In a real app, this would save to an API endpoint
    toast.success("Settings saved successfully");
    setShowFactorSettings(false);
    setShowThresholdSettings(false);
  };
  
  /**
   * Reset settings to defaults
   */
  const resetSettings = () => {
    // In a real app, this would load default settings from an API
    toast.info("Settings reset to defaults");
  };
  
  /**
   * Manually recalculate risk scores
   */
  const recalculateScores = () => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      // In a real app, this would call an API to recalculate scores
      toast.success("Risk scores recalculated");
      if (showContentManagement) {
        loadMockData(); // Refresh data
      }
      setLoading(false);
    }, 1000);
  };
  
  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleString();
  };
  
  // Get severity badge
  const getSeverityBadge = (severity: RiskSeverity) => {
    switch (severity) {
      case RiskSeverity.CRITICAL:
        return <Badge variant="destructive">Critical</Badge>;
      case RiskSeverity.HIGH:
        return <Badge variant="destructive" className="bg-orange-500">High</Badge>;
      case RiskSeverity.MEDIUM:
        return <Badge variant="warning">Medium</Badge>;
      case RiskSeverity.LOW:
        return <Badge variant="secondary">Low</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <span>Risk Scoring System</span>
              {activeTab === "calculator" && getSeverityBadge(riskScore.severity)}
            </CardTitle>
            <CardDescription>
              Automated risk assessment based on multiple factors
            </CardDescription>
          </div>
          {showContentManagement && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={() => setShowFactorSettings(!showFactorSettings)}
              >
                <Sliders className="h-4 w-4" />
                <span className="hidden sm:inline">Risk Factors</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={() => setShowThresholdSettings(!showThresholdSettings)}
              >
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Thresholds</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={recalculateScores}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">Recalculate</span>
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="px-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="calculator">Calculator</TabsTrigger>
            <TabsTrigger value="visualization">Visualization</TabsTrigger>
            {showContentManagement && <TabsTrigger value="management">Content Management</TabsTrigger>}
          </TabsList>
        </div>
        
        {/* Settings panels - appear when buttons are clicked */}
        {showFactorSettings && showContentManagement && (
          <div className="border rounded-md m-6 p-4 bg-muted/30">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Risk Factor Weights</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={resetSettings}>
                  Reset
                </Button>
                <Button size="sm" onClick={saveSettings} className="flex items-center gap-1">
                  <Save className="h-4 w-4" />
                  Save
                </Button>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Switch checked={true} />
                    <Label className="font-medium">Content Severity</Label>
                  </div>
                  <Badge variant="outline">{(WEIGHTS.contentSeverity * 100).toFixed(0)}%</Badge>
                </div>
                <Slider
                  value={[WEIGHTS.contentSeverity * 100]}
                  min={0}
                  max={100}
                  step={5}
                  disabled={false}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Switch checked={true} />
                    <Label className="font-medium">User History</Label>
                  </div>
                  <Badge variant="outline">{(WEIGHTS.userHistory * 100).toFixed(0)}%</Badge>
                </div>
                <Slider
                  value={[WEIGHTS.userHistory * 100]}
                  min={0}
                  max={100}
                  step={5}
                  disabled={false}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Switch checked={true} />
                    <Label className="font-medium">Report Frequency</Label>
                  </div>
                  <Badge variant="outline">{(WEIGHTS.reportFrequency * 100).toFixed(0)}%</Badge>
                </div>
                <Slider
                  value={[WEIGHTS.reportFrequency * 100]}
                  min={0}
                  max={100}
                  step={5}
                  disabled={false}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Switch checked={true} />
                    <Label className="font-medium">Pattern Matches</Label>
                  </div>
                  <Badge variant="outline">{(WEIGHTS.patternMatches * 100).toFixed(0)}%</Badge>
                </div>
                <Slider
                  value={[WEIGHTS.patternMatches * 100]}
                  min={0}
                  max={100}
                  step={5}
                  disabled={false}
                />
              </div>
            </div>
          </div>
        )}
        
        {showThresholdSettings && showContentManagement && (
          <div className="border rounded-md m-6 p-4 bg-muted/30">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Risk Thresholds</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={resetSettings}>
                  Reset
                </Button>
                <Button size="sm" onClick={saveSettings} className="flex items-center gap-1">
                  <Save className="h-4 w-4" />
                  Save
                </Button>
              </div>
            </div>
            
            <div className="space-y-4">
              {riskThresholds.map(threshold => (
                <div key={threshold.level} className="space-y-2 border-b pb-4 last:border-b-0 last:pb-0">
                  <div className="flex justify-between items-center">
                    <Label className="capitalize font-medium">
                      <span
                        className="inline-block w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: threshold.color }}
                      ></span>
                      {threshold.level} Risk
                    </Label>
                    <div className="flex items-center gap-2">
                      <Label>Min Score:</Label>
                      <Input
                        type="number"
                        className="w-16"
                        value={threshold.minScore}
                        min={0}
                        max={100}
                        onChange={(e) => 
                          handleThresholdChange(
                            threshold.level,
                            "minScore",
                            parseInt(e.target.value) || 0
                          )
                        }
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm">Auto Action:</Label>
                      <Select
                        value={threshold.autoAction || "none"}
                        onValueChange={(value) => 
                          handleThresholdChange(
                            threshold.level,
                            "autoAction",
                            value === "none" ? null : value
                          )
                        }
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="Select action" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="flag">Flag</SelectItem>
                          <SelectItem value="hide">Hide</SelectItem>
                          <SelectItem value="remove">Remove</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Label className="text-sm">Notify Moderators:</Label>
                      <Switch
                        checked={threshold.notifyModerators}
                        onCheckedChange={(checked) => 
                          handleThresholdChange(threshold.level, "notifyModerators", checked)
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Calculator tab */}
        <TabsContent value="calculator" className="space-y-4 p-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Content Severity ({contentSeverity})</Label>
                <span className="text-sm text-muted-foreground">
                  Weight: {WEIGHTS.contentSeverity * 100}%
                </span>
              </div>
              <Slider
                value={[contentSeverity]}
                min={0}
                max={100}
                step={1}
                onValueChange={([value]) => setContentSeverity(value)}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>User History ({userHistory})</Label>
                <span className="text-sm text-muted-foreground">
                  Weight: {WEIGHTS.userHistory * 100}%
                </span>
              </div>
              <Slider
                value={[userHistory]}
                min={0}
                max={100}
                step={1}
                onValueChange={([value]) => setUserHistory(value)}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Report Frequency ({reportFrequency})</Label>
                <span className="text-sm text-muted-foreground">
                  Weight: {WEIGHTS.reportFrequency * 100}%
                </span>
              </div>
              <Slider
                value={[reportFrequency]}
                min={0}
                max={100}
                step={1}
                onValueChange={([value]) => setReportFrequency(value)}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Pattern Matches ({patternMatches})</Label>
                <span className="text-sm text-muted-foreground">
                  Weight: {WEIGHTS.patternMatches * 100}%
                </span>
              </div>
              <Slider
                value={[patternMatches]}
                min={0}
                max={100}
                step={1}
                onValueChange={([value]) => setPatternMatches(value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Risk Category</Label>
              <Select
                value={category}
                onValueChange={(value) => setCategory(value as RiskCategory)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={RiskCategory.HARASSMENT}>Harassment</SelectItem>
                  <SelectItem value={RiskCategory.HATE_SPEECH}>Hate Speech</SelectItem>
                  <SelectItem value={RiskCategory.ADULT_CONTENT}>Adult Content</SelectItem>
                  <SelectItem value={RiskCategory.VIOLENCE}>Violence</SelectItem>
                  <SelectItem value={RiskCategory.SPAM}>Spam</SelectItem>
                  <SelectItem value={RiskCategory.FALSE_INFORMATION}>False Information</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>
        
        {/* Visualization tab */}
        <TabsContent value="visualization" className="space-y-4 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Risk Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={riskDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        nameKey="name"
                      >
                        {riskDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Final Risk Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center h-[300px]">
                  <div className="text-8xl font-bold">{riskScore.value}</div>
                  <div className="mt-4">{getSeverityBadge(riskScore.severity)}</div>
                  <div className="mt-2 text-muted-foreground">{category}</div>
                </div>
              </CardContent>
            </Card>
            
            {showContentManagement && (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Risk Level Distribution</CardTitle>
                  <CardDescription>Distribution of risk scores across all content</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { name: 'Low Risk', count: contentItems.filter(i => i.riskScore < 40).length },
                          { name: 'Medium Risk', count: contentItems.filter(i => i.riskScore >= 40 && i.riskScore < 60).length },
                          { name: 'High Risk', count: contentItems.filter(i => i.riskScore >= 60 && i.riskScore < 80).length },
                          { name: 'Critical Risk', count: contentItems.filter(i => i.riskScore >= 80).length },
                        ]}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" name="Content Items">
                          <Cell fill="#22c55e" />
                          <Cell fill="#f59e0b" />
                          <Cell fill="#ef4444" />
                          <Cell fill="#7f1d1d" />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
        
        {/* Content Management tab */}
        {showContentManagement && (
          <TabsContent value="management" className="p-0">
            <CardContent>
              <div className="space-y-4">
                {/* Search and Filter Row */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                  <div className="relative w-full sm:w-auto flex-1 max-w-sm">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search content..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Select
                      value={filterStatus}
                      onValueChange={setFilterStatus}
                    >
                      <SelectTrigger className="w-[130px]">
                        <Filter className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="flagged">Flagged</SelectItem>
                        <SelectItem value="removed">Removed</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select
                      value={filterThreshold}
                      onValueChange={setFilterThreshold}
                    >
                      <SelectTrigger className="w-[130px]">
                        <AlertCircle className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="Risk Level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Levels</SelectItem>
                        <SelectItem value="low">Low Risk</SelectItem>
                        <SelectItem value="medium">Medium Risk</SelectItem>
                        <SelectItem value="high">High Risk</SelectItem>
                        <SelectItem value="critical">Critical Risk</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select
                      value={sortField}
                      onValueChange={(value) => setSortField(value as "score" | "createdAt")}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Sort By" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="score">Risk Score</SelectItem>
                        <SelectItem value="createdAt">Date</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                    >
                      {sortOrder === "asc" ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                
                {/* Risk Scores Table */}
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Content</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Risk Score</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            <div className="flex flex-col items-center gap-2">
                              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                              <p className="text-sm text-muted-foreground">Loading risk scores...</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        getFilteredItems().map(item => {
                          const riskScoreObj = riskScores.find(score => score.contentId === item.id);
                          const scoreColor = getRiskScoreColor(item.riskScore);
                          const riskLevel = getRiskLevel(item.riskScore);
                          
                          return (
                            <TableRow 
                              key={item.id}
                              className={selectedItemId === item.id ? "bg-muted/50" : ""}
                              onClick={() => setSelectedItemId(selectedItemId === item.id ? null : item.id)}
                            >
                              <TableCell>
                                <div className="font-medium truncate max-w-[200px]">
                                  {item.content}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  User ID: {item.userId}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="capitalize">
                                  {item.type}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  {formatDate(item.createdAt)}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center">
                                  <span
                                    className="w-10 h-10 rounded-full flex items-center justify-center mr-2 text-white font-medium text-sm"
                                    style={{ backgroundColor: scoreColor }}
                                  >
                                    {item.riskScore}
                                  </span>
                                  <div className="flex flex-col">
                                    <span className="font-medium capitalize">{riskLevel}</span>
                                    <span className="text-xs text-muted-foreground">
                                      {item.reportCount} report{item.reportCount !== 1 ? "s" : ""}
                                    </span>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                {item.status === "active" && (
                                  <Badge variant="outline" className="bg-blue-50">
                                    Active
                                  </Badge>
                                )}
                                {item.status === "flagged" && (
                                  <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">
                                    Flagged
                                  </Badge>
                                )}
                                {item.status === "removed" && (
                                  <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">
                                    Removed
                                  </Badge>
                                )}
                                {item.status === "approved" && (
                                  <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                                    Approved
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  {item.status !== "approved" && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleReviewStatusChange(item.id, "approved");
                                      }}
                                    >
                                      <CheckCircle className="h-4 w-4 text-green-500" />
                                    </Button>
                                  )}
                                  {item.status !== "removed" && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleReviewStatusChange(item.id, "rejected");
                                      }}
                                    >
                                      <XCircle className="h-4 w-4 text-red-500" />
                                    </Button>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      // Show details
                                      setSelectedItemId(selectedItemId === item.id ? null : item.id);
                                    }}
                                  >
                                    <ArrowRight className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                      
                      {!loading && getFilteredItems().length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            <div className="flex flex-col items-center gap-2">
                              <p className="text-muted-foreground">No matching content found</p>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setSearchQuery("");
                                  setFilterStatus("all");
                                  setFilterThreshold("all");
                                }}
                              >
                                Clear Filters
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                
                {/* Selected Item Details */}
                {selectedItemId && (
                  <Card className="p-4 bg-muted/30">
                    <h3 className="text-lg font-semibold mb-2">Content Details</h3>
                    
                    {(() => {
                      const item = contentItems.find(item => item.id === selectedItemId);
                      const score = riskScores.find(score => score.contentId === selectedItemId);
                      
                      if (!item || !score) return <p>No details found</p>;
                      
                      return (
                        <div className="space-y-4">
                          <div className="grid gap-4 md:grid-cols-2">
                            <div>
                              <h4 className="text-sm font-medium mb-1">Content</h4>
                              <p className="text-sm p-2 border rounded-md bg-card">{item.content}</p>
                            </div>
                            
                            <div className="space-y-4">
                              <div>
                                <h4 className="text-sm font-medium mb-1">Risk Score: {item.riskScore}/100</h4>
                                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                  <div
                                    className="h-full"
                                    style={{
                                      width: `${item.riskScore}%`,
                                      backgroundColor: getRiskScoreColor(item.riskScore),
                                    }}
                                  />
                                </div>
                                <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                                  <span>Low</span>
                                  <span>Medium</span>
                                  <span>High</span>
                                  <span>Critical</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium mb-2">Risk Factor Breakdown</h4>
                            <div className="space-y-2">
                              {score.factors.map((factor) => {
                                return (
                                  <div key={factor.name} className="flex items-center">
                                    <div className="w-[180px]">
                                      <p className="text-sm">{factor.name}</p>
                                    </div>
                                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                      <div
                                        className="h-full bg-primary"
                                        style={{ width: `${(factor.score / 100) * 100}%` }}
                                      />
                                    </div>
                                    <div className="w-[80px] text-right">
                                      <p className="text-sm">{factor.score.toFixed(0)}/100</p>
                                      <p className="text-xs text-muted-foreground">{(factor.weight * 100).toFixed(0)}% weight</p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <h4 className="text-sm font-medium mb-1">User ID</h4>
                              <p className="text-sm">{item.userId}</p>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium mb-1">Content Type</h4>
                              <p className="text-sm capitalize">{item.type}</p>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium mb-1">Created At</h4>
                              <p className="text-sm">{formatDate(item.createdAt)}</p>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium mb-1">Status</h4>
                              <p className="text-sm capitalize">{item.status}</p>
                            </div>
                          </div>
                          
                          <div className="pt-2 flex justify-end gap-2">
                            {item.status !== "approved" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex items-center gap-1"
                                onClick={() => handleReviewStatusChange(item.id, "approved")}
                              >
                                <CheckCircle className="h-4 w-4" />
                                Approve Content
                              </Button>
                            )}
                            {item.status !== "removed" && (
                              <Button
                                size="sm"
                                variant="destructive"
                                className="flex items-center gap-1"
                                onClick={() => handleReviewStatusChange(item.id, "rejected")}
                              >
                                <XCircle className="h-4 w-4" />
                                Remove Content
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </Card>
                )}
              </div>
            </CardContent>
          </TabsContent>
        )}
      </Tabs>
      
      <CardFooter className="flex justify-between border-t p-4">
        <div className="flex items-center">
          <HelpCircle className="h-4 w-4 mr-2 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            Risk scores are calculated based on multiple factors and can be configured in the settings.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => {
            setContentSeverity(50);
            setUserHistory(30);
            setReportFrequency(20);
            setPatternMatches(40);
            setCategory(RiskCategory.HARASSMENT);
          }}>Reset</Button>
          <Button onClick={() => {
            if (onRiskScoreCalculated) {
              toast.success("Risk score applied");
              onRiskScoreCalculated(riskScore);
            }
          }}>Apply Risk Score</Button>
        </div>
      </CardFooter>
    </Card>
  );
}
