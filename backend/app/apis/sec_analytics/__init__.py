from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, List, Optional, Any
from datetime import datetime
from sec_api import QueryApi
import databutton as db
from collections import defaultdict

router = APIRouter()

class PortfolioHolding(BaseModel):
    ticker: str
    company_name: str
    value: float
    shares: int
    percentage: float
    industry: str
    quarter_change: Optional[float] = None

class IndustryAllocation(BaseModel):
    industry: str
    percentage: float
    value: float
    holdings_count: int

class QuarterlyChange(BaseModel):
    quarter: str
    total_value: float
    change_percentage: float

class ClientType(BaseModel):
    type: str
    percentage: float

class FeeStructure(BaseModel):
    type: str
    rate: str
    description: str

class RiskMetric(BaseModel):
    category: str
    level: str
    description: str

class ManagementTeamMember(BaseModel):
    name: str
    title: str
    experience: str

class FinancialMetric(BaseModel):
    metric: str
    value: float
    change: Optional[float] = None

class InvestmentPolicy(BaseModel):
    category: str
    description: str

class ComprehensiveAnalytics(BaseModel):
    # Portfolio Analysis
    total_aum: float
    holdings: List[Dict[str, Any]]  # Can contain various types
    industry_allocation: List[Dict[str, Any]]  # Can contain various types
    quarterly_changes: List[Dict[str, float]]
    
    # Form ADV Data
    client_types: List[Dict[str, Any]]  # Can contain strings and numbers
    fee_structures: List[Dict[str, str]]
    investment_policies: List[Dict[str, str]]
    risk_factors: List[str]

def get_sec_api_key() -> str:
    """Get SEC API key from secrets"""
    api_key = db.secrets.get("SEC_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="SEC API key not configured"
        )
    return api_key

def fetch_13f_data(cik: str) -> dict:
    """Fetch and analyze 13F filings"""
    queryApi = QueryApi(api_key=get_sec_api_key())
    
    # Get latest 13F filing
    query = {
        "query": {
            "query_string": {
                "query": f'formType:"13F-HR" AND cik:"{cik}"'
            }
        },
        "from": "0",
        "size": "1",
        "sort": [{"filedAt": {"order": "desc"}}]
    }
    
    response = queryApi.get_filings(query)
    if not response['filings']:
        return {}
        
    filing = response['filings'][0]
    holdings = filing.get('holdings', [])
    
    # Calculate total portfolio value
    total_value = sum(float(h.get('value', 0)) for h in holdings)
    
    # Process holdings
    processed_holdings = []
    industry_allocations = defaultdict(lambda: {'value': 0, 'count': 0})
    
    for holding in holdings:
        value = float(holding.get('value', 0))
        percentage = (value / total_value * 100) if total_value > 0 else 0
        
        processed_holding = PortfolioHolding(
            ticker=holding.get('cusip', ''),
            company_name=holding.get('nameOfIssuer', ''),
            value=value,
            shares=int(holding.get('shares', 0)),
            percentage=percentage,
            industry=holding.get('industryTitle', 'Other')
        )
        processed_holdings.append(processed_holding)
        
        # Update industry allocations
        industry = holding.get('industryTitle', 'Other')
        industry_allocations[industry]['value'] += value
        industry_allocations[industry]['count'] += 1
    
    # Convert industry allocations
    industry_alloc_list = [
        IndustryAllocation(
            industry=industry,
            percentage=(data['value'] / total_value * 100) if total_value > 0 else 0,
            value=data['value'],
            holdings_count=data['count']
        )
        for industry, data in industry_allocations.items()
    ]
    
    return {
        'holdings': processed_holdings,
        'industry_allocation': industry_alloc_list,
        'total_aum': total_value
    }

def fetch_adv_data(cik: str) -> dict:
    """Fetch and analyze Form ADV data"""
    # TODO: Implement actual Form ADV data fetching
    # For now, return sample data
    return {
        'client_types': [
            ClientType(type='Institutional', percentage=60),
            ClientType(type='High Net Worth', percentage=30),
            ClientType(type='Retail', percentage=10)
        ],
        'fee_structures': [
            FeeStructure(
                type='Management Fee',
                rate='1.5%',
                description='Annual fee based on AUM'
            )
        ],
        'risk_metrics': [
            RiskMetric(
                category='Market Risk',
                level='Medium',
                description='Exposure to market volatility'
            )
        ],
        'regulatory_history': [
            'No significant regulatory issues in the past 5 years'
        ]
    }

@router.get("/analytics/{cik}")
async def get_comprehensive_analytics(cik: str) -> ComprehensiveAnalytics:
    """Get comprehensive analytics for an investment manager"""
    try:
        # Fetch data from different sources
        f13_data = fetch_13f_data(cik)
        adv_data = fetch_adv_data(cik)
        
        # Combine all data
        # Convert Pydantic models to dictionaries
        client_types = [ct.dict() for ct in adv_data.get('client_types', [])] 
        fee_structures = [fs.dict() for fs in adv_data.get('fee_structures', [])]
        holdings = [h.dict() for h in f13_data.get('holdings', [])]
        industry_allocation = [ia.dict() for ia in f13_data.get('industry_allocation', [])]
        
        return ComprehensiveAnalytics(
            total_aum=f13_data.get('total_aum', 0),
            holdings=holdings,
            industry_allocation=industry_allocation,
            quarterly_changes=[],  # TODO: Implement historical analysis
            
            # Form ADV data
            client_types=client_types,
            fee_structures=fee_structures,
            investment_policies=[],  # TODO: Implement investment policies
            risk_factors=[]  # TODO: Implement risk factors
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching analytics: {str(e)}"
        )
