"""Analytics Dashboard API for the InvestMatch platform.

Comprehensive KPI dashboard tracking metrics across Fund Managers, Capital Raisers, and Limited Partners.
"""

from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Union, Literal
from pydantic import BaseModel, Field
from fastapi import APIRouter, HTTPException, Depends, Query
from enum import Enum
import json
import random
import databutton as db

router = APIRouter(tags=["analytics"])

# --- Models ---

class UserRole(str, Enum):
    """User roles in the platform"""
    FUND_MANAGER = "fund_manager"
    CAPITAL_RAISER = "capital_raiser"
    LIMITED_PARTNER = "limited_partner"
    ADMIN = "admin"

class MetricValue(BaseModel):
    """Model for a metric with current value and change percentage"""
    current: float
    change_percentage: float
    
    model_config = {"arbitrary_types_allowed": True}

# User Growth & Profile Engagement
class UserGrowthMetrics(BaseModel):
    """User growth and engagement KPIs"""
    new_registrations: Dict[str, MetricValue] = Field(..., description="New registrations by role")
    profile_completion_rate: Dict[str, MetricValue] = Field(..., description="Profile completion rate by role")
    active_inactive_ratio: MetricValue = Field(..., description="Ratio of active to inactive users")
    verification_completion_rate: MetricValue = Field(..., description="Verification funnel completion rate")
    
    model_config = {"arbitrary_types_allowed": True}

# Contact & Networking Activity
class NetworkingMetrics(BaseModel):
    """Contact and networking activity KPIs"""
    contacts_uploaded: Dict[str, MetricValue] = Field(..., description="Contacts uploaded by role")
    introductions_made: MetricValue = Field(..., description="Number of introductions made")
    contact_conversion_rate: MetricValue = Field(..., description="Rate of contacts converting to platform users")
    network_growth_rate: Dict[str, MetricValue] = Field(..., description="Network growth rate by role")
    
    model_config = {"arbitrary_types_allowed": True}

# Matching Algorithm KPIs
class MatchingAlgorithmMetrics(BaseModel):
    """Matching algorithm performance KPIs"""
    total_matches_generated: MetricValue = Field(..., description="Total matches generated")
    average_match_score: MetricValue = Field(..., description="Average match score")
    high_confidence_match_percentage: MetricValue = Field(..., description="Percentage of high-confidence matches")
    match_acceptance_rate: Dict[str, MetricValue] = Field(..., description="Match acceptance rate by role")
    match_engagement_rate: MetricValue = Field(..., description="Match engagement rate")
    time_to_first_match: MetricValue = Field(..., description="Average time to first match")
    user_reported_match_quality: MetricValue = Field(..., description="User-reported match quality")
    
    model_config = {"arbitrary_types_allowed": True}

# Meetings & Deal Flow
class DealFlowMetrics(BaseModel):
    """Meetings and deal flow KPIs"""
    meetings_scheduled: MetricValue = Field(..., description="Number of meetings scheduled")
    meeting_completion_rate: MetricValue = Field(..., description="Meeting completion rate")
    deal_conversion_rate: MetricValue = Field(..., description="Deal conversion rate")
    average_deal_size: MetricValue = Field(..., description="Average deal size")
    time_from_match_to_deal: MetricValue = Field(..., description="Average time from match to deal")
    
    model_config = {"arbitrary_types_allowed": True}

# Sector & Role-Based Insights
class SectorMetrics(BaseModel):
    """Sector and role-based KPIs"""
    deals_per_sector: Dict[str, MetricValue] = Field(..., description="Number of deals per sector")
    fund_manager_success_rate: MetricValue = Field(..., description="Fund manager success rate")
    capital_raiser_conversion: MetricValue = Field(..., description="Capital raiser conversion rate")
    limited_partner_investment_activity: MetricValue = Field(..., description="Limited partner investment activity")
    
    model_config = {"arbitrary_types_allowed": True}

# Subscription & Monetization Metrics
class MonetizationMetrics(BaseModel):
    """Subscription and monetization KPIs"""
    user_tier_distribution: Dict[str, Dict[str, int]] = Field(..., description="User distribution by tier and role")
    upgrade_rate: MetricValue = Field(..., description="Subscription upgrade rate")
    downgrade_rate: MetricValue = Field(..., description="Subscription downgrade rate")
    renewal_rate: MetricValue = Field(..., description="Subscription renewal rate")
    churn_rate: MetricValue = Field(..., description="Subscription churn rate")
    average_revenue_per_active_user: MetricValue = Field(..., description="Average revenue per active user")
    
    model_config = {"arbitrary_types_allowed": True}

# Satisfaction & Support
class SatisfactionMetrics(BaseModel):
    """Satisfaction and support KPIs"""
    user_satisfaction_score: Dict[str, MetricValue] = Field(..., description="User satisfaction score by role")
    net_promoter_score: MetricValue = Field(..., description="Net promoter score")
    support_tickets: MetricValue = Field(..., description="Number of support tickets")
    avg_resolution_time: MetricValue = Field(..., description="Average support ticket resolution time")
    match_dispute_rate: MetricValue = Field(..., description="Match dispute rate")
    
    model_config = {"arbitrary_types_allowed": True}

# Additional Engagement Indicators
class EngagementMetrics(BaseModel):
    """Additional engagement KPIs"""
    profile_visits: Dict[str, MetricValue] = Field(..., description="Profile visits by role")
    message_response_time: MetricValue = Field(..., description="Average message response time")
    repeat_deals: MetricValue = Field(..., description="Number of repeat deals")
    
    model_config = {"arbitrary_types_allowed": True}

# Performance & Scalability
class PerformanceMetrics(BaseModel):
    """Performance and scalability KPIs"""
    match_generation_latency: MetricValue = Field(..., description="Match generation latency")
    api_response_times: MetricValue = Field(..., description="Average API response time")
    system_uptime: MetricValue = Field(..., description="System uptime percentage")
    error_rate: MetricValue = Field(..., description="System error rate")
    
    model_config = {"arbitrary_types_allowed": True}

# Comprehensive KPI Dashboard
class ComprehensiveKPIDashboard(BaseModel):
    """Comprehensive KPI dashboard with all metric categories"""
    user_growth: UserGrowthMetrics = Field(..., description="User growth and engagement metrics")
    networking: NetworkingMetrics = Field(..., description="Contact and networking metrics")
    matching_algorithm: MatchingAlgorithmMetrics = Field(..., description="Matching algorithm metrics")
    deal_flow: DealFlowMetrics = Field(..., description="Meetings and deal flow metrics")
    sector_insights: SectorMetrics = Field(..., description="Sector and role-based metrics")
    monetization: MonetizationMetrics = Field(..., description="Subscription and monetization metrics")
    satisfaction: SatisfactionMetrics = Field(..., description="Satisfaction and support metrics")
    engagement: EngagementMetrics = Field(..., description="Additional engagement metrics")
    performance: PerformanceMetrics = Field(..., description="Performance and scalability metrics")
    
    model_config = {"arbitrary_types_allowed": True}

class PeriodFilter(str, Enum):
    """Time period filters for analytics"""
    LAST_7_DAYS = "7d"
    LAST_30_DAYS = "30d"
    LAST_90_DAYS = "90d"
    LAST_12_MONTHS = "12m"
    YEAR_TO_DATE = "ytd"
    ALL_TIME = "all"

# --- Helper Functions ---

def generate_demo_metric_value(base_value: float = None, min_val: float = 0, max_val: float = 100, 
                              change_min: float = -20, change_max: float = 20) -> MetricValue:
    """Generate a demo metric value with current value and change percentage"""
    if base_value is None:
        current = random.uniform(min_val, max_val)
    else:
        # Add some randomness around the base value
        variation = base_value * 0.1  # 10% variation
        current = random.uniform(base_value - variation, base_value + variation)
    
    change_percentage = random.uniform(change_min, change_max)
    return MetricValue(current=current, change_percentage=change_percentage)

def generate_role_metrics(base_values: Dict[str, float] = None) -> Dict[str, MetricValue]:
    """Generate metrics for each user role"""
    roles = [r.value for r in UserRole if r != UserRole.ADMIN]
    
    if base_values is None:
        base_values = {role: random.uniform(0, 100) for role in roles}
    
    return {
        role: generate_demo_metric_value(base_value=base_values.get(role))
        for role in roles
    }

def generate_sector_metrics() -> Dict[str, MetricValue]:
    """Generate metrics for each sector"""
    sectors = ["Technology", "Healthcare", "Real Estate", "Finance", "Energy", "Consumer"]
    
    return {
        sector: generate_demo_metric_value()
        for sector in sectors
    }

def generate_demo_kpi_dashboard(period: PeriodFilter = PeriodFilter.LAST_30_DAYS) -> ComprehensiveKPIDashboard:
    """Generate a comprehensive demo KPI dashboard"""
    # Base values - adjust these to make the demo data more realistic
    total_users = 1200
    active_users = 850
    new_users_base = 75 if period == PeriodFilter.LAST_7_DAYS else 250
    
    # User distribution by role (percentages)
    role_distribution = {
        UserRole.FUND_MANAGER.value: 0.3,
        UserRole.CAPITAL_RAISER.value: 0.25,
        UserRole.LIMITED_PARTNER.value: 0.45
    }
    
    # Calculate users by role
    users_by_role = {role: int(total_users * pct) for role, pct in role_distribution.items()}
    new_users_by_role = {role: int(new_users_base * pct) for role, pct in role_distribution.items()}
    
    # Generate dashboard data
    return ComprehensiveKPIDashboard(
        # User Growth & Profile Engagement
        user_growth=UserGrowthMetrics(
            new_registrations={role: MetricValue(current=count, change_percentage=random.uniform(5, 15)) 
                              for role, count in new_users_by_role.items()},
            profile_completion_rate={
                UserRole.FUND_MANAGER.value: generate_demo_metric_value(base_value=92, min_val=70, max_val=100),
                UserRole.CAPITAL_RAISER.value: generate_demo_metric_value(base_value=88, min_val=65, max_val=100),
                UserRole.LIMITED_PARTNER.value: generate_demo_metric_value(base_value=85, min_val=60, max_val=100)
            },
            active_inactive_ratio=MetricValue(
                current=active_users / (total_users - active_users),
                change_percentage=random.uniform(-5, 10)
            ),
            verification_completion_rate=generate_demo_metric_value(base_value=78, min_val=60, max_val=100)
        ),
        
        # Contact & Networking Activity
        networking=NetworkingMetrics(
            contacts_uploaded={
                UserRole.FUND_MANAGER.value: generate_demo_metric_value(base_value=45, min_val=10, max_val=100),
                UserRole.CAPITAL_RAISER.value: generate_demo_metric_value(base_value=120, min_val=50, max_val=200),
                UserRole.LIMITED_PARTNER.value: generate_demo_metric_value(base_value=30, min_val=5, max_val=80)
            },
            introductions_made=generate_demo_metric_value(base_value=560, min_val=100, max_val=1000),
            contact_conversion_rate=generate_demo_metric_value(base_value=24, min_val=10, max_val=40),
            network_growth_rate={
                UserRole.FUND_MANAGER.value: generate_demo_metric_value(base_value=8, min_val=2, max_val=15),
                UserRole.CAPITAL_RAISER.value: generate_demo_metric_value(base_value=12, min_val=5, max_val=20),
                UserRole.LIMITED_PARTNER.value: generate_demo_metric_value(base_value=6, min_val=1, max_val=12)
            }
        ),
        
        # Matching Algorithm KPIs
        matching_algorithm=MatchingAlgorithmMetrics(
            total_matches_generated=generate_demo_metric_value(base_value=1800, min_val=500, max_val=5000),
            average_match_score=generate_demo_metric_value(base_value=72, min_val=50, max_val=95),
            high_confidence_match_percentage=generate_demo_metric_value(base_value=35, min_val=20, max_val=60),
            match_acceptance_rate={
                UserRole.FUND_MANAGER.value: generate_demo_metric_value(base_value=68, min_val=40, max_val=90),
                UserRole.CAPITAL_RAISER.value: generate_demo_metric_value(base_value=72, min_val=45, max_val=90),
                UserRole.LIMITED_PARTNER.value: generate_demo_metric_value(base_value=65, min_val=40, max_val=85)
            },
            match_engagement_rate=generate_demo_metric_value(base_value=42, min_val=20, max_val=70),
            time_to_first_match=generate_demo_metric_value(base_value=2.5, min_val=1, max_val=7),  # days
            user_reported_match_quality=generate_demo_metric_value(base_value=4.1, min_val=3, max_val=5)  # out of 5
        ),
        
        # Meetings & Deal Flow
        deal_flow=DealFlowMetrics(
            meetings_scheduled=generate_demo_metric_value(base_value=380, min_val=100, max_val=800),
            meeting_completion_rate=generate_demo_metric_value(base_value=83, min_val=70, max_val=95),
            deal_conversion_rate=generate_demo_metric_value(base_value=21, min_val=10, max_val=40),
            average_deal_size=generate_demo_metric_value(base_value=5200000, min_val=1000000, max_val=10000000),  # $5.2M
            time_from_match_to_deal=generate_demo_metric_value(base_value=45, min_val=20, max_val=90)  # days
        ),
        
        # Sector & Role-Based Insights
        sector_insights=SectorMetrics(
            deals_per_sector={
                "Technology": generate_demo_metric_value(base_value=42, min_val=10, max_val=100),
                "Healthcare": generate_demo_metric_value(base_value=28, min_val=5, max_val=80),
                "Real Estate": generate_demo_metric_value(base_value=35, min_val=10, max_val=90),
                "Finance": generate_demo_metric_value(base_value=23, min_val=5, max_val=70),
                "Energy": generate_demo_metric_value(base_value=18, min_val=5, max_val=60),
                "Consumer": generate_demo_metric_value(base_value=16, min_val=5, max_val=50)
            },
            fund_manager_success_rate=generate_demo_metric_value(base_value=32, min_val=15, max_val=60),
            capital_raiser_conversion=generate_demo_metric_value(base_value=28, min_val=10, max_val=50),
            limited_partner_investment_activity=generate_demo_metric_value(base_value=3.2, min_val=1, max_val=8)  # avg deals
        ),
        
        # Subscription & Monetization Metrics
        monetization=MonetizationMetrics(
            user_tier_distribution={
                "Basic": {
                    UserRole.FUND_MANAGER.value: int(users_by_role[UserRole.FUND_MANAGER.value] * 0.4),
                    UserRole.CAPITAL_RAISER.value: int(users_by_role[UserRole.CAPITAL_RAISER.value] * 0.3),
                    UserRole.LIMITED_PARTNER.value: int(users_by_role[UserRole.LIMITED_PARTNER.value] * 0.5)
                },
                "Pro": {
                    UserRole.FUND_MANAGER.value: int(users_by_role[UserRole.FUND_MANAGER.value] * 0.5),
                    UserRole.CAPITAL_RAISER.value: int(users_by_role[UserRole.CAPITAL_RAISER.value] * 0.6),
                    UserRole.LIMITED_PARTNER.value: int(users_by_role[UserRole.LIMITED_PARTNER.value] * 0.4)
                },
                "Enterprise": {
                    UserRole.FUND_MANAGER.value: int(users_by_role[UserRole.FUND_MANAGER.value] * 0.1),
                    UserRole.CAPITAL_RAISER.value: int(users_by_role[UserRole.CAPITAL_RAISER.value] * 0.1),
                    UserRole.LIMITED_PARTNER.value: int(users_by_role[UserRole.LIMITED_PARTNER.value] * 0.1)
                }
            },
            upgrade_rate=generate_demo_metric_value(base_value=8.2, min_val=3, max_val=15),
            downgrade_rate=generate_demo_metric_value(base_value=2.4, min_val=1, max_val=8),
            renewal_rate=generate_demo_metric_value(base_value=78, min_val=60, max_val=95),
            churn_rate=generate_demo_metric_value(base_value=4.8, min_val=2, max_val=12),
            average_revenue_per_active_user=generate_demo_metric_value(base_value=125, min_val=50, max_val=250)  # $125/mo
        ),
        
        # Satisfaction & Support
        satisfaction=SatisfactionMetrics(
            user_satisfaction_score={
                UserRole.FUND_MANAGER.value: generate_demo_metric_value(base_value=4.2, min_val=3, max_val=5),  # out of 5
                UserRole.CAPITAL_RAISER.value: generate_demo_metric_value(base_value=4.1, min_val=3, max_val=5),
                UserRole.LIMITED_PARTNER.value: generate_demo_metric_value(base_value=4.3, min_val=3, max_val=5)
            },
            net_promoter_score=generate_demo_metric_value(base_value=42, min_val=0, max_val=70),  # -100 to 100
            support_tickets=generate_demo_metric_value(base_value=85, min_val=20, max_val=200),
            avg_resolution_time=generate_demo_metric_value(base_value=8.2, min_val=1, max_val=24),  # hours
            match_dispute_rate=generate_demo_metric_value(base_value=1.8, min_val=0.5, max_val=5)  # percentage
        ),
        
        # Additional Engagement Indicators
        engagement=EngagementMetrics(
            profile_visits={
                UserRole.FUND_MANAGER.value: generate_demo_metric_value(base_value=950, min_val=200, max_val=2000),
                UserRole.CAPITAL_RAISER.value: generate_demo_metric_value(base_value=1250, min_val=300, max_val=3000),
                UserRole.LIMITED_PARTNER.value: generate_demo_metric_value(base_value=780, min_val=150, max_val=1500)
            },
            message_response_time=generate_demo_metric_value(base_value=3.2, min_val=0.5, max_val=12),  # hours
            repeat_deals=generate_demo_metric_value(base_value=28, min_val=5, max_val=100)
        ),
        
        # Performance & Scalability
        performance=PerformanceMetrics(
            match_generation_latency=generate_demo_metric_value(base_value=0.8, min_val=0.1, max_val=5),  # seconds
            api_response_times=generate_demo_metric_value(base_value=0.25, min_val=0.05, max_val=2),  # seconds
            system_uptime=generate_demo_metric_value(base_value=99.8, min_val=95, max_val=100),  # percentage
            error_rate=generate_demo_metric_value(base_value=0.12, min_val=0.01, max_val=1)  # percentage
        )
    )

# --- API Endpoints ---

@router.get("/kpi-dashboard")
async def get_comprehensive_analytics(period: PeriodFilter = PeriodFilter.LAST_30_DAYS):
    """Get comprehensive KPI analytics dashboard
    
    This endpoint provides a complete view of platform performance across all KPI categories:
    - User Growth & Profile Engagement
    - Contact & Networking Activity
    - Matching Algorithm KPIs
    - Meetings & Deal Flow
    - Sector & Role-Based Insights
    - Subscription & Monetization Metrics
    - Satisfaction & Support
    - Additional Engagement Indicators
    - Performance & Scalability
    
    Args:
        period: Time period filter for analytics data
        
    Returns:
        ComprehensiveKPIDashboard with all platform KPIs
    """
    try:
        # In a production environment, you would fetch real data from your database
        # For now, generate demo data that follows realistic patterns
        dashboard = generate_demo_kpi_dashboard(period)
        return dashboard
    except Exception as e:
        print(f"Error getting comprehensive analytics: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving analytics dashboard: {str(e)}"
        ) from e
