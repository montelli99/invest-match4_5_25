from typing import Dict, List, Optional, Any
from pydantic import BaseModel
from fastapi import APIRouter, HTTPException
import databutton as db
from app.apis.models import SubscriptionTier
from app.apis.subscription import check_feature_access, FeatureAccess

router = APIRouter()

class VisibilitySettings(BaseModel):
    """Profile visibility settings"""
    is_searchable: bool = True
    show_contact_info: bool = True
    show_investment_history: bool = True
    show_fund_details: bool = True
    show_analytics: bool = True
    allowed_roles: List[str] = ['Fund Manager', 'Limited Partner', 'Capital Raiser']
    custom_visibility: Optional[Dict[str, bool]] = None
    
    model_config = {"arbitrary_types_allowed": True}

class UpdateVisibilityRequest(BaseModel):
    """Request to update visibility settings"""
    user_id: str
    settings: VisibilitySettings
    
    model_config = {"arbitrary_types_allowed": True}

def get_default_visibility(tier: SubscriptionTier) -> VisibilitySettings:
    """Get default visibility settings for a subscription tier"""
    if tier == SubscriptionTier.FREE:
        return VisibilitySettings(
            is_searchable=True,
            show_contact_info=False,
            show_investment_history=False,
            show_fund_details=False,
            show_analytics=False,
            allowed_roles=['Fund Manager']
        )
    elif tier == SubscriptionTier.BASIC:
        return VisibilitySettings(
            is_searchable=True,
            show_contact_info=True,
            show_investment_history=False,
            show_fund_details=True,
            show_analytics=False,
            allowed_roles=['Fund Manager', 'Limited Partner']
        )
    elif tier == SubscriptionTier.PROFESSIONAL:
        return VisibilitySettings(
            is_searchable=True,
            show_contact_info=True,
            show_investment_history=True,
            show_fund_details=True,
            show_analytics=True,
            allowed_roles=['Fund Manager', 'Limited Partner', 'Capital Raiser']
        )
    else:  # ENTERPRISE
        return VisibilitySettings(
            is_searchable=True,
            show_contact_info=True,
            show_investment_history=True,
            show_fund_details=True,
            show_analytics=True,
            allowed_roles=['Fund Manager', 'Limited Partner', 'Capital Raiser'],
            custom_visibility={}
        )

@router.get('/profile/visibility/{user_id}')
def get_visibility_settings(user_id: str):
    """Get visibility settings for a user"""
    try:
        # Check if user has access to profile visibility feature
        access_level = check_feature_access(user_id, 'profile_visibility')
        if access_level == FeatureAccess.NONE:
            raise HTTPException(
                status_code=403,
                detail='No access to profile visibility settings'
            )

        # Get user's subscription tier
        subscriptions = db.storage.json.get('user_subscriptions', default={})
        subscription = subscriptions.get(user_id)
        if not subscription:
            raise HTTPException(status_code=404, detail='User subscription not found')

        # Get stored visibility settings or create default ones
        visibility_settings = db.storage.json.get('profile_visibility_settings', default={})
        if user_id not in visibility_settings:
            settings = get_default_visibility(subscription['tier'])
            visibility_settings[user_id] = settings.model_dump()
            db.storage.json.put('profile_visibility_settings', visibility_settings)
            return settings

        return VisibilitySettings(**visibility_settings[user_id])

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f'Error getting visibility settings: {str(e)}'
        ) from e

@router.post('/profile/visibility/update')
def update_visibility_settings(request: UpdateVisibilityRequest):
    """Update visibility settings for a user"""
    try:
        # Check if user has access to profile visibility feature
        access_level = check_feature_access(request.user_id, 'profile_visibility')
        if access_level == FeatureAccess.NONE:
            raise HTTPException(
                status_code=403,
                detail='No access to profile visibility settings'
            )

        # Get user's subscription tier
        subscriptions = db.storage.json.get('user_subscriptions', default={})
        subscription = subscriptions.get(request.user_id)
        if not subscription:
            raise HTTPException(status_code=404, detail='User subscription not found')

        # Get default settings for tier
        default_settings = get_default_visibility(subscription['tier'])

        # Validate settings based on subscription tier
        if subscription['tier'] != SubscriptionTier.ENTERPRISE:
            # Non-enterprise users can only use default settings for their tier
            if request.settings != default_settings:
                raise HTTPException(
                    status_code=403,
                    detail='Custom visibility settings are only available for Enterprise tier'
                )

        # Save settings
        visibility_settings = db.storage.json.get('profile_visibility_settings', default={})
        visibility_settings[request.user_id] = request.settings.model_dump()
        db.storage.json.put('profile_visibility_settings', visibility_settings)

        return {'status': 'success', 'settings': request.settings}

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f'Error updating visibility settings: {str(e)}'
        ) from e

def apply_visibility_settings(profile: dict, viewer_role: str, settings: VisibilitySettings) -> dict:
    """Apply visibility settings to a profile for a specific viewer"""
    if not settings.is_searchable:
        return None

    if viewer_role not in settings.allowed_roles:
        return None

    visible_profile = profile.copy()

    if not settings.show_contact_info:
        visible_profile.pop('email', None)
        visible_profile.pop('phone', None)

    if not settings.show_investment_history:
        visible_profile.pop('historical_returns', None)
        visible_profile.pop('track_record', None)

    if not settings.show_fund_details:
        visible_profile.pop('fund_size', None)
        visible_profile.pop('investment_focus', None)
        visible_profile.pop('typical_investment_size', None)

    if not settings.show_analytics:
        visible_profile.pop('analytics', None)

    # Apply custom visibility settings if any
    if settings.custom_visibility:
        for field, is_visible in settings.custom_visibility.items():
            if not is_visible:
                visible_profile.pop(field, None)

    return visible_profile
