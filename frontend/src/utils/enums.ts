/**
 * Enum definitions for the application
 * Extracted to avoid circular dependencies
 */

export enum UserRole {
  SuperAdmin = "super_admin",
  Admin = "admin",
  Moderator = "moderator"
}

export enum UserAction {
  Add = "add",
  Remove = "remove",
  Activate = "activate",
  Deactivate = "deactivate"
}

export enum ReportStatus {
  Pending = "pending",
  Reviewed = "reviewed",
  Resolved = "resolved"
}

export enum ReportType {
  Profile = "profile",
  Message = "message"
}

export enum SubscriptionTier {
  Free = "free",
  Basic = "basic",
  Professional = "professional",
  Enterprise = "enterprise"
}

export enum RiskSeverity {
  Low = "low",
  Medium = "medium",
  High = "high",
  Critical = "critical"
}

export enum RiskCategory {
  Harassment = "harassment",
  HateSpeech = "hate_speech",
  AdultContent = "adult_content",
  Violence = "violence",
  Spam = "spam",
  FalseInformation = "false_information"
}

export enum RiskFactor {
  ContentSeverity = "content_severity",
  UserHistory = "user_history",
  ReportFrequency = "report_frequency",
  PatternMatches = "pattern_matches"
}

export enum ComplianceCategory {
  GDPR = "gdpr",
  COPPA = "coppa",
  HIPAA = "hipaa",
  Financial = "financial",
  Standard = "standard"
}

export enum IntroductionStatus {
  Pending = "pending",
  Accepted = "accepted",
  Declined = "declined",
  Completed = "completed",
  Cancelled = "cancelled"
}

export enum InteractionType {
  Message = "message",
  Introduction = "introduction",
  Meeting = "meeting",
  DocumentShare = "document_share",
  DealCollaboration = "deal_collaboration"
}

export enum FundType {
  HedgeFund = "Hedge Fund",
  CryptoHedgeFund = "Crypto Hedge Fund",
  PrivateEquity = "Private Equity",
  VentureCapital = "Venture Capital",
  RealEstate = "Real Estate",
  Debt = "Debt",
  PrivateCredit = "Private Credit",
  AlternativeInvestments = "Alternative Investments"
}

export enum ConnectAccountStatus {
  Pending = "pending",
  Enabled = "enabled",
  Disabled = "disabled",
  Rejected = "rejected"
}

export enum ConnectAccountType {
  Standard = "standard",
  Express = "express",
  Custom = "custom"
}

export enum PaymentMethod {
  Card = "card",
  BankTransfer = "bank_transfer"
}

export enum PaymentStatus {
  Pending = "pending",
  Succeeded = "succeeded",
  Failed = "failed"
}

export enum FeatureAccess {
  None = "none",
  Limited = "limited",
  Full = "full"
}

// Export ModerationType enums to avoid circular imports
// These were previously in moderationTypes.ts
export enum ModeratorRole {
  Junior = "junior",
  Senior = "senior",
  Lead = "lead",
  Admin = "admin"
}

export enum ModeratorAction {
  Approve = "approve",
  Reject = "reject",
  Escalate = "escalate",
  Flag = "flag",
  Ban = "ban"
}

export enum AppealStatus {
  Pending = "pending",
  Approved = "approved",
  Rejected = "rejected",
  InReview = "in_review"
}

export enum TrustLevel {
  New = "new",
  Basic = "basic",
  Trusted = "trusted",
  Elite = "elite"
}

export enum WebSocketMessageType {
  CONTENT_REPORTED = 'content_reported',
  CONTENT_MODERATED = 'content_moderated',
  MODERATION_RULE_UPDATED = 'moderation_rule_updated',
  RISK_SCORE_UPDATED = 'risk_score_updated',
  CONNECTION_STATUS = 'connection_status',
  ERROR = 'error',
}
