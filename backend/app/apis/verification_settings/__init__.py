from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Union, Any
import databutton as db
from enum import Enum
import re
import json
import uuid

router = APIRouter()

class ActionType(str, Enum):
    FILTER = "filter"
    HIDE = "hide"
    REVIEW = "review"
    REJECT = "reject"

class RuleType(str, Enum):
    PROFANITY = "profanity"
    HARASSMENT = "harassment"
    SPAM = "spam"
    PII = "pii"
    THREATS = "threats"
    INAPPROPRIATE = "inappropriate"

class RuleSeverity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

class ModerationRule(BaseModel):
    id: str
    type: RuleType
    is_active: bool = True
    action: ActionType = ActionType.REVIEW
    severity: RuleSeverity = RuleSeverity.MEDIUM

class ModerationSettings(BaseModel):
    automatic_moderation: bool = True
    moderation_threshold: int = 70
    selected_rules: List[str] = ["profanity", "harassment", "spam"]
    notify_moderators: bool = True
    notify_reporters: bool = True
    auto_publish: bool = False
    retention_period: int = 90
    appeal_period: int = 14
    trusted_user_threshold: int = 50
    rule_actions: dict = Field(default_factory=lambda: {
        "profanity": "filter",
        "harassment": "hide", 
        "spam": "reject"
    })
    auto_verify_trusted_users: bool = True
    revoke_verification_on_violation: bool = True
    required_verification_level: str = "basic"

class VerificationSettings(BaseModel):
    require_documents: bool = True
    profile_completion_threshold: float = 90.0
    auto_verify_trusted_users: bool = False
    verification_message: str = "Complete your profile and upload required documents to get verified"
    moderation: ModerationSettings = Field(default_factory=ModerationSettings)

# Keys for storing settings in db.storage
VERIFICATION_SETTINGS_KEY = "verification_settings"
MODERATION_SETTINGS_KEY = "moderation_settings"
CONTENT_RULES_KEY = "moderation_rules"
PATTERN_TESTS_KEY = "pattern_tests_history"

@router.get("/verification-config/")
def get_verification_config() -> VerificationSettings:
    """
    Get verification system settings
    """
    try:
        # Try to get existing settings
        settings_dict = db.storage.json.get(VERIFICATION_SETTINGS_KEY)
        return VerificationSettings(**settings_dict)
    except:
        # If settings don't exist, create default settings
        default_settings = VerificationSettings()
        db.storage.json.put(VERIFICATION_SETTINGS_KEY, default_settings.model_dump())
        return default_settings

@router.post("/verification-config/")
def update_verification_config(settings: VerificationSettings) -> dict:
    """
    Update verification system settings
    """
    # Save settings to db.storage
    db.storage.json.put(VERIFICATION_SETTINGS_KEY, settings.model_dump())
    return {"message": "Settings updated successfully"}

@router.get("/moderation/")
def get_moderation_settings() -> ModerationSettings:
    """
    Get moderation system settings
    """
    try:
        # Try to get existing settings
        settings_dict = db.storage.json.get(MODERATION_SETTINGS_KEY)
        return ModerationSettings(**settings_dict)
    except Exception as e:
        # If settings don't exist, create default settings
        default_settings = ModerationSettings()
        db.storage.json.put(MODERATION_SETTINGS_KEY, default_settings.model_dump())
        return default_settings

@router.post("/moderation/")
def update_moderation_settings(settings: ModerationSettings) -> dict:
    """
    Update moderation system settings
    """
    try:
        # Save settings to db.storage
        db.storage.json.put(MODERATION_SETTINGS_KEY, settings.model_dump())
        return {"message": "Moderation settings updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update moderation settings: {str(e)}")

@router.get("/content-rules/")
def get_content_rules() -> List[ModerationRule]:
    """
    Get content moderation rules
    """
    try:
        # Try to get existing rules
        rules = db.storage.json.get("moderation_rules", default=[])
        
        # If no rules exist, create defaults
        if not rules:
            default_rules = [
                ModerationRule(id="profanity", type=RuleType.PROFANITY),
                ModerationRule(id="harassment", type=RuleType.HARASSMENT),
                ModerationRule(id="spam", type=RuleType.SPAM),
                ModerationRule(id="pii", type=RuleType.PII, is_active=False),
                ModerationRule(id="threats", type=RuleType.THREATS, is_active=False),
                ModerationRule(id="inappropriate", type=RuleType.INAPPROPRIATE, is_active=False)
            ]
            db.storage.json.put("moderation_rules", [rule.model_dump() for rule in default_rules])
            return default_rules
        
        return [ModerationRule(**rule) for rule in rules]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get content rules: {str(e)}")

@router.post("/content-rules/")
def update_content_rules(rules: List[ModerationRule]) -> dict:
    """
    Update content moderation rules
    """
    try:
        # Save rules to db.storage
        db.storage.json.put("moderation_rules", [rule.model_dump() for rule in rules])
        return {"message": "Content rules updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update content rules: {str(e)}")

class PatternTestRequest(BaseModel):
    content: str
    pattern: str
    threshold: float = 0.7

class PatternMatch(BaseModel):
    start: int
    end: int
    matched_text: str

class PatternTestResult(BaseModel):
    matches_found: bool
    match_count: int
    match_text: List[str]
    pattern: str
    score: float
    is_valid: bool = True
    matches: List[PatternMatch] = Field(default_factory=list)
    error: Optional[str] = None

@router.post("/test-pattern/")
def test_moderation_pattern(request: PatternTestRequest) -> PatternTestResult:
    """
    Test moderation pattern against content
    """
    try:
        # Check if pattern is valid by attempting to compile it
        is_valid = True
        error_message = None
        try:
            pattern = re.compile(request.pattern)
        except re.error as e:
            is_valid = False
            error_message = str(e)
            
        # Find matches if pattern is valid
        matches = []
        matches_positions = []
        
        if is_valid:
            # First get all regex objects to extract positions
            match_objects = list(re.finditer(request.pattern, request.content, re.IGNORECASE))
            
            # Extract match text and positions
            matches = [match.group(0) for match in match_objects]
            matches_positions = [
                PatternMatch(
                    start=match.start(), 
                    end=match.end(), 
                    matched_text=match.group(0)
                ) 
                for match in match_objects
            ]
            
            matches_found = len(matches) > 0
            match_count = len(matches)
            match_text = matches if matches else []
            
            # Calculate score based on match count and content length
            content_length = len(request.content)
            if content_length > 0:
                # Calculate ratio of matched text to total text
                matched_text_length = sum(len(match) for match in matches)
                ratio = min(1.0, matched_text_length / content_length)
                score = ratio if matches_found else 0.0
            else:
                score = 0.0
        else:
            matches_found = False
            match_count = 0
            match_text = []
            matches_positions = []
            score = 0.0
        
        # Store test in history for analytics
        try:
            history = db.storage.json.get(PATTERN_TESTS_KEY, default=[])
            history.append({
                "id": str(uuid.uuid4()),
                "timestamp": "timestamp",  # Would use datetime in real implementation
                "pattern": request.pattern,
                "content_sample": request.content[:100] + "..." if len(request.content) > 100 else request.content,
                "matches_found": matches_found,
                "match_count": match_count,
                "score": score,
                "is_valid": is_valid
            })
            # Keep last 100 tests
            if len(history) > 100:
                history = history[-100:]
            db.storage.json.put(PATTERN_TESTS_KEY, history)
        except Exception as e:
            print(f"Failed to store pattern test history: {str(e)}")
            
        return PatternTestResult(
            matches_found=matches_found,
            match_count=match_count,
            match_text=match_text,
            pattern=request.pattern,
            score=score,
            is_valid=is_valid,
            matches=matches_positions,
            error=error_message
        )
    except Exception as e:
        print(f"Error in test_moderation_pattern: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to test pattern: {str(e)}")
