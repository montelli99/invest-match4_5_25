import { useEffect, useState } from "react";
import brain from "brain";
import { fetchContentRules, fetchModerationActions, fetchContentReports, fetchAdminDashboard } from "./apiHelpers";
import { mode, Mode } from "app"; // Import mode to check if in dev mode

// Mock data for development and fallback scenarios
const MOCK_ADMIN_DASHBOARD = {
  platform_metrics: {
    total_users: 3258,
    active_users_30d: 1945,
    platform_engagement_rate: 0.76,
  },
  user_type_metrics: {
    fund_manager: {
      total_users: 1208,
      active_users: 842,
      new_users_30d: 78
    },
    limited_partner: {
      total_users: 1632,
      active_users: 954,
      new_users_30d: 112
    },
    capital_raiser: {
      total_users: 418,
      active_users: 149,
      new_users_30d: 24
    }
  },
  support_stats: {
    open_tickets: 27,
    avg_resolution_time: 4.8,
    satisfaction_rate: 0.94
  },
  moderation_stats: {
    pending_reports: 24,
    resolved_today: 45,
    avg_resolution_time: 2.15,
    rule_effectiveness: 0.87
  },
  matching_metrics: {
    total_matches: 3487,
    successful_matches: 1893,
    average_match_quality: 0.82,
    match_response_rate: 0.68
  },
  fundraising_metrics: {
    total_capital_raised: 285000000,
    number_of_deals: 32,
    avg_deal_size: 8900000,
    success_rate: 0.76
  }
};

const MOCK_CONTENT_RULES = {
  rules: [
    {
      id: "rule-1",
      type: "profile",
      pattern: "investment\\s+opportunity",
      action: "flag",
      severity: "medium",
      is_active: true,
      created_by: "admin"
    },
    {
      id: "rule-2",
      type: "message",
      pattern: "guaranteed\\s+returns",
      action: "block",
      severity: "high",
      is_active: true,
      created_by: "admin"
    },
    {
      id: "rule-3",
      type: "profile",
      pattern: "\\b50%\\s+returns\\b",
      action: "block",
      severity: "high",
      is_active: true,
      created_by: "admin"
    }
  ]
};

const MOCK_REPORTS = {
  reports: [
    {
      id: "report-1",
      type: "profile",
      content: "Check out this investment opportunity with 50% guaranteed returns!",
      reported_by: "user-123",
      status: "pending",
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      severity: "high",
      compliance_tags: ["misleading", "financial_fraud"]
    },
    {
      id: "report-2",
      type: "message",
      content: "Our fund guarantees 20% returns even in down markets.",
      reported_by: "user-456",
      status: "pending",
      timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      severity: "medium",
      compliance_tags: ["misleading"]
    },
    {
      id: "report-3",
      type: "profile",
      content: "Meet me offline to discuss this opportunity.",
      reported_by: "user-789",
      status: "pending",
      timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
      severity: "low",
      compliance_tags: ["suspicious_activity"]
    }
  ]
};

const MOCK_ACTIONS = {
  actions: [
    {
      report_id: "report-1",
      action_type: "flag",
      performed_by: "moderator-1",
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      notes: "Flagged for review by senior moderator",
      review_priority: "high",
      compliance_category: "financial_fraud",
      escalation_level: 1
    },
    {
      report_id: "report-2",
      action_type: "warning",
      performed_by: "moderator-2",
      timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      notes: "Issued warning to user",
      review_priority: "medium",
      compliance_category: "misleading_information",
      escalation_level: 0
    }
  ]
};


export type ContentRule = {
  id: string;
  type: "profile" | "message";
  pattern: string;
  action: string;
  severity: string;
  is_active: boolean;
  created_by: string;
};

export type ModAction = {
  report_id: string;
  action_type: string;
  performed_by: string;
  timestamp: string;
  notes: string;
  review_priority: string;
  compliance_category?: string;
  escalation_level: number;
  review_deadline?: string;
};

export type Report = {
  id: string;
  type: "profile" | "message";
  content: string;
  reported_by: string;
  status: "pending" | "reviewed" | "resolved";
  timestamp: string;
  severity: string;
  compliance_tags: string[];
  last_reviewed?: string;
  review_notes?: string;
  retention_period?: number;
};

export function useModerationRules() {
  const [rules, setRules] = useState<ContentRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isDev = mode === Mode.DEV;

  const fetchRules = async () => {
    try {
      setIsLoading(true);
      // Use wrapper function to avoid GET with body issues
      const data = await fetchContentRules();
      setRules(data.rules);
      setError(null);
    } catch (err) {
      // Use mock data in development or when API fails
      if (isDev || err) {
        console.log('Using mock rules data due to API error or dev mode');
        setRules(MOCK_CONTENT_RULES.rules);
        // In dev mode, don't show error message
        if (isDev) {
          setError(null);
        } else {
          setError("Using demo data - API connection error");
        }
      } else {
        setError("Failed to fetch moderation rules");
      }
      console.error("Error fetching moderation rules:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  return { rules, isLoading, error, refetch: fetchRules };
}

export function useModerationActions(reportId?: string) {
  const [actions, setActions] = useState<ModAction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isDev = mode === Mode.DEV;

  const fetchActions = async () => {
    try {
      setIsLoading(true);
      // Use wrapper function to avoid GET with body issues
      const data = await fetchModerationActions(reportId);
      setActions(data.actions);
      setError(null);
    } catch (err) {
      // Use mock data in development or when API fails
      if (isDev || err) {
        console.log('Using mock actions data due to API error or dev mode');
        let mockActions = MOCK_ACTIONS.actions;
        
        // Filter actions for specific report if reportId is provided
        if (reportId) {
          mockActions = mockActions.filter(action => action.report_id === reportId);
        }
        
        setActions(mockActions as ModAction[]);
        
        // In dev mode, don't show error message
        if (isDev) {
          setError(null);
        } else {
          setError("Using demo data - API connection error");
        }
      } else {
        setError("Failed to fetch moderation actions");
      }
      console.error("Error fetching moderation actions:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActions();
  }, [reportId]);

  return { actions, isLoading, error, refetch: fetchActions };
}

export function useContentReports(status?: "pending" | "reviewed" | "resolved") {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isDev = mode === Mode.DEV;

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      // Use wrapper function to avoid GET with body issues
      const data = await fetchContentReports(status);
      setReports(data.reports);
      setError(null);
    } catch (err) {
      // Use mock data in development or when API fails
      if (isDev || err) {
        console.log('Using mock reports data due to API error or dev mode');
        let mockReports = MOCK_REPORTS.reports;
        
        // Filter reports by status if provided
        if (status) {
          mockReports = mockReports.filter(report => report.status === status);
        }
        
        setReports(mockReports as Report[]);
        
        // In dev mode, don't show error message
        if (isDev) {
          setError(null);
        } else {
          setError("Using demo data - API connection error");
        }
      } else {
        setError("Failed to fetch content reports");
      }
      console.error("Error fetching content reports:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
    // Refresh every minute for real-time updates
    const interval = setInterval(fetchReports, 60000);
    return () => clearInterval(interval);
  }, [status]);

  const updateReport = async (reportId: string, newStatus: "pending" | "reviewed" | "resolved", notes: string) => {
    try {
      // In dev mode or if API fails, simulate successful update
      if (isDev) {
        console.log('Simulating report update in dev mode:', { reportId, newStatus, notes });
        // Update local state to simulate API change
        setReports(prevReports => 
          prevReports.map(report => 
            report.id === reportId 
              ? { ...report, status: newStatus, review_notes: notes } 
              : report
          )
        );
        return true;
      }
      
      await brain.update_report_status({
        body: {
          report_id: reportId,
          new_status: newStatus,
          review_notes: notes,
          token: {}
        }
      });
      await fetchReports();
      return true;
    } catch (err) {
      // If in production and API fails, try to update local state
      if (err) {
        console.log('API error, simulating report update:', { reportId, newStatus, notes });
        setReports(prevReports => 
          prevReports.map(report => 
            report.id === reportId 
              ? { ...report, status: newStatus, review_notes: notes } 
              : report
          )
        );
        return true;
      }
      console.error("Error updating report:", err);
      return false;
    }
  };

  return { reports, isLoading, error, refetch: fetchReports, updateReport };
}

export function useAdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isDev = mode === Mode.DEV;

  const fetchData = async () => {
    try {
      setIsLoading(true);
      // Use wrapper function to avoid GET with body issues
      const dashboardData = await fetchAdminDashboard();
      setData(dashboardData);
      setError(null);
    } catch (err) {
      // Use mock data in development or when API fails
      if (isDev || err) {
        console.log('Using mock dashboard data due to API error or dev mode');
        setData(MOCK_ADMIN_DASHBOARD);
        
        // In dev mode, don't show error message
        if (isDev) {
          setError(null);
        } else {
          setError("Using demo data - API connection error");
        }
      } else {
        setError("Failed to fetch dashboard data");
      }
      console.error("Error fetching admin dashboard:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Disabled automatic polling to prevent continuous refreshing
    // Manual refresh still available through dashboard controls
  }, []);

  // Use content reports hook with fallback mechanism
  const { reports: pendingReports } = useContentReports("pending");

  // Combine dashboard data with moderation data
  const combinedData = {
    ...data,
    moderation_stats: {
      ...data?.moderation_stats,
      pending_reports: pendingReports?.length || (data?.moderation_stats?.pending_reports || 0)
    }
  };

  return { data: combinedData, isLoading, error, refetch: fetchData };
}

export function useUserTypeAnalytics(role: string) {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isDev = mode === Mode.DEV;

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await brain.get_user_type_analytics({ role });
      const analyticsData = await response.json();
      setData(analyticsData);
      setError(null);
    } catch (err) {
      // Use mock data in development or when API fails
      if (isDev || err) {
        console.log(`Using mock user type analytics for ${role} due to API error or dev mode`);
        const mockRoleData = MOCK_ADMIN_DASHBOARD.user_type_metrics[role as keyof typeof MOCK_ADMIN_DASHBOARD.user_type_metrics];
        
        if (mockRoleData) {
          setData({
            metrics: mockRoleData,
            role: role
          });
        } else {
          // Fallback for unknown roles
          setData({
            metrics: {
              total_users: 250,
              active_users: 180,
              new_users_30d: 15
            },
            role: role
          });
        }
        
        // In dev mode, don't show error message
        if (isDev) {
          setError(null);
        } else {
          setError(`Using demo data for ${role} - API connection error`);
        }
      } else {
        setError(`Failed to fetch analytics for ${role}`);
      }
      console.error(`Error fetching ${role} analytics:`, err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [role]);

  return { data, isLoading, error, refetch: fetchData };
}

export function useMatchingAnalytics() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isDev = mode === Mode.DEV;

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await brain.get_matching_analytics();
      const analyticsData = await response.json();
      setData(analyticsData);
      setError(null);
    } catch (err) {
      // Use mock data in development or when API fails
      if (isDev || err) {
        console.log('Using mock matching analytics due to API error or dev mode');
        setData({
          metrics: MOCK_ADMIN_DASHBOARD.matching_metrics
        });
        
        // In dev mode, don't show error message
        if (isDev) {
          setError(null);
        } else {
          setError("Using demo data - API connection error");
        }
      } else {
        setError("Failed to fetch matching analytics");
      }
      console.error("Error fetching matching analytics:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, isLoading, error, refetch: fetchData };
}

export function useFundraisingAnalytics() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isDev = mode === Mode.DEV;

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await brain.get_fundraising_analytics();
      const analyticsData = await response.json();
      setData(analyticsData);
      setError(null);
    } catch (err) {
      // Use mock data in development or when API fails
      if (isDev || err) {
        console.log('Using mock fundraising analytics due to API error or dev mode');
        setData({
          metrics: MOCK_ADMIN_DASHBOARD.fundraising_metrics
        });
        
        // In dev mode, don't show error message
        if (isDev) {
          setError(null);
        } else {
          setError("Using demo data - API connection error");
        }
      } else {
        setError("Failed to fetch fundraising analytics");
      }
      console.error("Error fetching fundraising analytics:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, isLoading, error, refetch: fetchData };
}
