from typing import List, Optional, Dict
from datetime import datetime
from pydantic import BaseModel
from fastapi import APIRouter, HTTPException
import traceback
import databutton as db
from app.apis.models import ExtendedUserProfile, SearchResult, SearchPreset, SearchHistoryEntry, PaginatedSearchResponse, SearchFilters

router = APIRouter(tags=["search"])

# Cache for user profiles and match percentages to reduce storage reads and calculations
_profile_cache = {}
_match_cache = {}
_last_cache_update = None
_cache_ttl = 300  # 5 minutes in seconds

def _get_cached_profiles():
    """Get profiles from cache or storage with TTL"""
    global _last_cache_update, _profile_cache
    
    current_time = datetime.now()
    
    # If cache is empty or expired, refresh it
    if (_last_cache_update is None or 
        (current_time - _last_cache_update).total_seconds() > _cache_ttl):
        print("[DEBUG] Refreshing profile cache")
        _profile_cache = db.storage.json.get("user_profiles", default={})
        _last_cache_update = current_time
    
    return _profile_cache

# Using models from central models.py



def _are_roles_compatible(role1: str, role2: str) -> bool:
    """Check if two roles can be matched"""
    # Capital raisers can match with all investor types
    if role1 == 'capital_raiser' or role2 == 'capital_raiser':
        return True
        
    # Fund of Funds can match with fund managers
    if (role1 == 'fund_of_funds' and role2 == 'fund_manager') or \
       (role1 == 'fund_manager' and role2 == 'fund_of_funds'):
        return True
        
    # Fund managers and LPs can match with each other
    if (role1 in ['fund_manager', 'limited_partner'] and 
        role2 in ['fund_manager', 'limited_partner']):
        return True
        
    return False

def _get_cache_key(profile_id: str, filters: SearchFilters) -> str:
    """Generate a cache key for match percentage caching"""
    # Convert filters to a stable string representation
    filter_str = str(sorted(filters.dict(exclude_unset=True).items()))
    return f"{profile_id}:{hash(filter_str)}"

def calculate_match_percentage(user_profile: Dict[str, any], search_filters: SearchFilters) -> float:
    """Calculate match percentage between a user profile and search filters with enhanced weighting"""
    weights = {
        'role_match': 30,
        'fund_type': 20,
        'fund_size': 15,
        'investment_focus': 20,
        'historical_returns': 10,
        'risk_profile': 5,
        'investment_horizon': 10,
        'investment_size': 15,
        'deal_size': 10,
        'industry_focus': 25,
        'experience': 15,
        'sectors': 20,
        'track_record': 10
    }
    # Check role compatibility first
    if search_filters.user_type and user_profile.get('role'):
        if not _are_roles_compatible(search_filters.user_type, user_profile.get('role')):
            return 0  # Incompatible roles, no need to calculate further
    
    total_weight = 0
    matched_weight = 0
    
    # User type match (highest weight)
    if search_filters.user_type:
        total_weight += 30
        if user_profile.get('role') == search_filters.user_type:
            matched_weight += 30
    
    # Fund type match
    if search_filters.fund_type:
        total_weight += 20
        if user_profile.get('fund_type') == search_filters.fund_type:
            matched_weight += 20
    
    # Fund size range match
    if search_filters.min_fund_size is not None or search_filters.max_fund_size is not None:
        total_weight += 15
        fund_size = user_profile.get('fund_size')
        if fund_size is not None:
            if ((search_filters.min_fund_size is None or fund_size >= search_filters.min_fund_size) and
                (search_filters.max_fund_size is None or fund_size <= search_filters.max_fund_size)):
                matched_weight += 15
    
    # Investment focus match
    if search_filters.investment_focus:
        total_weight += 20
        user_focus = set(user_profile.get('investment_focus', []))
        search_focus = set(search_filters.investment_focus)
        if user_focus & search_focus:  # If there's any overlap
            overlap_ratio = len(user_focus & search_focus) / len(search_focus)
            matched_weight += 20 * overlap_ratio
    
    # Historical returns match
    if search_filters.min_historical_returns is not None:
        total_weight += 10
        user_returns = user_profile.get('historical_returns')
        if user_returns is not None and user_returns >= search_filters.min_historical_returns:
            matched_weight += 10
    
    # Risk profile match
    if search_filters.risk_profile:
        total_weight += 5
        if user_profile.get('risk_profile') == search_filters.risk_profile:
            matched_weight += 5
            
    # Investment horizon compatibility
    if search_filters.min_investment_horizon is not None or search_filters.max_investment_horizon is not None:
        total_weight += 10
        user_horizon = user_profile.get('investment_horizon')
        if user_horizon is not None:
            if ((search_filters.min_investment_horizon is None or 
                 user_horizon >= search_filters.min_investment_horizon) and
                (search_filters.max_investment_horizon is None or 
                 user_horizon <= search_filters.max_investment_horizon)):
                matched_weight += 10
    
    # Investment size compatibility
    if search_filters.min_investment_size is not None or search_filters.max_investment_size is not None:
        total_weight += 15
        user_min = user_profile.get('minimum_investment')
        user_max = user_profile.get('typical_investment_size') or user_profile.get('fund_size')
        
        if user_min is not None and user_max is not None:
            if ((search_filters.min_investment_size is None or 
                 user_max >= search_filters.min_investment_size) and
                (search_filters.max_investment_size is None or 
                 user_min <= search_filters.max_investment_size)):
                matched_weight += 15
    
    # Capital raiser specific matching
    if user_profile.get('role') == 'capital_raiser' or search_filters.user_type == 'capital_raiser':
        if search_filters.deal_size_range:
            total_weight += 10
            user_deal_size = user_profile.get('typical_deal_size')
            min_deal, max_deal = search_filters.deal_size_range
            
            if user_deal_size and min_deal <= user_deal_size <= max_deal:
                matched_weight += 10
        
        # Industry focus match for capital raisers (higher weight)
        if search_filters.investment_focus:
            total_weight += 25
            user_focus = set(user_profile.get('industry_focus', []))
            search_focus = set(search_filters.investment_focus)
            if user_focus & search_focus:
                overlap_ratio = len(user_focus & search_focus) / len(search_focus)
                matched_weight += 25 * overlap_ratio
    
    # Experience matching
    if search_filters.min_years_experience is not None:
        total_weight += weights['experience']
        user_experience = user_profile.get('years_experience')
        if user_experience is not None and user_experience >= search_filters.min_years_experience:
            matched_weight += weights['experience']
    
    # Sector matching
    if search_filters.sectors:
        total_weight += weights['sectors']
        user_sectors = set(user_profile.get('sectors', []))
        search_sectors = set(search_filters.sectors)
        if user_sectors & search_sectors:  # If there's any overlap
            overlap_ratio = len(user_sectors & search_sectors) / len(search_sectors)
            matched_weight += weights['sectors'] * overlap_ratio
    
    # Track record requirement
    if search_filters.track_record_required:
        total_weight += weights['track_record']
        user_track_record = user_profile.get('track_record', [])
        if user_track_record:  # If user has any track record
            matched_weight += weights['track_record']
    
    # Calculate final percentage
    return (matched_weight / total_weight * 100) if total_weight > 0 else 0

@router.post("/presets", response_model=SearchPreset)
def create_search_preset(preset: SearchPreset) -> SearchPreset:
    """Create a new search preset"""
    try:
        presets = db.storage.json.get("search_presets", default={})
        presets[preset.id] = preset.dict()
        db.storage.json.put("search_presets", presets)
        return preset
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating preset: {str(e)}") from e

@router.get("/presets/{user_id}", response_model=List[SearchPreset])
def get_user_presets(user_id: str) -> List[SearchPreset]:
    """Get all search presets for a user"""
    try:
        presets = db.storage.json.get("search_presets", default={})
        user_presets = [SearchPreset(**preset) for preset in presets.values() 
                       if preset["user_id"] == user_id]
        return sorted(user_presets, key=lambda x: x.last_used or x.created_at, reverse=True)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving presets: {str(e)}") from e

@router.delete("/presets/{preset_id}")
def delete_search_preset(preset_id: str):
    """Delete a search preset"""
    try:
        presets = db.storage.json.get("search_presets", default={})
        if preset_id not in presets:
            raise HTTPException(status_code=404, detail="Preset not found")
        del presets[preset_id]
        db.storage.json.put("search_presets", presets)
        return {"status": "success", "message": "Preset deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting preset: {str(e)}") from e

@router.get("/history/{user_id}", response_model=List[SearchHistoryEntry])
def get_search_history(user_id: str, limit: Optional[int] = 10) -> List[SearchHistoryEntry]:
    """Get search history for a user"""
    try:
        history = db.storage.json.get("search_history", default={})
        user_history = [SearchHistoryEntry(**entry) for entry in history.values() 
                       if entry["user_id"] == user_id]
        return sorted(user_history, key=lambda x: x.timestamp, reverse=True)[:limit]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving search history: {str(e)}") from e

@router.post("/users/search", response_model=PaginatedSearchResponse)
async def search_users(filters: SearchFilters, user_id: Optional[str] = None) -> PaginatedSearchResponse:
    """Search for users based on filters and optionally save to history
    
    Returns a paginated response with matched profiles. If no profiles are found,
    returns an empty response with total=0.
    """
    try:
        # Perform the search
        results = await _perform_search(filters)
        
        # If user_id is provided, save to search history
        if user_id:
            try:
                history_entry = SearchHistoryEntry(
                    id=str(int(datetime.now().timestamp())),
                    user_id=user_id,
                    filters=filters,
                    results_count=len(results),
                    timestamp=datetime.now().isoformat()
                )
                
                history = db.storage.json.get("search_history", default={})
                history[history_entry.id] = history_entry.dict()
                db.storage.json.put("search_history", history)
                
                print(f"[DEBUG] Saved search history for user {user_id}")
            except Exception as history_error:
                print(f"[ERROR] Failed to save search history: {str(history_error)}")
        
        # Calculate pagination
        total_results = len(results)
        total_pages = (total_results + filters.page_size - 1) // filters.page_size
        start_idx = (filters.page - 1) * filters.page_size
        end_idx = start_idx + filters.page_size
        
        # Return paginated response
        return PaginatedSearchResponse(
            items=results[start_idx:end_idx],
            total=total_results,
            page=filters.page,
            page_size=filters.page_size,
            total_pages=total_pages
        )
    except Exception as e:
        print(f"[ERROR] Critical error in search: {str(e)}")
        print(f"[ERROR] Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Error searching users: {str(e)}") from e

async def _perform_search(filters: SearchFilters) -> List[SearchResult]:
    """Internal function to perform the search"""
    try:
        print(f"[DEBUG] Search initiated with filters: {filters}")
        
        # Get all user profiles
        profiles = db.storage.json.get("user_profiles", default={})
        print(f"[DEBUG] Retrieved {len(profiles)} profiles from storage")
        if not profiles:
            print("[WARNING] No profiles found in storage")
            return []
        
        print(f"[DEBUG] Found {len(profiles)} profiles")
        results = []
        
        # Process each profile
        for uid, profile in profiles.items():
            try:
                # Skip demo user
                if uid == "demo_user_1":
                    continue
                    
                # Text search in company name or display name
                if filters.search_query:
                    query = filters.search_query.lower()
                    company_name = profile.get('company_name', '').lower()
                    display_name = profile.get('display_name', '').lower()
                    
                    if query not in company_name and query not in display_name:
                        continue
                
                # Check cache for match percentage
                cache_key = _get_cache_key(uid, filters)
                if cache_key in _match_cache:
                    match_percentage = _match_cache[cache_key]
                else:
                    match_percentage = calculate_match_percentage(profile, filters)
                    _match_cache[cache_key] = match_percentage
                    
                    # Clear match cache if it gets too large
                    if len(_match_cache) > 10000:  # Limit cache size
                        _match_cache.clear()
                
                # Only include results with a match percentage > 0
                if match_percentage > 0:
                    try:
                        result = SearchResult(
                            profile=ExtendedUserProfile(**profile),
                            match_percentage=match_percentage
                        )
                        results.append(result)
                    except Exception as validation_error:
                        print(f"[ERROR] Failed to create SearchResult for {uid}: {str(validation_error)}")
                        print(f"[ERROR] Profile data causing error: {profile}")

                    
            except Exception as profile_error:
                print(f"[ERROR] Error processing profile {uid}: {str(profile_error)}")
                print(f"[ERROR] Traceback: {traceback.format_exc()}")
                continue
        
        # Sort results by match percentage (highest first)
        results.sort(key=lambda x: x.match_percentage, reverse=True)
        print(f"[INFO] Search completed. Found {len(results)} matches")
        return results
    except Exception as e:
        print(f"[ERROR] Critical error in search: {str(e)}")
        print(f"[ERROR] Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Error searching users: {str(e)}") from e

@router.put("/presets/{preset_id}/last-used")
def update_preset_last_used(preset_id: str):
    """Update the last used timestamp of a preset"""
    try:
        presets = db.storage.json.get("search_presets", default={})
        if preset_id not in presets:
            raise HTTPException(status_code=404, detail="Preset not found")
            
        presets[preset_id]["last_used"] = datetime.now().isoformat()
        db.storage.json.put("search_presets", presets)
        
        return {"status": "success", "message": "Last used timestamp updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating last used timestamp: {str(e)}") from e
