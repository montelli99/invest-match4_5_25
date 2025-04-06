from typing import List, Optional, Tuple, Dict
from collections import defaultdict

from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel
import databutton as db

from app.apis.models import ExtendedUserProfile, SearchFilters, MatchPreferences

router = APIRouter()

# Investment categories hierarchy
def find_category_path(category_name: str) -> tuple:
    """Find the complete path (main, sub, specific) for a given category"""
    for main_cat, sub_cats in INVESTMENT_CATEGORIES.items():
        # Check if it's a main category
        if category_name == main_cat:
            return (main_cat, None, None)
        
        for sub_cat, specifics in sub_cats.items():
            # Check if it's a sub-category
            if category_name == sub_cat:
                return (main_cat, sub_cat, None)
            
            # Check if it's a specific category
            if category_name in specifics:
                return (main_cat, sub_cat, category_name)
    
    return (None, None, None)

INVESTMENT_CATEGORIES = {
    "Financial Markets and Trading": {
        "Forex and Commodities": ["Forex", "Commodities", "Equities", "Currencies"],
        "Equities and Options Trading": ["Options Trading", "Equities", "Options", "Stocks", "Derivatives"],
        "Hedge Funds": ["Hedge Fund", "Crypto Hedge Fund"],
        "Cryptocurrency and AI": ["Crypto", "Bitcoin Mining", "AI - Machine Learning"]
    },
    "Real Estate": {
        "Residential": ["Multifamily", "Senior Living", "Custom Luxury", "SPEC Homes"],
        "Commercial": ["Office Buildings", "Hotels and Motels", "Industrial", "Retail"],
        "Land": ["Big Land/Ranches", "Land Development"],
        "Development Projects": ["Real Estate Development", "Ground-Up Development"]
    },
    "PE, M&A, VC": {
        "Private Equity": ["Private Equity", "Private Credit"],
        "Mergers & Acquisitions": ["Business Acquisitions", "Private Equity M&A"],
        "Venture Capital": ["Venture Capital"]
    }
}



def calculate_match_percentage(profile: dict, filters: SearchFilters) -> float:
    """Calculate match percentage between a profile and search filters with hierarchical categories"""
    total_weight = 0
    match_score = 0
    
    # Check role compatibility first
    user_role = profile.get('role')
    filter_role = filters.user_type
    
    if user_role and filter_role:
        # Fund of Funds specific matching
        if user_role == 'fund_of_funds' and filter_role != 'fund_manager':
            if filter_role != 'capital_raiser':
                return 0  # Fund of Funds can only match with Fund Managers or Capital Raisers
        elif filter_role == 'fund_of_funds' and user_role != 'fund_manager':
            if user_role != 'capital_raiser':
                return 0  # Fund of Funds can only match with Fund Managers or Capital Raisers
    
    # Category matching (40% main, 40% sub, 20% specific)
    if filters.investment_focus and profile.get('investment_focus'):
        profile_categories = profile['investment_focus']
        filter_categories = filters.investment_focus
        
        # Main category matching (40%)
        weight = 40
        total_weight += weight
        
        profile_main = set(cat[0] for cat in [find_category_path(c) for c in profile_categories] if cat[0])
        filter_main = set(cat[0] for cat in [find_category_path(c) for c in filter_categories] if cat[0])
        
        if profile_main & filter_main:
            match_score += weight
        
        # Sub-category matching (40%)
        weight = 40
        total_weight += weight
        
        profile_sub = set((cat[0], cat[1]) for cat in [find_category_path(c) for c in profile_categories] if cat[1])
        filter_sub = set((cat[0], cat[1]) for cat in [find_category_path(c) for c in filter_categories] if cat[1])
        
        if profile_sub and filter_sub:
            overlap = len(profile_sub & filter_sub)
            match_score += weight * (overlap / len(filter_sub))
        
        # Specific category matching (20%)
        weight = 20
        total_weight += weight
        
        profile_specific = set(cat[2] for cat in [find_category_path(c) for c in profile_categories] if cat[2])
        filter_specific = set(cat[2] for cat in [find_category_path(c) for c in filter_categories] if cat[2])
        
        if profile_specific and filter_specific:
            overlap = len(profile_specific & filter_specific)
            match_score += weight * (overlap / len(filter_specific))
    
    # Fund type matching (high weight)
    if filters.fund_type and profile.get('fund_type'):
        weight = 15
        total_weight += weight
        if filters.fund_type.lower() == profile['fund_type'].lower():
            match_score += weight
    
    # Fund size range matching
    if profile.get('fund_size'):
        weight = 10
        total_weight += weight
        fund_size = profile['fund_size']
        
        if filters.min_fund_size and filters.max_fund_size:
            if filters.min_fund_size <= fund_size <= filters.max_fund_size:
                match_score += weight
        elif filters.min_fund_size and fund_size >= filters.min_fund_size:
            match_score += weight
        elif filters.max_fund_size and fund_size <= filters.max_fund_size:
            match_score += weight
    
    # Investment focus matching
    if filters.investment_focus and profile.get('investment_focus'):
        weight = 20
        total_weight += weight
        profile_focus = set(profile['investment_focus'])
        filter_focus = set(filters.investment_focus)
        
        overlap = len(profile_focus & filter_focus)
        if overlap > 0:
            match_score += weight * (overlap / len(filter_focus))
    
    # Historical returns matching
    if filters.min_historical_returns and profile.get('historical_returns'):
        weight = 15
        total_weight += weight
        if profile['historical_returns'] >= filters.min_historical_returns:
            match_score += weight
    
    # Risk profile matching
    if filters.risk_profile and profile.get('risk_profile'):
        weight = 10
        total_weight += weight
        if filters.risk_profile.lower() == profile['risk_profile'].lower():
            match_score += weight
    
    # Investment size matching
    if profile.get('typical_investment_size'):
        weight = 10
        total_weight += weight
        inv_size = profile['typical_investment_size']
        
        if filters.min_investment_size and filters.max_investment_size:
            if filters.min_investment_size <= inv_size <= filters.max_investment_size:
                match_score += weight
        elif filters.min_investment_size and inv_size >= filters.min_investment_size:
            match_score += weight
        elif filters.max_investment_size and inv_size <= filters.max_investment_size:
            match_score += weight
    
    # Investment horizon matching
    if profile.get('investment_horizon'):
        weight = 5
        total_weight += weight
        horizon = profile['investment_horizon']
        
        if filters.min_investment_horizon and filters.max_investment_horizon:
            if filters.min_investment_horizon <= horizon <= filters.max_investment_horizon:
                match_score += weight
        elif filters.min_investment_horizon and horizon >= filters.min_investment_horizon:
            match_score += weight
        elif filters.max_investment_horizon and horizon <= filters.max_investment_horizon:
            match_score += weight
    
    # Deal size range matching (for capital raisers)
    if filters.deal_size_range and profile.get('typical_deal_size'):
        weight = 10
        total_weight += weight
        deal_size = profile['typical_deal_size']
        
        if len(filters.deal_size_range) == 2:
            min_deal, max_deal = filters.deal_size_range
            if min_deal <= deal_size <= max_deal:
                match_score += weight
    
    # Experience matching
    if filters.min_years_experience and profile.get('years_experience'):
        weight = 5
        total_weight += weight
        if profile['years_experience'] >= filters.min_years_experience:
            match_score += weight
    
    # Sector matching
    if filters.sectors and profile.get('sectors'):
        weight = 15
        total_weight += weight
        profile_sectors = set(profile['sectors'])
        filter_sectors = set(filters.sectors)
        
        overlap = len(profile_sectors & filter_sectors)
        if overlap > 0:
            match_score += weight * (overlap / len(filter_sectors))
    
    # Track record requirement
    if filters.track_record_required is not None and profile.get('track_record'):
        weight = 5
        total_weight += weight
        if filters.track_record_required and profile['track_record']:
            match_score += weight
        elif not filters.track_record_required:
            match_score += weight
    
    # Calculate final percentage
    if total_weight == 0:
        return 0.0
    
    return (match_score / total_weight) * 100




class MatchResult(BaseModel):
    """Match result with detailed compatibility information"""
    profile: ExtendedUserProfile
    match_percentage: float
    compatibility_factors: List[str]  # List of factors that contributed to the match
    potential_synergies: List[str]  # Potential areas of collaboration

def analyze_compatibility(user_profile: dict, other_profile: dict) -> Tuple[float, List[str], List[str]]:
    """Analyze compatibility between two profiles and return match details with enhanced role-specific analysis"""
    # Initialize base match calculation
    search_filters = SearchFilters(
        user_type=other_profile.get('role'),
        fund_type=other_profile.get('fund_type'),
        investment_focus=other_profile.get('investment_focus'),
        min_historical_returns=other_profile.get('historical_returns'),
        risk_profile=other_profile.get('risk_profile'),
        sectors=other_profile.get('sectors'),
        min_years_experience=other_profile.get('years_experience')
    )
    
    match_percentage = calculate_match_percentage(user_profile, search_filters)
    
    compatibility_factors = []
    potential_synergies = []
    
    user_role = user_profile.get('role')
    other_role = other_profile.get('role')
    
    if not (user_role and other_role):
        return match_percentage, compatibility_factors, potential_synergies
    
    # Role-specific compatibility analysis
    if user_role == 'fund_manager':
        if other_role == 'limited_partner':
            # Fund Manager to LP matching
            compatibility_factors.append("Fund Manager - LP relationship potential")
            potential_synergies.append("Direct investment opportunities")
            
            # Fund size and investment criteria
            fund_size = user_profile.get('fund_size')
            investment_size = other_profile.get('typical_investment_size')
            min_investment = other_profile.get('minimum_investment')
            
            if all([fund_size, investment_size, min_investment]):
                if fund_size >= min_investment:
                    compatibility_factors.append("Fund size meets minimum investment criteria")
                    if fund_size >= investment_size * 2:
                        potential_synergies.append("Significant capital deployment potential")
                    else:
                        potential_synergies.append("Moderate capital deployment potential")
            
            # Track record evaluation for LP requirements
            lp_min_returns = other_profile.get('min_historical_returns')
            fm_returns = user_profile.get('historical_returns')
            if lp_min_returns and fm_returns and fm_returns >= lp_min_returns:
                compatibility_factors.append("Historical performance meets LP requirements")
                potential_synergies.append("Strong performance alignment")
                
        elif other_role == 'capital_raiser':
            # Fund Manager to Capital Raiser matching
            compatibility_factors.append("Fund deployment opportunity")
            potential_synergies.append("Access to curated deal flow")
            
            # Deal size compatibility
            fund_deployment = user_profile.get('typical_investment_size')
            deal_size = other_profile.get('typical_deal_size')
            if fund_deployment and deal_size:
                if 0.1 * fund_deployment <= deal_size <= fund_deployment:
                    compatibility_factors.append("Deal size aligns with deployment strategy")
                    potential_synergies.append("Efficient capital deployment potential")
    
    elif user_role == 'limited_partner':
        if other_role == 'fund_manager':
            # LP to Fund Manager matching
            compatibility_factors.append("LP - Fund Manager alignment")
            potential_synergies.append("Access to institutional-quality investments")
            
            # Investment criteria alignment
            lp_size = user_profile.get('typical_investment_size')
            fund_min = other_profile.get('minimum_investment')
            if lp_size and fund_min and lp_size >= fund_min:
                compatibility_factors.append("Investment capacity meets fund requirements")
                potential_synergies.append("Qualified investment opportunity")
            
            # Performance expectations
            lp_target = user_profile.get('min_historical_returns')
            fm_returns = other_profile.get('historical_returns')
            if lp_target and fm_returns and fm_returns >= lp_target:
                compatibility_factors.append("Performance expectations aligned")
                potential_synergies.append("Track record meets return requirements")
                
        elif other_role == 'capital_raiser':
            # LP to Capital Raiser matching
            compatibility_factors.append("Direct investment opportunities")
            potential_synergies.append("Access to proprietary deals")
            
            # Investment size compatibility
            lp_size = user_profile.get('typical_investment_size')
            deal_size = other_profile.get('typical_deal_size')
            if lp_size and deal_size:
                if 0.2 * lp_size <= deal_size <= lp_size:
                    compatibility_factors.append("Deal size matches investment capacity")
                    potential_synergies.append("Direct investment potential")
    
    elif user_role == 'capital_raiser':
        if other_role in ['fund_manager', 'limited_partner', 'fund_of_funds']:
            # Capital Raiser to Investor matching
            compatibility_factors.append("Capital raising opportunity")
            potential_synergies.append("Deal flow generation")
            
            # Deal size compatibility
            deal_size = user_profile.get('typical_deal_size')
            investment_size = other_profile.get('typical_investment_size')
            if deal_size and investment_size:
                if 0.2 * investment_size <= deal_size <= investment_size:
                    compatibility_factors.append("Deal size alignment")
                    potential_synergies.append("Optimal deal size match")
            
            # Industry focus alignment
            raiser_focus = set(user_profile.get('industry_focus', []))
            investor_focus = set(other_profile.get('investment_focus', []))
            if raiser_focus and investor_focus:
                overlap = raiser_focus & investor_focus
                if overlap:
                    compatibility_factors.append(f"Industry focus alignment in {', '.join(overlap)}")
                    potential_synergies.append("Sector-specific opportunities")
    
    elif user_role == 'fund_of_funds':
        if other_role == 'fund_manager':
            # Fund of Funds to Fund Manager matching
            compatibility_factors.append("Fund allocation opportunity")
            potential_synergies.append("Portfolio diversification")
            
            # Fund size compatibility
            fof_size = user_profile.get('fund_size', 0)
            fund_size = other_profile.get('fund_size', 0)
            if fof_size and fund_size and fof_size > fund_size * 2:
                compatibility_factors.append("Fund size hierarchy alignment")
                potential_synergies.append("Appropriate allocation ratio")
            
            # Performance expectations
            fof_target = user_profile.get('min_historical_returns', 0)
            fm_returns = other_profile.get('historical_returns', 0)
            if fof_target and fm_returns and fm_returns >= fof_target:
                compatibility_factors.append("Performance expectations aligned")
                potential_synergies.append("Track record meets return requirements")
                
        elif other_role == 'capital_raiser':
            # Fund of Funds to Capital Raiser matching
            compatibility_factors.append("Deal discovery potential")
            potential_synergies.append("Access to multiple fund managers")
            
            # Relationship leverage
            if user_profile.get('fund_managers_invested', 0) > 5:
                compatibility_factors.append("Extensive fund manager network")
                potential_synergies.append("Multi-fund deployment opportunities")
    
    # Common compatibility factors across all roles
    
    # Investment focus alignment
    user_focus = set(user_profile.get('investment_focus', []))
    other_focus = set(other_profile.get('investment_focus', []))
    if user_focus and other_focus:
        overlap = user_focus & other_focus
        if overlap:
            compatibility_factors.append(f"Shared investment focus in {', '.join(overlap)}")
            potential_synergies.append("Complementary sector expertise")
    
    # Risk profile compatibility
    user_risk = user_profile.get('risk_profile')
    other_risk = other_profile.get('risk_profile')
    if user_risk and other_risk:
        risk_levels = {'conservative': 1, 'moderate': 2, 'aggressive': 3}
        risk_diff = abs(risk_levels.get(user_risk, 0) - risk_levels.get(other_risk, 0))
        
        if risk_diff == 0:
            compatibility_factors.append("Perfectly aligned risk tolerance")
            potential_synergies.append("Harmonious risk management approach")
        elif risk_diff == 1:
            compatibility_factors.append("Compatible risk profiles")
            potential_synergies.append("Balanced risk-return potential")
    
    # Experience level compatibility
    user_exp = user_profile.get('years_experience', 0)
    other_exp = other_profile.get('years_experience', 0)
    if user_exp and other_exp:
        exp_diff = abs(user_exp - other_exp)
        if exp_diff <= 3:
            compatibility_factors.append("Peer-level experience")
            potential_synergies.append("Strong potential for peer collaboration")
        elif exp_diff <= 7:
            compatibility_factors.append("Complementary experience levels")
            potential_synergies.append("Mentorship opportunities")
    
    return match_percentage, compatibility_factors, potential_synergies

class GetUserMatchesRequest(BaseModel):
    user_id: str
    preferences: Optional[MatchPreferences] = None

@router.post("/get-matches", response_model=List[MatchResult], operation_id="get_user_matches")
async def get_user_matches(body: GetUserMatchesRequest) -> List[MatchResult]:
    user_id = body.user_id
    preferences = body.preferences or MatchPreferences()
    """Get intelligent matches for a user based on their profile and preferences"""
    try:
        # Get all user profiles
        profiles = db.storage.json.get("user_profiles", default={})
        if not profiles:
            return []
        
        # Get user's profile
        user_profile = profiles.get(user_id)
        if not user_profile:
            raise HTTPException(status_code=404, detail="User profile not found")
        
        # Get previously matched users
        matched_history = set(db.storage.json.get(f"matched_history_{user_id}", default=[]))
        
        results = []
        for other_id, other_profile in profiles.items():
            # Skip self and previously matched users if specified
            if other_id == user_id:
                continue
            if preferences.exclude_previously_matched and other_id in matched_history:
                continue
            
            # Skip if role is not in included roles
            if (preferences.include_roles and 
                other_profile.get('role') not in preferences.include_roles):
                continue
            
            # Calculate match details
            match_percentage, factors, synergies = analyze_compatibility(
                user_profile, other_profile
            )
            
            # Only include if meets minimum match percentage
            if match_percentage >= preferences.min_match_percentage:
                try:
                    result = MatchResult(
                        profile=ExtendedUserProfile(**other_profile),
                        match_percentage=match_percentage,
                        compatibility_factors=factors,
                        potential_synergies=synergies
                    )
                    results.append(result)
                except Exception as validation_error:
                    print(f"[ERROR] Failed to create MatchResult: {str(validation_error)}")
                    continue
        
        # Sort by match percentage and limit results
        results.sort(key=lambda x: x.match_percentage, reverse=True)
        return results[:preferences.max_results]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting matches: {str(e)}") from e

class UpdatePreferencesRequest(BaseModel):
    user_id: str
    preferences: MatchPreferences

@router.post("/update-match-preferences", response_model=dict)
async def update_match_preferences(body: UpdatePreferencesRequest) -> dict:
    """Update a user's matching preferences"""
    try:
        # Store the preferences
        db.storage.json.put(f"match_preferences_{body.user_id}", body.preferences.dict())
        return {"status": "success", "message": "Preferences updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating preferences: {str(e)}") from e

class RecordMatchRequest(BaseModel):
    user_id: str
    matched_user_id: str

@router.post("/record-match", response_model=dict)
async def record_match(body: RecordMatchRequest) -> dict:
    """Record that two users have been matched"""
    try:
        # Get existing match history for both users
        user_history = db.storage.json.get(f"matched_history_{body.user_id}", default=set())
        matched_user_history = db.storage.json.get(f"matched_history_{body.matched_user_id}", default=set())
        
        # Update match history
        user_history.add(body.matched_user_id)
        matched_user_history.add(body.user_id)
        
        # Store updated history
        db.storage.json.put(f"matched_history_{body.user_id}", list(user_history))
        db.storage.json.put(f"matched_history_{body.matched_user_id}", list(matched_user_history))
        
        return {"status": "success", "message": "Match recorded successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error recording match: {str(e)}") from e