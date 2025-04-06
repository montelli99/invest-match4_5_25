from datetime import datetime, timedelta
from functools import wraps
import time
from typing import Dict, List, Optional, Any, Callable
from cachetools import TTLCache, cached
import threading
import json
import uuid
import re

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field

import databutton as db
from app.apis.models import (
    TokenRequest, UserRole, ReportStatus, ReportType, 
    ContentRuleAction, ContentRuleSeverity, ContentRule, ContentReport,
    PatternTestRequest, PatternTestResponse, RolePermissionsResponse,
    UpdateRolePermissionsRequest
)
from app.apis.auth_utils import get_firebase_admin, get_role_verifier

# Cache configurations
METRICS_CACHE_TTL = 300  # 5 minutes
RULE_CACHE_TTL = 600    # 10 minutes
REPORT_CACHE_TTL = 60   # 1 minute

# Rate limiting configurations
RATE_LIMIT_WINDOW = 60  # 1 minute
RATE_LIMIT_MAX_REQUESTS = 100

# Initialize caches
metrics_cache = TTLCache(maxsize=100, ttl=METRICS_CACHE_TTL)
rule_cache = TTLCache(maxsize=1000, ttl=RULE_CACHE_TTL)
report_cache = TTLCache(maxsize=1000, ttl=REPORT_CACHE_TTL)

# Rate limiting storage
rate_limit_storage: Dict[str, List[float]] = {}
rate_limit_lock = threading.Lock()

def rate_limit(func: Callable) -> Callable:
    """Rate limiting decorator"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        # Get token from kwargs or first argument
        token = kwargs.get('token') or (args[0] if args else None)
        if not token:
            raise HTTPException(status_code=400, detail="Token required")

        user_id = str(token)  # Use token as user identifier
        
        with rate_limit_lock:
            current_time = time.time()
            if user_id not in rate_limit_storage:
                rate_limit_storage[user_id] = []

            # Remove old requests
            rate_limit_storage[user_id] = [
                t for t in rate_limit_storage[user_id]
                if current_time - t < RATE_LIMIT_WINDOW
            ]

            # Check rate limit
            if len(rate_limit_storage[user_id]) >= RATE_LIMIT_MAX_REQUESTS:
                raise HTTPException(
                    status_code=429,
                    detail="Rate limit exceeded. Please try again later."
                )

            # Add current request
            rate_limit_storage[user_id].append(current_time)

        return func(*args, **kwargs)
    return wrapper

def with_error_handling(func: Callable) -> Callable:
    """Error handling decorator"""
    @wraps(func)
    async def wrapper(*args, **kwargs):
        try:
            return await func(*args, **kwargs)
        except HTTPException:
            raise
        except Exception as e:
            print(f"Error in {func.__name__}: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"An error occurred: {str(e)}"
            ) from e
    return wrapper


class TimeMetrics(BaseModel):
    model_config = {"arbitrary_types_allowed": True}
    avg_review_time: float = Field(default=0.0, description="Average time to review content")
    avg_response_time: float = Field(default=0.0, description="Average time to respond to reports")
    time_to_action: float = Field(default=0.0, description="Average time from detection to action")
    resolution_time: float = Field(default=0.0, description="Average time to resolve reports")
    escalation_time: float = Field(default=0.0, description="Average time to escalate reports")

class QualityMetrics(BaseModel):
    model_config = {"arbitrary_types_allowed": True}
    accuracy_rate: float = Field(default=0.0, description="Accuracy of moderation decisions")
    consistency_score: float = Field(default=0.0, description="Consistency across similar cases")
    user_feedback_score: float = Field(default=0.0, description="Score based on user feedback")
    false_positive_rate: float = Field(default=0.0, description="Rate of false positive detections")
    escalation_rate: float = Field(default=0.0, description="Rate of escalated reports")
    resolution_quality: float = Field(default=0.0, description="Quality score of resolutions")

class EffectivenessMetrics(BaseModel):
    model_config = {"arbitrary_types_allowed": True}
    time_metrics: TimeMetrics = Field(..., description="Time-based performance metrics")
    quality_metrics: QualityMetrics = Field(..., description="Quality-based performance metrics")
    user_appeals: int = Field(default=0, description="Number of user appeals")
    appeal_success_rate: float = Field(default=0.0, description="Rate of successful appeals")
    automated_actions: int = Field(default=0, description="Number of automated actions taken")
    manual_actions: int = Field(default=0, description="Number of manual moderator actions")

class ModerationMetricsResponse(BaseModel):
    model_config = {"arbitrary_types_allowed": True}
    metrics: EffectivenessMetrics

router = APIRouter(tags=["moderation"])

@router.get("/metrics/v1")
@rate_limit
@with_error_handling
@cached(cache=metrics_cache)
def get_moderation_metrics_v1(token: TokenRequest) -> ModerationMetricsResponse:
    """Get moderation effectiveness metrics"""
    # In a real implementation, these would be calculated from actual data
    return {
        "metrics": {
            "time_metrics": {
                "avg_review_time": 45.2,  # seconds
                "avg_response_time": 120.5,  # seconds
                "time_to_action": 180.3,  # seconds
                "resolution_time": 360.7,  # seconds
                "escalation_time": 240.2   # seconds
            },
            "quality_metrics": {
                "accuracy_rate": 0.95,
                "consistency_score": 0.88,
                "user_feedback_score": 0.92,
                "false_positive_rate": 0.05,
                "escalation_rate": 0.12,
                "resolution_quality": 0.89
            },
            "user_appeals": 25,
            "appeal_success_rate": 0.15,
            "automated_actions": 1250,
            "manual_actions": 450
        }
    }

class PatternMatch(BaseModel):
    model_config = {"arbitrary_types_allowed": True}
    start: int = Field(..., description="Start index of match")
    end: int = Field(..., description="End index of match")
    matched_text: str = Field(..., description="Text that was matched")



from enum import Enum

class RulePriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class ActionTemplate(str, Enum):
    # Educational/Warning Templates
    EDUCATE = "educate"      # Educational message with resources
    WARN = "warn"           # Warning without action
    NOTICE = "notice"       # Formal notice of violation
    
    # Temporary Actions
    TEMP_MUTE = "temp_mute"  # Temporary chat restriction
    RESTRICT = "restrict"    # Limited feature access
    SUSPEND = "suspend"     # Temporary account suspension
    
    # Permanent Actions
    PERM_BAN = "perm_ban"   # Permanent account ban
    BLOCK = "block"         # Block specific functionality
    
    # Review Actions
    FLAG = "flag"           # Flag for review
    REVIEW = "review"       # Send to review queue
    ESCALATE = "escalate"   # Escalate to senior moderator

class ActionParameter(BaseModel):
    model_config = {"arbitrary_types_allowed": True}
    duration: Optional[int] = Field(None, description="Duration in hours for temporary actions")
    reason: Optional[str] = Field(None, description="Reason for the action")
    notification: Optional[str] = Field(None, description="Custom notification message")
    review_required: bool = Field(False, description="Whether manual review is required")

class ActionDefinition(BaseModel):
    model_config = {"arbitrary_types_allowed": True}
    template: ActionTemplate
    parameters: Optional[ActionParameter] = None
    description: str = Field(..., description="Description of what this action does")

class RuleCategory(str, Enum):
    SPAM = "spam"
    HARASSMENT = "harassment"
    FRAUD = "fraud"
    INAPPROPRIATE = "inappropriate"
    CUSTOM = "custom"



class RuleEffectiveness(BaseModel):
    model_config = {"arbitrary_types_allowed": True}
    rule_id: str = Field(..., description="ID of the rule")
    total_matches: int = Field(default=0, description="Total number of matches")
    false_positives: int = Field(default=0, description="Number of false positives")
    actions_taken: int = Field(default=0, description="Number of actions taken")
    last_match: Optional[str] = Field(None, description="Timestamp of last match")
    last_false_positive: Optional[str] = Field(None, description="Timestamp of last false positive")
    effectiveness_score: float = Field(default=0.0, description="Calculated effectiveness score")
    time_metrics: TimeMetrics = Field(default_factory=TimeMetrics, description="Time-based performance metrics")
    quality_metrics: QualityMetrics = Field(default_factory=QualityMetrics, description="Quality-based performance metrics")
    user_appeals: int = Field(default=0, description="Number of user appeals")
    appeal_success_rate: float = Field(default=0.0, description="Rate of successful appeals")
    automated_actions: int = Field(default=0, description="Number of automated actions taken")
    manual_actions: int = Field(default=0, description="Number of manual moderator actions")

# Use the ContentRule from models instead of redefining it
class EnhancedContentRule(BaseModel):
    model_config = {"arbitrary_types_allowed": True}
    base_rule: ContentRule = Field(..., description="The base content rule")
    action_definition: ActionDefinition = Field(..., description="Enhanced action to take when rule matches")
    priority: RulePriority = Field(default=RulePriority.MEDIUM, description="Priority level of the rule")
    category: RuleCategory = Field(default=RuleCategory.CUSTOM, description="Category of the rule")
    last_matched: Optional[str] = Field(None, description="Timestamp of last match")
    false_positive_count: int = Field(default=0, description="Number of false positives reported")

class ModAction(BaseModel):
    model_config = {"arbitrary_types_allowed": True}
    report_id: str = Field(..., description="ID of the report this action is for")
    action_type: str = Field(..., description="Type of action taken")
    performed_by: str = Field(..., description="User ID who performed the action")
    timestamp: str = Field(..., description="When the action was taken")
    notes: str = Field(..., description="Required notes explaining the action taken")
    review_priority: str = Field(default="normal", description="Priority level for review: high, normal, low")
    compliance_category: Optional[str] = Field(None, description="Category for compliance reporting")
    escalation_level: Optional[int] = Field(0, description="Level of escalation, 0 being normal handling")
    review_deadline: Optional[str] = Field(None, description="Deadline for when this action must be reviewed")

class RiskScore(BaseModel):
    model_config = {"arbitrary_types_allowed": True}
    score: float = Field(..., description="Overall risk score (0-100)")
    factors: Dict[str, float] = Field(default_factory=dict, description="Contributing risk factors")
    confidence: float = Field(default=1.0, description="Confidence in the risk assessment (0-1)")
    last_updated: str = Field(..., description="When the risk was last assessed")

class Report(BaseModel):
    model_config = {"arbitrary_types_allowed": True}
    id: str = Field(..., description="Unique identifier for the report")
    type: ReportType = Field(..., description="Type of content being reported")
    content: str = Field(..., description="Description of the reported content")
    reported_by: str = Field(..., description="User ID of the reporter")
    status: ReportStatus = Field(..., description="Current status of the report")
    timestamp: str = Field(..., description="When the report was created")
    severity: str = Field(default="medium", description="Severity level: high, medium, low")
    compliance_tags: List[str] = Field(default_factory=list, description="Tags for compliance categorization")
    last_reviewed: Optional[str] = Field(None, description="When the report was last reviewed")
    review_notes: Optional[str] = Field(None, description="Notes from the last review")
    retention_period: Optional[int] = Field(None, description="Days to retain this report data")
    risk_assessment: Optional[RiskScore] = Field(None, description="Automated risk assessment")
    escalation_history: List[str] = Field(default_factory=list, description="History of escalations")
    appeal_status: Optional[str] = Field(None, description="Status of any appeals")
    resolution_quality: Optional[float] = Field(None, description="Quality score of resolution (0-1)")
    automated_actions: List[str] = Field(default_factory=list, description="Actions taken automatically")
    related_reports: List[str] = Field(default_factory=list, description="IDs of related reports")

class UpdateReportRequest(BaseModel):
    model_config = {"arbitrary_types_allowed": True}
    report_id: str = Field(..., description="ID of the report to update")
    new_status: ReportStatus = Field(..., description="New status for the report")
    review_notes: str = Field(..., description="Required notes explaining the status change")
    token: dict = Field(..., description="Authentication token")

class ReportResponse(BaseModel):
    model_config = {"arbitrary_types_allowed": True}
    reports: List[Report] = Field(..., description="List of content reports")

class ModeratorPerformance:
    def __init__(self, moderator_id: str):
        self.moderator_id = moderator_id
        self.total_reviews = 0
        self.accurate_reviews = 0
        self.avg_response_time = 0.0
        self.avg_resolution_time = 0.0
        self.automated_actions = 0
        self.manual_actions = 0
        self.last_updated = datetime.utcnow()

    def update_metrics(self, *,
        is_accurate: bool = True,
        response_time: Optional[float] = None,
        resolution_time: Optional[float] = None,
        is_automated: bool = False
    ):
        self.total_reviews += 1
        if is_accurate:
            self.accurate_reviews += 1
        
        if response_time is not None:
            self.avg_response_time = (
                (self.avg_response_time * (self.total_reviews - 1) + response_time)
                / self.total_reviews
            )
        
        if resolution_time is not None:
            self.avg_resolution_time = (
                (self.avg_resolution_time * (self.total_reviews - 1) + resolution_time)
                / self.total_reviews
            )
        
        if is_automated:
            self.automated_actions += 1
        else:
            self.manual_actions += 1
        
        self.last_updated = datetime.utcnow()

class RuleEffectivenessManager:
    STORAGE_KEY = "rule_effectiveness"

    @classmethod
    @cached(cache=rule_cache)
    def get_effectiveness(cls, rule_id: Optional[str] = None) -> List[RuleEffectiveness]:
        try:
            data = json.loads(db.storage.text.get(cls.STORAGE_KEY) or "[]")
            effectiveness = [RuleEffectiveness(**item) for item in data]
            if rule_id:
                effectiveness = [e for e in effectiveness if e.rule_id == rule_id]
            return effectiveness
        except Exception as err:
            print(f"Error getting effectiveness: {err}")
            return []

    @classmethod
    def update_effectiveness(cls, rule_id: str, *,
        review_time: Optional[float] = None,
        response_time: Optional[float] = None,
        action_time: Optional[float] = None,
        accuracy_update: Optional[float] = None,
        consistency_update: Optional[float] = None,
        user_feedback: Optional[float] = None,
        is_appeal: bool = False,
        appeal_success: Optional[bool] = None,
        is_automated: bool = False, 
        is_match: bool = False,
        is_false_positive: bool = False,
        action_taken: bool = False
    ) -> bool:
        try:
            all_effectiveness = cls.get_effectiveness()
            
            # Find or create effectiveness record
            effectiveness = next((e for e in all_effectiveness if e.rule_id == rule_id), None)
            if not effectiveness:
                effectiveness = RuleEffectiveness(rule_id=rule_id)
                all_effectiveness.append(effectiveness)
            
            # Update metrics
            now = datetime.utcnow().isoformat()
            if is_match:
                effectiveness.total_matches += 1
                effectiveness.last_match = now
            if is_false_positive:
                effectiveness.false_positives += 1
                effectiveness.last_false_positive = now
            if action_taken:
                effectiveness.actions_taken += 1
            
            # Calculate effectiveness score
            if effectiveness.total_matches > 0:
                true_positives = effectiveness.total_matches - effectiveness.false_positives
                effectiveness.effectiveness_score = (
                    true_positives / effectiveness.total_matches
                ) * 100
            
            # Save updates
            data = [e.dict() for e in all_effectiveness]
            db.storage.text.put(cls.STORAGE_KEY, json.dumps(data))
            return True
        except Exception as err:
            print(f"Error updating effectiveness: {err}")
            return False

class ContentRuleManager:
    STORAGE_KEY = "content_rules"

    @classmethod
    def get_rules(cls) -> List[ContentRule]:
        try:
            rules_data = json.loads(db.storage.text.get(cls.STORAGE_KEY) or "[]")
            return [ContentRule(**rule) for rule in rules_data]
        except Exception as err:
            print(f"Error getting rules: {err}")
            return []

    @classmethod
    def add_rule(cls, rule: ContentRule) -> bool:
        try:
            rules = cls.get_rules()
            rules.append(rule)
            rules_data = [rule.dict() for rule in rules]
            db.storage.text.put(cls.STORAGE_KEY, json.dumps(rules_data))
            return True
        except Exception as err:
            print(f"Error adding rule: {err}")
            return False

    @classmethod
    def update_rule(cls, rule_id: str, updates: dict) -> bool:
        try:
            rules = cls.get_rules()
            updated = False
            for rule in rules:
                if rule.id == rule_id:
                    for key, value in updates.items():
                        setattr(rule, key, value)
                    updated = True
                    break
            
            if updated:
                rules_data = [rule.dict() for rule in rules]
                db.storage.text.put(cls.STORAGE_KEY, json.dumps(rules_data))
            return updated
        except Exception as err:
            print(f"Error updating rule: {err}")
            return False

class ModActionManager:
    STORAGE_KEY = "mod_actions"

    @classmethod
    def get_actions(cls, report_id: Optional[str] = None) -> List[ModAction]:
        try:
            actions_data = json.loads(db.storage.text.get(cls.STORAGE_KEY) or "[]")
            actions = [ModAction(**action) for action in actions_data]
            if report_id:
                actions = [a for a in actions if a.report_id == report_id]
            return actions
        except Exception as err:
            print(f"Error getting actions: {err}")
            return []

    @classmethod
    def add_action(cls, action: ModAction) -> bool:
        try:
            actions = cls.get_actions()
            actions.append(action)
            actions_data = [action.dict() for action in actions]
            db.storage.text.put(cls.STORAGE_KEY, json.dumps(actions_data))
            return True
        except Exception as err:
            print(f"Error adding action: {err}")
            return False

class RiskAssessmentEngine:
    @staticmethod
    def calculate_risk_score(report: Report) -> RiskScore:
        """Calculate risk score based on various factors"""
        factors = {}
        
        # Content-based factors
        content_risk = 0.0
        if any(word in report.content.lower() for word in ['fraud', 'scam', 'illegal']):
            content_risk += 0.3
            factors['content_keywords'] = content_risk
        
        # Reporter reputation
        reporter_risk = 0.0
        # TODO: Implement reporter reputation system
        factors['reporter_reputation'] = reporter_risk
        
        # Time-based factors
        time_risk = 0.0
        report_age = (datetime.utcnow() - datetime.fromisoformat(report.timestamp.replace('Z', '+00:00'))).total_seconds() / 3600
        if report_age > 24:  # Older than 24 hours
            time_risk += 0.1
        factors['time_sensitivity'] = time_risk
        
        # Severity factor
        severity_risk = {
            'low': 0.2,
            'medium': 0.5,
            'high': 0.8
        }.get(report.severity, 0.5)
        factors['severity'] = severity_risk
        
        # Calculate total score (0-100)
        total_score = (content_risk + reporter_risk + time_risk + severity_risk) * 25
        total_score = min(100, max(0, total_score))  # Clamp between 0-100
        
        # Calculate confidence based on available factors
        confidence = len([v for v in factors.values() if v > 0]) / len(factors)
        
        return RiskScore(
            score=total_score,
            factors=factors,
            confidence=confidence,
            last_updated=datetime.utcnow().isoformat()
        )

class BackgroundTaskManager:
    _tasks: List[Dict[str, Any]] = []
    _lock = threading.Lock()

    @classmethod
    def add_task(cls, task_type: str, data: Dict[str, Any]):
        with cls._lock:
            cls._tasks.append({
                'type': task_type,
                'data': data,
                'created_at': datetime.utcnow(),
                'status': 'pending'
            })

    @classmethod
    def process_tasks(cls):
        with cls._lock:
            tasks = cls._tasks.copy()
            cls._tasks.clear()

        for task in tasks:
            try:
                if task['type'] == 'update_effectiveness':
                    RuleEffectivenessManager.update_effectiveness(**task['data'])
                elif task['type'] == 'process_report':
                    ReportManager.process_report(**task['data'])
                task['status'] = 'completed'
            except Exception as e:
                print(f"Error processing task: {str(e)}")
                task['status'] = 'failed'
                task['error'] = str(e)

class ReportManager:
    STORAGE_KEY = "content_reports"

    @classmethod
    @cached(cache=report_cache)
    def get_reports(cls) -> List[Report]:
        try:
            reports_data = json.loads(db.storage.text.get(cls.STORAGE_KEY) or "[]")
            return [Report(**report) for report in reports_data]
        except Exception as err:
            print(f"Error getting reports: {err}")
            return []

    @classmethod
    def update_report(cls, report_id: str, new_status: ReportStatus, review_notes: str = None) -> bool:
        try:
            reports = cls.get_reports()
            updated = False
            for report in reports:
                if report.id == report_id:
                    report.status = new_status
                    if review_notes:
                        report.review_notes = review_notes
                    report.last_reviewed = datetime.utcnow().isoformat()
                    updated = True
                    break
            
            if updated:
                reports_data = [report.dict() for report in reports]
                db.storage.text.put(cls.STORAGE_KEY, json.dumps(reports_data))
            return updated
        except Exception as err:
            print(f"Error updating report: {err}")
            return False

    @classmethod
    def create_report(cls, report: Report) -> bool:
        try:
            # Assess risk before storing
            risk_score = RiskAssessmentEngine.calculate_risk_score(report)
            report.risk_assessment = risk_score
            
            # Auto-escalate high-risk reports
            if risk_score.score >= 80:  # High risk threshold
                report.escalation_history.append(f"Auto-escalated due to high risk score: {risk_score.score}")
                # TODO: Implement notification system for high-risk reports
            
            reports = cls.get_reports()
            
            # Find related reports
            for existing_report in reports:
                if existing_report.reported_by == report.reported_by or \
                   existing_report.content.lower() in report.content.lower() or \
                   report.content.lower() in existing_report.content.lower():
                    report.related_reports.append(existing_report.id)
            
            reports.append(report)
            reports_data = [report.dict() for report in reports]
            db.storage.text.put(cls.STORAGE_KEY, json.dumps(reports_data))
            return True
        except Exception as err:
            print(f"Error creating report: {err}")
            return False

@router.get("/moderation/reports/v1", response_model=ReportResponse)
def get_content_reports_v1(
    token: dict,
    status: Optional[ReportStatus] = None
) -> ReportResponse:
    firebase = get_firebase_admin()
    role_verifier = get_role_verifier(firebase)

    """Get content reports with optional status filter"""
    try:
        # Verify moderator or higher role
        role_verifier.verify_admin(token, UserRole.MODERATOR)
        
        reports = ReportManager.get_reports()
        if status:
            reports = [r for r in reports if r.status == status]
        
        return ReportResponse(reports=reports)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e

@router.get("/moderation/rules/v1")
def get_content_rules_v1(token: dict):
    firebase = get_firebase_admin()
    role_verifier = get_role_verifier(firebase)

    """Get all content moderation rules"""
    try:
        # Verify moderator or higher role
        role_verifier.verify_admin(token, UserRole.MODERATOR)
        
        rules = ContentRuleManager.get_rules()
        return {"rules": rules}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e

class BatchOperationRequest(BaseModel):
    rule_ids: List[str] = Field(..., description="IDs of rules to operate on")
    operation: str = Field(..., description="Operation to perform")
    parameters: Optional[dict] = Field(None, description="Operation parameters")
    token: dict = Field(..., description="Authentication token")

class AddContentRuleRequest(BaseModel):
    type: ReportType
    pattern: str
    action: str
    severity: str
    is_active: bool
    token: dict

@router.post("/moderation/rules/test/v1")
def test_pattern_v1(request: PatternTestRequest):
    firebase = get_firebase_admin()
    role_verifier = get_role_verifier(firebase)

    """Test a pattern against content and return matches"""
    try:
        # Verify moderator or higher role
        role_verifier.verify_admin(request.token, UserRole.MODERATOR)
        
        # Validate pattern
        try:
            re.compile(request.pattern)
        except re.error as e:
            return PatternTestResponse(matches=[], is_valid=False, error=str(e))
        
        # Find matches
        matches = []
        for match in re.finditer(request.pattern, request.content):
            matches.append(PatternMatch(
                start=match.start(),
                end=match.end(),
                matched_text=match.group(0)
            ))
        
        return PatternTestResponse(matches=matches, is_valid=True)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e

@router.post("/moderation/rules/add/v1")
def add_content_rule_v1(request: AddContentRuleRequest):
    firebase = get_firebase_admin()
    role_verifier = get_role_verifier(firebase)

    """Add a new content moderation rule"""
    try:
        # Verify admin or higher role
        role_verifier.verify_admin(request.token, UserRole.ADMIN)
        
        # Create a new rule with generated ID
        new_rule = ContentRule(
            id=str(uuid.uuid4()),
            type=request.type,
            pattern=request.pattern,
            action=request.action,
            severity=request.severity,
            is_active=request.is_active,
            created_by=firebase.get_user_id(request.token)
        )
        success = ContentRuleManager.add_rule(new_rule)
        if not success:
            raise HTTPException(status_code=500, detail="Failed to add rule")
        
        return {"success": True, "message": "Rule added successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e

@router.post("/moderation/rules/batch/v1")
def batch_update_rules_v1(request: BatchOperationRequest):
    firebase = get_firebase_admin()
    role_verifier = get_role_verifier(firebase)

    """Perform batch operations on rules"""
    try:
        # Verify admin role
        role_verifier.verify_admin(request.token, UserRole.ADMIN)
        
        success_count = 0
        rules = ContentRuleManager.get_rules()
        
        for rule in rules:
            if rule.id in request.rule_ids:
                if request.operation == "activate":
                    rule.is_active = True
                    success_count += 1
                elif request.operation == "deactivate":
                    rule.is_active = False
                    success_count += 1
                elif request.operation == "update_priority" and request.parameters and "priority" in request.parameters:
                    rule.priority = request.parameters["priority"]
                    success_count += 1
                elif request.operation == "update_category" and request.parameters and "category" in request.parameters:
                    rule.category = request.parameters["category"]
                    success_count += 1
        
        # Save updated rules
        rules_data = [rule.dict() for rule in rules]
        db.storage.text.put(ContentRuleManager.STORAGE_KEY, json.dumps(rules_data))
        
        return {
            "success": True,
            "message": f"Successfully updated {success_count} rules",
            "updated_count": success_count
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e

@router.get("/moderation/rules/effectiveness/v1")
def get_rule_effectiveness_v1(token: dict, rule_id: Optional[str] = None):
    firebase = get_firebase_admin()
    role_verifier = get_role_verifier(firebase)

    """Get effectiveness metrics for rules"""
    try:
        # Verify moderator role
        role_verifier.verify_admin(token, UserRole.MODERATOR)
        
        effectiveness = RuleEffectivenessManager.get_effectiveness(rule_id)
        return {"effectiveness": effectiveness}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e

@router.post("/moderation/rules/{rule_id}/update/v1")
def update_content_rule_v1(rule_id: str, updates: dict, token: dict):
    firebase = get_firebase_admin()
    role_verifier = get_role_verifier(firebase)

    """Update an existing content moderation rule"""
    try:
        # Verify admin or higher role
        role_verifier.verify_admin(token, UserRole.ADMIN)
        
        success = ContentRuleManager.update_rule(rule_id, updates)
        if not success:
            raise HTTPException(status_code=404, detail="Rule not found")
        
        return {"success": True, "message": "Rule updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e

@router.get("/moderation/actions/v1")
def get_moderation_actions_v1(token: dict, report_id: Optional[str] = None):
    firebase = get_firebase_admin()
    role_verifier = get_role_verifier(firebase)

    """Get moderation actions, optionally filtered by report ID"""
    try:
        # Verify moderator or higher role
        role_verifier.verify_admin(token, UserRole.MODERATOR)
        
        actions = ModActionManager.get_actions(report_id)
        return {"actions": actions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e

@router.post("/moderation/reports/update/v1")
def update_report_status_v1(request: UpdateReportRequest):
    firebase = get_firebase_admin()
    role_verifier = get_role_verifier(firebase)

    """Update the status of a content report"""
    try:
        # Verify moderator or higher role
        role_verifier.verify_admin(request.token, UserRole.MODERATOR)
        
        success = ReportManager.update_report(
            report_id=request.report_id,
            new_status=request.new_status,
            review_notes=request.review_notes
        )
        if not success:
            raise HTTPException(status_code=404, detail="Report not found")
        
        return {"success": True, "message": "Report status updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e
