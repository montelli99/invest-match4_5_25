export interface EngagementMetric {
  current: number;
  previous?: number;
  change_percentage?: number;
}

export interface EngagementMetrics {
  profile_views: EngagementMetric;
  message_response_rate: EngagementMetric;
  total_connections: EngagementMetric;
  active_conversations: EngagementMetric;
}

export interface Activity {
  description: string;
  timestamp: string;
  type: string;
}

export interface Match {
  uid: string;
  name: string;
  role: string;
  company: string;
  match_percentage: number;
  mutual_connections: number;
}

export interface Analytics {
  engagement_metrics: EngagementMetrics;
  recent_activities: Activity[];
  recent_matches: Match[];
  weekly_views: number[];
}

export interface Contact {
  id: string;
  name: string;
  role: string;
  company: string;
  email: string;
}

export interface Message {
  id: string;
  content: string;
  timestamp: string;
  sender_id: string;
}

export interface Conversation {
  other_user: {
    uid: string;
    display_name: string;
    company_name?: string;
  };
  messages: Message[];
  unread_count: number;
}

export interface UserProfile {
  email: string;
  name: string;
  userType: 'fund_manager' | 'limited_partner' | 'capital_raiser' | 'fund_of_funds';
  hasPassword?: boolean;
  profileCompletion?: {
    requiredFields: string[];
    optionalFields: string[];
    completionPercentage: number;
  };
  // Add other profile fields as needed
}

// Support system types
export interface TicketPriority {
  low: "low";
  medium: "medium";
  high: "high";
  urgent: "urgent";
}

export interface TicketStatus {
  open: "open";
  in_progress: "in_progress";
  resolved: "resolved";
  closed: "closed";
}

export interface Attachment {
  id: string;
  filename: string;
  content_type: string;
  size: number;
  url: string;
}

export interface TicketRequest {
  title: string;
  description: string;
  category_id: string;
  priority: keyof TicketPriority;
  attachments?: string[];
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  category_id: string;
  user_id: string;
  priority: keyof TicketPriority;
  status: keyof TicketStatus;
  created_at: string;
  updated_at: string;
  attachments?: Attachment[];
  assigned_to?: string;
  resolution?: string;
}

export interface KnowledgeBaseArticle {
  id: string;
  title: string;
  content: string;
  category_id: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  author_id: string;
}

export interface HowToGuide {
  id: string;
  title: string;
  content: string;
  feature: string;
  steps: string[];
  created_at: string;
  updated_at: string;
  author_id: string;
}

export interface UserSubscription {
  tier: "free" | "basic" | "professional" | "enterprise";
  status: "active" | "cancelled" | "expired";
  expiry_date?: string;
  features: string[];
}
