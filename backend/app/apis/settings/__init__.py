from typing import Dict, Optional, Any
from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel
import databutton as db

router = APIRouter(prefix="/verification-settings", tags=["verification_settings"])

class VerificationSettings(BaseModel):
    """Settings for the verification system"""
    require_documents: bool = True
    profile_completion_threshold: float = 90.0  # Default threshold: 90%
    auto_verify_trusted_users: bool = False
    verification_message: str = "Complete your profile and upload required documents to get verified."
    
    model_config = {"arbitrary_types_allowed": True}

def get_default_verification_settings() -> VerificationSettings:
    """Get default verification settings"""
    return VerificationSettings()

@router.get("/", response_model=VerificationSettings)
def get_verification_settings() -> VerificationSettings:
    """Get verification system settings"""
    try:
        settings_dict = db.storage.json.get("verification_settings", default={})
        if not settings_dict:
            # Return default settings if none exist
            default_settings = get_default_verification_settings()
            # Store default settings for future use
            db.storage.json.put("verification_settings", default_settings.model_dump())
            return default_settings
        
        return VerificationSettings(**settings_dict)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving verification settings: {str(e)}") from e

@router.post("/", response_model=VerificationSettings)
def update_verification_settings(settings: VerificationSettings = Body(...)) -> VerificationSettings:
    """Update verification system settings"""
    try:
        # Store updated settings
        db.storage.json.put("verification_settings", settings.model_dump())
        return settings
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating verification settings: {str(e)}") from e
