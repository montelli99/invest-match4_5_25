/**
 * This file has been deprecated.
 * All types have been moved to utils/moderationTypes.ts to avoid circular dependencies
 * Please import types from utils/moderationTypes.ts instead.
 */

// Re-export all enums from our enums file to maintain backward compatibility
export {
  ReportStatus,
  ReportType,
  RiskFactor,
  RiskCategory,
  RiskSeverity,
  ComplianceCategory,
  ModeratorRole,
  ModeratorAction,
  AppealStatus,
  TrustLevel,
  WebSocketMessageType
} from "../utils/enums";

// Re-export all interfaces from our moderationTypes file
export type {
  TimeMetrics,
  QualityMetrics,
  EffectivenessMetrics,
  ContentReport,
  RiskFactorWeight,
  RiskScore,
  PatternMatchResult,
  ContentRule,
  Appeal,
  TrustScore,
  TrustHistory,
  WebSocketMessage,
  ContentReportData
} from "../utils/moderationTypes";


