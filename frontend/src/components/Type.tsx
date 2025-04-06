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