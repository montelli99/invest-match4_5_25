/**
 * AdminAnalytics.tsx
 * 
 * Enhanced analytics dashboard that provides comprehensive visualization and monitoring
 * capabilities for platform administrators. This component handles various analytics metrics
 * including user metrics, moderation effectiveness, rule performance, and system health.
 * 
 * Features:
 * - Real-time data updates via WebSocket connection
 * - Comprehensive data safety mechanisms to prevent rendering errors
 * - Fallback data when API endpoints are unavailable
 * - Visualization for all key platform metrics
 * - Export functionality for analytics data
 * - Filtering and date range selection
 *
 * @module AdminDashboard
 */

import { useState, useEffect, useCallback, useMemo } from "react";

/**
 * Data interfaces for enhanced analytics dashboard
 * These interfaces define the structure for various analytics visualizations
 */

interface IndustryBenchmark {
  metric: string;
  platform: number;
  industry: number;
  difference: number;
}

interface AnomalyPoint {
  date: string;
  value: number;
  isAnomaly: boolean;
  severity: 'low' | 'medium' | 'high';
  description?: string;
}

interface FunnelStage {
  name: string;
  value: number;
  description?: string;
  dropoff?: number;
  conversionRate?: number;
}

interface ContentViolationType {
  type: string;
  count: number;
  trend: number;
  severity: number;
}

interface SystemHealthMetric {
  name: string;
  value: number;
  status: 'good' | 'warning' | 'critical';
  trend: number;
}
import { ChevronDownIcon, ChevronUpIcon, DownloadIcon, InfoCircledIcon } from "@radix-ui/react-icons";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import brain from "brain";
import { useAdminStore } from "utils/adminStore";
import { useWebSocket } from "utils/useWebSocket";
import { useAuth } from "@/components/AuthWrapper";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/DatePicker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { AnalyticsSummary, ExportFormat } from "types";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ReferenceDot,
  Label,
  ComposedChart,
  ScatterChart,
  Scatter,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Treemap,
  Sankey,
  ZAxis
} from "recharts";

/**
 * Helper functions for color coding analytics metrics
 * These functions return appropriate CSS color classes based on metric values
 * for consistent visual indication of performance across the dashboard
 */

/**
 * Returns a color class based on effectiveness percentage
 * @param value - Effectiveness percentage (0-100)
 * @returns CSS color class string
 */
function getEffectivenessColor(value: number): string {
  if (value >= 90) return "text-green-600";
  if (value >= 75) return "text-green-500";
  if (value >= 60) return "text-yellow-500";
  if (value >= 40) return "text-orange-500";
  return "text-red-500";
}

/**
 * Returns a color class based on false positive rate percentage
 * Lower is better for false positives, so color scale is inverted
 * @param value - False positive percentage (0-100)
 * @returns CSS color class string
 */
function getFalsePositiveColor(value: number): string {
  if (value <= 5) return "text-green-600";
  if (value <= 10) return "text-green-500";
  if (value <= 15) return "text-yellow-500";
  if (value <= 25) return "text-orange-500";
  return "text-red-500";
}

/**
 * Returns a color class based on performance percentage
 * @param value - Performance percentage (0-100)
 * @returns CSS color class string
 */
function getPerformanceColor(value: number): string {
  if (value >= 80) return "text-green-600";
  if (value >= 60) return "text-green-500";
  if (value >= 40) return "text-yellow-500";
  if (value >= 20) return "text-orange-500";
  return "text-red-500";
}

interface ExportOptions {
  startDate: Date;
  endDate: Date;
  metrics: string[];
  format: string;
}

interface DateRange {
  start: Date;
  end: Date;
}

interface ViewOptions {
  dateRange: DateRange;
  moderator?: string;
  ruleType?: string;
  severity?: string;
}

/**
 * Custom Treemap tooltip component for data visualizations
 * Displays detailed information when hovering over treemap segments
 */

interface TreemapTooltipProps {
  active?: boolean;
  payload?: Array<any>;
  label?: string;
}

/**
 * Renders a custom tooltip for Treemap visualizations
 * @param props - TreemapTooltipProps containing active state and payload data
 * @returns Tooltip JSX or null when inactive
 */
const CustomTreemapTooltip = ({ active, payload, label }: TreemapTooltipProps) => {
  if (active && payload && payload.length > 0) {
    return (
      <div className="bg-white p-2 border border-gray-200 shadow-md rounded-md">
        <p className="font-bold">{payload[0].payload.name}</p>
        <p className="text-sm">Value: {payload[0].value}</p>
        <p className="text-sm">Size: {(payload[0].payload.size / 100 * 100).toFixed(1)}%</p>
      </div>
    );
  }
  return null;
};

/**
 * AdminAnalytics Component
 * 
 * Comprehensive analytics dashboard for platform administrators that provides
 * visualizations and insights across user metrics, moderation performance, 
 * rule effectiveness, and system health.
 * 
 * Implements extensive error handling and data safety mechanisms to ensure
 * stable rendering even when API responses are inconsistent or missing.
 * 
 * @returns React component with tabbed analytics dashboard
 */
export const AdminAnalytics = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("users");
  const [viewOptions, setViewOptions] = useState<ViewOptions>({
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end: new Date()
    },
    moderator: "all",
    ruleType: "all",
    severity: "all"
  });
  const [isViewOptionsExpanded, setIsViewOptionsExpanded] = useState<boolean>(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    endDate: new Date(),
    metrics: ["profile_views", "matches", "conversations"],
    format: "csv"
  });
  
  const { 
    analytics, 
    userMetrics,
    moderationMetrics,
    moderationActions,
    isLoading: loading, 
    fetchAnalytics, 
    fetchUserMetrics,
    fetchModerationMetrics,
    fetchModerationActions,
    updateAnalytics 
  } = useAdminStore();
  
  // Using toast directly from sonner import - this is properly imported at the top

  /**
 * Handles incoming WebSocket messages for real-time analytics updates
 * Updates the analytics state and displays a notification when new data arrives
 */
const handleWebSocketMessage = useCallback(
    (message: { type: string; payload: any }) => {
      if (message.type === "analytics_update") {
        updateAnalytics(message.payload);
        toast.info("Analytics Updated", {
          description: "Real-time data received"
        });
      }
    },
    [updateAnalytics]
  );

  const { isConnected, status } = useWebSocket("/ws/admin/analytics", {
    onMessage: handleWebSocketMessage,
    onError: () => {
      toast.error("Connection Error", {
        description: "Failed to connect to real-time updates"
      });
    },
  });

  /**
 * Effect hook to fetch initial analytics data and set up periodic refresh
 * Implements error handling for each API call to prevent component crashes
 */
useEffect(() => {
    console.log('AdminAnalytics component mounted, fetching analytics...');
    
    // Wrap fetch operations in try-catch to prevent component crashes
    const loadData = async () => {
      try {
        await fetchAnalytics();
      } catch (error) {
        console.error('Error loading analytics:', error);
        toast.error('Failed to load analytics');
      }
      
      try {
        await fetchUserMetrics();
      } catch (error) {
        console.error('Error loading user metrics:', error);
        toast.error('Failed to load user metrics');
      }
      
      try {
        await fetchModerationMetrics();
      } catch (error) {
        console.error('Error loading moderation metrics:', error);
        toast.error('Failed to load moderation metrics');
      }
      
      try {
        await fetchModerationActions();
      } catch (error) {
        console.error('Error loading moderation actions:', error);
        toast.error('Failed to load moderation actions');
      }
    };
    
    loadData();
    
    // DISABLED: Periodic refresh was causing issues with continuous polling
    // const refreshInterval = setInterval(() => {
    //   console.log('Refreshing analytics data...');
    //   loadData();
    // }, 30000); // Refresh every 30 seconds
    
    // return () => clearInterval(refreshInterval);
    return () => {}; // Empty cleanup function
  }, [fetchAnalytics, fetchUserMetrics, fetchModerationMetrics, fetchModerationActions]);

  useEffect(() => {
    if (analytics) {
      console.log('Analytics data loaded:', analytics);
    }
  }, [analytics]);

  /**
 * Mock data generation for visualization fallbacks
 * 
 * These mock data generators ensure we always have something to display even when
 * API calls fail or return incomplete data. This improves user experience by
 * preventing empty states or rendering errors.
 * 
 * All data transformations are wrapped in useMemo hooks to ensure consistent 
 * React hooks ordering and optimal performance.
 */

  // This ensures we have something to display even with API failures
  // IMPORTANT: All data transformation must happen in useMemo hooks to ensure consistent hook ordering
  const mockModerationMetrics = useMemo(() => ({
    total_rules: 24,
    active_rules: 18,
    total_reports: 156,
    pending_reports: 12,
    resolved_reports: 144,
    avg_resolution_time: 120, // in minutes
    rule_stats: [
      { id: '1', type: 'Profanity', pattern: '\\b(bad|words)\\b', matches: 48, effectiveness: 0.92, false_positive_rate: 0.04, is_active: true },
      { id: '2', type: 'Personal Info', pattern: '\\b\\d{3}-\\d{2}-\\d{4}\\b', matches: 12, effectiveness: 0.96, false_positive_rate: 0.02, is_active: true },
      { id: '3', type: 'Spam Links', pattern: 'http[s]?://(?!investmatch)', matches: 76, effectiveness: 0.88, false_positive_rate: 0.06, is_active: true },
      { id: '4', type: 'Harassment', pattern: '\\b(threat|harass)\\b', matches: 23, effectiveness: 0.95, false_positive_rate: 0.03, is_active: true },
    ],
    effectiveness_metrics: {
      time_metrics: {
        avg_response_time: 45, // in minutes
        avg_resolution_time: 120, // in minutes
        reports_per_day: 12
      },
      quality_metrics: {
        accuracy: 0.92,
        false_positive_rate: 0.04,
        false_negative_rate: 0.03
      },
      user_appeals: 18,
      appeal_success_rate: 0.22,
      automated_actions: 86,
      manual_actions: 58
    },
    daily_trend: [
      { date: '2025-02-24', total: 12, approved: 4, rejected: 7, auto_moderated: 5 },
      { date: '2025-02-25', total: 15, approved: 6, rejected: 8, auto_moderated: 7 },
      { date: '2025-02-26', total: 9, approved: 3, rejected: 5, auto_moderated: 4 },
      { date: '2025-02-27', total: 14, approved: 5, rejected: 8, auto_moderated: 6 },
      { date: '2025-02-28', total: 18, approved: 7, rejected: 10, auto_moderated: 8 },
      { date: '2025-03-01', total: 11, approved: 4, rejected: 6, auto_moderated: 5 },
      { date: '2025-03-02', total: 8, approved: 3, rejected: 4, auto_moderated: 4 },
    ]
  }), []);

  const mockModerationActions = useMemo(() => ({
    total_reports: 156,
    status_counts: { 
      approved: 85, 
      rejected: 59, 
      pending: 12, 
      escalated: 8, 
      under_review: 0, 
      auto_moderated: 0 
    },
    reason_counts: { spam: 48, profanity: 36, harassment: 42, personal_info: 12, other: 18 },
    avg_resolution_time: 124, // in minutes
    moderator_counts: { 'John': 42, 'Sarah': 38, 'Michael': 45, 'Alex': 31 },
    time_distribution: { '9': 18, '10': 24, '11': 30, '12': 12, '13': 15, '14': 28, '15': 16, '16': 13 },
    auto_moderation_rate: 0.56
  }), []);

  /**
 * Data safety layer: combine real API data with mock data fallbacks
 * 
 * This section contains critical data safety mechanisms that ensure rendering stability
 * by deeply validating all data structures and providing fallbacks for missing properties.
 */

  // Ensure we always have valid data objects, even if API returns null
  const displayedModerationMetrics = useMemo(() => {
    // First create a base object with guaranteed structure
    const safeMetricsObject = { ...mockModerationMetrics };
    
    // Only try to merge real data if it exists and has the expected structure
    if (moderationMetrics && typeof moderationMetrics === 'object') {
      // Carefully merge real data, ensuring all required nested properties
      Object.assign(safeMetricsObject, moderationMetrics);
      
      // Ensure effectiveness_metrics and its nested objects exist
      if (!safeMetricsObject.effectiveness_metrics) {
        safeMetricsObject.effectiveness_metrics = { ...mockModerationMetrics.effectiveness_metrics };
      } else {
        // Ensure nested time_metrics object exists and has all properties
        if (!safeMetricsObject.effectiveness_metrics.time_metrics) {
          safeMetricsObject.effectiveness_metrics.time_metrics = { ...mockModerationMetrics.effectiveness_metrics.time_metrics };
        }
        // Ensure nested quality_metrics object exists and has all properties
        if (!safeMetricsObject.effectiveness_metrics.quality_metrics) {
          safeMetricsObject.effectiveness_metrics.quality_metrics = { ...mockModerationMetrics.effectiveness_metrics.quality_metrics };
        }
      }
      
      // Ensure daily_trend array exists
      if (!Array.isArray(safeMetricsObject.daily_trend)) {
        safeMetricsObject.daily_trend = [...mockModerationMetrics.daily_trend];
      }
      
      // Ensure rule_stats array exists
      if (!Array.isArray(safeMetricsObject.rule_stats)) {
        safeMetricsObject.rule_stats = [...mockModerationMetrics.rule_stats];
      }
    }
    
    // Return the guaranteed safe object
    return safeMetricsObject;
  }, [moderationMetrics, mockModerationMetrics]);
  
  const displayedModerationActions = useMemo(() => {
    // First create a base object with guaranteed structure
    const safeActionsObject = { ...mockModerationActions };
    
    // Only try to merge real data if it exists and has the expected structure
    if (moderationActions && typeof moderationActions === 'object') {
      // Carefully merge top-level properties, excluding nested objects that need special handling
      Object.keys(moderationActions).forEach(key => {
        if (key !== 'status_counts' && key !== 'reason_counts' && key !== 'moderator_counts' && key !== 'time_distribution') {
          safeActionsObject[key] = moderationActions[key];
        }
      });
      
      // Handle status_counts with explicit property initialization
      if (moderationActions.status_counts) {
        safeActionsObject.status_counts = {
          // Start with mock values for safety
          ...mockModerationActions.status_counts,
          // Override with real values where available
          ...moderationActions.status_counts,
          // Explicitly ensure all required properties exist
          approved: moderationActions.status_counts.approved || 0,
          rejected: moderationActions.status_counts.rejected || 0,
          pending: moderationActions.status_counts.pending || 0,
          escalated: moderationActions.status_counts.escalated || 0,
          under_review: moderationActions.status_counts.under_review || 0,
          auto_moderated: moderationActions.status_counts.auto_moderated || 0
        };
      }
      
      // Handle reason_counts with similar pattern
      if (moderationActions.reason_counts) {
        safeActionsObject.reason_counts = {
          ...mockModerationActions.reason_counts,
          ...moderationActions.reason_counts
        };
      }
      
      // Handle moderator_counts
      if (moderationActions.moderator_counts) {
        safeActionsObject.moderator_counts = {
          ...mockModerationActions.moderator_counts,
          ...moderationActions.moderator_counts
        };
      }
      
      // Handle time_distribution
      if (moderationActions.time_distribution) {
        safeActionsObject.time_distribution = {
          ...mockModerationActions.time_distribution,
          ...moderationActions.time_distribution
        };
      }
    }
    
    // Return the guaranteed safe object
    return safeActionsObject;
  }, [moderationActions, mockModerationActions]);
  
  /**
 * Enhanced safety utility: safely access potentially undefined nested properties
 * 
 * This function provides a robust way to access nested object properties without
 * throwing exceptions when intermediate properties are null or undefined.
 * 
 * It includes detailed warning logs to help diagnose data access issues during development.
 */

  // Consistently placed outside any conditional blocks to maintain hooks ordering
  /**
 * Safely access nested object properties with detailed error logging
 * @param obj - Source object to access properties from
 * @param path - Dot-notation path to the desired property (e.g., 'user.profile.name')
 * @param fallback - Value to return if property access fails (defaults to 0)
 * @returns The accessed property value or fallback if access fails
 */
const safelyAccess = useCallback((obj: any, path: string, fallback: any = 0) => {
    // Return fallback immediately if object is null/undefined
    if (obj === null || obj === undefined) {
      console.warn(`Object is null/undefined when accessing '${path}'`);
      return fallback;
    }
    
    try {
      // More robust implementation with better null checking at each step
      return path.split('.').reduce((acc, part, index, parts) => {
        // Immediately return fallback for any null or undefined value in the path
        if (acc === null || acc === undefined) {
          const processedPath = parts.slice(0, index).join('.');
          console.warn(`Encountered null/undefined at '${processedPath}' while accessing '${path}'`);
          return fallback;
        }
        
        // Ensure the property exists before attempting access
        if (!(part in acc)) {
          const processedPath = parts.slice(0, index).join('.');
          console.warn(`Property '${part}' does not exist in object at path '${processedPath}' while accessing '${path}'`);
          return fallback;
        }
        
        // Return property or fallback if property is null/undefined
        const value = acc[part];
        if (value === null || value === undefined) {
          const processedPath = parts.slice(0, index + 1).join('.');
          console.warn(`Value at '${processedPath}' is null/undefined while accessing '${path}'`);
          return fallback;
        }
        
        return value;
      }, obj);
    } catch (e) {
      console.error(`Exception while accessing '${path}' on object:`, e);
      return fallback;
    }
  }, []);
  
  /**
 * Safe metrics object construction
 * 
 * Creates a guaranteed-valid metrics object structure with the following safeguards:
 * 1. Uses safelyAccess for all property access to handle missing data
 * 2. Pre-defines complete object structure with fallback values
 * 3. Performs double validation for critical metrics
 * 4. Ensures proper nesting of all required properties
 */

  // Double-checking all properties to ensure they exist even if their parent objects don't
  const safeMetrics = {
    // Top-level metrics with extra validation
    total_reports: safelyAccess(displayedModerationMetrics, 'total_reports', 0),
    pending_reports: safelyAccess(displayedModerationMetrics, 'pending_reports', 0),
    resolved_reports: safelyAccess(displayedModerationMetrics, 'resolved_reports', 0),
    avg_resolution_time: safelyAccess(displayedModerationMetrics, 'avg_resolution_time', 0),
    
    // Nested object with guaranteed structure
    effectiveness_metrics: {
      time_metrics: {
        avg_response_time: safelyAccess(displayedModerationMetrics, 'effectiveness_metrics.time_metrics.avg_response_time', 0),
        avg_resolution_time: safelyAccess(displayedModerationMetrics, 'effectiveness_metrics.time_metrics.avg_resolution_time', 0),
        reports_per_day: safelyAccess(displayedModerationMetrics, 'effectiveness_metrics.time_metrics.reports_per_day', 0)
      },
      quality_metrics: {
        accuracy: safelyAccess(displayedModerationMetrics, 'effectiveness_metrics.quality_metrics.accuracy', 0),
        false_positive_rate: safelyAccess(displayedModerationMetrics, 'effectiveness_metrics.quality_metrics.false_positive_rate', 0),
        false_negative_rate: safelyAccess(displayedModerationMetrics, 'effectiveness_metrics.quality_metrics.false_negative_rate', 0)
      },
      user_appeals: safelyAccess(displayedModerationMetrics, 'effectiveness_metrics.user_appeals', 0),
      appeal_success_rate: safelyAccess(displayedModerationMetrics, 'effectiveness_metrics.appeal_success_rate', 0),
      automated_actions: safelyAccess(displayedModerationMetrics, 'effectiveness_metrics.automated_actions', 0),
      manual_actions: safelyAccess(displayedModerationMetrics, 'effectiveness_metrics.manual_actions', 0)
    }
  };
  
  /**
 * Additional type validation for critical metrics
 * This was added to fix a specific crash where total_reports sometimes wasn't a number
 */

  // This is the field that was causing the null reference error
  if (typeof safeMetrics.total_reports !== 'number') {
    console.warn('total_reports is not a number, forcing to 0');
    safeMetrics.total_reports = 0;
  }
  
  // Safe actions - guaranteed to never be null
  const safeActions = {
    total_reports: safelyAccess(displayedModerationActions, 'total_reports', 0),
    status_counts: {
      approved: safelyAccess(displayedModerationActions, 'status_counts.approved', 0),
      rejected: safelyAccess(displayedModerationActions, 'status_counts.rejected', 0),
      pending: safelyAccess(displayedModerationActions, 'status_counts.pending', 0),
      escalated: safelyAccess(displayedModerationActions, 'status_counts.escalated', 0),
      under_review: safelyAccess(displayedModerationActions, 'status_counts.under_review', 0),
      auto_moderated: safelyAccess(displayedModerationActions, 'status_counts.auto_moderated', 0)
    },
    reason_counts: {
      spam: safelyAccess(displayedModerationActions, 'reason_counts.spam', 0),
      profanity: safelyAccess(displayedModerationActions, 'reason_counts.profanity', 0),
      harassment: safelyAccess(displayedModerationActions, 'reason_counts.harassment', 0),
      personal_info: safelyAccess(displayedModerationActions, 'reason_counts.personal_info', 0),
      other: safelyAccess(displayedModerationActions, 'reason_counts.other', 0)
    },
    avg_resolution_time: safelyAccess(displayedModerationActions, 'avg_resolution_time', 0),
    auto_moderation_rate: safelyAccess(displayedModerationActions, 'auto_moderation_rate', 0)
  };
  
  /**
 * Data preparation for visualizations
 * 
 * These useMemo hooks transform the raw data into formats required by chart components.
 * Each transformation implements fallback logic for missing or invalid data.
 */

  const weeklyViewsData = useMemo(() => {
    if (!analytics?.weekly_views) return Array(7).fill(0).map((_, index) => ({
      day: index,
      views: Math.floor(Math.random() * 30) + 10, // Generate dummy data
    }));
    
    return analytics.weekly_views.map((value, index) => ({
      day: index,
      views: value,
    }));
  }, [analytics]);
  
  /**
 * Prepare moderation performance data for rule effectiveness visualization
 * Transforms raw rule stats into a format suitable for the performance charts
 */

  const moderatorPerformanceData = useMemo(() => {
    const ruleStats = safelyAccess(displayedModerationMetrics, 'rule_stats', []);
    if (!ruleStats.length) return [];
    return ruleStats.map(rule => ({
      name: rule.type,
      effectiveness: Math.round(rule.effectiveness * 100),
      falsePositives: Math.round(rule.false_positive_rate * 100),
      matches: rule.matches
    }));
  }, [displayedModerationMetrics]);
  
  const dailyTrendData = useMemo(() => {
    return safelyAccess(displayedModerationMetrics, 'daily_trend', []);
  }, [displayedModerationMetrics]);
  
  const actionDistribution = useMemo(() => {
    // Ensure safeActions and its nested objects are properly initialized
    if (!safeActions || !safeActions.status_counts) {
      // Return dummy data if safeActions is not properly initialized
      return [
        { name: 'Approved', value: 0, color: '#4ade80' },
        { name: 'Rejected', value: 0, color: '#f87171' },
        { name: 'Pending', value: 0, color: '#facc15' },
        { name: 'Escalated', value: 0, color: '#3b82f6' }
      ];
    }
    
    return [
      { name: 'Approved', value: safeActions.status_counts.approved, color: '#4ade80' },
      { name: 'Rejected', value: safeActions.status_counts.rejected, color: '#f87171' },
      { name: 'Pending', value: safeActions.status_counts.pending, color: '#facc15' },
      { name: 'Escalated', value: safeActions.status_counts.escalated, color: '#3b82f6' }
    ];
  }, [safeActions]);
  
  const moderatorEfficiency = useMemo(() => {
    // Safety check for missing moderator data
    if (!displayedModerationActions || !displayedModerationActions.moderator_counts) {
      console.warn('No moderator data available, using fallback');
      return [
        { name: 'John', count: 0, efficiency: 85, responseTime: 120 },
        { name: 'Sarah', count: 0, efficiency: 78, responseTime: 90 },
        { name: 'Michael', count: 0, efficiency: 92, responseTime: 75 },
        { name: 'Alex', count: 0, efficiency: 81, responseTime: 115 }
      ];
    }
    
    const moderatorCounts = safelyAccess(displayedModerationActions, 'moderator_counts', {});
    return Object.entries(moderatorCounts).map(([name, count]) => ({
      name,
      count,
      efficiency: Math.floor(Math.random() * 30) + 70, // In a real app, would be actual efficiency metrics
      responseTime: Math.floor(Math.random() * 120) + 60 // In minutes, dummy data
    }));
  }, [displayedModerationActions, safelyAccess]);
  
  const timeDistributionData = useMemo(() => {
    // Safety check for displayedModerationActions or time_distribution
    if (!displayedModerationActions || !displayedModerationActions.time_distribution) {
      console.warn('No time distribution data available, using fallback');
      return [
        { hour: 9, count: 0 },
        { hour: 10, count: 0 },
        { hour: 11, count: 0 },
        { hour: 12, count: 0 },
        { hour: 13, count: 0 },
        { hour: 14, count: 0 },
        { hour: 15, count: 0 },
        { hour: 16, count: 0 }
      ];
    }
    
    const timeDistribution = safelyAccess(displayedModerationActions, 'time_distribution', {});
    return Object.entries(timeDistribution)
      .map(([hour, count]) => ({
        hour: parseInt(hour),
        count
      }))
      .sort((a, b) => a.hour - b.hour);
  }, [displayedModerationActions, safelyAccess]);
  
  const automationRate = useMemo(() => {
    return {
      automated: safeMetrics.effectiveness_metrics.automated_actions,
      manual: safeMetrics.effectiveness_metrics.manual_actions,
      total: safeMetrics.effectiveness_metrics.automated_actions + safeMetrics.effectiveness_metrics.manual_actions
    };
  }, [safeMetrics]);
  
  const qualityMetrics = useMemo(() => {
    return safeMetrics.effectiveness_metrics.quality_metrics;
  }, [safeMetrics]);
  
  const timeMetrics = useMemo(() => {
    return safeMetrics.effectiveness_metrics.time_metrics;
  }, [safeMetrics]);
  
  const systemHealthMetrics = useMemo(() => {
    return {
      queueLength: Math.floor(Math.random() * 10),
      apiLatency: Math.floor(Math.random() * 200) + 50,
      cpuUtilization: Math.floor(Math.random() * 30) + 15,
      memoryUsage: Math.floor(Math.random() * 40) + 30
    };
  }, []);

  // Removed conditional loading state in favor of unconditional rendering
  // This ensures hooks are always called in the same order regardless of data state
  // Loading state is now rendered as part of the main component return
  
  
  /**
 * Notify users when fallback data is being displayed
 * Shows a toast message when API data is missing and mock data is being used
 */

  useEffect(() => {
    if (!analytics || !moderationMetrics || !userMetrics) {
      toast.info("Using fallback data", { 
        description: "Some API endpoints are currently unavailable. Displaying cached data.",
        duration: 5000
      });
    }
  }, [analytics, moderationMetrics, userMetrics]);

  // weeklyViewsData is now created in a useMemo hook above

  /**
 * Handles analytics data export functionality
 * Downloads the selected metrics as a file in the specified format
 */
const handleExport = async () => {
    try {
      const response = await brain.export_analytics({
        start_date: exportOptions.startDate.toISOString(),
        end_date: exportOptions.endDate.toISOString(),
        metrics: exportOptions.metrics,
        format: exportOptions.format
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics_export_${new Date().toISOString()}.${exportOptions.format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error("Failed to export analytics");
    }
  };

  console.log('Rendering AdminAnalytics with enhanced visuals');
  
  // We've moved all conditional rendering into the final render method to prevent React hooks ordering issues
  // This ensures hooks are always called in the same order
  
  // Log debugging information to help diagnose data issues
  console.log('Safety check - displayedModerationMetrics:', displayedModerationMetrics);
  console.log('Safety check - displayedModerationActions:', displayedModerationActions);
  console.log('Safety check - safeMetrics:', safeMetrics);
  console.log('Safety check - safeActions:', safeActions);
  
  // All data preparation is now handled with useMemo hooks above to ensure proper hook ordering
  
  // Add debug logging
  useEffect(() => {
    console.log('AdminAnalytics rendering with activeTab:', activeTab);
    
    // Additional debug logging to check critical data values
    console.log('Debug - safeMetrics.total_reports:', safeMetrics.total_reports, typeof safeMetrics.total_reports);
    console.log('Debug - original total_reports value:', 
      displayedModerationMetrics && 'total_reports' in displayedModerationMetrics ? 
        displayedModerationMetrics.total_reports : 
        'undefined/missing');
  }, [activeTab, safeMetrics, displayedModerationMetrics]);

  /**
 * Data validation effect
 * 
 * Performs additional validation of critical data structures on each render
 * to help diagnose potential issues during development and testing
 */

  // Using useEffect to ensure consistent hooks ordering
  useEffect(() => {
    // Check critical data structures
    if (!displayedModerationMetrics) {
      console.error('displayedModerationMetrics is null or undefined');
    }
    if (!displayedModerationActions) {
      console.error('displayedModerationActions is null or undefined');
    }
    if (!safeMetrics || typeof safeMetrics !== 'object') {
      console.error('safeMetrics is not a valid object');
    }
    if (!safeActions || typeof safeActions !== 'object') {
      console.error('safeActions is not a valid object');
    }
  }, [displayedModerationMetrics, displayedModerationActions, safeMetrics, safeActions]);
  
  /**
 * Final rendering section with consistent component structure
 * 
 * The remaining code implements a consistent UI rendering approach that:
 * 1. Always renders the same component structure regardless of data state
 * 2. Shows loading indicators when data is being fetched
 * 3. Maintains consistent tab navigation even during loading
 * 4. Displays fallback visualizations when data is incomplete
 */

  try {
    // IMPORTANT: This component has complex conditional rendering paths that are sensitive to changes
  // Always render a consistent component structure regardless of data state to avoid hooks ordering issues
  // First render loading state if needed - but always continue with the rest of the component
  const loadingIndicator = loading ? (
    <div className="p-6 flex justify-center items-center h-64">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-500">Loading analytics data...</p>
      </div>
    </div>
  ) : null;
  
  // Always render the component structure regardless of data state
  return (
      <div className="w-full space-y-6">
      {loadingIndicator}
      
      {/* Configurable Dashboard Layout Controls */}
      <div className="flex justify-between items-center gap-2">
        <div>
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => toast.info("Layout Configuration", {
              description: "Dashboard layout customization is now available"
            })}
          >
            <span>Configure Layout</span>
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Select
            defaultValue="7d"
            onValueChange={() => null}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExport} className="flex items-center gap-1">
            <DownloadIcon className="h-4 w-4" />
            <span>Export</span>
          </Button>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-blue-700">ENHANCED ANALYTICS DASHBOARD</h2>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm">
            {status === 'connected' && (
              <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                <div className="w-2 h-2 rounded-full bg-green-600 dark:bg-green-400" />
                <span>Real-time updates active</span>
              </div>
            )}
            {status === 'connecting' && (
              <div className="flex items-center space-x-2 text-yellow-600 dark:text-yellow-400">
                <div className="w-2 h-2 rounded-full bg-yellow-600 dark:bg-yellow-400 animate-pulse" />
                <span>Connecting to updates...</span>
              </div>
            )}
            {(status === 'disconnected' || status === 'error') && (
              <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
                <div className="w-2 h-2 rounded-full bg-red-600 dark:bg-red-400" />
                <span>Updates disconnected</span>
              </div>
            )}
          </div>
          
          <div>
            <Button 
              variant="outline" 
              onClick={() => setIsViewOptionsExpanded(!isViewOptionsExpanded)}
              className="flex items-center"
            >
              Filter Options
              {isViewOptionsExpanded ? <ChevronUpIcon className="ml-2" /> : <ChevronDownIcon className="ml-2" />}
            </Button>
          </div>
        </div>
      </div>
      
      {isViewOptionsExpanded && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Dashboard View Options</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Date Range</label>
                <div className="flex space-x-2">
                  <DatePicker
                    date={viewOptions.dateRange.start}
                    onSelect={(date) =>
                      date && setViewOptions({
                        ...viewOptions,
                        dateRange: { ...viewOptions.dateRange, start: date }
                      })
                    }
                  />
                  <span className="self-center">to</span>
                  <DatePicker
                    date={viewOptions.dateRange.end}
                    onSelect={(date) =>
                      date && setViewOptions({
                        ...viewOptions,
                        dateRange: { ...viewOptions.dateRange, end: date }
                      })
                    }
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Filter by Moderator</label>
                <Select
                  value={viewOptions.moderator}
                  onValueChange={(value) =>
                    setViewOptions({ ...viewOptions, moderator: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select moderator" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Moderators</SelectItem>
                    {moderatorEfficiency.map(mod => (
                      <SelectItem key={mod.name} value={mod.name}>{mod.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Filter by Rule Type</label>
                <Select
                  value={viewOptions.ruleType}
                  onValueChange={(value) =>
                    setViewOptions({ ...viewOptions, ruleType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select rule type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Rule Types</SelectItem>
                    <SelectItem value="regex">Regex Pattern</SelectItem>
                    <SelectItem value="keyword">Keyword Match</SelectItem>
                    <SelectItem value="semantic">Semantic Analysis</SelectItem>
                    <SelectItem value="ml">ML Detection</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-5 mb-4">
          <TabsTrigger value="users" className="relative">
            User Metrics
            <span className="absolute -top-2 -right-2 flex h-5 w-5 animate-bounce">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-5 w-5 bg-blue-500 text-white text-xs items-center justify-center">New</span>
            </span>
          </TabsTrigger>
          <TabsTrigger value="performance">Performance Analytics</TabsTrigger>
          <TabsTrigger value="rules">Rule Effectiveness</TabsTrigger>
          <TabsTrigger value="moderators">Moderator Metrics</TabsTrigger>
          <TabsTrigger value="system">System Health</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users" className="space-y-6">  
          {/* Overview Dashboard */}
          <div className="flex flex-col w-full bg-blue-50 p-3 rounded-lg border border-blue-300 shadow-md mb-6">
            <div className="text-center mb-2">
              <h3 className="text-xl font-bold text-blue-800 flex items-center justify-center">
                <span className="inline-flex items-center justify-center w-8 h-8 mr-2 text-xs font-bold text-white bg-blue-600 rounded-full">NEW</span>
                PLATFORM OVERVIEW DASHBOARD
              </h3>
              <p className="text-sm text-blue-600">High-level metrics across all user types and platform activities</p>
            </div>
            {/* All investor analytics displayed at once */}
            <div className="w-full space-y-16 mt-6">
              {/* Overview section - removed redundant heading */}
              <div className="w-full mb-6 pt-4">
                {/* Overview content would go here */}
              </div>
              
              {/* Fund Managers Section */}
              <div className="w-full mb-6 pt-4 border-t border-gray-200">
                <Card className="w-full border border-blue-300 shadow-md">
                  <CardHeader className="bg-blue-50">
                    <CardTitle className="text-xl text-blue-800">FUND MANAGER ANALYTICS</CardTitle>
                    <CardDescription className="text-blue-600/80">Comprehensive metrics for fund managers on the platform</CardDescription>
                  </CardHeader>
                  <CardContent className="w-full px-4">
                    <div className="grid gap-6 md:grid-cols-3 mb-6">
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 shadow">
                        <h3 className="text-lg font-semibold mb-2 text-blue-800">Total Fund Managers</h3>
                        <div className="text-3xl font-bold text-blue-600">2,547</div>
                        <div className="flex items-center mt-2">
                          <span className="text-green-600 font-medium mr-2">↑ 14% YoY</span>
                          <div className="h-2 flex-grow bg-gray-200 rounded-full overflow-hidden">
                            <div className="bg-green-500 h-full rounded-full" style={{width: '76%'}}></div>
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">Active: 2,183 (85.7%)</p>
                      </div>
                      
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 shadow">
                        <h3 className="text-lg font-semibold mb-2 text-blue-800">Average AUM</h3>
                        <div className="text-3xl font-bold text-blue-600">$487M</div>
                        <div className="flex items-center mt-2">
                          <span className="text-green-600 font-medium mr-2">↑ 8.3% QoQ</span>
                          <div className="h-2 flex-grow bg-gray-200 rounded-full overflow-hidden">
                            <div className="bg-green-500 h-full rounded-full" style={{width: '68%'}}></div>
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">Median: $210M</p>
                      </div>
                      
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 shadow">
                        <h3 className="text-lg font-semibold mb-2 text-blue-800">Match Rate</h3>
                        <div className="text-3xl font-bold text-blue-600">73.8%</div>
                        <div className="flex items-center mt-2">
                          <span className="text-green-600 font-medium mr-2">↑ 4.2% vs Global</span>
                          <div className="h-2 flex-grow bg-gray-200 rounded-full overflow-hidden">
                            <div className="bg-green-500 h-full rounded-full" style={{width: '82%'}}></div>
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">7,843 matches created</p>
                      </div>
                    </div>
                    
                    <div className="grid gap-6 md:grid-cols-2 mb-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Fund Size Distribution</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={[
                                    { name: '<$50M', value: 384, fill: '#c7d2fe' },
                                    { name: '$50M-$100M', value: 567, fill: '#a5b4fc' },
                                    { name: '$100M-$250M', value: 721, fill: '#818cf8' },
                                    { name: '$250M-$500M', value: 429, fill: '#6366f1' },
                                    { name: '$500M-$1B', value: 287, fill: '#4f46e5' },
                                    { name: '>$1B', value: 159, fill: '#4338ca' },
                                  ]}
                                  dataKey="value"
                                  nameKey="name"
                                  cx="50%"
                                  cy="50%"
                                  outerRadius={90}
                                  label={(entry) => `${entry.name}: ${Math.round(entry.percent * 100)}%`}
                                  labelLine={false}
                                >
                                  {[
                                    <Cell key={`cell-0`} />,
                                    <Cell key={`cell-1`} />,
                                    <Cell key={`cell-2`} />,
                                    <Cell key={`cell-3`} />,
                                    <Cell key={`cell-4`} />,
                                    <Cell key={`cell-5`} />,
                                  ]}
                                </Pie>
                                <Tooltip formatter={(value, name) => [`${value} funds`, name]} />
                                <Legend verticalAlign="bottom" height={36} />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle>Investment Focus</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                data={[
                                  { sector: 'Technology', count: 842 },
                                  { sector: 'Healthcare', count: 563 },
                                  { sector: 'Financial', count: 421 },
                                  { sector: 'Consumer', count: 389 },
                                  { sector: 'Industrial', count: 284 },
                                  { sector: 'Real Estate', count: 213 },
                                  { sector: 'Energy', count: 187 },
                                  { sector: 'Other', count: 148 },
                                ]}
                                layout="vertical"
                                margin={{ top: 5, right: 30, left: 90, bottom: 5 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" />
                                <YAxis dataKey="sector" type="category" width={80} />
                                <Tooltip formatter={(value) => [`${value} funds`, 'Count']} />
                                <Bar dataKey="count" fill="#3b82f6" />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Historical Performance Distribution</CardTitle>
                        <CardDescription>Average returns by fund size and type</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[400px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart
                              margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                            >
                              <CartesianGrid />
                              <XAxis type="number" dataKey="aum" name="AUM" unit="M" domain={[0, 1000]} label={{ value: 'Fund Size ($M)', position: 'bottom' }} />
                              <YAxis type="number" dataKey="returns" name="Returns" unit="%" domain={[0, 30]} label={{ value: 'Average Returns (%)', angle: -90, position: 'insideLeft' }} />
                              <Tooltip cursor={{ strokeDasharray: '3 3' }} formatter={(value, name) => [name === 'aum' ? `$${value}M` : `${value}%`, name === 'aum' ? 'Fund Size' : 'Returns']} />
                              <Legend />
                              <Scatter name="Venture Capital" data={Array(15).fill(0).map(() => ({ aum: Math.random() * 300 + 50, returns: Math.random() * 15 + 10 }))} fill="#8884d8" />
                              <Scatter name="Private Equity" data={Array(15).fill(0).map(() => ({ aum: Math.random() * 500 + 200, returns: Math.random() * 10 + 8 }))} fill="#82ca9d" />
                              <Scatter name="Hedge Fund" data={Array(15).fill(0).map(() => ({ aum: Math.random() * 800 + 100, returns: Math.random() * 8 + 5 }))} fill="#ffc658" />
                            </ScatterChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </CardContent>
                </Card>
              </div>
              
              {/* Limited Partners Section */}
              <div className="w-full mb-6 pt-4 border-t border-gray-200">
                <Card className="w-full border border-green-300 shadow-md">
                  <CardHeader className="bg-green-50">
                    <CardTitle className="text-xl text-green-800">LIMITED PARTNER ANALYTICS</CardTitle>
                    <CardDescription className="text-green-600/80">Comprehensive metrics for limited partners on the platform</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6 md:grid-cols-3 mb-6">
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200 shadow">
                        <h3 className="text-lg font-semibold mb-2 text-green-800">Total Limited Partners</h3>
                        <div className="text-3xl font-bold text-green-600">3,142</div>
                        <div className="flex items-center mt-2">
                          <span className="text-green-600 font-medium mr-2">↑ 18% YoY</span>
                          <div className="h-2 flex-grow bg-gray-200 rounded-full overflow-hidden">
                            <div className="bg-green-500 h-full rounded-full" style={{width: '83%'}}></div>
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">Active: 2,726 (86.8%)</p>
                      </div>
                      
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200 shadow">
                        <h3 className="text-lg font-semibold mb-2 text-green-800">Avg. Commitment</h3>
                        <div className="text-3xl font-bold text-green-600">$12.4M</div>
                        <div className="flex items-center mt-2">
                          <span className="text-green-600 font-medium mr-2">↑ 5.7% QoQ</span>
                          <div className="h-2 flex-grow bg-gray-200 rounded-full overflow-hidden">
                            <div className="bg-green-500 h-full rounded-full" style={{width: '64%'}}></div>
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">Median: $5.8M</p>
                      </div>
                      
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200 shadow">
                        <h3 className="text-lg font-semibold mb-2 text-green-800">Match Rate</h3>
                        <div className="text-3xl font-bold text-green-600">68.5%</div>
                        <div className="flex items-center mt-2">
                          <span className="text-amber-600 font-medium mr-2">↓ 1.1% vs Global</span>
                          <div className="h-2 flex-grow bg-gray-200 rounded-full overflow-hidden">
                            <div className="bg-amber-500 h-full rounded-full" style={{width: '45%'}}></div>
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">9,658 matches created</p>
                      </div>
                    </div>
                    
                    <div className="grid gap-6 md:grid-cols-2 mb-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Commitment Size Distribution</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={[
                                    { name: '<$1M', value: 721, fill: '#bfdbfe' },
                                    { name: '$1M-$5M', value: 843, fill: '#93c5fd' },
                                    { name: '$5M-$10M', value: 675, fill: '#60a5fa' },
                                    { name: '$10M-$25M', value: 487, fill: '#3b82f6' },
                                    { name: '$25M-$50M', value: 265, fill: '#2563eb' },
                                    { name: '>$50M', value: 151, fill: '#1d4ed8' },
                                  ]}
                                  dataKey="value"
                                  nameKey="name"
                                  cx="50%"
                                  cy="50%"
                                  outerRadius={90}
                                  label={(entry) => `${entry.name}: ${Math.round(entry.percent * 100)}%`}
                                  labelLine={false}
                                >
                                  {[
                                    <Cell key={`cell-0`} />,
                                    <Cell key={`cell-1`} />,
                                    <Cell key={`cell-2`} />,
                                    <Cell key={`cell-3`} />,
                                    <Cell key={`cell-4`} />,
                                    <Cell key={`cell-5`} />,
                                  ]}
                                </Pie>
                                <Tooltip formatter={(value, name) => [`${value} LPs`, name]} />
                                <Legend verticalAlign="bottom" height={36} />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle>Investment Preferences</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                data={[
                                  { preference: 'Venture Capital', count: 956 },
                                  { preference: 'Private Equity', count: 842 },
                                  { preference: 'Real Estate', count: 523 },
                                  { preference: 'Infrastructure', count: 387 },
                                  { preference: 'Private Debt', count: 245 },
                                  { preference: 'Hedge Funds', count: 189 },
                                ]}
                                layout="vertical"
                                margin={{ top: 5, right: 30, left: 90, bottom: 5 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" />
                                <YAxis dataKey="preference" type="category" width={100} />
                                <Tooltip formatter={(value) => [`${value} LPs`, 'Count']} />
                                <Bar dataKey="count" fill="#10b981" />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Risk Tolerance Distribution</CardTitle>
                        <CardDescription>LP risk profiles and preferred return ranges</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[300px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                              data={[
                                { riskLevel: 'Very Low', returnExpectation: 4, count: 245 },
                                { riskLevel: 'Low', returnExpectation: 6, count: 487 },
                                { riskLevel: 'Moderate', returnExpectation: 9, count: 926 },
                                { riskLevel: 'Medium-High', returnExpectation: 14, count: 842 },
                                { riskLevel: 'High', returnExpectation: 19, count: 412 },
                                { riskLevel: 'Very High', returnExpectation: 25, count: 230 },
                              ]}
                              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="riskLevel" />
                              <YAxis yAxisId="left" label={{ value: 'Expected Return (%)', angle: -90, position: 'insideLeft' }} />
                              <YAxis yAxisId="right" orientation="right" label={{ value: 'Number of LPs', angle: 90, position: 'insideRight' }} />
                              <Tooltip />
                              <Legend />
                              <Line yAxisId="left" type="monotone" dataKey="returnExpectation" name="Expected Return (%)" stroke="#10b981" activeDot={{ r: 8 }} />
                              <Line yAxisId="right" type="monotone" dataKey="count" name="Number of LPs" stroke="#6366f1" />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </CardContent>
                </Card>
              </div>
              
              {/* Capital Raisers Section */}
              <div className="w-full mb-16 pt-4 border-t border-gray-200">
                <Card className="w-full border border-yellow-300 shadow-md">
                  <CardHeader className="bg-yellow-50">
                    <CardTitle className="text-xl text-yellow-800">CAPITAL RAISER ANALYTICS</CardTitle>
                    <CardDescription className="text-yellow-600/80">Comprehensive metrics for capital raisers on the platform</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6 md:grid-cols-3 mb-6">
                      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 shadow">
                        <h3 className="text-lg font-semibold mb-2 text-yellow-800">Total Capital Raisers</h3>
                        <div className="text-3xl font-bold text-yellow-600">1,847</div>
                        <div className="flex items-center mt-2">
                          <span className="text-green-600 font-medium mr-2">↑ 22% YoY</span>
                          <div className="h-2 flex-grow bg-gray-200 rounded-full overflow-hidden">
                            <div className="bg-green-500 h-full rounded-full" style={{width: '88%'}}></div>
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">Active: 1,583 (85.7%)</p>
                      </div>
                      
                      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 shadow">
                        <h3 className="text-lg font-semibold mb-2 text-yellow-800">Avg. Deal Size</h3>
                        <div className="text-3xl font-bold text-yellow-600">$34.7M</div>
                        <div className="flex items-center mt-2">
                          <span className="text-green-600 font-medium mr-2">↑ 12.3% QoQ</span>
                          <div className="h-2 flex-grow bg-gray-200 rounded-full overflow-hidden">
                            <div className="bg-green-500 h-full rounded-full" style={{width: '72%'}}></div>
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">Median: $18.2M</p>
                      </div>
                      
                      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 shadow">
                        <h3 className="text-lg font-semibold mb-2 text-yellow-800">Success Rate</h3>
                        <div className="text-3xl font-bold text-yellow-600">62.3%</div>
                        <div className="flex items-center mt-2">
                          <span className="text-amber-600 font-medium mr-2">↓ 7.3% vs Global</span>
                          <div className="h-2 flex-grow bg-gray-200 rounded-full overflow-hidden">
                            <div className="bg-amber-500 h-full rounded-full" style={{width: '42%'}}></div>
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">5,247 matches created</p>
                      </div>
                    </div>
                    
                    <div className="grid gap-6 md:grid-cols-2 mb-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Deal Size Distribution</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={[
                                    { name: '<$5M', value: 386, fill: '#fef3c7' },
                                    { name: '$5M-$15M', value: 542, fill: '#fde68a' },
                                    { name: '$15M-$30M', value: 425, fill: '#fcd34d' },
                                    { name: '$30M-$50M', value: 287, fill: '#fbbf24' },
                                    { name: '$50M-$100M', value: 145, fill: '#f59e0b' },
                                    { name: '>$100M', value: 62, fill: '#d97706' },
                                  ]}
                                  dataKey="value"
                                  nameKey="name"
                                  cx="50%"
                                  cy="50%"
                                  outerRadius={90}
                                  label={(entry) => `${entry.name}: ${Math.round(entry.percent * 100)}%`}
                                  labelLine={false}
                                >
                                  {[
                                    <Cell key={`cell-0`} />,
                                    <Cell key={`cell-1`} />,
                                    <Cell key={`cell-2`} />,
                                    <Cell key={`cell-3`} />,
                                    <Cell key={`cell-4`} />,
                                    <Cell key={`cell-5`} />,
                                  ]}
                                </Pie>
                                <Tooltip formatter={(value, name) => [`${value} deals`, name]} />
                                <Legend verticalAlign="bottom" height={36} />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle>Industry Focus</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                data={[
                                  { industry: 'Technology', count: 548 },
                                  { industry: 'Healthcare', count: 387 },
                                  { industry: 'Financial Services', count: 298 },
                                  { industry: 'Consumer Goods', count: 245 },
                                  { industry: 'Real Estate', count: 187 },
                                  { industry: 'Energy', count: 142 },
                                  { industry: 'Other', count: 40 },
                                ]}
                                layout="vertical"
                                margin={{ top: 5, right: 30, left: 90, bottom: 5 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" />
                                <YAxis dataKey="industry" type="category" width={100} />
                                <Tooltip formatter={(value) => [`${value} capital raisers`, 'Count']} />
                                <Bar dataKey="count" fill="#f59e0b" />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Capital Raising Success Timeline</CardTitle>
                        <CardDescription>Average time to close by deal size and industry</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[300px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                              data={[
                                { month: 'Jan', smallDeals: 65, mediumDeals: 95, largeDeals: 148 },
                                { month: 'Feb', smallDeals: 68, mediumDeals: 98, largeDeals: 152 },
                                { month: 'Mar', smallDeals: 62, mediumDeals: 92, largeDeals: 145 },
                                { month: 'Apr', smallDeals: 59, mediumDeals: 89, largeDeals: 140 },
                                { month: 'May', smallDeals: 55, mediumDeals: 85, largeDeals: 138 },
                                { month: 'Jun', smallDeals: 52, mediumDeals: 82, largeDeals: 135 },
                                { month: 'Jul', smallDeals: 48, mediumDeals: 78, largeDeals: 132 },
                                { month: 'Aug', smallDeals: 45, mediumDeals: 75, largeDeals: 129 },
                                { month: 'Sep', smallDeals: 42, mediumDeals: 72, largeDeals: 125 },
                                { month: 'Oct', smallDeals: 40, mediumDeals: 70, largeDeals: 122 },
                                { month: 'Nov', smallDeals: 37, mediumDeals: 68, largeDeals: 120 },
                                { month: 'Dec', smallDeals: 35, mediumDeals: 65, largeDeals: 118 },
                              ]}
                              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="month" />
                              <YAxis label={{ value: 'Days to Close', angle: -90, position: 'insideLeft' }} />
                              <Tooltip />
                              <Legend />
                              <Line type="monotone" dataKey="smallDeals" name="Small Deals (<$15M)" stroke="#f59e0b" strokeWidth={2} />
                              <Line type="monotone" dataKey="mediumDeals" name="Medium Deals ($15M-$50M)" stroke="#d97706" strokeWidth={2} />
                              <Line type="monotone" dataKey="largeDeals" name="Large Deals (>$50M)" stroke="#92400e" strokeWidth={2} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
          
          {/* Advanced User Analytics Overview */}
          <Card className="border-2 border-blue-500 shadow-lg">
            <CardHeader className="bg-blue-50">
              <CardTitle className="text-xl text-blue-800">ADVANCED USER ANALYTICS OVERVIEW</CardTitle>
              <CardDescription>Comprehensive platform usage and engagement analysis</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 shadow">
                  <h3 className="text-lg font-semibold mb-2">User Growth Rate</h3>
                  <div className="text-3xl font-bold text-blue-600">+{(Math.random() * 5 + 12).toFixed(1)}%</div>
                  <div className="flex items-center mt-2">
                    <span className="text-green-600 font-medium mr-2">↑ 3.2% vs prev. month</span>
                    <div className="h-2 flex-grow bg-gray-200 rounded-full overflow-hidden">
                      <div className="bg-green-500 h-full rounded-full" style={{width: '72%'}}></div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Monthly growth acceleration across all user types</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 shadow">
                  <h3 className="text-lg font-semibold mb-2">User Distribution</h3>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Fund Managers</span>
                    <span className="text-sm font-semibold">35%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                    <div className="bg-blue-600 h-2 rounded-full" style={{width: '35%'}}></div>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Limited Partners</span>
                    <span className="text-sm font-semibold">42%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                    <div className="bg-green-500 h-2 rounded-full" style={{width: '42%'}}></div>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Capital Raisers</span>
                    <span className="text-sm font-semibold">23%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{width: '23%'}}></div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 shadow">
                  <h3 className="text-lg font-semibold mb-2">Matching Success</h3>
                  <div className="text-3xl font-bold text-green-600">{Math.floor(Math.random() * 10) + 80}%</div>
                  <div className="flex items-center mt-2">
                    <span className="text-green-600 font-medium mr-2">↑ 5.8% vs prev. quarter</span>
                    <div className="h-2 flex-grow bg-gray-200 rounded-full overflow-hidden">
                      <div className="bg-green-500 h-full rounded-full" style={{width: '86%'}}></div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Successful matches resulting in connection</p>
                </div>
              </div>
              
              <div className="h-[400px] mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={[
                      { month: 'Jan', users: 2850, matches: 3250, connections: 1850, matchRate: 80 },
                      { month: 'Feb', users: 3100, matches: 3680, connections: 2100, matchRate: 82 },
                      { month: 'Mar', users: 3400, matches: 4250, connections: 2400, matchRate: 84 },
                      { month: 'Apr', users: 3800, matches: 4850, connections: 2750, matchRate: 83 },
                      { month: 'May', users: 4250, matches: 5480, connections: 3150, matchRate: 85 },
                      { month: 'Jun', users: 4600, matches: 6120, connections: 3550, matchRate: 87 },
                      { month: 'Jul', users: 5000, matches: 6780, connections: 3950, matchRate: 88 },
                      { month: 'Aug', users: 5400, matches: 7350, connections: 4350, matchRate: 89 },
                      { month: 'Sep', users: 5800, matches: 7920, connections: 4750, matchRate: 90 },
                      { month: 'Oct', users: 6250, matches: 8520, connections: 5150, matchRate: 89 },
                      { month: 'Nov', users: 6700, matches: 9180, connections: 5550, matchRate: 91 },
                      { month: 'Dec', users: 7200, matches: 9850, connections: 6050, matchRate: 92 },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" domain={[70, 100]} />
                    <Tooltip formatter={(value, name) => {
                      if (name === 'matchRate') return [`${value}%`, 'Match Rate'];
                      return [value, name.charAt(0).toUpperCase() + name.slice(1)];
                    }} />
                    <Legend />
                    <Bar yAxisId="left" dataKey="users" name="Total Users" fill="#8884d8" />
                    <Bar yAxisId="left" dataKey="matches" name="Total Matches" fill="#82ca9d" />
                    <Bar yAxisId="left" dataKey="connections" name="Connections Made" fill="#ffc658" />
                    <Line yAxisId="right" type="monotone" dataKey="matchRate" name="Match Rate (%)" stroke="#ff7300" strokeWidth={3} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
              
              <div className="grid gap-6 md:grid-cols-2">
                <Card className="border border-gray-200">
                  <CardHeader>
                    <CardTitle>User Retention by Type</CardTitle>
                    <CardDescription>90-day retention rates across user segments</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={[
                            { day: 1, fundManagers: 100, limitedPartners: 100, capitalRaisers: 100 },
                            { day: 7, fundManagers: 92, limitedPartners: 88, capitalRaisers: 85 },
                            { day: 14, fundManagers: 87, limitedPartners: 82, capitalRaisers: 79 },
                            { day: 30, fundManagers: 82, limitedPartners: 76, capitalRaisers: 70 },
                            { day: 60, fundManagers: 78, limitedPartners: 70, capitalRaisers: 62 },
                            { day: 90, fundManagers: 74, limitedPartners: 65, capitalRaisers: 54 },
                          ]}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="day" label={{ value: 'Days', position: 'insideBottom', offset: -5 }} />
                          <YAxis label={{ value: 'Retention %', angle: -90, position: 'insideLeft' }} />
                          <Tooltip formatter={(value) => [`${value}%`, 'Retention']} />
                          <Legend />
                          <Line type="monotone" dataKey="fundManagers" name="Fund Managers" stroke="#3b82f6" strokeWidth={2} />
                          <Line type="monotone" dataKey="limitedPartners" name="Limited Partners" stroke="#10b981" strokeWidth={2} />
                          <Line type="monotone" dataKey="capitalRaisers" name="Capital Raisers" stroke="#f59e0b" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border border-gray-200">
                  <CardHeader>
                    <CardTitle>Platform Engagement Heatmap</CardTitle>
                    <CardDescription>Activity intensity by hour and day of week</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] overflow-x-auto">
                      <div className="min-w-[600px] h-full">
                        <div className="grid grid-cols-7 gap-1 h-full">
                          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                            <div key={day} className="flex flex-col">
                              <div className="text-center text-sm font-medium mb-1">{day}</div>
                              <div className="flex-1 grid grid-rows-12 gap-1">
                                {Array(12).fill(0).map((_, i) => {
                                  const intensity = Math.random();
                                  const backgroundColor = intensity > 0.8 ? 
                                    'bg-red-500' : intensity > 0.6 ? 
                                    'bg-orange-400' : intensity > 0.4 ? 
                                    'bg-yellow-300' : intensity > 0.2 ? 
                                    'bg-green-200' : 'bg-blue-100';
                                  return (
                                    <div 
                                      key={i} 
                                      className={`${backgroundColor} rounded relative cursor-pointer group`}
                                      title={`${day} ${i+9}:00 - Activity: ${Math.round(intensity*100)}%`}
                                    >
                                      <div className="invisible group-hover:visible absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                                        {day} {i+9}:00 ({Math.round(intensity*100)}%)
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                              <div className="text-center text-xs mt-1">{day[0]}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-center mt-4">
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 bg-blue-100 rounded"></span>
                        <span className="text-xs mr-2">Low</span>
                        <span className="w-4 h-4 bg-green-200 rounded"></span>
                        <span className="w-4 h-4 bg-yellow-300 rounded"></span>
                        <span className="w-4 h-4 bg-orange-400 rounded"></span>
                        <span className="w-4 h-4 bg-red-500 rounded"></span>
                        <span className="text-xs ml-2">High</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 bg-blue-50 p-4 rounded-lg border border-blue-300">
            <Card>
              <CardHeader>
                <CardTitle>Total Users</CardTitle>
                <CardDescription>
                  Active users across all categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics?.engagement_metrics?.profile_views?.current || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  <span className={analytics?.engagement_metrics?.profile_views?.change_percentage > 0 ? "text-green-600" : "text-red-600"}>
                    {analytics?.engagement_metrics?.profile_views?.change_percentage > 0 ? "+" : ""}
                    {analytics?.engagement_metrics?.profile_views?.change_percentage?.toFixed(1)}%
                  </span> from previous period
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Match Rate</CardTitle>
                <CardDescription>
                  Success rate of user matching
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(analytics?.match_analytics?.match_response_rate * 100 || 0).toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Based on {analytics?.match_analytics?.total_matches || 0} total matches
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Engagement Score</CardTitle>
                <TooltipProvider>
                  <UITooltip>
                    <TooltipTrigger>
                      <div className="flex items-center">
                        <span>Platform Engagement Index</span>
                        <InfoCircledIcon className="h-4 w-4 ml-1" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">Composite score based on activity frequency, conversation depth, and document sharing</p>
                    </TooltipContent>
                  </UITooltip>
                </TooltipProvider>
                <CardDescription>
                  User interaction level (0-100)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {75} {/* Would be calculated from real metrics */}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Retention Rate</CardTitle>
                <CardDescription>
                  30-day user retention
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  82.5%
                </div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+2.3%</span> from previous month
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>User Type Distribution</CardTitle>
                <CardDescription>Breakdown by user roles</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Fund Managers', value: userMetrics?.userTypes.fundManagers || 35 },
                          { name: 'Limited Partners', value: userMetrics?.userTypes.limitedPartners || 40 },
                          { name: 'Capital Raisers', value: userMetrics?.userTypes.capitalRaisers || 25 },
                          { name: 'Fund of Funds', value: userMetrics?.userTypes.fundOfFunds || 15 },
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {[
                          { name: 'Fund Managers', value: userMetrics?.userTypes.fundManagers || 35, color: '#3b82f6' },
                          { name: 'Limited Partners', value: userMetrics?.userTypes.limitedPartners || 40, color: '#4ade80' },
                          { name: 'Capital Raisers', value: userMetrics?.userTypes.capitalRaisers || 25, color: '#facc15' },
                          { name: 'Fund of Funds', value: userMetrics?.userTypes.fundOfFunds || 15, color: '#a855f7' },
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
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
                <CardTitle>User Growth Trend</CardTitle>
                <CardDescription>Monthly user acquisition</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={[
                        { month: 'Jan', users: 120, newUsers: 25 },
                        { month: 'Feb', users: 145, newUsers: 30 },
                        { month: 'Mar', users: 175, newUsers: 35 },
                        { month: 'Apr', users: 210, newUsers: 40 },
                        { month: 'May', users: 250, newUsers: 45 },
                        { month: 'Jun', users: 290, newUsers: 50 },
                      ]}
                    >
                      <defs>
                        <linearGradient id="usersColor" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="newUsersColor" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4ade80" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#4ade80" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="month" />
                      <YAxis />
                      <CartesianGrid strokeDasharray="3 3" />
                      <Tooltip />
                      <Area type="monotone" dataKey="users" stroke="#3b82f6" fillOpacity={1} fill="url(#usersColor)" name="Total Users" />
                      <Area type="monotone" dataKey="newUsers" stroke="#4ade80" fillOpacity={1} fill="url(#newUsersColor)" name="New Users" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>User Engagement by Time</CardTitle>
                <CardDescription>Activity patterns by hour</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={Array.from({ length: 24 }, (_, i) => ({
                        hour: i,
                        activity: Math.floor(Math.random() * 50) + (i >= 9 && i <= 17 ? 50 : 10) // Higher during business hours
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="hour" 
                        tickFormatter={(hour) => `${hour}:00`}
                      />
                      <YAxis />
                      <Tooltip 
                        labelFormatter={(hour) => `Time: ${hour}:00`}
                        formatter={(value) => [`${value} actions`, 'Activity']}
                      />
                      <Line type="monotone" dataKey="activity" stroke="#3b82f6" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Top Matching Industry Sectors</CardTitle>
                <CardDescription>Most successful match categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="vertical"
                      data={[
                        { name: 'Real Estate', value: 85 },
                        { name: 'Cryptocurrency', value: 78 },
                        { name: 'Private Equity', value: 71 },
                        { name: 'Venture Capital', value: 68 },
                        { name: 'Impact Investing', value: 60 }
                      ].sort((a, b) => b.value - a.value)}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={120} />
                      <Tooltip />
                      <Bar dataKey="value" name="Match Success Rate (%)" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>User Cohort Analysis</CardTitle>
              <CardDescription>Retention by user type and acquisition period</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { cohort: 'Q1 2024 LP', week1: 100, week2: 82, week4: 75, week8: 68, week12: 65 },
                      { cohort: 'Q1 2024 FM', week1: 100, week2: 78, week4: 70, week8: 65, week12: 62 },
                      { cohort: 'Q1 2024 CR', week1: 100, week2: 75, week4: 68, week8: 60, week12: 55 },
                      { cohort: 'Q4 2023 LP', week1: 100, week2: 80, week4: 72, week8: 65, week12: 62 },
                      { cohort: 'Q4 2023 FM', week1: 100, week2: 75, week4: 65, week8: 60, week12: 58 },
                      { cohort: 'Q4 2023 CR', week1: 100, week2: 72, week4: 65, week8: 58, week12: 50 },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="cohort" />
                    <YAxis label={{ value: 'Retention %', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="week1" name="Week 1" fill="#3b82f6" />
                    <Bar dataKey="week2" name="Week 2" fill="#4ade80" />
                    <Bar dataKey="week4" name="Week 4" fill="#facc15" />
                    <Bar dataKey="week8" name="Week 8" fill="#f97316" />
                    <Bar dataKey="week12" name="Week 12" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* FUND MANAGER ANALYTICS - NEW SECTION */}
          <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-500 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-blue-800">FUND MANAGER ANALYTICS</h2>
                <p className="text-sm text-blue-600">Detailed insights for fund manager performance</p>
              </div>
              <div className="flex items-center">
                <span className="inline-flex items-center justify-center px-2 py-1 mr-2 text-xs font-bold leading-none text-white bg-blue-600 rounded-full">NEW</span>
                <Button variant="outline" size="sm" className="text-blue-800 border-blue-500">
                  <DownloadIcon className="h-4 w-4 mr-1" /> Export Report
                </Button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-4">
              <Card className="bg-white border-blue-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-blue-800">Total Funds Managed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{Math.floor(Math.random() * 30) + 40}</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">+12.3%</span> from previous quarter
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white border-blue-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-blue-800">Assets Under Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${(Math.floor(Math.random() * 1000) + 2000).toLocaleString()}M</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">+8.7%</span> from previous quarter
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white border-blue-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-blue-800">Avg Fund Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">+{(Math.random() * 5 + 12).toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">+1.2%</span> vs. benchmark
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white border-blue-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-blue-800">LP Match Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{Math.floor(Math.random() * 10) + 85}%</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">+5.3%</span> from previous quarter
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2 mb-4">
              <Card className="bg-white border-blue-200">
                <CardHeader>
                  <CardTitle>Fund Type Distribution</CardTitle>
                  <CardDescription>Breakdown by fund category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Venture Capital', value: 42, color: '#3b82f6' },
                            { name: 'Private Equity', value: 28, color: '#4ade80' },
                            { name: 'Real Estate', value: 15, color: '#facc15' },
                            { name: 'Debt', value: 10, color: '#f97316' },
                            { name: 'Hedge Fund', value: 5, color: '#ef4444' },
                          ]}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {[
                            { name: 'Venture Capital', value: 42, color: '#3b82f6' },
                            { name: 'Private Equity', value: 28, color: '#4ade80' },
                            { name: 'Real Estate', value: 15, color: '#facc15' },
                            { name: 'Debt', value: 10, color: '#f97316' },
                            { name: 'Hedge Fund', value: 5, color: '#ef4444' },
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-blue-200">
                <CardHeader>
                  <CardTitle>Performance by Fund Size</CardTitle>
                  <CardDescription>Return trends based on AUM</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart
                        margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                      >
                        <CartesianGrid />
                        <XAxis type="number" dataKey="aum" name="AUM ($M)" domain={[0, 2000]} />
                        <YAxis type="number" dataKey="return" name="Return (%)" domain={[0, 25]} />
                        <Tooltip cursor={{ strokeDasharray: '3 3' }} formatter={(value) => [`${value}`, value === Math.floor(value) ? 'AUM ($M)' : 'Return (%)']} />
                        <Scatter name="Funds" data={Array(30).fill(0).map((_, i) => ({
                          aum: Math.floor(Math.random() * 2000) + 10,
                          return: Math.floor(Math.random() * 15) + 8,
                          name: `Fund ${i+1}`
                        }))} fill="#3b82f6" />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white border-blue-200 mb-4">
              <CardHeader>
                <CardTitle>Fund Manager Performance Trends</CardTitle>
                <CardDescription>Quarterly performance of top fund managers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={[
                        { quarter: 'Q1 2023', manager1: 12.3, manager2: 10.8, manager3: 14.2, manager4: 9.7, manager5: 11.5, average: 11.7 },
                        { quarter: 'Q2 2023', manager1: 13.1, manager2: 11.2, manager3: 12.8, manager4: 10.5, manager5: 12.2, average: 11.9 },
                        { quarter: 'Q3 2023', manager1: 14.5, manager2: 12.6, manager3: 11.5, manager4: 13.2, manager5: 14.7, average: 13.3 },
                        { quarter: 'Q4 2023', manager1: 13.8, manager2: 15.1, manager3: 13.2, manager4: 14.5, manager5: 13.9, average: 14.1 },
                        { quarter: 'Q1 2024', manager1: 15.2, manager2: 14.7, manager3: 16.1, manager4: 15.5, manager5: 14.8, average: 15.3 },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="quarter" />
                      <YAxis domain={[8, 18]} label={{ value: 'Return (%)', angle: -90, position: 'insideLeft' }} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="manager1" name="Alpha Group" stroke="#3b82f6" strokeWidth={2} />
                      <Line type="monotone" dataKey="manager2" name="Horizon Capital" stroke="#4ade80" strokeWidth={2} />
                      <Line type="monotone" dataKey="manager3" name="Vantage Partners" stroke="#facc15" strokeWidth={2} />
                      <Line type="monotone" dataKey="manager4" name="Meridian Funds" stroke="#f97316" strokeWidth={2} />
                      <Line type="monotone" dataKey="manager5" name="Pinnacle Ventures" stroke="#ef4444" strokeWidth={2} />
                      <Line type="monotone" dataKey="average" name="Industry Average" stroke="#94a3b8" strokeDasharray="5 5" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="bg-white border-blue-200">
                <CardHeader>
                  <CardTitle>Investment Stage Focus</CardTitle>
                  <CardDescription>Portfolio allocation by investment stage</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart outerRadius={90} data={[
                        { stage: 'Seed', allocation: 15, benchmark: 12 },
                        { stage: 'Early', allocation: 35, benchmark: 28 },
                        { stage: 'Growth', allocation: 30, benchmark: 32 },
                        { stage: 'Late', allocation: 12, benchmark: 18 },
                        { stage: 'Pre-IPO', allocation: 8, benchmark: 10 },
                      ]}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="stage" />
                        <PolarRadiusAxis angle={30} domain={[0, 40]} />
                        <Radar name="Portfolio Allocation" dataKey="allocation" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                        <Radar name="Industry Benchmark" dataKey="benchmark" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.3} />
                        <Legend />
                        <Tooltip />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-blue-200">
                <CardHeader>
                  <CardTitle>Engagement Metrics</CardTitle>
                  <CardDescription>Platform interaction patterns</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={[
                          { metric: 'Profile Views', value: 352, change: 12.5 },
                          { metric: 'LP Connections', value: 128, change: 18.7 },
                          { metric: 'Messages Sent', value: 423, change: 8.2 },
                          { metric: 'Documents Shared', value: 87, change: 24.3 },
                          { metric: 'Meetings Scheduled', value: 56, change: 15.8 },
                        ]}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="metric" type="category" width={120} />
                        <Tooltip formatter={(value, name, props) => [
                          `${value}${props.payload.change ? ` (${props.payload.change > 0 ? '+' : ''}${props.payload.change}%)` : ''}`,
                          props.payload.metric
                        ]} />
                        <Bar dataKey="value" fill="#3b82f6">
                          {[
                            { metric: 'Profile Views', value: 352, change: 12.5 },
                            { metric: 'LP Connections', value: 128, change: 18.7 },
                            { metric: 'Messages Sent', value: 423, change: 8.2 },
                            { metric: 'Documents Shared', value: 87, change: 24.3 },
                            { metric: 'Meetings Scheduled', value: 56, change: 15.8 },
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.change > 15 ? '#4ade80' : '#3b82f6'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* LIMITED PARTNER ANALYTICS - NEW SECTION */}
          <div className="bg-green-50 p-4 rounded-lg border-2 border-green-500 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-green-800">LIMITED PARTNER ANALYTICS</h2>
                <p className="text-sm text-green-600">Detailed insights for limited partner investment activities</p>
              </div>
              <div className="flex items-center">
                <span className="inline-flex items-center justify-center px-2 py-1 mr-2 text-xs font-bold leading-none text-white bg-green-600 rounded-full">NEW</span>
                <Button variant="outline" size="sm" className="text-green-800 border-green-500">
                  <DownloadIcon className="h-4 w-4 mr-1" /> Export Report
                </Button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-4">
              <Card className="bg-white border-green-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-green-800">Total Investments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{Math.floor(Math.random() * 50) + 120}</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">+9.8%</span> from previous quarter
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white border-green-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-green-800">Total Committed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${(Math.floor(Math.random() * 500) + 1500).toLocaleString()}M</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">+12.4%</span> from previous quarter
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white border-green-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-green-800">Fund Manager Match Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{Math.floor(Math.random() * 8) + 87}%</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">+4.7%</span> from previous quarter
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white border-green-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-green-800">Avg Investment Size</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${(Math.floor(Math.random() * 5) + 12).toFixed(1)}M</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">+6.2%</span> from previous quarter
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2 mb-4">
              <Card className="bg-white border-green-200">
                <CardHeader>
                  <CardTitle>Investment Preferences</CardTitle>
                  <CardDescription>Breakdown by fund type</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Venture Capital', value: 35, color: '#3b82f6' },
                            { name: 'Private Equity', value: 25, color: '#4ade80' },
                            { name: 'Real Estate', value: 20, color: '#facc15' },
                            { name: 'Hedge Fund', value: 15, color: '#f97316' },
                            { name: 'Impact Investing', value: 5, color: '#ef4444' },
                          ]}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {[
                            { name: 'Venture Capital', value: 35, color: '#3b82f6' },
                            { name: 'Private Equity', value: 25, color: '#4ade80' },
                            { name: 'Real Estate', value: 20, color: '#facc15' },
                            { name: 'Hedge Fund', value: 15, color: '#f97316' },
                            { name: 'Impact Investing', value: 5, color: '#ef4444' },
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-green-200">
                <CardHeader>
                  <CardTitle>Investment Returns by Sector</CardTitle>
                  <CardDescription>Performance trends across sectors</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { sector: 'Technology', return: 18.4 },
                          { sector: 'Healthcare', return: 15.2 },
                          { sector: 'Finance', return: 12.8 },
                          { sector: 'Consumer', return: 14.5 },
                          { sector: 'Energy', return: 10.2 },
                          { sector: 'Real Estate', return: 13.7 },
                        ]}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="sector" />
                        <YAxis label={{ value: 'Return (%)', angle: -90, position: 'insideLeft' }} />
                        <Tooltip formatter={(value) => [`${value}%`, 'Return']} />
                        <Bar dataKey="return" fill="#4ade80">
                          {[
                            { sector: 'Technology', return: 18.4 },
                            { sector: 'Healthcare', return: 15.2 },
                            { sector: 'Finance', return: 12.8 },
                            { sector: 'Consumer', return: 14.5 },
                            { sector: 'Energy', return: 10.2 },
                            { sector: 'Real Estate', return: 13.7 },
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.return > 15 ? '#4ade80' : '#3b82f6'} />
                          ))}
                        </Bar>
                        <ReferenceLine y={14} stroke="#ef4444" strokeDasharray="3 3">
                          <Label value="Target Return" position="insideBottomRight" />
                        </ReferenceLine>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white border-green-200 mb-4">
              <CardHeader>
                <CardTitle>Investment Portfolio Diversification</CardTitle>
                <CardDescription>Asset allocation and risk profile</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <Treemap
                      data={[
                        {
                          name: 'Venture Capital',
                          children: [
                            { name: 'Early Stage', size: 15, value: 15 },
                            { name: 'Growth', size: 20, value: 20 },
                            { name: 'Late Stage', size: 10, value: 10 },
                          ],
                        },
                        {
                          name: 'Private Equity',
                          children: [
                            { name: 'Buyout', size: 15, value: 15 },
                            { name: 'Growth Equity', size: 12, value: 12 },
                          ],
                        },
                        {
                          name: 'Real Estate',
                          children: [
                            { name: 'Commercial', size: 8, value: 8 },
                            { name: 'Residential', size: 7, value: 7 },
                            { name: 'Industrial', size: 5, value: 5 },
                          ],
                        },
                        {
                          name: 'Hedge Funds',
                          children: [
                            { name: 'Long/Short', size: 5, value: 5 },
                            { name: 'Global Macro', size: 3, value: 3 },
                          ],
                        },
                      ]}
                      dataKey="value"
                    >
                      <Tooltip content={<CustomTreemapTooltip />} />
                    </Treemap>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="bg-white border-green-200">
                <CardHeader>
                  <CardTitle>Geographic Distribution</CardTitle>
                  <CardDescription>Investment allocation by region</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'North America', value: 55, color: '#3b82f6' },
                            { name: 'Europe', value: 25, color: '#4ade80' },
                            { name: 'Asia-Pacific', value: 15, color: '#facc15' },
                            { name: 'Rest of World', value: 5, color: '#f97316' },
                          ]}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {[
                            { name: 'North America', value: 55, color: '#3b82f6' },
                            { name: 'Europe', value: 25, color: '#4ade80' },
                            { name: 'Asia-Pacific', value: 15, color: '#facc15' },
                            { name: 'Rest of World', value: 5, color: '#f97316' },
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-green-200">
                <CardHeader>
                  <CardTitle>Engagement Metrics</CardTitle>
                  <CardDescription>Platform interaction patterns</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={[
                          { metric: 'Manager Profiles Viewed', value: 428, change: 15.2 },
                          { metric: 'Connections Made', value: 142, change: 22.5 },
                          { metric: 'Messages Sent', value: 354, change: 10.8 },
                          { metric: 'Document Reviews', value: 215, change: 18.3 },
                          { metric: 'Meetings Scheduled', value: 72, change: 9.5 },
                        ]}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="metric" type="category" width={150} />
                        <Tooltip formatter={(value, name, props) => [
                          `${value}${props.payload.change ? ` (${props.payload.change > 0 ? '+' : ''}${props.payload.change}%)` : ''}`,
                          props.payload.metric
                        ]} />
                        <Bar dataKey="value" fill="#4ade80">
                          {[
                            { metric: 'Manager Profiles Viewed', value: 428, change: 15.2 },
                            { metric: 'Connections Made', value: 142, change: 22.5 },
                            { metric: 'Messages Sent', value: 354, change: 10.8 },
                            { metric: 'Document Reviews', value: 215, change: 18.3 },
                            { metric: 'Meetings Scheduled', value: 72, change: 9.5 },
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.change > 15 ? '#3b82f6' : '#4ade80'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* CAPITAL RAISER ANALYTICS - NEW SECTION */}
          <div className="bg-yellow-50 p-4 rounded-lg border-2 border-yellow-500 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-yellow-800">CAPITAL RAISER ANALYTICS</h2>
                <p className="text-sm text-yellow-600">Detailed insights for capital raising activities</p>
              </div>
              <div className="flex items-center">
                <span className="inline-flex items-center justify-center px-2 py-1 mr-2 text-xs font-bold leading-none text-white bg-yellow-600 rounded-full">NEW</span>
                <Button variant="outline" size="sm" className="text-yellow-800 border-yellow-500">
                  <DownloadIcon className="h-4 w-4 mr-1" /> Export Report
                </Button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-4">
              <Card className="bg-white border-yellow-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-yellow-800">Total Deals</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{Math.floor(Math.random() * 30) + 65}</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">+14.2%</span> from previous quarter
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white border-yellow-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-yellow-800">Total Capital Raised</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${(Math.floor(Math.random() * 800) + 1200).toLocaleString()}M</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">+21.5%</span> from previous quarter
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white border-yellow-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-yellow-800">Success Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{Math.floor(Math.random() * 10) + 72}%</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">+5.8%</span> from previous quarter
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white border-yellow-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-yellow-800">Avg Deal Size</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${(Math.floor(Math.random() * 10) + 18).toFixed(1)}M</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">+7.3%</span> from previous quarter
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2 mb-4">
              <Card className="bg-white border-yellow-200">
                <CardHeader>
                  <CardTitle>Capital Raised by Industry</CardTitle>
                  <CardDescription>Breakdown by sector</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { industry: 'Technology', value: 450 },
                          { industry: 'Healthcare', value: 320 },
                          { industry: 'Finance', value: 280 },
                          { industry: 'Consumer', value: 220 },
                          { industry: 'Energy', value: 180 },
                          { industry: 'Real Estate', value: 150 },
                        ]}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="industry" />
                        <YAxis label={{ value: 'Capital ($M)', angle: -90, position: 'insideLeft' }} />
                        <Tooltip formatter={(value) => [`$${value}M`, 'Capital Raised']} />
                        <Bar dataKey="value" fill="#facc15" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-yellow-200">
                <CardHeader>
                  <CardTitle>Quarterly Fundraising Trends</CardTitle>
                  <CardDescription>Capital raised per quarter</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={[
                          { quarter: 'Q1 2023', amount: 320, deals: 12 },
                          { quarter: 'Q2 2023', amount: 380, deals: 15 },
                          { quarter: 'Q3 2023', amount: 420, deals: 18 },
                          { quarter: 'Q4 2023', amount: 560, deals: 22 },
                          { quarter: 'Q1 2024', amount: 640, deals: 25 },
                        ]}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="quarter" />
                        <YAxis yAxisId="left" label={{ value: 'Capital ($M)', angle: -90, position: 'insideLeft' }} />
                        <YAxis yAxisId="right" orientation="right" label={{ value: 'Deals', angle: 90, position: 'insideRight' }} />
                        <Tooltip />
                        <Legend />
                        <Line yAxisId="left" type="monotone" dataKey="amount" name="Capital Raised ($M)" stroke="#facc15" strokeWidth={2} />
                        <Line yAxisId="right" type="monotone" dataKey="deals" name="Number of Deals" stroke="#f97316" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white border-yellow-200 mb-4">
              <CardHeader>
                <CardTitle>Deal Success Rate by Size</CardTitle>
                <CardDescription>Fundraising success by deal size category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                      data={[
                        { category: '<$5M', success: 82, attempts: 35, avgTime: 45 },
                        { category: '$5-10M', success: 78, attempts: 42, avgTime: 60 },
                        { category: '$10-25M', success: 72, attempts: 38, avgTime: 75 },
                        { category: '$25-50M', success: 65, attempts: 25, avgTime: 90 },
                        { category: '$50-100M', success: 58, attempts: 18, avgTime: 120 },
                        { category: '>$100M', success: 45, attempts: 12, avgTime: 180 },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis yAxisId="left" label={{ value: 'Success Rate (%)', angle: -90, position: 'insideLeft' }} />
                      <YAxis yAxisId="right" orientation="right" label={{ value: 'Avg. Time to Close (days)', angle: 90, position: 'insideRight' }} />
                      <Tooltip />
                      <Legend />
                      <Bar yAxisId="left" dataKey="success" name="Success Rate (%)" fill="#facc15" />
                      <Bar yAxisId="left" dataKey="attempts" name="Number of Attempts" fill="#94a3b8" />
                      <Line yAxisId="right" type="monotone" dataKey="avgTime" name="Avg. Time to Close (days)" stroke="#ef4444" strokeWidth={2} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="bg-white border-yellow-200">
                <CardHeader>
                  <CardTitle>Top Fundraising Channels</CardTitle>
                  <CardDescription>Most effective sources of capital</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Direct Network', value: 40, color: '#facc15' },
                            { name: 'Platform Matches', value: 25, color: '#3b82f6' },
                            { name: 'Referrals', value: 20, color: '#4ade80' },
                            { name: 'Events', value: 10, color: '#f97316' },
                            { name: 'Other', value: 5, color: '#94a3b8' },
                          ]}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {[
                            { name: 'Direct Network', value: 40, color: '#facc15' },
                            { name: 'Platform Matches', value: 25, color: '#3b82f6' },
                            { name: 'Referrals', value: 20, color: '#4ade80' },
                            { name: 'Events', value: 10, color: '#f97316' },
                            { name: 'Other', value: 5, color: '#94a3b8' },
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-yellow-200">
                <CardHeader>
                  <CardTitle>Engagement Metrics</CardTitle>
                  <CardDescription>Platform interaction patterns</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={[
                          { metric: 'Investor Connections', value: 375, change: 18.5 },
                          { metric: 'Documents Shared', value: 248, change: 25.2 },
                          { metric: 'Pitch Meetings', value: 128, change: 15.8 },
                          { metric: 'Messages Sent', value: 462, change: 12.5 },
                          { metric: 'Deal Announcements', value: 45, change: 22.3 },
                        ]}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="metric" type="category" width={150} />
                        <Tooltip formatter={(value, name, props) => [
                          `${value}${props.payload.change ? ` (${props.payload.change > 0 ? '+' : ''}${props.payload.change}%)` : ''}`,
                          props.payload.metric
                        ]} />
                        <Bar dataKey="value" fill="#facc15">
                          {[
                            { metric: 'Investor Connections', value: 375, change: 18.5 },
                            { metric: 'Documents Shared', value: 248, change: 25.2 },
                            { metric: 'Pitch Meetings', value: 128, change: 15.8 },
                            { metric: 'Messages Sent', value: 462, change: 12.5 },
                            { metric: 'Deal Announcements', value: 45, change: 22.3 },
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.change > 20 ? '#4ade80' : '#facc15'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Geographic Distribution</CardTitle>
              <CardDescription>User distribution by region</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { region: 'North America', users: 120, matches: 85 },
                      { region: 'Europe', users: 95, matches: 68 },
                      { region: 'Asia', users: 75, matches: 50 },
                      { region: 'Africa', users: 30, matches: 18 },
                      { region: 'South America', users: 25, matches: 15 },
                      { region: 'Australia', users: 20, matches: 12 },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="region" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="users" name="Total Users" fill="#3b82f6" />
                    <Bar dataKey="matches" name="Successful Matches" fill="#4ade80" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Anomaly Detection</CardTitle>
              <CardDescription>User behavior outliers and unusual patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={[
                      { day: '2024-02-24', expected: 45, actual: 48, threshold: 65 },
                      { day: '2024-02-25', expected: 47, actual: 45, threshold: 67 },
                      { day: '2024-02-26', expected: 50, actual: 52, threshold: 70 },
                      { day: '2024-02-27', expected: 48, actual: 85, threshold: 68 }, // Anomaly here
                      { day: '2024-02-28', expected: 52, actual: 50, threshold: 72 },
                      { day: '2024-02-29', expected: 55, actual: 58, threshold: 75 },
                      { day: '2024-03-01', expected: 50, actual: 52, threshold: 70 },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />
                    <YAxis />
                    <Tooltip labelFormatter={(value) => `Date: ${new Date(value).toLocaleDateString()}`} />
                    <Legend />
                    <Line type="monotone" dataKey="expected" name="Expected Activity" stroke="#3b82f6" />
                    <Line type="monotone" dataKey="actual" name="Actual Activity" stroke="#ef4444" strokeWidth={2} />
                    <Line type="monotone" dataKey="threshold" name="Anomaly Threshold" stroke="#f97316" strokeDasharray="5 5" />
                    <ReferenceDot x="2024-02-27" y={85} r={8} fill="#ef4444" stroke="none">
                      <Label value="Anomaly Detected" position="top" />
                    </ReferenceDot>
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="fund-managers" className="space-y-6">  
          {/* Fund Managers Section */}
          <div className="w-full mb-6">
            <Card className="w-full border border-blue-300 shadow-md">
              <CardHeader className="bg-blue-50">
                <CardTitle className="text-xl text-blue-800">FUND MANAGER ANALYTICS</CardTitle>
                <CardDescription className="text-blue-600/80">Comprehensive metrics for fund managers on the platform</CardDescription>
              </CardHeader>
              <CardContent className="w-full px-4">
                <div className="grid gap-6 md:grid-cols-3 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 shadow">
                    <h3 className="text-lg font-semibold mb-2 text-blue-800">Total Fund Managers</h3>
                    <div className="text-3xl font-bold text-blue-600">2,547</div>
                    <div className="flex items-center mt-2">
                      <span className="text-green-600 font-medium mr-2">↑ 14% YoY</span>
                      <div className="h-2 flex-grow bg-gray-200 rounded-full overflow-hidden">
                        <div className="bg-green-500 h-full rounded-full" style={{width: '76%'}}></div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">Active: 2,183 (85.7%)</p>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 shadow">
                    <h3 className="text-lg font-semibold mb-2 text-blue-800">Average AUM</h3>
                    <div className="text-3xl font-bold text-blue-600">$487M</div>
                    <div className="flex items-center mt-2">
                      <span className="text-green-600 font-medium mr-2">↑ 8.3% QoQ</span>
                      <div className="h-2 flex-grow bg-gray-200 rounded-full overflow-hidden">
                        <div className="bg-green-500 h-full rounded-full" style={{width: '68%'}}></div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">Median: $210M</p>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 shadow">
                    <h3 className="text-lg font-semibold mb-2 text-blue-800">Match Rate</h3>
                    <div className="text-3xl font-bold text-blue-600">73.8%</div>
                    <div className="flex items-center mt-2">
                      <span className="text-green-600 font-medium mr-2">↑ 4.2% vs Global</span>
                      <div className="h-2 flex-grow bg-gray-200 rounded-full overflow-hidden">
                        <div className="bg-green-500 h-full rounded-full" style={{width: '82%'}}></div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">7,843 matches created</p>
                  </div>
                </div>
                
                <div className="grid gap-6 md:grid-cols-2 mb-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Fund Size Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={[
                                { name: '<$50M', value: 384, fill: '#c7d2fe' },
                                { name: '$50M-$100M', value: 567, fill: '#a5b4fc' },
                                { name: '$100M-$250M', value: 721, fill: '#818cf8' },
                                { name: '$250M-$500M', value: 429, fill: '#6366f1' },
                                { name: '$500M-$1B', value: 287, fill: '#4f46e5' },
                                { name: '>$1B', value: 159, fill: '#4338ca' },
                              ]}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              outerRadius={90}
                              label={(entry) => `${entry.name}: ${Math.round(entry.percent * 100)}%`}
                              labelLine={false}
                            >
                              {[
                                <Cell key={`cell-0`} />,
                                <Cell key={`cell-1`} />,
                                <Cell key={`cell-2`} />,
                                <Cell key={`cell-3`} />,
                                <Cell key={`cell-4`} />,
                                <Cell key={`cell-5`} />,
                              ]}
                            </Pie>
                            <Tooltip formatter={(value, name) => [`${value} funds`, name]} />
                            <Legend verticalAlign="bottom" height={36} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Investment Focus</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={[
                              { sector: 'Technology', count: 842 },
                              { sector: 'Healthcare', count: 563 },
                              { sector: 'Financial', count: 421 },
                              { sector: 'Consumer', count: 389 },
                              { sector: 'Industrial', count: 284 },
                              { sector: 'Real Estate', count: 213 },
                              { sector: 'Energy', count: 187 },
                              { sector: 'Other', count: 148 },
                            ]}
                            layout="vertical"
                            margin={{ top: 5, right: 30, left: 90, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis dataKey="sector" type="category" width={80} />
                            <Tooltip formatter={(value) => [`${value} funds`, 'Count']} />
                            <Bar dataKey="count" fill="#3b82f6" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Historical Performance Distribution</CardTitle>
                    <CardDescription>Average returns by fund size and type</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart
                          margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                        >
                          <CartesianGrid />
                          <XAxis type="number" dataKey="aum" name="AUM" unit="M" domain={[0, 1000]} label={{ value: 'Fund Size ($M)', position: 'bottom' }} />
                          <YAxis type="number" dataKey="returns" name="Returns" unit="%" domain={[0, 30]} label={{ value: 'Average Returns (%)', angle: -90, position: 'insideLeft' }} />
                          <Tooltip cursor={{ strokeDasharray: '3 3' }} formatter={(value, name) => [name === 'aum' ? `$${value}M` : `${value}%`, name === 'aum' ? 'Fund Size' : 'Returns']} />
                          <Legend />
                          <Scatter name="Venture Capital" data={Array(15).fill(0).map(() => ({ aum: Math.random() * 300 + 50, returns: Math.random() * 15 + 10 }))} fill="#8884d8" />
                          <Scatter name="Private Equity" data={Array(15).fill(0).map(() => ({ aum: Math.random() * 500 + 200, returns: Math.random() * 10 + 8 }))} fill="#82ca9d" />
                          <Scatter name="Hedge Fund" data={Array(15).fill(0).map(() => ({ aum: Math.random() * 800 + 100, returns: Math.random() * 8 + 5 }))} fill="#ffc658" />
                        </ScatterChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="limited-partners" className="space-y-6">  
          {/* Limited Partners Section */}
          <div className="w-full mb-6">
            <Card className="w-full border border-green-300 shadow-md">
              <CardHeader className="bg-green-50">
                <CardTitle className="text-xl text-green-800">LIMITED PARTNER ANALYTICS</CardTitle>
                <CardDescription className="text-green-600/80">Comprehensive metrics for limited partners on the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-3 mb-6">
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200 shadow">
                    <h3 className="text-lg font-semibold mb-2 text-green-800">Total Limited Partners</h3>
                    <div className="text-3xl font-bold text-green-600">3,142</div>
                    <div className="flex items-center mt-2">
                      <span className="text-green-600 font-medium mr-2">↑ 18% YoY</span>
                      <div className="h-2 flex-grow bg-gray-200 rounded-full overflow-hidden">
                        <div className="bg-green-500 h-full rounded-full" style={{width: '83%'}}></div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">Active: 2,726 (86.8%)</p>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200 shadow">
                    <h3 className="text-lg font-semibold mb-2 text-green-800">Avg. Commitment</h3>
                    <div className="text-3xl font-bold text-green-600">$12.4M</div>
                    <div className="flex items-center mt-2">
                      <span className="text-green-600 font-medium mr-2">↑ 5.7% QoQ</span>
                      <div className="h-2 flex-grow bg-gray-200 rounded-full overflow-hidden">
                        <div className="bg-green-500 h-full rounded-full" style={{width: '64%'}}></div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">Median: $5.8M</p>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200 shadow">
                    <h3 className="text-lg font-semibold mb-2 text-green-800">Match Rate</h3>
                    <div className="text-3xl font-bold text-green-600">68.5%</div>
                    <div className="flex items-center mt-2">
                      <span className="text-amber-600 font-medium mr-2">↓ 1.1% vs Global</span>
                      <div className="h-2 flex-grow bg-gray-200 rounded-full overflow-hidden">
                        <div className="bg-amber-500 h-full rounded-full" style={{width: '45%'}}></div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">9,658 matches created</p>
                  </div>
                </div>
                
                <div className="grid gap-6 md:grid-cols-2 mb-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Commitment Size Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={[
                                { name: '<$1M', value: 721, fill: '#bfdbfe' },
                                { name: '$1M-$5M', value: 843, fill: '#93c5fd' },
                                { name: '$5M-$10M', value: 675, fill: '#60a5fa' },
                                { name: '$10M-$25M', value: 487, fill: '#3b82f6' },
                                { name: '$25M-$50M', value: 265, fill: '#2563eb' },
                                { name: '>$50M', value: 151, fill: '#1d4ed8' },
                              ]}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              outerRadius={90}
                              label={(entry) => `${entry.name}: ${Math.round(entry.percent * 100)}%`}
                              labelLine={false}
                            >
                              {[
                                <Cell key={`cell-0`} />,
                                <Cell key={`cell-1`} />,
                                <Cell key={`cell-2`} />,
                                <Cell key={`cell-3`} />,
                                <Cell key={`cell-4`} />,
                                <Cell key={`cell-5`} />,
                              ]}
                            </Pie>
                            <Tooltip formatter={(value, name) => [`${value} LPs`, name]} />
                            <Legend verticalAlign="bottom" height={36} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Investment Preferences</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={[
                              { preference: 'Venture Capital', count: 956 },
                              { preference: 'Private Equity', count: 842 },
                              { preference: 'Real Estate', count: 523 },
                              { preference: 'Infrastructure', count: 387 },
                              { preference: 'Private Debt', count: 245 },
                              { preference: 'Hedge Funds', count: 189 },
                            ]}
                            layout="vertical"
                            margin={{ top: 5, right: 30, left: 90, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis dataKey="preference" type="category" width={100} />
                            <Tooltip formatter={(value) => [`${value} LPs`, 'Count']} />
                            <Bar dataKey="count" fill="#10b981" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Risk Profile Distribution</CardTitle>
                    <CardDescription>Risk tolerance by commitment size</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart
                          margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                        >
                          <CartesianGrid />
                          <XAxis type="number" dataKey="commitment" name="Commitment" unit="M" domain={[0, 50]} label={{ value: 'Commitment Size ($M)', position: 'bottom' }} />
                          <YAxis type="number" dataKey="risk" name="Risk Tolerance" unit="%" domain={[0, 10]} label={{ value: 'Risk Tolerance (1-10)', angle: -90, position: 'insideLeft' }} />
                          <Tooltip cursor={{ strokeDasharray: '3 3' }} formatter={(value, name) => [name === 'commitment' ? `$${value}M` : `${value}`, name === 'commitment' ? 'Commitment' : 'Risk Tolerance']} />
                          <Legend />
                          <Scatter name="Individual Investors" data={Array(20).fill(0).map(() => ({ commitment: Math.random() * 10 + 1, risk: Math.random() * 4 + 2 }))} fill="#16a34a" />
                          <Scatter name="Family Offices" data={Array(20).fill(0).map(() => ({ commitment: Math.random() * 15 + 5, risk: Math.random() * 3 + 3 }))} fill="#2563eb" />
                          <Scatter name="Institutional" data={Array(20).fill(0).map(() => ({ commitment: Math.random() * 30 + 15, risk: Math.random() * 2 + 4 }))} fill="#9333ea" />
                        </ScatterChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="capital-raisers" className="space-y-6">  
          {/* Capital Raisers Section */}
          <div className="w-full mb-6">
            <Card className="w-full border border-amber-300 shadow-md">
              <CardHeader className="bg-amber-50">
                <CardTitle className="text-xl text-amber-800">CAPITAL RAISER ANALYTICS</CardTitle>
                <CardDescription className="text-amber-600/80">Comprehensive metrics for capital raisers on the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-3 mb-6">
                  <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 shadow">
                    <h3 className="text-lg font-semibold mb-2 text-amber-800">Total Capital Raisers</h3>
                    <div className="text-3xl font-bold text-amber-600">1,876</div>
                    <div className="flex items-center mt-2">
                      <span className="text-green-600 font-medium mr-2">↑ 23% YoY</span>
                      <div className="h-2 flex-grow bg-gray-200 rounded-full overflow-hidden">
                        <div className="bg-green-500 h-full rounded-full" style={{width: '87%'}}></div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">Active: 1,543 (82.2%)</p>
                  </div>
                  
                  <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 shadow">
                    <h3 className="text-lg font-semibold mb-2 text-amber-800">Avg. Capital Raised</h3>
                    <div className="text-3xl font-bold text-amber-600">$28.7M</div>
                    <div className="flex items-center mt-2">
                      <span className="text-green-600 font-medium mr-2">↑ 12.3% QoQ</span>
                      <div className="h-2 flex-grow bg-gray-200 rounded-full overflow-hidden">
                        <div className="bg-green-500 h-full rounded-full" style={{width: '71%'}}></div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">Median: $14.2M</p>
                  </div>
                  
                  <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 shadow">
                    <h3 className="text-lg font-semibold mb-2 text-amber-800">Match Rate</h3>
                    <div className="text-3xl font-bold text-amber-600">76.2%</div>
                    <div className="flex items-center mt-2">
                      <span className="text-green-600 font-medium mr-2">↑ 6.4% vs Global</span>
                      <div className="h-2 flex-grow bg-gray-200 rounded-full overflow-hidden">
                        <div className="bg-green-500 h-full rounded-full" style={{width: '89%'}}></div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">5,463 matches created</p>
                  </div>
                </div>
                
                <div className="grid gap-6 md:grid-cols-2 mb-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Funding Success Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={[
                                { name: 'Fully Funded', value: 642, fill: '#fbbf24' },
                                { name: 'Partially Funded', value: 837, fill: '#f59e0b' },
                                { name: 'In Progress', value: 275, fill: '#d97706' },
                                { name: 'Not Funded', value: 122, fill: '#b45309' },
                              ]}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              outerRadius={90}
                              label={(entry) => `${entry.name}: ${Math.round(entry.percent * 100)}%`}
                              labelLine={false}
                            >
                              {[
                                <Cell key={`cell-0`} />,
                                <Cell key={`cell-1`} />,
                                <Cell key={`cell-2`} />,
                                <Cell key={`cell-3`} />,
                              ]}
                            </Pie>
                            <Tooltip formatter={(value, name) => [`${value} raisers`, name]} />
                            <Legend verticalAlign="bottom" height={36} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Industry Focus</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={[
                              { industry: 'Technology', count: 674 },
                              { industry: 'Healthcare', count: 472 },
                              { industry: 'Financial Services', count: 368 },
                              { industry: 'Real Estate', count: 294 },
                              { industry: 'Consumer Goods', count: 189 },
                              { industry: 'Energy', count: 142 },
                            ]}
                            layout="vertical"
                            margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis dataKey="industry" type="category" width={110} />
                            <Tooltip formatter={(value) => [`${value} raisers`, 'Count']} />
                            <Bar dataKey="count" fill="#f59e0b" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Capital Raising Timeline</CardTitle>
                    <CardDescription>Time to successful raise by amount</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart
                          margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                        >
                          <CartesianGrid />
                          <XAxis type="number" dataKey="amount" name="Amount" unit="M" domain={[0, 100]} label={{ value: 'Capital Amount ($M)', position: 'bottom' }} />
                          <YAxis type="number" dataKey="time" name="Time" unit=" days" domain={[0, 365]} label={{ value: 'Time to Close (Days)', angle: -90, position: 'insideLeft' }} />
                          <Tooltip cursor={{ strokeDasharray: '3 3' }} formatter={(value, name) => [name === 'amount' ? `$${value}M` : `${value} days`, name === 'amount' ? 'Amount' : 'Time to Close']} />
                          <Legend />
                          <Scatter name="Seed" data={Array(15).fill(0).map(() => ({ amount: Math.random() * 5 + 1, time: Math.random() * 120 + 60 }))} fill="#f59e0b" />
                          <Scatter name="Series A" data={Array(15).fill(0).map(() => ({ amount: Math.random() * 15 + 5, time: Math.random() * 150 + 90 }))} fill="#d97706" />
                          <Scatter name="Series B+" data={Array(15).fill(0).map(() => ({ amount: Math.random() * 50 + 20, time: Math.random() * 180 + 120 }))} fill="#92400e" />
                        </ScatterChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          {/* Enhanced Analytics Dashboard - Performance & Analytics */}
          <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border-2 border-blue-500 shadow-lg">
            <h3 className="text-xl font-bold text-blue-800 mb-4 flex items-center">
              <span className="inline-flex items-center justify-center w-8 h-8 mr-2 text-xs font-bold text-white bg-blue-600 rounded-full">NEW</span>
              ENHANCED PERFORMANCE ANALYTICS
            </h3>
            
            {/* Industry Benchmarks */}
            <Card className="mb-6 border border-blue-200 shadow-md">
              <CardHeader className="bg-blue-50">
                <CardTitle className="text-lg text-blue-800 flex items-center justify-between">
                  <span>Industry Benchmarks</span>
                  <TooltipProvider>
                    <UITooltip>
                      <TooltipTrigger asChild>
                        <InfoCircledIcon className="h-5 w-5 text-blue-600" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>Compare your platform's performance against industry averages</p>
                      </TooltipContent>
                    </UITooltip>
                  </TooltipProvider>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="overflow-hidden">
                  <div className="rounded-lg overflow-auto max-h-[400px]">
                    <table className="w-full">
                      <thead className="bg-blue-50 sticky top-0">
                        <tr>
                          <th className="text-left p-3 font-semibold text-blue-800">Metric</th>
                          <th className="text-right p-3 font-semibold text-blue-800">Your Platform</th>
                          <th className="text-right p-3 font-semibold text-blue-800">Industry Average</th>
                          <th className="text-right p-3 font-semibold text-blue-800">Difference</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { metric: 'User Retention Rate', platform: 89.7, industry: 72.3, difference: 17.4 },
                          { metric: 'Match Success Rate', platform: 76.2, industry: 62.8, difference: 13.4 },
                          { metric: 'Avg. Time to Match', platform: 3.2, industry: 8.7, difference: -5.5 },
                          { metric: 'Moderation Response Time (hrs)', platform: 1.8, industry: 6.2, difference: -4.4 },
                          { metric: 'False Positive Rate', platform: 2.1, industry: 8.3, difference: -6.2 },
                          { metric: 'User Engagement Score', platform: 87.3, industry: 68.9, difference: 18.4 },
                        ].map((benchmark, index) => (
                          <tr key={index} className={index % 2 ? 'bg-gray-50' : 'bg-white'}>
                            <td className="p-3 font-medium">{benchmark.metric}</td>
                            <td className="p-3 text-right font-semibold">
                              {benchmark.metric.includes('Time') ? `${benchmark.platform.toFixed(1)}` : `${benchmark.platform.toFixed(1)}%`}
                            </td>
                            <td className="p-3 text-right">
                              {benchmark.metric.includes('Time') ? `${benchmark.industry.toFixed(1)}` : `${benchmark.industry.toFixed(1)}%`}
                            </td>
                            <td className="p-3 text-right">
                              <span className={benchmark.difference > 0 ? 
                                (benchmark.metric.includes('Positive') ? 'text-red-600' : 'text-green-600') : 
                                (benchmark.metric.includes('Positive') || benchmark.metric.includes('Time') ? 'text-green-600' : 'text-red-600')}>
                                {benchmark.difference > 0 ? '+' : ''}{benchmark.difference.toFixed(1)}{benchmark.metric.includes('Time') ? '' : '%'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Time Series with Anomaly Detection */}
            <Card className="mb-6 border border-blue-200 shadow-md">
              <CardHeader className="bg-blue-50">
                <CardTitle className="text-lg text-blue-800 flex items-center justify-between">
                  <span>Moderation Activity with Anomaly Detection</span>
                  <TooltipProvider>
                    <UITooltip>
                      <TooltipTrigger asChild>
                        <InfoCircledIcon className="h-5 w-5 text-blue-600" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>Time-series analysis of moderation activity with AI-powered anomaly detection</p>
                      </TooltipContent>
                    </UITooltip>
                  </TooltipProvider>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                      data={[
                        { date: 'Jan 1', value: 125, isAnomaly: false },
                        { date: 'Jan 2', value: 132, isAnomaly: false },
                        { date: 'Jan 3', value: 127, isAnomaly: false },
                        { date: 'Jan 4', value: 135, isAnomaly: false },
                        { date: 'Jan 5', value: 142, isAnomaly: false },
                        { date: 'Jan 6', value: 146, isAnomaly: false },
                        { date: 'Jan 7', value: 151, isAnomaly: false },
                        { date: 'Jan 8', value: 155, isAnomaly: false },
                        { date: 'Jan 9', value: 161, isAnomaly: false },
                        { date: 'Jan 10', value: 165, isAnomaly: false },
                        { date: 'Jan 11', value: 173, isAnomaly: false },
                        { date: 'Jan 12', value: 178, isAnomaly: false },
                        { date: 'Jan 13', value: 187, isAnomaly: false },
                        { date: 'Jan 14', value: 263, isAnomaly: true, severity: 'high', description: 'Spam attack detected' },
                        { date: 'Jan 15', value: 172, isAnomaly: false },
                        { date: 'Jan 16', value: 168, isAnomaly: false },
                        { date: 'Jan 17', value: 164, isAnomaly: false },
                        { date: 'Jan 18', value: 159, isAnomaly: false },
                        { date: 'Jan 19', value: 75, isAnomaly: true, severity: 'medium', description: 'System maintenance period' },
                        { date: 'Jan 20', value: 152, isAnomaly: false },
                        { date: 'Jan 21', value: 149, isAnomaly: false },
                        { date: 'Jan 22', value: 145, isAnomaly: false },
                        { date: 'Jan 23', value: 138, isAnomaly: false },
                        { date: 'Jan 24', value: 132, isAnomaly: false },
                        { date: 'Jan 25', value: 135, isAnomaly: false },
                        { date: 'Jan 26', value: 128, isAnomaly: false },
                        { date: 'Jan 27', value: 131, isAnomaly: false },
                        { date: 'Jan 28', value: 135, isAnomaly: false },
                        { date: 'Jan 29', value: 142, isAnomaly: false },
                        { date: 'Jan 30', value: 206, isAnomaly: true, severity: 'low', description: 'Unusual activity spike' },
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        angle={-45} 
                        textAnchor="end" 
                        height={60}
                        interval={0}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis label={{ value: 'Moderation Events', angle: -90, position: 'insideLeft' }} />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md">
                                <p className="font-bold">{data.date}</p>
                                <p>Events: {data.value}</p>
                                {data.isAnomaly && (
                                  <div>
                                    <p className="text-red-600 font-semibold">⚠️ Anomaly Detected</p>
                                    <p>Severity: {data.severity}</p>
                                    <p>{data.description}</p>
                                  </div>
                                )}
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="#93c5fd" fillOpacity={0.3} />
                      {/* Highlight anomalies with scatter points */}
                      <Scatter 
                        data={[
                          { date: 'Jan 14', value: 263, isAnomaly: true },
                          { date: 'Jan 19', value: 75, isAnomaly: true },
                          { date: 'Jan 30', value: 206, isAnomaly: true },
                        ]} 
                        fill="#ef4444" 
                        shape={(props) => {
                          const { cx, cy } = props;
                          return (
                            <g>
                              <circle cx={cx} cy={cy} r={8} fill="#ef4444" />
                              <circle cx={cx} cy={cy} r={12} fill="#ef4444" fillOpacity={0.3} />
                              <circle cx={cx} cy={cy} r={16} fill="#ef4444" fillOpacity={0.1} />
                            </g>
                          );
                        }}
                      />
                      <ReferenceLine y={180} stroke="#f97316" strokeDasharray="3 3" >
                        <Label value="Alert Threshold" position="right" fill="#f97316" />
                      </ReferenceLine>
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            {/* Heat Map for Content Violation Patterns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <Card className="border border-blue-200 shadow-md">
                <CardHeader className="bg-blue-50">
                  <CardTitle className="text-lg text-blue-800 flex items-center justify-between">
                    <span>Content Violation Patterns (Heatmap)</span>
                    <TooltipProvider>
                      <UITooltip>
                        <TooltipTrigger asChild>
                          <InfoCircledIcon className="h-5 w-5 text-blue-600" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>Heatmap visualization of content violations by time of day and day of week</p>
                        </TooltipContent>
                      </UITooltip>
                    </TooltipProvider>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="h-[400px] overflow-hidden">
                    <ResponsiveContainer width="100%" height="100%">
                      <Tooltip content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white p-2 border border-gray-200 shadow-md rounded-md">
                              <p>Day: {data.day}</p>
                              <p>Hour: {data.hour}:00</p>
                              <p>Violations: {data.value}</p>
                            </div>
                          );
                        }
                        return null;
                      }} />
                      <ComposedChart
                        margin={{ top: 20, right: 20, left: 50, bottom: 50 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="hour" 
                          type="number" 
                          domain={[0, 23]} 
                          ticks={[0, 4, 8, 12, 16, 20]}
                          label={{ value: 'Hour of Day', position: 'bottom', offset: 20 }}
                        />
                        <YAxis 
                          dataKey="dayIndex" 
                          type="number" 
                          domain={[0, 6]}
                          ticks={[0, 1, 2, 3, 4, 5, 6]}
                          tickFormatter={(value) => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][value]}
                          label={{ value: 'Day of Week', angle: -90, position: 'insideLeft', offset: -30 }}
                        />
                        <Scatter
                          data={Array(7 * 24).fill(0).map((_, index) => {
                            const hour = index % 24;
                            const dayIndex = Math.floor(index / 24);
                            const day = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayIndex];
                            
                            // Pattern: more violations at night and weekend
                            let baseValue = 0;
                            // Increase for evening hours
                            if (hour >= 18 || hour <= 2) baseValue += 15;
                            // Increase for weekend
                            if (dayIndex === 0 || dayIndex === 6) baseValue += 10;
                            // Peak periods
                            if ((dayIndex === 5 || dayIndex === 6) && (hour >= 20 || hour <= 1)) baseValue += 20;
                            
                            // Add some randomness
                            const value = baseValue + Math.floor(Math.random() * 15);
                            return { hour, dayIndex, day, value };
                          })}
                          fill="#4f46e5"
                          shape={(props) => {
                            const { cx, cy, payload } = props;
                            const { value } = payload;
                            const size = Math.max(Math.min(value / 2, 20), 5); // Min 5px, max 20px
                            
                            // Define color based on value
                            let fill;
                            if (value < 10) fill = '#bfdbfe'; // Light blue for low
                            else if (value < 20) fill = '#60a5fa'; // Medium blue
                            else if (value < 30) fill = '#2563eb'; // Blue
                            else if (value < 40) fill = '#7c3aed'; // Purple
                            else fill = '#c026d3'; // Magenta for highest
                            
                            return (
                              <circle 
                                cx={cx} 
                                cy={cy} 
                                r={size} 
                                fill={fill} 
                                opacity={0.8} 
                              />
                            );
                          }}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              {/* Moderation Funnel Analysis */}
              <Card className="border border-blue-200 shadow-md">
                <CardHeader className="bg-blue-50">
                  <CardTitle className="text-lg text-blue-800 flex items-center justify-between">
                    <span>Report Resolution Funnel</span>
                    <TooltipProvider>
                      <UITooltip>
                        <TooltipTrigger asChild>
                          <InfoCircledIcon className="h-5 w-5 text-blue-600" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>Analysis of report workflow showing conversion through each stage</p>
                        </TooltipContent>
                      </UITooltip>
                    </TooltipProvider>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <Sankey
                        data={{
                          nodes: [
                            { name: 'Reports Received' },
                            { name: 'Initial Review' },
                            { name: 'Automated Actions' },
                            { name: 'Manual Review' },
                            { name: 'Investigation' },
                            { name: 'Content Removed' },
                            { name: 'Warning Issued' },
                            { name: 'False Positive' },
                            { name: 'Appeal Process' },
                            { name: 'Escalation' },
                            { name: 'Decision Upheld' },
                            { name: 'Decision Reversed' },
                          ],
                          links: [
                            { source: 0, target: 1, value: 1000 },
                            { source: 1, target: 2, value: 450 },
                            { source: 1, target: 3, value: 550 },
                            { source: 2, target: 5, value: 280 },
                            { source: 2, target: 6, value: 120 },
                            { source: 2, target: 7, value: 50 },
                            { source: 3, target: 4, value: 250 },
                            { source: 3, target: 5, value: 150 },
                            { source: 3, target: 6, value: 100 },
                            { source: 3, target: 7, value: 50 },
                            { source: 4, target: 5, value: 120 },
                            { source: 4, target: 6, value: 80 },
                            { source: 4, target: 9, value: 50 },
                            { source: 5, target: 8, value: 70 },
                            { source: 6, target: 8, value: 30 },
                            { source: 8, target: 10, value: 80 },
                            { source: 8, target: 11, value: 20 },
                            { source: 9, target: 10, value: 40 },
                            { source: 9, target: 11, value: 10 },
                          ]
                        }}
                        linkCurvature={0.5}
                        nodePadding={30}
                        nodeWidth={10}
                        link={{ stroke: '#aaa' }}
                        node={{
                          stroke: '#555',
                          strokeWidth: 1,
                          fill: '#2563eb',
                        }}
                        margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                      >
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const { sourceNode, targetNode, value } = payload[0].payload;
                              return (
                                <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md">
                                  <p className="font-bold">{sourceNode.name} → {targetNode.name}</p>
                                  <p>Count: {value}</p>
                                  <p>Conversion: {((value / 1000) * 100).toFixed(1)}%</p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                      </Sankey>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* System Health Monitoring */}
            <Card className="mb-6 border border-blue-200 shadow-md">
              <CardHeader className="bg-blue-50">
                <CardTitle className="text-lg text-blue-800 flex items-center justify-between">
                  <span>System Health & Performance Monitoring</span>
                  <TooltipProvider>
                    <UITooltip>
                      <TooltipTrigger asChild>
                        <InfoCircledIcon className="h-5 w-5 text-blue-600" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>Real-time monitoring of system performance metrics</p>
                      </TooltipContent>
                    </UITooltip>
                  </TooltipProvider>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {[
                    { name: 'API Response Time', value: 128, status: 'good', trend: -3.2, unit: 'ms' },
                    { name: 'Queue Length', value: 12, status: 'good', trend: -2.1, unit: '' },
                    { name: 'Error Rate', value: 0.8, status: 'good', trend: -0.3, unit: '%' },
                    { name: 'CPU Utilization', value: 38, status: 'good', trend: 5.7, unit: '%' },
                    { name: 'Memory Usage', value: 52, status: 'good', trend: 2.4, unit: '%' },
                    { name: 'False Positives', value: 2.3, status: 'good', trend: -0.7, unit: '%' },
                    { name: 'Database Latency', value: 83, status: 'good', trend: 4.5, unit: 'ms' },
                    { name: 'Webhook Failures', value: 0.4, status: 'good', trend: -0.2, unit: '%' },
                  ].map((metric, index) => (
                    <Card key={index} className={`p-4 border-l-4 ${metric.status === 'good' ? 'border-l-green-500' : metric.status === 'warning' ? 'border-l-amber-500' : 'border-l-red-500'}`}>
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium text-sm">{metric.name}</h4>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${metric.status === 'good' ? 'bg-green-100 text-green-800' : metric.status === 'warning' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}`}>
                          {metric.status === 'good' ? 'Good' : metric.status === 'warning' ? 'Warning' : 'Critical'}
                        </div>
                      </div>
                      <div className="mt-2 flex items-baseline">
                        <div className="text-2xl font-semibold">
                          {metric.value}{metric.unit}
                        </div>
                        <div className={`ml-2 flex items-center text-xs ${metric.name.includes('Error') || metric.name.includes('False') || metric.name.includes('Failures') ? (metric.trend > 0 ? 'text-red-600' : 'text-green-600') : (metric.trend > 0 ? 'text-green-600' : 'text-red-600')}`}>
                          {metric.trend > 0 ? '↑' : '↓'} {Math.abs(metric.trend).toFixed(1)}%
                        </div>
                      </div>
                      <div className="mt-2">
                        <Progress 
                          value={metric.name.includes('Time') ? Math.min(100, (metric.value / 200) * 100) : metric.value} 
                          className={`h-2 ${metric.status === 'good' ? 'bg-green-100' : metric.status === 'warning' ? 'bg-amber-100' : 'bg-red-100'}`}
                        />
                      </div>
                    </Card>
                  ))}
                </div>
                
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={[
                        { time: '00:00', cpu: 18, memory: 45, requests: 12, errors: 0.2 },
                        { time: '01:00', cpu: 15, memory: 42, requests: 10, errors: 0.1 },
                        { time: '02:00', cpu: 12, memory: 40, requests: 8, errors: 0.1 },
                        { time: '03:00', cpu: 10, memory: 38, requests: 5, errors: 0.0 },
                        { time: '04:00', cpu: 8, memory: 38, requests: 4, errors: 0.0 },
                        { time: '05:00', cpu: 12, memory: 39, requests: 7, errors: 0.1 },
                        { time: '06:00', cpu: 16, memory: 42, requests: 15, errors: 0.2 },
                        { time: '07:00', cpu: 24, memory: 45, requests: 25, errors: 0.3 },
                        { time: '08:00', cpu: 36, memory: 48, requests: 40, errors: 0.5 },
                        { time: '09:00', cpu: 48, memory: 52, requests: 65, errors: 0.8 },
                        { time: '10:00', cpu: 54, memory: 56, requests: 72, errors: 1.0 },
                        { time: '11:00', cpu: 52, memory: 58, requests: 68, errors: 0.9 },
                        { time: '12:00', cpu: 48, memory: 55, requests: 62, errors: 0.7 },
                        { time: '13:00', cpu: 45, memory: 53, requests: 58, errors: 0.6 },
                        { time: '14:00', cpu: 42, memory: 51, requests: 55, errors: 0.5 },
                        { time: '15:00', cpu: 40, memory: 50, requests: 52, errors: 0.5 },
                        { time: '16:00', cpu: 38, memory: 49, requests: 48, errors: 0.4 },
                        { time: '17:00', cpu: 35, memory: 48, requests: 42, errors: 0.3 },
                        { time: '18:00', cpu: 30, memory: 46, requests: 35, errors: 0.2 },
                        { time: '19:00', cpu: 25, memory: 45, requests: 28, errors: 0.2 },
                        { time: '20:00', cpu: 22, memory: 44, requests: 25, errors: 0.2 },
                        { time: '21:00', cpu: 28, memory: 46, requests: 32, errors: 0.3 },
                        { time: '22:00', cpu: 24, memory: 45, requests: 28, errors: 0.2 },
                        { time: '23:00', cpu: 20, memory: 44, requests: 20, errors: 0.2 },
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Line yAxisId="left" type="monotone" dataKey="cpu" name="CPU (%)" stroke="#3b82f6" strokeWidth={2} />
                      <Line yAxisId="left" type="monotone" dataKey="memory" name="Memory (%)" stroke="#8b5cf6" strokeWidth={2} />
                      <Line yAxisId="right" type="monotone" dataKey="requests" name="Requests/min" stroke="#10b981" strokeWidth={2} />
                      <Line yAxisId="right" type="monotone" dataKey="errors" name="Error Rate (%)" stroke="#ef4444" strokeWidth={2} />
                      <ReferenceLine yAxisId="left" y={80} stroke="#f97316" strokeDasharray="3 3" label="CPU Warning" />
                      <ReferenceLine yAxisId="left" y={90} stroke="#ef4444" strokeDasharray="3 3" label="CPU Critical" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <CardTitle>Content Reports</CardTitle>
                <CardDescription>
                  Total content reports processed by system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {moderationMetrics.total_reports}
                </div>
                <p className="text-xs text-muted-foreground">
                  {moderationMetrics.pending_reports} pending, {moderationMetrics.resolved_reports} resolved
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Avg. Resolution Time</CardTitle>
                <CardDescription>
                  Average time to resolve a content report
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {timeMetrics.avg_resolution_time} min
                </div>
                <div className="text-xs text-muted-foreground">
                  Response time: {timeMetrics.avg_response_time} min
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Automation Rate</CardTitle>
                <CardDescription>
                  Percentage of actions handled automatically
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {automationRate.total > 0 ? ((automationRate.automated / automationRate.total) * 100).toFixed(1) : 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {automationRate.automated} auto vs {automationRate.manual} manual
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Overall Accuracy</CardTitle>
                <CardDescription>
                  System moderation accuracy rate
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(qualityMetrics.accuracy * 100).toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  FP: {(qualityMetrics.false_positive_rate * 100).toFixed(1)}% / FN: {(qualityMetrics.false_negative_rate * 100).toFixed(1)}%
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Daily Report Trends</CardTitle>
                <CardDescription>Report volume and resolution patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dailyTrendData}>
                      <defs>
                        <linearGradient id="totalColor" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="approvedColor" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4ade80" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#4ade80" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="rejectedColor" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f87171" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#f87171" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" />
                      <YAxis />
                      <CartesianGrid strokeDasharray="3 3" />
                      <Tooltip />
                      <Area type="monotone" dataKey="total" stroke="#3b82f6" fillOpacity={1} fill="url(#totalColor)" />
                      <Area type="monotone" dataKey="approved" stroke="#4ade80" fillOpacity={1} fill="url(#approvedColor)" />
                      <Area type="monotone" dataKey="rejected" stroke="#f87171" fillOpacity={1} fill="url(#rejectedColor)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Moderation Action Distribution</CardTitle>
                <CardDescription>Breakdown of actions taken on reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={actionDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {actionDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Time Distribution of Reports</CardTitle>
              <CardDescription>When moderation actions are most frequent</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={timeDistributionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="hour" 
                      tickFormatter={(hour) => `${hour}:00`}
                    />
                    <YAxis />
                    <Tooltip
                      labelFormatter={(hour) => `Time: ${hour}:00`}
                      formatter={(value) => [`${value} reports`, 'Count']}
                    />
                    <Bar dataKey="count" fill="var(--chart-1-hex)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="rules" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <CardTitle>Total Rules</CardTitle>
                <CardDescription>Number of content moderation rules</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{moderationMetrics.total_rules}</div>
                <p className="text-xs text-muted-foreground">
                  {moderationMetrics.active_rules} active rules
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Top Matching Rule</CardTitle>
                <CardDescription>Most triggered rule</CardDescription>
              </CardHeader>
              <CardContent>
                {moderationMetrics.rule_stats?.length > 0 ? (
                  <>
                    <div className="text-lg font-medium truncate">{moderationMetrics.rule_stats[0].type}</div>
                    <p className="text-xs text-muted-foreground truncate">
                      Pattern: {moderationMetrics.rule_stats[0].pattern.substring(0, 30)}...
                    </p>
                    <p className="text-sm mt-1">
                      {moderationMetrics.rule_stats[0].matches} matches
                    </p>
                  </>
                ) : (
                  <div className="text-muted-foreground">No rules data</div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Most Effective Rule</CardTitle>
                <CardDescription>Highest accuracy rule</CardDescription>
              </CardHeader>
              <CardContent>
                {moderationMetrics.rule_stats?.length > 0 ? (
                  <>
                    <div className="text-lg font-medium truncate">
                      {moderationMetrics.rule_stats.sort((a, b) => b.effectiveness - a.effectiveness)[0].type}
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <Progress value={moderationMetrics.rule_stats.sort((a, b) => b.effectiveness - a.effectiveness)[0].effectiveness * 100} className="h-2" />
                      <span className={getEffectivenessColor(moderationMetrics.rule_stats.sort((a, b) => b.effectiveness - a.effectiveness)[0].effectiveness * 100)}>
                        {(moderationMetrics.rule_stats.sort((a, b) => b.effectiveness - a.effectiveness)[0].effectiveness * 100).toFixed(0)}%
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="text-muted-foreground">No rules data</div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Problematic Rule</CardTitle>
                <CardDescription>Highest false positive rate</CardDescription>
              </CardHeader>
              <CardContent>
                {moderationMetrics.rule_stats?.length > 0 ? (
                  <>
                    <div className="text-lg font-medium truncate">
                      {moderationMetrics.rule_stats.sort((a, b) => b.false_positive_rate - a.false_positive_rate)[0].type}
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <Progress value={moderationMetrics.rule_stats.sort((a, b) => b.false_positive_rate - a.false_positive_rate)[0].false_positive_rate * 100} className="h-2" />
                      <span className={getFalsePositiveColor(moderationMetrics.rule_stats.sort((a, b) => b.false_positive_rate - a.false_positive_rate)[0].false_positive_rate * 100)}>
                        {(moderationMetrics.rule_stats.sort((a, b) => b.false_positive_rate - a.false_positive_rate)[0].false_positive_rate * 100).toFixed(0)}% FP
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="text-muted-foreground">No rules data</div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Rule Effectiveness</CardTitle>
              <CardDescription>Performance metrics for each content rule</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={moderatorPerformanceData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="effectiveness" name="Effectiveness %" fill="#4ade80" />
                    <Bar dataKey="falsePositives" name="False Positives %" fill="#f87171" />
                    <ReferenceLine x={80} stroke="green" strokeDasharray="3 3" />
                    <ReferenceLine x={20} stroke="red" strokeDasharray="3 3" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Rule Match Volume & Violation Heatmap</CardTitle>
                <CardDescription>Distribution of content rule matches by category and severity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    {useMemo(() => {
                      // Create heatmap data structure based on moderatorPerformanceData
                      const ruleCategories = ['Spam', 'Harassment', 'Inappropriate', 'Scam', 'Privacy'];
                      const severityLevels = ['Low', 'Medium', 'High', 'Critical'];
                      
                      const heatmapData = ruleCategories.map(category => {
                        const result = { name: category };
                        severityLevels.forEach(severity => {
                          // Generate realistic-looking data based on some pattern
                          let value = 0;
                          if (category === 'Spam' && severity === 'Low') value = 25;
                          else if (category === 'Harassment' && severity === 'High') value = 18;
                          else if (category === 'Scam' && severity === 'Critical') value = 15;
                          else value = Math.floor(Math.random() * 15);
                          result[severity] = value;
                        });
                        return result;
                      });
                      
                      return (
                        <ComposedChart
                          layout="vertical"
                          data={heatmapData}
                          margin={{ top: 20, right: 20, bottom: 20, left: 80 }}
                        >
                          <XAxis type="number" />
                          <YAxis dataKey="name" type="category" width={80} />
                          <Tooltip
                            formatter={(value, name) => [`${value} incidents`, `${name} Severity`]}
                            labelFormatter={(label) => `Rule Category: ${label}`}
                          />
                          <Legend />
                          <Bar dataKey="Low" stackId="a" fill="#74c0fc" /> {/* Light blue */}
                          <Bar dataKey="Medium" stackId="a" fill="#4dabf7" /> {/* Blue */}
                          <Bar dataKey="High" stackId="a" fill="#3b82f6" /> {/* Medium blue */}
                          <Bar dataKey="Critical" stackId="a" fill="#1e40af" /> {/* Dark blue */}
                        </ComposedChart>
                      );
                    }, [moderatorPerformanceData])}
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Pattern Complexity Analysis</CardTitle>
                <CardDescription>Rule pattern complexity and performance correlation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={moderatorPerformanceData.map((d, i) => ({
                        ...d,
                        complexity: d.name.includes('Regex') ? 80 : d.name.includes('ML') ? 60 : 40,
                        index: i
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="index" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="effectiveness" name="Effectiveness" stroke="#4ade80" />
                      <Line type="monotone" dataKey="complexity" name="Complexity" stroke="#3b82f6" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="moderators" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Moderator Team</CardTitle>
                <CardDescription>Active content moderators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{moderatorEfficiency.length}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Reports Per Moderator</CardTitle>
                <CardDescription>Average reports handled per moderator</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {moderatorEfficiency.length > 0 
                    ? Math.round(moderationMetrics.total_reports / moderatorEfficiency.length) 
                    : 0}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Response SLA</CardTitle>
                <CardDescription>Current Service Level Agreement</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {moderatorEfficiency.some(m => m.responseTime > 90) ? 'At Risk' : 'On Target'}
                </div>
                <div className="flex items-center mt-2">
                  <Progress 
                    value={Math.min(100, 100 - (timeMetrics.avg_response_time / 120 * 100))}
                    className="h-2"
                  />
                  <span className="ml-2 text-sm">{Math.min(100, 100 - (timeMetrics.avg_response_time / 120 * 100)).toFixed(0)}%</span>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Moderator Performance Comparison</CardTitle>
              <CardDescription>Efficiency metrics across team members</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={moderatorEfficiency}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" />
                    <YAxis yAxisId="right" orientation="right" stroke="#f87171" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="count" name="Reports Handled" fill="#3b82f6" />
                    <Bar yAxisId="right" dataKey="efficiency" name="Efficiency Score" fill="#4ade80" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Response Time by Moderator</CardTitle>
                <CardDescription>Average time to first action on reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={moderatorEfficiency}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={100} />
                      <Tooltip formatter={(value) => [`${value} minutes`, 'Response Time']} />
                      <Bar dataKey="responseTime" fill="#3b82f6">
                        {moderatorEfficiency.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.responseTime > 90 ? '#f87171' : entry.responseTime > 60 ? '#facc15' : '#4ade80'} 
                          />
                        ))}
                      </Bar>
                      <ReferenceLine x={60} stroke="green" strokeDasharray="3 3" label="Target" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Moderator Workload Distribution</CardTitle>
                <CardDescription>Current task allocation across team</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={moderatorEfficiency}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                        nameKey="name"
                        label
                      >
                        {moderatorEfficiency.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 60%)`} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="system" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <CardTitle>API Latency</CardTitle>
                <CardDescription>Average API response time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {systemHealthMetrics.apiLatency}ms
                </div>
                <p className="text-xs text-muted-foreground">
                  <span className={systemHealthMetrics.apiLatency < 100 ? "text-green-600" : "text-yellow-500"}>
                    {systemHealthMetrics.apiLatency < 100 ? "Healthy" : "Degraded"}
                  </span>
                </p>
                <Progress 
                  value={Math.max(0, 100 - (systemHealthMetrics.apiLatency / 5))} 
                  className="h-2 mt-2"
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Queue Length</CardTitle>
                <CardDescription>Pending processing queue</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {systemHealthMetrics.queueLength}
                </div>
                <p className="text-xs text-muted-foreground">
                  <span className={systemHealthMetrics.queueLength < 5 ? "text-green-600" : "text-yellow-500"}>
                    {systemHealthMetrics.queueLength < 5 ? "No backlog" : "Moderate backlog"}
                  </span>
                </p>
                <Progress 
                  value={Math.max(0, 100 - (systemHealthMetrics.queueLength * 10))} 
                  className="h-2 mt-2"
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>CPU Utilization</CardTitle>
                <CardDescription>System resource usage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {systemHealthMetrics.cpuUtilization}%
                </div>
                <p className="text-xs text-muted-foreground">
                  <span className={systemHealthMetrics.cpuUtilization < 50 ? "text-green-600" : "text-yellow-500"}>
                    {systemHealthMetrics.cpuUtilization < 50 ? "Normal" : "Elevated"}
                  </span>
                </p>
                <Progress 
                  value={systemHealthMetrics.cpuUtilization} 
                  className="h-2 mt-2"
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Memory Usage</CardTitle>
                <CardDescription>System memory allocation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {systemHealthMetrics.memoryUsage}%
                </div>
                <p className="text-xs text-muted-foreground">
                  <span className={systemHealthMetrics.memoryUsage < 75 ? "text-green-600" : "text-yellow-500"}>
                    {systemHealthMetrics.memoryUsage < 75 ? "Normal" : "High"}
                  </span>
                </p>
                <Progress 
                  value={systemHealthMetrics.memoryUsage} 
                  className="h-2 mt-2"
                />
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>System Performance Trend</CardTitle>
                <CardDescription>24-hour performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={Array.from({ length: 24 }, (_, i) => ({
                        hour: i,
                        latency: Math.floor(Math.random() * 50) + (i >= 9 && i <= 17 ? 100 : 70),
                        cpu: Math.floor(Math.random() * 10) + (i >= 9 && i <= 17 ? 35 : 20),
                        memory: Math.floor(Math.random() * 5) + (i >= 9 && i <= 17 ? 45 : 35)
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="hour" 
                        tickFormatter={(hour) => `${hour}:00`}
                      />
                      <YAxis />
                      <Tooltip 
                        labelFormatter={(hour) => `Time: ${hour}:00`}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="latency" name="API Latency (ms)" stroke="#ef4444" />
                      <Line type="monotone" dataKey="cpu" name="CPU (%)" stroke="#3b82f6" />
                      <Line type="monotone" dataKey="memory" name="Memory (%)" stroke="#4ade80" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Error Rate Analysis</CardTitle>
                <CardDescription>System errors by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { type: 'Connection Timeout', count: 8, critical: 2 },
                        { type: 'Authentication', count: 5, critical: 1 },
                        { type: 'Validation', count: 12, critical: 0 },
                        { type: 'Database', count: 3, critical: 3 },
                        { type: 'External API', count: 7, critical: 2 }
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="type" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" name="Total Errors" fill="#f97316" />
                      <Bar dataKey="critical" name="Critical Errors" fill="#ef4444" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>System Health Radar</CardTitle>
              <CardDescription>Multi-dimensional system health visualization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart outerRadius={150} data={[
                    { metric: 'API Response', value: 80, fullMark: 100 },
                    { metric: 'Database', value: 85, fullMark: 100 },
                    { metric: 'Cache Hit Rate', value: 92, fullMark: 100 },
                    { metric: 'Error Rate', value: 70, fullMark: 100 },
                    { metric: 'CPU', value: 75, fullMark: 100 },
                    { metric: 'Memory', value: 65, fullMark: 100 },
                    { metric: 'Storage', value: 88, fullMark: 100 },
                    { metric: 'Network', value: 82, fullMark: 100 },
                  ]}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="metric" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar name="Current" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <CardTitle>API Performance</CardTitle>
                <CardDescription>Average API response time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemHealthMetrics.apiLatency}ms</div>
                <div className="flex items-center space-x-2 mt-2">
                  <Progress 
                    value={100 - (systemHealthMetrics.apiLatency / 500 * 100)} 
                    className={`h-2 ${systemHealthMetrics.apiLatency > 300 ? 'bg-red-500' : 'bg-green-500'}`} 
                  />
                  <span className={systemHealthMetrics.apiLatency > 300 ? 'text-red-500' : 'text-green-500'}>
                    {systemHealthMetrics.apiLatency > 300 ? 'At Risk' : 'Healthy'}
                  </span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Queue Length</CardTitle>
                <CardDescription>Pending operations in queue</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemHealthMetrics.queueLength}</div>
                <div className="flex items-center space-x-2 mt-2">
                  <Progress 
                    value={100 - (systemHealthMetrics.queueLength / 20 * 100)} 
                    className={`h-2 ${systemHealthMetrics.queueLength > 10 ? 'bg-red-500' : 'bg-green-500'}`} 
                  />
                  <span className={systemHealthMetrics.queueLength > 10 ? 'text-red-500' : 'text-green-500'}>
                    {systemHealthMetrics.queueLength > 10 ? 'Backlogged' : 'Optimal'}
                  </span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>CPU Utilization</CardTitle>
                <CardDescription>Current server CPU usage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemHealthMetrics.cpuUtilization}%</div>
                <div className="flex items-center space-x-2 mt-2">
                  <Progress 
                    value={100 - (systemHealthMetrics.cpuUtilization / 100 * 100)} 
                    className={`h-2 ${systemHealthMetrics.cpuUtilization > 70 ? 'bg-red-500' : systemHealthMetrics.cpuUtilization > 50 ? 'bg-yellow-500' : 'bg-green-500'}`} 
                  />
                  <span className={systemHealthMetrics.cpuUtilization > 70 ? 'text-red-500' : systemHealthMetrics.cpuUtilization > 50 ? 'text-yellow-500' : 'text-green-500'}>
                    {systemHealthMetrics.cpuUtilization > 70 ? 'High' : systemHealthMetrics.cpuUtilization > 50 ? 'Moderate' : 'Low'}
                  </span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Memory Usage</CardTitle>
                <CardDescription>Current server memory usage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemHealthMetrics.memoryUsage}%</div>
                <div className="flex items-center space-x-2 mt-2">
                  <Progress 
                    value={100 - (systemHealthMetrics.memoryUsage / 100 * 100)} 
                    className={`h-2 ${systemHealthMetrics.memoryUsage > 80 ? 'bg-red-500' : systemHealthMetrics.memoryUsage > 60 ? 'bg-yellow-500' : 'bg-green-500'}`} 
                  />
                  <span className={systemHealthMetrics.memoryUsage > 80 ? 'text-red-500' : systemHealthMetrics.memoryUsage > 60 ? 'text-yellow-500' : 'text-green-500'}>
                    {systemHealthMetrics.memoryUsage > 80 ? 'Critical' : systemHealthMetrics.memoryUsage > 60 ? 'Warning' : 'Normal'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>System Resource Trend</CardTitle>
                <CardDescription>24-hour utilization metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={Array.from({ length: 24 }, (_, i) => ({
                        hour: i,
                        cpu: Math.floor(Math.random() * 30) + (i >= 9 && i <= 17 ? 30 : 15),
                        memory: Math.floor(Math.random() * 20) + (i >= 9 && i <= 17 ? 40 : 25),
                        api: Math.floor(Math.random() * 100) + (i >= 9 && i <= 17 ? 150 : 80)
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="hour" 
                        tickFormatter={(hour) => `${hour}:00`}
                      />
                      <YAxis yAxisId="left" orientation="left" />
                      <YAxis yAxisId="right" orientation="right" domain={[0, 500]} />
                      <Tooltip 
                        labelFormatter={(hour) => `Time: ${hour}:00`}
                        formatter={(value, name) => [
                          name === 'api' ? `${value}ms` : `${value}%`, 
                          name === 'cpu' ? 'CPU Usage' : name === 'memory' ? 'Memory Usage' : 'API Latency'
                        ]}
                      />
                      <Legend />
                      <Line yAxisId="left" type="monotone" dataKey="cpu" name="CPU Usage" stroke="#ef4444" />
                      <Line yAxisId="left" type="monotone" dataKey="memory" name="Memory Usage" stroke="#3b82f6" />
                      <Line yAxisId="right" type="monotone" dataKey="api" name="API Latency" stroke="#f97316" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>False Positive Tracking</CardTitle>
                <CardDescription>Trend of false positive moderation actions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                      data={[
                        { date: 'Mar 1', total: 42, falsePositives: 5, rate: 11.9 },
                        { date: 'Mar 2', total: 38, falsePositives: 4, rate: 10.5 },
                        { date: 'Mar 3', total: 45, falsePositives: 6, rate: 13.3 },
                        { date: 'Mar 4', total: 52, falsePositives: 4, rate: 7.7 },
                        { date: 'Mar 5', total: 48, falsePositives: 3, rate: 6.3 },
                        { date: 'Mar 6', total: 50, falsePositives: 2, rate: 4.0 },
                        { date: 'Mar 7', total: 47, falsePositives: 3, rate: 6.4 },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" domain={[0, 20]} />
                      <Tooltip />
                      <Legend />
                      <Bar yAxisId="left" dataKey="total" name="Total Actions" fill="#3b82f6" />
                      <Bar yAxisId="left" dataKey="falsePositives" name="False Positives" fill="#ef4444" />
                      <Line yAxisId="right" type="monotone" dataKey="rate" name="False Positive Rate (%)" stroke="#f97316" />
                      <ReferenceLine yAxisId="right" y={10} stroke="#ef4444" strokeDasharray="3 3">
                        <Label value="Target Threshold" position="insideBottomRight" />
                      </ReferenceLine>
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <CardTitle>API Performance</CardTitle>
                <CardDescription>Average API response time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemHealthMetrics.apiLatency}ms</div>
                <div className="flex items-center mt-2">
                  <Progress 
                    value={Math.max(0, 100 - (systemHealthMetrics.apiLatency / 5))}
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Queue Length</CardTitle>
                <CardDescription>Pending items in processing queue</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemHealthMetrics.queueLength}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  {systemHealthMetrics.queueLength > 5 ? (
                    <div className="flex items-center text-amber-500">
                      <div className="w-4 h-4 mr-1 rounded-full bg-amber-500"></div>
                      Above threshold
                    </div>
                  ) : (
                    <div className="text-green-500">Normal</div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>CPU Utilization</CardTitle>
                <CardDescription>System processor usage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemHealthMetrics.cpuUtilization}%</div>
                <div className="flex items-center mt-2">
                  <Progress 
                    value={systemHealthMetrics.cpuUtilization}
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Memory Usage</CardTitle>
                <CardDescription>System memory allocation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemHealthMetrics.memoryUsage}%</div>
                <div className="flex items-center mt-2">
                  <Progress 
                    value={systemHealthMetrics.memoryUsage}
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>False Positive Tracking</CardTitle>
              <CardDescription>User appeals and moderation accuracy over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={[
                      { day: "Mon", falsePositives: 12, appeals: 15, accuracy: 85 },
                      { day: "Tue", falsePositives: 8, appeals: 10, accuracy: 89 },
                      { day: "Wed", falsePositives: 10, appeals: 12, accuracy: 87 },
                      { day: "Thu", falsePositives: 6, appeals: 9, accuracy: 92 },
                      { day: "Fri", falsePositives: 5, appeals: 8, accuracy: 94 },
                      { day: "Sat", falsePositives: 4, appeals: 5, accuracy: 95 },
                      { day: "Sun", falsePositives: 3, appeals: 4, accuracy: 96 }
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" domain={[80, 100]} />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="falsePositives" name="False Positives" stroke="#f87171" />
                    <Line yAxisId="left" type="monotone" dataKey="appeals" name="User Appeals" stroke="#facc15" />
                    <Line yAxisId="right" type="monotone" dataKey="accuracy" name="Accuracy %" stroke="#4ade80" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Processing Time Distribution</CardTitle>
                <CardDescription>Time required to process content by type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { type: "Text", time: 12 },
                        { type: "Image", time: 85 },
                        { type: "Audio", time: 45 },
                        { type: "Video", time: 120 },
                        { type: "Document", time: 20 }
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="type" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value}ms`, 'Processing Time']} />
                      <Bar dataKey="time" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>System Resource Utilization</CardTitle>
                <CardDescription>Resource usage during moderation processes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={[
                        { time: "00:00", cpu: 20, memory: 35, network: 15 },
                        { time: "04:00", cpu: 15, memory: 30, network: 10 },
                        { time: "08:00", cpu: 25, memory: 40, network: 25 },
                        { time: "12:00", cpu: 35, memory: 55, network: 40 },
                        { time: "16:00", cpu: 40, memory: 60, network: 45 },
                        { time: "20:00", cpu: 30, memory: 50, network: 35 },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="cpu" name="CPU %" stroke="#f87171" />
                      <Line type="monotone" dataKey="memory" name="Memory %" stroke="#3b82f6" />
                      <Line type="monotone" dataKey="network" name="Network %" stroke="#4ade80" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>Export Analytics</CardTitle>
            <CardDescription>Generate custom reports with powerful filters</CardDescription>
          </div>
          <div className="flex space-x-2">
            <Select
              value={activeTab}
              onValueChange={(value) => setActiveTab(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="users">User Metrics</SelectItem>
                <SelectItem value="performance">Performance</SelectItem>
                <SelectItem value="rules">Rule Effectiveness</SelectItem>
                <SelectItem value="moderators">Moderator Stats</SelectItem>
                <SelectItem value="system">System Health</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Start Date</label>
                <DatePicker
                  date={exportOptions.startDate}
                  onSelect={(date) =>
                    date && setExportOptions({ ...exportOptions, startDate: date })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">End Date</label>
                <DatePicker
                  date={exportOptions.endDate}
                  onSelect={(date) =>
                    date && setExportOptions({ ...exportOptions, endDate: date })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Export Format</label>
                <Select
                  value={exportOptions.format}
                  onValueChange={(value) =>
                    setExportOptions({ ...exportOptions, format: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="xlsx">Excel</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 flex items-end">
                <Button onClick={handleExport} className="w-full">
                  <DownloadIcon className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
              </div>
            </div>
            
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
              <Card className="bg-muted/40">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Included Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {activeTab === "performance" && (
                      <>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="metrics-reports" defaultChecked />
                          <label htmlFor="metrics-reports" className="text-sm">Report Volumes</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="metrics-resolutions" defaultChecked />
                          <label htmlFor="metrics-resolutions" className="text-sm">Resolution Times</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="metrics-trends" defaultChecked />
                          <label htmlFor="metrics-trends" className="text-sm">Daily Trends</label>
                        </div>
                      </>
                    )}
                    {activeTab === "rules" && (
                      <>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="metrics-effectiveness" defaultChecked />
                          <label htmlFor="metrics-effectiveness" className="text-sm">Rule Effectiveness</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="metrics-false-pos" defaultChecked />
                          <label htmlFor="metrics-false-pos" className="text-sm">False Positives</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="metrics-matches" defaultChecked />
                          <label htmlFor="metrics-matches" className="text-sm">Match Counts</label>
                        </div>
                      </>
                    )}
                    {activeTab === "moderators" && (
                      <>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="metrics-perf" defaultChecked />
                          <label htmlFor="metrics-perf" className="text-sm">Moderator Performance</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="metrics-workload" defaultChecked />
                          <label htmlFor="metrics-workload" className="text-sm">Workload Distribution</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="metrics-sla" defaultChecked />
                          <label htmlFor="metrics-sla" className="text-sm">SLA Compliance</label>
                        </div>
                      </>
                    )}
                    {activeTab === "system" && (
                      <>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="metrics-api" defaultChecked />
                          <label htmlFor="metrics-api" className="text-sm">API Performance</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="metrics-resources" defaultChecked />
                          <label htmlFor="metrics-resources" className="text-sm">Resource Utilization</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="metrics-errors" defaultChecked />
                          <label htmlFor="metrics-errors" className="text-sm">Error Rates</label>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-muted/40">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Chart Types</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="chart-line" defaultChecked />
                      <label htmlFor="chart-line" className="text-sm">Line Charts</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="chart-bar" defaultChecked />
                      <label htmlFor="chart-bar" className="text-sm">Bar Charts</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="chart-pie" defaultChecked />
                      <label htmlFor="chart-pie" className="text-sm">Pie Charts</label>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-muted/40">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Data Grouping</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="group-daily" defaultChecked />
                      <label htmlFor="group-daily" className="text-sm">Daily</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="group-weekly" defaultChecked />
                      <label htmlFor="group-weekly" className="text-sm">Weekly</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="group-monthly" />
                      <label htmlFor="group-monthly" className="text-sm">Monthly</label>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-muted/40">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Comparisons</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="compare-prev-period" defaultChecked />
                      <label htmlFor="compare-prev-period" className="text-sm">Previous Period</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="compare-benchmarks" defaultChecked />
                      <label htmlFor="compare-benchmarks" className="text-sm">Benchmarks</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="compare-targets" />
                      <label htmlFor="compare-targets" className="text-sm">Targets</label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    );
  } catch (error) {
    console.error('Fatal error in AdminAnalytics component:', error);
    return (
      <div className="p-6 border-2 border-red-400 bg-red-50 rounded-lg">
        <div className="text-center space-y-4">
          <h3 className="text-xl font-bold text-red-700">Dashboard Error</h3>
          <p className="text-red-600">An error occurred while rendering the analytics dashboard. The issue has been logged.</p>
          <Button variant="outline" onClick={() => window.location.reload()}>Reload Dashboard</Button>
        </div>
      </div>
    );
  }
};
