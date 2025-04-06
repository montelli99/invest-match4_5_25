from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
import databutton as db
import json

router = APIRouter()

# Storage keys
MODERATION_SETTINGS_KEY = "moderation_settings_v1"
CONTENT_RULES_KEY = "content_rules_v1"

# Initialize content rules if not exist
try:
    db.storage.json.get(CONTENT_RULES_KEY)
except Exception:
    default_rules = [
        {"id": "profanity", "name": "Profanity Filter", "pattern": "\\b(bad|offensive|damn|hell)\\b", "action": "filter", "enabled": True},
        {"id": "harassment", "name": "Harassment Detection", "pattern": "\\b(stupid|idiot|loser)\\b", "action": "hide", "enabled": True},
        {"id": "spam", "name": "Spam Detection", "pattern": "\\b(buy now|click here|limited time)\\b", "action": "reject", "enabled": True}
    ]
    db.storage.json.put(CONTENT_RULES_KEY, default_rules)

class ModerationSettings(BaseModel):
    """Model for moderation settings"""
    automatic_moderation: bool = True
    moderation_threshold: int = 70
    selected_rules: List[str] = ["profanity", "harassment", "spam"]
    notify_moderators: bool = True
    notify_reporters: bool = True
    auto_publish: bool = False
    retention_period: int = 90
    appeal_period: int = 14
    trusted_user_threshold: int = 50
    rule_actions: Dict[str, str] = Field(
        default_factory=lambda: {
            "profanity": "filter",
            "harassment": "hide",
            "spam": "reject"
        }
    )
    auto_verify_trusted_users: bool = True
    revoke_verification_on_violation: bool = True
    required_verification_level: str = "basic"

@router.get("/moderation-settings")
def get_moderation_settings_v1() -> ModerationSettings:
    """Get moderation settings"""
    try:
        # Try to get existing settings
        settings_dict = db.storage.json.get(MODERATION_SETTINGS_KEY)
        return ModerationSettings(**settings_dict)
    except Exception as e:
        # If settings don't exist, create default settings
        default_settings = ModerationSettings()
        db.storage.json.put(MODERATION_SETTINGS_KEY, default_settings.model_dump())
        return default_settings

@router.post("/moderation-settings")
def update_moderation_settings_v1(body: ModerationSettings) -> dict:
    """Update moderation settings"""
    try:
        # Save settings to db.storage
        db.storage.json.put(MODERATION_SETTINGS_KEY, body.model_dump())
        return {"message": "Settings updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update moderation settings: {str(e)}") from e


# Content rules management endpoints
class ContentRule(BaseModel):
    id: str
    name: str
    pattern: str
    action: str
    enabled: bool = True

@router.get("/content-rules")
def get_content_rules_v1() -> List[ContentRule]:
    """Get content moderation rules"""
    try:
        rules = db.storage.json.get(CONTENT_RULES_KEY)
        return [ContentRule(**rule) for rule in rules]
    except Exception as e:
        # If rules don't exist, create default rules
        default_rules = [
            ContentRule(id="profanity", name="Profanity Filter", pattern="\\b(bad|offensive|damn|hell)\\b", action="filter", enabled=True),
            ContentRule(id="harassment", name="Harassment Detection", pattern="\\b(stupid|idiot|loser)\\b", action="hide", enabled=True),
            ContentRule(id="spam", name="Spam Detection", pattern="\\b(buy now|click here|limited time)\\b", action="reject", enabled=True)
        ]
        db.storage.json.put(CONTENT_RULES_KEY, [rule.model_dump() for rule in default_rules])
        return default_rules

@router.post("/content-rules")
def update_content_rules_v1(rules: List[ContentRule]) -> dict:
    """Update content moderation rules"""
    try:
        db.storage.json.put(CONTENT_RULES_KEY, [rule.model_dump() for rule in rules])
        return {"message": "Content rules updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update content rules: {str(e)}") from e
