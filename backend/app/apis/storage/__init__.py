"""Storage API for profile data"""

from fastapi import APIRouter, HTTPException
from typing import Dict, Optional

from app.apis.models import UserType
from app.apis.utils import store_profile, get_profile, update_profile, calculate_profile_completeness, get_profile_storage_key

router = APIRouter(prefix="/storage")

@router.post("/profiles/{user_id}")
def store_profile_endpoint(user_id: str, profile_data: Dict) -> Dict:
    """Store a profile in storage"""
    return store_profile(profile_data, user_id)

@router.get("/profiles/{user_id}")
def get_profile_endpoint(user_id: str, viewer_role: Optional[UserType] = None) -> Dict:
    """Get a profile from storage"""
    return get_profile(user_id, viewer_role)

@router.put("/profiles/{user_id}")
def update_profile_endpoint(user_id: str, updates: Dict) -> Dict:
    """Update a profile in storage"""
    return update_profile(user_id, updates)