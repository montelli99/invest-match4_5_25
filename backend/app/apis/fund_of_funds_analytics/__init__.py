from fastapi import APIRouter, Depends, Header, HTTPException, Query
from typing import Dict, List, Optional, Any
from pydantic import BaseModel
import databutton as db
import json
import pandas as pd
from datetime import datetime, timedelta

# Import shared models
from app.apis.models import UserType, FundType, InvestmentFocus

# Create router
router = APIRouter(prefix="/fund-of-funds-analytics", tags=["fund-of-funds-analytics"])

# Models
class FundManagerPerformanceMetrics(BaseModel):
    fund_id: str
    fund_name: str
    fund_type: FundType
    historical_returns: float
    risk_adjusted_returns: float
    performance_percentile: float  # Percentile rank among similar funds
    consistency_score: float  # Consistency of performance
    sharpe_ratio: Optional[float] = None
    sortino_ratio: Optional[float] = None
    drawdown_metrics: Dict[str, float]
    three_year_returns: Optional[float] = None
    five_year_returns: Optional[float] = None
    aum_growth_rate: float
    lp_satisfaction_score: Optional[float] = None
    fund_manager_experience: int  # Years
    team_stability_score: float
    investment_strategy_alignment: Dict[str, float]  # Alignment with FOF interests
    due_diligence_score: float
    tier_ranking: str  # A, B, C, D ranking based on aggregate metrics
    
    model_config = {"arbitrary_types_allowed": True}

class LPInvestmentPattern(BaseModel):
    lp_id: str
    name: str
    investor_type: str
    typical_commitment_size: float
    total_committed_capital: float
    fund_type_preferences: Dict[str, float]  # Fund type to percentage allocation
    sector_preferences: Dict[str, float]  # Sector to percentage allocation
    risk_tolerance_score: float
    avg_holding_period: float  # In years
    reinvestment_rate: float  # How often they reinvest with same manager
    diversification_score: float
    decision_speed: float  # Average time to commit
    co_investment_frequency: float
    relationship_strength: Dict[str, float]  # Relationship metrics with FOFs
    investment_consistency_score: float
    
    model_config = {"arbitrary_types_allowed": True}

class CapitalRaiserMetrics(BaseModel):
    raiser_id: str
    name: str
    success_rate: float  # Percentage of successful raises
    total_capital_raised: float
    avg_deal_size: float
    deal_flow_quality_score: float
    sector_expertise: Dict[str, float]  # Sector to expertise score
    client_retention_rate: float
    average_fundraising_period: float  # In months
    network_strength_score: float
    client_satisfaction_score: Optional[float] = None
    performance_vs_target: float  # Average percentage of target raised
    communication_quality_score: float
    
    model_config = {"arbitrary_types_allowed": True}

class SectorAnalytics(BaseModel):
    sector: str
    total_aum: float
    growth_rate: float  # YoY growth
    average_returns: float
    risk_scores: Dict[str, float]  # Different risk metrics
    fundraising_momentum: float
    deal_flow: int  # Number of deals in last period
    average_valuation: Optional[float] = None
    investor_sentiment_score: float
    top_performing_funds: List[Dict[str, Any]]
    emerging_trends: List[str]
    geographical_distribution: Dict[str, float]
    
    model_config = {"arbitrary_types_allowed": True}

class NetworkAnalytics(BaseModel):
    total_quality_connections: int
    high_value_contacts: int
    relationship_strength_distribution: Dict[str, int]
    introduction_success_rate: float
    average_response_time: float  # In hours
    connection_growth_rate: float
    engagement_quality_score: float
    potential_value_score: float
    relationship_reciprocity_score: float
    connection_exclusivity_metrics: Dict[str, float]  # How unique these connections are
    
    model_config = {"arbitrary_types_allowed": True}

class ComprehensiveDashboardResponse(BaseModel):
    timestamp: str
    fund_manager_analytics: List[FundManagerPerformanceMetrics]
    lp_investment_patterns: List[LPInvestmentPattern]
    capital_raiser_metrics: List[CapitalRaiserMetrics]
    sector_analytics: List[SectorAnalytics]
    network_analytics: NetworkAnalytics
    investment_opportunity_index: float  # Aggregate score of investment climate
    trending_sectors: List[Dict[str, Any]]
    market_sentiment_indicators: Dict[str, float]
    recommendation_engine_results: List[Dict[str, Any]]
    
    model_config = {"arbitrary_types_allowed": True}

class InvestmentScoreCard(BaseModel):
    fund_id: str
    fund_name: str
    overall_score: float  # 0-100 score
    historical_performance: float
    team_quality: float
    strategy_consistency: float
    risk_management: float
    investor_relations: float
    operational_excellence: float
    growth_potential: float
    recommendation: str
    key_strengths: List[str]
    areas_of_concern: List[str]
    
    model_config = {"arbitrary_types_allowed": True}

# Helper functions
def validate_premium_access(token_data: Dict):
    """Validate that the user has Fund of Funds premium access"""
    try:
        user_id = token_data.get("uid")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid authentication token")
        
        # Get user profile from storage
        try:
            user_profiles = db.storage.json.get("user_profiles", default={})
            user_profile = user_profiles.get(user_id)
            
            if not user_profile:
                raise HTTPException(status_code=404, detail="User profile not found")
                
            # Check if user is Fund of Funds type and has premium subscription
            if user_profile.get("user_type") != UserType.FUND_OF_FUNDS.value:
                raise HTTPException(status_code=403, detail="Access restricted to Fund of Funds users")
                
            # Check subscription tier (this would be more robust in a real implementation)
            if user_profile.get("subscription_tier") not in ["professional", "enterprise"]:
                raise HTTPException(
                    status_code=403, 
                    detail="This feature requires a premium subscription (Professional or Enterprise tier)"
                )
                
            return user_id
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error validating user access: {str(e)}")
            
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Authentication error: {str(e)}")

# Generate mock data for development/demo purposes
def generate_mock_analytics_data():
    """Generate mock data for the dashboard"""
    # Mock fund manager performance metrics
    fund_managers = [
        {
            "fund_id": f"fund-{i}",
            "fund_name": f"Venture Fund {i}",
            "fund_type": FundType.VENTURE_CAPITAL.value if i % 3 == 0 else 
                        FundType.PRIVATE_EQUITY.value if i % 3 == 1 else 
                        FundType.HEDGE_FUND.value,
            "historical_returns": round(10 + (i % 15), 2),
            "risk_adjusted_returns": round(8 + (i % 10), 2),
            "performance_percentile": round(50 + (i % 50), 2),
            "consistency_score": round(0.6 + (i % 40) / 100, 2),
            "sharpe_ratio": round(1.2 + (i % 30) / 10, 2) if i % 2 == 0 else None,
            "sortino_ratio": round(1.5 + (i % 25) / 10, 2) if i % 2 == 0 else None,
            "drawdown_metrics": {
                "max_drawdown": round(10 + (i % 20), 2),
                "avg_drawdown": round(5 + (i % 10), 2),
                "recovery_time": round(3 + (i % 12), 2)
            },
            "three_year_returns": round(15 + (i % 25), 2) if i % 3 == 0 else None,
            "five_year_returns": round(30 + (i % 40), 2) if i % 3 == 0 else None,
            "aum_growth_rate": round(5 + (i % 25), 2),
            "lp_satisfaction_score": round(3.5 + (i % 15) / 10, 2) if i % 2 == 0 else None,
            "fund_manager_experience": 5 + (i % 20),
            "team_stability_score": round(0.7 + (i % 30) / 100, 2),
            "investment_strategy_alignment": {
                "early_stage": round(0.3 + (i % 60) / 100, 2),
                "growth": round(0.4 + (i % 50) / 100, 2),
                "late_stage": round(0.2 + (i % 80) / 100, 2)
            },
            "due_diligence_score": round(75 + (i % 25), 2),
            "tier_ranking": "A" if i % 4 == 0 else "B" if i % 4 == 1 else "C" if i % 4 == 2 else "D"
        } for i in range(1, 21)
    ]
    
    # Mock LP investment patterns
    lp_patterns = [
        {
            "lp_id": f"lp-{i}",
            "name": f"Institutional Investor {i}",
            "investor_type": "Pension Fund" if i % 4 == 0 else 
                            "Endowment" if i % 4 == 1 else 
                            "Family Office" if i % 4 == 2 else 
                            "Sovereign Wealth Fund",
            "typical_commitment_size": round((5 + (i % 45)) * 1000000, 2),
            "total_committed_capital": round((50 + (i % 950)) * 1000000, 2),
            "fund_type_preferences": {
                FundType.VENTURE_CAPITAL.value: round(0.2 + (i % 80) / 100, 2),
                FundType.PRIVATE_EQUITY.value: round(0.3 + (i % 70) / 100, 2),
                FundType.HEDGE_FUND.value: round(0.1 + (i % 90) / 100, 2),
                FundType.REAL_ESTATE.value: round(0.1 + (i % 90) / 100, 2),
                FundType.FAMILY_OFFICE.value: round(0.1 + (i % 90) / 100, 2),
            },
            "sector_preferences": {
                "Technology": round(0.3 + (i % 70) / 100, 2),
                "Healthcare": round(0.2 + (i % 80) / 100, 2),
                "Financial Services": round(0.15 + (i % 85) / 100, 2),
                "Consumer": round(0.1 + (i % 90) / 100, 2),
                "Industrial": round(0.1 + (i % 90) / 100, 2),
            },
            "risk_tolerance_score": round(3 + (i % 7), 2),
            "avg_holding_period": round(3 + (i % 7), 2),
            "reinvestment_rate": round(0.4 + (i % 60) / 100, 2),
            "diversification_score": round(0.5 + (i % 50) / 100, 2),
            "decision_speed": round(30 + (i % 120), 2),  # Days
            "co_investment_frequency": round(0.2 + (i % 60) / 100, 2),
            "relationship_strength": {
                "communication": round(0.6 + (i % 40) / 100, 2),
                "responsiveness": round(0.7 + (i % 30) / 100, 2),
                "transparency": round(0.8 + (i % 20) / 100, 2)
            },
            "investment_consistency_score": round(0.5 + (i % 50) / 100, 2)
        } for i in range(1, 16)
    ]
    
    # Mock capital raiser metrics
    capital_raisers = [
        {
            "raiser_id": f"cr-{i}",
            "name": f"Capital Advisor {i}",
            "success_rate": round(0.6 + (i % 40) / 100, 2),
            "total_capital_raised": round((20 + (i % 480)) * 1000000, 2),
            "avg_deal_size": round((5 + (i % 45)) * 1000000, 2),
            "deal_flow_quality_score": round(0.6 + (i % 40) / 100, 2),
            "sector_expertise": {
                "Technology": round(0.8 + (i % 20) / 100, 2) if i % 3 == 0 else round(0.3 + (i % 70) / 100, 2),
                "Healthcare": round(0.8 + (i % 20) / 100, 2) if i % 3 == 1 else round(0.3 + (i % 70) / 100, 2),
                "Financial Services": round(0.8 + (i % 20) / 100, 2) if i % 3 == 2 else round(0.3 + (i % 70) / 100, 2),
                "Consumer": round(0.4 + (i % 60) / 100, 2),
                "Industrial": round(0.4 + (i % 60) / 100, 2),
            },
            "client_retention_rate": round(0.7 + (i % 30) / 100, 2),
            "average_fundraising_period": round(6 + (i % 12), 2),  # Months
            "network_strength_score": round(0.65 + (i % 35) / 100, 2),
            "client_satisfaction_score": round(4 + (i % 10) / 10, 2) if i % 2 == 0 else None,
            "performance_vs_target": round(0.9 + (i % 20) / 100, 2),
            "communication_quality_score": round(0.7 + (i % 30) / 100, 2)
        } for i in range(1, 11)
    ]
    
    # Mock sector analytics
    sectors = [
        {
            "sector": sector_name,
            "total_aum": round((100 + (i * 20 + j * 50)) * 1000000, 2),
            "growth_rate": round(5 + (i * 2 + j * 3), 2),
            "average_returns": round(8 + (i * 1.5 + j * 2), 2),
            "risk_scores": {
                "volatility": round(10 + (i * 2 + j), 2),
                "correlation": round(0.3 + (i * 0.05 + j * 0.02), 2),
                "concentration": round(0.4 + (i * 0.03 + j * 0.04), 2),
            },
            "fundraising_momentum": round(0.6 + (i * 0.05 + j * 0.02), 2),
            "deal_flow": 10 + (i * 3 + j * 5),
            "average_valuation": round((10 + (i * 5 + j * 10)) * 1000000, 2) if i % 2 == 0 else None,
            "investor_sentiment_score": round(0.5 + (i * 0.05 + j * 0.03), 2),
            "top_performing_funds": [
                {"fund_id": f"fund-{i*5+j}", "name": f"Top Fund {i*5+j}", "returns": round(15 + (i * 2 + j * 3), 2)} 
                for j in range(1, 4)
            ],
            "emerging_trends": [
                f"Trend {i*3+j}" for j in range(1, 4)
            ],
            "geographical_distribution": {
                "North America": round(0.5 + (i * 0.02 + j * 0.01), 2),
                "Europe": round(0.3 + (i * 0.01 + j * 0.02), 2),
                "Asia": round(0.15 + (i * 0.01 + j * 0.005), 2),
                "Rest of World": round(0.05 + (i * 0.005 + j * 0.005), 2),
            },
        } 
        for i, sector_name in enumerate(["Technology", "Healthcare", "Financial Services", "Consumer", "Industrial", "Energy", "Real Estate"])
        for j in range(1, 2)  # Just to add some variation
    ]
    
    # Mock network analytics
    network = {
        "total_quality_connections": 250,
        "high_value_contacts": 75,
        "relationship_strength_distribution": {
            "strong": 30,
            "moderate": 120,
            "weak": 100,
        },
        "introduction_success_rate": 0.65,
        "average_response_time": 24,  # Hours
        "connection_growth_rate": 0.15,
        "engagement_quality_score": 0.72,
        "potential_value_score": 0.68,
        "relationship_reciprocity_score": 0.58,
        "connection_exclusivity_metrics": {
            "exclusive_relationships": 0.25,
            "shared_relationships": 0.75,
            "unique_value_score": 0.62,
        },
        # Add additional network data needed for our UI
        "user_type_connections": {
            "fund_managers": {
                "total": 85,
                "avg_strength": 0.73,
                "growth_rate": 0.18
            },
            "limited_partners": {
                "total": 65,
                "avg_strength": 0.68,
                "growth_rate": 0.12
            },
            "capital_raisers": {
                "total": 45,
                "avg_strength": 0.62,
                "growth_rate": 0.22
            },
            "fund_of_funds": {
                "total": 55,
                "avg_strength": 0.77,
                "growth_rate": 0.15
            }
        },
        # Detailed metrics for network analysis
        "detailed_metrics": {
            "fund_managers": {
                "active_contacts": 72,
                "response_rate": 0.82,
                "avg_communications_per_month": 3.5,
                "deal_flow": 14,
                "new_connections_30d": 8,
                "quality_score": 0.79,
                "key_relationships": [
                    {"name": "Sequoia Capital", "strength": 0.87},
                    {"name": "Andreessen Horowitz", "strength": 0.83},
                    {"name": "Benchmark", "strength": 0.78},
                    {"name": "Accel Partners", "strength": 0.76},
                    {"name": "Greylock", "strength": 0.72}
                ]
            },
            "limited_partners": {
                "active_contacts": 54,
                "response_rate": 0.68,
                "avg_communications_per_month": 2.8,
                "deal_flow": 9,
                "new_connections_30d": 5,
                "quality_score": 0.75,
                "key_relationships": [
                    {"name": "Yale Endowment", "strength": 0.81},
                    {"name": "CalPERS", "strength": 0.77},
                    {"name": "Harvard Management Co", "strength": 0.74},
                    {"name": "Temasek Holdings", "strength": 0.71},
                    {"name": "GIC", "strength": 0.68}
                ]
            },
            "capital_raisers": {
                "active_contacts": 38,
                "response_rate": 0.75,
                "avg_communications_per_month": 4.2,
                "deal_flow": 12,
                "new_connections_30d": 7,
                "quality_score": 0.71,
                "key_relationships": [
                    {"name": "Credit Suisse", "strength": 0.79},
                    {"name": "Morgan Stanley", "strength": 0.76},
                    {"name": "Evercore", "strength": 0.74},
                    {"name": "UBS", "strength": 0.70}
                ]
            },
            "fund_of_funds": {
                "active_contacts": 48,
                "response_rate": 0.78,
                "avg_communications_per_month": 3.2,
                "deal_flow": 11,
                "new_connections_30d": 6,
                "quality_score": 0.84,
                "key_relationships": [
                    {"name": "Adams Street Partners", "strength": 0.89},
                    {"name": "Hamilton Lane", "strength": 0.86},
                    {"name": "HarbourVest", "strength": 0.83},
                    {"name": "Pantheon", "strength": 0.81},
                    {"name": "AlpInvest Partners", "strength": 0.78},
                    {"name": "LGT Capital Partners", "strength": 0.75}
                ]
            }
        },
        # Introduction statistics by user type
        "introductions_by_type": {
            "fund_managers": {
                "sent": 45,
                "received": 38,
                "conversion_rate": 0.72
            },
            "limited_partners": {
                "sent": 29,
                "received": 42,
                "conversion_rate": 0.65
            },
            "capital_raisers": {
                "sent": 52,
                "received": 31,
                "conversion_rate": 0.58
            },
            "fund_of_funds": {
                "sent": 37,
                "received": 35,
                "conversion_rate": 0.81
            }
        },
        "introduction_success_by_type": {
            "fund_managers": 0.72,
            "limited_partners": 0.65,
            "capital_raisers": 0.58,
            "fund_of_funds": 0.81
        },
        "connection_strength": {
            "strong": 30,
            "medium": 120,
            "weak": 100
        },
        "recent_introductions": [
            {
                "from": {"name": "John Smith", "type": "fund_of_funds"},
                "to": {"name": "Accel Ventures", "type": "fund_managers"},
                "date": "2025-03-15T09:30:00Z",
                "status": "accepted",
                "notes": "Introduced for potential co-investment opportunity in tech sector",
                "outcome": "Scheduled meeting for next week"
            },
            {
                "from": {"name": "Jane Wilson", "type": "capital_raisers"},
                "to": {"name": "Global Pension Fund", "type": "limited_partners"},
                "date": "2025-03-10T14:45:00Z",
                "status": "pending",
                "notes": "Healthcare investment opportunity"
            },
            {
                "from": {"name": "Robert Jones", "type": "fund_of_funds"},
                "to": {"name": "Strategic Capital", "type": "fund_managers"},
                "date": "2025-03-05T11:15:00Z",
                "status": "declined",
                "notes": "Introduction for fund strategy discussion"
            },
            {
                "from": {"name": "Emily Chen", "type": "limited_partners"},
                "to": {"name": "Horizon Investments", "type": "fund_managers"},
                "date": "2025-03-02T10:00:00Z",
                "status": "accepted",
                "notes": "Potential allocation to new fund",
                "outcome": "Due diligence in progress"
            },
            {
                "from": {"name": "Michael Brown", "type": "fund_of_funds"},
                "to": {"name": "Capital Connections", "type": "capital_raisers"},
                "date": "2025-02-28T15:30:00Z",
                "status": "accepted",
                "notes": "Collaboration on finding emerging managers",
                "outcome": "Established working relationship"
            },
            {
                "from": {"name": "Sarah Johnson", "type": "fund_managers"},
                "to": {"name": "Family Trust Capital", "type": "limited_partners"},
                "date": "2025-02-25T09:45:00Z",
                "status": "pending",
                "notes": "Introduction for potential investment"
            }
        ]
    }
    
    # Mock trending sectors
    trending_sectors = [
        {
            "sector": "Artificial Intelligence",
            "growth_rate": 28.5,
            "investor_interest_score": 0.85,
            "funding_momentum": 0.92,
            "top_subsectors": ["Machine Learning", "Computer Vision", "NLP"],
        },
        {
            "sector": "Climate Tech",
            "growth_rate": 32.1,
            "investor_interest_score": 0.78,
            "funding_momentum": 0.86,
            "top_subsectors": ["Carbon Capture", "Renewable Energy", "Sustainable Materials"],
        },
        {
            "sector": "Digital Health",
            "growth_rate": 24.3,
            "investor_interest_score": 0.81,
            "funding_momentum": 0.79,
            "top_subsectors": ["Telemedicine", "Health Analytics", "Remote Monitoring"],
        },
        {
            "sector": "Fintech",
            "growth_rate": 18.7,
            "investor_interest_score": 0.76,
            "funding_momentum": 0.72,
            "top_subsectors": ["Digital Banking", "Blockchain", "Insurtech"],
        },
        {
            "sector": "Space Technology",
            "growth_rate": 22.9,
            "investor_interest_score": 0.72,
            "funding_momentum": 0.68,
            "top_subsectors": ["Satellite Tech", "Space Logistics", "Earth Observation"],
        },
    ]
    
    # Mock market sentiment indicators
    market_sentiment = {
        "overall_investment_climate": 0.65,
        "fundraising_difficulty": 0.58,
        "exit_opportunities": 0.62,
        "valuation_sentiment": 0.55,
        "lp_commitment_sentiment": 0.68,
        "regulatory_climate": 0.51,
    }
    
    # Mock recommendation engine results
    recommendations = [
        {
            "id": f"rec-{i}",
            "type": "fund_manager" if i % 3 == 0 else "limited_partner" if i % 3 == 1 else "opportunity",
            "name": f"Recommended {i}",
            "match_score": round(0.7 + (i % 30) / 100, 2),
            "reason": f"High alignment with your investment strategy - {i}% match in target sectors",
            "key_metrics": {
                "performance": round(12 + (i % 18), 2),
                "experience": 5 + (i % 15),
                "alignment": round(0.6 + (i % 40) / 100, 2),
            },
        } for i in range(1, 11)
    ]
    
    # Mock investment scorecards
    scorecards = [
        {
            "fund_id": f"fund-{i}",
            "fund_name": f"Evaluated Fund {i}",
            "overall_score": round(60 + (i % 40), 2),
            "historical_performance": round(50 + (i % 50), 2),
            "team_quality": round(55 + (i % 45), 2),
            "strategy_consistency": round(45 + (i % 55), 2),
            "risk_management": round(50 + (i % 50), 2),
            "investor_relations": round(40 + (i % 60), 2),
            "operational_excellence": round(45 + (i % 55), 2),
            "growth_potential": round(50 + (i % 50), 2),
            "recommendation": "Strong Buy" if i % 5 == 0 else 
                              "Buy" if i % 5 == 1 else 
                              "Hold" if i % 5 == 2 else 
                              "Underweight" if i % 5 == 3 else 
                              "Sell",
            "key_strengths": [
                f"Strength {j}" for j in range(1, 4)
            ],
            "areas_of_concern": [
                f"Concern {j}" for j in range(1, 3)
            ],
        } for i in range(1, 9)
    ]
    
    # Compile all mock data
    return {
        "timestamp": datetime.now().isoformat(),
        "fund_manager_analytics": fund_managers,
        "lp_investment_patterns": lp_patterns,
        "capital_raiser_metrics": capital_raisers,
        "sector_analytics": sectors,
        "network_analytics": network,
        "investment_opportunity_index": 68.5,  # Aggregate score
        "trending_sectors": trending_sectors,
        "market_sentiment_indicators": market_sentiment,
        "recommendation_engine_results": recommendations,
        "investment_scorecards": scorecards
    }

# Store mock data for development purposes
def init_mock_data():
    """Initialize mock data for development purposes"""
    try:
        # Generate mock analytics data
        mock_data = generate_mock_analytics_data()
        
        # Store in db.storage
        db.storage.json.put("fund_of_funds_analytics_mock", mock_data)
        
        print("Mock data for Fund of Funds analytics initialized successfully")
    except Exception as e:
        print(f"Error initializing mock data: {str(e)}")

# Initialize mock data on module import
init_mock_data()

# Endpoints
@router.get("/dashboard", response_model=ComprehensiveDashboardResponse)
async def get_comprehensive_dashboard():
    """Get comprehensive analytics dashboard for Fund of Funds users"""
    # Skip token validation for now
    # In production, we would validate the user has premium access
    
    try:
        # In a real system, we would aggregate real data here
        # For now, we'll use our mock data
        mock_data = db.storage.json.get("fund_of_funds_analytics_mock", default={})
        
        if not mock_data:
            # Re-initialize if missing
            mock_data = generate_mock_analytics_data()
            db.storage.json.put("fund_of_funds_analytics_mock", mock_data)
        
        # Remove investment scorecards from the response as they're for a different endpoint
        if "investment_scorecards" in mock_data:
            del mock_data["investment_scorecards"]
        
        return mock_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving dashboard data: {str(e)}")

@router.get("/fund-manager/{fund_id}", response_model=FundManagerPerformanceMetrics)
async def get_fund_manager_performance(
    fund_id: str,
):
    """Get detailed performance metrics for a specific fund manager"""
    # Skip token validation for now
    
    try:
        # Get mock data
        mock_data = db.storage.json.get("fund_of_funds_analytics_mock", default={})
        
        if not mock_data:
            raise HTTPException(status_code=404, detail="Analytics data not found")
        
        # Find the specific fund manager
        fund_manager = next(
            (fm for fm in mock_data.get("fund_manager_analytics", []) if fm["fund_id"] == fund_id),
            None
        )
        
        if not fund_manager:
            raise HTTPException(status_code=404, detail=f"Fund manager with ID {fund_id} not found")
        
        return fund_manager
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving fund manager data: {str(e)}")

@router.get("/investment-scorecard/{fund_id}", response_model=InvestmentScoreCard)
async def get_investment_scorecard(
    fund_id: str,
):
    """Get investment scorecard with detailed evaluation for a fund"""
    # Skip token validation for now
    
    try:
        # Get mock data
        mock_data = db.storage.json.get("fund_of_funds_analytics_mock", default={})
        
        if not mock_data or "investment_scorecards" not in mock_data:
            raise HTTPException(status_code=404, detail="Scorecard data not found")
        
        # Find the specific scorecard
        scorecard = next(
            (sc for sc in mock_data.get("investment_scorecards", []) if sc["fund_id"] == fund_id),
            None
        )
        
        if not scorecard:
            raise HTTPException(status_code=404, detail=f"Scorecard for fund ID {fund_id} not found")
        
        return scorecard
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving scorecard data: {str(e)}")

@router.get("/sector-performance", response_model=List[SectorAnalytics])
async def get_sector_performance():
    """Get performance analytics across different investment sectors"""
    # Skip token validation for now
    
    try:
        # Get mock data
        mock_data = db.storage.json.get("fund_of_funds_analytics_mock", default={})
        
        if not mock_data or "sector_analytics" not in mock_data:
            raise HTTPException(status_code=404, detail="Sector analytics data not found")
        
        return mock_data["sector_analytics"]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving sector performance data: {str(e)}")

@router.get("/lp-patterns", response_model=List[LPInvestmentPattern])
async def get_lp_investment_patterns():
    """Get investment patterns of Limited Partners"""
    # Skip token validation for now
    
    try:
        # Get mock data
        mock_data = db.storage.json.get("fund_of_funds_analytics_mock", default={})
        
        if not mock_data or "lp_investment_patterns" not in mock_data:
            raise HTTPException(status_code=404, detail="LP investment pattern data not found")
        
        return mock_data["lp_investment_patterns"]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving LP investment patterns: {str(e)}")

@router.get("/capital-raiser-performance", response_model=List[CapitalRaiserMetrics])
async def get_capital_raiser_performance():
    """Get performance metrics of Capital Raisers"""
    # Skip token validation for now
    
    try:
        # Get mock data
        mock_data = db.storage.json.get("fund_of_funds_analytics_mock", default={})
        
        if not mock_data or "capital_raiser_metrics" not in mock_data:
            raise HTTPException(status_code=404, detail="Capital raiser metrics not found")
        
        return mock_data["capital_raiser_metrics"]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving capital raiser performance: {str(e)}")

@router.get("/network-strength", response_model=NetworkAnalytics)
async def get_network_strength():
    """Get analytics on network strength and connections"""
    # Skip token validation for now
    
    try:
        # Get mock data
        mock_data = db.storage.json.get("fund_of_funds_analytics_mock", default={})
        
        if not mock_data or "network_analytics" not in mock_data:
            raise HTTPException(status_code=404, detail="Network analytics not found")
        
        return mock_data["network_analytics"]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving network strength analytics: {str(e)}")
