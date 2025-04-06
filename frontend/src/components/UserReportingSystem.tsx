import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Flag,
  MoreHorizontal,
  Search,
  Filter,
  ChevronDown,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  MessageSquare,
  User,
  Clock,
  RefreshCw,
  Trash2,
  ShieldAlert,
  ShieldCheck,
  CornerRightDown,
  Copy,
  Link,
  Info,
} from "lucide-react";
import { RiskSeverity } from "../utils/enums";

/**
 * Report status types
 */
enum ReportStatus {
  PENDING = "pending",
  REVIEWING = "reviewing",
  RESOLVED = "resolved",
  DISMISSED = "dismissed"
}

/**
 * Content types that can be reported
 */
enum ContentType {
  MESSAGE = "message",
  PROFILE = "profile",
  DOCUMENT = "document",
  COMMENT = "comment"
}

/**
 * Report reason categories
 */
enum ReportReason {
  SPAM = "spam",
  HARASSMENT = "harassment",
  INAPPROPRIATE = "inappropriate",
  FRAUD = "fraud",
  MISINFORMATION = "misinformation",
  OTHER = "other"
}

/**
 * Action types that can be taken on reports
 */
enum ModeratorAction {
  REMOVE_CONTENT = "remove_content",
  WARN_USER = "warn_user",
  SUSPEND_USER = "suspend_user",
  BAN_USER = "ban_user",
  NO_ACTION = "no_action"
}

/**
 * Report interface
 */
interface Report {
  id: string;
  contentId: string;
  contentType: ContentType;
  contentExcerpt: string;
  reporterUserId: string;
  reporterName?: string;
  reportedUserId: string;
  reportedName?: string;
  reason: ReportReason;
  additionalDetails?: string;
  status: ReportStatus;
  createdAt: Date;
  updatedAt: Date;
  reviewedBy?: string;
  reviewerName?: string;
  reviewNotes?: string;
  actionTaken?: ModeratorAction;
  riskScore: {
    value: number;
    severity: RiskSeverity;
    category: string;
    factors: { name: string; contribution: number }[];
    timestamp: string;
  };
  isAppealable: boolean;
  appealStatus?: string;
  matchedPatterns?: string[];
  ipAddress?: string;
  deviceInfo?: string;
  userHistory?: {
    pastReports: number;
    accountAge: number;
    warningsReceived: number;
  };
}

/**
 * Filter state for reports
 */
interface FilterState {
  status: ReportStatus | "all";
  contentType: ContentType | "all";
  reason: ReportReason | "all";
  severity: RiskSeverity | "all";
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
  searchQuery: string;
}

/**
 * Props for UserReportingSystem
 */
interface Props {
  token: { idToken: string };
}

/**
 * UserReportingSystem component
 * Comprehensive system for managing user-submitted content reports with advanced filtering,
 * risk assessment, and moderation action capabilities.
 */
export function UserReportingSystem({ token }: Props) {
  // State for report data
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // UI state
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isReportDetailsOpen, setIsReportDetailsOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [isAllSelected, setIsAllSelected] = useState(false);
  
  // Filtering state
  const [filters, setFilters] = useState<FilterState>({
    status: "all",
    contentType: "all",
    reason: "all",
    severity: "all",
    dateRange: {
      from: null,
      to: null,
    },
    searchQuery: "",
  });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalReports, setTotalReports] = useState(0);
  
  // Mock data for reports
  useEffect(() => {
    // In a real implementation, this would be an API call
    const fetchReports = async () => {
      try {
        setLoading(true);
        
        // Generate mock data
        const mockReports: Report[] = Array.from({ length: 50 }, (_, i) => {
          const createdAt = new Date();
          createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 30));
          
          const updatedAt = new Date(createdAt);
          updatedAt.setHours(updatedAt.getHours() + Math.floor(Math.random() * 48));
          
          const contentTypes = [ContentType.MESSAGE, ContentType.PROFILE, ContentType.DOCUMENT, ContentType.COMMENT];
          const contentType = contentTypes[Math.floor(Math.random() * contentTypes.length)];
          
          const reasons = [ReportReason.SPAM, ReportReason.HARASSMENT, ReportReason.INAPPROPRIATE, 
                           ReportReason.FRAUD, ReportReason.MISINFORMATION, ReportReason.OTHER];
          const reason = reasons[Math.floor(Math.random() * reasons.length)];
          
          const statuses = [ReportStatus.PENDING, ReportStatus.REVIEWING, ReportStatus.RESOLVED, ReportStatus.DISMISSED];
          const statusWeights = [0.4, 0.2, 0.3, 0.1]; // More pending reports than others
          
          let statusIndex = 0;
          const random = Math.random();
          let cumulativeWeight = 0;
          
          for (let j = 0; j < statusWeights.length; j++) {
            cumulativeWeight += statusWeights[j];
            if (random < cumulativeWeight) {
              statusIndex = j;
              break;
            }
          }
          
          const status = statuses[statusIndex];
          
          // Generate risk score
          const riskValue = Math.floor(Math.random() * 100);
          let severity;
          
          if (riskValue >= 80) {
            severity = RiskSeverity.CRITICAL;
          } else if (riskValue >= 60) {
            severity = RiskSeverity.HIGH;
          } else if (riskValue >= 40) {
            severity = RiskSeverity.MEDIUM;
          } else {
            severity = RiskSeverity.LOW;
          }
          
          // Generate sample content excerpts based on content type
          let contentExcerpt = "";
          switch (contentType) {
            case ContentType.MESSAGE:
              contentExcerpt = "This message contains potentially inappropriate content that violates our community guidelines...";
              break;
            case ContentType.PROFILE:
              contentExcerpt = "User profile contains suspicious information that may be misleading to other users...";
              break;
            case ContentType.DOCUMENT:
              contentExcerpt = "Shared document contains content that appears to violate our terms regarding financial advice...";
              break;
            case ContentType.COMMENT:
              contentExcerpt = "Comment on fund listing contains potentially harmful statements about investment returns...";
              break;
          }
          
          // Generate reviewer info if the report has been reviewed
          let reviewedBy, reviewerName, reviewNotes, actionTaken;
          if (status === ReportStatus.RESOLVED || status === ReportStatus.DISMISSED) {
            reviewedBy = `mod-${Math.floor(Math.random() * 1000)}`;
            reviewerName = `Moderator ${Math.floor(Math.random() * 100)}`;
            reviewNotes = `Reviewed content and determined it ${status === ReportStatus.RESOLVED ? 'violates' : 'does not violate'} community guidelines.`;
            
            const actions = [ModeratorAction.REMOVE_CONTENT, ModeratorAction.WARN_USER, 
                         ModeratorAction.SUSPEND_USER, ModeratorAction.BAN_USER, ModeratorAction.NO_ACTION];
            actionTaken = status === ReportStatus.RESOLVED 
              ? actions[Math.floor(Math.random() * 4)] // Any action except NO_ACTION
              : ModeratorAction.NO_ACTION;
          }
          
          return {
            id: `report-${i + 1}`,
            contentId: `content-${Math.floor(Math.random() * 10000)}`,
            contentType,
            contentExcerpt,
            reporterUserId: `user-${Math.floor(Math.random() * 1000)}`,
            reporterName: `User ${Math.floor(Math.random() * 100)}`,
            reportedUserId: `user-${Math.floor(Math.random() * 1000)}`,
            reportedName: `User ${Math.floor(Math.random() * 100)}`,
            reason,
            additionalDetails: Math.random() > 0.7 ? "Additional details provided by reporter..." : undefined,
            status,
            createdAt,
            updatedAt,
            reviewedBy,
            reviewerName,
            reviewNotes,
            actionTaken,
            riskScore: {
              value: riskValue,
              severity,
              category: reason.toUpperCase(),
              factors: [
                { name: "Content Analysis", contribution: Math.floor(Math.random() * 40) },
                { name: "User History", contribution: Math.floor(Math.random() * 30) },
                { name: "Reporter Reliability", contribution: Math.floor(Math.random() * 20) },
                { name: "Pattern Matching", contribution: Math.floor(Math.random() * 10) }
              ],
              timestamp: new Date().toISOString()
            },
            isAppealable: status === ReportStatus.RESOLVED && Math.random() > 0.5,
            appealStatus: status === ReportStatus.RESOLVED && Math.random() > 0.7 ? "pending" : undefined,
            matchedPatterns: Math.random() > 0.6 ? [
              `pattern-${Math.floor(Math.random() * 100)}`,
              `pattern-${Math.floor(Math.random() * 100)}`
            ] : undefined,
            ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
            deviceInfo: `Browser: ${Math.random() > 0.5 ? 'Chrome' : 'Safari'}, OS: ${Math.random() > 0.5 ? 'Windows' : 'MacOS'}`,
            userHistory: {
              pastReports: Math.floor(Math.random() * 10),
              accountAge: Math.floor(Math.random() * 365) + 1,
              warningsReceived: Math.floor(Math.random() * 5)
            }
          };
        });
        
        // Sort reports by creation date (newest first)
        mockReports.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        
        setReports(mockReports);
        setTotalReports(mockReports.length);
        setLoading(false);
      } catch (err) {
        setError("Failed to load reports");
        setLoading(false);
        console.error("Error loading reports:", err);
      }
    };
    
    fetchReports();
  }, []);
  
  // Apply filters to reports
  useEffect(() => {
    if (!reports.length) return;
    
    let filtered = [...reports];
    
    // Filter by status
    if (filters.status !== "all") {
      filtered = filtered.filter(report => report.status === filters.status);
    }
    
    // Filter by content type
    if (filters.contentType !== "all") {
      filtered = filtered.filter(report => report.contentType === filters.contentType);
    }
    
    // Filter by reason
    if (filters.reason !== "all") {
      filtered = filtered.filter(report => report.reason === filters.reason);
    }
    
    // Filter by severity
    if (filters.severity !== "all") {
      filtered = filtered.filter(report => report.riskScore.severity === filters.severity);
    }
    
    // Filter by date range
    if (filters.dateRange.from) {
      filtered = filtered.filter(report => report.createdAt >= filters.dateRange.from!);
    }
    
    if (filters.dateRange.to) {
      const toDate = new Date(filters.dateRange.to!);
      toDate.setDate(toDate.getDate() + 1); // Include the end date
      filtered = filtered.filter(report => report.createdAt < toDate);
    }
    
    // Filter by search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(report => 
        report.contentExcerpt.toLowerCase().includes(query) ||
        report.reportedName?.toLowerCase().includes(query) ||
        report.reporterName?.toLowerCase().includes(query) ||
        report.id.toLowerCase().includes(query)
      );
    }
    
    setFilteredReports(filtered);
    setTotalReports(filtered.length);
    setSelectedRows(new Set());
    setIsAllSelected(false);
    setCurrentPage(1);
  }, [reports, filters]);
  
  // Get current page of reports
  const getCurrentPageReports = () => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredReports.slice(startIndex, startIndex + pageSize);
  };
  
  // Handle row selection
  const toggleRowSelection = (reportId: string) => {
    const newSelectedRows = new Set(selectedRows);
    if (selectedRows.has(reportId)) {
      newSelectedRows.delete(reportId);
    } else {
      newSelectedRows.add(reportId);
    }
    setSelectedRows(newSelectedRows);
  };
  
  // Handle select all rows
  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedRows(new Set());
    } else {
      const allIds = getCurrentPageReports().map(report => report.id);
      setSelectedRows(new Set(allIds));
    }
    setIsAllSelected(!isAllSelected);
  };
  
  // Handle report details view
  const handleViewReportDetails = (report: Report) => {
    setSelectedReport(report);
    setIsReportDetailsOpen(true);
  };
  
  // Handle bulk action on selected reports
  const handleBulkAction = (action: string) => {
    if (selectedRows.size === 0) {
      toast.error("No reports selected");
      return;
    }
    
    // In a real implementation, this would be an API call
    toast.success(`${action} action applied to ${selectedRows.size} reports`);
    
    // Update reports based on action
    const updatedReports = reports.map(report => {
      if (selectedRows.has(report.id)) {
        let newStatus = report.status;
        
        switch (action) {
          case "approve":
            newStatus = ReportStatus.RESOLVED;
            break;
          case "dismiss":
            newStatus = ReportStatus.DISMISSED;
            break;
          case "review":
            newStatus = ReportStatus.REVIEWING;
            break;
        }
        
        return { 
          ...report, 
          status: newStatus,
          updatedAt: new Date(),
          reviewedBy: "current-moderator",
          reviewerName: "Current Moderator"
        };
      }
      return report;
    });
    
    setReports(updatedReports);
    setSelectedRows(new Set());
    setIsAllSelected(false);
  };
  
  // Get severity badge color
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
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };
  
  // Get status badge
  const getStatusBadge = (status: ReportStatus) => {
    switch (status) {
      case ReportStatus.PENDING:
        return <Badge variant="outline" className="bg-amber-100 text-amber-800">Pending</Badge>;
      case ReportStatus.REVIEWING:
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Reviewing</Badge>;
      case ReportStatus.RESOLVED:
        return <Badge variant="outline" className="bg-green-100 text-green-800">Resolved</Badge>;
      case ReportStatus.DISMISSED:
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">Dismissed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };
  
  // Get content type badge
  const getContentTypeBadge = (contentType: ContentType) => {
    switch (contentType) {
      case ContentType.MESSAGE:
        return <Badge variant="outline" className="bg-purple-100 text-purple-800">Message</Badge>;
      case ContentType.PROFILE:
        return <Badge variant="outline" className="bg-indigo-100 text-indigo-800">Profile</Badge>;
      case ContentType.DOCUMENT:
        return <Badge variant="outline" className="bg-sky-100 text-sky-800">Document</Badge>;
      case ContentType.COMMENT:
        return <Badge variant="outline" className="bg-teal-100 text-teal-800">Comment</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };
  
  // Reset filters
  const resetFilters = () => {
    setFilters({
      status: "all",
      contentType: "all",
      reason: "all",
      severity: "all",
      dateRange: {
        from: null,
        to: null,
      },
      searchQuery: "",
    });
  };
  
  // Format date
  const formatDate = (date: Date) => {
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Handle moderation action
  const handleModerateReport = (report: Report, action: ModeratorAction, notes: string) => {
    // In a real implementation, this would be an API call
    const updatedReports = reports.map(r => {
      if (r.id === report.id) {
        return {
          ...r,
          status: action === ModeratorAction.NO_ACTION ? ReportStatus.DISMISSED : ReportStatus.RESOLVED,
          actionTaken: action,
          reviewNotes: notes,
          reviewedBy: "current-moderator",
          reviewerName: "Current Moderator",
          updatedAt: new Date()
        };
      }
      return r;
    });
    
    setReports(updatedReports);
    setIsReportDetailsOpen(false);
    setSelectedReport(null);
    
    toast.success("Report moderated successfully");
  };
  
  // Calculate counts by status
  const countsByStatus = {
    pending: reports.filter(r => r.status === ReportStatus.PENDING).length,
    reviewing: reports.filter(r => r.status === ReportStatus.REVIEWING).length,
    resolved: reports.filter(r => r.status === ReportStatus.RESOLVED).length,
    dismissed: reports.filter(r => r.status === ReportStatus.DISMISSED).length,
  };
  
  // Calculate counts by severity
  const countsBySeverity = {
    critical: reports.filter(r => r.riskScore.severity === RiskSeverity.CRITICAL).length,
    high: reports.filter(r => r.riskScore.severity === RiskSeverity.HIGH).length,
    medium: reports.filter(r => r.riskScore.severity === RiskSeverity.MEDIUM).length,
    low: reports.filter(r => r.riskScore.severity === RiskSeverity.LOW).length,
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Content Reports</h2>
          <p className="text-muted-foreground">
            Review and manage user-submitted content reports
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => resetFilters()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset Filters
          </Button>
        </div>
      </div>
      
      {/* Status Overview Cards */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{countsByStatus.pending}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {countsBySeverity.critical + countsBySeverity.high > 0 && (
                <span className="text-red-500">Including {countsBySeverity.critical + countsBySeverity.high} high priority</span>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Reviewing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{countsByStatus.reviewing}</div>
            <div className="text-xs text-muted-foreground mt-1">
              In progress by moderators
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Resolved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{countsByStatus.resolved}</div>
            <div className="text-xs text-muted-foreground mt-1">
              Action taken on reported content
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Dismissed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{countsByStatus.dismissed}</div>
            <div className="text-xs text-muted-foreground mt-1">
              No action required on reports
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Narrow down reports with specific criteria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={filters.status}
                onValueChange={(value) => 
                  setFilters({ ...filters, status: value as ReportStatus | "all" })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value={ReportStatus.PENDING}>Pending</SelectItem>
                  <SelectItem value={ReportStatus.REVIEWING}>Reviewing</SelectItem>
                  <SelectItem value={ReportStatus.RESOLVED}>Resolved</SelectItem>
                  <SelectItem value={ReportStatus.DISMISSED}>Dismissed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Content Type</label>
              <Select
                value={filters.contentType}
                onValueChange={(value) => 
                  setFilters({ ...filters, contentType: value as ContentType | "all" })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Content Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Content Types</SelectItem>
                  <SelectItem value={ContentType.MESSAGE}>Messages</SelectItem>
                  <SelectItem value={ContentType.PROFILE}>Profiles</SelectItem>
                  <SelectItem value={ContentType.DOCUMENT}>Documents</SelectItem>
                  <SelectItem value={ContentType.COMMENT}>Comments</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Reason</label>
              <Select
                value={filters.reason}
                onValueChange={(value) => 
                  setFilters({ ...filters, reason: value as ReportReason | "all" })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Reasons" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Reasons</SelectItem>
                  <SelectItem value={ReportReason.SPAM}>Spam</SelectItem>
                  <SelectItem value={ReportReason.HARASSMENT}>Harassment</SelectItem>
                  <SelectItem value={ReportReason.INAPPROPRIATE}>Inappropriate</SelectItem>
                  <SelectItem value={ReportReason.FRAUD}>Fraud</SelectItem>
                  <SelectItem value={ReportReason.MISINFORMATION}>Misinformation</SelectItem>
                  <SelectItem value={ReportReason.OTHER}>Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Severity</label>
              <Select
                value={filters.severity}
                onValueChange={(value) => 
                  setFilters({ ...filters, severity: value as RiskSeverity | "all" })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Severities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value={RiskSeverity.CRITICAL}>Critical</SelectItem>
                  <SelectItem value={RiskSeverity.HIGH}>High</SelectItem>
                  <SelectItem value={RiskSeverity.MEDIUM}>Medium</SelectItem>
                  <SelectItem value={RiskSeverity.LOW}>Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reports by content, reporter, or report ID"
                className="pl-8"
                value={filters.searchQuery}
                onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Report Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle>Reports</CardTitle>
            <CardDescription>
              {totalReports} reports found {filters.searchQuery && `for "${filters.searchQuery}"`}
            </CardDescription>
          </div>
          
          {selectedRows.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{selectedRows.size} selected</span>
              <Button variant="outline" size="sm" onClick={() => handleBulkAction("approve")}>
                <CheckCircle className="h-4 w-4 mr-1" />
                Approve
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleBulkAction("dismiss")}>
                <XCircle className="h-4 w-4 mr-1" />
                Dismiss
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleBulkAction("review")}>
                <Eye className="h-4 w-4 mr-1" />
                Mark for Review
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="mt-2 text-sm text-muted-foreground">Loading reports...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center py-8">
              <div className="flex flex-col items-center">
                <AlertCircle className="h-8 w-8 text-destructive" />
                <p className="mt-2 text-sm text-destructive">{error}</p>
                <Button variant="outline" size="sm" className="mt-4" onClick={() => window.location.reload()}>
                  Retry
                </Button>
              </div>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="flex justify-center items-center py-8">
              <div className="flex flex-col items-center">
                <Info className="h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">No reports found</p>
                <Button variant="outline" size="sm" className="mt-4" onClick={resetFilters}>
                  Reset Filters
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">
                        <Checkbox 
                          checked={isAllSelected} 
                          onCheckedChange={toggleSelectAll}
                          aria-label="Select all reports"
                        />
                      </TableHead>
                      <TableHead className="w-[60px]">Risk</TableHead>
                      <TableHead className="w-[100px]">Status</TableHead>
                      <TableHead className="w-[110px]">Type</TableHead>
                      <TableHead>Content</TableHead>
                      <TableHead className="w-[110px]">Reported By</TableHead>
                      <TableHead className="w-[120px]" colSpan={2}>Date Reported</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getCurrentPageReports().map((report) => (
                      <TableRow key={report.id} onClick={() => handleViewReportDetails(report)} className="cursor-pointer">
                        <TableCell className="p-2" onClick={(e) => { e.stopPropagation(); toggleRowSelection(report.id); }}>
                          <Checkbox 
                            checked={selectedRows.has(report.id)} 
                            onCheckedChange={() => toggleRowSelection(report.id)}
                            aria-label={`Select report ${report.id}`}
                          />
                        </TableCell>
                        <TableCell className="p-2">
                          {getSeverityBadge(report.riskScore.severity)}
                        </TableCell>
                        <TableCell className="p-2">
                          {getStatusBadge(report.status)}
                        </TableCell>
                        <TableCell className="p-2">
                          {getContentTypeBadge(report.contentType)}
                        </TableCell>
                        <TableCell className="p-2">
                          <div className="font-medium truncate max-w-[250px]" title={report.contentExcerpt}>
                            {report.contentExcerpt}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Reported user: {report.reportedName}
                          </div>
                        </TableCell>
                        <TableCell className="p-2">
                          <div className="font-medium">{report.reporterName}</div>
                          <div className="text-xs text-muted-foreground">
                            {report.reason}
                          </div>
                        </TableCell>
                        <TableCell className="p-2">
                          <div className="font-medium">{formatDate(report.createdAt)}</div>
                          <div className="text-xs text-muted-foreground">
                            {report.reviewedBy ? `Reviewed by ${report.reviewerName}` : 'Not reviewed yet'}
                          </div>
                        </TableCell>
                        <TableCell className="p-2 text-right">
                          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); }}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalReports)} of {totalReports} reports
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <div className="text-sm">
                    Page {currentPage} of {Math.ceil(totalReports / pageSize)}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(totalReports / pageSize)))}
                    disabled={currentPage === Math.ceil(totalReports / pageSize)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Report Details Dialog */}
      {selectedReport && (
        <Dialog open={isReportDetailsOpen} onOpenChange={setIsReportDetailsOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Flag className="h-5 w-5" />
                Report Details
                <Badge className="ml-2">{selectedReport.id}</Badge>
              </DialogTitle>
              <DialogDescription>
                Detailed information about this content report
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              {/* Report Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Status:</span>
                  {getStatusBadge(selectedReport.status)}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Risk Level:</span>
                  {getSeverityBadge(selectedReport.riskScore.severity)}
                </div>
              </div>
              
              <Separator />
              
              {/* Content Information */}
              <div className="space-y-3">
                <h3 className="text-lg font-medium">Reported Content</h3>
                
                <div className="flex items-start gap-4">
                  <div className="w-1/3">
                    <p className="text-sm font-medium">Content Type</p>
                    <p>{getContentTypeBadge(selectedReport.contentType)}</p>
                  </div>
                  <div className="w-1/3">
                    <p className="text-sm font-medium">Content ID</p>
                    <p className="text-sm flex items-center gap-1">
                      {selectedReport.contentId}
                      <Button variant="ghost" size="icon" className="h-4 w-4" onClick={() => {
                        navigator.clipboard.writeText(selectedReport.contentId);
                        toast.success("ID copied to clipboard");
                      }}>
                        <Copy className="h-3 w-3" />
                      </Button>
                    </p>
                  </div>
                  <div className="w-1/3">
                    <p className="text-sm font-medium">Report Reason</p>
                    <p className="capitalize">{selectedReport.reason}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium">Content Preview</p>
                  <div className="mt-1 p-3 bg-muted rounded-md">
                    <p className="text-sm">{selectedReport.contentExcerpt}</p>
                  </div>
                </div>
                
                {selectedReport.additionalDetails && (
                  <div>
                    <p className="text-sm font-medium">Additional Details</p>
                    <div className="mt-1 p-3 bg-muted rounded-md">
                      <p className="text-sm">{selectedReport.additionalDetails}</p>
                    </div>
                  </div>
                )}
              </div>
              
              <Separator />
              
              {/* User Information */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="text-lg font-medium">Reported User</h3>
                  
                  <div className="flex items-center gap-2">
                    <User className="h-10 w-10 p-2 bg-muted rounded-full" />
                    <div>
                      <p className="font-medium">{selectedReport.reportedName}</p>
                      <p className="text-sm text-muted-foreground">{selectedReport.reportedUserId}</p>
                    </div>
                  </div>
                  
                  {selectedReport.userHistory && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">User History</p>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div className="p-2 bg-muted rounded-md">
                          <p className="text-xs text-muted-foreground">Account Age</p>
                          <p>{selectedReport.userHistory.accountAge} days</p>
                        </div>
                        <div className="p-2 bg-muted rounded-md">
                          <p className="text-xs text-muted-foreground">Past Reports</p>
                          <p>{selectedReport.userHistory.pastReports}</p>
                        </div>
                        <div className="p-2 bg-muted rounded-md">
                          <p className="text-xs text-muted-foreground">Warnings</p>
                          <p>{selectedReport.userHistory.warningsReceived}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-lg font-medium">Reporter</h3>
                  
                  <div className="flex items-center gap-2">
                    <User className="h-10 w-10 p-2 bg-muted rounded-full" />
                    <div>
                      <p className="font-medium">{selectedReport.reporterName}</p>
                      <p className="text-sm text-muted-foreground">{selectedReport.reporterUserId}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Report Details</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="p-2 bg-muted rounded-md">
                        <p className="text-xs text-muted-foreground">Report Date</p>
                        <p>{formatDate(selectedReport.createdAt)}</p>
                      </div>
                      <div className="p-2 bg-muted rounded-md">
                        <p className="text-xs text-muted-foreground">User Agent</p>
                        <p className="truncate">{selectedReport.deviceInfo || "Unknown"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              {/* Risk Analysis */}
              <div className="space-y-3">
                <h3 className="text-lg font-medium">Risk Analysis</h3>
                
                <div className="w-full bg-muted rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${
                      selectedReport.riskScore.severity === RiskSeverity.CRITICAL
                        ? "bg-red-600"
                        : selectedReport.riskScore.severity === RiskSeverity.HIGH
                        ? "bg-orange-500"
                        : selectedReport.riskScore.severity === RiskSeverity.MEDIUM
                        ? "bg-amber-400"
                        : "bg-green-500"
                    }`}
                    style={{ width: `${selectedReport.riskScore.value}%` }}
                  ></div>
                </div>
                
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Low Risk</span>
                  <span>Risk Score: {selectedReport.riskScore.value}%</span>
                  <span>High Risk</span>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium">Contributing Factors</p>
                  <div className="space-y-2">
                    {selectedReport.riskScore.factors.map((factor, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-1/3 text-sm">{factor.name}</div>
                        <div className="w-2/3">
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full"
                              style={{ width: `${factor.contribution}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="w-12 text-sm text-right">{factor.contribution}%</div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {selectedReport.matchedPatterns && selectedReport.matchedPatterns.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Matched Patterns</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedReport.matchedPatterns.map((pattern, index) => (
                        <Badge key={index} variant="outline">{pattern}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Moderation History */}
              {selectedReport.reviewedBy && (
                <>
                  <Separator />
                  
                  <div className="space-y-3">
                    <h3 className="text-lg font-medium">Moderation History</h3>
                    
                    <div className="bg-muted rounded-md p-3">
                      <div className="flex items-start gap-2">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <ShieldCheck className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-sm">{selectedReport.reviewerName}</p>
                            <p className="text-xs text-muted-foreground">{formatDate(selectedReport.updatedAt)}</p>
                          </div>
                          <p className="text-sm mt-1">{selectedReport.reviewNotes}</p>
                          {selectedReport.actionTaken && (
                            <Badge 
                              variant="outline" 
                              className="mt-2 bg-primary/10"
                            >
                              Action: {selectedReport.actionTaken.replace(/_/g, " ")}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
              
              {/* Appeal Information */}
              {selectedReport.isAppealable && (
                <>
                  <Separator />
                  
                  <div className="space-y-3">
                    <h3 className="text-lg font-medium">
                      Appeal Information
                      {selectedReport.appealStatus && (
                        <Badge className="ml-2 bg-amber-100 text-amber-800">Appeal {selectedReport.appealStatus}</Badge>
                      )}
                    </h3>
                    
                    <div className="bg-muted rounded-md p-3">
                      <div className="flex items-start gap-2">
                        <div className="bg-amber-100 p-2 rounded-full">
                          <CornerRightDown className="h-4 w-4 text-amber-800" />
                        </div>
                        <div>
                          <p className="text-sm">
                            {selectedReport.appealStatus 
                              ? "User has appealed this moderation decision. The appeal is currently being reviewed."
                              : "This moderation decision can be appealed by the user."}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
            
            <DialogFooter>
              {selectedReport.status === ReportStatus.PENDING || selectedReport.status === ReportStatus.REVIEWING ? (
                <div className="flex gap-2 w-full">
                  <Button variant="destructive" className="flex-1" onClick={() => handleModerateReport(selectedReport, ModeratorAction.REMOVE_CONTENT, "Content violates guidelines and has been removed.")}>Remove Content</Button>
                  <Button variant="outline" className="flex-1" onClick={() => handleModerateReport(selectedReport, ModeratorAction.WARN_USER, "User has been warned about this content.")}>Warn User</Button>
                  <Button variant="secondary" className="flex-1" onClick={() => handleModerateReport(selectedReport, ModeratorAction.NO_ACTION, "Content reviewed and does not violate guidelines.")}>No Action</Button>
                </div>
              ) : (
                <Button variant="outline" onClick={() => setIsReportDetailsOpen(false)}>Close</Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
