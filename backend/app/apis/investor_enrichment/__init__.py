from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import databutton as db
from datetime import datetime, timedelta
import json

router = APIRouter()

class EnrichedInvestorProfile(BaseModel):
    name: str
    company: str
    role: Optional[str] = None
    fund_type: Optional[str] = None
    fund_size: Optional[float] = None
    investment_focus: Optional[List[str]] = None
    historical_returns: Optional[float] = None
    risk_profile: Optional[str] = None
    source: Optional[str] = None
    last_updated: Optional[str] = None
    location: Optional[str] = None
    website: Optional[str] = None
    # Crunchbase enriched data
    description: Optional[str] = None
    founded_on: Optional[str] = None
    linkedin: Optional[str] = None
    twitter: Optional[str] = None
    facebook: Optional[str] = None
    num_employees_enum: Optional[str] = None
    last_funding_type: Optional[str] = None
    total_funding_usd: Optional[float] = None
    investor_types: Optional[List[str]] = None
    investment_stages: Optional[List[str]] = None

def get_enrichment_cache():
    """Get the enrichment cache from storage"""
    try:
        cache = db.storage.json.get("investor_enrichment_cache", default={})
        return cache
    except Exception as e:
        print(f"Error reading cache: {str(e)}")
        return {}

def update_enrichment_cache(investor_id: str, data: dict):
    """Update the enrichment cache with new data"""
    cache = get_enrichment_cache()
    
    # Add timestamp for cache expiry
    cache[investor_id] = {
        "data": data,
        "timestamp": datetime.now().isoformat()
    }
    
    # Clean up old entries (older than 24 hours)
    current_time = datetime.now()
    cache = {
        k: v for k, v in cache.items()
        if current_time - datetime.fromisoformat(v["timestamp"]) < timedelta(hours=24)
    }
    
    db.storage.json.put("investor_enrichment_cache", cache)

@router.post("/enrich")
async def enrich_investor_profile(investor: EnrichedInvestorProfile) -> EnrichedInvestorProfile:
    """Enrich investor profile with Crunchbase data"""
    # Check cache first
    cache = get_enrichment_cache()
    cache_key = f"{investor.name}_{investor.company}"
    
    if cache_key in cache:
        cached_data = cache[cache_key]
        cached_time = datetime.fromisoformat(cached_data["timestamp"])
        
        # Return cached data if it's less than 24 hours old
        if datetime.now() - cached_time < timedelta(hours=24):
            return EnrichedInvestorProfile(**{**investor.dict(), **cached_data["data"]})
    
    try:
        # Import here to avoid circular imports
        from .crunchbase_integration import search_entities
        
        # Search Crunchbase for the company
        search_results = await search_entities(investor.company)
        
        if not search_results:
            # No enrichment data found
            return investor
        
        # Use the first result for enrichment
        enrichment_data = search_results[0].dict()
        
        # Update cache
        update_enrichment_cache(cache_key, enrichment_data)
        
        # Merge original profile with enriched data
        return EnrichedInvestorProfile(**{**investor.dict(), **enrichment_data})
        
    except Exception as e:
        print(f"Error enriching investor profile: {str(e)}")
        # Return original profile if enrichment fails
        return investor

@router.post("/bulk-enrich")
async def bulk_enrich_investor_profiles(investors: List[EnrichedInvestorProfile]) -> List[EnrichedInvestorProfile]:
    """Enrich multiple investor profiles with Crunchbase data"""
    enriched_investors = []
    
    for investor in investors:
        try:
            enriched_investor = await enrich_investor_profile(investor)
            enriched_investors.append(enriched_investor)
        except Exception as e:
            print(f"Error enriching investor {investor.name}: {str(e)}")
            enriched_investors.append(investor)
    
    return enriched_investors