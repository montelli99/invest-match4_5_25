import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Activity,
  AlertCircle,
  ArrowUpDown,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  CornerRightDown,
  Eye,
  FileText,
  Filter,
  Flag,
  History,
  MessageSquare,
  MoreHorizontal,
  RefreshCw,
  Scale,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ThumbsDown,
  ThumbsUp,
  User,
  XCircle,
} from "lucide-react";
import { RiskSeverity } from "../utils/enums";

/**
 * Appeal status enum
 */
enum AppealStatus {
  PENDING = "pending",
  UNDER_REVIEW = "under_review",
  APPROVED = "approved",
  REJECTED = "rejected",
}

/**
 * Appeal reason enum
 */
enum AppealReason {
  MISTAKE = "mistake",
  MISUNDERSTANDING = "misunderstanding",
  NEW_INFORMATION = "new_information",
  OTHER = "other",
}

/**
 * Appeal type
 */
enum ContentModerationType {
  CONTENT_REMOVAL = "content_removal",
  WARNING = "warning",
  SUSPENSION = "suspension",
  BAN = "ban",
}

/**
 * Appeal review decision
 */
enum AppealDecision {
  UPHOLD = "uphold",
  OVERTURN = "overturn",
  PARTIAL = "partial",
}

/**
 * Appeal interface
 */
interface Appeal {
  id: string;
  userId: string;
  userName: string;
  moderationId: string;
  moderationType: ContentModerationType;
  contentExcerpt: string;
  contentType: string;
  reason: AppealReason;
  explanation: string;
  status: AppealStatus;
  submittedAt: Date;
  updatedAt: Date;
  reviewedBy?: string;
  reviewerName?: string;
  reviewNotes?: string;
  decision?: AppealDecision;
  originalModerator?: string;
  originalModeratorName?: string;
  originalModerationType?: string;
  originalModerationDate?: Date;
  supportingEvidence?: string[];
  priority: number;
  responseTimeTarget: number; // hours
  timeElapsed: number; // hours
  userHistory?: {
    accountAge: number;
    pastAppeals: number;
    pastViolations: number;
    averageRiskScore: number;
    trustScore: number;
  };
}

/**
 * Filter state for appeals
 */
interface FilterState {
  status: AppealStatus | "all";
  moderationType: ContentModerationType | "all";
  timeRange: "all" | "past_day" | "past_week" | "past_month" | "custom";
  customDateRange?: {
    from: Date | null;
    to: Date | null;
  };
  priority: "all" | "high" | "medium" | "low";
  searchQuery: string;
}

/**
 * Stats interface
 */
interface AppealStats {
  total: number;
  pending: number;
  underReview: number;
  approved: number;
  rejected: number;
  avgResponseTime: number;
  appealRate: number;
  approvalRate: number;
}

/**
 * AppealMetrics
 */
interface AppealMetrics {
  byReason: Record<string, number>;
  byModerationType: Record<string, number>;
  byOutcome: Record<string, number>;
  avgTimeByPriority: Record<string, number>;
  overturnRateByModerator: Record<string, number>;
}

/**
 * AppealManagement props interface
 */
interface Props {
  token: { idToken: string };
}

/**
 * AppealManagement component
 * Comprehensive system for managing appeals of moderation decisions with metrics tracking,
 * detailed review workflows, and appeal processing.
 */
export function AppealManagement({ token }: Props) {
  // State for appeal data
  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [filteredAppeals, setFilteredAppeals] = useState<Appeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // UI state
  const [selectedAppeal, setSelectedAppeal] = useState<Appeal | null>(null);
  const [isAppealDetailsOpen, setIsAppealDetailsOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewNotes, setReviewNotes] = useState("");
  const [reviewDecision, setReviewDecision] = useState<AppealDecision | "">("");
  
  // Statistics state
  const [stats, setStats] = useState<AppealStats>({} as AppealStats);
  const [metrics, setMetrics] = useState<AppealMetrics>({} as AppealMetrics);
  
  // Filtering state
  const [filters, setFilters] = useState<FilterState>({
    status: "all",
    moderationType: "all",
    timeRange: "all",
    priority: "all",
    searchQuery: "",
  });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalAppeals, setTotalAppeals] = useState(0);
  
  // Active tab state
  const [activeTab, setActiveTab] = useState("appeals");
  
  // Mock data for appeals
  useEffect(() => {
    // In a real implementation, this would be an API call
    const fetchAppeals = async () => {
      try {
        setLoading(true);
        
        // Generate mock data
        const mockAppeals: Appeal[] = Array.from({ length: 35 }, (_, i) => {
          const submittedAt = new Date();
          submittedAt.setDate(submittedAt.getDate() - Math.floor(Math.random() * 30));
          
          const updatedAt = new Date(submittedAt);
          updatedAt.setHours(updatedAt.getHours() + Math.floor(Math.random() * 48));
          
          const moderationTypes = [ContentModerationType.CONTENT_REMOVAL, ContentModerationType.WARNING, 
                                ContentModerationType.SUSPENSION, ContentModerationType.BAN];
          const moderationType = moderationTypes[Math.floor(Math.random() * moderationTypes.length)];
          
          const reasons = [AppealReason.MISTAKE, AppealReason.MISUNDERSTANDING, 
                        AppealReason.NEW_INFORMATION, AppealReason.OTHER];
          const reason = reasons[Math.floor(Math.random() * reasons.length)];
          
          const statuses = [AppealStatus.PENDING, AppealStatus.UNDER_REVIEW, 
                          AppealStatus.APPROVED, AppealStatus.REJECTED];
          const statusWeights = [0.4, 0.2, 0.25, 0.15]; // More pending appeals than others
          
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
          
          // Generate sample content excerpts based on appeal type
          let contentExcerpt = "";
          let contentType = "";
          
          switch (moderationType) {
            case ContentModerationType.CONTENT_REMOVAL:
              contentExcerpt = "This content was flagged and removed for potential investment advice that violates regulatory guidelines...";
              contentType = Math.random() > 0.5 ? "Message" : "Comment";
              break;
            case ContentModerationType.WARNING:
              contentExcerpt = "Your profile contained misleading credentials that were flagged by our verification team...";
              contentType = "Profile";
              break;
            case ContentModerationType.SUSPENSION:
              contentExcerpt = "Multiple violations of our community guidelines resulted in a temporary suspension...";
              contentType = "Account";
              break;
            case ContentModerationType.BAN:
              contentExcerpt = "Severe violation of terms of service including attempts to manipulate investment opportunities...";
              contentType = "Account";
              break;
          }
          
          // Generate reviewer info if the appeal has been reviewed
          let reviewedBy, reviewerName, reviewNotes, decision;
          if (status === AppealStatus.APPROVED || status === AppealStatus.REJECTED) {
            reviewedBy = `mod-${Math.floor(Math.random() * 1000)}`;
            reviewerName = `Moderator ${Math.floor(Math.random() * 100)}`;
            
            if (status === AppealStatus.APPROVED) {
              reviewNotes = "After careful review, we found the content does not violate our guidelines. The moderation decision has been reversed.";
              decision = Math.random() > 0.3 ? AppealDecision.OVERTURN : AppealDecision.PARTIAL;
            } else {
              reviewNotes = "After reviewing your appeal, we have determined that the original moderation decision was correct.";
              decision = AppealDecision.UPHOLD;
            }
          }
          
          // Generate original moderator info
          const originalModerator = `mod-${Math.floor(Math.random() * 1000)}`;
          const originalModeratorName = `Moderator ${Math.floor(Math.random() * 100)}`;
          const originalModerationType = moderationType;
          
          const originalModerationDate = new Date(submittedAt);
          originalModerationDate.setDate(originalModerationDate.getDate() - Math.floor(Math.random() * 7));
          
          // Generate priority level (1-5, where 5 is highest)
          const priority = Math.floor(Math.random() * 5) + 1;
          
          // Generate response time target based on priority (in hours)
          const responseTimeTarget = priority === 5 ? 4 : priority === 4 ? 8 : priority === 3 ? 24 : priority === 2 ? 48 : 72;
          
          // Calculate time elapsed
          const now = new Date();
          const timeElapsed = Math.floor((now.getTime() - submittedAt.getTime()) / (1000 * 60 * 60));
          
          return {
            id: `appeal-${i + 1}`,
            userId: `user-${Math.floor(Math.random() * 1000)}`,
            userName: `User ${Math.floor(Math.random() * 100)}`,
            moderationId: `mod-action-${Math.floor(Math.random() * 10000)}`,
            moderationType,
            contentExcerpt,
            contentType,
            reason,
            explanation: `I believe this was ${reason === AppealReason.MISTAKE ? 'a mistake' : 
                      reason === AppealReason.MISUNDERSTANDING ? 'a misunderstanding' : 
                      reason === AppealReason.NEW_INFORMATION ? 'resolved with new information' : 
                      'unfair'} because...`,
            status,
            submittedAt,
            updatedAt,
            reviewedBy,
            reviewerName,
            reviewNotes,
            decision,
            originalModerator,
            originalModeratorName,
            originalModerationType,
            originalModerationDate,
            supportingEvidence: Math.random() > 0.6 ? [
              `evidence-${Math.floor(Math.random() * 100)}`,
              `evidence-${Math.floor(Math.random() * 100)}`
            ] : undefined,
            priority,
            responseTimeTarget,
            timeElapsed,
            userHistory: {
              accountAge: Math.floor(Math.random() * 365) + 1,
              pastAppeals: Math.floor(Math.random() * 5),
              pastViolations: Math.floor(Math.random() * 3),
              averageRiskScore: Math.floor(Math.random() * 100),
              trustScore: Math.floor(Math.random() * 100)
            }
          };
        });
        
        // Sort appeals by priority (highest first) and then by submission date (newest first)
        mockAppeals.sort((a, b) => {
          if (b.priority !== a.priority) {
            return b.priority - a.priority;
          }
          return b.submittedAt.getTime() - a.submittedAt.getTime();
        });
        
        setAppeals(mockAppeals);
        setTotalAppeals(mockAppeals.length);
        
        // Calculate statistics
        const calculatedStats: AppealStats = {
          total: mockAppeals.length,
          pending: mockAppeals.filter(a => a.status === AppealStatus.PENDING).length,
          underReview: mockAppeals.filter(a => a.status === AppealStatus.UNDER_REVIEW).length,
          approved: mockAppeals.filter(a => a.status === AppealStatus.APPROVED).length,
          rejected: mockAppeals.filter(a => a.status === AppealStatus.REJECTED).length,
          avgResponseTime: calculateAverageResponseTime(mockAppeals),
          appealRate: Math.floor(Math.random() * 25) + 5, // % of moderation decisions appealed
          approvalRate: (mockAppeals.filter(a => a.status === AppealStatus.APPROVED).length / 
                      (mockAppeals.filter(a => a.status === AppealStatus.APPROVED).length + 
                       mockAppeals.filter(a => a.status === AppealStatus.REJECTED).length)) * 100 || 0
        };
        
        setStats(calculatedStats);
        
        // Calculate metrics
        const calculatedMetrics: AppealMetrics = {
          byReason: calculateCountByField(mockAppeals, 'reason'),
          byModerationType: calculateCountByField(mockAppeals, 'moderationType'),
          byOutcome: calculateCountByField(mockAppeals.filter(a => a.decision), 'decision'),
          avgTimeByPriority: calculateAverageTimeByPriority(mockAppeals),
          overturnRateByModerator: calculateOverturnRateByModerator(mockAppeals)
        };
        
        setMetrics(calculatedMetrics);
        
        setLoading(false);
      } catch (err) {
        setError("Failed to load appeals");
        setLoading(false);
        console.error("Error loading appeals:", err);
      }
    };
    
    fetchAppeals();
  }, []);
  
  // Calculate average response time for processed appeals
  const calculateAverageResponseTime = (appealsList: Appeal[]): number => {
    const processedAppeals = appealsList.filter(a => 
      a.status === AppealStatus.APPROVED || a.status === AppealStatus.REJECTED
    );
    
    if (processedAppeals.length === 0) return 0;
    
    const totalTime = processedAppeals.reduce((total, appeal) => {
      const submittedTime = appeal.submittedAt.getTime();
      const updatedTime = appeal.updatedAt.getTime();
      return total + (updatedTime - submittedTime) / (1000 * 60 * 60); // hours
    }, 0);
    
    return Math.round(totalTime / processedAppeals.length);
  };
  
  // Calculate count by field
  const calculateCountByField = (appealsList: Appeal[], field: keyof Appeal): Record<string, number> => {
    const result: Record<string, number> = {};
    
    appealsList.forEach(appeal => {
      const value = appeal[field] as string;
      if (value) {
        if (!result[value]) {
          result[value] = 0;
        }
        result[value]++;
      }
    });
    
    return result;
  };
  
  // Calculate average time by priority
  const calculateAverageTimeByPriority = (appealsList: Appeal[]): Record<string, number> => {
    const result: Record<string, number> = {};
    const countByPriority: Record<string, number> = {};
    const totalTimeByPriority: Record<string, number> = {};
    
    appealsList.forEach(appeal => {
      if (appeal.status === AppealStatus.APPROVED || appeal.status === AppealStatus.REJECTED) {
        const priority = appeal.priority.toString();
        const submittedTime = appeal.submittedAt.getTime();
        const updatedTime = appeal.updatedAt.getTime();
        const time = (updatedTime - submittedTime) / (1000 * 60 * 60); // hours
        
        if (!totalTimeByPriority[priority]) {
          totalTimeByPriority[priority] = 0;
          countByPriority[priority] = 0;
        }
        
        totalTimeByPriority[priority] += time;
        countByPriority[priority]++;
      }
    });
    
    Object.keys(totalTimeByPriority).forEach(priority => {
      result[priority] = Math.round(totalTimeByPriority[priority] / countByPriority[priority]);
    });
    
    return result;
  };
  
  // Calculate overturn rate by moderator
  const calculateOverturnRateByModerator = (appealsList: Appeal[]): Record<string, number> => {
    const result: Record<string, number> = {};
    const totalByModerator: Record<string, number> = {};
    const overturnedByModerator: Record<string, number> = {};
    
    appealsList.forEach(appeal => {
      if (appeal.originalModerator && (appeal.status === AppealStatus.APPROVED || appeal.status === AppealStatus.REJECTED)) {
        const moderator = appeal.originalModeratorName || appeal.originalModerator;
        
        if (!totalByModerator[moderator]) {
          totalByModerator[moderator] = 0;
          overturnedByModerator[moderator] = 0;
        }
        
        totalByModerator[moderator]++;
        
        if (appeal.decision === AppealDecision.OVERTURN || appeal.decision === AppealDecision.PARTIAL) {
          overturnedByModerator[moderator]++;
        }
      }
    });
    
    Object.keys(totalByModerator).forEach(moderator => {
      if (totalByModerator[moderator] >= 5) { // Only include moderators with at least 5 appealed decisions
        result[moderator] = Math.round((overturnedByModerator[moderator] / totalByModerator[moderator]) * 100);
      }
    });
    
    return result;
  };
  
  // Apply filters to appeals
  useEffect(() => {
    if (!appeals.length) return;
    
    let filtered = [...appeals];
    
    // Filter by status
    if (filters.status !== "all") {
      filtered = filtered.filter(appeal => appeal.status === filters.status);
    }
    
    // Filter by moderation type
    if (filters.moderationType !== "all") {
      filtered = filtered.filter(appeal => appeal.moderationType === filters.moderationType);
    }
    
    // Filter by time range
    const now = new Date();
    if (filters.timeRange === "past_day") {
      const oneDayAgo = new Date(now);
      oneDayAgo.setDate(now.getDate() - 1);
      filtered = filtered.filter(appeal => appeal.submittedAt >= oneDayAgo);
    } else if (filters.timeRange === "past_week") {
      const oneWeekAgo = new Date(now);
      oneWeekAgo.setDate(now.getDate() - 7);
      filtered = filtered.filter(appeal => appeal.submittedAt >= oneWeekAgo);
    } else if (filters.timeRange === "past_month") {
      const oneMonthAgo = new Date(now);
      oneMonthAgo.setMonth(now.getMonth() - 1);
      filtered = filtered.filter(appeal => appeal.submittedAt >= oneMonthAgo);
    } else if (filters.timeRange === "custom" && filters.customDateRange) {
      if (filters.customDateRange.from) {
        filtered = filtered.filter(appeal => appeal.submittedAt >= filters.customDateRange!.from!);
      }
      
      if (filters.customDateRange.to) {
        const toDate = new Date(filters.customDateRange.to);
        toDate.setDate(toDate.getDate() + 1); // Include the end date
        filtered = filtered.filter(appeal => appeal.submittedAt < toDate);
      }
    }
    
    // Filter by priority
    if (filters.priority !== "all") {
      if (filters.priority === "high") {
        filtered = filtered.filter(appeal => appeal.priority >= 4);
      } else if (filters.priority === "medium") {
        filtered = filtered.filter(appeal => appeal.priority === 3);
      } else if (filters.priority === "low") {
        filtered = filtered.filter(appeal => appeal.priority <= 2);
      }
    }
    
    // Filter by search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(appeal => 
        appeal.contentExcerpt.toLowerCase().includes(query) ||
        appeal.userName.toLowerCase().includes(query) ||
        appeal.moderationType.toLowerCase().includes(query) ||
        appeal.id.toLowerCase().includes(query)
      );
    }
    
    setFilteredAppeals(filtered);
    setTotalAppeals(filtered.length);
    setCurrentPage(1);
  }, [appeals, filters]);
  
  // Get current page of appeals
  const getCurrentPageAppeals = () => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredAppeals.slice(startIndex, startIndex + pageSize);
  };
  
  // Handle appeal details view
  const handleViewAppealDetails = (appeal: Appeal) => {
    setSelectedAppeal(appeal);
    setIsAppealDetailsOpen(true);
  };
  
  // Handle appeal review
  const handleReviewAppeal = (appeal: Appeal) => {
    setSelectedAppeal(appeal);
    setReviewNotes("");
    setReviewDecision("");
    setIsReviewModalOpen(true);
  };
  
  // Submit appeal review
  const submitAppealReview = () => {
    if (!selectedAppeal) return;
    
    if (!reviewDecision) {
      toast.error("Please select a decision");
      return;
    }
    
    if (!reviewNotes || reviewNotes.length < 10) {
      toast.error("Please provide detailed review notes");
      return;
    }
    
    // In a real implementation, this would be an API call
    const updatedAppeals = appeals.map(appeal => {
      if (appeal.id === selectedAppeal.id) {
        return {
          ...appeal,
          status: reviewDecision === AppealDecision.UPHOLD ? AppealStatus.REJECTED : AppealStatus.APPROVED,
          reviewedBy: "current-moderator",
          reviewerName: "Current Moderator",
          reviewNotes,
          decision: reviewDecision as AppealDecision,
          updatedAt: new Date()
        };
      }
      return appeal;
    });
    
    setAppeals(updatedAppeals);
    setIsReviewModalOpen(false);
    setIsAppealDetailsOpen(false);
    setSelectedAppeal(null);
    
    toast.success("Appeal reviewed successfully");
    
    // Recalculate stats and metrics
    const recalculatedStats: AppealStats = {
      ...stats,
      pending: updatedAppeals.filter(a => a.status === AppealStatus.PENDING).length,
      underReview: updatedAppeals.filter(a => a.status === AppealStatus.UNDER_REVIEW).length,
      approved: updatedAppeals.filter(a => a.status === AppealStatus.APPROVED).length,
      rejected: updatedAppeals.filter(a => a.status === AppealStatus.REJECTED).length,
      avgResponseTime: calculateAverageResponseTime(updatedAppeals),
      approvalRate: (updatedAppeals.filter(a => a.status === AppealStatus.APPROVED).length / 
                  (updatedAppeals.filter(a => a.status === AppealStatus.APPROVED).length + 
                   updatedAppeals.filter(a => a.status === AppealStatus.REJECTED).length)) * 100 || 0
    };
    
    setStats(recalculatedStats);
    
    // Update metrics
    const recalculatedMetrics: AppealMetrics = {
      ...metrics,
      byOutcome: calculateCountByField(updatedAppeals.filter(a => a.decision), 'decision'),
      avgTimeByPriority: calculateAverageTimeByPriority(updatedAppeals),
      overturnRateByModerator: calculateOverturnRateByModerator(updatedAppeals)
    };
    
    setMetrics(recalculatedMetrics);
  };
  
  // Start Review Process
  const startReviewProcess = (appeal: Appeal) => {
    // In a real implementation, this would be an API call
    const updatedAppeals = appeals.map(a => {
      if (a.id === appeal.id) {
        return {
          ...a,
          status: AppealStatus.UNDER_REVIEW,
          updatedAt: new Date()
        };
      }
      return a;
    });
    
    setAppeals(updatedAppeals);
    setIsAppealDetailsOpen(false);
    setSelectedAppeal(null);
    
    toast.success("Appeal marked for review");
    
    // Update stats
    setStats({
      ...stats,
      pending: stats.pending - 1,
      underReview: stats.underReview + 1
    });
  };
  
  // Get status badge
  const getStatusBadge = (status: AppealStatus) => {
    switch (status) {
      case AppealStatus.PENDING:
        return <Badge variant="outline" className="bg-amber-100 text-amber-800">Pending</Badge>;
      case AppealStatus.UNDER_REVIEW:
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Under Review</Badge>;
      case AppealStatus.APPROVED:
        return <Badge variant="outline" className="bg-green-100 text-green-800">Approved</Badge>;
      case AppealStatus.REJECTED:
        return <Badge variant="outline" className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };
  
  // Get moderation type badge
  const getModerationTypeBadge = (type: ContentModerationType) => {
    switch (type) {
      case ContentModerationType.CONTENT_REMOVAL:
        return <Badge variant="outline" className="bg-purple-100 text-purple-800">Content Removal</Badge>;
      case ContentModerationType.WARNING:
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Warning</Badge>;
      case ContentModerationType.SUSPENSION:
        return <Badge variant="outline" className="bg-orange-100 text-orange-800">Suspension</Badge>;
      case ContentModerationType.BAN:
        return <Badge variant="outline" className="bg-red-100 text-red-800">Ban</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };
  
  // Get priority badge
  const getPriorityBadge = (priority: number) => {
    switch (priority) {
      case 5:
        return <Badge variant="destructive">Critical</Badge>;
      case 4:
        return <Badge variant="destructive" className="bg-orange-500">High</Badge>;
      case 3:
        return <Badge variant="warning">Medium</Badge>;
      case 2:
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Low</Badge>;
      case 1:
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">Very Low</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };
  
  // Get decision badge
  const getDecisionBadge = (decision?: AppealDecision) => {
    if (!decision) return null;
    
    switch (decision) {
      case AppealDecision.UPHOLD:
        return <Badge variant="outline" className="bg-red-100 text-red-800">Upheld</Badge>;
      case AppealDecision.OVERTURN:
        return <Badge variant="outline" className="bg-green-100 text-green-800">Overturned</Badge>;
      case AppealDecision.PARTIAL:
        return <Badge variant="outline" className="bg-amber-100 text-amber-800">Partially Overturned</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };
  
  // Reset filters
  const resetFilters = () => {
    setFilters({
      status: "all",
      moderationType: "all",
      timeRange: "all",
      priority: "all",
      searchQuery: "",
    });
  };
  
  // Format date
  const formatDate = (date: Date) => {
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Calculate time status
  const getTimeStatus = (appeal: Appeal) => {
    // If already reviewed, show actual response time
    if (appeal.status === AppealStatus.APPROVED || appeal.status === AppealStatus.REJECTED) {
      const responseTime = Math.floor((appeal.updatedAt.getTime() - appeal.submittedAt.getTime()) / (1000 * 60 * 60));
      const isWithinTarget = responseTime <= appeal.responseTimeTarget;
      
      return {
        label: `${responseTime}h (${isWithinTarget ? 'within' : 'exceeds'} ${appeal.responseTimeTarget}h target)`,
        variant: isWithinTarget ? 'text-green-600' : 'text-amber-600'
      };
    }
    
    // For pending or under review, show elapsed time vs target
    const remainingTime = appeal.responseTimeTarget - appeal.timeElapsed;
    
    if (remainingTime < 0) {
      // Past deadline
      return {
        label: `${Math.abs(remainingTime)}h overdue`,
        variant: 'text-red-600 font-medium'
      };
    } else if (remainingTime < appeal.responseTimeTarget * 0.25) {
      // Approaching deadline
      return {
        label: `${remainingTime}h remaining`,
        variant: 'text-amber-600'
      };
    } else {
      // Plenty of time
      return {
        label: `${remainingTime}h remaining`,
        variant: 'text-green-600'
      };
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Appeals Management</h2>
          <p className="text-muted-foreground">
            Review and manage appeals of moderation decisions
          </p>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="appeals">Appeals Queue</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
          <TabsTrigger value="performance">Moderator Performance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="appeals" className="space-y-4">
          {/* Status Overview Cards */}
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pending || 0}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Appeals awaiting initial review
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Under Review</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.underReview || 0}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Appeals being actively reviewed
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Approval Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Math.round(stats.approvalRate || 0)}%</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Of processed appeals
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Response Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.avgResponseTime || 0} hours</div>
                <div className="text-xs text-muted-foreground mt-1">
                  From submission to decision
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
              <CardDescription>Narrow down appeals with specific criteria</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select
                    value={filters.status}
                    onValueChange={(value) => 
                      setFilters({ ...filters, status: value as AppealStatus | "all" })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value={AppealStatus.PENDING}>Pending</SelectItem>
                      <SelectItem value={AppealStatus.UNDER_REVIEW}>Under Review</SelectItem>
                      <SelectItem value={AppealStatus.APPROVED}>Approved</SelectItem>
                      <SelectItem value={AppealStatus.REJECTED}>Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Moderation Type</label>
                  <Select
                    value={filters.moderationType}
                    onValueChange={(value) => 
                      setFilters({ ...filters, moderationType: value as ContentModerationType | "all" })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value={ContentModerationType.CONTENT_REMOVAL}>Content Removal</SelectItem>
                      <SelectItem value={ContentModerationType.WARNING}>Warning</SelectItem>
                      <SelectItem value={ContentModerationType.SUSPENSION}>Suspension</SelectItem>
                      <SelectItem value={ContentModerationType.BAN}>Ban</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Time Range</label>
                  <Select
                    value={filters.timeRange}
                    onValueChange={(value) => 
                      setFilters({ ...filters, timeRange: value as FilterState["timeRange"] })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="past_day">Past 24 Hours</SelectItem>
                      <SelectItem value="past_week">Past Week</SelectItem>
                      <SelectItem value="past_month">Past Month</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Priority</label>
                  <Select
                    value={filters.priority}
                    onValueChange={(value) => 
                      setFilters({ ...filters, priority: value as FilterState["priority"] })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Priorities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="high">High (4-5)</SelectItem>
                      <SelectItem value="medium">Medium (3)</SelectItem>
                      <SelectItem value="low">Low (1-2)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="mt-4 flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search appeals by content, username, or appeal ID"
                    className="pl-8"
                    value={filters.searchQuery}
                    onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                  />
                </div>
                <Button variant="outline" onClick={resetFilters}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Appeals Table */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle>Appeals</CardTitle>
                <CardDescription>
                  {totalAppeals} appeals found {filters.searchQuery && `for "${filters.searchQuery}"`}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p className="mt-2 text-sm text-muted-foreground">Loading appeals...</p>
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
              ) : filteredAppeals.length === 0 ? (
                <div className="flex justify-center items-center py-8">
                  <div className="flex flex-col items-center">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">No appeals found</p>
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
                          <TableHead className="w-[50px]">Priority</TableHead>
                          <TableHead className="w-[100px]">Status</TableHead>
                          <TableHead className="w-[130px]">Type</TableHead>
                          <TableHead>Details</TableHead>
                          <TableHead className="w-[120px]">Reason</TableHead>
                          <TableHead className="w-[120px]">Time Status</TableHead>
                          <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getCurrentPageAppeals().map((appeal) => (
                          <TableRow key={appeal.id} onClick={() => handleViewAppealDetails(appeal)} className="cursor-pointer">
                            <TableCell className="p-2">
                              {getPriorityBadge(appeal.priority)}
                            </TableCell>
                            <TableCell className="p-2">
                              {getStatusBadge(appeal.status)}
                              {appeal.decision && (
                                <div className="mt-1">
                                  {getDecisionBadge(appeal.decision)}
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="p-2">
                              {getModerationTypeBadge(appeal.moderationType)}
                              <div className="text-xs text-muted-foreground mt-1">
                                {appeal.contentType}
                              </div>
                            </TableCell>
                            <TableCell className="p-2">
                              <div className="font-medium truncate max-w-[250px]" title={appeal.contentExcerpt}>
                                {appeal.contentExcerpt}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                User: {appeal.userName} | Submitted: {formatDate(appeal.submittedAt)}
                              </div>
                            </TableCell>
                            <TableCell className="p-2">
                              <div className="font-medium capitalize">{appeal.reason.replace(/_/g, " ")}</div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {appeal.supportingEvidence?.length ? `${appeal.supportingEvidence.length} evidence items` : 'No evidence'}
                              </div>
                            </TableCell>
                            <TableCell className="p-2">
                              <div className={getTimeStatus(appeal).variant}>
                                {getTimeStatus(appeal).label}
                              </div>
                              {appeal.reviewerName && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  By: {appeal.reviewerName}
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="p-2 text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleViewAppealDetails(appeal); }}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                  {appeal.status === AppealStatus.PENDING && (
                                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); startReviewProcess(appeal); }}>
                                      <Eye className="h-4 w-4 mr-2" />
                                      Start Review
                                    </DropdownMenuItem>
                                  )}
                                  {(appeal.status === AppealStatus.PENDING || appeal.status === AppealStatus.UNDER_REVIEW) && (
                                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleReviewAppeal(appeal); }}>
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Make Decision
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  
                  {/* Pagination */}
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-muted-foreground">
                      Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalAppeals)} of {totalAppeals} appeals
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                      </Button>
                      <div className="text-sm">
                        Page {currentPage} of {Math.ceil(totalAppeals / pageSize)}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(totalAppeals / pageSize)))}
                        disabled={currentPage === Math.ceil(totalAppeals / pageSize)}
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="stats" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Appeal Reasons Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Appeal Reasons</CardTitle>
                <CardDescription>Distribution of appeal reasons</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {/* In a real implementation, this would be a chart */}
                  <div className="space-y-4">
                    {Object.entries(metrics.byReason || {}).map(([reason, count]) => (
                      <div key={reason} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium capitalize">{reason.replace(/_/g, " ")}</span>
                          <span className="text-sm text-muted-foreground">{count} appeals</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${(count / stats.total) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Moderation Types Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Moderation Types</CardTitle>
                <CardDescription>Distribution of moderation types being appealed</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {/* In a real implementation, this would be a chart */}
                  <div className="space-y-4">
                    {Object.entries(metrics.byModerationType || {}).map(([type, count]) => (
                      <div key={type} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium capitalize">{type.replace(/_/g, " ")}</span>
                          <span className="text-sm text-muted-foreground">{count} appeals</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${(count / stats.total) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Appeal Outcomes Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Appeal Outcomes</CardTitle>
                <CardDescription>Distribution of decisions on appeals</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {/* In a real implementation, this would be a chart */}
                  <div className="space-y-4">
                    {Object.entries(metrics.byOutcome || {}).map(([outcome, count]) => {
                      const totalDecided = (stats.approved || 0) + (stats.rejected || 0);
                      return (
                        <div key={outcome} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium capitalize">{outcome.replace(/_/g, " ")}</span>
                            <span className="text-sm text-muted-foreground">{count} appeals</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                outcome === AppealDecision.UPHOLD ? "bg-red-500" :
                                outcome === AppealDecision.OVERTURN ? "bg-green-500" :
                                "bg-amber-500"
                              }`}
                              style={{ width: `${(count / totalDecided) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Response Time by Priority */}
            <Card>
              <CardHeader>
                <CardTitle>Response Time by Priority</CardTitle>
                <CardDescription>Average hours to resolution by priority level</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {/* In a real implementation, this would be a chart */}
                  <div className="space-y-4">
                    {Object.entries(metrics.avgTimeByPriority || {}).sort((a, b) => Number(b[0]) - Number(a[0])).map(([priority, hours]) => {
                      const priorityLevel = Number(priority);
                      const targetHours = priorityLevel === 5 ? 4 : priorityLevel === 4 ? 8 : priorityLevel === 3 ? 24 : priorityLevel === 2 ? 48 : 72;
                      const isWithinTarget = hours <= targetHours;
                      
                      return (
                        <div key={priority} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                              Priority {priority} {getPriorityBadge(Number(priority))}
                            </span>
                            <span className={`text-sm ${isWithinTarget ? 'text-green-600' : 'text-red-600'}`}>
                              {hours}h {isWithinTarget ? '(within target)' : `(target: ${targetHours}h)`}
                            </span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${isWithinTarget ? 'bg-green-500' : 'bg-red-500'}`}
                              style={{ width: `${Math.min((hours / 72) * 100, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Moderator Appeal Performance</CardTitle>
              <CardDescription>Overturn rates by moderator (for moderators with 5+ appealed decisions)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Moderator</TableHead>
                      <TableHead>Overturn Rate</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(metrics.overturnRateByModerator || {}).sort((a, b) => b[1] - a[1]).map(([moderator, rate]) => (
                      <TableRow key={moderator}>
                        <TableCell className="font-medium">{moderator}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="w-full max-w-md">
                              <div className="w-full bg-muted rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${rate > 30 ? 'bg-red-500' : rate > 15 ? 'bg-amber-500' : 'bg-green-500'}`}
                                  style={{ width: `${rate}%` }}
                                ></div>
                              </div>
                            </div>
                            <span className={`text-sm ${rate > 30 ? 'text-red-600' : rate > 15 ? 'text-amber-600' : 'text-green-600'}`}>
                              {rate}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Appeal Details Dialog */}
      {selectedAppeal && (
        <Dialog open={isAppealDetailsOpen} onOpenChange={setIsAppealDetailsOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5" />
                Appeal Details
                <Badge className="ml-2">{selectedAppeal.id}</Badge>
              </DialogTitle>
              <DialogDescription>
                Detailed information about this appeal
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              {/* Appeal Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Status:</span>
                  {getStatusBadge(selectedAppeal.status)}
                  {selectedAppeal.decision && (
                    <span className="ml-2">{getDecisionBadge(selectedAppeal.decision)}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Priority:</span>
                  {getPriorityBadge(selectedAppeal.priority)}
                </div>
              </div>
              
              <Separator />
              
              {/* Appeal Information */}
              <div className="space-y-3">
                <h3 className="text-lg font-medium">Appeal Information</h3>
                
                <div className="flex items-start gap-4">
                  <div className="w-1/3">
                    <p className="text-sm font-medium">Moderation Type</p>
                    <p>{getModerationTypeBadge(selectedAppeal.moderationType)}</p>
                  </div>
                  <div className="w-1/3">
                    <p className="text-sm font-medium">Appeal Reason</p>
                    <p className="capitalize">{selectedAppeal.reason.replace(/_/g, " ")}</p>
                  </div>
                  <div className="w-1/3">
                    <p className="text-sm font-medium">Submitted</p>
                    <p className="text-sm">{formatDate(selectedAppeal.submittedAt)}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium">Moderated Content</p>
                  <div className="mt-1 p-3 bg-muted rounded-md">
                    <p className="text-sm">{selectedAppeal.contentExcerpt}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium">Appeal Explanation</p>
                  <div className="mt-1 p-3 bg-muted rounded-md">
                    <p className="text-sm">{selectedAppeal.explanation}</p>
                  </div>
                </div>
                
                {selectedAppeal.supportingEvidence && selectedAppeal.supportingEvidence.length > 0 && (
                  <div>
                    <p className="text-sm font-medium">Supporting Evidence</p>
                    <div className="mt-1 space-y-2">
                      {selectedAppeal.supportingEvidence.map((evidence, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{evidence}</span>
                          <Button variant="ghost" size="sm" className="h-6 ml-auto">
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <Separator />
              
              {/* User Information */}
              <div className="space-y-3">
                <h3 className="text-lg font-medium">User Information</h3>
                
                <div className="flex items-center gap-2">
                  <User className="h-10 w-10 p-2 bg-muted rounded-full" />
                  <div>
                    <p className="font-medium">{selectedAppeal.userName}</p>
                    <p className="text-sm text-muted-foreground">{selectedAppeal.userId}</p>
                  </div>
                </div>
                
                {selectedAppeal.userHistory && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">User History</p>
                    <div className="grid grid-cols-5 gap-2 text-sm">
                      <div className="p-2 bg-muted rounded-md">
                        <p className="text-xs text-muted-foreground">Account Age</p>
                        <p>{selectedAppeal.userHistory.accountAge} days</p>
                      </div>
                      <div className="p-2 bg-muted rounded-md">
                        <p className="text-xs text-muted-foreground">Past Appeals</p>
                        <p>{selectedAppeal.userHistory.pastAppeals}</p>
                      </div>
                      <div className="p-2 bg-muted rounded-md">
                        <p className="text-xs text-muted-foreground">Violations</p>
                        <p>{selectedAppeal.userHistory.pastViolations}</p>
                      </div>
                      <div className="p-2 bg-muted rounded-md">
                        <p className="text-xs text-muted-foreground">Risk Score</p>
                        <p>{selectedAppeal.userHistory.averageRiskScore}%</p>
                      </div>
                      <div className="p-2 bg-muted rounded-md">
                        <p className="text-xs text-muted-foreground">Trust Score</p>
                        <p>{selectedAppeal.userHistory.trustScore}%</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <Separator />
              
              {/* Original Moderation */}
              <div className="space-y-3">
                <h3 className="text-lg font-medium">Original Moderation</h3>
                
                <div className="bg-muted rounded-md p-3">
                  <div className="flex items-start gap-2">
                    <div className="bg-red-100 p-2 rounded-full">
                      <ShieldAlert className="h-4 w-4 text-red-800" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm">Moderated by {selectedAppeal.originalModeratorName}</p>
                        <p className="text-xs text-muted-foreground">
                          {selectedAppeal.originalModerationDate ? formatDate(selectedAppeal.originalModerationDate) : 'Unknown date'}
                        </p>
                      </div>
                      <p className="text-sm mt-1">
                        {getModerationTypeBadge(selectedAppeal.moderationType as ContentModerationType)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Review Information */}
              {selectedAppeal.reviewedBy && (
                <>
                  <Separator />
                  
                  <div className="space-y-3">
                    <h3 className="text-lg font-medium">Appeal Review</h3>
                    
                    <div className="bg-muted rounded-md p-3">
                      <div className="flex items-start gap-2">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <ShieldCheck className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-sm">Reviewed by {selectedAppeal.reviewerName}</p>
                            <p className="text-xs text-muted-foreground">{formatDate(selectedAppeal.updatedAt)}</p>
                          </div>
                          <p className="text-sm mt-1">{selectedAppeal.reviewNotes}</p>
                          {selectedAppeal.decision && (
                            <Badge 
                              variant="outline" 
                              className={`mt-2 ${
                                selectedAppeal.decision === AppealDecision.OVERTURN ? 'bg-green-100 text-green-800' :
                                selectedAppeal.decision === AppealDecision.PARTIAL ? 'bg-amber-100 text-amber-800' :
                                'bg-red-100 text-red-800'
                              }`}
                            >
                              Decision: {selectedAppeal.decision.replace(/_/g, " ")}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
            
            <DialogFooter>
              {(selectedAppeal.status === AppealStatus.PENDING || selectedAppeal.status === AppealStatus.UNDER_REVIEW) && (
                <div className="flex gap-2 w-full">
                  {selectedAppeal.status === AppealStatus.PENDING && (
                    <Button variant="secondary" className="flex-1" onClick={() => startReviewProcess(selectedAppeal)}>
                      <Eye className="h-4 w-4 mr-2" />
                      Start Review
                    </Button>
                  )}
                  <Button variant="primary" className="flex-1" onClick={() => {
                    setIsAppealDetailsOpen(false);
                    handleReviewAppeal(selectedAppeal);
                  }}>
                    <Scale className="h-4 w-4 mr-2" />
                    Make Decision
                  </Button>
                </div>
              ) || (
                <Button variant="outline" onClick={() => setIsAppealDetailsOpen(false)}>Close</Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Review Dialog */}
      {selectedAppeal && (
        <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5" />
                Review Appeal
              </DialogTitle>
              <DialogDescription>
                Make a decision on this appeal
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="decision">Decision</Label>
                <Select
                  value={reviewDecision}
                  onValueChange={(value) => setReviewDecision(value as AppealDecision | "")}
                >
                  <SelectTrigger id="decision">
                    <SelectValue placeholder="Select a decision" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={AppealDecision.UPHOLD}>Uphold Original Decision</SelectItem>
                    <SelectItem value={AppealDecision.OVERTURN}>Overturn Original Decision</SelectItem>
                    <SelectItem value={AppealDecision.PARTIAL}>Partially Overturn Decision</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Review Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Provide a detailed explanation of your decision..."
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  rows={5}
                />
                <p className="text-xs text-muted-foreground">
                  Please provide a clear, detailed explanation for the user to understand your decision.
                </p>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsReviewModalOpen(false)}>Cancel</Button>
              <Button 
                onClick={submitAppealReview}
                disabled={!reviewDecision || !reviewNotes || reviewNotes.length < 10}
              >
                Submit Decision
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
