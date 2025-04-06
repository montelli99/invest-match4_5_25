# Standard library imports for datetime handling and typing
from datetime import datetime
from typing import Dict, List, Optional

# Pydantic for data validation
from pydantic import BaseModel

# FastAPI components for API creation and error handling
from fastapi import APIRouter, HTTPException

# Databutton SDK for storage operations
import databutton as db

# Import data models and types from shared models module
# These define the structure and validation rules for different profile types
from app.apis.models import (
    VerificationLevel,
    VerificationState,
    BaseProfile,  # Base profile model with common fields
    UserType,    # Enum for different user types (Fund Manager, LP, etc)
    FundManagerProfile,    # Specific profile model for fund managers
    LimitedPartnerProfile, # Specific profile model for limited partners
    CapitalRaiserProfile,  # Specific profile model for capital raisers
    FoFProfile,           # Specific profile model for fund of funds
    ProfileVisibility,     # Model for profile privacy settings
    CreateProfileRequest,  # Input model for profile creation
    ProfileResponse,       # Output model for profile operations
    ProfileListResponse,   # Output model for listing profiles
    TokenRequest          # Model for authentication tokens
)
# Import utility functions for profile operations
from app.apis.utils import (
    store_profile,                  # Handles profile storage in db.storage
    get_profile,                    # Retrieves profiles with privacy checks
    update_profile,                 # Updates existing profiles
    calculate_profile_completeness, # Calculates % of profile completion
    get_profile_storage_key         # Generates storage keys for profiles
)

# Create router for profile management endpoints
# All routes will be prefixed with /profile and tagged as 'profiles'
router = APIRouter(prefix="/profile", tags=["profiles"])

@router.post("/management/create-profile")
def create_profile_v2(request: CreateProfileRequest) -> ProfileResponse:
    """
    Create a new user profile with role-specific validation
    
    This endpoint handles:
    1. Profile data validation based on user role
    2. Duplicate profile prevention
    3. Default privacy settings
    4. Timestamp management
    5. Storage of validated profiles
    """
    try:
        # Step 1: Extract and validate basic profile data structure
        # The profile must be a dictionary containing all required fields
        profile_data = request.profile
        if not isinstance(profile_data, dict):
            raise HTTPException(status_code=400, detail="Invalid profile data format")
            
        # Step 2: Validate user_id presence
        # user_id is mandatory for profile creation and storage
        user_id = profile_data.get('user_id')
        if not user_id:
            raise HTTPException(status_code=400, detail="user_id is required")
            
        # Step 3: Check for existing profile to prevent duplicates
        # Generate storage key and attempt to retrieve existing profile
        storage_key = get_profile_storage_key(user_id)
        try:
            db.storage.json.get(storage_key)
            # If profile exists, prevent creation and return error
            raise HTTPException(
                status_code=400,
                detail="Profile already exists for this user"
            )
        except FileNotFoundError:
            # Profile doesn't exist, safe to proceed with creation
            pass
            
        # Step 4: Role-specific validation
        # Validate profile data against the appropriate model based on user type
        try:
            user_type = profile_data.get('user_type')
            # Use Pydantic models to validate data based on role
            if user_type == UserType.FUND_MANAGER:
                FundManagerProfile(**profile_data)  # Validates fund manager specific fields
            elif user_type == UserType.LIMITED_PARTNER:
                LimitedPartnerProfile(**profile_data)  # Validates LP specific fields
            elif user_type == UserType.CAPITAL_RAISER:
                CapitalRaiserProfile(**profile_data)  # Validates capital raiser specific fields
            elif user_type == UserType.FUND_OF_FUNDS:
                FoFProfile(**profile_data)  # Validates fund of funds specific fields
            else:
                raise HTTPException(status_code=400, detail=f"Invalid user_type: {user_type}")
        except Exception as e:
            print(f"[DEBUG] Profile validation error: {str(e)}")
            print(f"[DEBUG] Profile data: {profile_data}")
            print(f"[DEBUG] Profile type: {type(profile_data)}")
            print(f"[DEBUG] User type: {user_type}")
            print(f"[DEBUG] Validation trace:", e.__traceback__)
            raise HTTPException(status_code=400, detail=f"Invalid profile data: {str(e)}") from e
        
        # Step 5: Add metadata and verification state
        # Set creation and update timestamps in ISO format
        now = datetime.utcnow().isoformat()
        profile_data['created_at'] = now  # Track when profile was created
        profile_data['updated_at'] = now  # Initially same as created_at
        
        # Initialize verification state
        profile_data['verification_state'] = VerificationState(
            level=VerificationLevel.BASIC if profile_data.get('email') and profile_data.get('phone') else None,
            last_verified=now if profile_data.get('email') and profile_data.get('phone') else None
        ).dict()
        
        # Step 6: Configure default privacy settings
        # Initialize with open visibility to all roles
        profile_data['privacy_settings'] = ProfileVisibility(
            show_in_search=True,          # Profile appears in search results
            show_to_roles=[               # Visible to all platform roles
                UserType.FUND_MANAGER.value,
                UserType.LIMITED_PARTNER.value,
                UserType.CAPITAL_RAISER.value,
                UserType.FUND_OF_FUNDS.value
            ],
            show_contact_info=True,       # Contact details visible
            show_fund_details=True,       # Fund information visible
            show_investment_history=True, # Investment history visible
            show_analytics=True          # Analytics visible
        ).dict()
        
        # Store profile and get result
        result = store_profile(profile_data, user_id)
        return result
        
    except Exception as err:
        print(f"[ERROR] Failed to create profile: {str(err)}")
        if isinstance(err, HTTPException):
            raise
        raise HTTPException(status_code=500, detail=str(err)) from err

@router.get("/management/get-profile/{user_id}")
def get_profile_v2(
    user_id: str,
    viewer_role: Optional[UserType] = None
) -> Dict:
    """
    Get a user's profile with privacy controls
    
    Args:
        user_id: The ID of the user whose profile to retrieve
        viewer_role: Optional role of the user viewing the profile,
                    used for privacy filtering
    
    Returns:
        Dict containing the filtered profile data based on privacy settings
        
    Raises:
        HTTPException: If profile not found or access denied
    """
    try:
        # Retrieve and filter profile based on viewer's role and privacy settings
        return get_profile(user_id, viewer_role)
        
    except Exception as err:
        # Log error details for debugging
        print(f"[ERROR] Failed to get profile for user {user_id}: {str(err)}")
        # Re-raise HTTP exceptions as-is
        if isinstance(err, HTTPException):
            raise
        # Wrap other errors as 500 Internal Server Error
        raise HTTPException(status_code=500, detail=str(err)) from err

@router.put("/management/update-profile/{user_id}")
def update_profile_management(
    user_id: str,
    updates: Dict
) -> ProfileResponse:
    """
    Update a user's profile
    
    This endpoint handles:
    1. Partial updates to profile data
    2. Validation of updated fields
    3. Timestamp management
    4. Storage of updated profile
    5. Automatic verification status update based on profile completeness
    
    Args:
        user_id: The ID of the user whose profile to update
        updates: Dictionary containing the fields to update
        
    Returns:
        ProfileResponse with status and profile ID
        
    Raises:
        HTTPException: If profile not found or validation fails
    """
    try:
        # Update profile with validation and timestamp management
        result = update_profile(user_id, updates)
        
        # Update verification status based on profile completeness
        try:
            # Get verification settings
            verification_settings = db.storage.json.get("verification_settings", default={
                "require_documents": True,
                "profile_completion_threshold": 90.0,
                "auto_verify_trusted_users": False,
                "verification_message": "Complete your profile and upload required documents to get verified"
            })
            
            # Get user profile data
            storage_key = get_profile_storage_key(user_id)
            profile_data = db.storage.json.get(storage_key)
            
            # Get profile information
            completeness = result.get("completeness", 0)
            is_trusted_org = profile_data.get("is_trusted_organization", False)
            
            # Get verification settings values
            threshold = verification_settings.get("profile_completion_threshold", 90.0)
            require_documents = verification_settings.get("require_documents", True)
            auto_verify_trusted = verification_settings.get("auto_verify_trusted_users", False)
            
            # Log key verification parameters for debugging
            print(f"[DEBUG] Profile update - user_id: {user_id}, completeness: {completeness}, threshold: {threshold}")
            print(f"[DEBUG] Settings - require_documents: {require_documents}, auto_verify_trusted: {auto_verify_trusted}")
            
            # Set default verification status
            verification_status = "incomplete"
            verification_message = ""
            
            # Step 1: Fast track for trusted organizations if enabled
            if auto_verify_trusted and is_trusted_org:
                verification_status = "verified"
                verification_message = "Verified organization"
                print(f"[INFO] Trusted organization auto-verified for user {user_id}")
            
            # Step 2: Check profile completeness against threshold
            elif completeness >= threshold:
                # Profile meets completeness threshold
                if require_documents:
                    # Documents required - check verification status from verification API
                    try:
                        # Use the verification API to check document status
                        from app.apis.verification import get_verification_status
                        verification_data = get_verification_status(user_id)
                        
                        # Get overall verification status from the API
                        verification_status = verification_data.get("verification_status", "pending")
                        verification_message = verification_data.get("verification_message", "")
                        
                        print(f"[INFO] Document verification status for user {user_id}: {verification_status}")
                    except Exception as e:
                        print(f"[WARNING] Error checking verification API: {str(e)}")
                        verification_status = "pending"
                        verification_message = "Document verification pending"
                else:
                    # Documents not required - verify based on profile completeness only
                    verification_status = "verified"
                    verification_message = "Verified based on profile completeness"
                    print(f"[INFO] Profile-based verification for user {user_id} (no documents required)")
            
            # Step 3: Profile doesn't meet completeness threshold
            else:
                verification_status = "incomplete"
                points_needed = threshold - completeness
                verification_message = f"Complete your profile ({points_needed:.1f}% more needed)"
                print(f"[INFO] Incomplete profile for user {user_id}: {completeness}% vs {threshold}% threshold")
            
            # Update user's verification status in profile
            profile_data["verification_status"] = verification_status
            profile_data["verification_message"] = verification_message
            profile_data["verification_updated_at"] = datetime.utcnow().isoformat()
            db.storage.json.put(storage_key, profile_data)
            
            # Update result to include verification status
            result["verification_status"] = verification_status
            result["verification_message"] = verification_message
            
            print(f"[INFO] Updated verification status for user {user_id} to {verification_status}")
        except Exception as e:
            print(f"[WARNING] Failed to update verification status for user {user_id}: {str(e)}")
            import traceback
            print(f"[WARNING] Traceback: {traceback.format_exc()}")
            # Don't fail the whole request if verification update fails
            # Just log the error and continue
        
        return result
        
    except Exception as err:
        # Log error details for debugging
        print(f"[ERROR] Failed to update profile for user {user_id}: {str(err)}")
        # Re-raise HTTP exceptions as-is
        if isinstance(err, HTTPException):
            raise
        # Wrap other errors as 500 Internal Server Error
        raise HTTPException(status_code=500, detail=str(err)) from err

@router.put("/management/update-visibility/{user_id}")
def update_visibility_management(
    user_id: str,
    visibility: ProfileVisibility
) -> ProfileResponse:
    """
    Update profile visibility settings
    
    This endpoint handles:
    1. Validation of visibility settings
    2. Profile existence check
    3. Update of privacy controls
    4. Timestamp management
    
    Args:
        user_id: The ID of the user whose visibility settings to update
        visibility: New visibility settings to apply
        
    Returns:
        ProfileResponse with status and profile ID
        
    Raises:
        HTTPException: If profile not found or validation fails
    """
    try:
        # Step 1: Check if profile exists
        storage_key = get_profile_storage_key(user_id)
        if not db.storage.json.exists(storage_key):
            raise HTTPException(
                status_code=404,
                detail="Profile not found"
            )
            
        # Step 2: Retrieve current profile data
        profile_data = db.storage.json.get(storage_key)
        
        # Step 3: Update visibility settings and timestamp
        profile_data["privacy_settings"] = visibility.dict()  # Update privacy controls
        profile_data["updated_at"] = datetime.utcnow().isoformat()  # Update timestamp
        
        # Step 4: Store updated profile
        db.storage.json.put(storage_key, profile_data)
        
        # Step 5: Return success response
        return {
            "status": "success",
            "profile_id": user_id
        }
        
    except Exception as err:
        print(f"[ERROR] Failed to update visibility for user {user_id}: {str(err)}")
        if isinstance(err, HTTPException):
            raise
        raise HTTPException(status_code=500, detail=str(err)) from err

@router.get("/management/list-profiles")
def list_profiles_v2(
    user_type: Optional[UserType] = None,
    verified_only: bool = False,
    page: int = 1,
    page_size: int = 10
) -> ProfileListResponse:
    """
    List all profiles with optional filtering and pagination
    
    This endpoint handles:
    1. Optional filtering by user type
    2. Optional filtering for verified profiles only
    3. Pagination of results
    4. Privacy-aware profile listing
    
    Args:
        user_type: Optional filter for specific user types
        verified_only: If True, only return verified profiles
        page: Page number for pagination (1-based)
        page_size: Number of profiles per page
        
    Returns:
        ProfileListResponse containing paginated profiles and metadata
        
    Raises:
        HTTPException: If listing operation fails
    """
    try:
        # Step 1: Get all profile keys from storage
        all_profiles = []  # Will hold filtered profiles
        profile_keys = db.storage.json.list("profiles.")  # List all profile storage keys
        
        # Step 2: Apply filters and collect profiles
        for key in profile_keys:
            profile = db.storage.json.get(key)
            
            # Filter by user type if specified
            if user_type and profile["user_type"] != user_type:
                continue
                
            # Filter by verification status if required
            if verified_only and not profile["is_verified"]:
                continue
                
            # Step 3: Include only public profiles and fields
            if profile["privacy_settings"]["show_in_search"]:
                # Add only essential public information
                all_profiles.append({
                    "user_id": profile["user_id"],        # Unique identifier
                    "role": profile["role"],             # User's role
                    "name": profile["name"],             # Public name
                    "company": profile["company"],        # Company affiliation
                    "completeness": profile.get("completeness", 0)  # Profile completion %
                })
        
        # Step 4: Apply pagination
        total = len(all_profiles)                    # Total number of matching profiles
        start_idx = (page - 1) * page_size           # Calculate start index
        end_idx = start_idx + page_size              # Calculate end index
        paginated_profiles = all_profiles[start_idx:end_idx]  # Get page of profiles
        has_more = end_idx < total                   # Check if more pages exist
                
        # Step 5: Return paginated response
        return ProfileListResponse(
            profiles=paginated_profiles,  # Current page of profiles
            total=total,                  # Total number of profiles
            page=page,                    # Current page number
            page_size=page_size,          # Profiles per page
            has_more=has_more             # Whether more pages exist
        )
        
    except Exception as err:
        print(f"[ERROR] Failed to list profiles with filters - user_type: {user_type}, verified_only: {verified_only}: {str(err)}")
        raise HTTPException(status_code=500, detail=str(err)) from err