from fastapi import APIRouter, HTTPException
from typing import Dict, List, Optional
from pydantic import BaseModel
from datetime import datetime, timedelta
import databutton as db

from app.apis.models import (
    UserType, RelationshipStatus, RelationshipType,
    UserAnalytics, FundManagerAnalytics, LimitedPartnerAnalytics,
    CapitalRaiserAnalytics, AdminAnalytics
)

router = APIRouter(prefix="/analytics", tags=["analytics"])



def get_user_base_analytics(user_id: str) -> UserAnalytics:
    """Get base analytics common to all user types"""
    try:
        # Get profile views
        views_key = f"analytics/profile_views/{user_id}"
        profile_views = db.storage.json.get(views_key, default=0)
        
        # Get profile completeness
        profile_key = f"profiles/{user_id}"
        profile = db.storage.json.get(profile_key)
        completeness = profile.get("completeness", 0)
        
        # Get relationship metrics
        rel_key = f"user_relationships/{user_id}"
        relationships = db.storage.json.get(rel_key, default=[])
        
        total_connections = len(relationships)
        active_connections = sum(
            1 for r in relationships 
            if r.get("status") == RelationshipStatus.ACTIVE
        )
        
        # Calculate average relationship strength
        strengths = [r.get("metrics", {}).get("quality_score", 0) for r in relationships]
        avg_strength = sum(strengths) / len(strengths) if strengths else 0
        
        # Calculate response rate
        response_times = [r.get("metrics", {}).get("avg_response_time", 0) for r in relationships]
        response_rate = sum(1 for t in response_times if t < 24) / len(response_times) if response_times else 0
        
        # Get last active timestamp
        activity_key = f"analytics/user_activity/{user_id}"
        last_active = db.storage.json.get(activity_key, default=None)
        
        return UserAnalytics(
            profile_views=profile_views,
            profile_completeness=completeness,
            total_connections=total_connections,
            active_connections=active_connections,
            avg_relationship_strength=avg_strength,
            response_rate=response_rate,
            last_active=last_active
        )
        
    except Exception as e:
        print(f"Error getting base analytics for user {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/fund-manager/{user_id}")
def get_fund_manager_analytics(user_id: str) -> FundManagerAnalytics:
    """Get analytics for fund managers"""
    try:
        # Get base analytics
        base = get_user_base_analytics(user_id)
        
        # Get fund manager specific metrics
        profile_key = f"profiles/{user_id}"
        profile = db.storage.json.get(profile_key)
        
        # Calculate fund metrics
        funds = profile.get("funds", [])
        total_funds = len(funds)
        total_aum = sum(f.get("size", 0) for f in funds)
        avg_performance = sum(f.get("performance", 0) for f in funds) / total_funds if total_funds else 0
        
        # Calculate LP match rate
        relationships = db.storage.json.get(f"user_relationships/{user_id}", default=[])
        lp_relationships = [r for r in relationships if r.get("type") == RelationshipType.FUND_LP]
        successful_matches = sum(1 for r in lp_relationships if r.get("status") == RelationshipStatus.ACTIVE)
        match_rate = successful_matches / len(lp_relationships) if lp_relationships else 0
        
        # Get successful raises
        successful_raises = sum(1 for f in funds if f.get("status") == "closed")
        
        return FundManagerAnalytics(
            **base.dict(),
            total_funds_managed=total_funds,
            total_aum=total_aum,
            avg_fund_performance=avg_performance,
            lp_match_rate=match_rate,
            successful_raises=successful_raises
        )
        
    except Exception as e:
        print(f"Error getting fund manager analytics for user {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/limited-partner/{user_id}")
def get_lp_analytics(user_id: str) -> LimitedPartnerAnalytics:
    """Get analytics for limited partners"""
    try:
        # Get base analytics
        base = get_user_base_analytics(user_id)
        
        # Get LP specific metrics
        profile_key = f"profiles/{user_id}"
        profile = db.storage.json.get(profile_key)
        
        # Calculate investment metrics
        investments = profile.get("investments", [])
        total_investments = len(investments)
        total_committed = sum(i.get("amount", 0) for i in investments)
        avg_size = total_committed / total_investments if total_investments else 0
        
        # Calculate success metrics
        successful_investments = sum(1 for i in investments if i.get("performance", 0) > 0)
        success_rate = successful_investments / total_investments if total_investments else 0
        
        # Calculate fund manager match rate
        relationships = db.storage.json.get(f"user_relationships/{user_id}", default=[])
        fm_relationships = [r for r in relationships if r.get("type") == RelationshipType.FUND_LP]
        successful_matches = sum(1 for r in fm_relationships if r.get("status") == RelationshipStatus.ACTIVE)
        match_rate = successful_matches / len(fm_relationships) if fm_relationships else 0
        
        return LimitedPartnerAnalytics(
            **base.dict(),
            total_investments=total_investments,
            total_committed=total_committed,
            fund_manager_match_rate=match_rate,
            investment_success_rate=success_rate,
            avg_investment_size=avg_size
        )
        
    except Exception as e:
        print(f"Error getting LP analytics for user {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/capital-raiser/{user_id}")
def get_capital_raiser_analytics(user_id: str) -> CapitalRaiserAnalytics:
    """Get analytics for capital raisers"""
    try:
        # Get base analytics
        base = get_user_base_analytics(user_id)
        
        # Get capital raiser specific metrics
        profile_key = f"profiles/{user_id}"
        profile = db.storage.json.get(profile_key)
        
        # Calculate deal metrics
        deals = profile.get("deals", [])
        total_deals = len(deals)
        total_raised = sum(d.get("amount", 0) for d in deals)
        avg_size = total_raised / total_deals if total_deals else 0
        
        # Calculate success metrics
        successful_deals = sum(1 for d in deals if d.get("status") == "closed")
        success_rate = successful_deals / total_deals if total_deals else 0
        
        # Calculate client satisfaction
        satisfaction_scores = [d.get("client_satisfaction", 0) for d in deals if "client_satisfaction" in d]
        avg_satisfaction = sum(satisfaction_scores) / len(satisfaction_scores) if satisfaction_scores else 0
        
        return CapitalRaiserAnalytics(
            **base.dict(),
            total_deals=total_deals,
            total_capital_raised=total_raised,
            success_rate=success_rate,
            avg_deal_size=avg_size,
            client_satisfaction=avg_satisfaction
        )
        
    except Exception as e:
        print(f"Error getting capital raiser analytics for user {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/admin")
def get_admin_analytics2() -> AdminAnalytics:
    """Get platform-wide analytics for admins
    
    Function renamed to avoid duplicate operation ID with admin_analytics module.
    """
    try:
        # Get all profiles
        profiles = []
        for key in db.storage.json.list("profiles/"):
            profiles.append(db.storage.json.get(key))
        
        # Calculate user totals by type
        user_totals = {
            UserType.FUND_MANAGER: sum(1 for p in profiles if p.get("user_type") == UserType.FUND_MANAGER),
            UserType.LIMITED_PARTNER: sum(1 for p in profiles if p.get("user_type") == UserType.LIMITED_PARTNER),
            UserType.CAPITAL_RAISER: sum(1 for p in profiles if p.get("user_type") == UserType.CAPITAL_RAISER)
        }
        
        # Calculate active users (active in last 30 days)
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        active_users = {
            UserType.FUND_MANAGER: sum(1 for p in profiles 
                if p.get("user_type") == UserType.FUND_MANAGER 
                and p.get("last_active", "2000-01-01") > thirty_days_ago.isoformat()),
            UserType.LIMITED_PARTNER: sum(1 for p in profiles 
                if p.get("user_type") == UserType.LIMITED_PARTNER 
                and p.get("last_active", "2000-01-01") > thirty_days_ago.isoformat()),
            UserType.CAPITAL_RAISER: sum(1 for p in profiles 
                if p.get("user_type") == UserType.CAPITAL_RAISER 
                and p.get("last_active", "2000-01-01") > thirty_days_ago.isoformat())
        }
        
        # Get all relationships
        relationships = []
        for key in db.storage.json.list("relationships/"):
            relationships.append(db.storage.json.get(key))
        
        total_connections = len(relationships)
        
        # Calculate successful matches
        successful_matches = sum(1 for r in relationships 
            if r.get("status") == RelationshipStatus.ACTIVE)
        
        # Calculate average match quality
        match_scores = [r.get("metrics", {}).get("quality_score", 0) for r in relationships]
        avg_match_quality = sum(match_scores) / len(match_scores) if match_scores else 0
        
        # Calculate user growth by month (last 12 months)
        months = []
        current = datetime.utcnow()
        for i in range(12):
            month_start = current.replace(day=1) - timedelta(days=30*i)
            month_users = sum(1 for p in profiles 
                if p.get("created_at", "2000-01-01")[:7] == month_start.strftime("%Y-%m"))
            months.append(month_users)
        
        growth = {
            "months": months[::-1],  # Reverse to show oldest first
            "labels": [(current - timedelta(days=30*i)).strftime("%Y-%m") 
                       for i in range(12)][::-1]
        }
        
        # Calculate engagement metrics
        total_views = sum(p.get("profile_views", 0) for p in profiles)
        avg_views = total_views / len(profiles) if profiles else 0
        
        avg_completeness = sum(p.get("completeness", 0) for p in profiles) / len(profiles) if profiles else 0
        
        engagement = {
            "avg_profile_views": avg_views,
            "avg_profile_completeness": avg_completeness,
            "avg_response_rate": sum(r.get("metrics", {}).get("response_rate", 0) 
                                    for r in relationships) / len(relationships) if relationships else 0
        }
        
        # Calculate conversion rates
        total_matches = sum(1 for r in relationships if r.get("type") == RelationshipType.MATCH)
        conversion = {
            "match_to_introduction": sum(1 for r in relationships 
                if r.get("type") == RelationshipType.INTRODUCTION) / total_matches if total_matches else 0,
            "introduction_to_active": sum(1 for r in relationships 
                if r.get("status") == RelationshipStatus.ACTIVE) / total_matches if total_matches else 0
        }
        
        return AdminAnalytics(
            total_users=user_totals,
            active_users=active_users,
            total_connections=total_connections,
            total_successful_matches=successful_matches,
            avg_match_quality=avg_match_quality,
            user_growth=growth,
            engagement_metrics=engagement,
            conversion_rates=conversion
        )
        
    except Exception as e:
        print(f"Error getting admin analytics: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
