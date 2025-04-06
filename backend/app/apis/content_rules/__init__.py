"""Content Rules API for the InvestMatch platform.\n\nThis module provides API endpoints for managing content moderation rules.\n"""

from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Union
from pydantic import BaseModel, Field, model_validator
from fastapi import APIRouter, HTTPException, Depends, Query
from enum import Enum
import json
import random
import re
import databutton as db

router = APIRouter(tags=["moderation"])

# --- Models ---

class ReportType(str, Enum):
    """Types of content reports"""
    PROFANITY = "profanity"
    HARASSMENT = "harassment"
    SPAM = "spam"
    INAPPROPRIATE = "inappropriate"
    MISLEADING = "misleading"
    PERSONAL_INFO = "personal_info"
    OTHER = "other"

class ReportStatus(str, Enum):
    """Status of a content report"""
    PENDING = "pending"
    UNDER_REVIEW = "under_review"
    APPROVED = "approved"
    REJECTED = "rejected"
    AUTO_MODERATED = "auto_moderated"

class ContentRuleAction(str, Enum):
    """Action to take when a rule is matched"""
    FLAG = "flag"
    FILTER = "filter"
    HIDE = "hide"
    DELETE = "delete"
    BLOCK_USER = "block_user"

class ContentRuleSeverity(str, Enum):
    """Severity level of a content rule"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class ContentRule(BaseModel):
    """Model representing a content moderation rule"""
    id: Optional[str] = None
    type: ReportType
    pattern: str
    action: ContentRuleAction
    severity: ContentRuleSeverity
    is_active: bool = True
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    created_by: Optional[str] = None
    effectiveness_score: Optional[float] = None
    false_positive_rate: Optional[float] = None
    priority: Optional[int] = Field(default=1, ge=1, le=10)
    description: Optional[str] = None
    category: Optional[str] = None
    is_regex: bool = False
    matches_count: int = 0
    
    model_config = {"arbitrary_types_allowed": True}

class ContentReport(BaseModel):
    """Model representing a content report"""
    id: str
    content_id: str
    content_type: str
    content_excerpt: str
    reporter_id: str
    reported_at: str
    status: ReportStatus = ReportStatus.PENDING
    resolution_time: Optional[float] = None
    resolved_by: Optional[str] = None
    resolved_at: Optional[str] = None
    reason: ReportType
    details: Optional[str] = None
    review_notes: Optional[str] = None
    matched_rules: List[str] = []
    risk_score: float = 0.0
    
    model_config = {"arbitrary_types_allowed": True}

class AddContentRuleRequest(BaseModel):
    """Request model for adding a content rule"""
    type: ReportType
    pattern: str
    action: str
    severity: str
    is_active: bool
    token: Any
    description: Optional[str] = None
    category: Optional[str] = None
    is_regex: bool = False
    priority: Optional[int] = None
    
    model_config = {"arbitrary_types_allowed": True}

class UpdateReportStatusRequest(BaseModel):
    """Request model for updating a report status"""
    report_id: str
    new_status: ReportStatus
    review_notes: Optional[str] = None
    token: Any
    
    model_config = {"arbitrary_types_allowed": True}

class TimeMetrics(BaseModel):
    """Time-based performance metrics"""
    avg_response_time: float = Field(..., description="Average time to respond to reports")
    avg_resolution_time: float = Field(..., description="Average time to resolve reports")
    reports_per_day: float = Field(..., description="Average number of reports per day")
    
    model_config = {"arbitrary_types_allowed": True}

class QualityMetrics(BaseModel):
    """Quality-based performance metrics"""
    false_positive_rate: float = Field(..., description="Rate of false positives")
    false_negative_rate: float = Field(..., description="Rate of false negatives")
    accuracy: float = Field(..., description="Overall accuracy rate")
    
    model_config = {"arbitrary_types_allowed": True}

class EffectivenessMetrics(BaseModel):
    """Rule effectiveness metrics"""
    time_metrics: TimeMetrics = Field(..., description="Time-based performance metrics")
    quality_metrics: QualityMetrics = Field(..., description="Quality-based performance metrics")
    user_appeals: int = Field(default=0, description="Number of user appeals")
    appeal_success_rate: float = Field(default=0, description="Rate of successful appeals")
    automated_actions: int = Field(default=0, description="Number of automated actions taken")
    manual_actions: int = Field(default=0, description="Number of manual moderator actions")
    
    model_config = {"arbitrary_types_allowed": True}

class PatternTestRequest(BaseModel):
    """Request for testing a pattern against content"""
    pattern: str
    content: str
    token: Any
    
    model_config = {"arbitrary_types_allowed": True}

class PatternTestResponse(BaseModel):
    """Response from testing a pattern"""
    matches: List[str]
    match_count: int
    context_segments: List[str]
    
    model_config = {"arbitrary_types_allowed": True}

class AdminActionResponse(BaseModel):
    """Response model for admin actions"""
    success: bool = Field(..., description="Whether the action was successful")
    message: str = Field(..., description="Description of the action result")
    
    model_config = {"arbitrary_types_allowed": True}

# --- Helper Functions ---

def get_rules_from_storage():
    """Get all content rules from storage"""
    try:
        rules_json = db.storage.json.get("content_rules", default={})
        rules = [ContentRule(**rule_data) for rule_id, rule_data in rules_json.items()]
        return rules
    except Exception as e:
        print(f"Error getting rules from storage: {e}")
        return []

def save_rules_to_storage(rules):
    """Save content rules to storage"""
    try:
        rules_json = {rule.id: rule.model_dump() for rule in rules}
        db.storage.json.put("content_rules", rules_json)
        return True
    except Exception as e:
        print(f"Error saving rules to storage: {e}")
        return False

def get_reports_from_storage():
    """Get all content reports from storage"""
    try:
        reports_json = db.storage.json.get("content_reports", default={})
        reports = [ContentReport(**report_data) for report_id, report_data in reports_json.items()]
        return reports
    except Exception as e:
        print(f"Error getting reports from storage: {e}")
        return []

def save_reports_to_storage(reports):
    """Save content reports to storage"""
    try:
        reports_json = {report.id: report.model_dump() for report in reports}
        db.storage.json.put("content_reports", reports_json)
        return True
    except Exception as e:
        print(f"Error saving reports to storage: {e}")
        return False

def generate_sample_rules():
    """Generate sample rules for testing"""
    sample_rules = [
        ContentRule(
            id="rule-1",
            type=ReportType.PROFANITY,
            pattern="\\b(f[\\*\\w]+|s[\\*\\w]+|b[\\*\\w]+)\\b",
            action=ContentRuleAction.FILTER,
            severity=ContentRuleSeverity.MEDIUM,
            is_active=True,
            created_at=datetime.utcnow().isoformat(),
            created_by="system",
            effectiveness_score=0.92,
            false_positive_rate=0.05,
            is_regex=True,
            matches_count=145,
            description="Common profanity filter",
            category="language"
        ),
        ContentRule(
            id="rule-2",
            type=ReportType.HARASSMENT,
            pattern="\\b(idiot|stupid|dumb|loser)\\b",
            action=ContentRuleAction.FLAG,
            severity=ContentRuleSeverity.LOW,
            is_active=True,
            created_at=datetime.utcnow().isoformat(),
            created_by="system",
            effectiveness_score=0.78,
            false_positive_rate=0.15,
            is_regex=True,
            matches_count=87,
            description="Mild harassment terms",
            category="behavior"
        ),
        ContentRule(
            id="rule-3",
            type=ReportType.SPAM,
            pattern="\\b(buy now|click here|limited time|act now|discount)\\b",
            action=ContentRuleAction.HIDE,
            severity=ContentRuleSeverity.MEDIUM,
            is_active=True,
            created_at=datetime.utcnow().isoformat(),
            created_by="system",
            effectiveness_score=0.85,
            false_positive_rate=0.12,
            is_regex=True,
            matches_count=231,
            description="Common marketing spam phrases",
            category="commercial"
        ),
        ContentRule(
            id="rule-4",
            type=ReportType.PERSONAL_INFO,
            pattern="\\b\\d{3}[-.\\s]?\\d{3}[-.\\s]?\\d{4}\\b|\\b\\w+@\\w+\\.\\w{2,}\\b",
            action=ContentRuleAction.DELETE,
            severity=ContentRuleSeverity.HIGH,
            is_active=True,
            created_at=datetime.utcnow().isoformat(),
            created_by="system",
            effectiveness_score=0.97,
            false_positive_rate=0.03,
            is_regex=True,
            matches_count=52,
            description="Phone numbers and email addresses",
            category="privacy"
        ),
        ContentRule(
            id="rule-5",
            type=ReportType.INAPPROPRIATE,
            pattern="\\b(sex|porn|xxx|naked|nude)\\b",
            action=ContentRuleAction.BLOCK_USER,
            severity=ContentRuleSeverity.CRITICAL,
            is_active=True,
            created_at=datetime.utcnow().isoformat(),
            created_by="system",
            effectiveness_score=0.88,
            false_positive_rate=0.10,
            is_regex=True,
            matches_count=19,
            description="Explicit content terms",
            category="adult"
        )
    ]
    return sample_rules

def generate_sample_reports():
    """Generate sample reports for testing"""
    report_statuses = list(ReportStatus)
    report_types = list(ReportType)
    report_content_types = ["message", "profile", "document", "comment"]
    
    sample_reports = []
    
    for i in range(1, 21):  # Generate 20 sample reports
        resolution_time = None
        resolved_by = None
        resolved_at = None
        status = random.choice(report_statuses)
        
        # If the report is resolved, add resolution details
        if status in [ReportStatus.APPROVED, ReportStatus.REJECTED, ReportStatus.AUTO_MODERATED]:
            resolution_time = random.uniform(0.5, 48.0)  # Hours
            resolved_by = "auto" if status == ReportStatus.AUTO_MODERATED else f"moderator-{random.randint(1,5)}"
            resolved_at = (datetime.utcnow() - timedelta(hours=random.uniform(1, 72))).isoformat()
        
        # Generate risk score based on report type and status
        risk_score = random.uniform(0, 100)
        if status == ReportStatus.APPROVED:
            risk_score = random.uniform(70, 100)  # Higher risk for approved reports
        elif status == ReportStatus.REJECTED:
            risk_score = random.uniform(0, 30)  # Lower risk for rejected reports
        
        report = ContentReport(
            id=f"report-{i}",
            content_id=f"content-{random.randint(1, 100)}",
            content_type=random.choice(report_content_types),
            content_excerpt=f"Sample content excerpt for report {i}",
            reporter_id=f"user-{random.randint(1, 50)}",
            reported_at=(datetime.utcnow() - timedelta(hours=random.uniform(1, 168))).isoformat(),
            status=status,
            resolution_time=resolution_time,
            resolved_by=resolved_by,
            resolved_at=resolved_at,
            reason=random.choice(report_types),
            details=f"User reported this content as inappropriate" if random.random() > 0.5 else None,
            review_notes=f"Moderator notes for report {i}" if status != ReportStatus.PENDING else None,
            matched_rules=[f"rule-{random.randint(1, 5)}" for _ in range(random.randint(0, 3))],
            risk_score=risk_score
        )
        sample_reports.append(report)
    
    return sample_reports

def initialize_store():
    """Initialize the storage with sample data if it doesn't exist"""
    try:
        # Check if content rules exist, if not, create sample rules
        rules_json = db.storage.json.get("content_rules", default=None)
        if rules_json is None:
            sample_rules = generate_sample_rules()
            save_rules_to_storage(sample_rules)
            print("Initialized storage with sample rules")
        
        # Check if content reports exist, if not, create sample reports
        reports_json = db.storage.json.get("content_reports", default=None)
        if reports_json is None:
            sample_reports = generate_sample_reports()
            save_reports_to_storage(sample_reports)
            print("Initialized storage with sample reports")
            
        return True
    except Exception as e:
        print(f"Error initializing store: {e}")
        return False

# Initialize store on module import
initialize_store()

# --- API Endpoints ---

# Endpoints with "2" suffix to match frontend expectations

@router.post("/metrics2")
async def get_moderation_metrics2(body: dict):
    """Get comprehensive moderation metrics - version 2 endpoint to match frontend"""
    # This endpoint simply proxies to the original endpoint
    return await get_moderation_metrics()

@router.get("/metrics2")
async def get_moderation_metrics2_get():
    """GET version of the metrics endpoint for frontend compatibility"""
    # This endpoint simply proxies to the original endpoint
    return await get_moderation_metrics()

@router.post("/moderation-actions2")
async def get_moderation_actions2(body: dict):
    """Get statistics about moderation actions - version 2 endpoint to match frontend"""
    # This endpoint simply proxies to the original endpoint
    return await get_moderation_actions()

@router.post("/test-pattern2")
async def test_pattern2(request: PatternTestRequest):
    """Test a pattern against content - version 2 endpoint to match frontend"""
    # This endpoint simply proxies to the original endpoint
    return await test_pattern(request)

@router.post("/content-rules2")
async def get_content_rules2(body: dict):
    """Get all content moderation rules - version 2 endpoint to match frontend"""
    # This endpoint simply proxies to the original endpoint
    return await get_content_rules_v12()

@router.post("/content-reports2")
async def get_content_reports2(body: dict, status: Optional[str] = None):
    """Get content reports, optionally filtered by status - version 2 endpoint to match frontend"""
    # This endpoint simply proxies to the original endpoint
    return await get_content_reports_v12(status)

@router.post("/update-report-status2")
async def update_report_status2(request: UpdateReportStatusRequest):
    """Update the status of a content report - version 2 endpoint to match frontend"""
    # This endpoint proxies to the original endpoint
    return await update_report_status(request.report_id, request)

@router.post("/rules/get")
async def get_content_rules_v12():
    """Get all content moderation rules
    
    Function renamed to avoid duplicate operation ID with content module.
    """
    try:
        rules = get_rules_from_storage()
        return {"rules": rules}
    except Exception as e:
        print(f"Error getting content rules: {e}")
        raise HTTPException(
            status_code=500,
            detail="Error retrieving content rules"
        ) from e

@router.post("/rules/add")
async def add_content_rule(request: AddContentRuleRequest):
    """Add a new content moderation rule"""
    try:
        # Get existing rules
        rules = get_rules_from_storage()
        
        # Create new rule
        new_rule = ContentRule(
            id=f"rule-{len(rules)+1}",
            type=request.type,
            pattern=request.pattern,
            action=request.action,
            severity=request.severity,
            is_active=request.is_active,
            created_at=datetime.utcnow().isoformat(),
            created_by="admin",  # In a real app, get from token
            description=request.description,
            category=request.category,
            is_regex=request.is_regex,
            priority=request.priority or 5  # Default priority
        )
        
        # Add rule to list and save
        rules.append(new_rule)
        save_rules_to_storage(rules)
        
        return {"success": True, "rule": new_rule.model_dump()}
    except Exception as e:
        print(f"Error adding content rule: {e}")
        raise HTTPException(
            status_code=500,
            detail="Error adding content rule"
        ) from e

@router.post("/reports")
async def get_content_reports_v12(status: Optional[str] = None):
    """Get content reports, optionally filtered by status
    
    Function renamed to avoid duplicate operation ID with content module.
    """
    try:
        reports = get_reports_from_storage()
        
        # Filter by status if specified
        if status:
            reports = [r for r in reports if r.status.value == status]
        
        return {"reports": reports}
    except Exception as e:
        print(f"Error getting content reports: {e}")
        raise HTTPException(
            status_code=500,
            detail="Error retrieving content reports"
        ) from e

@router.post("/reports/{report_id}/status")
async def update_report_status(report_id: str, request: UpdateReportStatusRequest):
    """Update the status of a content report"""
    try:
        reports = get_reports_from_storage()
        
        # Find the report to update
        report_index = next((i for i, r in enumerate(reports) if r.id == report_id), None)
        if report_index is None:
            raise HTTPException(status_code=404, detail="Report not found")
        
        # Update the report
        reports[report_index].status = request.new_status
        reports[report_index].review_notes = request.review_notes
        
        # If the report is being resolved, add resolution details
        if request.new_status in [ReportStatus.APPROVED, ReportStatus.REJECTED]:
            reports[report_index].resolved_by = "admin"  # In a real app, get from token
            reports[report_index].resolved_at = datetime.utcnow().isoformat()
            
            # Calculate resolution time in hours
            reported_at = datetime.fromisoformat(reports[report_index].reported_at)
            resolved_at = datetime.utcnow()
            resolution_time = (resolved_at - reported_at).total_seconds() / 3600
            reports[report_index].resolution_time = resolution_time
        
        # Save the updated reports
        save_reports_to_storage(reports)
        
        return {"success": True, "report": reports[report_index].model_dump()}
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Error updating report status: {e}")
        raise HTTPException(
            status_code=500,
            detail="Error updating report status"
        ) from e

@router.get("/effectiveness")
async def get_rule_effectiveness(rule_id: Optional[str] = None):
    """Get effectiveness metrics for content rules"""
    try:
        # Get all rules
        rules = get_rules_from_storage()
        
        # Get all reports
        reports = get_reports_from_storage()
        
        # If rule_id specified, get metrics for just that rule
        if rule_id:
            rule = next((r for r in rules if r.id == rule_id), None)
            if not rule:
                raise HTTPException(status_code=404, detail="Rule not found")
            
            # Get reports that matched this rule
            matching_reports = [r for r in reports if rule_id in r.matched_rules]
            
            # Calculate effectiveness metrics
            metrics = calculate_effectiveness_metrics([rule], matching_reports)
            
            return {"rule_id": rule_id, "metrics": metrics.model_dump()}
        else:
            # Calculate overall effectiveness metrics
            metrics = calculate_effectiveness_metrics(rules, reports)
            
            # Calculate per-rule metrics
            rule_metrics = {}
            for rule in rules:
                matching_reports = [r for r in reports if rule.id in r.matched_rules]
                rule_metrics[rule.id] = calculate_effectiveness_metrics([rule], matching_reports).model_dump()
            
            return {"overall_metrics": metrics.model_dump(), "rule_metrics": rule_metrics}
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Error getting rule effectiveness: {e}")
        raise HTTPException(
            status_code=500,
            detail="Error retrieving rule effectiveness metrics"
        ) from e

@router.post("/batch-update")
async def batch_update_rules(request: dict):
    """Batch update content rules"""
    try:
        rule_ids = request.get("rule_ids", [])
        operation = request.get("operation", "")
        parameters = request.get("parameters", {})
        
        if not rule_ids or not operation:
            raise HTTPException(status_code=400, detail="Missing required parameters")
        
        # Get existing rules
        rules = get_rules_from_storage()
        
        # Find rules to update
        updated_count = 0
        for i, rule in enumerate(rules):
            if rule.id in rule_ids:
                # Apply the operation
                if operation == "activate":
                    rules[i].is_active = True
                    updated_count += 1
                elif operation == "deactivate":
                    rules[i].is_active = False
                    updated_count += 1
                elif operation == "update_severity":
                    severity = parameters.get("severity")
                    if severity:
                        rules[i].severity = severity
                        updated_count += 1
                elif operation == "update_action":
                    action = parameters.get("action")
                    if action:
                        rules[i].action = action
                        updated_count += 1
                elif operation == "update_priority":
                    priority = parameters.get("priority")
                    if priority is not None:
                        rules[i].priority = priority
                        updated_count += 1
                elif operation == "delete":
                    rules = [r for r in rules if r.id != rule.id]
                    updated_count += 1
        
        # Save updated rules
        save_rules_to_storage(rules)
        
        return {
            "success": True,
            "updated_count": updated_count,
            "message": f"Successfully updated {updated_count} rules"
        }
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Error batch updating rules: {e}")
        raise HTTPException(
            status_code=500,
            detail="Error batch updating rules"
        ) from e

@router.put("/rules/{rule_id}")
async def update_content_rule(rule_id: str, updates: dict):
    """Update a content rule"""
    try:
        # Get existing rules
        rules = get_rules_from_storage()
        
        # Find the rule to update
        rule_index = next((i for i, r in enumerate(rules) if r.id == rule_id), None)
        if rule_index is None:
            raise HTTPException(status_code=404, detail="Rule not found")
        
        # Update rule fields
        rule_dict = rules[rule_index].model_dump()
        for key, value in updates.items():
            if key in rule_dict and key not in ["id", "created_at", "created_by"]:
                rule_dict[key] = value
        
        # Update timestamp
        rule_dict["updated_at"] = datetime.utcnow().isoformat()
        
        # Create updated rule
        rules[rule_index] = ContentRule(**rule_dict)
        
        # Save updated rules
        save_rules_to_storage(rules)
        
        return {"success": True, "rule": rules[rule_index].model_dump()}
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Error updating content rule: {e}")
        raise HTTPException(
            status_code=500,
            detail="Error updating content rule"
        ) from e

@router.post("/moderation-actions")
async def get_moderation_actions():
    """Get statistics about moderation actions"""
    try:
        # Get all reports
        reports = get_reports_from_storage()
        
        # Count reports by status
        status_counts = {}
        for status in ReportStatus:
            status_counts[status.value] = len([r for r in reports if r.status == status])
        
        # Count reports by reason
        reason_counts = {}
        for reason in ReportType:
            reason_counts[reason.value] = len([r for r in reports if r.reason == reason])
        
        # Calculate average resolution time
        resolved_reports = [r for r in reports if r.resolution_time is not None]
        avg_resolution_time = sum(r.resolution_time for r in resolved_reports) / len(resolved_reports) if resolved_reports else 0
        
        # Count by moderator
        moderator_counts = {}
        for r in reports:
            if r.resolved_by:
                moderator_counts[r.resolved_by] = moderator_counts.get(r.resolved_by, 0) + 1
        
        # Calculate time distribution
        time_distribution = {
            "under_1h": len([r for r in resolved_reports if r.resolution_time and r.resolution_time < 1]),
            "1h_to_6h": len([r for r in resolved_reports if r.resolution_time and 1 <= r.resolution_time < 6]),
            "6h_to_24h": len([r for r in resolved_reports if r.resolution_time and 6 <= r.resolution_time < 24]),
            "over_24h": len([r for r in resolved_reports if r.resolution_time and r.resolution_time >= 24])
        }
        
        return {
            "total_reports": len(reports),
            "status_counts": status_counts,
            "reason_counts": reason_counts,
            "avg_resolution_time": avg_resolution_time,
            "moderator_counts": moderator_counts,
            "time_distribution": time_distribution,
            "auto_moderation_rate": status_counts.get(ReportStatus.AUTO_MODERATED.value, 0) / len(reports) if reports else 0
        }
    except Exception as e:
        print(f"Error getting moderation actions: {e}")
        raise HTTPException(
            status_code=500,
            detail="Error retrieving moderation actions"
        ) from e

@router.post("/test-pattern")
async def test_pattern(request: PatternTestRequest):
    """Test a pattern against content"""
    try:
        pattern = request.pattern
        content = request.content
        
        # Simple pattern matching
        matches = []
        try:
            # Try to compile as regex first
            regex = re.compile(pattern, re.IGNORECASE)
            matches = [match.group() for match in regex.finditer(content)]
        except re.error:
            # If fails, treat as plain text or comma-separated keywords
            if "," in pattern:
                keywords = [k.strip() for k in pattern.split(",")]
                for keyword in keywords:
                    matches.extend([keyword for _ in range(content.lower().count(keyword.lower()))])
            else:
                matches = [pattern for _ in range(content.lower().count(pattern.lower()))]
        
        # Deduplicate matches
        matches = list(set(matches))
        
        # Generate context segments
        context_segments = []
        for match in matches:
            index = content.lower().find(match.lower())
            if index != -1:
                start = max(0, index - 20)
                end = min(len(content), index + len(match) + 20)
                context_segments.append(content[start:end])
        
        return PatternTestResponse(
            matches=matches,
            match_count=len(matches),
            context_segments=context_segments
        )
    except Exception as e:
        print("Error testing pattern: " + str(e))
        raise HTTPException(
            status_code=500,
            detail="Error testing pattern: " + str(e)
        ) from e

@router.post("/metrics")
async def get_moderation_metrics():
    """Get comprehensive moderation metrics"""
    try:
        # Get all rules and reports
        rules = get_rules_from_storage()
        reports = get_reports_from_storage()
        
        # Calculate basic stats
        total_rules = len(rules)
        active_rules = len([r for r in rules if r.is_active])
        total_reports = len(reports)
        pending_reports = len([r for r in reports if r.status == ReportStatus.PENDING])
        resolved_reports = len([r for r in reports if r.status in [
            ReportStatus.APPROVED, ReportStatus.REJECTED, ReportStatus.AUTO_MODERATED
        ]])
        
        # Calculate resolution times
        resolved_with_time = [r for r in reports if r.resolution_time is not None]
        avg_resolution_time = sum(r.resolution_time for r in resolved_with_time) / len(resolved_with_time) if resolved_with_time else 0
        
        # Calculate rule stats
        rule_stats = []
        for rule in rules:
            rule_reports = [r for r in reports if rule.id in r.matched_rules]
            rule_stats.append({
                "id": rule.id,
                "type": rule.type,
                "pattern": rule.pattern,
                "matches": len(rule_reports),
                "effectiveness": rule.effectiveness_score or 0.0,
                "false_positive_rate": rule.false_positive_rate or 0.0,
                "is_active": rule.is_active
            })
        
        # Calculate effectiveness metrics
        overall_effectiveness = calculate_effectiveness_metrics(rules, reports)
        
        # Calculate daily trend
        now = datetime.utcnow()
        daily_trend = []
        for i in range(7):  # Last 7 days
            day = now - timedelta(days=i)
            day_start = day.replace(hour=0, minute=0, second=0, microsecond=0)
            day_end = day.replace(hour=23, minute=59, second=59, microsecond=999999)
            
            day_reports = [r for r in reports if 
                           day_start.isoformat() <= r.reported_at <= day_end.isoformat()]
            
            daily_trend.append({
                "date": day.strftime("%Y-%m-%d"),
                "total": len(day_reports),
                "approved": len([r for r in day_reports if r.status == ReportStatus.APPROVED]),
                "rejected": len([r for r in day_reports if r.status == ReportStatus.REJECTED]),
                "auto_moderated": len([r for r in day_reports if r.status == ReportStatus.AUTO_MODERATED])
            })
        
        return {
            "total_rules": total_rules,
            "active_rules": active_rules,
            "total_reports": total_reports,
            "pending_reports": pending_reports,
            "resolved_reports": resolved_reports,
            "avg_resolution_time": avg_resolution_time,
            "rule_stats": rule_stats,
            "effectiveness_metrics": overall_effectiveness.model_dump(),
            "daily_trend": daily_trend
        }
    except Exception as e:
        print(f"Error getting moderation metrics: {e}")
        raise HTTPException(
            status_code=500,
            detail="Error retrieving moderation metrics"
        ) from e

# --- Helper Functions ---

def calculate_effectiveness_metrics(rules, reports) -> EffectivenessMetrics:
    """Calculate effectiveness metrics for rules"""
    # Get resolved reports
    resolved_reports = [r for r in reports if r.status in [
        ReportStatus.APPROVED, ReportStatus.REJECTED, ReportStatus.AUTO_MODERATED
    ]]
    
    # Calculate time metrics
    reports_with_time = [r for r in resolved_reports if r.resolution_time is not None]
    avg_response_time = 0
    avg_resolution_time = 0
    if reports_with_time:
        avg_resolution_time = sum(r.resolution_time for r in reports_with_time) / len(reports_with_time)
        # For response time, we'll simulate it as half the resolution time
        avg_response_time = avg_resolution_time / 2
    
    # Reports per day (assuming reports span over the appropriate time range)
    oldest_report_time = min([datetime.fromisoformat(r.reported_at) for r in reports]) if reports else datetime.utcnow()
    newest_report_time = max([datetime.fromisoformat(r.reported_at) for r in reports]) if reports else datetime.utcnow()
    days_span = (newest_report_time - oldest_report_time).days or 1  # Avoid division by zero
    reports_per_day = len(reports) / days_span
    
    # Quality metrics
    # Simulate these metrics since we don't have actual human-verified data
    false_positives = 0
    false_negatives = 0
    
    # Count rejected reports as false positives
    false_positives = len([r for r in resolved_reports if r.status == ReportStatus.REJECTED])
    
    # Estimate false negatives (reports that should have been flagged but weren't)
    # This is just a simulation - in practice you'd need human verification
    false_negatives = int(len(resolved_reports) * 0.05)  # Assume 5% false negative rate
    
    # Calculate rates
    false_positive_rate = false_positives / len(resolved_reports) if resolved_reports else 0
    false_negative_rate = false_negatives / (len(resolved_reports) + false_negatives) if (len(resolved_reports) + false_negatives) > 0 else 0
    accuracy = 1 - (false_positive_rate + false_negative_rate) / 2
    
    # Count automated vs manual actions
    automated_actions = len([r for r in resolved_reports if r.status == ReportStatus.AUTO_MODERATED])
    manual_actions = len([r for r in resolved_reports if r.status in [ReportStatus.APPROVED, ReportStatus.REJECTED]])
    
    # Count appeals and success rate (simulated)
    user_appeals = int(len(resolved_reports) * 0.1)  # Assume 10% of reports are appealed
    appeal_success_rate = 0.3  # Assume 30% of appeals are successful
    
    return EffectivenessMetrics(
        time_metrics=TimeMetrics(
            avg_response_time=avg_response_time,
            avg_resolution_time=avg_resolution_time,
            reports_per_day=reports_per_day
        ),
        quality_metrics=QualityMetrics(
            false_positive_rate=false_positive_rate,
            false_negative_rate=false_negative_rate,
            accuracy=accuracy
        ),
        user_appeals=user_appeals,
        appeal_success_rate=appeal_success_rate,
        automated_actions=automated_actions,
        manual_actions=manual_actions
    )
