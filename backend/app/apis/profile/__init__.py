from datetime import datetime
import mimetypes
import re
import time
import uuid
from typing import Dict, List, Optional

from fastapi import APIRouter, HTTPException, UploadFile
from pydantic import BaseModel, Field, EmailStr
import databutton as db

from app.apis.models import (
    ListProfilesRequest,
    ProfileListResponse,
    CreateProfileRequest,
    UpdateProfileRequest,
    ProfileResponse,
    FundManagerProfile,
    LimitedPartnerProfile,
    CapitalRaiserProfile,
    ProfileVisibility,
    UserType,
    SubscriptionTier,
    VerificationDocument,
    ProfileImage,
    SocialLinks,
    BaseProfile,
    FundType,
    InvestmentFocus,
    TokenRequest
)

def get_visibility_settings(user_id: str) -> ProfileVisibility:
    """Get visibility settings for a user"""
    try:
        profiles = db.storage.json.get('user_profiles', default={})
        profile = profiles.get(user_id)
        if not profile:
            return ProfileVisibility()
        return ProfileVisibility(**profile.get('privacy_settings', {}))
    except Exception as e:
        print(f"[ERROR] Failed to get visibility settings: {str(e)}")
        return ProfileVisibility()

def apply_visibility_settings(profile: dict, viewer_role: str, settings: ProfileVisibility) -> Optional[dict]:
    """Apply visibility settings to a profile based on viewer role"""
    try:
        if not settings.show_in_search:
            return None
            
        if viewer_role not in settings.show_to_roles:
            return {
                'user_id': profile.get('user_id'),
                'name': profile.get('name'),
                'company': profile.get('company'),
                'role': profile.get('role')
            }
            
        filtered_profile = profile.copy()
        
        if not settings.show_contact_info:
            filtered_profile.pop('email', None)
            filtered_profile.pop('phone', None)
            
        if not settings.show_fund_details:
            for key in ['fund_size', 'historical_returns', 'minimum_investment']:
                filtered_profile.pop(key, None)
                
        if not settings.show_investment_history:
            filtered_profile.pop('current_investments', None)
            filtered_profile.pop('recent_deals', None)
            
        return filtered_profile
        
    except Exception as e:
        print(f"[ERROR] Failed to apply visibility settings: {str(e)}")
        return None

router = APIRouter()



@router.post("/profile/create-profile")
def create_profile(body: CreateProfileRequest):
    request_id = str(uuid.uuid4())
    start_time = time.time()
    print(f"[INFO] [{request_id}] Starting profile creation")
    print(f"[DEBUG] [{request_id}] Request body: {body}")
    try:
        print(f"[INFO] [{request_id}] Creating profile with data:", body.profile)
        print(f"[DEBUG] [{request_id}] Token provided:", bool(body.token))
        profile_data = body.profile.dict() if hasattr(body.profile, 'dict') else body.profile
        user_id = profile_data.get('user_id')
        
        if not user_id:
            print(f"[ERROR] [{request_id}] Missing required field: user_id")
            raise HTTPException(
                status_code=400,
                detail={
                    "message": "User ID is required",
                    "field": "user_id",
                    "request_id": request_id
                }
            )
        
        # Validate profile data based on role
        role = profile_data.get('role')
        print(f"[DEBUG] [{request_id}] Validating profile for role: {role}")
        
        if not role:
            print(f"[ERROR] [{request_id}] Missing required field: role")
            raise HTTPException(
                status_code=400,
                detail={
                    "message": "Role is required",
                    "field": "role",
                    "request_id": request_id
                }
            )
        
        try:
            # Convert numeric strings to appropriate types
            numeric_fields = {
                'fund_size': float,
                'minimum_investment': float,
                'historical_returns': float,
                'typical_commitment_size': float,
                'typical_deal_size': float,
                'investment_horizon': int,
                'deals_raised': int,
                'total_capital_raised': float
            }
            
            for field, converter in numeric_fields.items():
                if field in profile_data and profile_data[field] is not None:
                    try:
                        profile_data[field] = converter(profile_data[field])
                    except (ValueError, TypeError) as e:
                        print(f"[ERROR] [{request_id}] Failed to convert {field}: {str(e)}")
                        raise HTTPException(
                            status_code=400,
                            detail={
                                "message": f"Invalid value for {field}",
                                "field": field,
                                "value": profile_data[field],
                                "expected_type": converter.__name__,
                                "request_id": request_id
                            }
                        ) from e
            
            if role == UserType.FUND_MANAGER.value:
                profile = FundManagerProfile(**profile_data)
            elif role == UserType.LIMITED_PARTNER.value:
                profile = LimitedPartnerProfile(**profile_data)
            elif role == UserType.CAPITAL_RAISER.value:
                profile = CapitalRaiserProfile(**profile_data)
            else:
                print(f"[ERROR] [{request_id}] Invalid role specified: {role}")
                raise HTTPException(
                    status_code=400,
                    detail={
                        "message": "Invalid role",
                        "field": "role",
                        "value": role,
                        "allowed_values": [e.value for e in UserType],
                        "request_id": request_id
                    }
                )
            print("[DEBUG] Profile validation successful for", profile.name)
        except ValueError as ve:
            print(f"[ERROR] [{request_id}] Profile validation failed: {str(ve)}")
            print(f"[ERROR] [{request_id}] Profile data causing error: {profile_data}")
            # Make error message more user-friendly
            error_msg = str(ve)
            field = None
            if 'field required' in error_msg.lower():
                field = error_msg.split("field required")[0].strip()
                error_msg = f"The {field} field is required"
            elif 'not a valid float' in error_msg.lower():
                field = error_msg.split("'")[1]
                error_msg = f"The {field} must be a valid number"
            elif 'not a valid integer' in error_msg.lower():
                field = error_msg.split("'")[1]
                error_msg = f"The {field} must be a whole number"
            
            raise HTTPException(
                status_code=400,
                detail={
                    "message": error_msg,
                    "field": field,
                    "request_id": request_id,
                    "troubleshooting": "Please check the value format and try again"
                }
            ) from ve
        except Exception as validation_error:
            print(f"[ERROR] [{request_id}] Profile validation failed: {str(validation_error)}")
            print(f"[ERROR] [{request_id}] Profile data causing error: {profile_data}")
            raise HTTPException(
                status_code=400,
                detail={
                    "message": "Profile validation failed",
                    "error": str(validation_error),
                    "request_id": request_id,
                    "troubleshooting": "Please check all required fields and data formats"
                }
            ) from validation_error

        # Store profile in JSON storage
        print(f"[DEBUG] [{request_id}] Storing profile for user {user_id}")
        try:
            profiles = db.storage.json.get('user_profiles', default={})
            profile_dict = profile.dict()
            profiles[user_id] = profile_dict
            db.storage.json.put('user_profiles', profiles)
            print(f"[INFO] [{request_id}] Profile stored successfully")
        except Exception as storage_error:
            print(f"[ERROR] [{request_id}] Failed to store profile: {str(storage_error)}")
            raise HTTPException(
                status_code=500,
                detail={
                    "message": "Failed to store profile",
                    "error": str(storage_error),
                    "request_id": request_id
                }
            ) from storage_error

        # Create searchable index
        print(f"[DEBUG] [{request_id}] Creating search index entry for user {user_id}")
        try:
            search_index = db.storage.json.get('profile_search_index', default=[])
            search_index.append({
                'user_id': user_id,
                'name': profile_dict['name'],
                'company': profile_dict['company'],
                'role': profile_dict['role'],
                'profile': profile_dict
            })
            db.storage.json.put('profile_search_index', search_index)
            print(f"[INFO] [{request_id}] Search index updated successfully")
        except Exception as index_error:
            print(f"[ERROR] [{request_id}] Failed to update search index: {str(index_error)}")
            # Don't raise exception here as profile is already stored

        # Calculate and log performance
        duration = time.time() - start_time
        print(f"[INFO] [{request_id}] Profile creation completed in {duration:.2f}s")
        
        return {
            "status": "success", 
            "profile": profile.dict(),
            "request_id": request_id
        }
    
    except Exception as e:
        print(f"[ERROR] Critical error creating profile: {str(e)}")
        import traceback
        print(f"[ERROR] Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Failed to create profile: {str(e)}") from e

@router.post("/profile/upload-image")
async def upload_profile_image(file: UploadFile):
    """Upload a profile image with validation
    
    - Validates file type (must be image)
    - Validates file size (max 5MB)
    - Stores image securely
    - Returns public URL for the image
    """
    try:
        print("[INFO] Processing profile image upload:", file.filename)
        
        # Validate file size (5MB)
        content = await file.read()
        if len(content) > 5 * 1024 * 1024:  # 5MB in bytes
            raise HTTPException(status_code=400, detail="File size must be less than 5MB")
            
        # Reset file pointer for content type check
        await file.seek(0)
        
        # Validate file type
        content_type = file.content_type
        print(f"[DEBUG] File content type: {content_type}")
        
        if not content_type.startswith('image/'):
            print(f"[ERROR] Invalid file type: {content_type}")
            raise HTTPException(status_code=400, detail="File must be an image") from None

        # Read file content
        content = await file.read()

        # Generate unique filename
        ext = mimetypes.guess_extension(content_type) or '.jpg'
        filename = f"profile_images/{str(uuid.uuid4())}{ext}"

        # Store file
        db.storage.binary.put(filename, content)

        # Generate public URL
        file_url = f"https://storage.databutton.com/v1/storage/files/{filename}"

        return {
            "url": file_url,
            "content_type": content_type
        }

    except Exception as e:
        print(f"[ERROR] Critical error uploading profile image: {str(e)}")
        import traceback
        print(f"[ERROR] Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Failed to upload profile image: {str(e)}") from e

@router.get("/profile/get/{user_id}")
def get_profile_v1(user_id: str, viewer_role: str = None):
    try:
        if not user_id:
            raise HTTPException(status_code=400, detail="User ID is required")

        print(f"[INFO] Fetching profile for user: {user_id}")
        
        # Get profiles from storage, default to empty dict if storage doesn't exist
        profiles = db.storage.json.get('user_profiles', default={})
        print(f"[DEBUG] Retrieved {len(profiles)} profiles from storage")
        
        profile = profiles.get(user_id)
        if not profile:
            print(f"[WARNING] Profile not found for user: {user_id}")
            raise HTTPException(status_code=404, detail="Profile not found") from None
        
        print(f"[DEBUG] Successfully retrieved profile for {user_id}")
        
        # Apply visibility settings if viewer role is provided
        if viewer_role:
            visibility_settings = get_visibility_settings(user_id)
            profile = apply_visibility_settings(profile, viewer_role, visibility_settings)
            if not profile:
                raise HTTPException(status_code=403, detail="Profile not visible to this role")
        
        return profile
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Critical error fetching profile: {str(e)}")
        import traceback
        print(f"[ERROR] Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch profile: {str(e)}") from e

@router.post("/profile/list")
def list_profiles_v1(body: ListProfilesRequest):
    try:
        print(f"[INFO] Listing profiles with params: {body}")
        
        # Get all profiles
        profiles = db.storage.json.get('user_profiles', default={})
        filtered_profiles = []
        
        # Convert profiles dict to list and apply filters
        for user_id, profile in profiles.items():
            # Apply role filter if specified
            if body.role and profile.get('role') != body.role:
                continue
                
            # Apply search filter if specified
            if body.search_query:
                query = body.search_query.lower()
                name = profile.get('name', '').lower()
                company = profile.get('company', '').lower()
                if query not in name and query not in company:
                    continue
            
            # Apply visibility settings if viewer role is specified
            if body.viewer_role:
                visibility_settings = get_visibility_settings(user_id)
                visible_profile = apply_visibility_settings(profile, body.viewer_role, visibility_settings)
                if visible_profile:
                    filtered_profiles.append({**visible_profile, 'user_id': user_id})
            else:
                filtered_profiles.append({**profile, 'user_id': user_id})
        
        # Calculate pagination
        total = len(filtered_profiles)
        start_idx = (body.page - 1) * body.page_size
        end_idx = start_idx + body.page_size
        paginated_profiles = filtered_profiles[start_idx:end_idx]
        
        print(f"[DEBUG] Found {total} profiles, returning {len(paginated_profiles)} for page {body.page}")
        
        return ProfileListResponse(
            profiles=paginated_profiles,
            total=total,
            page=body.page,
            page_size=body.page_size
        )
        
    except Exception as e:
        print(f"[ERROR] Critical error listing profiles: {str(e)}")
        import traceback
        print(f"[ERROR] Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Failed to list profiles: {str(e)}") from e