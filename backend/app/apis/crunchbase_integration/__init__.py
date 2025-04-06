from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import requests
import databutton as db
from cachetools import TTLCache
from datetime import datetime
from typing import List, Optional
import time

router = APIRouter()

# Cache configuration
CACHE_TTL = 24 * 60 * 60  # 24 hours in seconds
MAX_CACHE_ITEMS = 10000
entity_cache = TTLCache(maxsize=MAX_CACHE_ITEMS, ttl=CACHE_TTL)

# Rate limiting configuration
MAX_CALLS_PER_MINUTE = 200
call_timestamps = []

class CrunchbaseEntityResponse(BaseModel):
    name: str
    domain: Optional[str] = None
    location: Optional[str] = None
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

def enforce_rate_limit():
    """Enforce rate limiting of 200 calls per minute"""
    current_time = time.time()
    # Remove timestamps older than 1 minute
    while call_timestamps and current_time - call_timestamps[0] > 60:
        call_timestamps.pop(0)
    
    if len(call_timestamps) >= MAX_CALLS_PER_MINUTE:
        raise HTTPException(
            status_code=429,
            detail="Rate limit exceeded. Please try again later."
        )
    
    call_timestamps.append(current_time)

def get_crunchbase_api_key() -> str:
    """Get Crunchbase API key from secrets"""
    api_key = db.secrets.get("CRUNCHBASE_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="Crunchbase API key not configured"
        )
    return api_key

def normalize_entity_data(raw_data: dict) -> CrunchbaseEntityResponse:
    """Normalize Crunchbase data to our format"""
    properties = raw_data.get("properties", {})
    
    # Extract and normalize investor types and investment stages from facet_ids
    facet_ids = raw_data.get("facet_ids", [])
    investor_types = []
    investment_stages = []
    
    for facet in facet_ids:
        if facet.startswith("investor_type"):
            investor_types.append(facet.replace("investor_type_", "").replace("_", " ").title())
        elif facet.startswith("investment_stage"):
            investment_stages.append(facet.replace("investment_stage_", "").replace("_", " ").title())
    
    return CrunchbaseEntityResponse(
        name=properties.get("name", ""),
        domain=properties.get("domain"),
        location=f"{properties.get('city_name', '')}, {properties.get('country_code', '')}".strip(" ,"),
        description=properties.get("short_description"),
        founded_on=properties.get("founded_on"),
        linkedin=properties.get("linkedin", {}).get("value"),
        twitter=properties.get("twitter", {}).get("value"),
        facebook=properties.get("facebook", {}).get("value"),
        num_employees_enum=properties.get("num_employees_enum"),
        last_funding_type=properties.get("last_funding_type"),
        total_funding_usd=properties.get("total_funding_usd"),
        investor_types=investor_types,
        investment_stages=investment_stages
    )

@router.get("/entity/{entity_id}")
async def get_entity(entity_id: str) -> CrunchbaseEntityResponse:
    """Get entity details from Crunchbase"""
    # Check cache first
    if entity_id in entity_cache:
        return entity_cache[entity_id]
    
    enforce_rate_limit()
    
    api_key = get_crunchbase_api_key()
    base_url = "https://api.crunchbase.com/api/v4"
    
    try:
        response = requests.get(
            f"{base_url}/entities/organizations/{entity_id}",
            params={"user_key": api_key}
        )
        response.raise_for_status()
        
        data = response.json()
        if not data or "properties" not in data:
            raise HTTPException(
                status_code=404,
                detail=f"Entity {entity_id} not found"
            )
            
        entity_data = normalize_entity_data(data)
        entity_cache[entity_id] = entity_data
        return entity_data
        
    except requests.RequestException as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching data from Crunchbase: {str(e)}"
        ) from e

@router.get("/search/{search_query}")
async def search_entities(search_query: str) -> List[CrunchbaseEntityResponse]:
    """Search for entities in Crunchbase"""
    enforce_rate_limit()
    
    api_key = get_crunchbase_api_key()
    base_url = "https://api.crunchbase.com/api/v4"
    
    try:
        response = requests.post(
            f"{base_url}/searches/organizations",
            params={"user_key": api_key},
            json={
                "query": [{
                    "type": "predicate",
                    "values": [search_query],
                    "field_id": "name",
                    "operator_id": "contains"
                }]
            }
        )
        response.raise_for_status()
        
        data = response.json()
        entities = []
        
        for entity in data.get("entities", []):
            entity_data = normalize_entity_data(entity)
            # Cache the entity data
            entity_cache[entity.get("uuid")] = entity_data
            entities.append(entity_data)
            
        return entities
        
    except requests.RequestException as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error searching Crunchbase: {str(e)}"
        ) from e
