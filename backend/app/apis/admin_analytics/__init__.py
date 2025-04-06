"""Admin analytics API for the InvestMatch platform.

This module provides analytics endpoints for admin users to view platform-wide metrics.
"""

from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from pydantic import BaseModel
from pydantic import SkipValidation
from fastapi import APIRouter, HTTPException, Depends

from app.apis.models import (
    UserType as UserRole, BaseProfile,
    UserTypeMetrics, MatchingMetrics, FundraisingMetrics,
    PlatformMetrics, AdminDashboard
)
import databutton as db

router = APIRouter(tags=["admin"])

# Register the admin analytics route with the exact path expected by the frontend

def get_demo_user_type_metrics(role: UserRole) -> UserTypeMetrics:
    """Generate demo metrics for a user type"""
    import random
    
    return UserTypeMetrics(
        total_users=random.randint(100, 1000),
        active_users=random.randint(50, 500),
        new_users_30d=random.randint(10, 100),
        engagement_rate=random.uniform(0.4, 0.8),
        average_connections=random.uniform(10, 50),
        total_interactions=random.randint(1000, 5000)
    )

def get_demo_matching_metrics() -> MatchingMetrics:
    """Generate demo matching metrics"""
    import random
    
    total = random.randint(1000, 5000)
    successful = random.randint(500, min(total, 2500))
    
    return MatchingMetrics(
        total_matches=total,
        successful_matches=successful,
        average_match_quality=random.uniform(0.7, 0.9),
        match_response_rate=random.uniform(0.5, 0.8),
        average_time_to_response=random.uniform(12, 48)
    )

def get_demo_fundraising_metrics() -> FundraisingMetrics:
    """Generate demo fundraising metrics"""
    import random
    
    fund_types = ["venture", "growth", "buyout", "real_estate"]
    deals_by_type = {ft: random.randint(5, 20) for ft in fund_types}
    capital_by_type = {ft: random.uniform(10000000, 100000000) for ft in fund_types}
    
    return FundraisingMetrics(
        total_capital_raised=sum(capital_by_type.values()),
        number_of_deals=sum(deals_by_type.values()),
        average_deal_size=sum(capital_by_type.values()) / sum(deals_by_type.values()),
        success_rate=random.uniform(0.3, 0.6),
        deals_by_fund_type=deals_by_type,
        capital_by_fund_type=capital_by_type
    )

def get_demo_platform_metrics() -> PlatformMetrics:
    """Generate demo platform metrics"""
    import random
    
    total_users = random.randint(1000, 5000)
    active_users = random.randint(500, min(total_users, 2500))
    
    return PlatformMetrics(
        total_users=total_users,
        active_users_30d=active_users,
        total_interactions=random.randint(10000, 50000),
        average_response_time=random.uniform(1, 24),
        user_growth_rate=random.uniform(0.05, 0.15),
        platform_engagement_rate=random.uniform(0.4, 0.8)
    )

def get_demo_recent_activities(limit: int = 10) -> List[Dict[str, Any]]:
    """Generate demo recent activities"""
    import random
    
    activity_types = [
        "new_user",
        "successful_match",
        "deal_closed",
        "high_value_introduction",
        "platform_milestone"
    ]
    
    now = datetime.utcnow()
    
    activities = [
        {
            "type": random.choice(activity_types),
            "timestamp": (now - timedelta(minutes=random.randint(1, 1440))).isoformat(),
            "details": f"Demo activity {i}",
            "importance": random.choice(["low", "medium", "high"])
        }
        for i in range(limit)
    ]
    
    return sorted(activities, key=lambda x: x["timestamp"], reverse=True)

@router.get("/routes/analytics/admin")
def get_admin_analytics_by_path():
    """Get platform-wide analytics for admins using the path-based route
    
    This endpoint matches the exact path expected by direct API calls.
    
    Returns:
        AdminAnalytics containing platform-wide analytics data
    """
    return get_admin_analytics_impl()

@router.get("/routes/admin/analytics/dashboard")
def get_admin_analytics_dashboard():
    """Get platform-wide analytics dashboard for admins
    
    This endpoint matches the exact path the frontend is trying to access.
    This is a synchronous version that wraps the async get_admin_dashboard() function.
    
    Returns:
        AdminDashboard containing platform-wide analytics data
    """
    # Create a synchronous version that generates the same data
    try:
        # Get metrics for each user type
        user_type_metrics = {}
        try:
            user_type_metrics = {
                role.value: get_demo_user_type_metrics(role)
                for role in [UserRole.FUND_MANAGER, UserRole.LIMITED_PARTNER, UserRole.CAPITAL_RAISER]
            }
        except Exception as e:
            print(f"Error getting user type metrics: {str(e)}")
            # Provide default values instead of failing
            for role in [UserRole.FUND_MANAGER, UserRole.LIMITED_PARTNER, UserRole.CAPITAL_RAISER]:
                user_type_metrics[role.value] = UserTypeMetrics(
                    total_users=0,
                    active_users=0,
                    new_users_30d=0,
                    engagement_rate=0.0,
                    average_connections=0.0,
                    total_interactions=0
                )
        
        # Get platform-wide metrics
        platform_metrics = None
        try:
            platform_metrics = get_demo_platform_metrics()
        except Exception as e:
            print(f"Error getting platform metrics: {str(e)}")
            # Provide default values instead of failing
            platform_metrics = PlatformMetrics(
                total_users=0,
                active_users_30d=0,
                total_interactions=0,
                average_response_time=0.0,
                user_growth_rate=0.0,
                platform_engagement_rate=0.0
            )
        
        # Get matching metrics
        matching_metrics = None
        try:
            matching_metrics = get_demo_matching_metrics()
        except Exception as e:
            print(f"Error getting matching metrics: {str(e)}")
            # Provide default values instead of failing
            matching_metrics = MatchingMetrics(
                total_matches=0,
                successful_matches=0,
                average_match_quality=0.0,
                match_response_rate=0.0,
                average_time_to_response=0.0
            )
        
        # Get fundraising metrics
        fundraising_metrics = None
        try:
            fundraising_metrics = get_demo_fundraising_metrics()
        except Exception as e:
            print(f"Error getting fundraising metrics: {str(e)}")
            # Provide default values instead of failing
            fundraising_metrics = FundraisingMetrics(
                total_capital_raised=0.0,
                number_of_deals=0,
                average_deal_size=0.0,
                success_rate=0.0,
                deals_by_fund_type={},
                capital_by_fund_type={}
            )
        
        # Get recent activities
        recent_activities = []
        try:
            recent_activities = get_demo_recent_activities()
        except Exception as e:
            print(f"Error getting recent activities: {str(e)}")
            # Leave as empty list rather than failing
        
        return AdminDashboard(
            last_updated=datetime.utcnow().isoformat(),
            platform_metrics=platform_metrics,
            user_type_metrics=user_type_metrics,
            matching_metrics=matching_metrics,
            fundraising_metrics=fundraising_metrics,
            recent_activities=recent_activities
        )
        
    except Exception as e:
        print(f"Error getting admin dashboard: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error retrieving admin dashboard data"
        ) from e

@router.get("/get-admin-analytics")
def get_admin_analytics_endpoint():
    """Get platform-wide analytics for admins
    
    This endpoint matches the exact function name expected by the Brain client.
    Function renamed to avoid duplicate operation ID.
    
    Returns:
        AdminAnalytics containing platform-wide analytics data
    """
    return get_admin_analytics_impl()

@router.get("/")
def get_admin_analytics_root():
    """Root endpoint for getting admin analytics
    
    This endpoint is needed for direct brain.get_admin_analytics() calls from the frontend.
    
    Returns:
        AdminAnalytics containing platform-wide analytics data
    """
    return get_admin_analytics_impl()

def get_admin_analytics_impl():
    """Get platform-wide analytics for admins
    
    This endpoint matches the exact path expected by the frontend Brain client.
    
    Returns:
        AdminAnalytics containing platform-wide analytics data
    """
    try:
        # Get user metrics
        user_metrics = {}
        try:
            user_metrics = {
                "total_users": sum(get_demo_user_type_metrics(role).total_users 
                              for role in [UserRole.FUND_MANAGER, UserRole.LIMITED_PARTNER, UserRole.CAPITAL_RAISER]),
                "new_users_last_period": sum(get_demo_user_type_metrics(role).new_users_30d 
                                       for role in [UserRole.FUND_MANAGER, UserRole.LIMITED_PARTNER, UserRole.CAPITAL_RAISER]),
                "avg_profile_completeness": 85.7,  # Example value
                "completeness_trend": 3.2,  # Example value
                "engagement_score": 72.5,  # Example value
                "retention_rate": 88.3,  # Example value
                "avg_login_frequency": 3.2,  # Example value
                "avg_time_on_platform": 18.5,  # Example value in minutes
                "user_types": {
                    "fund_managers": get_demo_user_type_metrics(UserRole.FUND_MANAGER).total_users,
                    "limited_partners": get_demo_user_type_metrics(UserRole.LIMITED_PARTNER).total_users,
                    "capital_raisers": get_demo_user_type_metrics(UserRole.CAPITAL_RAISER).total_users
                }
            }
        except Exception as e:
            print(f"Error getting user metrics: {str(e)}")
            # Set default values for user metrics
            user_metrics = {
                "total_users": 0,
                "new_users_last_period": 0,
                "avg_profile_completeness": 0,
                "completeness_trend": 0,
                "engagement_score": 0,
                "retention_rate": 0,
                "avg_login_frequency": 0,
                "avg_time_on_platform": 0,
                "user_types": {
                    "fund_managers": 0,
                    "limited_partners": 0,
                    "capital_raisers": 0
                }
            }
        
        # Get matching metrics
        matching_metrics = {}
        try:
            matching_metrics = {
                "match_rate_percentage": 76.2,  # Example value
                "match_rate_trend": 3.8,  # Example value
                "total_matches": get_demo_matching_metrics().total_matches,
                "accepted_matches": get_demo_matching_metrics().successful_matches
            }
        except Exception as e:
            print(f"Error getting matching metrics: {str(e)}")
            # Set default values for matching metrics
            matching_metrics = {
                "match_rate_percentage": 0,
                "match_rate_trend": 0,
                "total_matches": 0,
                "accepted_matches": 0
            }
        
        # Get moderation metrics
        moderation_metrics = {}
        try:
            # Generate action distribution data with null check
            action_distribution = {}
            try:
                action_distribution = {
                    "approved": 56,
                    "rejected": 32,
                    "flagged": 12,
                    "escalated": 8
                }
            except Exception as e:
                print(f"Error generating action distribution: {str(e)}")
                # Default to empty dict
            
            # Generate time distribution data with null check
            time_distribution = {}
            try:
                time_distribution = {
                    "morning": 35,
                    "afternoon": 42,
                    "evening": 23,
                    "night": 8
                }
            except Exception as e:
                print(f"Error generating time distribution: {str(e)}")
                # Default to empty dict
            
            # Generate moderator efficiency data with null check
            moderator_efficiency = []
            try:
                moderator_efficiency = [
                    {
                        "moderator_id": "mod1",
                        "name": "John Doe",
                        "reports_handled": 87,
                        "avg_resolution_time": 3.5,
                        "accuracy_rate": 94.2
                    },
                    {
                        "moderator_id": "mod2",
                        "name": "Jane Smith",
                        "reports_handled": 62,
                        "avg_resolution_time": 4.8,
                        "accuracy_rate": 91.7
                    },
                    {
                        "moderator_id": "mod3",
                        "name": "Alex Johnson",
                        "reports_handled": 53,
                        "avg_resolution_time": 5.1,
                        "accuracy_rate": 89.5
                    }
                ]
            except Exception as e:
                print(f"Error generating moderator efficiency data: {str(e)}")
                # Default to empty list
            
            moderation_metrics = {
                "total_reports": 24,  # Example value
                "reports_trend": -5.2,  # Example value
                "avg_resolution_time": 4.2,  # Example value in hours
                "moderator_efficiency": moderator_efficiency,
                "action_distribution": action_distribution,
                "time_distribution": time_distribution
            }
        except Exception as e:
            print(f"Error getting moderation metrics: {str(e)}")
            # Set default values for moderation metrics
            moderation_metrics = {
                "total_reports": 0,
                "reports_trend": 0,
                "avg_resolution_time": 0,
                "moderator_efficiency": [],
                "action_distribution": {},
                "time_distribution": {}
            }
        
        # Get funnel metrics
        funnel_metrics = {}
        try:
            funnel_metrics = {
                "registration_rate": 68.0,  # Example value
                "profile_completion_rate": 82.0,  # Example value
                "first_match_rate": 56.0,  # Example value
                "first_introduction_rate": 38.0  # Example value
            }
        except Exception as e:
            print(f"Error getting funnel metrics: {str(e)}")
            # Set default values for funnel metrics
            funnel_metrics = {
                "registration_rate": 0,
                "profile_completion_rate": 0,
                "first_match_rate": 0,
                "first_introduction_rate": 0
            }
        
        return {
            "user_metrics": user_metrics,
            "matching_metrics": matching_metrics,
            "moderation_metrics": moderation_metrics,
            "funnel_metrics": funnel_metrics,
            "last_updated": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        print(f"Error in get_admin_analytics: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error retrieving admin analytics data"
        ) from e

@router.get("/dashboard")
async def get_admin_dashboard() -> AdminDashboard:
    """Get the complete admin dashboard
    
    This endpoint aggregates data from all parts of the platform to provide
    a comprehensive view for administrators.
    
    Returns:
        AdminDashboard containing all metrics and recent activities
    """
    try:
        # Get metrics for each user type
        user_type_metrics = {}
        try:
            user_type_metrics = {
                role.value: get_demo_user_type_metrics(role)
                for role in [UserRole.FUND_MANAGER, UserRole.LIMITED_PARTNER, UserRole.CAPITAL_RAISER]
            }
        except Exception as e:
            print(f"Error getting user type metrics: {str(e)}")
            # Provide default values instead of failing
            for role in [UserRole.FUND_MANAGER, UserRole.LIMITED_PARTNER, UserRole.CAPITAL_RAISER]:
                user_type_metrics[role.value] = UserTypeMetrics(
                    total_users=0,
                    active_users=0,
                    new_users_30d=0,
                    engagement_rate=0.0,
                    average_connections=0.0,
                    total_interactions=0
                )
        
        # Get platform-wide metrics
        platform_metrics = None
        try:
            platform_metrics = get_demo_platform_metrics()
        except Exception as e:
            print(f"Error getting platform metrics: {str(e)}")
            # Provide default values instead of failing
            platform_metrics = PlatformMetrics(
                total_users=0,
                active_users_30d=0,
                total_interactions=0,
                average_response_time=0.0,
                user_growth_rate=0.0,
                platform_engagement_rate=0.0
            )
        
        # Get matching metrics
        matching_metrics = None
        try:
            matching_metrics = get_demo_matching_metrics()
        except Exception as e:
            print(f"Error getting matching metrics: {str(e)}")
            # Provide default values instead of failing
            matching_metrics = MatchingMetrics(
                total_matches=0,
                successful_matches=0,
                average_match_quality=0.0,
                match_response_rate=0.0,
                average_time_to_response=0.0
            )
        
        # Get fundraising metrics
        fundraising_metrics = None
        try:
            fundraising_metrics = get_demo_fundraising_metrics()
        except Exception as e:
            print(f"Error getting fundraising metrics: {str(e)}")
            # Provide default values instead of failing
            fundraising_metrics = FundraisingMetrics(
                total_capital_raised=0.0,
                number_of_deals=0,
                average_deal_size=0.0,
                success_rate=0.0,
                deals_by_fund_type={},
                capital_by_fund_type={}
            )
        
        # Get recent activities
        recent_activities = []
        try:
            recent_activities = get_demo_recent_activities()
        except Exception as e:
            print(f"Error getting recent activities: {str(e)}")
            # Leave as empty list rather than failing
        
        return AdminDashboard(
            last_updated=datetime.utcnow().isoformat(),
            platform_metrics=platform_metrics,
            user_type_metrics=user_type_metrics,
            matching_metrics=matching_metrics,
            fundraising_metrics=fundraising_metrics,
            recent_activities=recent_activities
        )
        
    except Exception as e:
        print(f"Error getting admin dashboard: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error retrieving admin dashboard data"
        ) from e

@router.get("/user-type/{role}")
async def get_user_type_analytics(role: UserRole) -> UserTypeMetrics:
    """Get detailed analytics for a specific user type
    
    Args:
        role: The user role to get analytics for
        
    Returns:
        UserTypeMetrics for the specified role
    """
    try:
        return get_demo_user_type_metrics(role)
    except Exception as e:
        print(f"Error getting user type analytics: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving analytics for {role}"
        ) from e

@router.get("/matching")
async def get_matching_analytics() -> MatchingMetrics:
    """Get detailed matching analytics
    
    Returns:
        MatchingMetrics containing platform-wide matching data
    """
    try:
        return get_demo_matching_metrics()
    except Exception as e:
        print(f"Error getting matching analytics: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error retrieving matching analytics"
        ) from e

@router.get("/fundraising")
async def get_fundraising_analytics() -> FundraisingMetrics:
    """Get detailed fundraising analytics
    
    Returns:
        FundraisingMetrics containing platform-wide fundraising data
    """
    try:
        return get_demo_fundraising_metrics()
    except Exception as e:
        print(f"Error getting fundraising analytics: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error retrieving fundraising analytics"
        ) from e
