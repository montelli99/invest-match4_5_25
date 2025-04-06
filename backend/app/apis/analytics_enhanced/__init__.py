from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from fastapi import APIRouter, HTTPException, Depends, Query
from datetime import datetime, timedelta
import random
from enum import Enum
import json

class UserType(str, Enum):
    """Types of users in the system"""
    FUND_MANAGER = "fund_manager"
    LIMITED_PARTNER = "limited_partner"
    CAPITAL_RAISER = "capital_raiser"

class BaseProfile(BaseModel):
    """Base profile model with common fields"""
    model_config = {"arbitrary_types_allowed": True}
    
    user_id: str
    user_type: UserType
    name: str
    company: str
    email: str
import databutton as db
import json
from enum import Enum


router = APIRouter()


class EngagementTrend(BaseModel):
    """Trend data for a metric"""
    model_config = {"arbitrary_types_allowed": True}

    current: float
    previous: float
    change_percentage: float


class SectorAnalytics(BaseModel):
    """Analytics for sector performance"""
    model_config = {"arbitrary_types_allowed": True}
    sector_name: str
    total_introductions: int
    successful_introductions: int
    average_response_time: float  # hours
    total_meetings: int
    capital_raised: float  # if applicable

class IntroductionMetrics(BaseModel):
    """Metrics for introductions and meetings"""
    model_config = {"arbitrary_types_allowed": True}
    total_introductions: int
    successful_introductions: int
    average_response_time: float  # hours
    meeting_conversion_rate: float
    top_introducers: List[Dict[str, Any]]  # List of {user_id, name, success_rate}
    average_time_to_meeting: float  # days

class FundraisingMetrics(BaseModel):
    """Metrics for fundraising success"""
    model_config = {"arbitrary_types_allowed": True}
    total_capital_raised: float
    number_of_deals: int
    average_deal_size: float
    success_rate: float
    average_time_to_close: float  # days
    deals_by_fund_type: Dict[str, int]
    capital_by_fund_type: Dict[str, float]

class MatchAnalytics(BaseModel):
    """Analytics for matches"""
    model_config = {"arbitrary_types_allowed": True}
    total_matches: int
    accepted_matches: int
    declined_matches: int
    pending_matches: int
    match_response_rate: float
    average_match_quality: float
    top_matching_sectors: List[str]
    sector_analytics: List[SectorAnalytics]
    introduction_metrics: IntroductionMetrics
    fundraising_metrics: FundraisingMetrics


class EngagementMetrics(BaseModel):
    model_config = {"arbitrary_types_allowed": True}
    profile_views: EngagementTrend
    profile_view_history: List[int]  # Daily views for the last 30 days
    message_response_rate: EngagementTrend
    total_connections: EngagementTrend
    active_conversations: EngagementTrend
    average_response_time: float


class MatchRecommendation(BaseModel):
    model_config = {"arbitrary_types_allowed": True}
    uid: str
    name: str
    company: str
    match_percentage: float
    role: str
    mutual_connections: int


class TimelineActivity(BaseModel):
    model_config = {"arbitrary_types_allowed": True}
    activity_type: str  # 'view', 'message', 'connection', 'match'
    timestamp: str
    description: str


class ExportFormat(BaseModel):
    """Format options for analytics export"""
    model_config = {"arbitrary_types_allowed": True}

    start_date: str  # ISO format date string
    end_date: str    # ISO format date string
    format: str = "csv"  # csv, json, pdf
    metrics: List[str]


class FundManagerMetrics(BaseModel):
    """Metrics for fund manager comparison"""
    model_config = {"arbitrary_types_allowed": True}
    fund_size: float
    historical_returns: float
    risk_score: float
    investment_horizon: int
    sector_focus: List[str]
    track_record_years: int
    total_investments: int
    successful_exits: int

class PortfolioMetrics(BaseModel):
    """Portfolio analysis metrics"""
    model_config = {"arbitrary_types_allowed": True}
    total_value: float
    total_investments: int
    avg_investment_size: float
    sector_distribution: Dict[str, float]  # Sector -> Percentage
    risk_distribution: Dict[str, float]  # Risk Level -> Percentage
    historical_performance: List[float]  # Monthly returns
    current_opportunities: int

class InvestmentOpportunity(BaseModel):
    """Investment opportunity details"""
    model_config = {"arbitrary_types_allowed": True}
    id: str
    fund_name: str
    manager_name: str
    type: str
    size: float
    min_investment: float
    target_return: float
    risk_level: str
    sector: str
    match_score: float
    status: str  # 'open', 'closing_soon', 'closed'

class LPAnalytics(BaseModel):
    """Limited Partner specific analytics"""
    model_config = {"arbitrary_types_allowed": True}
    portfolio_metrics: PortfolioMetrics
    tracked_opportunities: List[InvestmentOpportunity]
    fund_manager_comparisons: List[FundManagerMetrics]
    risk_appetite_match: float  # How well current investments match stated risk appetite
    sector_alignment: float  # How well investments align with stated sector preferences
    investment_pace: float  # Comparison of investment rate to stated goals

class AnalyticsSummary(BaseModel):
    model_config = {"arbitrary_types_allowed": True}
    last_updated: str  # ISO format timestamp
    engagement_metrics: EngagementMetrics
    recent_matches: List[MatchRecommendation]
    recent_activities: List[TimelineActivity]
    weekly_views: List[int]  # Last 7 days of profile views
    match_analytics: MatchAnalytics
    lp_analytics: Optional[LPAnalytics] = None  # Only present for Limited Partner users


def get_demo_lp_analytics() -> LPAnalytics:
    """Generate demo LP analytics data"""
    # Demo portfolio metrics
    portfolio = PortfolioMetrics(
        total_value=random.uniform(5000000, 50000000),
        total_investments=random.randint(5, 20),
        avg_investment_size=random.uniform(500000, 2000000),
        sector_distribution={
            "Technology": 0.3,
            "Healthcare": 0.25,
            "Finance": 0.2,
            "Real Estate": 0.15,
            "Energy": 0.1
        },
        risk_distribution={
            "Low": 0.2,
            "Medium": 0.5,
            "High": 0.3
        },
        historical_performance=[random.uniform(-0.05, 0.15) for _ in range(12)],
        current_opportunities=random.randint(3, 10)
    )

    # Demo opportunities
    opportunities = [
        InvestmentOpportunity(
            id=f"opp_{i}",
            fund_name=f"Demo Fund {i}",
            manager_name=f"Manager {i}",
            type=random.choice(["Venture", "Growth", "Buyout", "Real Estate"]),
            size=random.uniform(1000000, 10000000),
            min_investment=random.uniform(100000, 500000),
            target_return=random.uniform(0.1, 0.3),
            risk_level=random.choice(["Low", "Medium", "High"]),
            sector=random.choice(["Technology", "Healthcare", "Finance", "Real Estate", "Energy"]),
            match_score=random.uniform(0.7, 1.0),
            status=random.choice(["open", "closing_soon", "closed"])
        )
        for i in range(5)
    ]

    # Demo fund manager comparisons
    comparisons = [
        FundManagerMetrics(
            fund_size=random.uniform(10000000, 100000000),
            historical_returns=random.uniform(0.1, 0.3),
            risk_score=random.uniform(1, 5),
            investment_horizon=random.randint(3, 10),
            sector_focus=[random.choice(["Technology", "Healthcare", "Finance", "Real Estate", "Energy"]) for _ in range(2)],
            track_record_years=random.randint(5, 20),
            total_investments=random.randint(20, 100),
            successful_exits=random.randint(5, 30)
        )
        for _ in range(3)
    ]

    return LPAnalytics(
        portfolio_metrics=portfolio,
        tracked_opportunities=opportunities,
        fund_manager_comparisons=comparisons,
        risk_appetite_match=random.uniform(0.7, 1.0),
        sector_alignment=random.uniform(0.7, 1.0),
        investment_pace=random.uniform(0.7, 1.0)
    )

def generate_demo_sector_analytics() -> List[SectorAnalytics]:
    """Generate demo sector analytics"""
    sectors = ["Technology", "Healthcare", "Finance", "Real Estate", "Energy"]
    return [
        SectorAnalytics(
            sector_name=sector,
            total_introductions=random.randint(20, 100),
            successful_introductions=random.randint(10, 50),
            average_response_time=random.uniform(1, 48),
            total_meetings=random.randint(5, 30),
            capital_raised=random.uniform(1000000, 10000000)
        ) for sector in sectors
    ]

def generate_demo_introduction_metrics() -> IntroductionMetrics:
    """Generate demo introduction metrics"""
    total_intros = random.randint(50, 200)
    successful_intros = random.randint(20, min(total_intros, 100))
    
    return IntroductionMetrics(
        total_introductions=total_intros,
        successful_introductions=successful_intros,
        average_response_time=random.uniform(1, 48),
        meeting_conversion_rate=random.uniform(0.3, 0.8),
        top_introducers=[
            {
                "user_id": f"user_{i}",
                "name": f"Top Introducer {i}",
                "success_rate": random.uniform(0.6, 0.95)
            } for i in range(5)
        ],
        average_time_to_meeting=random.uniform(2, 14)
    )

def generate_demo_fundraising_metrics() -> FundraisingMetrics:
    """Generate demo fundraising metrics"""
    fund_types = ["Venture", "Growth", "Buyout", "Real Estate"]
    deals_by_type = {ft: random.randint(2, 10) for ft in fund_types}
    capital_by_type = {ft: random.uniform(5000000, 50000000) for ft in fund_types}
    
    return FundraisingMetrics(
        total_capital_raised=sum(capital_by_type.values()),
        number_of_deals=sum(deals_by_type.values()),
        average_deal_size=sum(capital_by_type.values()) / sum(deals_by_type.values()),
        success_rate=random.uniform(0.2, 0.5),
        average_time_to_close=random.uniform(30, 180),
        deals_by_fund_type=deals_by_type,
        capital_by_fund_type=capital_by_type
    )

def get_demo_analytics(user: BaseProfile) -> AnalyticsSummary:
    """Generate demo analytics data for testing"""
    try:
        # Get role-specific analytics based on user type
        role = user.user_type
        
        # LP analytics only for Limited Partners
        lp_analytics = get_demo_lp_analytics() if role == UserType.LIMITED_PARTNER else None
        
        # Adjust metrics based on user role
        if role == UserType.FUND_MANAGER:
            # Fund managers see more investment-focused metrics
            engagement_multiplier = 1.2
            match_quality_threshold = 0.9
        elif role == UserType.LIMITED_PARTNER:
            # LPs see more portfolio-focused metrics
            engagement_multiplier = 1.0
            match_quality_threshold = 0.85
        elif role == UserType.CAPITAL_RAISER:
            # Capital raisers see more network-focused metrics
            engagement_multiplier = 1.5
            match_quality_threshold = 0.8
        else:
            engagement_multiplier = 1.0
            match_quality_threshold = 0.85
            
        # Demo metrics with trends
        current_views = int(random.randint(50, 200) * engagement_multiplier)
        previous_views = int(random.randint(30, 150) * engagement_multiplier)
        current_response = min(1.0, random.uniform(0.7, 0.95) * engagement_multiplier)
        previous_response = min(1.0, random.uniform(0.6, 0.9) * engagement_multiplier)
        current_connections = int(random.randint(20, 100) * engagement_multiplier)
        previous_connections = int(random.randint(15, 80) * engagement_multiplier)
        current_active = int(random.randint(5, 15) * engagement_multiplier)
        previous_active = int(random.randint(3, 12) * engagement_multiplier)

        # Create match analytics with enhanced metrics adjusted for role
        total_matches = int(random.randint(50, 200) * engagement_multiplier)
        accepted = int(random.randint(20, min(total_matches, 100)))
        declined = int(random.randint(5, 30))
        pending = total_matches - accepted - declined
        
        match_analytics = MatchAnalytics(
            total_matches=total_matches,
            accepted_matches=accepted,
            declined_matches=declined,
            pending_matches=pending,
            match_response_rate=min(1.0, random.uniform(0.6, 0.9) * engagement_multiplier),
            average_match_quality=min(1.0, random.uniform(match_quality_threshold, 0.98)),
            top_matching_sectors=["Technology", "Healthcare", "Finance", "Real Estate"],
            sector_analytics=generate_demo_sector_analytics(),
            introduction_metrics=generate_demo_introduction_metrics(),
            fundraising_metrics=generate_demo_fundraising_metrics()
        )

        # Demo engagement metrics
        engagement = EngagementMetrics(
            profile_views=EngagementTrend(
                current=current_views,
                previous=previous_views,
                change_percentage=(((current_views - previous_views) / previous_views * 100) if previous_views > 0 else 0),
            ),
            profile_view_history=[random.randint(5, 30) for _ in range(30)],
            message_response_rate=EngagementTrend(
                current=current_response,
                previous=previous_response,
                change_percentage=(
                    ((current_response - previous_response) / previous_response * 100) if previous_response > 0 else 0
                ),
            ),
            total_connections=EngagementTrend(
                current=current_connections,
                previous=previous_connections,
                change_percentage=(
                    ((current_connections - previous_connections) / previous_connections * 100)
                    if previous_connections > 0
                    else 0
                ),
            ),
            active_conversations=EngagementTrend(
                current=current_active,
                previous=previous_active,
                change_percentage=(
                    ((current_active - previous_active) / previous_active * 100) if previous_active > 0 else 0
                ),
            ),
            average_response_time=random.uniform(1, 24),
        )

        # Demo match recommendations
        company_prefixes = ["Global", "Peak", "Blue", "First", "Capital"]
        company_suffixes = ["Ventures", "Capital", "Partners", "Investments", "Fund"]
        roles = ["Fund Manager", "Limited Partner", "Capital Raiser"]

        matches = [
            MatchRecommendation(
                uid=f"user_{i}",
                name=f"Demo User {i}",
                company=f"{random.choice(company_prefixes)} {random.choice(company_suffixes)}",
                match_percentage=random.uniform(0.85, 0.98),
                role=random.choice(roles),
                mutual_connections=random.randint(1, 10),
            )
            for i in range(5)
        ]

        # Demo timeline activities
        activity_types = [
            ("view", "viewed your profile"),
            ("message", "sent you a message"),
            ("connection", "connected with you"),
            ("match", "was recommended as a match"),
        ]

        now = datetime.now()
        activities = [
            TimelineActivity(
                activity_type=activity_type,
                timestamp=(now - timedelta(hours=random.randint(1, 72))).isoformat(),
                description=f"A {random.choice(roles)} {description}",
            )
            for activity_type, description in activity_types
        ]
        activities.sort(key=lambda x: x.timestamp, reverse=True)

        # Demo weekly views
        weekly_views = [random.randint(5, 30) for _ in range(7)]

        # Get LP analytics if profile type is LP
        lp_analytics = get_demo_lp_analytics() if True else None  # TODO: Check actual user type

        return AnalyticsSummary(
            last_updated=datetime.now().isoformat(),
            engagement_metrics=engagement,
            recent_matches=matches,
            recent_activities=activities,
            weekly_views=weekly_views,
            match_analytics=match_analytics,
            lp_analytics=lp_analytics
        )
    except Exception as e:
        print(f"Error generating analytics: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error generating analytics data"
        ) from e


@router.get("/analytics/summary")
def get_analytics_summary() -> AnalyticsSummary:
    """Get analytics summary for the current user"""
    try:
        # For now, return demo data with a dummy profile
        # In production, this would fetch real analytics data
        analytics = get_demo_analytics(BaseProfile(
            user_id="demo_user",
            email="demo@example.com",
            name="Demo User",
            company="Demo Company",
            user_type=UserType.FUND_MANAGER
        ))
        
        # Add last_updated timestamp
        analytics.last_updated = datetime.now().isoformat()
        
        return analytics

    except Exception as e:
        print(f"Error getting analytics: {str(e)}")
        raise HTTPException(status_code=500, detail="Error getting analytics") from e


class MetricWithChange(BaseModel):
    """Metric with current value and change percentage"""
    model_config = {"arbitrary_types_allowed": True}
    current: float
    change_percentage: float

# User growth metrics
class UserGrowthMetrics(BaseModel):
    """User growth and onboarding metrics"""
    model_config = {"arbitrary_types_allowed": True}
    new_registrations: Dict[str, MetricWithChange]
    profile_completion_rate: Dict[str, MetricWithChange]
    active_inactive_ratio: MetricWithChange
    verification_completion_rate: MetricWithChange

# Networking metrics
class NetworkingMetrics(BaseModel):
    """Networking and contact management metrics"""
    model_config = {"arbitrary_types_allowed": True}
    contacts_uploaded: Dict[str, MetricWithChange]
    introductions_made: MetricWithChange
    contact_conversion_rate: MetricWithChange
    network_growth_rate: Dict[str, MetricWithChange]

# Matching algorithm metrics
class MatchingAlgorithmMetrics(BaseModel):
    """Matching algorithm performance metrics"""
    model_config = {"arbitrary_types_allowed": True}
    total_matches_generated: MetricWithChange
    average_match_score: MetricWithChange
    high_confidence_match_percentage: MetricWithChange
    match_acceptance_rate: Dict[str, MetricWithChange]
    match_engagement_rate: MetricWithChange
    time_to_first_match: MetricWithChange
    user_reported_match_quality: MetricWithChange

# Deal flow metrics
class DealFlowMetrics(BaseModel):
    """Deal flow and meeting metrics"""
    model_config = {"arbitrary_types_allowed": True}
    meetings_scheduled: MetricWithChange
    meeting_completion_rate: MetricWithChange
    deal_conversion_rate: MetricWithChange
    average_deal_size: MetricWithChange
    time_from_match_to_deal: MetricWithChange

# Sector insights metrics
class SectorInsightsMetrics(BaseModel):
    """Sector-specific performance metrics"""
    model_config = {"arbitrary_types_allowed": True}
    deals_per_sector: Dict[str, MetricWithChange]
    fund_manager_success_rate: MetricWithChange
    capital_raiser_conversion: MetricWithChange
    limited_partner_investment_activity: MetricWithChange

# Monetization metrics
class MonetizationMetrics(BaseModel):
    """Subscription and revenue metrics"""
    model_config = {"arbitrary_types_allowed": True}
    user_tier_distribution: Dict[str, Dict[str, float]]
    upgrade_rate: MetricWithChange
    downgrade_rate: MetricWithChange
    renewal_rate: MetricWithChange
    churn_rate: MetricWithChange
    average_revenue_per_active_user: MetricWithChange

# User satisfaction metrics
class SatisfactionMetrics(BaseModel):
    """User satisfaction and support metrics"""
    model_config = {"arbitrary_types_allowed": True}
    user_satisfaction_score: Dict[str, MetricWithChange]
    net_promoter_score: MetricWithChange
    support_tickets: MetricWithChange
    avg_resolution_time: MetricWithChange
    match_dispute_rate: MetricWithChange

# System performance metrics
class PerformanceMetrics(BaseModel):
    """System performance and reliability metrics"""
    model_config = {"arbitrary_types_allowed": True}
    match_generation_latency: MetricWithChange
    api_response_times: MetricWithChange
    system_uptime: MetricWithChange
    error_rate: MetricWithChange

# Comprehensive analytics response
class ComprehensiveAnalyticsResponse(BaseModel):
    """Comprehensive analytics for all KPIs"""
    model_config = {"arbitrary_types_allowed": True}
    user_growth: UserGrowthMetrics
    networking: NetworkingMetrics
    matching_algorithm: MatchingAlgorithmMetrics
    deal_flow: DealFlowMetrics
    sector_insights: SectorInsightsMetrics
    monetization: MonetizationMetrics
    satisfaction: SatisfactionMetrics
    performance: PerformanceMetrics
    last_updated: datetime = Field(default_factory=datetime.now)

# Helper function to generate realistic looking metrics with change
def generate_metric_with_change(base_value, min_value=0, max_value=None, is_percentage=False):
    """Generate a metric with realistic change percentage"""
    # Add some randomness to the base value
    current = base_value * random.uniform(0.8, 1.2)
    
    # Ensure the value is within bounds
    if min_value is not None and current < min_value:
        current = min_value
    if max_value is not None and current > max_value:
        current = max_value
        
    # Round percentages to 1 decimal place
    if is_percentage:
        current = round(current, 1)
    # Round regular values to whole numbers
    else:
        current = round(current)
        
    # Generate change percentage between -15% and +25%
    change_percentage = random.uniform(-15, 25)
    change_percentage = round(change_percentage, 1)
    
    return MetricWithChange(current=current, change_percentage=change_percentage)

# Helper function to generate metrics by role
def generate_metrics_by_role(base_values):
    """Generate metrics for each user role"""
    return {
        "fund_manager": generate_metric_with_change(base_values["fund_manager"]),
        "capital_raiser": generate_metric_with_change(base_values["capital_raiser"]),
        "limited_partner": generate_metric_with_change(base_values["limited_partner"])
    }

# Helper function to generate percentage metrics by role
def generate_percentage_metrics_by_role(base_values):
    """Generate percentage metrics for each user role"""
    return {
        "fund_manager": generate_metric_with_change(base_values["fund_manager"], min_value=0, max_value=100, is_percentage=True),
        "capital_raiser": generate_metric_with_change(base_values["capital_raiser"], min_value=0, max_value=100, is_percentage=True),
        "limited_partner": generate_metric_with_change(base_values["limited_partner"], min_value=0, max_value=100, is_percentage=True)
    }

@router.get("/comprehensive")
def get_comprehensive_analytics(period: str = Query("30d", description="Time period for analytics (7d, 30d, 90d, 12m, ytd, all)")) -> ComprehensiveAnalyticsResponse:
    """Get comprehensive analytics for all KPIs across the platform"""
    
    # Check if we have cached data for this period
    cache_key = f"comprehensive_analytics_{period}"
    try:
        cached_data = db.storage.json.get(cache_key)
        # Only use cache if it's less than 1 hour old
        if cached_data and (datetime.now() - datetime.fromisoformat(cached_data["last_updated"])) < timedelta(hours=1):
            return ComprehensiveAnalyticsResponse(**cached_data)
    except Exception as e:
        print(f"Error retrieving cached analytics: {str(e)}")  # If there's any error with cache, we'll just generate new data
    
    # User Growth Metrics
    user_growth = UserGrowthMetrics(
        new_registrations=generate_metrics_by_role({
            "fund_manager": 125,
            "capital_raiser": 180,
            "limited_partner": 210
        }),
        profile_completion_rate=generate_percentage_metrics_by_role({
            "fund_manager": 78,
            "capital_raiser": 82,
            "limited_partner": 65
        }),
        active_inactive_ratio=generate_metric_with_change(3.5),
        verification_completion_rate=generate_metric_with_change(68, min_value=0, max_value=100, is_percentage=True)
    )
    
    # Networking Metrics
    networking = NetworkingMetrics(
        contacts_uploaded=generate_metrics_by_role({
            "fund_manager": 350,
            "capital_raiser": 620,
            "limited_partner": 180
        }),
        introductions_made=generate_metric_with_change(420),
        contact_conversion_rate=generate_metric_with_change(23, min_value=0, max_value=100, is_percentage=True),
        network_growth_rate=generate_percentage_metrics_by_role({
            "fund_manager": 18,
            "capital_raiser": 25,
            "limited_partner": 12
        })
    )
    
    # Matching Algorithm Metrics
    matching_algorithm = MatchingAlgorithmMetrics(
        total_matches_generated=generate_metric_with_change(1850),
        average_match_score=generate_metric_with_change(62, min_value=0, max_value=100, is_percentage=True),
        high_confidence_match_percentage=generate_metric_with_change(35, min_value=0, max_value=100, is_percentage=True),
        match_acceptance_rate=generate_percentage_metrics_by_role({
            "fund_manager": 48,
            "capital_raiser": 65,
            "limited_partner": 52
        }),
        match_engagement_rate=generate_metric_with_change(42, min_value=0, max_value=100, is_percentage=True),
        time_to_first_match=generate_metric_with_change(3.2),
        user_reported_match_quality=generate_metric_with_change(3.8, min_value=1, max_value=5)
    )
    
    # Deal Flow Metrics
    deal_flow = DealFlowMetrics(
        meetings_scheduled=generate_metric_with_change(580),
        meeting_completion_rate=generate_metric_with_change(78, min_value=0, max_value=100, is_percentage=True),
        deal_conversion_rate=generate_metric_with_change(22, min_value=0, max_value=100, is_percentage=True),
        average_deal_size=generate_metric_with_change(850000),
        time_from_match_to_deal=generate_metric_with_change(45)
    )
    
    # Sector Insights Metrics
    sector_insights = SectorInsightsMetrics(
        deals_per_sector={
            "Technology": generate_metric_with_change(85),
            "Healthcare": generate_metric_with_change(65),
            "Real Estate": generate_metric_with_change(48),
            "Energy": generate_metric_with_change(32),
            "Financial Services": generate_metric_with_change(58),
            "Consumer Goods": generate_metric_with_change(22)
        },
        fund_manager_success_rate=generate_metric_with_change(38, min_value=0, max_value=100, is_percentage=True),
        capital_raiser_conversion=generate_metric_with_change(42, min_value=0, max_value=100, is_percentage=True),
        limited_partner_investment_activity=generate_metric_with_change(2.3)
    )
    
    # Monetization Metrics
    monetization = MonetizationMetrics(
        user_tier_distribution={
            "Free": {
                "fund_manager": 220,
                "capital_raiser": 350,
                "limited_partner": 280
            },
            "Basic": {
                "fund_manager": 180,
                "capital_raiser": 220,
                "limited_partner": 150
            },
            "Professional": {
                "fund_manager": 110,
                "capital_raiser": 130,
                "limited_partner": 75
            },
            "Enterprise": {
                "fund_manager": 45,
                "capital_raiser": 30,
                "limited_partner": 25
            }
        },
        upgrade_rate=generate_metric_with_change(18, min_value=0, max_value=100, is_percentage=True),
        downgrade_rate=generate_metric_with_change(7, min_value=0, max_value=100, is_percentage=True),
        renewal_rate=generate_metric_with_change(82, min_value=0, max_value=100, is_percentage=True),
        churn_rate=generate_metric_with_change(12, min_value=0, max_value=100, is_percentage=True),
        average_revenue_per_active_user=generate_metric_with_change(85)
    )
    
    # Satisfaction Metrics
    satisfaction = SatisfactionMetrics(
        user_satisfaction_score=generate_percentage_metrics_by_role({
            "fund_manager": 4.2,
            "capital_raiser": 3.9,
            "limited_partner": 4.3
        }),
        net_promoter_score=generate_metric_with_change(42, min_value=-100, max_value=100),
        support_tickets=generate_metric_with_change(45),
        avg_resolution_time=generate_metric_with_change(12),
        match_dispute_rate=generate_metric_with_change(4.5, min_value=0, max_value=100, is_percentage=True)
    )
    
    # Performance Metrics
    performance = PerformanceMetrics(
        match_generation_latency=generate_metric_with_change(0.8),
        api_response_times=generate_metric_with_change(0.25),
        system_uptime=generate_metric_with_change(99.8, min_value=0, max_value=100, is_percentage=True),
        error_rate=generate_metric_with_change(0.12, min_value=0, max_value=100, is_percentage=True)
    )
    
    # Create the complete response
    analytics = ComprehensiveAnalyticsResponse(
        user_growth=user_growth,
        networking=networking,
        matching_algorithm=matching_algorithm,
        deal_flow=deal_flow,
        sector_insights=sector_insights,
        monetization=monetization,
        satisfaction=satisfaction,
        performance=performance,
        last_updated=datetime.now()
    )
    
    # Cache the analytics for future requests
    try:
        db.storage.json.put(cache_key, json.loads(analytics.model_dump_json()))
    except Exception as e:
        print(f"Error caching analytics: {str(e)}")
    
    return analytics

@router.post("/analytics/export")
def export_analytics(format_options: ExportFormat):
    """Export analytics data in the specified format"""
    try:
        # Validate dates with stricter checks
        try:
            start = datetime.fromisoformat(format_options.start_date)
            end = datetime.fromisoformat(format_options.end_date)
            if end < start:
                raise HTTPException(status_code=400, detail="End date must be after start date")
            if (end - start).days > 365:
                raise HTTPException(status_code=400, detail="Date range cannot exceed 1 year")
            if end > datetime.now():
                raise HTTPException(status_code=400, detail="End date cannot be in the future")
        except ValueError as e:
            raise HTTPException(status_code=400, detail="Invalid date format. Use ISO format (YYYY-MM-DD)") from e

        # Use demo profile directly instead of storage access
        profile = BaseProfile(
            user_id="demo_user",
            email="demo@example.com",
            name="Demo User",
            company="Demo Company",
            user_type=UserType.FUND_MANAGER
        )

        # Get analytics data
        analytics = get_demo_analytics(profile)

        # Filter data based on requested metrics
        filtered_data = {}
        for metric in format_options.metrics:
            if hasattr(analytics, metric):
                value = getattr(analytics, metric)
                if isinstance(value, BaseModel):
                    filtered_data[metric] = value.dict()
                else:
                    filtered_data[metric] = value

        # Return in requested format
        if format_options.format == "json":
            # Check response size
            import json
            json_data = json.dumps(filtered_data)
            if len(json_data.encode('utf-8')) > 6_000_000:  # 6MB limit
                raise HTTPException(status_code=413, detail="Response too large. Please reduce the number of metrics or date range.")
            return filtered_data
            
        elif format_options.format == "csv":
            # Simplified CSV generation
            csv_lines = ["metric,value"]
            for metric, value in filtered_data.items():
                if isinstance(value, (int, float, str)):
                    csv_lines.append(f"{metric},{value}")
                elif isinstance(value, dict):
                    for k, v in value.items():
                        if isinstance(v, (int, float, str)):
                            csv_lines.append(f"{metric}.{k},{v}")
                elif isinstance(value, list) and value and isinstance(value[0], (int, float)):
                    for i, v in enumerate(value):
                        csv_lines.append(f"{metric}[{i}],{v}")
            
            csv_data = "\n".join(csv_lines)
            if len(csv_data.encode('utf-8')) > 6_000_000:  # 6MB limit
                raise HTTPException(status_code=413, detail="Response too large. Please reduce the number of metrics or date range.")
            return csv_data
            
        elif format_options.format == "pdf":
            try:
                from fpdf import FPDF
                
                pdf = FPDF()
                pdf.add_page()
                pdf.set_font("Arial", size=12)
                
                # Add title and date range
                pdf.cell(200, 10, txt="Analytics Report", ln=1, align="C")
                pdf.cell(200, 10, txt=f"Period: {format_options.start_date} to {format_options.end_date}", ln=1, align="C")
                pdf.ln(10)
                
                # Add data with improved formatting
                for metric, value in filtered_data.items():
                    # Add section header
                    pdf.set_font("Arial", 'B', 12)
                    pdf.cell(200, 10, txt=metric.replace('_', ' ').title(), ln=1, align="L")
                    pdf.set_font("Arial", size=10)
                    
                    if isinstance(value, (int, float)):
                        pdf.cell(190, 8, txt=f"{value}", ln=1, align="L")
                    elif isinstance(value, dict):
                        for k, v in value.items():
                            if isinstance(v, (int, float, str)):
                                pdf.cell(190, 8, txt=f"{k}: {v}", ln=1, align="L")
                    elif isinstance(value, list) and value:
                        for i, item in enumerate(value):
                            if isinstance(item, (int, float, str)):
                                pdf.cell(190, 8, txt=f"{i+1}. {item}", ln=1, align="L")
                    
                    pdf.ln(5)
                
                pdf_data = pdf.output(dest="S").encode("latin1")
                if len(pdf_data) > 6_000_000:  # 6MB limit
                    raise HTTPException(status_code=413, detail="Response too large. Please reduce the number of metrics or date range.")
                return pdf_data
                
            except ImportError as e:
                raise HTTPException(status_code=501, detail="PDF export not available") from e
            except Exception as pdf_error:
                print(f"Error generating PDF: {str(pdf_error)}")
                raise HTTPException(status_code=500, detail="Error generating PDF report") from pdf_error
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported format: {format_options.format}")

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error exporting analytics: {str(e)}")
        raise HTTPException(status_code=500, detail="Error exporting analytics") from e
