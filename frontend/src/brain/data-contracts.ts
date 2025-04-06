/** ActionType */
export enum ActionType {
  Filter = "filter",
  Hide = "hide",
  Review = "review",
  Reject = "reject",
}

/** AddReactionRequest */
export interface AddReactionRequest {
  /** Message Id */
  message_id: string;
  /** Emoji */
  emoji: string;
  /** User Id */
  user_id: string;
}

/**
 * AdminActionResponse
 * Response model for admin actions
 */
export interface AdminActionResponse {
  /**
   * Success
   * Whether the action was successful
   */
  success: boolean;
  /**
   * Message
   * Description of the action result
   */
  message: string;
}

/** AdminAnalytics */
export interface AdminAnalytics {
  /** Total Users */
  total_users: Record<string, number>;
  /** Active Users */
  active_users: Record<string, number>;
  /** Total Connections */
  total_connections: number;
  /** Total Successful Matches */
  total_successful_matches: number;
  /** Avg Match Quality */
  avg_match_quality: number;
  /** User Growth */
  user_growth: Record<string, any>;
  /** Engagement Metrics */
  engagement_metrics: Record<string, number>;
  /** Conversion Rates */
  conversion_rates: Record<string, number>;
}

/** AdminDashboard */
export interface AdminDashboard {
  /** Last Updated */
  last_updated: string;
  platform_metrics: PlatformMetrics;
  /** User Type Metrics */
  user_type_metrics: Record<string, UserTypeMetrics>;
  matching_metrics: MatchingMetrics;
  fundraising_metrics: AppApisModelsFundraisingMetrics;
  /** Recent Activities */
  recent_activities: Record<string, any>[];
}

/**
 * AdminUser
 * Represents an admin user in the system
 */
export interface AdminUser {
  /**
   * Uid
   * Unique identifier for the user
   */
  uid: string;
  /**
   * Email
   * User's email address
   */
  email: string;
  /**
   * Roles
   * List of roles assigned to the user
   */
  roles: UserRoleInfo[];
  /**
   * Is Active
   * Whether the user account is active
   */
  is_active: boolean;
}

/**
 * AnalyticsEventType
 * Types of document analytics events
 */
export enum AnalyticsEventType {
  View = "view",
  Download = "download",
  SectionView = "section_view",
  TimeSpent = "time_spent",
  ScrollDepth = "scroll_depth",
  LinkClick = "link_click",
  Share = "share",
}

/** AnalyticsSummary */
export interface AnalyticsSummary {
  /** Last Updated */
  last_updated: string;
  engagement_metrics: EngagementMetrics;
  /** Recent Matches */
  recent_matches: MatchRecommendation[];
  /** Recent Activities */
  recent_activities: TimelineActivity[];
  /** Weekly Views */
  weekly_views: number[];
  /** Analytics for matches */
  match_analytics: MatchAnalytics;
  lp_analytics?: LPAnalytics | null;
}

/**
 * AnonymizationConfig
 * Configuration for data anonymization
 */
export interface AnonymizationConfig {
  /** Rules */
  rules: AnonymizationRule[];
  /** User Id */
  user_id: string;
}

/**
 * AnonymizationRule
 * Model for configuring anonymization rules
 */
export interface AnonymizationRule {
  /** Field Name */
  field_name: string;
  /** Method */
  method: string;
  /** Pattern */
  pattern?: string | null;
  /**
   * Mask Char
   * @default "*"
   */
  mask_char?: string | null;
  /**
   * Preserve Length
   * @default true
   */
  preserve_length?: boolean | null;
}

/**
 * AnonymizedData
 * Response model for anonymized data
 */
export interface AnonymizedData {
  /** Data */
  data: Record<string, any>;
  /** Applied Rules */
  applied_rules: string[];
}

/** AttachmentResponse */
export interface AttachmentResponse {
  /** Id */
  id: string;
  /** Filename */
  filename: string;
  /** Content Type */
  content_type: string;
  /** Size */
  size: number;
  /** Url */
  url: string;
  /**
   * Created At
   * @format date-time
   */
  created_at: string;
  /** User Id */
  user_id: string;
}

/** BatchOperationRequest */
export interface BatchOperationRequest {
  /**
   * Rule Ids
   * IDs of rules to operate on
   */
  rule_ids: string[];
  /**
   * Operation
   * Operation to perform
   */
  operation: string;
  /**
   * Parameters
   * Operation parameters
   */
  parameters?: Record<string, any> | null;
  /**
   * Token
   * Authentication token
   */
  token: Record<string, any>;
}

/** Body_anonymize_data */
export interface BodyAnonymizeData {
  /** Data */
  data: Record<string, any>;
  /** Configuration for data anonymization */
  config: AnonymizationConfig;
}

/** Body_create_ticket */
export interface BodyCreateTicket {
  request: TicketRequest;
  /** Current User */
  current_user: Record<string, any>;
}

/** Body_send_message_endpoint */
export interface BodySendMessageEndpoint {
  /** Request model for sending messages */
  request: SendMessageRequest;
  /** Request model for token validation */
  token: AppApisAuthUtilsTokenRequest;
}

/** Body_update_content_rule_v1 */
export interface BodyUpdateContentRuleV1 {
  /** Updates */
  updates: Record<string, any>;
  /** Token */
  token: Record<string, any>;
}

/** Body_update_ticket */
export interface BodyUpdateTicket {
  /** Updates */
  updates: Record<string, any>;
  /** Current User */
  current_user: Record<string, any>;
}

/** Body_update_typing_indicator */
export interface BodyUpdateTypingIndicator {
  /** Request model for typing indicators */
  request: TypingIndicatorRequest;
  /** Request model for token validation */
  token: AppApisAuthUtilsTokenRequest;
}

/** Body_upload_attachment */
export interface BodyUploadAttachment {
  body: UploadAttachmentRequest;
  /** Request model for token validation */
  token: AppApisAuthUtilsTokenRequest;
}

/** Body_upload_capital_raiser_issues */
export interface BodyUploadCapitalRaiserIssues {
  /**
   * File
   * @format binary
   */
  file: File;
}

/** Body_upload_document */
export interface BodyUploadDocument {
  /**
   * File
   * @format binary
   */
  file: File;
  /** Tags */
  tags?: string[] | null;
}

/** Body_upload_profile_image */
export interface BodyUploadProfileImage {
  /**
   * File
   * @format binary
   */
  file: File;
}

/** Body_upload_verification_document */
export interface BodyUploadVerificationDocument {
  /** User Id */
  user_id: string;
  /** Document Type */
  document_type: string;
  /**
   * File
   * @format binary
   */
  file: File;
  /** Expiry Date */
  expiry_date?: string | null;
  /** Metadata */
  metadata?: string | null;
  /**
   * Is Required
   * @default true
   */
  is_required?: boolean;
  /** Verification Level */
  verification_level?: string | null;
}

/**
 * CacheStatus
 * Cache status with performance metrics
 */
export interface CacheStatus {
  /** Sec Edgar */
  SEC_EDGAR: string;
  /** Crunchbase */
  Crunchbase: string;
  /** Openbb */
  OpenBB: string;
  /** Performance metrics for search operations */
  performance: AppApisAiListBuilderPerformanceMetrics;
}

/**
 * CampaignRules
 * Rules for special commission campaigns
 *
 * Fields:
 *     campaign_id: Unique identifier for the campaign
 *     start_date: When the campaign starts
 *     end_date: When the campaign ends
 *     base_rate: Base commission rate for the campaign
 *     bonus_rate: Additional bonus rate if conditions are met
 *     min_referrals: Minimum referrals needed for bonus
 *     max_commission: Maximum commission allowed
 */
export interface CampaignRules {
  /** Campaign Id */
  campaign_id: string;
  /**
   * Start Date
   * @format date-time
   */
  start_date: string;
  /**
   * End Date
   * @format date-time
   */
  end_date: string;
  /**
   * Base Rate
   * @min 0
   * @max 100
   */
  base_rate: number;
  /**
   * Bonus Rate
   * @min 0
   * @max 50
   */
  bonus_rate: number;
  /**
   * Min Referrals
   * @min 0
   */
  min_referrals: number;
  /**
   * Max Commission
   * @min 0
   */
  max_commission: number;
}

/** CancellationRequest */
export interface CancellationRequest {
  /** Subscription Id */
  subscription_id: string;
  /** User Id */
  user_id: string;
  /** Reason */
  reason: string;
  /**
   * Immediate
   * @default false
   */
  immediate?: boolean;
  /** Token */
  token: Record<string, any>;
}

/** CancellationResponse */
export interface CancellationResponse {
  /** Status */
  status: string;
  /** Effective Date */
  effective_date: string;
}

/** CapitalRaiserAnalytics */
export interface CapitalRaiserAnalytics {
  /**
   * Profile Views
   * @default 0
   */
  profile_views?: number;
  /**
   * Profile Completeness
   * @default 0
   */
  profile_completeness?: number;
  /**
   * Total Connections
   * @default 0
   */
  total_connections?: number;
  /**
   * Active Connections
   * @default 0
   */
  active_connections?: number;
  /**
   * Avg Relationship Strength
   * @default 0
   */
  avg_relationship_strength?: number;
  /**
   * Response Rate
   * @default 0
   */
  response_rate?: number;
  /** Last Active */
  last_active?: string | null;
  /**
   * Total Deals
   * @default 0
   */
  total_deals?: number;
  /**
   * Total Capital Raised
   * @default 0
   */
  total_capital_raised?: number;
  /**
   * Success Rate
   * @default 0
   */
  success_rate?: number;
  /**
   * Avg Deal Size
   * @default 0
   */
  avg_deal_size?: number;
  /**
   * Client Satisfaction
   * @default 0
   */
  client_satisfaction?: number;
}

/** CapitalRaiserMetrics */
export interface CapitalRaiserMetrics {
  /** Raiser Id */
  raiser_id: string;
  /** Name */
  name: string;
  /** Success Rate */
  success_rate: number;
  /** Total Capital Raised */
  total_capital_raised: number;
  /** Avg Deal Size */
  avg_deal_size: number;
  /** Deal Flow Quality Score */
  deal_flow_quality_score: number;
  /** Sector Expertise */
  sector_expertise: Record<string, number>;
  /** Client Retention Rate */
  client_retention_rate: number;
  /** Average Fundraising Period */
  average_fundraising_period: number;
  /** Network Strength Score */
  network_strength_score: number;
  /** Client Satisfaction Score */
  client_satisfaction_score?: number | null;
  /** Performance Vs Target */
  performance_vs_target: number;
  /** Communication Quality Score */
  communication_quality_score: number;
}

/**
 * ChartData
 * Model for chart data response
 */
export interface ChartData {
  /** Labels */
  labels: string[];
  /** Datasets */
  datasets: Record<string, any>[];
  /** Total */
  total: number;
}

/** Comment */
export interface Comment {
  /** Id */
  id: string;
  /** Ticket Id */
  ticket_id: string;
  /** User Id */
  user_id: string;
  /** Content */
  content: string;
  /** Parent Id */
  parent_id?: string | null;
  /**
   * Depth
   * @default 0
   */
  depth?: number;
  /** Attachments */
  attachments?: CommentAttachment[] | null;
  /** Reactions */
  reactions?: Record<string, CommentReaction[]> | null;
  /** Reports */
  reports?: CommentReport[] | null;
  /**
   * Created At
   * @format date-time
   */
  created_at: string;
  /** Updated At */
  updated_at?: string | null;
  /**
   * Is Edited
   * @default false
   */
  is_edited?: boolean;
  /**
   * Is Deleted
   * @default false
   */
  is_deleted?: boolean;
  /**
   * Moderation Status
   * @default "approved"
   */
  moderation_status?: string;
}

/** CommentAttachment */
export interface CommentAttachment {
  /** Id */
  id: string;
  /** Filename */
  filename: string;
  /** Content Type */
  content_type: string;
  /** Size */
  size: number;
  /** Url */
  url: string;
}

/** CommentReaction */
export interface CommentReaction {
  /** Emoji */
  emoji: string;
  /** User Id */
  user_id: string;
  /**
   * Created At
   * @format date-time
   */
  created_at: string;
}

/** CommentReport */
export interface CommentReport {
  /** Reason */
  reason: string;
  /** Reporter Id */
  reporter_id: string;
  /**
   * Status
   * @default "pending"
   */
  status?: string;
  /**
   * Created At
   * @format date-time
   */
  created_at: string;
}

/**
 * CommissionCalculation
 * Result of a commission calculation
 *
 * Fields:
 *     base_amount: Base commission amount
 *     performance_bonus: Additional amount from performance
 *     campaign_bonus: Additional amount from campaigns
 *     volume_adjustment: Adjustment based on volume
 *     final_amount: Final commission amount after all calculations
 *     calculation_breakdown: Detailed breakdown of calculation
 *     applied_rules: List of rules that were applied
 */
export interface CommissionCalculation {
  /** Base Amount */
  base_amount: number;
  /**
   * Performance Bonus
   * @default 0
   */
  performance_bonus?: number;
  /**
   * Campaign Bonus
   * @default 0
   */
  campaign_bonus?: number;
  /**
   * Volume Adjustment
   * @default 0
   */
  volume_adjustment?: number;
  /** Final Amount */
  final_amount: number;
  /** Calculation Breakdown */
  calculation_breakdown: Record<string, number>;
  /** Applied Rules */
  applied_rules: string[];
}

/**
 * CommissionStructure
 * Complete commission structure configuration
 *
 * Fields:
 *     structure_id: Unique identifier for this structure
 *     name: Name of the commission structure
 *     description: Detailed description
 *     base_rate: Default commission rate
 *     performance_multiplier: Multiplier based on performance (0-2)
 *     campaign_rules: Optional campaign-specific rules
 *     volume_thresholds: Volume-based rate adjustments
 *     max_commission: Maximum commission allowed
 *     min_commission: Minimum commission to be paid
 *     is_active: Whether this structure is currently active
 */
export interface CommissionStructure {
  /** Structure Id */
  structure_id: string;
  /** Name */
  name: string;
  /** Description */
  description: string;
  /**
   * Base Rate
   * @min 0
   * @max 100
   */
  base_rate: number;
  /**
   * Performance Multiplier
   * @min 0
   * @max 2
   */
  performance_multiplier: number;
  campaign_rules?: CampaignRules | null;
  /**
   * Volume Thresholds
   * @default []
   */
  volume_thresholds?: VolumeThreshold[];
  /**
   * Max Commission
   * @min 0
   */
  max_commission: number;
  /**
   * Min Commission
   * @min 0
   */
  min_commission: number;
  /**
   * Is Active
   * @default true
   */
  is_active?: boolean;
}

/** ComprehensiveAnalytics */
export interface ComprehensiveAnalytics {
  /** Total Aum */
  total_aum: number;
  /** Holdings */
  holdings: Record<string, any>[];
  /** Industry Allocation */
  industry_allocation: Record<string, any>[];
  /** Quarterly Changes */
  quarterly_changes: Record<string, number>[];
  /** Client Types */
  client_types: Record<string, any>[];
  /** Fee Structures */
  fee_structures: Record<string, string>[];
  /** Investment Policies */
  investment_policies: Record<string, string>[];
  /** Risk Factors */
  risk_factors: string[];
}

/**
 * ComprehensiveAnalyticsResponse
 * Comprehensive analytics for all KPIs
 */
export interface ComprehensiveAnalyticsResponse {
  /** User growth and onboarding metrics */
  user_growth: UserGrowthMetrics;
  /** Networking and contact management metrics */
  networking: NetworkingMetrics;
  /** Matching algorithm performance metrics */
  matching_algorithm: MatchingAlgorithmMetrics;
  /** Deal flow and meeting metrics */
  deal_flow: DealFlowMetrics;
  /** Sector-specific performance metrics */
  sector_insights: SectorInsightsMetrics;
  /** Subscription and revenue metrics */
  monetization: MonetizationMetrics;
  /** User satisfaction and support metrics */
  satisfaction: SatisfactionMetrics;
  /** System performance and reliability metrics */
  performance: AppApisAnalyticsEnhancedPerformanceMetrics;
  /**
   * Last Updated
   * @format date-time
   */
  last_updated?: string;
}

/** ComprehensiveDashboardResponse */
export interface ComprehensiveDashboardResponse {
  /** Timestamp */
  timestamp: string;
  /** Fund Manager Analytics */
  fund_manager_analytics: FundManagerPerformanceMetrics[];
  /** Lp Investment Patterns */
  lp_investment_patterns: LPInvestmentPattern[];
  /** Capital Raiser Metrics */
  capital_raiser_metrics: CapitalRaiserMetrics[];
  /** Sector Analytics */
  sector_analytics: AppApisFundOfFundsAnalyticsSectorAnalytics[];
  network_analytics: NetworkAnalytics;
  /** Investment Opportunity Index */
  investment_opportunity_index: number;
  /** Trending Sectors */
  trending_sectors: Record<string, any>[];
  /** Market Sentiment Indicators */
  market_sentiment_indicators: Record<string, number>;
  /** Recommendation Engine Results */
  recommendation_engine_results: Record<string, any>[];
}

/** ConnectAccount */
export interface ConnectAccount {
  /** Id */
  id: string;
  /** User Id */
  user_id: string;
  /** Stripe Id */
  stripe_id: string;
  account_type: ConnectAccountType;
  status: ConnectAccountStatus;
  /**
   * Created At
   * @format date-time
   */
  created_at: string;
  /** Enabled At */
  enabled_at?: string | null;
  /** Disabled At */
  disabled_at?: string | null;
  /** Country */
  country: string;
  /** Default Currency */
  default_currency: string;
  /**
   * Payouts Enabled
   * @default false
   */
  payouts_enabled?: boolean;
  /** Requirements */
  requirements?: Record<string, any> | null;
  /** Metadata */
  metadata?: Record<string, any> | null;
}

/** ConnectAccountResponse */
export interface ConnectAccountResponse {
  account: ConnectAccount;
  /** Onboarding Url */
  onboarding_url?: string | null;
}

/** ConnectAccountStatus */
export enum ConnectAccountStatus {
  Pending = "pending",
  Enabled = "enabled",
  Disabled = "disabled",
  Rejected = "rejected",
}

/** ConnectAccountType */
export enum ConnectAccountType {
  Standard = "standard",
  Express = "express",
  Custom = "custom",
}

/** Contact */
export interface Contact {
  /** Id */
  id: string;
  /** Owner Id */
  owner_id: string;
  /** Name */
  name: string;
  /** Email */
  email?: string | null;
  /** Phone */
  phone?: string | null;
  /** Company */
  company?: string | null;
  /** Title */
  title?: string | null;
  contact_type: UserType;
  /** Notes */
  notes?: string | null;
  /** Tags */
  tags?: string[];
  /** Created At */
  created_at: string;
  /** Updated At */
  updated_at?: string | null;
  /** Linkedin Url */
  linkedin_url?: string | null;
  /** Last Connected */
  last_connected?: string | null;
  /**
   * Is Shared
   * @default false
   */
  is_shared?: boolean;
  /** Shared With */
  shared_with?: string[];
  /** Match Criteria */
  match_criteria?: Record<string, any> | null;
}

/** ContactMatch */
export interface ContactMatch {
  /** Contact Id */
  contact_id: string;
  /** Match Id */
  match_id: string;
  /** Match Score */
  match_score: number;
  /** Match Reasons */
  match_reasons?: string[];
  /** Matched At */
  matched_at: string;
  /**
   * Status
   * @default "pending"
   */
  status?: string;
}

/** ContactMatchSettings */
export interface ContactMatchSettings {
  /**
   * Enable Global Matching
   * Enable global matching of all contacts
   * @default false
   */
  enable_global_matching?: boolean;
  /**
   * Auto Share Matches
   * Automatically share matched contacts with connection
   * @default false
   */
  auto_share_matches?: boolean;
  /**
   * Minimum Match Score
   * Minimum match score percentage
   * @min 0
   * @max 100
   * @default 70
   */
  minimum_match_score?: number;
  /**
   * Match Across All Users
   * Allow matching with all users instead of just connections
   * @default false
   */
  match_across_all_users?: boolean;
}

/** ContentRule */
export interface ContentRule {
  /** Id */
  id: string;
  /** Name */
  name: string;
  /** Pattern */
  pattern: string;
  /** Action */
  action: string;
  /**
   * Enabled
   * @default true
   */
  enabled?: boolean;
}

/**
 * Conversation
 * Conversation model
 */
export interface Conversation {
  /** Messages */
  messages: Message[];
  /** User info model */
  other_user: UserInfo;
  /**
   * Unread Count
   * @default 0
   */
  unread_count?: number;
}

/** CreateCommentRequest */
export interface CreateCommentRequest {
  /** Ticket Id */
  ticket_id: string;
  /** Content */
  content: string;
  /** Parent Id */
  parent_id?: string | null;
  /** Attachments */
  attachments?: string[] | null;
}

/** CreateConnectAccountRequest */
export interface CreateConnectAccountRequest {
  /** User Id */
  user_id: string;
  /** @default "express" */
  account_type?: ConnectAccountType;
  /**
   * Country
   * @default "US"
   */
  country?: string;
  /**
   * Default Currency
   * @default "usd"
   */
  default_currency?: string;
  /** Metadata */
  metadata?: Record<string, any> | null;
}

/** CreateProfileRequest */
export interface CreateProfileRequest {
  /** Profile */
  profile: Record<string, any>;
  /** Token */
  token: Record<string, any>;
}

/** CreateTestPaymentRequest */
export interface CreateTestPaymentRequest {
  /** Amount */
  amount: number;
  /**
   * Currency
   * @default "usd"
   */
  currency?: string;
  payment_method: PaymentMethod;
  /** Description */
  description?: string | null;
  /** Metadata */
  metadata?: Record<string, any> | null;
  card?: TestCard | null;
  /** Bank Account */
  bank_account?: Record<string, any> | null;
}

/**
 * CreateTrackableLinkRequest
 * Request to create a trackable link
 */
export interface CreateTrackableLinkRequest {
  /** Document Id */
  document_id: string;
  /** User Id */
  user_id: string;
  /** Parameters for tracking document access */
  tracking_params: TrackingParams;
  /** Expires In Days */
  expires_in_days?: number | null;
}

/**
 * CreateTrialCodeRequest
 * Request to create a trial code
 */
export interface CreateTrialCodeRequest {
  /** Trial Period */
  trial_period: number;
  tier: SubscriptionTier;
  /** Expiry Date */
  expiry_date: string;
  /** Max Uses */
  max_uses: number;
  /** Code */
  code?: string | null;
}

/** CrunchbaseEntityResponse */
export interface CrunchbaseEntityResponse {
  /** Name */
  name: string;
  /** Domain */
  domain?: string | null;
  /** Location */
  location?: string | null;
  /** Description */
  description?: string | null;
  /** Founded On */
  founded_on?: string | null;
  /** Linkedin */
  linkedin?: string | null;
  /** Twitter */
  twitter?: string | null;
  /** Facebook */
  facebook?: string | null;
  /** Num Employees Enum */
  num_employees_enum?: string | null;
  /** Last Funding Type */
  last_funding_type?: string | null;
  /** Total Funding Usd */
  total_funding_usd?: number | null;
  /** Investor Types */
  investor_types?: string[] | null;
  /** Investment Stages */
  investment_stages?: string[] | null;
}

/**
 * DealFlowMetrics
 * Deal flow and meeting metrics
 */
export interface DealFlowMetrics {
  /** Metric with current value and change percentage */
  meetings_scheduled: MetricWithChange;
  /** Metric with current value and change percentage */
  meeting_completion_rate: MetricWithChange;
  /** Metric with current value and change percentage */
  deal_conversion_rate: MetricWithChange;
  /** Metric with current value and change percentage */
  average_deal_size: MetricWithChange;
  /** Metric with current value and change percentage */
  time_from_match_to_deal: MetricWithChange;
}

/**
 * DocumentMetadata
 * Model for document metadata
 */
export interface DocumentMetadata {
  /** Document Id */
  document_id: string;
  /** Filename */
  filename: string;
  /** File Type */
  file_type: string;
  /** Size Bytes */
  size_bytes: number;
  /** Uploaded By */
  uploaded_by: string;
  /**
   * Upload Date
   * @format date-time
   */
  upload_date: string;
  /**
   * Last Modified
   * @format date-time
   */
  last_modified: string;
  /**
   * Is Encrypted
   * @default true
   */
  is_encrypted?: boolean;
  /**
   * Shared With
   * @default []
   */
  shared_with?: string[];
  /**
   * Version
   * @default 1
   */
  version?: number;
  /**
   * Tags
   * @default []
   */
  tags?: string[];
  /** Checksum */
  checksum: string;
  /**
   * Scan Status
   * @default "pending"
   */
  scan_status?: string;
  /**
   * Previous Versions
   * @default []
   */
  previous_versions?: string[];
  /** Retention Period */
  retention_period?: number | null;
  /**
   * Download Count
   * @default 0
   */
  download_count?: number;
  /** Last Accessed */
  last_accessed?: string | null;
}

/**
 * DocumentSection
 * Represents a section in a document for analytics
 */
export interface DocumentSection {
  /** Section Id */
  section_id: string;
  /** Title */
  title: string;
  /** Page */
  page?: number | null;
  /** Type */
  type?: string | null;
}

/**
 * DocumentSectionRequest
 * Request to register document sections for tracking
 */
export interface DocumentSectionRequest {
  /** Document Id */
  document_id: string;
  /** User Id */
  user_id: string;
  /** Sections */
  sections: DocumentSection[];
}

/**
 * DocumentType
 * Document types with special tracking
 */
export enum DocumentType {
  PitchDeck = "pitch_deck",
  DataRoom = "data_room",
  FinancialReport = "financial_report",
  Regular = "regular",
}

/** EffectivenessMetrics */
export interface EffectivenessMetrics {
  /** Time-based performance metrics */
  time_metrics: TimeMetrics;
  /** Quality-based performance metrics */
  quality_metrics: QualityMetrics;
  /**
   * User Appeals
   * Number of user appeals
   * @default 0
   */
  user_appeals?: number;
  /**
   * Appeal Success Rate
   * Rate of successful appeals
   * @default 0
   */
  appeal_success_rate?: number;
  /**
   * Automated Actions
   * Number of automated actions taken
   * @default 0
   */
  automated_actions?: number;
  /**
   * Manual Actions
   * Number of manual moderator actions
   * @default 0
   */
  manual_actions?: number;
}

/** EmailNotification */
export interface EmailNotification {
  /** Recipient Email */
  recipient_email: string;
  /** Subject */
  subject: string;
  /** Content */
  content: string;
}

/** EngagementMetrics */
export interface EngagementMetrics {
  /** Trend data for a metric */
  profile_views: EngagementTrend;
  /** Profile View History */
  profile_view_history: number[];
  /** Trend data for a metric */
  message_response_rate: EngagementTrend;
  /** Trend data for a metric */
  total_connections: EngagementTrend;
  /** Trend data for a metric */
  active_conversations: EngagementTrend;
  /** Average Response Time */
  average_response_time: number;
}

/**
 * EngagementTrend
 * Trend data for a metric
 */
export interface EngagementTrend {
  /** Current */
  current: number;
  /** Previous */
  previous: number;
  /** Change Percentage */
  change_percentage: number;
}

/** EnrichedInvestorProfile */
export interface EnrichedInvestorProfile {
  /** Name */
  name: string;
  /** Company */
  company: string;
  /** Role */
  role?: string | null;
  /** Fund Type */
  fund_type?: string | null;
  /** Fund Size */
  fund_size?: number | null;
  /** Investment Focus */
  investment_focus?: string[] | null;
  /** Historical Returns */
  historical_returns?: number | null;
  /** Risk Profile */
  risk_profile?: string | null;
  /** Source */
  source?: string | null;
  /** Last Updated */
  last_updated?: string | null;
  /** Location */
  location?: string | null;
  /** Website */
  website?: string | null;
  /** Description */
  description?: string | null;
  /** Founded On */
  founded_on?: string | null;
  /** Linkedin */
  linkedin?: string | null;
  /** Twitter */
  twitter?: string | null;
  /** Facebook */
  facebook?: string | null;
  /** Num Employees Enum */
  num_employees_enum?: string | null;
  /** Last Funding Type */
  last_funding_type?: string | null;
  /** Total Funding Usd */
  total_funding_usd?: number | null;
  /** Investor Types */
  investor_types?: string[] | null;
  /** Investment Stages */
  investment_stages?: string[] | null;
}

/**
 * EstimateRequest
 * Request model for size estimation
 */
export interface EstimateRequest {
  /** User Id */
  user_id: string;
  /**
   * Include Profile
   * @default true
   */
  include_profile?: boolean;
  /**
   * Include Matches
   * @default true
   */
  include_matches?: boolean;
  /**
   * Include Messages
   * @default true
   */
  include_messages?: boolean;
  /**
   * Include Analytics
   * @default true
   */
  include_analytics?: boolean;
  /** Start Date */
  start_date?: string | null;
  /** End Date */
  end_date?: string | null;
}

/**
 * EstimateResponse
 * Response model for size estimation
 */
export interface EstimateResponse {
  /** Estimated Size Bytes */
  estimated_size_bytes: number;
}

/**
 * ExportFormat
 * Format options for analytics export
 */
export interface ExportFormat {
  /** Start Date */
  start_date: string;
  /** End Date */
  end_date: string;
  /**
   * Format
   * @default "csv"
   */
  format?: string;
  /** Metrics */
  metrics: string[];
}

/**
 * ExportProgress
 * Model for tracking export progress
 */
export interface ExportProgress {
  /** Export Id */
  export_id: string;
  /**
   * Progress
   * @default 0
   */
  progress?: number;
  /**
   * Status
   * @default "processing"
   */
  status?: "processing" | "completed" | "failed";
  /** Download Url */
  download_url?: string | null;
  /** Error Message */
  error_message?: string | null;
}

/**
 * ExportRequest
 * Request model for data export
 */
export interface ExportRequest {
  /** User Id */
  user_id: string;
  /**
   * Format
   * @default "json"
   */
  format?: "csv" | "json" | "pdf";
  /**
   * Include Profile
   * @default true
   */
  include_profile?: boolean;
  /**
   * Include Matches
   * @default true
   */
  include_matches?: boolean;
  /**
   * Include Messages
   * @default true
   */
  include_messages?: boolean;
  /**
   * Include Analytics
   * @default true
   */
  include_analytics?: boolean;
  /** Start Date */
  start_date?: string | null;
  /** End Date */
  end_date?: string | null;
}

/**
 * ExportResponse
 * Response model for export requests
 */
export interface ExportResponse {
  /** Export Id */
  export_id: string;
  /** Status */
  status: string;
  /** Download Url */
  download_url?: string | null;
  /** Error Message */
  error_message?: string | null;
}

/** ExtendedUserProfile */
export interface ExtendedUserProfile {
  /** User Id */
  user_id: string;
  /** Name */
  name: string;
  /** Email */
  email?: string | null;
  /** Created At */
  created_at?: string | null;
  /** Updated At */
  updated_at?: string | null;
  user_type: UserType;
  /** Company Name */
  company_name?: string | null;
  /** Title */
  title?: string | null;
  /** Bio */
  bio?: string | null;
  /** Linkedin Url */
  linkedin_url?: string | null;
  /** Profile Image Url */
  profile_image_url?: string | null;
  /** Contact Email */
  contact_email?: string | null;
  /** Phone */
  phone?: string | null;
  /** Location */
  location?: string | null;
  /** Website */
  website?: string | null;
  /**
   * Verified
   * @default false
   */
  verified?: boolean;
  /** @default "none" */
  verification_level?: VerificationLevel;
  /** @default "free" */
  subscription_tier?: SubscriptionTier;
  /** Last Active */
  last_active?: string | null;
  /** Specializations */
  specializations?: string[];
  /**
   * Total Connections
   * @default 0
   */
  total_connections?: number;
  /** Match Percentage */
  match_percentage?: number | null;
  /**
   * Is Public
   * @default true
   */
  is_public?: boolean;
}

/** FeatureAccess */
export enum FeatureAccess {
  None = "none",
  Disabled = "disabled",
  Limited = "limited",
  Basic = "basic",
  Full = "full",
}

/** FeedbackRating */
export interface FeedbackRating {
  /** Page */
  page: string;
  /** Overall Rating */
  overall_rating: number;
  /** Usability Rating */
  usability_rating: string;
  /** Feature Ratings */
  feature_ratings: Record<string, any>;
  /** Improvement Suggestions */
  improvement_suggestions: string;
  /** User Id */
  user_id?: string | null;
  /** Timestamp */
  timestamp?: string | null;
}

/** FeedbackResponse */
export interface FeedbackResponse {
  /** Success */
  success: boolean;
  /** Message */
  message: string;
}

/** FundManagerAnalytics */
export interface FundManagerAnalytics {
  /**
   * Profile Views
   * @default 0
   */
  profile_views?: number;
  /**
   * Profile Completeness
   * @default 0
   */
  profile_completeness?: number;
  /**
   * Total Connections
   * @default 0
   */
  total_connections?: number;
  /**
   * Active Connections
   * @default 0
   */
  active_connections?: number;
  /**
   * Avg Relationship Strength
   * @default 0
   */
  avg_relationship_strength?: number;
  /**
   * Response Rate
   * @default 0
   */
  response_rate?: number;
  /** Last Active */
  last_active?: string | null;
  /**
   * Total Funds Managed
   * @default 0
   */
  total_funds_managed?: number;
  /**
   * Total Aum
   * @default 0
   */
  total_aum?: number;
  /**
   * Avg Fund Performance
   * @default 0
   */
  avg_fund_performance?: number;
  /**
   * Lp Match Rate
   * @default 0
   */
  lp_match_rate?: number;
  /**
   * Successful Raises
   * @default 0
   */
  successful_raises?: number;
}

/**
 * FundManagerMetrics
 * Metrics for fund manager comparison
 */
export interface FundManagerMetrics {
  /** Fund Size */
  fund_size: number;
  /** Historical Returns */
  historical_returns: number;
  /** Risk Score */
  risk_score: number;
  /** Investment Horizon */
  investment_horizon: number;
  /** Sector Focus */
  sector_focus: string[];
  /** Track Record Years */
  track_record_years: number;
  /** Total Investments */
  total_investments: number;
  /** Successful Exits */
  successful_exits: number;
}

/** FundManagerPerformanceMetrics */
export interface FundManagerPerformanceMetrics {
  /** Fund Id */
  fund_id: string;
  /** Fund Name */
  fund_name: string;
  fund_type: FundType;
  /** Historical Returns */
  historical_returns: number;
  /** Risk Adjusted Returns */
  risk_adjusted_returns: number;
  /** Performance Percentile */
  performance_percentile: number;
  /** Consistency Score */
  consistency_score: number;
  /** Sharpe Ratio */
  sharpe_ratio?: number | null;
  /** Sortino Ratio */
  sortino_ratio?: number | null;
  /** Drawdown Metrics */
  drawdown_metrics: Record<string, number>;
  /** Three Year Returns */
  three_year_returns?: number | null;
  /** Five Year Returns */
  five_year_returns?: number | null;
  /** Aum Growth Rate */
  aum_growth_rate: number;
  /** Lp Satisfaction Score */
  lp_satisfaction_score?: number | null;
  /** Fund Manager Experience */
  fund_manager_experience: number;
  /** Team Stability Score */
  team_stability_score: number;
  /** Investment Strategy Alignment */
  investment_strategy_alignment: Record<string, number>;
  /** Due Diligence Score */
  due_diligence_score: number;
  /** Tier Ranking */
  tier_ranking: string;
}

/** FundType */
export enum FundType {
  VentureCapital = "venture_capital",
  PrivateEquity = "private_equity",
  HedgeFund = "hedge_fund",
  RealEstate = "real_estate",
  Debt = "debt",
  FamilyOffice = "family_office",
  Other = "other",
}

/** GetReactionsResponse */
export interface GetReactionsResponse {
  /** Reactions */
  reactions: Reaction[];
}

/** GetUserMatchesRequest */
export interface GetUserMatchesRequest {
  /** User Id */
  user_id: string;
  preferences?: MatchPreferences | null;
}

/** HTTPValidationError */
export interface HTTPValidationError {
  /** Detail */
  detail?: ValidationError[];
}

/** HealthResponse */
export interface HealthResponse {
  /** Status */
  status: string;
}

/** HistoryEntry */
export interface HistoryEntry {
  /** Field */
  field: string;
  /** Old Value */
  old_value: string;
  /** New Value */
  new_value: string;
  /**
   * Timestamp
   * @format date-time
   */
  timestamp: string;
  /** User Id */
  user_id: string;
}

/** HowToGuide */
export interface HowToGuide {
  /** Id */
  id: string;
  /** Title */
  title: string;
  /** Content */
  content: string;
  /** Difficulty */
  difficulty: string;
  /** Estimated Time */
  estimated_time: string;
  /** Last Updated */
  last_updated: string;
}

/**
 * ImportContactsRequest
 * Request model for importing contacts
 */
export interface ImportContactsRequest {
  /** Contacts */
  contacts: Contact[];
  /** Token */
  token: Record<string, any>;
}

/**
 * ImportContactsResponse
 * Response model for import contacts operation
 */
export interface ImportContactsResponse {
  /** Status */
  status: string;
  /** Imported */
  imported: number;
}

/** Interaction */
export interface Interaction {
  /** Id */
  id: string;
  /** Type */
  type: string;
  /** Timestamp */
  timestamp: string;
  /** Initiator Id */
  initiator_id: string;
  /** Recipient Id */
  recipient_id: string;
  /** Context */
  context?: string | null;
  /** Duration */
  duration?: number | null;
  /** Outcome */
  outcome?: string | null;
  /** Notes */
  notes?: string | null;
  /** Attachments */
  attachments?: string[];
}

/**
 * IntroductionMetrics
 * Metrics for introductions and meetings
 */
export interface IntroductionMetrics {
  /** Total Introductions */
  total_introductions: number;
  /** Successful Introductions */
  successful_introductions: number;
  /** Average Response Time */
  average_response_time: number;
  /** Meeting Conversion Rate */
  meeting_conversion_rate: number;
  /** Top Introducers */
  top_introducers: Record<string, any>[];
  /** Average Time To Meeting */
  average_time_to_meeting: number;
}

/** IntroductionStatus */
export enum IntroductionStatus {
  Pending = "pending",
  Accepted = "accepted",
  Declined = "declined",
  Completed = "completed",
  Cancelled = "cancelled",
}

/** IntroductionUpdate */
export interface IntroductionUpdate {
  status: IntroductionStatus;
  /** Notes */
  notes?: string | null;
}

/**
 * InvestmentOpportunity
 * Investment opportunity details
 */
export interface InvestmentOpportunity {
  /** Id */
  id: string;
  /** Fund Name */
  fund_name: string;
  /** Manager Name */
  manager_name: string;
  /** Type */
  type: string;
  /** Size */
  size: number;
  /** Min Investment */
  min_investment: number;
  /** Target Return */
  target_return: number;
  /** Risk Level */
  risk_level: string;
  /** Sector */
  sector: string;
  /** Match Score */
  match_score: number;
  /** Status */
  status: string;
}

/** InvestmentScoreCard */
export interface InvestmentScoreCard {
  /** Fund Id */
  fund_id: string;
  /** Fund Name */
  fund_name: string;
  /** Overall Score */
  overall_score: number;
  /** Historical Performance */
  historical_performance: number;
  /** Team Quality */
  team_quality: number;
  /** Strategy Consistency */
  strategy_consistency: number;
  /** Risk Management */
  risk_management: number;
  /** Investor Relations */
  investor_relations: number;
  /** Operational Excellence */
  operational_excellence: number;
  /** Growth Potential */
  growth_potential: number;
  /** Recommendation */
  recommendation: string;
  /** Key Strengths */
  key_strengths: string[];
  /** Areas Of Concern */
  areas_of_concern: string[];
}

/** InvestorProfile */
export interface InvestorProfile {
  /** Name */
  name: string;
  /** Company */
  company: string;
  /** Role */
  role: string;
  /** Fund Type */
  fund_type?: string | null;
  /** Fund Size */
  fund_size?: number | null;
  /** Investment Focus */
  investment_focus?: string[] | null;
  /** Historical Returns */
  historical_returns?: number | null;
  /** Risk Profile */
  risk_profile?: string | null;
  /** Source */
  source: string;
  /**
   * Last Updated
   * @format date-time
   */
  last_updated: string;
  /** Location */
  location?: string | null;
  /** Website */
  website?: string | null;
  /** Portfolio Size */
  portfolio_size?: number | null;
  /** Investment Stages */
  investment_stages?: string[] | null;
  /** Total Investments */
  total_investments?: number | null;
}

/** IssueUploadResponse */
export interface IssueUploadResponse {
  /** Success */
  success: boolean;
  /** Message */
  message: string;
  /** Total Issues */
  total_issues: number;
}

/** KBArticle */
export interface KBArticle {
  /** Id */
  id: string;
  /** Title */
  title: string;
  /** Content */
  content: string;
  /** Category */
  category: string;
  /** Last Updated */
  last_updated: string;
  /** Summary */
  summary: string;
}

/** KnowledgeBaseArticle */
export interface KnowledgeBaseArticle {
  /** Id */
  id: string;
  /** Title */
  title: string;
  /** Content */
  content: string;
  /** Category Id */
  category_id: string;
  /** Tags */
  tags: string[];
  /**
   * Created At
   * @format date-time
   */
  created_at: string;
  /**
   * Updated At
   * @format date-time
   */
  updated_at: string;
  /** Author Id */
  author_id: string;
}

/**
 * LPAnalytics
 * Limited Partner specific analytics
 */
export interface LPAnalytics {
  /** Portfolio analysis metrics */
  portfolio_metrics: PortfolioMetrics;
  /** Tracked Opportunities */
  tracked_opportunities: InvestmentOpportunity[];
  /** Fund Manager Comparisons */
  fund_manager_comparisons: FundManagerMetrics[];
  /** Risk Appetite Match */
  risk_appetite_match: number;
  /** Sector Alignment */
  sector_alignment: number;
  /** Investment Pace */
  investment_pace: number;
}

/** LPInvestmentPattern */
export interface LPInvestmentPattern {
  /** Lp Id */
  lp_id: string;
  /** Name */
  name: string;
  /** Investor Type */
  investor_type: string;
  /** Typical Commitment Size */
  typical_commitment_size: number;
  /** Total Committed Capital */
  total_committed_capital: number;
  /** Fund Type Preferences */
  fund_type_preferences: Record<string, number>;
  /** Sector Preferences */
  sector_preferences: Record<string, number>;
  /** Risk Tolerance Score */
  risk_tolerance_score: number;
  /** Avg Holding Period */
  avg_holding_period: number;
  /** Reinvestment Rate */
  reinvestment_rate: number;
  /** Diversification Score */
  diversification_score: number;
  /** Decision Speed */
  decision_speed: number;
  /** Co Investment Frequency */
  co_investment_frequency: number;
  /** Relationship Strength */
  relationship_strength: Record<string, number>;
  /** Investment Consistency Score */
  investment_consistency_score: number;
}

/** LimitedPartnerAnalytics */
export interface LimitedPartnerAnalytics {
  /**
   * Profile Views
   * @default 0
   */
  profile_views?: number;
  /**
   * Profile Completeness
   * @default 0
   */
  profile_completeness?: number;
  /**
   * Total Connections
   * @default 0
   */
  total_connections?: number;
  /**
   * Active Connections
   * @default 0
   */
  active_connections?: number;
  /**
   * Avg Relationship Strength
   * @default 0
   */
  avg_relationship_strength?: number;
  /**
   * Response Rate
   * @default 0
   */
  response_rate?: number;
  /** Last Active */
  last_active?: string | null;
  /**
   * Total Investments
   * @default 0
   */
  total_investments?: number;
  /**
   * Total Committed
   * @default 0
   */
  total_committed?: number;
  /**
   * Fund Manager Match Rate
   * @default 0
   */
  fund_manager_match_rate?: number;
  /**
   * Investment Success Rate
   * @default 0
   */
  investment_success_rate?: number;
  /**
   * Avg Investment Size
   * @default 0
   */
  avg_investment_size?: number;
}

/**
 * ListAdminUsersResponse
 * Response model for listing admin users
 */
export interface ListAdminUsersResponse {
  /**
   * Users
   * List of admin users
   */
  users: AdminUser[];
}

/** ListCommentsResponse */
export interface ListCommentsResponse {
  /** Comments */
  comments: Comment[];
}

/** ListProfilesRequest */
export interface ListProfilesRequest {
  user_type?: UserType | null;
  /**
   * Verified Only
   * @default false
   */
  verified_only?: boolean;
  /**
   * Limit
   * @default 50
   */
  limit?: number;
  /**
   * Offset
   * @default 0
   */
  offset?: number;
  /** Token */
  token: Record<string, any>;
}

/**
 * MatchAnalytics
 * Analytics for matches
 */
export interface MatchAnalytics {
  /** Total Matches */
  total_matches: number;
  /** Accepted Matches */
  accepted_matches: number;
  /** Declined Matches */
  declined_matches: number;
  /** Pending Matches */
  pending_matches: number;
  /** Match Response Rate */
  match_response_rate: number;
  /** Average Match Quality */
  average_match_quality: number;
  /** Top Matching Sectors */
  top_matching_sectors: string[];
  /** Sector Analytics */
  sector_analytics: AppApisAnalyticsEnhancedSectorAnalytics[];
  /** Metrics for introductions and meetings */
  introduction_metrics: IntroductionMetrics;
  /** Metrics for fundraising success */
  fundraising_metrics: AppApisAnalyticsEnhancedFundraisingMetrics;
}

/** MatchPreferences */
export interface MatchPreferences {
  /** User Id */
  user_id: string;
  /** Preferred User Types */
  preferred_user_types?: UserType[];
  /** Preferred Specializations */
  preferred_specializations?: string[];
  /** Preferred Locations */
  preferred_locations?: string[];
  /** @default "none" */
  minimum_verification_level?: VerificationLevel;
  /** Importance Weights */
  importance_weights?: Record<string, number>;
}

/** MatchRecommendation */
export interface MatchRecommendation {
  /** Uid */
  uid: string;
  /** Name */
  name: string;
  /** Company */
  company: string;
  /** Match Percentage */
  match_percentage: number;
  /** Role */
  role: string;
  /** Mutual Connections */
  mutual_connections: number;
}

/**
 * MatchResult
 * Match result with detailed compatibility information
 */
export interface MatchResult {
  profile: ExtendedUserProfile;
  /** Match Percentage */
  match_percentage: number;
  /** Compatibility Factors */
  compatibility_factors: string[];
  /** Potential Synergies */
  potential_synergies: string[];
}

/**
 * MatchingAlgorithmMetrics
 * Matching algorithm performance metrics
 */
export interface MatchingAlgorithmMetrics {
  /** Metric with current value and change percentage */
  total_matches_generated: MetricWithChange;
  /** Metric with current value and change percentage */
  average_match_score: MetricWithChange;
  /** Metric with current value and change percentage */
  high_confidence_match_percentage: MetricWithChange;
  /** Match Acceptance Rate */
  match_acceptance_rate: Record<string, MetricWithChange>;
  /** Metric with current value and change percentage */
  match_engagement_rate: MetricWithChange;
  /** Metric with current value and change percentage */
  time_to_first_match: MetricWithChange;
  /** Metric with current value and change percentage */
  user_reported_match_quality: MetricWithChange;
}

/** MatchingMetrics */
export interface MatchingMetrics {
  /** Total Matches */
  total_matches: number;
  /** Successful Matches */
  successful_matches: number;
  /** Average Match Quality */
  average_match_quality: number;
  /** Match Response Rate */
  match_response_rate: number;
  /** Average Time To Response */
  average_time_to_response: number;
}

/**
 * Message
 * Message model
 */
export interface Message {
  /** Id */
  id: string;
  /** Sender Id */
  sender_id: string;
  /** Receiver Id */
  receiver_id: string;
  /** Content */
  content: string;
  /** Timestamp */
  timestamp: string;
  attachment?: AppApisMessagingEnhancedAttachment | null;
  /**
   * Status
   * @default "sent"
   */
  status?: string;
  /**
   * Retry Count
   * @default 0
   */
  retry_count?: number;
  /** Parent Id */
  parent_id?: string | null;
  /** Thread Id */
  thread_id?: string | null;
  /**
   * Reply Count
   * @default 0
   */
  reply_count?: number;
  /**
   * Is Thread Starter
   * @default false
   */
  is_thread_starter?: boolean;
}

/**
 * MetricWithChange
 * Metric with current value and change percentage
 */
export interface MetricWithChange {
  /** Current */
  current: number;
  /** Change Percentage */
  change_percentage: number;
}

/** ModerationMetricsResponse */
export interface ModerationMetricsResponse {
  metrics: EffectivenessMetrics;
}

/** ModerationRule */
export interface ModerationRule {
  /** Id */
  id: string;
  type: RuleType;
  /**
   * Is Active
   * @default true
   */
  is_active?: boolean;
  /** @default "review" */
  action?: ActionType;
  /** @default "medium" */
  severity?: RuleSeverity;
}

/**
 * MonetizationMetrics
 * Subscription and revenue metrics
 */
export interface MonetizationMetrics {
  /** User Tier Distribution */
  user_tier_distribution: Record<string, Record<string, number>>;
  /** Metric with current value and change percentage */
  upgrade_rate: MetricWithChange;
  /** Metric with current value and change percentage */
  downgrade_rate: MetricWithChange;
  /** Metric with current value and change percentage */
  renewal_rate: MetricWithChange;
  /** Metric with current value and change percentage */
  churn_rate: MetricWithChange;
  /** Metric with current value and change percentage */
  average_revenue_per_active_user: MetricWithChange;
}

/** NetworkAnalytics */
export interface NetworkAnalytics {
  /** Total Quality Connections */
  total_quality_connections: number;
  /** High Value Contacts */
  high_value_contacts: number;
  /** Relationship Strength Distribution */
  relationship_strength_distribution: Record<string, number>;
  /** Introduction Success Rate */
  introduction_success_rate: number;
  /** Average Response Time */
  average_response_time: number;
  /** Connection Growth Rate */
  connection_growth_rate: number;
  /** Engagement Quality Score */
  engagement_quality_score: number;
  /** Potential Value Score */
  potential_value_score: number;
  /** Relationship Reciprocity Score */
  relationship_reciprocity_score: number;
  /** Connection Exclusivity Metrics */
  connection_exclusivity_metrics: Record<string, number>;
}

/** NetworkStrength */
export interface NetworkStrength {
  /** User Id */
  user_id: string;
  /**
   * Total Connections
   * @default 0
   */
  total_connections?: number;
  /**
   * Active Connections
   * @default 0
   */
  active_connections?: number;
  /**
   * Introduction Rate
   * @default 0
   */
  introduction_rate?: number;
  /**
   * Response Rate
   * @default 0
   */
  response_rate?: number;
  /**
   * Influence Score
   * @default 0
   */
  influence_score?: number;
  /** Relationship Health */
  relationship_health?: Record<string, number>;
}

/**
 * NetworkingMetrics
 * Networking and contact management metrics
 */
export interface NetworkingMetrics {
  /** Contacts Uploaded */
  contacts_uploaded: Record<string, MetricWithChange>;
  /** Metric with current value and change percentage */
  introductions_made: MetricWithChange;
  /** Metric with current value and change percentage */
  contact_conversion_rate: MetricWithChange;
  /** Network Growth Rate */
  network_growth_rate: Record<string, MetricWithChange>;
}

/** PaginatedSearchResponse */
export interface PaginatedSearchResponse {
  /** Results */
  results: SearchResult[];
  /** Total Count */
  total_count: number;
  /** Page */
  page: number;
  /** Page Size */
  page_size: number;
}

/** PatternMatch */
export interface PatternMatch {
  /** Start */
  start: number;
  /** End */
  end: number;
  /** Matched Text */
  matched_text: string;
}

/** PaymentMethod */
export enum PaymentMethod {
  Card = "card",
  BankTransfer = "bank_transfer",
}

/** PaymentStatus */
export enum PaymentStatus {
  Pending = "pending",
  Succeeded = "succeeded",
  Failed = "failed",
}

/** PayoutRequest */
export interface PayoutRequest {
  /** Connect Account Id */
  connect_account_id: string;
  /** Amount */
  amount: number;
  /**
   * Currency
   * @default "usd"
   */
  currency?: string;
  /** Metadata */
  metadata?: Record<string, any> | null;
}

/** PayoutResponse */
export interface PayoutResponse {
  /** Payout Id */
  payout_id: string;
  /** Amount */
  amount: number;
  /** Currency */
  currency: string;
  /** Status */
  status: string;
}

/**
 * PerformanceMetrics
 * Performance metrics used for commission calculations
 *
 * Fields:
 *     conversion_rate: Percentage of referrals that convert
 *     response_time: Average time to respond to referrals (hours)
 *     quality_score: Score based on referral quality (0-100)
 *     activity_level: Score based on regular platform activity (0-100)
 */
export interface PerformanceMetricsInput {
  /**
   * Conversion Rate
   * @min 0
   * @max 100
   */
  conversion_rate: number;
  /**
   * Response Time
   * @min 0
   */
  response_time: number;
  /**
   * Quality Score
   * @min 0
   * @max 100
   */
  quality_score: number;
  /**
   * Activity Level
   * @min 0
   * @max 100
   */
  activity_level: number;
}

/**
 * PeriodFilter
 * Time period filters for analytics
 */
export enum PeriodFilter {
  Value7D = "7d",
  Value30D = "30d",
  Value90D = "90d",
  Value12M = "12m",
  Ytd = "ytd",
  All = "all",
}

/** PlatformMetrics */
export interface PlatformMetrics {
  /** Total Users */
  total_users: number;
  /** Active Users 30D */
  active_users_30d: number;
  /** Total Interactions */
  total_interactions: number;
  /** Average Response Time */
  average_response_time: number;
  /** User Growth Rate */
  user_growth_rate: number;
  /** Platform Engagement Rate */
  platform_engagement_rate: number;
}

/**
 * PortfolioMetrics
 * Portfolio analysis metrics
 */
export interface PortfolioMetrics {
  /** Total Value */
  total_value: number;
  /** Total Investments */
  total_investments: number;
  /** Avg Investment Size */
  avg_investment_size: number;
  /** Sector Distribution */
  sector_distribution: Record<string, number>;
  /** Risk Distribution */
  risk_distribution: Record<string, number>;
  /** Historical Performance */
  historical_performance: number[];
  /** Current Opportunities */
  current_opportunities: number;
}

/** ProfileListResponse */
export interface ProfileListResponse {
  /** Profiles */
  profiles: Record<string, any>[];
  /** Total */
  total: number;
  /** Page */
  page: number;
  /** Page Size */
  page_size: number;
}

/** ProfileResponse */
export interface ProfileResponse {
  /** Status */
  status: string;
  /** Profile */
  profile: Record<string, any>;
  /** Request Id */
  request_id?: string | null;
}

/** ProfileVisibility */
export interface ProfileVisibility {
  /**
   * Show In Search
   * @default true
   */
  show_in_search?: boolean;
  /**
   * Show Contact Info
   * @default false
   */
  show_contact_info?: boolean;
  /** Show To Roles */
  show_to_roles?: string[];
  /**
   * Show Fund Details
   * @default false
   */
  show_fund_details?: boolean;
  /**
   * Show Investment History
   * @default false
   */
  show_investment_history?: boolean;
}

/** QualityMetrics */
export interface QualityMetrics {
  /**
   * Accuracy Rate
   * Accuracy of moderation decisions
   * @default 0
   */
  accuracy_rate?: number;
  /**
   * Consistency Score
   * Consistency across similar cases
   * @default 0
   */
  consistency_score?: number;
  /**
   * User Feedback Score
   * Score based on user feedback
   * @default 0
   */
  user_feedback_score?: number;
  /**
   * False Positive Rate
   * Rate of false positive detections
   * @default 0
   */
  false_positive_rate?: number;
  /**
   * Escalation Rate
   * Rate of escalated reports
   * @default 0
   */
  escalation_rate?: number;
  /**
   * Resolution Quality
   * Quality score of resolutions
   * @default 0
   */
  resolution_quality?: number;
}

/** Reaction */
export interface Reaction {
  /** Message Id */
  message_id: string;
  /** User Id */
  user_id: string;
  /** Emoji */
  emoji: string;
  /** Timestamp */
  timestamp: string;
}

/**
 * RecordEventRequest
 * Request to record an analytics event
 */
export interface RecordEventRequest {
  /** Document Id */
  document_id: string;
  /** User Id */
  user_id: string;
  /** Types of document analytics events */
  event_type: AnalyticsEventType;
  /** Tracking Id */
  tracking_id?: string | null;
  /** Section Id */
  section_id?: string | null;
  /** Duration Seconds */
  duration_seconds?: number | null;
  /** Scroll Percentage */
  scroll_percentage?: number | null;
  /** Device Info */
  device_info?: Record<string, any> | null;
  /** Ip Address */
  ip_address?: string | null;
  /** Metadata */
  metadata?: Record<string, any> | null;
}

/** RecordMatchRequest */
export interface RecordMatchRequest {
  /** User Id */
  user_id: string;
  /** Matched User Id */
  matched_user_id: string;
}

/** ReferralLink */
export interface ReferralLink {
  /** Id */
  id: string;
  /** User Id */
  user_id: string;
  /** Code */
  code: string;
  /**
   * Created At
   * @format date-time
   */
  created_at: string;
  /**
   * Visits
   * @default 0
   */
  visits?: number;
  /** Last Visited */
  last_visited?: string | null;
  /**
   * Is Active
   * @default true
   */
  is_active?: boolean;
}

/** ReferralLinkResponse */
export interface ReferralLinkResponse {
  /** Links */
  links: ReferralLink[];
}

/** RefundRequest */
export interface RefundRequest {
  /** Subscription Id */
  subscription_id: string;
  /** User Id */
  user_id: string;
  /** Reason */
  reason: string;
  /** Amount */
  amount: number;
  /** Token */
  token: Record<string, any>;
}

/** RefundResponse */
export interface RefundResponse {
  /** Refund Id */
  refund_id: string;
  /** Status */
  status: string;
  /** Amount */
  amount: number;
  /** Processed At */
  processed_at: string;
}

/** Relationship */
export interface Relationship {
  /** Id */
  id: string;
  /** User Id */
  user_id: string;
  /** Contact Id */
  contact_id: string;
  /** Relationship Type */
  relationship_type: string;
  /** Status */
  status: string;
  /**
   * Strength
   * @default 0
   */
  strength?: number;
  /** Last Interaction */
  last_interaction?: string | null;
  /** Created At */
  created_at: string;
  /** Notes */
  notes?: string | null;
  /** Tags */
  tags?: string[];
}

/** RelationshipResponse */
export interface RelationshipResponse {
  /** Id */
  id: string;
  /** User Id */
  user_id: string;
  /** Contact Id */
  contact_id: string;
  /** Relationship Type */
  relationship_type: string;
  /** Status */
  status: string;
  /** Strength */
  strength: number;
  /** Metrics */
  metrics?: Record<string, any>;
  /** Last Interaction */
  last_interaction?: string | null;
  /** Created At */
  created_at: string;
  /** Updated At */
  updated_at?: string | null;
}

/** RelationshipStatus */
export enum RelationshipStatus {
  Pending = "pending",
  Connected = "connected",
  Declined = "declined",
  Blocked = "blocked",
}

/** RelationshipStrength */
export interface RelationshipStrength {
  /** Relationship Id */
  relationship_id: string;
  /**
   * Interaction Count
   * @default 0
   */
  interaction_count?: number;
  /** Last Interaction */
  last_interaction?: string | null;
  /**
   * Communication Frequency
   * @default 0
   */
  communication_frequency?: number;
  /**
   * Response Rate
   * @default 0
   */
  response_rate?: number;
  /** Response Time */
  response_time?: number | null;
  /**
   * Mutual Connections
   * @default 0
   */
  mutual_connections?: number;
  /**
   * Strength Score
   * @default 0
   */
  strength_score?: number;
}

/** RemoveReactionRequest */
export interface RemoveReactionRequest {
  /** Message Id */
  message_id: string;
  /** Emoji */
  emoji: string;
  /** User Id */
  user_id: string;
}

/** Report */
export interface Report {
  /**
   * Id
   * Unique identifier for the report
   */
  id: string;
  /** Type of content being reported */
  type: ReportTypeOutput;
  /**
   * Content
   * Description of the reported content
   */
  content: string;
  /**
   * Reported By
   * User ID of the reporter
   */
  reported_by: string;
  /** Current status of the report */
  status: ReportStatusOutput;
  /**
   * Timestamp
   * When the report was created
   */
  timestamp: string;
  /**
   * Severity
   * Severity level: high, medium, low
   * @default "medium"
   */
  severity?: string;
  /**
   * Compliance Tags
   * Tags for compliance categorization
   */
  compliance_tags?: string[];
  /**
   * Last Reviewed
   * When the report was last reviewed
   */
  last_reviewed?: string | null;
  /**
   * Review Notes
   * Notes from the last review
   */
  review_notes?: string | null;
  /**
   * Retention Period
   * Days to retain this report data
   */
  retention_period?: number | null;
  /** Automated risk assessment */
  risk_assessment?: RiskScore | null;
  /**
   * Escalation History
   * History of escalations
   */
  escalation_history?: string[];
  /**
   * Appeal Status
   * Status of any appeals
   */
  appeal_status?: string | null;
  /**
   * Resolution Quality
   * Quality score of resolution (0-1)
   */
  resolution_quality?: number | null;
  /**
   * Automated Actions
   * Actions taken automatically
   */
  automated_actions?: string[];
  /**
   * Related Reports
   * IDs of related reports
   */
  related_reports?: string[];
}

/** ReportResponse */
export interface ReportResponse {
  /**
   * Reports
   * List of content reports
   */
  reports: Report[];
}

/** ReportStatus */
export enum ReportStatusOutput {
  Pending = "pending",
  Approved = "approved",
  Rejected = "rejected",
  Escalated = "escalated",
  UnderReview = "under_review",
  AutoModerated = "auto_moderated",
}

/** ReportType */
export enum ReportTypeOutput {
  Spam = "spam",
  Harassment = "harassment",
  Fraud = "fraud",
  Inappropriate = "inappropriate",
  Profanity = "profanity",
  Misleading = "misleading",
  PersonalInfo = "personal_info",
  Other = "other",
}

/** ReviewRequest */
export interface ReviewRequest {
  /** Verification Id */
  verification_id: string;
  /** Reviewer Id */
  reviewer_id: string;
  status: VerificationStatus;
  /** Notes */
  notes?: string | null;
  /** Token */
  token: Record<string, any>;
}

/** RiskScore */
export interface RiskScore {
  /**
   * Score
   * Overall risk score (0-100)
   */
  score: number;
  /**
   * Factors
   * Contributing risk factors
   */
  factors?: Record<string, number>;
  /**
   * Confidence
   * Confidence in the risk assessment (0-1)
   * @default 1
   */
  confidence?: number;
  /**
   * Last Updated
   * When the risk was last assessed
   */
  last_updated: string;
}

/** RolePermissionsResponse */
export interface RolePermissionsResponse {
  role: UserRole;
  /** Permissions */
  permissions: Record<string, boolean>;
}

/** RuleSeverity */
export enum RuleSeverity {
  Low = "low",
  Medium = "medium",
  High = "high",
}

/** RuleType */
export enum RuleType {
  Profanity = "profanity",
  Harassment = "harassment",
  Spam = "spam",
  Pii = "pii",
  Threats = "threats",
  Inappropriate = "inappropriate",
}

/**
 * SatisfactionMetrics
 * User satisfaction and support metrics
 */
export interface SatisfactionMetrics {
  /** User Satisfaction Score */
  user_satisfaction_score: Record<string, MetricWithChange>;
  /** Metric with current value and change percentage */
  net_promoter_score: MetricWithChange;
  /** Metric with current value and change percentage */
  support_tickets: MetricWithChange;
  /** Metric with current value and change percentage */
  avg_resolution_time: MetricWithChange;
  /** Metric with current value and change percentage */
  match_dispute_rate: MetricWithChange;
}

/** SearchFilters */
export interface SearchFiltersOutput {
  /** User Types */
  user_types?: UserType[] | null;
  /** Specializations */
  specializations?: string[] | null;
  /** Locations */
  locations?: string[] | null;
  /** Min Connections */
  min_connections?: number | null;
  /**
   * Verified Only
   * @default false
   */
  verified_only?: boolean;
  /** Subscription Tiers */
  subscription_tiers?: SubscriptionTier[] | null;
}

/** SearchHistoryEntry */
export interface SearchHistoryEntry {
  /** Id */
  id: string;
  /** User Id */
  user_id: string;
  /** Query */
  query: string;
  filters: SearchFiltersOutput;
  /** Result Count */
  result_count: number;
  /** Timestamp */
  timestamp: string;
}

/** SearchPreset */
export interface SearchPresetInput {
  /** Id */
  id: string;
  /** User Id */
  user_id: string;
  /** Name */
  name: string;
  filters: AppApisModelsSearchFilters;
  /** Created At */
  created_at: string;
}

/** SearchPreset */
export interface SearchPresetOutput {
  /** Id */
  id: string;
  /** User Id */
  user_id: string;
  /** Name */
  name: string;
  filters: SearchFiltersOutput;
  /** Created At */
  created_at: string;
}

/**
 * SearchResponse
 * Response model for investor search with performance metrics
 */
export interface SearchResponse {
  /** Investors */
  investors: InvestorProfile[];
  /** Total */
  total: number;
  /** Page */
  page: number;
  /** Page Size */
  page_size: number;
  /** Cache status with performance metrics */
  cache_status: CacheStatus;
}

/** SearchResult */
export interface SearchResult {
  profile: ExtendedUserProfile;
  /** Relevance Score */
  relevance_score: number;
  /** Match Reason */
  match_reason?: string | null;
}

/**
 * SectorInsightsMetrics
 * Sector-specific performance metrics
 */
export interface SectorInsightsMetrics {
  /** Deals Per Sector */
  deals_per_sector: Record<string, MetricWithChange>;
  /** Metric with current value and change percentage */
  fund_manager_success_rate: MetricWithChange;
  /** Metric with current value and change percentage */
  capital_raiser_conversion: MetricWithChange;
  /** Metric with current value and change percentage */
  limited_partner_investment_activity: MetricWithChange;
}

/**
 * SendMessageRequest
 * Request model for sending messages
 */
export interface SendMessageRequest {
  /** Receiver Id */
  receiver_id: string;
  /** Content */
  content: string;
  /** Attachment Id */
  attachment_id?: string | null;
  /** Parent Id */
  parent_id?: string | null;
  /** Thread Title */
  thread_title?: string | null;
}

/**
 * SourceType
 * Source of document access
 */
export enum SourceType {
  Email = "email",
  Message = "message",
  Direct = "direct",
  External = "external",
  Other = "other",
}

/**
 * StartTrialRequest
 * Request to start a free trial
 */
export interface StartTrialRequest {
  /** User Id */
  user_id: string;
  /** Trial Code */
  trial_code: string;
}

/** StrengthScore */
export interface StrengthScore {
  /**
   * Overall
   * @default 0
   */
  overall?: number;
  /**
   * Communication
   * @default 0
   */
  communication?: number;
  /**
   * Trust
   * @default 0
   */
  trust?: number;
  /**
   * Engagement
   * @default 0
   */
  engagement?: number;
  /**
   * Reliability
   * @default 0
   */
  reliability?: number;
  /**
   * History
   * @default 0
   */
  history?: number;
}

/**
 * SubscriptionFeature
 * Definition of a feature and its access level per tier
 */
export interface SubscriptionFeature {
  /** Name */
  name: string;
  /** Description */
  description: string;
  /** Access Levels */
  access_levels: Record<string, FeatureAccess>;
}

/**
 * SubscriptionPlan
 * Subscription plan details
 */
export interface SubscriptionPlan {
  tier: SubscriptionTier;
  /** Name */
  name: string;
  /** Description */
  description: string;
  /** Price Monthly */
  price_monthly: number;
  /** Price Annual */
  price_annual: number;
  /** Features */
  features: Record<string, FeatureAccess>;
  /** Max Contacts */
  max_contacts: number;
  /** Max Matches Per Month */
  max_matches_per_month: number;
  /** Profile Visibility Level */
  profile_visibility_level: string;
  /** Support Level */
  support_level: string;
  /**
   * Trial Periods Available
   * @default [0.5,3,6,9]
   */
  trial_periods_available?: number[];
}

/** SubscriptionTier */
export enum SubscriptionTier {
  Free = "free",
  Basic = "basic",
  Professional = "professional",
  Enterprise = "enterprise",
}

/**
 * SubscriptionUpdate
 * Subscription update request
 */
export interface SubscriptionUpdate {
  new_tier: SubscriptionTier;
  /** Payment Method Id */
  payment_method_id: string;
  /**
   * Is Annual
   * @default false
   */
  is_annual?: boolean;
}

/** TestCard */
export interface TestCard {
  /**
   * Number
   * @default "4242424242424242"
   */
  number?: string;
  /**
   * Exp Month
   * @default 12
   */
  exp_month?: number;
  /**
   * Exp Year
   * @default 2024
   */
  exp_year?: number;
  /**
   * Cvc
   * @default "123"
   */
  cvc?: string;
}

/** TestPaymentResponse */
export interface TestPaymentResponse {
  /** Payment Id */
  payment_id: string;
  /** Amount */
  amount: number;
  /** Currency */
  currency: string;
  status: PaymentStatus;
  /**
   * Created At
   * @format date-time
   */
  created_at: string;
  payment_method: PaymentMethod;
  /** Description */
  description?: string | null;
  /** Metadata */
  metadata?: Record<string, any> | null;
  /** Error */
  error?: string | null;
}

/** TestResult */
export interface TestResult {
  /** Test Name */
  test_name: string;
  /** Passed */
  passed: boolean;
  /** Details */
  details: string;
}

/** TestSuite */
export interface TestSuite {
  /** Total Tests */
  total_tests: number;
  /** Passed Tests */
  passed_tests: number;
  /** Failed Tests */
  failed_tests: number;
  /** Results */
  results: TestResult[];
}

/**
 * ThreadMetadata
 * Thread metadata model
 */
export interface ThreadMetadata {
  /** Thread Id */
  thread_id: string;
  /** Title */
  title?: string | null;
  /** Participants */
  participants: string[];
  /** Created At */
  created_at: string;
  /** Last Activity */
  last_activity: string;
  /**
   * Message Count
   * @default 0
   */
  message_count?: number;
  /**
   * Is Muted
   * @default false
   */
  is_muted?: boolean;
  /**
   * Is Read
   * @default true
   */
  is_read?: boolean;
  /**
   * User Statuses
   * @default {}
   */
  user_statuses?: Record<string, Record<string, any>>;
}

/**
 * ThreadResponse
 * Response model for messages with thread metadata
 */
export interface ThreadResponse {
  /** Messages */
  messages: Message[];
  thread?: ThreadMetadata | null;
  /**
   * Total Messages
   * @default 0
   */
  total_messages?: number;
  /**
   * Has More
   * @default false
   */
  has_more?: boolean;
  /**
   * Unread Count
   * @default 0
   */
  unread_count?: number;
}

/** Ticket */
export interface Ticket {
  /** Id */
  id: string;
  /** Title */
  title: string;
  /** Description */
  description: string;
  /** Category Id */
  category_id: string;
  /** User Id */
  user_id: string;
  priority: TicketPriority;
  status: TicketStatus;
  /**
   * Created At
   * @format date-time
   */
  created_at: string;
  /**
   * Updated At
   * @format date-time
   */
  updated_at: string;
  /** Attachments */
  attachments?: AppApisSupportAttachment[] | null;
  /** Assigned To */
  assigned_to?: string | null;
  /** Resolution */
  resolution?: string | null;
  /** History */
  history?: HistoryEntry[] | null;
}

/** TicketPriority */
export enum TicketPriority {
  Low = "low",
  Medium = "medium",
  High = "high",
  Urgent = "urgent",
}

/** TicketRequest */
export interface TicketRequest {
  /** Title */
  title: string;
  /** Description */
  description: string;
  /** Category Id */
  category_id: string;
  /** @default "medium" */
  priority?: TicketPriority;
  /** Attachments */
  attachments?: string[] | null;
}

/** TicketStatus */
export enum TicketStatus {
  Open = "open",
  InProgress = "in_progress",
  Resolved = "resolved",
  Closed = "closed",
}

/** TicketWithSuggestions */
export interface TicketWithSuggestions {
  ticket: Ticket;
  /** Suggested Articles */
  suggested_articles: KnowledgeBaseArticle[];
}

/** TierLevel */
export enum TierLevel {
  Bronze = "bronze",
  Silver = "silver",
  Gold = "gold",
  Platinum = "platinum",
}

/** TierRequirement */
export interface TierRequirement {
  tier_name: TierLevel;
  /** Min Referrals */
  min_referrals: number;
  /** Min Conversion Rate */
  min_conversion_rate: number;
  /** Min Quality Score */
  min_quality_score: number;
  /** Benefits */
  benefits: string[];
}

/** TierStatus */
export interface TierStatus {
  current_tier: TierLevel;
  next_tier: TierLevel | null;
  /** Progress */
  progress: Record<string, any>;
  /** Requirements Met */
  requirements_met: boolean;
  /** Missing Requirements */
  missing_requirements: string[];
}

/** TimeMetrics */
export interface TimeMetrics {
  /**
   * Avg Review Time
   * Average time to review content
   * @default 0
   */
  avg_review_time?: number;
  /**
   * Avg Response Time
   * Average time to respond to reports
   * @default 0
   */
  avg_response_time?: number;
  /**
   * Time To Action
   * Average time from detection to action
   * @default 0
   */
  time_to_action?: number;
  /**
   * Resolution Time
   * Average time to resolve reports
   * @default 0
   */
  resolution_time?: number;
  /**
   * Escalation Time
   * Average time to escalate reports
   * @default 0
   */
  escalation_time?: number;
}

/** TimelineActivity */
export interface TimelineActivity {
  /** Activity Type */
  activity_type: string;
  /** Timestamp */
  timestamp: string;
  /** Description */
  description: string;
}

/**
 * TrackableLinkInfo
 * Information about a trackable link
 */
export interface TrackableLinkInfo {
  /** Link Id */
  link_id: string;
  /** Document Id */
  document_id: string;
  /** Created By */
  created_by: string;
  /**
   * Created At
   * @format date-time
   */
  created_at: string;
  /** Expires At */
  expires_at?: string | null;
  /** Parameters for tracking document access */
  tracking_params: TrackingParams;
  /**
   * Times Accessed
   * @default 0
   */
  times_accessed?: number;
  /** Last Accessed */
  last_accessed?: string | null;
  /**
   * Is Active
   * @default true
   */
  is_active?: boolean;
}

/**
 * TrackableLinkResponse
 * Response with trackable link info
 */
export interface TrackableLinkResponse {
  /** Information about a trackable link */
  link_info: TrackableLinkInfo;
  /** Tracking Url */
  tracking_url: string;
}

/**
 * TrackingParams
 * Parameters for tracking document access
 */
export interface TrackingParams {
  source?: SourceType | null;
  /** Medium */
  medium?: string | null;
  /** Campaign */
  campaign?: string | null;
  /** Term */
  term?: string | null;
  /** Content */
  content?: string | null;
  /** Referrer */
  referrer?: string | null;
}

/**
 * TransferOwnershipRequest
 * Request model for transferring contact ownership
 */
export interface TransferOwnershipRequest {
  /** Contact Id */
  contact_id: string;
  /** New Owner Id */
  new_owner_id: string;
  /** Reason */
  reason?: string | null;
  /** Token */
  token: Record<string, any>;
}

/**
 * TransferOwnershipResponse
 * Response model for ownership transfer
 */
export interface TransferOwnershipResponse {
  /** Status */
  status: string;
  /** Message */
  message: string;
  contact: Contact;
}

/**
 * TypingIndicatorRequest
 * Request model for typing indicators
 */
export interface TypingIndicatorRequest {
  /** Receiver Id */
  receiver_id: string;
  /** Is Typing */
  is_typing: boolean;
}

/** UpdateCommentRequest */
export interface UpdateCommentRequest {
  /** Content */
  content: string;
  /** Attachments */
  attachments?: string[] | null;
}

/** UpdatePreferencesRequest */
export interface UpdatePreferencesRequest {
  /** User Id */
  user_id: string;
  preferences: MatchPreferences;
}

/** UpdateReportRequest */
export interface UpdateReportRequest {
  /**
   * Report Id
   * ID of the report to update
   */
  report_id: string;
  /** New status for the report */
  new_status: AppApisModelsReportStatus;
  /**
   * Review Notes
   * Required notes explaining the status change
   */
  review_notes: string;
  /**
   * Token
   * Authentication token
   */
  token: Record<string, any>;
}

/**
 * UpdateReportStatusRequest
 * Request model for updating a report status
 */
export interface UpdateReportStatusRequest {
  /** Report Id */
  report_id: string;
  /** Status of a content report */
  new_status: AppApisContentRulesReportStatus;
  /** Review Notes */
  review_notes?: string | null;
  /** Token */
  token: any;
}

/** UpdateRolePermissionsRequest */
export interface UpdateRolePermissionsRequest {
  role: UserRole;
  /** Permissions */
  permissions: Record<string, boolean>;
  /** Token */
  token: Record<string, any>;
}

/**
 * UpdateUserRoleRequest
 * Request model for updating user roles
 */
export interface UpdateUserRoleRequest {
  /**
   * User Id
   * ID of the user to update
   */
  user_id: string;
  /** Role to assign or remove */
  role: UserRole;
  /** Whether to add or remove the role */
  action: UserAction;
  /**
   * Token
   * Authentication token
   */
  token: Record<string, any>;
}

/**
 * UpdateUserStatusRequest
 * Request model for updating user status
 */
export interface UpdateUserStatusRequest {
  /**
   * User Ids
   * IDs of the users to update
   */
  user_ids: string[];
  /** Whether to activate or deactivate the users */
  action: UserAction;
  /**
   * Token
   * Authentication token
   */
  token: Record<string, any>;
}

/**
 * UpdateVisibilityRequest
 * Request to update visibility settings
 */
export interface UpdateVisibilityRequest {
  /** User Id */
  user_id: string;
  /** Profile visibility settings */
  settings: VisibilitySettings;
}

/** UploadAttachmentRequest */
export interface UploadAttachmentRequest {
  /** File */
  file: string;
}

/** UserAction */
export enum UserAction {
  Login = "login",
  Logout = "logout",
  ProfileUpdate = "profile_update",
  ContactAdded = "contact_added",
  DocumentUploaded = "document_uploaded",
  MessageSent = "message_sent",
  SearchPerformed = "search_performed",
  MatchAccepted = "match_accepted",
}

/**
 * UserGrowthMetrics
 * User growth and onboarding metrics
 */
export interface UserGrowthMetrics {
  /** New Registrations */
  new_registrations: Record<string, MetricWithChange>;
  /** Profile Completion Rate */
  profile_completion_rate: Record<string, MetricWithChange>;
  /** Metric with current value and change percentage */
  active_inactive_ratio: MetricWithChange;
  /** Metric with current value and change percentage */
  verification_completion_rate: MetricWithChange;
}

/**
 * UserInfo
 * User info model
 */
export interface UserInfo {
  /** Uid */
  uid: string;
  /** Display Name */
  display_name: string;
  /** Company Name */
  company_name: string;
}

/** UserRole */
export enum UserRole {
  Admin = "admin",
  Moderator = "moderator",
  Analyst = "analyst",
  Viewer = "viewer",
  User = "user",
}

/**
 * UserRoleInfo
 * Information about a user's role and associated permissions
 */
export interface UserRoleInfo {
  /** The role assigned to the user */
  role: UserRole;
  /**
   * Permissions
   * List of permissions associated with the role
   */
  permissions: string[];
}

/** UserSubscription */
export interface UserSubscription {
  /** User Id */
  user_id: string;
  tier: SubscriptionTier;
  /** Starts At */
  starts_at: string;
  /** Ends At */
  ends_at?: string | null;
  /**
   * Is Active
   * @default true
   */
  is_active?: boolean;
  /** Payment Id */
  payment_id?: string | null;
  /**
   * Auto Renew
   * @default false
   */
  auto_renew?: boolean;
  /** Features */
  features?: Record<string, FeatureAccess>;
}

/** UserType */
export enum UserType {
  FundManager = "fund_manager",
  LimitedPartner = "limited_partner",
  CapitalRaiser = "capital_raiser",
  FundOfFunds = "fund_of_funds",
  Admin = "admin",
}

/** UserTypeMetrics */
export interface UserTypeMetrics {
  /** Total Users */
  total_users: number;
  /** Active Users */
  active_users: number;
  /** New Users 30D */
  new_users_30d: number;
  /** Engagement Rate */
  engagement_rate: number;
  /** Average Connections */
  average_connections: number;
  /** Total Interactions */
  total_interactions: number;
}

/** ValidationError */
export interface ValidationError {
  /** Location */
  loc: (string | number)[];
  /** Message */
  msg: string;
  /** Error Type */
  type: string;
}

/** VerificationDocument */
export interface VerificationDocument {
  /** Id */
  id: string;
  /** User Id */
  user_id: string;
  /** Document Type */
  document_type: string;
  /** File Name */
  file_name: string;
  /** File Size */
  file_size: number;
  /** Mime Type */
  mime_type: string;
  /** Upload Date */
  upload_date: string;
  /** @default "pending" */
  status?: VerificationStatus;
  /** Review Date */
  review_date?: string | null;
  /** Reviewer Id */
  reviewer_id?: string | null;
  /** Review Notes */
  review_notes?: string | null;
  /** Expiry Date */
  expiry_date?: string | null;
  verification_level: VerificationLevel;
}

/** VerificationLevel */
export enum VerificationLevel {
  None = "none",
  Email = "email",
  Phone = "phone",
  Document = "document",
  Accredited = "accredited",
}

/** VerificationRequest */
export interface VerificationRequest {
  /** User Id */
  user_id: string;
  /** Document Type */
  document_type: string;
  /** Document Id */
  document_id: string;
  verification_level: VerificationLevel;
  /** Notes */
  notes?: string | null;
  /** Token */
  token: Record<string, any>;
}

/** VerificationResponse */
export interface VerificationResponse {
  /** Status */
  status: string;
  /** Verification Id */
  verification_id?: string | null;
  /** Message */
  message: string;
  level?: VerificationLevel | null;
  /** Document Types */
  document_types?: string[] | null;
  /** Expires At */
  expires_at?: string | null;
}

/** VerificationStatus */
export enum VerificationStatus {
  Pending = "pending",
  Approved = "approved",
  Rejected = "rejected",
  Expired = "expired",
}

/**
 * VisibilitySettings
 * Profile visibility settings
 */
export interface VisibilitySettings {
  /**
   * Is Searchable
   * @default true
   */
  is_searchable?: boolean;
  /**
   * Show Contact Info
   * @default true
   */
  show_contact_info?: boolean;
  /**
   * Show Investment History
   * @default true
   */
  show_investment_history?: boolean;
  /**
   * Show Fund Details
   * @default true
   */
  show_fund_details?: boolean;
  /**
   * Show Analytics
   * @default true
   */
  show_analytics?: boolean;
  /**
   * Allowed Roles
   * @default ["Fund Manager","Limited Partner","Capital Raiser"]
   */
  allowed_roles?: string[];
  /** Custom Visibility */
  custom_visibility?: Record<string, boolean> | null;
}

/**
 * VolumeThreshold
 * Volume-based commission thresholds
 *
 * Fields:
 *     min_volume: Minimum volume for this threshold
 *     rate: Commission rate for this threshold
 *     is_cumulative: Whether rate applies to all volume or just increment
 */
export interface VolumeThreshold {
  /**
   * Min Volume
   * @min 0
   */
  min_volume: number;
  /**
   * Rate
   * @min 0
   * @max 100
   */
  rate: number;
  /**
   * Is Cumulative
   * @default true
   */
  is_cumulative?: boolean;
}

/**
 * PerformanceMetrics
 * Performance metrics for search operations
 */
export interface AppApisAiListBuilderPerformanceMetrics {
  /** Processing Time Seconds */
  processing_time_seconds: number;
  /** Cache Hit Ratio */
  cache_hit_ratio: number;
  /** Cache Hits */
  cache_hits: number;
  /** Cache Misses */
  cache_misses: number;
}

/** SearchFilters */
export interface AppApisAiListBuilderSearchFilters {
  /** Fund Type */
  fund_type?: string | null;
  /** Min Fund Size */
  min_fund_size?: number | null;
  /** Max Fund Size */
  max_fund_size?: number | null;
  /** Investment Focus */
  investment_focus?: string[] | null;
  /** Min Historical Returns */
  min_historical_returns?: number | null;
  /** Risk Profile */
  risk_profile?: string | null;
}

/**
 * FundraisingMetrics
 * Metrics for fundraising success
 */
export interface AppApisAnalyticsEnhancedFundraisingMetrics {
  /** Total Capital Raised */
  total_capital_raised: number;
  /** Number Of Deals */
  number_of_deals: number;
  /** Average Deal Size */
  average_deal_size: number;
  /** Success Rate */
  success_rate: number;
  /** Average Time To Close */
  average_time_to_close: number;
  /** Deals By Fund Type */
  deals_by_fund_type: Record<string, number>;
  /** Capital By Fund Type */
  capital_by_fund_type: Record<string, number>;
}

/**
 * PerformanceMetrics
 * System performance and reliability metrics
 */
export interface AppApisAnalyticsEnhancedPerformanceMetrics {
  /** Metric with current value and change percentage */
  match_generation_latency: MetricWithChange;
  /** Metric with current value and change percentage */
  api_response_times: MetricWithChange;
  /** Metric with current value and change percentage */
  system_uptime: MetricWithChange;
  /** Metric with current value and change percentage */
  error_rate: MetricWithChange;
}

/**
 * SectorAnalytics
 * Analytics for sector performance
 */
export interface AppApisAnalyticsEnhancedSectorAnalytics {
  /** Sector Name */
  sector_name: string;
  /** Total Introductions */
  total_introductions: number;
  /** Successful Introductions */
  successful_introductions: number;
  /** Average Response Time */
  average_response_time: number;
  /** Total Meetings */
  total_meetings: number;
  /** Capital Raised */
  capital_raised: number;
}

/**
 * TokenRequest
 * Request model for token validation
 */
export interface AppApisAuthUtilsTokenRequest {
  /** Token */
  token: Record<string, any>;
}

/**
 * IntroductionRequest
 * Request model for requesting an introduction
 */
export interface AppApisContactsIntroductionRequest {
  /** Contact Email */
  contact_email: string;
  /** Message */
  message?: string | null;
  /** Token */
  token: Record<string, any>;
}

/**
 * IntroductionResponse
 * Response model for introduction request
 */
export interface AppApisContactsIntroductionResponse {
  /** Status */
  status: string;
  /** Message */
  message: string;
}

/**
 * AddContentRuleRequest
 * Request model for adding a content rule
 */
export interface AppApisContentRulesAddContentRuleRequest {
  /** Types of content reports */
  type: AppApisContentRulesReportType;
  /** Pattern */
  pattern: string;
  /** Action */
  action: string;
  /** Severity */
  severity: string;
  /** Is Active */
  is_active: boolean;
  /** Token */
  token: any;
  /** Description */
  description?: string | null;
  /** Category */
  category?: string | null;
  /**
   * Is Regex
   * @default false
   */
  is_regex?: boolean;
  /** Priority */
  priority?: number | null;
}

/**
 * PatternTestRequest
 * Request for testing a pattern against content
 */
export interface AppApisContentRulesPatternTestRequest {
  /** Pattern */
  pattern: string;
  /** Content */
  content: string;
  /** Token */
  token: any;
}

/**
 * ReportStatus
 * Status of a content report
 */
export enum AppApisContentRulesReportStatus {
  Pending = "pending",
  UnderReview = "under_review",
  Approved = "approved",
  Rejected = "rejected",
  AutoModerated = "auto_moderated",
}

/**
 * ReportType
 * Types of content reports
 */
export enum AppApisContentRulesReportType {
  Profanity = "profanity",
  Harassment = "harassment",
  Spam = "spam",
  Inappropriate = "inappropriate",
  Misleading = "misleading",
  PersonalInfo = "personal_info",
  Other = "other",
}

/** SectorAnalytics */
export interface AppApisFundOfFundsAnalyticsSectorAnalytics {
  /** Sector */
  sector: string;
  /** Total Aum */
  total_aum: number;
  /** Growth Rate */
  growth_rate: number;
  /** Average Returns */
  average_returns: number;
  /** Risk Scores */
  risk_scores: Record<string, number>;
  /** Fundraising Momentum */
  fundraising_momentum: number;
  /** Deal Flow */
  deal_flow: number;
  /** Average Valuation */
  average_valuation?: number | null;
  /** Investor Sentiment Score */
  investor_sentiment_score: number;
  /** Top Performing Funds */
  top_performing_funds: Record<string, any>[];
  /** Emerging Trends */
  emerging_trends: string[];
  /** Geographical Distribution */
  geographical_distribution: Record<string, number>;
}

/** IntroductionRequest */
export interface AppApisIntroductionsIntroductionRequest {
  /** Id */
  id?: string | null;
  /** Requester Id */
  requester_id: string;
  /** Target Id */
  target_id: string;
  /** Intermediary Id */
  intermediary_id: string;
  /** Message */
  message: string;
  /** Created At */
  created_at?: string | null;
  /** @default "pending" */
  status?: IntroductionStatus | null;
  /** Notes */
  notes?: string | null;
}

/** IntroductionResponse */
export interface AppApisIntroductionsIntroductionResponse {
  /** Id */
  id: string;
  /** Requester Id */
  requester_id: string;
  /** Target Id */
  target_id: string;
  /** Intermediary Id */
  intermediary_id: string;
  /** Message */
  message: string;
  /**
   * Created At
   * @format date-time
   */
  created_at: string;
  status: IntroductionStatus;
  /** Notes */
  notes?: string | null;
}

/**
 * Attachment
 * Attachment model
 */
export interface AppApisMessagingEnhancedAttachment {
  /** Id */
  id: string;
  /** Filename */
  filename: string;
  /** Content Type */
  content_type: string;
  /** Size */
  size: number;
  /** Url */
  url: string;
}

/** FundraisingMetrics */
export interface AppApisModelsFundraisingMetrics {
  /** Total Capital Raised */
  total_capital_raised: number;
  /** Number Of Deals */
  number_of_deals: number;
  /** Average Deal Size */
  average_deal_size: number;
  /** Success Rate */
  success_rate: number;
  /** Deals By Fund Type */
  deals_by_fund_type: Record<string, number>;
  /** Capital By Fund Type */
  capital_by_fund_type: Record<string, number>;
}

/** PatternTestRequest */
export interface AppApisModelsPatternTestRequest {
  /** Pattern */
  pattern: string;
  /** Test Content */
  test_content: string;
  /** Token */
  token: Record<string, any>;
}

/** ReportStatus */
export enum AppApisModelsReportStatus {
  Pending = "pending",
  Approved = "approved",
  Rejected = "rejected",
  Escalated = "escalated",
  UnderReview = "under_review",
  AutoModerated = "auto_moderated",
}

/** ReportType */
export enum AppApisModelsReportType {
  Spam = "spam",
  Harassment = "harassment",
  Fraud = "fraud",
  Inappropriate = "inappropriate",
  Profanity = "profanity",
  Misleading = "misleading",
  PersonalInfo = "personal_info",
  Other = "other",
}

/** SearchFilters */
export interface AppApisModelsSearchFilters {
  /** User Types */
  user_types?: UserType[] | null;
  /** Specializations */
  specializations?: string[] | null;
  /** Locations */
  locations?: string[] | null;
  /** Min Connections */
  min_connections?: number | null;
  /**
   * Verified Only
   * @default false
   */
  verified_only?: boolean;
  /** Subscription Tiers */
  subscription_tiers?: SubscriptionTier[] | null;
}

/** TokenRequest */
export interface AppApisModelsTokenRequest {
  /**
   * Token
   * Authentication token
   */
  token: Record<string, any>;
}

/** AddContentRuleRequest */
export interface AppApisModerationAddContentRuleRequest {
  type: AppApisModelsReportType;
  /** Pattern */
  pattern: string;
  /** Action */
  action: string;
  /** Severity */
  severity: string;
  /** Is Active */
  is_active: boolean;
  /** Token */
  token: Record<string, any>;
}

/**
 * ModerationSettings
 * Model for moderation settings
 */
export interface AppApisModerationSettingsModerationSettings {
  /**
   * Automatic Moderation
   * @default true
   */
  automatic_moderation?: boolean;
  /**
   * Moderation Threshold
   * @default 70
   */
  moderation_threshold?: number;
  /**
   * Selected Rules
   * @default ["profanity","harassment","spam"]
   */
  selected_rules?: string[];
  /**
   * Notify Moderators
   * @default true
   */
  notify_moderators?: boolean;
  /**
   * Notify Reporters
   * @default true
   */
  notify_reporters?: boolean;
  /**
   * Auto Publish
   * @default false
   */
  auto_publish?: boolean;
  /**
   * Retention Period
   * @default 90
   */
  retention_period?: number;
  /**
   * Appeal Period
   * @default 14
   */
  appeal_period?: number;
  /**
   * Trusted User Threshold
   * @default 50
   */
  trusted_user_threshold?: number;
  /** Rule Actions */
  rule_actions?: Record<string, string>;
  /**
   * Auto Verify Trusted Users
   * @default true
   */
  auto_verify_trusted_users?: boolean;
  /**
   * Revoke Verification On Violation
   * @default true
   */
  revoke_verification_on_violation?: boolean;
  /**
   * Required Verification Level
   * @default "basic"
   */
  required_verification_level?: string;
}

/** ModerationSettings */
export interface AppApisModerationSettingsV1ModerationSettings {
  /**
   * Automatic Moderation
   * @default true
   */
  automatic_moderation?: boolean;
  /**
   * Moderation Threshold
   * @default 70
   */
  moderation_threshold?: number;
  /**
   * Selected Rules
   * @default ["profanity","harassment","spam"]
   */
  selected_rules?: string[];
  /**
   * Notify Moderators
   * @default true
   */
  notify_moderators?: boolean;
  /**
   * Notify Reporters
   * @default true
   */
  notify_reporters?: boolean;
  /**
   * Auto Publish
   * @default false
   */
  auto_publish?: boolean;
  /**
   * Retention Period
   * @default 90
   */
  retention_period?: number;
  /**
   * Appeal Period
   * @default 14
   */
  appeal_period?: number;
  /**
   * Trusted User Threshold
   * @default 50
   */
  trusted_user_threshold?: number;
  /** Rule Actions */
  rule_actions?: Record<string, string>;
  /**
   * Auto Verify Trusted Users
   * @default true
   */
  auto_verify_trusted_users?: boolean;
  /**
   * Revoke Verification On Violation
   * @default true
   */
  revoke_verification_on_violation?: boolean;
  /**
   * Required Verification Level
   * @default "basic"
   */
  required_verification_level?: string;
}

/** PatternTestRequest */
export interface AppApisModerationSettingsV1PatternTestRequest {
  /** Pattern */
  pattern: string;
  /** Content */
  content: string;
  /**
   * Threshold
   * @default 0.7
   */
  threshold?: number;
}

/** PatternTestResult */
export interface AppApisModerationSettingsV1PatternTestResult {
  /** Is Valid */
  is_valid: boolean;
  /** Matches Found */
  matches_found: boolean;
  /** Score */
  score: number;
  /** Match Count */
  match_count: number;
  /** Match Text */
  match_text: string[];
  /**
   * Pattern
   * @default ""
   */
  pattern?: string;
  /** Matches */
  matches?: PatternMatch[];
  /** Error */
  error?: string | null;
}

/** PatternTestRequest */
export interface AppApisPatternTesterPatternTestRequest {
  /** Pattern */
  pattern: string;
  /** Content */
  content: string;
  /**
   * Threshold
   * @default 0.7
   */
  threshold?: number;
}

/** PatternTestResult */
export interface AppApisPatternTesterPatternTestResult {
  /** Is Valid */
  is_valid: boolean;
  /** Matches Found */
  matches_found: boolean;
  /** Score */
  score: number;
  /** Match Count */
  match_count: number;
  /** Match Text */
  match_text: string[];
}

/**
 * VerificationSettings
 * Settings for the verification system
 */
export interface AppApisSettingsVerificationSettings {
  /**
   * Require Documents
   * @default true
   */
  require_documents?: boolean;
  /**
   * Profile Completion Threshold
   * @default 90
   */
  profile_completion_threshold?: number;
  /**
   * Auto Verify Trusted Users
   * @default false
   */
  auto_verify_trusted_users?: boolean;
  /**
   * Verification Message
   * @default "Complete your profile and upload required documents to get verified."
   */
  verification_message?: string;
}

/** Attachment */
export interface AppApisSupportAttachment {
  /** Id */
  id: string;
  /** Filename */
  filename: string;
  /** Content Type */
  content_type: string;
  /** Size */
  size: number;
  /** Url */
  url: string;
  /**
   * Uploaded At
   * @format date-time
   */
  uploaded_at: string;
  /** Uploaded By */
  uploaded_by: string;
}

/** ModerationSettings */
export interface AppApisVerificationSettingsModerationSettings {
  /**
   * Automatic Moderation
   * @default true
   */
  automatic_moderation?: boolean;
  /**
   * Moderation Threshold
   * @default 70
   */
  moderation_threshold?: number;
  /**
   * Selected Rules
   * @default ["profanity","harassment","spam"]
   */
  selected_rules?: string[];
  /**
   * Notify Moderators
   * @default true
   */
  notify_moderators?: boolean;
  /**
   * Notify Reporters
   * @default true
   */
  notify_reporters?: boolean;
  /**
   * Auto Publish
   * @default false
   */
  auto_publish?: boolean;
  /**
   * Retention Period
   * @default 90
   */
  retention_period?: number;
  /**
   * Appeal Period
   * @default 14
   */
  appeal_period?: number;
  /**
   * Trusted User Threshold
   * @default 50
   */
  trusted_user_threshold?: number;
  /** Rule Actions */
  rule_actions?: Record<string, any>;
  /**
   * Auto Verify Trusted Users
   * @default true
   */
  auto_verify_trusted_users?: boolean;
  /**
   * Revoke Verification On Violation
   * @default true
   */
  revoke_verification_on_violation?: boolean;
  /**
   * Required Verification Level
   * @default "basic"
   */
  required_verification_level?: string;
}

/** PatternTestRequest */
export interface AppApisVerificationSettingsPatternTestRequest {
  /** Content */
  content: string;
  /** Pattern */
  pattern: string;
  /**
   * Threshold
   * @default 0.7
   */
  threshold?: number;
}

/** PatternTestResult */
export interface AppApisVerificationSettingsPatternTestResult {
  /** Matches Found */
  matches_found: boolean;
  /** Match Count */
  match_count: number;
  /** Match Text */
  match_text: string[];
  /** Pattern */
  pattern: string;
  /** Score */
  score: number;
  /**
   * Is Valid
   * @default true
   */
  is_valid?: boolean;
  /** Matches */
  matches?: PatternMatch[];
  /** Error */
  error?: string | null;
}

/** VerificationSettings */
export interface AppApisVerificationSettingsVerificationSettings {
  /**
   * Require Documents
   * @default true
   */
  require_documents?: boolean;
  /**
   * Profile Completion Threshold
   * @default 90
   */
  profile_completion_threshold?: number;
  /**
   * Auto Verify Trusted Users
   * @default false
   */
  auto_verify_trusted_users?: boolean;
  /**
   * Verification Message
   * @default "Complete your profile and upload required documents to get verified"
   */
  verification_message?: string;
  moderation?: AppApisVerificationSettingsModerationSettings;
}

export type CheckHealthData = HealthResponse;

export interface GetAuditLogsParams {
  /**
   * Limit
   * @default 100
   */
  limit?: number;
}

export type GetAuditLogsData = any;

export type GetAuditLogsError = HTTPValidationError;

export interface GetDocumentAuditLogsParams {
  /** Document Id */
  documentId: string;
}

export type GetDocumentAuditLogsData = any;

export type GetDocumentAuditLogsError = HTTPValidationError;

export type AnonymizeDataData = AnonymizedData;

export type AnonymizeDataError = HTTPValidationError;

/** Response Get Default Rules */
export type GetDefaultRulesData = AnonymizationRule[];

export type SaveAnonymizationPreferencesData = any;

export type SaveAnonymizationPreferencesError = HTTPValidationError;

export interface GetAnonymizationPreferencesParams {
  /** User Id */
  userId: string;
}

export type GetAnonymizationPreferencesData = AnonymizationConfig;

export type GetAnonymizationPreferencesError = HTTPValidationError;

export type TestFileTypeDetectionData = TestSuite;

export type TestMalwareDetectionData = TestSuite;

export type AddReactionData = Reaction;

export type AddReactionError = HTTPValidationError;

/** Response Remove Reaction */
export type RemoveReactionData = Record<string, any>;

export type RemoveReactionError = HTTPValidationError;

export interface GetReactionsParams {
  /** Message Id */
  messageId: string;
}

export type GetReactionsData = GetReactionsResponse;

export type GetReactionsError = HTTPValidationError;

export type SubmitFeedbackData = FeedbackResponse;

export type SubmitFeedbackError = HTTPValidationError;

/** Response Get Feedback Analytics */
export type GetFeedbackAnalyticsData = Record<string, any>;

export type TestEmailNotificationData = any;

export type TestEmailNotificationError = HTTPValidationError;

export type CreateCommentData = Comment;

export type CreateCommentError = HTTPValidationError;

export interface ListCommentsParams {
  /** Ticket Id */
  ticketId: string;
}

export type ListCommentsData = ListCommentsResponse;

export type ListCommentsError = HTTPValidationError;

export interface UpdateCommentParams {
  /** Comment Id */
  commentId: string;
}

export type UpdateCommentData = Comment;

export type UpdateCommentError = HTTPValidationError;

export interface DeleteCommentParams {
  /** Comment Id */
  commentId: string;
}

export type DeleteCommentData = any;

export type DeleteCommentError = HTTPValidationError;

export interface ReactToCommentParams {
  /** Emoji */
  emoji: string;
  /** Comment Id */
  commentId: string;
}

export type ReactToCommentData = any;

export type ReactToCommentError = HTTPValidationError;

export interface ReportCommentParams {
  /** Reason */
  reason: string;
  /** Comment Id */
  commentId: string;
}

export type ReportCommentData = any;

export type ReportCommentError = HTTPValidationError;

export interface ModerateCommentParams {
  /** Status */
  status: string;
  /** Comment Id */
  commentId: string;
}

export type ModerateCommentData = any;

export type ModerateCommentError = HTTPValidationError;

export interface SearchCommentsParams {
  /** Q */
  q: string;
  /** Ticket Id */
  ticket_id?: string | null;
}

export type SearchCommentsData = any;

export type SearchCommentsError = HTTPValidationError;

export type GetCommentAnalyticsData = any;

export type UploadCapitalRaiserIssuesData = IssueUploadResponse;

export type UploadCapitalRaiserIssuesError = HTTPValidationError;

export type ListCapitalRaiserIssuesData = any;

export type EnrichInvestorProfileData = EnrichedInvestorProfile;

export type EnrichInvestorProfileError = HTTPValidationError;

/** Investors */
export type BulkEnrichInvestorProfilesPayload = EnrichedInvestorProfile[];

/** Response Bulk Enrich Investor Profiles */
export type BulkEnrichInvestorProfilesData = EnrichedInvestorProfile[];

export type BulkEnrichInvestorProfilesError = HTTPValidationError;

export interface GetComprehensiveAnalyticsParams {
  /** Cik */
  cik: string;
}

export type GetComprehensiveAnalyticsData = ComprehensiveAnalytics;

export type GetComprehensiveAnalyticsError = HTTPValidationError;

/** Response List Howto Guides */
export type ListHowtoGuidesData = HowToGuide[];

export interface GetHowtoGuideParams {
  /** Guide Id */
  guideId: string;
}

export type GetHowtoGuideData = HowToGuide;

export type GetHowtoGuideError = HTTPValidationError;

export type CreateTicketData = TicketWithSuggestions;

export type CreateTicketError = HTTPValidationError;

/** Current User */
export type ListTicketsPayload = Record<string, any>;

export interface ListTicketsParams {
  /** Status */
  status?: TicketStatus | null;
}

/** Response List Tickets */
export type ListTicketsData = Ticket[];

export type ListTicketsError = HTTPValidationError;

/** Current User */
export type GetTicketPayload = Record<string, any>;

export interface GetTicketParams {
  /** Ticket Id */
  ticketId: string;
}

export type GetTicketData = Ticket;

export type GetTicketError = HTTPValidationError;

export interface UpdateTicketParams {
  /** Ticket Id */
  ticketId: string;
}

export type UpdateTicketData = Ticket;

export type UpdateTicketError = HTTPValidationError;

/** Current User */
export type AddAttachmentPayload = Record<string, any>;

export interface AddAttachmentParams {
  /** File */
  file: string;
  /** Ticket Id */
  ticketId: string;
}

export type AddAttachmentData = Ticket;

export type AddAttachmentError = HTTPValidationError;

export type SearchInvestorsData = SearchResponse;

export type SearchInvestorsError = HTTPValidationError;

export type GetSourceStatusData = any;

export type GetInvestmentFocusDistributionData = ChartData;

export type GetFundSizeDistributionData = ChartData;

export type GetHistoricalPerformanceData = ChartData;

export type GetRiskProfileDistributionData = ChartData;

export type RefreshDataData = any;

/** Response List Kb Articles */
export type ListKbArticlesData = KBArticle[];

export interface GetKbArticleParams {
  /** Article Id */
  articleId: string;
}

export type GetKbArticleData = KBArticle;

export type GetKbArticleError = HTTPValidationError;

export interface SearchKbArticlesParams {
  /** Search Query */
  searchQuery: string;
}

/** Response Search Kb Articles */
export type SearchKbArticlesData = KBArticle[];

export type SearchKbArticlesError = HTTPValidationError;

export interface GetEntityParams {
  /** Entity Id */
  entityId: string;
}

export type GetEntityData = CrunchbaseEntityResponse;

export type GetEntityError = HTTPValidationError;

export interface SearchEntitiesParams {
  /** Search Query */
  searchQuery: string;
}

/** Response Search Entities */
export type SearchEntitiesData = CrunchbaseEntityResponse[];

export type SearchEntitiesError = HTTPValidationError;

export type CreateTestPaymentData = TestPaymentResponse;

export type CreateTestPaymentError = HTTPValidationError;

export interface GetTestPaymentParams {
  /** Payment Id */
  paymentId: string;
}

export type GetTestPaymentData = TestPaymentResponse;

export type GetTestPaymentError = HTTPValidationError;

/** Response List Test Payments */
export type ListTestPaymentsData = TestPaymentResponse[];

/** Metrics */
export type CalculateCommissionPayload = PerformanceMetricsInput | null;

export interface CalculateCommissionParams {
  /** Structure Id */
  structure_id: string;
  /** Base Amount */
  base_amount: number;
  /** Volume */
  volume?: number | null;
}

export type CalculateCommissionData = CommissionCalculation;

export type CalculateCommissionError = HTTPValidationError;

export type CreateCommissionStructureData = CommissionStructure;

export type CreateCommissionStructureError = HTTPValidationError;

export interface GetCommissionStructureParams {
  /** Structure Id */
  structureId: string;
}

export type GetCommissionStructureData = CommissionStructure;

export type GetCommissionStructureError = HTTPValidationError;

export interface UpdateCommissionStructureParams {
  /** Structure Id */
  structureId: string;
}

export type UpdateCommissionStructureData = CommissionStructure;

export type UpdateCommissionStructureError = HTTPValidationError;

export interface ListCommissionStructuresParams {
  /**
   * Include Inactive
   * @default false
   */
  include_inactive?: boolean;
}

/** Response List Commission Structures */
export type ListCommissionStructuresData = CommissionStructure[];

export type ListCommissionStructuresError = HTTPValidationError;

export type CreateIntroductionData = AppApisIntroductionsIntroductionResponse;

export type CreateIntroductionError = HTTPValidationError;

export interface GetIntroductionParams {
  /** Intro Id */
  introId: string;
}

export type GetIntroductionData = AppApisIntroductionsIntroductionResponse;

export type GetIntroductionError = HTTPValidationError;

export interface UpdateIntroductionStatusParams {
  /** Intro Id */
  introId: string;
}

export type UpdateIntroductionStatusData = AppApisIntroductionsIntroductionResponse;

export type UpdateIntroductionStatusError = HTTPValidationError;

export interface ListUserIntroductionsParams {
  /** User Id */
  userId: string;
}

/** Response List User Introductions */
export type ListUserIntroductionsData = AppApisIntroductionsIntroductionResponse[];

export type ListUserIntroductionsError = HTTPValidationError;

export interface GetIntroductionStatusParams {
  /** Intro Id */
  introId: string;
}

/** Response Get Introduction Status */
export type GetIntroductionStatusData = Record<string, any>;

export type GetIntroductionStatusError = HTTPValidationError;

/** Response Get Tier Requirements */
export type GetTierRequirementsData = TierRequirement[];

export interface GetTierStatusParams {
  /** User Id */
  userId: string;
}

export type GetTierStatusData = TierStatus;

export type GetTierStatusError = HTTPValidationError;

export interface CalculateTierParams {
  /** User Id */
  userId: string;
}

export type CalculateTierData = TierStatus;

export type CalculateTierError = HTTPValidationError;

export interface CreateReferralCodeParams {
  /** User Id */
  user_id: string;
}

export type CreateReferralCodeData = any;

export type CreateReferralCodeError = HTTPValidationError;

export interface GetReferralLinksParams {
  /** User Id */
  userId: string;
}

export type GetReferralLinksData = ReferralLinkResponse;

export type GetReferralLinksError = HTTPValidationError;

export interface TrackReferralVisitParams {
  /** Referral Code */
  referral_code: string;
}

export type TrackReferralVisitData = any;

export type TrackReferralVisitError = HTTPValidationError;

export interface ProcessCommissionPaymentParams {
  /** Payment Method */
  payment_method: string;
  /** Affiliate Id */
  affiliateId: string;
}

export type ProcessCommissionPaymentData = any;

export type ProcessCommissionPaymentError = HTTPValidationError;

export interface GetCommissionPaymentsParams {
  /** Affiliate Id */
  affiliateId: string;
}

export type GetCommissionPaymentsData = any;

export type GetCommissionPaymentsError = HTTPValidationError;

export interface TrackReferralParams {
  /** Referral Code */
  referral_code: string;
}

export type TrackReferralData = any;

export type TrackReferralError = HTTPValidationError;

export interface ConvertReferralParams {
  /** Referred User Id */
  referred_user_id: string;
  /** Tracking Id */
  trackingId: string;
}

export type ConvertReferralData = any;

export type ConvertReferralError = HTTPValidationError;

export interface ActivateAffiliateParams {
  /** User Id */
  user_id: string;
}

export type ActivateAffiliateData = any;

export type ActivateAffiliateError = HTTPValidationError;

export interface GetAffiliateStatusEndpointParams {
  /** User Id */
  userId: string;
}

export type GetAffiliateStatusEndpointData = any;

export type GetAffiliateStatusEndpointError = HTTPValidationError;

/** Settings */
export type UpdateAffiliateSettingsPayload = Record<string, any>;

export interface UpdateAffiliateSettingsParams {
  /** User Id */
  userId: string;
}

export type UpdateAffiliateSettingsData = any;

export type UpdateAffiliateSettingsError = HTTPValidationError;

export interface GetAffiliateSettingsEndpointParams {
  /** User Id */
  userId: string;
}

export type GetAffiliateSettingsEndpointData = any;

export type GetAffiliateSettingsEndpointError = HTTPValidationError;

export interface GetRelationshipsParams {
  /** User Id */
  userId: string;
}

export type GetRelationshipsData = any;

export type GetRelationshipsError = HTTPValidationError;

export interface GetReferralStatsParams {
  /** User Id */
  userId: string;
}

export type GetReferralStatsData = any;

export type GetReferralStatsError = HTTPValidationError;

export type SendMessageEndpointData = Message;

export type SendMessageEndpointError = HTTPValidationError;

export interface ToggleThreadMuteParams {
  /** Thread Id */
  threadId: string;
}

/** Response Toggle Thread Mute */
export type ToggleThreadMuteData = Record<string, any>;

export type ToggleThreadMuteError = HTTPValidationError;

export interface MarkThreadReadStatusParams {
  /** Is Read */
  is_read: boolean;
  /** Thread Id */
  threadId: string;
}

/** Response Mark Thread Read Status */
export type MarkThreadReadStatusData = Record<string, any>;

export type MarkThreadReadStatusError = HTTPValidationError;

export interface GetMessagesParams {
  /**
   * Page
   * @default 1
   */
  page?: number;
  /**
   * Page Size
   * @default 50
   */
  page_size?: number;
  /** Thread Id */
  thread_id?: string | null;
  /** Other User Id */
  otherUserId: string;
}

export type GetMessagesData = ThreadResponse;

export type GetMessagesError = HTTPValidationError;

export type UpdateTypingIndicatorData = any;

export type UpdateTypingIndicatorError = HTTPValidationError;

export interface GetTypingStatusParams {
  /** Other User Id */
  otherUserId: string;
}

export type GetTypingStatusData = any;

export type GetTypingStatusError = HTTPValidationError;

/** Response Get Conversations */
export type GetConversationsData = Conversation[];

export type GetConversationsError = HTTPValidationError;

export interface GetUserRelationshipsParams {
  /** User Id */
  userId: string;
}

/** Response Get User Relationships */
export type GetUserRelationshipsData = Relationship[];

export type GetUserRelationshipsError = HTTPValidationError;

export interface GetRelationshipParams {
  /** Relationship Id */
  relationshipId: string;
}

export type GetRelationshipData = Relationship;

export type GetRelationshipError = HTTPValidationError;

export type CreateRelationshipData = RelationshipResponse;

export type CreateRelationshipError = HTTPValidationError;

export interface UpdateRelationshipStatusParams {
  status: RelationshipStatus;
  /** Relationship Id */
  relationshipId: string;
}

export type UpdateRelationshipStatusData = RelationshipResponse;

export type UpdateRelationshipStatusError = HTTPValidationError;

export interface GetRelationshipStrengthV1Params {
  /** User1 Id */
  user1Id: string;
  /** User2 Id */
  user2Id: string;
}

export type GetRelationshipStrengthV1Data = RelationshipStrength;

export type GetRelationshipStrengthV1Error = HTTPValidationError;

export interface GetNetworkStrengthParams {
  /** User Id */
  userId: string;
}

export type GetNetworkStrengthData = NetworkStrength;

export type GetNetworkStrengthError = HTTPValidationError;

export interface RecordInteractionParams {
  /** Relationship Id */
  relationshipId: string;
}

export type RecordInteractionData = RelationshipResponse;

export type RecordInteractionError = HTTPValidationError;

export interface CalculateRelationshipStrengthParams {
  /** User1 Id */
  user1Id: string;
  /** User2 Id */
  user2Id: string;
}

export type CalculateRelationshipStrengthData = StrengthScore;

export type CalculateRelationshipStrengthError = HTTPValidationError;

export interface CalculateNetworkStrengthParams {
  /** User Id */
  userId: string;
}

/** Response Calculate Network Strength */
export type CalculateNetworkStrengthData = Record<string, number>;

export type CalculateNetworkStrengthError = HTTPValidationError;

export type UploadAttachmentData = AttachmentResponse;

export type UploadAttachmentError = HTTPValidationError;

export interface DownloadAttachmentParams {
  /** Attachment Id */
  attachmentId: string;
}

/**
 * Response Download Attachment
 * @format binary
 */
export type DownloadAttachmentData = File;

export type DownloadAttachmentError = HTTPValidationError;

export interface UploadDocumentParams {
  /** User Id */
  user_id?: string | null;
}

export type UploadDocumentData = DocumentMetadata;

export type UploadDocumentError = HTTPValidationError;

export interface GetDocumentParams {
  /** User Id */
  user_id?: string;
  /** Document Id */
  documentId: string;
}

/**
 * Response Get Document
 * @format binary
 */
export type GetDocumentData = File;

export type GetDocumentError = HTTPValidationError;

export interface DeleteDocumentParams {
  /** User Id */
  user_id?: string;
  /** Document Id */
  documentId: string;
}

export type DeleteDocumentData = any;

export type DeleteDocumentError = HTTPValidationError;

/** Shared With */
export type ShareDocumentPayload = string[];

export interface ShareDocumentParams {
  /** User Id */
  user_id?: string;
  /** Document Id */
  documentId: string;
}

export type ShareDocumentData = any;

export type ShareDocumentError = HTTPValidationError;

export interface ListDocumentsParams {
  /** User Id */
  user_id?: string;
}

/** Response List Documents */
export type ListDocumentsData = DocumentMetadata[];

export type ListDocumentsError = HTTPValidationError;

export interface GetDocumentVersionParams {
  /** User Id */
  user_id?: string;
  /** Document Id */
  documentId: string;
  /** Version */
  version: number;
}

/**
 * Response Get Document Version
 * @format binary
 */
export type GetDocumentVersionData = File;

export type GetDocumentVersionError = HTTPValidationError;

export interface GetDocumentVersionsParams {
  /** User Id */
  user_id?: string;
  /** Document Id */
  documentId: string;
}

/** Response Get Document Versions */
export type GetDocumentVersionsData = DocumentMetadata[];

export type GetDocumentVersionsError = HTTPValidationError;

export interface RestoreDocumentVersionParams {
  /** User Id */
  user_id?: string;
  /** Document Id */
  documentId: string;
  /** Version */
  version: number;
}

export type RestoreDocumentVersionData = any;

export type RestoreDocumentVersionError = HTTPValidationError;

export interface GetQuotaParams {
  /** User Id */
  user_id?: string;
}

export type GetQuotaData = any;

export type GetQuotaError = HTTPValidationError;

export type UpdateUserRoleData = AdminActionResponse;

export type UpdateUserRoleError = HTTPValidationError;

export type UpdateUserStatusData = AdminActionResponse;

export type UpdateUserStatusError = HTTPValidationError;

/** Token */
export type ListAdminUsersPayload = Record<string, any>;

export type ListAdminUsersData = ListAdminUsersResponse;

export type ListAdminUsersError = HTTPValidationError;

/** Token */
export type GetAdminRolePermissionsPayload = Record<string, any>;

export type GetAdminRolePermissionsData = any;

export type GetAdminRolePermissionsError = HTTPValidationError;

/** Token */
export type GetPermissionsPayload = Record<string, any> | null;

export type GetPermissionsData = any;

export type GetPermissionsError = HTTPValidationError;

/** Token */
export type GetAdminAuditLogsPayload = Record<string, any>;

export interface GetAdminAuditLogsParams {
  /**
   * Limit
   * @default 100
   */
  limit?: number;
}

export type GetAdminAuditLogsData = any;

export type GetAdminAuditLogsError = HTTPValidationError;

export type CreateConnectAccountData = ConnectAccountResponse;

export type CreateConnectAccountError = HTTPValidationError;

export interface GetConnectAccountParams {
  /** Account Id */
  accountId: string;
}

export type GetConnectAccountData = ConnectAccount;

export type GetConnectAccountError = HTTPValidationError;

export interface GetUserConnectAccountsParams {
  /** User Id */
  userId: string;
}

/** Response Get User Connect Accounts */
export type GetUserConnectAccountsData = ConnectAccount[];

export type GetUserConnectAccountsError = HTTPValidationError;

export type CreatePayoutData = PayoutResponse;

export type CreatePayoutError = HTTPValidationError;

export type ImportContactsData = ImportContactsResponse;

export type ImportContactsError = HTTPValidationError;

/** Response List Contacts */
export type ListContactsData = Contact[];

export type ListContactsError = HTTPValidationError;

/** Response Get Contact Matches */
export type GetContactMatchesData = ContactMatch[];

export type GetContactMatchesError = HTTPValidationError;

export type RequestIntroductionData = AppApisContactsIntroductionResponse;

export type RequestIntroductionError = HTTPValidationError;

export type TransferOwnershipData = TransferOwnershipResponse;

export type TransferOwnershipError = HTTPValidationError;

export type CreateProfileData = any;

export type CreateProfileError = HTTPValidationError;

export type UploadProfileImageData = any;

export type UploadProfileImageError = HTTPValidationError;

export interface GetProfileV1Params {
  /** Viewer Role */
  viewer_role?: string;
  /** User Id */
  userId: string;
}

export type GetProfileV1Data = any;

export type GetProfileV1Error = HTTPValidationError;

export type ListProfilesV1Data = any;

export type ListProfilesV1Error = HTTPValidationError;

/** Profile Data */
export type StoreProfileEndpointPayload = Record<string, any>;

export interface StoreProfileEndpointParams {
  /** User Id */
  userId: string;
}

/** Response Store Profile Endpoint */
export type StoreProfileEndpointData = Record<string, any>;

export type StoreProfileEndpointError = HTTPValidationError;

export interface GetProfileEndpointParams {
  /** Viewer Role */
  viewer_role?: UserType | null;
  /** User Id */
  userId: string;
}

/** Response Get Profile Endpoint */
export type GetProfileEndpointData = Record<string, any>;

export type GetProfileEndpointError = HTTPValidationError;

/** Updates */
export type UpdateProfileEndpointPayload = Record<string, any>;

export interface UpdateProfileEndpointParams {
  /** User Id */
  userId: string;
}

/** Response Update Profile Endpoint */
export type UpdateProfileEndpointData = Record<string, any>;

export type UpdateProfileEndpointError = HTTPValidationError;

export type UpdateRolePermissionsData = RolePermissionsResponse;

export type UpdateRolePermissionsError = HTTPValidationError;

export type GetRolePermissionsData = RolePermissionsResponse;

export type GetRolePermissionsError = HTTPValidationError;

export type EstimateExportSizeData = EstimateResponse;

export type EstimateExportSizeError = HTTPValidationError;

export type ExportUserDataData = ExportResponse;

export type ExportUserDataError = HTTPValidationError;

export interface GetExportProgressParams {
  /** Export Id */
  exportId: string;
}

export type GetExportProgressData = ExportProgress;

export type GetExportProgressError = HTTPValidationError;

export interface DownloadExportParams {
  /** Export Id */
  exportId: string;
}

export type DownloadExportData = any;

export type DownloadExportError = HTTPValidationError;

export type RequestRefundData = RefundResponse;

export type RequestRefundError = HTTPValidationError;

export type CancelSubscriptionData = CancellationResponse;

export type CancelSubscriptionError = HTTPValidationError;

export interface GetRefundStatusParams {
  /** Refund Id */
  refundId: string;
}

export type GetRefundStatusData = RefundResponse;

export type GetRefundStatusError = HTTPValidationError;

export interface GetCancellationStatusParams {
  /** Cancellation Id */
  cancellationId: string;
}

export type GetCancellationStatusData = CancellationResponse;

export type GetCancellationStatusError = HTTPValidationError;

/** Response Health Check */
export type HealthCheckData = Record<string, string>;

/** Response Get Enums */
export type GetEnumsData = Record<string, any>;

/** Response Get Storage Stats */
export type GetStorageStatsData = Record<string, number>;

export type GetModerationMetricsV1Data = ModerationMetricsResponse;

export type GetModerationMetricsV1Error = HTTPValidationError;

/** Token */
export type GetContentReportsV1Payload = Record<string, any>;

export interface GetContentReportsV1Params {
  /** Status */
  status?: AppApisModelsReportStatus | null;
}

export type GetContentReportsV1Data = ReportResponse;

export type GetContentReportsV1Error = HTTPValidationError;

/** Token */
export type GetContentRulesV1Payload = Record<string, any>;

export type GetContentRulesV1Data = any;

export type GetContentRulesV1Error = HTTPValidationError;

export type TestPatternV1Data = any;

export type TestPatternV1Error = HTTPValidationError;

export type AddContentRuleV1Data = any;

export type AddContentRuleV1Error = HTTPValidationError;

export type BatchUpdateRulesV1Data = any;

export type BatchUpdateRulesV1Error = HTTPValidationError;

/** Token */
export type GetRuleEffectivenessV1Payload = Record<string, any>;

export interface GetRuleEffectivenessV1Params {
  /** Rule Id */
  rule_id?: string | null;
}

export type GetRuleEffectivenessV1Data = any;

export type GetRuleEffectivenessV1Error = HTTPValidationError;

export interface UpdateContentRuleV1Params {
  /** Rule Id */
  ruleId: string;
}

export type UpdateContentRuleV1Data = any;

export type UpdateContentRuleV1Error = HTTPValidationError;

/** Token */
export type GetModerationActionsV1Payload = Record<string, any>;

export interface GetModerationActionsV1Params {
  /** Report Id */
  report_id?: string | null;
}

export type GetModerationActionsV1Data = any;

export type GetModerationActionsV1Error = HTTPValidationError;

export type UpdateReportStatusV1Data = any;

export type UpdateReportStatusV1Error = HTTPValidationError;

export interface GetVisibilitySettingsParams {
  /** User Id */
  userId: string;
}

export type GetVisibilitySettingsData = any;

export type GetVisibilitySettingsError = HTTPValidationError;

export type UpdateVisibilitySettingsData = any;

export type UpdateVisibilitySettingsError = HTTPValidationError;

/** Response Get Subscription Plans */
export type GetSubscriptionPlansData = Record<string, SubscriptionPlan>;

export type StartTrialData = any;

export type StartTrialError = HTTPValidationError;

/** Response Get Subscription Features */
export type GetSubscriptionFeaturesData = Record<string, SubscriptionFeature>;

export interface GetUserSubscriptionParams {
  /** User Id */
  userId: string;
}

export type GetUserSubscriptionData = UserSubscription;

export type GetUserSubscriptionError = HTTPValidationError;

export interface AddPaymentMethodParams {
  /** Payment Type */
  payment_type: string;
  /** Last Four */
  last_four: string;
  /** Expiry Date */
  expiry_date?: string | null;
  /** User Id */
  userId: string;
}

export type AddPaymentMethodData = any;

export type AddPaymentMethodError = HTTPValidationError;

export interface GetPaymentMethodsParams {
  /** User Id */
  userId: string;
}

export type GetPaymentMethodsData = any;

export type GetPaymentMethodsError = HTTPValidationError;

export interface UpdateSubscriptionParams {
  /** User Id */
  userId: string;
}

export type UpdateSubscriptionData = any;

export type UpdateSubscriptionError = HTTPValidationError;

export interface GetTransactionsParams {
  /** User Id */
  userId: string;
}

export type GetTransactionsData = any;

export type GetTransactionsError = HTTPValidationError;

export interface GetInvoicesParams {
  /** User Id */
  userId: string;
}

export type GetInvoicesData = any;

export type GetInvoicesError = HTTPValidationError;

export type ListTrialCodesData = any;

export type CreateTrialCodeData = any;

export type CreateTrialCodeError = HTTPValidationError;

export interface DeactivateTrialCodeParams {
  /** Code */
  code: string;
}

export type DeactivateTrialCodeData = any;

export type DeactivateTrialCodeError = HTTPValidationError;

export interface GetFeatureAccessParams {
  /** User Id */
  userId: string;
  /** Feature Name */
  featureName: string;
}

export type GetFeatureAccessData = any;

export type GetFeatureAccessError = HTTPValidationError;

export interface GetFundManagerAnalyticsParams {
  /** User Id */
  userId: string;
}

export type GetFundManagerAnalyticsData = FundManagerAnalytics;

export type GetFundManagerAnalyticsError = HTTPValidationError;

export interface GetLpAnalyticsParams {
  /** User Id */
  userId: string;
}

export type GetLpAnalyticsData = LimitedPartnerAnalytics;

export type GetLpAnalyticsError = HTTPValidationError;

export interface GetCapitalRaiserAnalyticsParams {
  /** User Id */
  userId: string;
}

export type GetCapitalRaiserAnalyticsData = CapitalRaiserAnalytics;

export type GetCapitalRaiserAnalyticsError = HTTPValidationError;

export type GetAdminAnalytics2Data = AdminAnalytics;

export type CheckHealthRouterData = any;

export type RouteAdminAnalyticsDashboardEndpointData = any;

export interface GetContentReportsWrapperParams {
  /** Status */
  status?: string | null;
}

export type GetContentReportsWrapperData = any;

export type GetContentReportsWrapperError = HTTPValidationError;

export type GetContentRulesWrapperData = any;

export interface GetContentReportsV2Params {
  /** Status */
  status?: string | null;
}

export type GetContentReportsV2Data = any;

export type GetContentReportsV2Error = HTTPValidationError;

export type GetContentRulesV2Data = any;

export type GetAdminAnalyticsByPathData = any;

export type GetAdminAnalyticsDashboardData = any;

export type GetAdminAnalyticsEndpointData = any;

export type GetAdminAnalyticsRootData = any;

export type GetAdminDashboardData = AdminDashboard;

export interface GetUserTypeAnalyticsParams {
  role: UserType;
}

export type GetUserTypeAnalyticsData = UserTypeMetrics;

export type GetUserTypeAnalyticsError = HTTPValidationError;

export type GetMatchingAnalyticsData = MatchingMetrics;

export type GetFundraisingAnalyticsData = AppApisModelsFundraisingMetrics;

export type GetVerificationSettingsData = AppApisSettingsVerificationSettings;

export type UpdateVerificationSettingsData = AppApisSettingsVerificationSettings;

export type UpdateVerificationSettingsError = HTTPValidationError;

export type CreateProfileV2Data = ProfileResponse;

export type CreateProfileV2Error = HTTPValidationError;

export interface GetProfileV2Params {
  /** Viewer Role */
  viewer_role?: UserType | null;
  /** User Id */
  userId: string;
}

/** Response Get Profile V2 */
export type GetProfileV2Data = Record<string, any>;

export type GetProfileV2Error = HTTPValidationError;

/** Updates */
export type UpdateProfileManagementPayload = Record<string, any>;

export interface UpdateProfileManagementParams {
  /** User Id */
  userId: string;
}

export type UpdateProfileManagementData = ProfileResponse;

export type UpdateProfileManagementError = HTTPValidationError;

export interface UpdateVisibilityManagementParams {
  /** User Id */
  userId: string;
}

export type UpdateVisibilityManagementData = ProfileResponse;

export type UpdateVisibilityManagementError = HTTPValidationError;

export interface ListProfilesV2Params {
  /** User Type */
  user_type?: UserType | null;
  /**
   * Verified Only
   * @default false
   */
  verified_only?: boolean;
  /**
   * Page
   * @default 1
   */
  page?: number;
  /**
   * Page Size
   * @default 10
   */
  page_size?: number;
}

export type ListProfilesV2Data = ProfileListResponse;

export type ListProfilesV2Error = HTTPValidationError;

export type SubmitVerificationData = VerificationResponse;

export type SubmitVerificationError = HTTPValidationError;

export interface GetVerificationStatusParams {
  /** User Id */
  userId: string;
}

/** Response Get Verification Status */
export type GetVerificationStatusData = Record<string, any>;

export type GetVerificationStatusError = HTTPValidationError;

export type ReviewDocumentData = VerificationResponse;

export type ReviewDocumentError = HTTPValidationError;

/** Response Get Pending Verifications */
export type GetPendingVerificationsData = VerificationDocument[];

export type UploadVerificationDocumentData = VerificationResponse;

export type UploadVerificationDocumentError = HTTPValidationError;

export interface DownloadDocumentParams {
  /** Document Id */
  documentId: string;
}

/**
 * Response Download Document
 * @format binary
 */
export type DownloadDocumentData = File;

export type DownloadDocumentError = HTTPValidationError;

export type TestPatternData = any;

export type TestPatternError = HTTPValidationError;

export type GetModerationSettingsV1Data = AppApisModerationSettingsModerationSettings;

/** Response Update Moderation Settings V1 */
export type UpdateModerationSettingsV1Data = Record<string, any>;

export type UpdateModerationSettingsV1Error = HTTPValidationError;

/** Response Get Content Rules V1 */
export type GetContentRulesV12Data = ContentRule[];

/** Rules */
export type UpdateContentRulesV1Payload = ContentRule[];

/** Response Update Content Rules V1 */
export type UpdateContentRulesV1Data = Record<string, any>;

export type UpdateContentRulesV1Error = HTTPValidationError;

export type GetVerificationConfigData = AppApisVerificationSettingsVerificationSettings;

/** Response Update Verification Config */
export type UpdateVerificationConfigData = Record<string, any>;

export type UpdateVerificationConfigError = HTTPValidationError;

export type GetModerationSettingsData = AppApisVerificationSettingsModerationSettings;

/** Response Update Moderation Settings */
export type UpdateModerationSettingsData = Record<string, any>;

export type UpdateModerationSettingsError = HTTPValidationError;

/** Response Get Content Rules */
export type GetContentRulesData = ModerationRule[];

/** Rules */
export type UpdateContentRulesPayload = ModerationRule[];

/** Response Update Content Rules */
export type UpdateContentRulesData = Record<string, any>;

export type UpdateContentRulesError = HTTPValidationError;

export type TestModerationPatternData = AppApisVerificationSettingsPatternTestResult;

export type TestModerationPatternError = HTTPValidationError;

export type GetModerationMetrics2GetData = any;

/** Body */
export type GetModerationMetrics2Payload = Record<string, any>;

export type GetModerationMetrics2Data = any;

export type GetModerationMetrics2Error = HTTPValidationError;

/** Body */
export type GetModerationActions2Payload = Record<string, any>;

export type GetModerationActions2Data = any;

export type GetModerationActions2Error = HTTPValidationError;

export type TestPattern2Data = any;

export type TestPattern2Error = HTTPValidationError;

/** Body */
export type GetContentRules2Payload = Record<string, any>;

export type GetContentRules2Data = any;

export type GetContentRules2Error = HTTPValidationError;

/** Body */
export type GetContentReports2Payload = Record<string, any>;

export interface GetContentReports2Params {
  /** Status */
  status?: string | null;
}

export type GetContentReports2Data = any;

export type GetContentReports2Error = HTTPValidationError;

export type UpdateReportStatus2Data = any;

export type UpdateReportStatus2Error = HTTPValidationError;

export type GetContentRulesV12Result = any;

export type AddContentRuleData = any;

export type AddContentRuleError = HTTPValidationError;

export interface GetContentReportsV12Params {
  /** Status */
  status?: string | null;
}

export type GetContentReportsV12Data = any;

export type GetContentReportsV12Error = HTTPValidationError;

export interface UpdateReportStatusParams {
  /** Report Id */
  reportId: string;
}

export type UpdateReportStatusData = any;

export type UpdateReportStatusError = HTTPValidationError;

export interface GetRuleEffectivenessParams {
  /** Rule Id */
  rule_id?: string | null;
}

export type GetRuleEffectivenessData = any;

export type GetRuleEffectivenessError = HTTPValidationError;

/** Request */
export type BatchUpdateRulesPayload = Record<string, any>;

export type BatchUpdateRulesData = any;

export type BatchUpdateRulesError = HTTPValidationError;

/** Updates */
export type UpdateContentRulePayload = Record<string, any>;

export interface UpdateContentRuleParams {
  /** Rule Id */
  ruleId: string;
}

export type UpdateContentRuleData = any;

export type UpdateContentRuleError = HTTPValidationError;

export type GetModerationActionsData = any;

export type GetModerationMetricsData = any;

export type GetModerationSettingsV12Data = AppApisModerationSettingsV1ModerationSettings;

/** Response Update Moderation Settings V1 */
export type UpdateModerationSettingsV12Data = Record<string, string>;

export type UpdateModerationSettingsV12Error = HTTPValidationError;

export type TestPatternV12Data = AppApisModerationSettingsV1PatternTestResult;

export type TestPatternV12Error = HTTPValidationError;

export interface GetComprehensiveAnalytics2Params {
  /**
   * Time period filters for analytics
   * @default "30d"
   */
  period?: PeriodFilter;
}

export type GetComprehensiveAnalytics2Data = any;

export type GetComprehensiveAnalytics2Error = HTTPValidationError;

export type GetAnalyticsSummaryData = AnalyticsSummary;

export interface GetComprehensiveAnalytics3Params {
  /**
   * Period
   * Time period for analytics (7d, 30d, 90d, 12m, ytd, all)
   * @default "30d"
   */
  period?: string;
}

export type GetComprehensiveAnalytics3Data = ComprehensiveAnalyticsResponse;

export type GetComprehensiveAnalytics3Error = HTTPValidationError;

export type ExportAnalyticsData = any;

export type ExportAnalyticsError = HTTPValidationError;

export type CreateTrackableLinkData = TrackableLinkResponse;

export type CreateTrackableLinkError = HTTPValidationError;

export type RegisterDocumentSectionsData = any;

export type RegisterDocumentSectionsError = HTTPValidationError;

export type RecordAnalyticsEventData = any;

export type RecordAnalyticsEventError = HTTPValidationError;

export interface GetDocumentAnalyticsParams {
  /** User Id */
  user_id?: string;
  /** Document Id */
  documentId: string;
}

export type GetDocumentAnalyticsData = any;

export type GetDocumentAnalyticsError = HTTPValidationError;

export interface GetDocumentLinksParams {
  /** User Id */
  user_id?: string;
  /** Document Id */
  documentId: string;
}

export type GetDocumentLinksData = any;

export type GetDocumentLinksError = HTTPValidationError;

export interface GetDocumentSectionsParams {
  /** User Id */
  user_id?: string;
  /** Document Id */
  documentId: string;
}

export type GetDocumentSectionsData = any;

export type GetDocumentSectionsError = HTTPValidationError;

export interface GetAnalyticsSummary2Params {
  /** User Id */
  user_id?: string;
  /** Document Type */
  document_type?: DocumentType | null;
}

export type GetAnalyticsSummary2Data = any;

export type GetAnalyticsSummary2Error = HTTPValidationError;

export type GetMatchingSettingsData = any;

export type UpdateMatchingSettingsData = any;

export type UpdateMatchingSettingsError = HTTPValidationError;

export type GetGlobalMatchesData = any;

export type CreateSearchPresetData = SearchPresetOutput;

export type CreateSearchPresetError = HTTPValidationError;

export interface GetUserPresetsParams {
  /** User Id */
  userId: string;
}

/** Response Get User Presets */
export type GetUserPresetsData = SearchPresetOutput[];

export type GetUserPresetsError = HTTPValidationError;

export interface DeleteSearchPresetParams {
  /** Preset Id */
  presetId: string;
}

export type DeleteSearchPresetData = any;

export type DeleteSearchPresetError = HTTPValidationError;

export interface GetSearchHistoryParams {
  /**
   * Limit
   * @default 10
   */
  limit?: number | null;
  /** User Id */
  userId: string;
}

/** Response Get Search History */
export type GetSearchHistoryData = SearchHistoryEntry[];

export type GetSearchHistoryError = HTTPValidationError;

export interface SearchUsersParams {
  /** User Id */
  user_id?: string | null;
}

export type SearchUsersData = PaginatedSearchResponse;

export type SearchUsersError = HTTPValidationError;

export interface UpdatePresetLastUsedParams {
  /** Preset Id */
  presetId: string;
}

export type UpdatePresetLastUsedData = any;

export type UpdatePresetLastUsedError = HTTPValidationError;

/** Response Get User Matches */
export type GetUserMatchesData = MatchResult[];

export type GetUserMatchesError = HTTPValidationError;

/** Response Update Match Preferences */
export type UpdateMatchPreferencesData = Record<string, any>;

export type UpdateMatchPreferencesError = HTTPValidationError;

/** Response Record Match */
export type RecordMatchData = Record<string, any>;

export type RecordMatchError = HTTPValidationError;

export type GetComprehensiveDashboardData = ComprehensiveDashboardResponse;

export interface GetFundManagerPerformanceParams {
  /** Fund Id */
  fundId: string;
}

export type GetFundManagerPerformanceData = FundManagerPerformanceMetrics;

export type GetFundManagerPerformanceError = HTTPValidationError;

export interface GetInvestmentScorecardParams {
  /** Fund Id */
  fundId: string;
}

export type GetInvestmentScorecardData = InvestmentScoreCard;

export type GetInvestmentScorecardError = HTTPValidationError;

/** Response Get Sector Performance */
export type GetSectorPerformanceData = AppApisFundOfFundsAnalyticsSectorAnalytics[];

/** Response Get Lp Investment Patterns */
export type GetLpInvestmentPatternsData = LPInvestmentPattern[];

/** Response Get Capital Raiser Performance */
export type GetCapitalRaiserPerformanceData = CapitalRaiserMetrics[];

export type GetNetworkStrength2Data = NetworkAnalytics;
