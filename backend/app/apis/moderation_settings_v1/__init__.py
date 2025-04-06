from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
import databutton as db
import re
import json

# Remove prefix to avoid route conflicts with frontend expectations
router = APIRouter(prefix="/moderation-settings", tags=["moderation"])

# Storage key for moderation settings - use the same key as verification_settings for consistency
MODERATION_SETTINGS_KEY = "moderation_settings"

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
    rule_actions: Dict[str, str] = Field(default_factory=lambda: {
        "profanity": "filter",
        "harassment": "hide", 
        "spam": "reject"
    })
    auto_verify_trusted_users: bool = True
    revoke_verification_on_violation: bool = True
    required_verification_level: str = "basic"

@router.get("/settings")
def get_moderation_settings_v1() -> ModerationSettings:
    """
    Get moderation settings - Using same storage key as verification_settings API
    for data consistency across APIs
    
    Returns:
        ModerationSettings containing the current moderation configuration
    """
    try:
        # Try to get existing settings
        settings_dict = db.storage.json.get(MODERATION_SETTINGS_KEY, default=None)
        if settings_dict:
            return ModerationSettings(**settings_dict)
        else:
            # Create default settings if none exist
            default_settings = ModerationSettings()
            db.storage.json.put(MODERATION_SETTINGS_KEY, default_settings.model_dump())
            return default_settings
    except Exception as e:
        print(f"Error getting moderation settings: {str(e)}")
        # Return default settings if there's an error
        return ModerationSettings()

@router.post("/settings")
def update_moderation_settings_v1(body: ModerationSettings) -> Dict[str, str]:
    """
    Update moderation settings - Using same storage key as verification_settings API
    for data consistency across APIs
    
    Args:
        body: ModerationSettings data to save
        
    Returns:
        Dictionary with success message
    """
    """Update moderation settings
    
    Args:
        body: ModerationSettings data to save
        
    Returns:
        Dictionary with success message
    """
    try:
        # Save settings to persistent storage
        db.storage.json.put(MODERATION_SETTINGS_KEY, body.model_dump())
        return {"message": "Moderation settings updated successfully"}
    except Exception as e:
        print(f"Error updating moderation settings: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update moderation settings: {str(e)}"
        )

class PatternTestRequest(BaseModel):
    pattern: str
    content: str
    threshold: float = 0.7

class PatternMatch(BaseModel):
    start: int
    end: int
    matched_text: str

class PatternTestResult(BaseModel):
    is_valid: bool
    matches_found: bool
    score: float
    match_count: int
    match_text: List[str]
    pattern: str = ""
    matches: List[PatternMatch] = Field(default_factory=list)
    error: Optional[str] = None

@router.post("/test-pattern")
def test_pattern_v1(body: PatternTestRequest) -> PatternTestResult:
    """Test a moderation pattern against content
    
    Args:
        body: PatternTestRequest containing pattern and content to test
        
    Returns:
        PatternTestResult with match data
    """
    try:
        # Validate regex pattern
        is_valid = True
        try:
            pattern_compiled = re.compile(body.pattern, re.IGNORECASE)
        except re.error:
            is_valid = False
            return PatternTestResult(
                is_valid=False,
                matches_found=False,
                score=0.0,
                match_count=0,
                match_text=[]
            )
        
        if not is_valid:
            return PatternTestResult(
                is_valid=False,
                matches_found=False,
                score=0.0,
                match_count=0,
                match_text=[]
            )
        
        # Find all matches
        # Find match positions using finditer for highlighting
        match_objects = list(re.finditer(body.pattern, body.content, re.IGNORECASE))
        match_text = [m.group(0) for m in match_objects]
        match_count = len(match_text)
        matches_found = match_count > 0
        
        # Create structured matches for highlighting
        position_matches = [
            PatternMatch(
                start=m.start(),
                end=m.end(),
                matched_text=m.group(0)
            ) for m in match_objects
        ]
        
        # Calculate score based on matches and content length
        # Simple scoring: ratio of matched characters to total characters
        total_length = len(body.content)
        matched_length = sum(len(m.group(0)) for m in match_objects) if match_objects else 0
        
        # Avoid division by zero
        score = min(matched_length / max(total_length, 1), 1.0) if total_length > 0 else 0.0
        
        # Return results
        return PatternTestResult(
            is_valid=is_valid,
            matches_found=matches_found,
            score=score,
            match_count=match_count,
            match_text=match_text,
            pattern=body.pattern,
            matches=position_matches
        )
    except Exception as e:
        print(f"Error testing pattern: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error testing pattern: {str(e)}"
        )
