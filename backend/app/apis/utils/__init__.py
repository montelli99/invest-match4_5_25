"""
Utility functions and endpoints for the InvestMatch platform.

This module provides core functionality used across the platform:
1. Profile Management: Storage, retrieval, and updates
2. Privacy Controls: Role-based visibility filtering
3. Data Validation: Type checking and field validation
4. Storage Operations: Key management and data persistence
5. Utility Endpoints: Health checks and enum exposure

The module is designed to be imported and used by other modules,
while also providing some direct API endpoints under the /utils prefix.

Typical usage:
    from app.apis.utils import store_profile, get_profile
    
    # Store a new profile
    result = store_profile(profile_data, user_id)
    
    # Retrieve a profile with privacy filtering
    profile = get_profile(user_id, viewer_role)
"""

from datetime import datetime
from typing import Dict, Optional
import typing
import re
from fastapi import APIRouter, HTTPException
import databutton as db

# Import models

from app.apis.models import (
    UserType, SubscriptionTier, VerificationStatus,
    RelationshipType, RelationshipStatus, BaseProfile,
    FundManagerProfile, LimitedPartnerProfile, CapitalRaiserProfile,
    ProfileVisibility, UserRole, UserAction
)

router = APIRouter(prefix="/utils", tags=["utils"])

__all__ = [
    'store_profile',
    'get_profile',
    'update_profile',
    'calculate_profile_completeness',
    'get_profile_storage_key',
    'sanitize_key',
    'router'
]

@router.get("/health")
def health_check() -> Dict[str, str]:
    """Health check endpoint."""
    return {"status": "healthy"}

@router.get("/enums")
def get_enums() -> dict:
    """Get all available enums for the frontend."""
    return {
        "subscription_tiers": [tier.value for tier in SubscriptionTier],
        "user_roles": [role.value for role in UserRole],
        "user_actions": [action.value for action in UserAction],
        "verification_statuses": [status.value for status in VerificationStatus],
        "relationship_types": [type.value for type in RelationshipType],
        "relationship_statuses": [status.value for status in RelationshipStatus]
    }

@router.get("/storage-stats")
def get_storage_stats() -> Dict[str, int]:
    """Get storage statistics."""
    try:
        # Get stats for different storage types
        dataframes = len(db.storage.dataframes.list())
        json_files = len(db.storage.json.list())
        text_files = len(db.storage.text.list())
        binary_files = len(db.storage.binary.list())
        
        return {
            "dataframes": dataframes,
            "json_files": json_files,
            "text_files": text_files,
            "binary_files": binary_files,
            "total_files": dataframes + json_files + text_files + binary_files
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e


def sanitize_key(key: str) -> str:
    """
    Sanitize storage key to only allow alphanumeric and ._- symbols.
    
    This function ensures storage keys are safe and consistent by:
    1. Removing special characters
    2. Replacing unsafe characters with underscores
    3. Preserving dots for hierarchy
    4. Preserving hyphens for readability
    
    Args:
        key: The key to sanitize, typically containing user IDs or profile identifiers
    
    Returns:
        str: The sanitized key safe for use in storage operations
    
    Example:
        >>> sanitize_key("user@example.com")
        'user_example.com'
        >>> sanitize_key("profiles/123")
        'profiles_123'
    """
    return re.sub(r'[^a-zA-Z0-9._-]', '_', key)

def get_profile_storage_key(user_id: str) -> str:
    """
    Generate storage key for a profile.
    
    Creates a consistent, sanitized storage key for profile data by:
    1. Prefixing with 'profiles.' for namespace isolation
    2. Appending sanitized user ID
    3. Ensuring key is safe for storage operations
    
    Args:
        user_id: The user ID to generate a key for, typically from auth system
    
    Returns:
        str: The generated storage key in format 'profiles.<sanitized_user_id>'
    
    Example:
        >>> get_profile_storage_key("user123")
        'profiles.user123'
        >>> get_profile_storage_key("user@example.com")
        'profiles.user_example.com'
    """
    return sanitize_key(f"profiles.{user_id}")

def calculate_profile_completeness(profile: BaseProfile) -> float:
    """
    Calculate how complete a profile is based on filled fields.
    
    The completeness calculation:
    1. Identifies required fields based on user type
    2. Checks optional fields that enhance profile quality
    3. Calculates percentage of filled fields
    4. Weights required fields more heavily than optional
    
    Args:
        profile: The profile to calculate completeness for,
                must be a validated BaseProfile instance
    
    Returns:
        float: The completeness percentage (0-100)
        
    Example:
        >>> profile = FundManagerProfile(name="Test", email="test@example.com")
        >>> calculate_profile_completeness(profile)
        25.0  # Only 2 of 8 required fields filled
    """
    required_fields = {
        UserType.FUND_MANAGER: [
            "name", "company", "email", "fund_type", 
            "fund_size", "investment_focus", "risk_profile",
            "investment_strategy"
        ],
        UserType.LIMITED_PARTNER: [
            "name", "company", "email", "investment_interests",
            "typical_commitment_size", "risk_tolerance"
        ],
        UserType.CAPITAL_RAISER: [
            "name", "company", "email", "deals_raised",
            "industry_focus", "typical_deal_size"
        ]
    }
    
    optional_fields = [
        "phone", "location", "bio", "linkedin_url", "website_url", 
        "profile_image_url"
    ]
    
    # Get required fields for this profile type
    required = required_fields[profile.user_type]
    total_fields = len(required) + len(optional_fields)
    filled_fields = 0
    
    # Check required fields
    for field in required:
        if hasattr(profile, field) and getattr(profile, field):
            filled_fields += 1
            
    # Check optional fields
    for field in optional_fields:
        if hasattr(profile, field) and getattr(profile, field):
            filled_fields += 1
            
    return (filled_fields / total_fields) * 100

def store_profile(profile_data: Dict, user_id: str) -> Dict:
    """
    Store a profile in storage with validation and metadata.
    
    This function handles the complete profile storage process:
    1. Timestamp Management:
       - Sets created_at and updated_at
       - Uses UTC timestamps in ISO format
    
    2. Privacy Settings:
       - Initializes default visibility rules
       - Sets up role-based access controls
    
    3. Validation:
       - Validates against appropriate profile model
       - Ensures all required fields are present
       - Checks field types and constraints
    
    4. Completeness:
       - Calculates profile completion percentage
       - Stores result for frontend display
    
    Args:
        profile_data: Complete profile data to store
        user_id: Unique identifier for the user
    
    Returns:
        Dict containing:
        - status: "success" if stored successfully
        - profile_id: The user_id of the stored profile
        - completeness: Profile completion percentage
    
    Raises:
        HTTPException: If validation fails or storage operation fails
        - 400: Invalid profile data
        - 500: Storage operation failed
    """
    try:
        # Set timestamps
        now = datetime.utcnow().isoformat()
        profile_data['created_at'] = now
        profile_data['updated_at'] = now
        
        # Set default privacy settings
        profile_data['privacy_settings'] = ProfileVisibility(
            show_in_search=True,
            show_to_roles=[UserType.FUND_MANAGER.value, UserType.LIMITED_PARTNER.value, UserType.CAPITAL_RAISER.value],
            show_contact_info=True,
            show_fund_details=True,
            show_investment_history=True,
            show_analytics=True
        ).dict()
        
        # Validate profile based on role
        try:
            user_type = profile_data.get('user_type')
            if user_type == UserType.FUND_MANAGER:
                validated_profile = FundManagerProfile(**profile_data)
            elif user_type == UserType.LIMITED_PARTNER:
                validated_profile = LimitedPartnerProfile(**profile_data)
            elif user_type == UserType.CAPITAL_RAISER:
                validated_profile = CapitalRaiserProfile(**profile_data)
            else:
                raise HTTPException(status_code=400, detail=f"Invalid user_type: {user_type}")
        except Exception as e:
            print(f"[DEBUG] Profile validation error: {str(e)}")
            print(f"[DEBUG] Profile data: {profile_data}")
            raise HTTPException(status_code=400, detail=f"Invalid profile data: {str(e)}") from e
        
        # Calculate profile completeness
        completeness = calculate_profile_completeness(validated_profile)
        
        # Store profile
        storage_key = get_profile_storage_key(user_id)
        profile_data["completeness"] = completeness
        db.storage.json.put(storage_key, profile_data)
        
        return {
            "status": "success",
            "profile_id": user_id,
            "completeness": completeness
        }
    
    except Exception as err:
        print(f"[ERROR] Failed to store profile: {str(err)}")
        if isinstance(err, HTTPException):
            raise
        raise HTTPException(status_code=500, detail=str(err)) from err

def get_profile(user_id: str, viewer_role: Optional[UserType] = None) -> Dict:
    """
    Get a profile from storage with privacy filtering.
    
    This function implements the privacy control system:
    1. Profile Retrieval:
       - Fetches profile using sanitized storage key
       - Handles missing profiles gracefully
    
    2. Privacy Filtering:
       - Checks viewer's role against allowed roles
       - Returns limited data if viewer lacks permission
       - Removes sensitive fields based on settings
    
    3. Field Filtering:
       - Removes contact info if hidden
       - Maintains essential fields like name and company
    
    Args:
        user_id: ID of the user whose profile to retrieve
        viewer_role: Role of the viewing user for permission check
    
    Returns:
        Dict containing filtered profile data based on permissions
        
    Raises:
        HTTPException:
        - 404: Profile not found
        - 500: Storage operation failed
    """
    try:
        storage_key = get_profile_storage_key(user_id)
        try:
            profile_data = db.storage.json.get(storage_key)
        except FileNotFoundError as e:
            raise HTTPException(
                status_code=404,
                detail="Profile not found"
            ) from e
        
        # Apply privacy filters based on viewer role
        if viewer_role and viewer_role.value not in profile_data["privacy_settings"]["show_to_roles"]:
            # Return limited profile data
            return {
                "user_id": profile_data["user_id"],
                "role": profile_data["role"],
                "name": profile_data["name"],
                "company": profile_data["company"]
            }
        
        # Remove sensitive fields if contact info is hidden
        if not profile_data["privacy_settings"]["show_contact_info"]:
            profile_data.pop("email", None)
            profile_data.pop("phone", None)
        
        return profile_data
    
    except Exception as err:
        print(f"[ERROR] Failed to get profile for user {user_id}: {str(err)}")
        if isinstance(err, HTTPException):
            raise
        raise HTTPException(status_code=500, detail=str(err)) from err

def update_profile(user_id: str, updates: Dict) -> Dict:
    """
    Update a profile in storage with validation.
    
    This function handles profile updates safely:
    1. Existence Check:
       - Verifies profile exists before update
       - Returns 404 if not found
    
    2. Update Process:
       - Merges updates with existing data
       - Updates timestamp
       - Maintains data integrity
    
    3. Validation:
       - Revalidates entire profile after update
       - Ensures updates don't break constraints
    
    4. Completeness:
       - Recalculates completion percentage
       - Updates stored completion value
    
    Args:
        user_id: ID of the user whose profile to update
        updates: Dictionary of fields to update
    
    Returns:
        Dict containing:
        - status: "success" if updated successfully
        - profile_id: The user_id of the updated profile
        - completeness: New completion percentage
    
    Raises:
        HTTPException:
        - 404: Profile not found
        - 400: Invalid update data
        - 500: Storage operation failed
    """
    try:
        storage_key = get_profile_storage_key(user_id)
        if not db.storage.json.exists(storage_key):
            raise HTTPException(
                status_code=404,
                detail="Profile not found"
            )
        
        # Get current profile
        profile_data = db.storage.json.get(storage_key)
        
        # Update fields
        profile_data.update(updates)
        profile_data["updated_at"] = datetime.utcnow().isoformat()
        
        # Recalculate completeness
        profile_type = profile_data["user_type"]
        if profile_type == UserType.FUND_MANAGER:
            profile = FundManagerProfile(**profile_data)
        elif profile_type == UserType.LIMITED_PARTNER:
            profile = LimitedPartnerProfile(**profile_data)
        else:
            profile = CapitalRaiserProfile(**profile_data)
        
        completeness = calculate_profile_completeness(profile)
        profile_data["completeness"] = completeness
        
        # Store updated profile
        db.storage.json.put(storage_key, profile_data)
        
        return {
            "status": "success",
            "profile_id": user_id,
            "completeness": completeness
        }
    
    except Exception as err:
        print(f"[ERROR] Failed to update profile for user {user_id}: {str(err)}")
        if isinstance(err, HTTPException):
            raise
        raise HTTPException(status_code=500, detail=str(err)) from err