/**
 * Moderation system type definitions
 */
import { ReportStatus, ReportType, RiskFactor, RiskCategory, RiskSeverity, ComplianceCategory, ModeratorRole, ModeratorAction, AppealStatus, TrustLevel, WebSocketMessageType } from "./enums";

// Re-export enums for components that import from this file
export { ReportStatus, ReportType, RiskFactor, RiskCategory, RiskSeverity, ComplianceCategory, ModeratorRole, ModeratorAction, AppealStatus, TrustLevel, WebSocketMessageType };

// Explicitly re-export all interfaces for better discoverability and to fix import issues
export type { TimeMetrics, QualityMetrics, EffectivenessMetrics, ContentReport, RiskFactorWeight, RiskScore, PatternMatchResult, ContentRule, Appeal, TrustScore, TrustHistory, WebSocketMessage, ContentReportData };

/**
 * Time metrics interface for moderation effectiveness
 */
export interface TimeMetrics {
  avg_review_time: number;
  avg_response_time: number;
  time_to_action: number;
}

/**
 * Quality metrics interface for moderation effectiveness
 */
export interface QualityMetrics {
  accuracy_rate: number;
  consistency_score: number;
  user_feedback_score: number;
}

/**
 * Effectiveness metrics interface for moderation
 */
export interface EffectivenessMetrics {
  time_metrics: TimeMetrics;
  quality_metrics: QualityMetrics;
  user_appeals: number;
  appeal_success_rate: number;
  automated_actions: number;
  manual_actions: number;
}

/**
 * Interface for content report
 */
export interface ContentReport {
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
  risk_score?: number;
  risk_factors?: RiskFactor[];
  pattern_matches?: string[];
  false_positive?: boolean;
}

/**
 * Risk factor weight interface
 */
export interface RiskFactorWeight {
  name: RiskFactor;
  score: number;
  weight: number;
}

/**
 * Risk score interface for comprehensive risk assessment
 */
export interface RiskScore {
  value: number;
  severity: RiskSeverity;
  category: RiskCategory;
  factors: RiskFactorWeight[];
  timestamp: string;
}

/**
 * Pattern match result interface
 */
export interface PatternMatchResult {
  pattern: string;
  matches: string[];
  is_regex: boolean;
  match_count: number;
  context_segments: string[];
}

/**
 * Moderation rule interface
 */
export interface ContentRule {
  id: string;
  type: ReportType;
  pattern: string;
  action: string;
  severity: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  match_count: number;
  effectiveness: number;
}

/**
 * Appeal interface
 */
export interface Appeal {
  id: string;
  user_id: string;
  report_id: string;
  reason: string;
  status: AppealStatus;
  reviewer_id?: string;
  review_notes?: string;
  created_at: string;
  updated_at?: string;
}

/**
 * Trust score interface
 */
export interface TrustScore {
  user_id: string;
  level: TrustLevel;
  points: number;
  history: TrustHistory[];
  privileges: string[];
}

/**
 * Trust history interface
 */
export interface TrustHistory {
  date: string;
  action: string;
  points_change: number;
  reason: string;
}

/**
 * WebSocket message interface
 */
export interface WebSocketMessage {
  type: WebSocketMessageType;
  data: any;
  timestamp: string;
}

/**
 * Content report message data
 */
export interface ContentReportData {
  reportId: string;
  contentId: string;
  contentType: 'message' | 'profile' | 'document' | 'comment';
  contentExcerpt: string;
  reporterUserId: string;
  reportReason: string;
  reportedUserId: string;
  riskScore: RiskScore;
  timestamp: string;
}
