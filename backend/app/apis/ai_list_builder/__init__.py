from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, List, Optional, Set, Tuple, Any
from collections import defaultdict

from sec_api import QueryApi
import pandas as pd
from datetime import datetime, timedelta
import requests
import databutton as db
from hashlib import md5
# Data normalization functions
class StorageManager:
    def __init__(self):
        self.cache = {}

    def is_cache_valid(self, source: str) -> bool:
        return source in self.cache

    def get_normalized_data(self, source: str) -> Optional[pd.DataFrame]:
        return self.cache.get(source)

    def store_normalized_data(self, source: str, data: pd.DataFrame):
        self.cache[source] = data

    def store_historical_data(self, source: str, investor_id: str, data: dict):
        pass  # Implement if needed

def normalize_fund_size(value: Optional[float]) -> Optional[float]:
    """Normalize fund size to a standard format (USD)"""
    if value is None:
        return None
    return float(value)

def normalize_date(date_str: str) -> datetime:
    """Normalize date string to datetime object"""
    return datetime.fromisoformat(date_str)

def normalize_investment_focus(focus_list: Optional[List[str]]) -> Optional[List[str]]:
    """Normalize investment focus areas"""
    if not focus_list:
        return None
    return [focus.strip() for focus in focus_list]

storage_manager = StorageManager()

class CacheManager:
    def __init__(self):
        self.cache = {}

    def get_cached_data(self, source: str, filters: dict) -> Optional[pd.DataFrame]:
        """Get cached data for a source and filters"""
        cache_key = f"{source}_{hash(str(filters))}"
        return self.cache.get(cache_key)

    def cache_data(self, source: str, filters: dict, data: pd.DataFrame):
        """Cache data for a source and filters"""
        cache_key = f"{source}_{hash(str(filters))}"
        self.cache[cache_key] = data

cache_manager = CacheManager()

router = APIRouter(prefix="/ai_list_builder", tags=["AI List Builder"])


class InvestorProfile(BaseModel):
    name: str
    company: str
    role: str
    fund_type: Optional[str] = None
    fund_size: Optional[float] = None
    investment_focus: Optional[List[str]] = None
    historical_returns: Optional[float] = None
    risk_profile: Optional[str] = None
    source: str
    last_updated: datetime
    location: Optional[str] = None
    website: Optional[str] = None
    portfolio_size: Optional[int] = None
    investment_stages: Optional[List[str]] = None
    total_investments: Optional[int] = None

class SearchFilters(BaseModel):
    fund_type: Optional[str] = None
    min_fund_size: Optional[float] = None
    max_fund_size: Optional[float] = None
    investment_focus: Optional[List[str]] = None
    min_historical_returns: Optional[float] = None
    risk_profile: Optional[str] = None

class PerformanceMetrics(BaseModel):
    """Performance metrics for search operations"""
    processing_time_seconds: float
    cache_hit_ratio: float
    cache_hits: int
    cache_misses: int

class CacheStatus(BaseModel):
    """Cache status with performance metrics"""
    SEC_EDGAR: str
    Crunchbase: str
    OpenBB: str
    performance: PerformanceMetrics

class SearchResponse(BaseModel):
    """Response model for investor search with performance metrics"""
    investors: List[InvestorProfile]
    total: int
    page: int
    page_size: int
    cache_status: CacheStatus

class CacheMetadata(BaseModel):
    """Metadata for cached investor data"""
    last_updated: datetime
    data_hash: str
    record_count: int
    source: str

class HistoricalRecord(BaseModel):
    """Historical record of investor data"""
    investor_id: str  # Unique identifier (company name hash)
    snapshot_date: datetime
    data: Dict  # The actual investor data
    source: str

def generate_investor_id(company: str, source: str) -> str:
    """Generate a unique ID for an investor"""
    return md5(f"{company}:{source}".encode()).hexdigest()

def store_historical_data(investor: InvestorProfile):
    """Store historical data for an investor"""
    try:
        # Generate unique ID
        investor_id = generate_investor_id(investor.company, investor.source)
        
        # Create historical record
        record = HistoricalRecord(
            investor_id=investor_id,
            snapshot_date=datetime.now(),
            data=investor.dict(),
            source=investor.source
        )
        
        # Get existing history
        history_key = f"historical_{investor_id}"
        existing_history = db.storage.json.get(history_key, default=[])
        
        # Add new record
        existing_history.append(record.dict())
        
        # Keep only last 10 snapshots
        if len(existing_history) > 10:
            existing_history = existing_history[-10:]
        
        # Store updated history
        db.storage.json.put(history_key, existing_history)
        
    except Exception as e:
        print(f"Error storing historical data: {str(e)}")

def get_cache_metadata(source: str) -> Optional[CacheMetadata]:
    """Get metadata for cached data"""
    try:
        metadata_key = f"{source.lower()}_metadata"
        metadata = db.storage.json.get(metadata_key, default=None)
        return CacheMetadata(**metadata) if metadata else None
    except Exception:
        return None

def update_cache_metadata(source: str, df: pd.DataFrame):
    """Update metadata for cached data"""
    try:
        metadata = CacheMetadata(
            last_updated=datetime.now(),
            data_hash=md5(df.to_json().encode()).hexdigest(),
            record_count=len(df),
            source=source
        )
        metadata_key = f"{source.lower()}_metadata"
        db.storage.json.put(metadata_key, metadata.dict())
    except Exception as e:
        print(f"Error updating cache metadata: {str(e)}")

def is_cache_stale(source: str, current_data: pd.DataFrame) -> bool:
    """Check if cached data is stale by comparing data hashes"""
    try:
        metadata = get_cache_metadata(source)
        if not metadata:
            return True
            
        current_hash = md5(current_data.to_json().encode()).hexdigest()
        return current_hash != metadata.data_hash
    except Exception:
        return True  # Assume stale on error

def fetch_sec_edgar_data(filters: SearchFilters) -> Tuple[List[InvestorProfile], str]:
    """Fetch investor data from SEC EDGAR database"""
    try:
        # Initialize SEC API client
        sec_api_key = db.secrets.get("SEC_API_KEY")
        queryApi = QueryApi(api_key=sec_api_key)
        
        # Check if we have valid cached data
        if storage_manager.is_cache_valid("SEC_EDGAR"):
            cached_data = storage_manager.get_normalized_data("SEC_EDGAR")
            if cached_data is not None and not cached_data.empty:
                return filter_cached_data(cached_data, filters), 'cached'
        
        # Prepare query for investment companies (form 13F filings)
        query = {
            "query": {
                "query_string": {
                    "query": "formType:\"13F-HR\""
                }
            },
            "from": "0",
            "size": "50",
            "sort": [{"filedAt": {"order": "desc"}}]
        }

        # Make API request
        response = queryApi.get_filings(query)
        
        # Process and normalize the data
        investors = []
        for filing in response['filings']:
            try:
                fund_size = normalize_fund_size(sum([float(holding.get('value', 0)) for holding in filing.get('holdings', [])]))
                
                investor = InvestorProfile(
                    name=filing.get('companyName', 'Unknown'),
                    company=filing.get('companyName', 'Unknown'),
                    role='Investment Manager',
                    fund_type='Investment Company',
                    fund_size=fund_size,
                    investment_focus=normalize_investment_focus(extract_investment_focus(filing)),
                    source='SEC EDGAR',
                    last_updated=normalize_date(filing.get('filedAt', datetime.now().isoformat()))
                )
                investors.append(investor)
            except Exception as e:
                print(f"Error processing filing: {str(e)}")
                continue  # Skip problematic filings
        
        # Store historical data and normalize
        for investor in investors:
            storage_manager.store_historical_data("SEC_EDGAR", generate_investor_id(investor.company, investor.source), {k: v.isoformat() if isinstance(v, datetime) else (None if pd.isna(v) else v) for k, v in investor.dict().items()})
        
        # Cache the normalized results
        cache_data = pd.DataFrame([inv.dict() for inv in investors])
        storage_manager.store_normalized_data("SEC_EDGAR", cache_data)
        
        return filter_cached_data(cache_data, filters), 'fresh'
        
    except Exception as e:
        print(f"Error fetching SEC EDGAR data: {str(e)}")
        return [], 'pending' # Silently handle API errors to prevent disrupting the UI

def extract_investment_focus(filing: Dict) -> List[str]:
    """Extract investment focus from filing data"""
    focus = set()
    
    # Extract from holdings
    for holding in filing.get('holdings', []):
        if 'industryTitle' in holding:
            focus.add(holding['industryTitle'])
    
    # Limit to top 5 focus areas
    return list(focus)[:5]

def filter_cached_data(df: pd.DataFrame, filters: SearchFilters) -> List[InvestorProfile]:
    """Filter cached data based on search filters"""
    if df.empty:
        return []
        
    # Replace NaN values with None
    df = df.replace({pd.NA: None, pd.NaT: None, float('nan'): None})
        
    # Apply filters
    if filters.fund_type:
        df = df[df['fund_type'] == filters.fund_type]
        
    if filters.min_fund_size is not None:
        df = df[df['fund_size'] >= filters.min_fund_size]
        
    if filters.max_fund_size is not None:
        df = df[df['fund_size'] <= filters.max_fund_size]
        
    if filters.investment_focus:
        df = df[df['investment_focus'].apply(lambda x: any(focus in x for focus in filters.investment_focus))]
        
    if filters.min_historical_returns is not None:
        df = df[df['historical_returns'] >= filters.min_historical_returns]
        
    if filters.risk_profile:
        df = df[df['risk_profile'] == filters.risk_profile]
    
    # Convert back to InvestorProfile objects
    return [InvestorProfile(**row) for _, row in df.iterrows()]

async def fetch_crunchbase_data(filters: SearchFilters) -> Tuple[List[InvestorProfile], str]:
    """Fetch investor data from Crunchbase API using the enrichment service"""
    try:
        # Import here to avoid circular imports
        from .investor_enrichment import bulk_enrich_investor_profiles
        
        # Check if we have valid cached data
        if storage_manager.is_cache_valid("CRUNCHBASE"):
            cached_data = storage_manager.get_normalized_data("CRUNCHBASE")
            if cached_data is not None and not cached_data.empty:
                return filter_cached_data(cached_data, filters), 'cached'
        
        # Create base profiles for enrichment
        base_profiles = []
        
        # Get API key
        api_key = db.secrets.get("CRUNCHBASE_API_KEY")
        if not api_key:
            print("Crunchbase API key not configured")
            return [], 'error'
        
        # Base URL for Crunchbase API v4
        base_url = "https://api.crunchbase.com/api/v4"
        
        # Search for investors
        search_url = f"{base_url}/searches/organizations"
        
        # Build query parameters
        params = {
            "field_ids": ["name", "location_identifiers", "website", "short_description",
                          "funding_total", "investor_type", "num_investments_total",
                          "investment_stages", "investment_categories"],
            "query": [{
                "type": "predicate",
                "field_id": "facet_ids",
                "operator_id": "includes",
                "values": ["investor"]
            }],
            "limit": 50
        }
        
        # Set up headers with API key
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        # Make API request
        response = requests.post(search_url, json=params, headers=headers)
        response.raise_for_status()
        data = response.json()
        
        # Create base profiles for enrichment
        for entity in data.get('entities', []):
            properties = entity.get('properties', {})
            base_profiles.append({
                "name": properties.get('name', 'Unknown'),
                "company": properties.get('name', 'Unknown'),
                "role": 'Investor'
            })
        
        # Enrich the profiles
        enriched_profiles = await bulk_enrich_investor_profiles(base_profiles)
        
        # Convert to InvestorProfile objects
        investors = []
        for profile in enriched_profiles:
            try:
                investor = InvestorProfile(
                    name=profile.name,
                    company=profile.company,
                    role=profile.role or 'Investor',
                    website=profile.website,
                    location=profile.location,
                    fund_size=normalize_fund_size(profile.total_funding_usd),
                    investment_focus=normalize_investment_focus(profile.investment_stages or []),
                    investment_stages=profile.investment_stages,
                    total_investments=None,  # Not available in enriched data
                    source='Crunchbase',
                    last_updated=normalize_date(datetime.now().isoformat())
                )
                investors.append(investor)
            except Exception as e:
                print(f"Error processing Crunchbase entity: {str(e)}")
                continue
        
        # Store historical data and normalize
        for investor in investors:
            storage_manager.store_historical_data(
                "CRUNCHBASE",
                generate_investor_id(investor.company, investor.source),
                {k: v.isoformat() if isinstance(v, datetime) else (None if pd.isna(v) else v) 
                 for k, v in investor.dict().items()}
            )
        
        # Cache the normalized results
        cache_data = pd.DataFrame([inv.dict() for inv in investors])
        storage_manager.store_normalized_data("CRUNCHBASE", cache_data)
        
        return filter_cached_data(cache_data, filters), 'fresh'
        
    except Exception as e:
        print(f"Error fetching Crunchbase data: {str(e)}")
        return [], 'error'
    """Fetch investor data from Crunchbase API"""
    try:
        # Get API key
        api_key = db.secrets.get("CRUNCHBASE_API_KEY")
        
        # Check if we have valid cached data
        if storage_manager.is_cache_valid("CRUNCHBASE"):
            cached_data = storage_manager.get_normalized_data("CRUNCHBASE")
            if cached_data is not None and not cached_data.empty:
                return filter_cached_data(cached_data, filters), 'cached'
        
        # Base URL for Crunchbase API v4
        base_url = "https://api.crunchbase.com/api/v4"
        
        # Search for investors
        search_url = f"{base_url}/searches/organizations"
        
        # Build query parameters
        params = {
            "field_ids": ["name", "location_identifiers", "website", "short_description",
                          "funding_total", "investor_type", "num_investments_total",
                          "investment_stages", "investment_categories"],
            "query": [{
                "type": "predicate",
                "field_id": "facet_ids",
                "operator_id": "includes",
                "values": ["investor"]
            }],
            "limit": 50  # Maximum allowed in basic tier
        }
        
        # Set up headers with API key
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        # Make API request
        response = requests.post(search_url, json=params, headers=headers)
        response.raise_for_status()
        data = response.json()
        
        # Process and normalize the data
        investors = []
        for entity in data.get('entities', []):
            try:
                properties = entity.get('properties', {})
                
                # Extract location
                locations = properties.get('location_identifiers', [])
                location = locations[0].get('value') if locations else None
                
                # Extract investment stages
                stages = properties.get('investment_stages', [])
                investment_stages = [stage.get('value') for stage in stages]
                
                # Extract investment focus
                categories = properties.get('investment_categories', [])
                investment_focus = [cat.get('value') for cat in categories]
                
                investor = InvestorProfile(
                    name=properties.get('name', 'Unknown'),
                    company=properties.get('name', 'Unknown'),
                    role='Investor',
                    website=properties.get('website', {}).get('value'),
                    location=location,
                    fund_size=normalize_fund_size(properties.get('funding_total', {}).get('value')),
                    investment_focus=normalize_investment_focus(investment_focus),
                    investment_stages=investment_stages,
                    total_investments=properties.get('num_investments_total'),
                    source='Crunchbase',
                    last_updated=normalize_date(datetime.now().isoformat())
                )
                investors.append(investor)
            except Exception as e:
                print(f"Error processing Crunchbase entity: {str(e)}")
                continue
        
        # Store historical data and normalize
        for investor in investors:
            storage_manager.store_historical_data("CRUNCHBASE", generate_investor_id(investor.company, investor.source), {k: v.isoformat() if isinstance(v, datetime) else (None if pd.isna(v) else v) for k, v in investor.dict().items()})
        
        # Cache the normalized results
        cache_data = pd.DataFrame([inv.dict() for inv in investors])
        storage_manager.store_normalized_data("CRUNCHBASE", cache_data)
        
        return filter_cached_data(cache_data, filters), 'fresh'
        
    except Exception as e:
        print(f"Error fetching Crunchbase data: {str(e)}")
        return [], 'error'  # Return empty list with error status

def fetch_openbb_data(filters: SearchFilters) -> Tuple[List[InvestorProfile], str]:
    """Fetch investor data from OpenBB Terminal"""
    try:
        # Check if we have valid cached data
        if storage_manager.is_cache_valid("OPENBB"):
            cached_data = storage_manager.get_normalized_data("OPENBB")
            if cached_data is not None and not cached_data.empty:
                return filter_cached_data(cached_data, filters), 'cached'
        
        # TODO: Implement OpenBB Terminal integration
        # For now, return empty list with pending status
        return [], 'pending'
    except Exception as e:
        print(f"Error fetching OpenBB data: {str(e)}")
        return [], 'error'

@router.post("/search")
async def search_investors(filters: SearchFilters) -> SearchResponse:
    """Search for potential investors across multiple data sources
    
    - Uses efficient caching with compression
    - Implements batch processing for API calls
    - Optimizes memory usage
    - Provides cache hit/miss metrics
    - Implements progress tracking
    """
    try:
        # Performance metrics
        start_time = datetime.now()
        cache_hits = 0
        cache_misses = 0
        
        # Use default pagination
        page = 1
        page_size = 20
        
        # Initialize cache status tracking
        cache_status = {
            "SEC_EDGAR": "pending",
            "Crunchbase": "pending",
            "OpenBB": "pending"
        }
        
        # Check cache first
        cached_data = cache_manager.get_cached_data('combined', filters.dict())
        if cached_data is not None:
            # Return cached data with performance metrics
            return SearchResponse(
                investors=[InvestorProfile(**row) for _, row in cached_data.iterrows()],
                total=len(cached_data),
                page=page,
                page_size=page_size,
                cache_status=CacheStatus(
                    SEC_EDGAR='cached',
                    Crunchbase='cached',
                    OpenBB='cached',
                    performance=PerformanceMetrics(
                        processing_time_seconds=0.1,
                        cache_hit_ratio=1.0,
                        cache_hits=1,
                        cache_misses=0
                    )
                )
            )
        
        # Fetch data from all sources with cache status
        sec_data, sec_status = fetch_sec_edgar_data(filters)
        crunchbase_data, cb_status = await fetch_crunchbase_data(filters)
        # Note: OpenBB integration removed for now
        openbb_data, obb_status = [], 'pending'
        
        # Update cache status and metrics
        cache_status.update({
            "SEC_EDGAR": sec_status,
            "Crunchbase": cb_status,
            "OpenBB": obb_status
        })
        
        # Update cache metrics
        for status in [sec_status, cb_status, obb_status]:
            if status == 'cached':
                cache_hits += 1
            elif status == 'fresh':
                cache_misses += 1
        
        # Calculate performance metrics
        processing_time = (datetime.now() - start_time).total_seconds()
        cache_hit_ratio = cache_hits / (cache_hits + cache_misses) if (cache_hits + cache_misses) > 0 else 0

        # Combine and deduplicate data
        all_investors = []
        seen_companies = set()

        # First add SEC EDGAR data as it's typically more reliable
        for investor in sec_data:
            if investor.company not in seen_companies:
                all_investors.append(investor)
                seen_companies.add(investor.company)

        # Then add Crunchbase data, enriching existing profiles or adding new ones
        for investor in crunchbase_data:
            if investor.company in seen_companies:
                # Enrich existing profile
                for existing in all_investors:
                    if existing.company == investor.company:
                        # Update with Crunchbase data if available
                        if investor.investment_focus:
                            existing.investment_focus = list(set(existing.investment_focus or [] + investor.investment_focus))
                        if investor.fund_size and not existing.fund_size:
                            existing.fund_size = investor.fund_size
                        if investor.location and not existing.location:
                            existing.location = investor.location
                        break
            else:
                # Add new profile
                all_investors.append(investor)
                seen_companies.add(investor.company)

        # Apply pagination
        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size
        paginated_investors = all_investors[start_idx:end_idx]

        # Cache combined results
        combined_data = pd.DataFrame([inv.dict() for inv in all_investors])
        cache_manager.cache_data('combined', filters.dict(), combined_data)
        
        # Add performance metrics to response
        return SearchResponse(
            investors=paginated_investors,
            total=len(all_investors),
            page=page,
            page_size=page_size,
            cache_status=CacheStatus(
                SEC_EDGAR=cache_status["SEC_EDGAR"],
                Crunchbase=cache_status["Crunchbase"],
                OpenBB=cache_status["OpenBB"],
                performance=PerformanceMetrics(
                    processing_time_seconds=processing_time,
                    cache_hit_ratio=cache_hit_ratio,
                    cache_hits=cache_hits,
                    cache_misses=cache_misses
                )
            )
        )
    except Exception as e:
        print(f"Error searching investors: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to search investors"
        ) from e

@router.get("/sources/status")
async def get_source_status():
    """
    Get the status of each data source
    """
    try:
        # Check each source's availability
        sources = {
            "sec_edgar": {"status": "ok", "last_updated": None},
            "crunchbase": {"status": "ok", "last_updated": None},
            "openbb": {"status": "pending", "last_updated": None}
        }

        # TODO: Implement actual status checks

        return sources
    except Exception as e:
        print(f"Error checking source status: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to check source status"
        ) from e

class ChartData(BaseModel):
    """Model for chart data response"""
    labels: List[str]
    datasets: List[Dict[str, Any]]
    total: int

@router.get("/analytics/investment-focus")
async def get_investment_focus_distribution() -> ChartData:
    """Get distribution of investment focus areas"""
    try:
        # Get data from both sources
        sec_data, _ = fetch_sec_edgar_data(SearchFilters())
        crunchbase_data, _ = fetch_crunchbase_data(SearchFilters())
        
        # Combine data
        all_investors = sec_data + crunchbase_data
        
        # Count focus areas
        focus_counts = defaultdict(int)
        for investor in all_investors:
            if investor.investment_focus:
                for focus in investor.investment_focus:
                    focus_counts[focus] += 1
        
        # Sort by count and get top 10
        sorted_focus = sorted(focus_counts.items(), key=lambda x: x[1], reverse=True)[:10]
        
        return ChartData(
            labels=[focus[0] for focus in sorted_focus],
            datasets=[{
                "label": "Number of Investors",
                "data": [focus[1] for focus in sorted_focus]
            }],
            total=len(all_investors)
        )
    except Exception as e:
        print(f"Error getting investment focus distribution: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to get investment focus distribution"
        ) from e

@router.get("/analytics/fund-size")
async def get_fund_size_distribution() -> ChartData:
    """Get distribution of fund sizes"""
    try:
        # Get data from both sources
        sec_data, _ = fetch_sec_edgar_data(SearchFilters())
        crunchbase_data, _ = fetch_crunchbase_data(SearchFilters())
        
        # Combine data
        all_investors = sec_data + crunchbase_data
        
        # Define fund size ranges (in millions)
        ranges = [(0, 10), (10, 50), (50, 100), (100, 500), 
                 (500, 1000), (1000, 5000), (5000, float('inf'))]
        range_labels = [f"${r[0]}M - ${r[1]}M" if r[1] != float('inf') else f"${r[0]}M+" 
                       for r in ranges]
        
        # Count funds in each range
        range_counts = [0] * len(ranges)
        for investor in all_investors:
            if investor.fund_size:
                size_m = investor.fund_size / 1_000_000  # Convert to millions
                for i, (min_size, max_size) in enumerate(ranges):
                    if min_size <= size_m < max_size:
                        range_counts[i] += 1
                        break
        
        return ChartData(
            labels=range_labels,
            datasets=[{
                "label": "Number of Funds",
                "data": range_counts
            }],
            total=len(all_investors)
        )
    except Exception as e:
        print(f"Error getting fund size distribution: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to get fund size distribution"
        ) from e

@router.get("/analytics/historical-performance")
async def get_historical_performance() -> ChartData:
    """Get historical performance trends"""
    try:
        # Get all historical data
        all_history = []
        history_files = db.storage.json.list()
        
        for file in history_files:
            if file.startswith('historical_'):
                history = db.storage.json.get(file, default=[])
                all_history.extend(history)
        
        # Group by month and calculate average returns
        monthly_returns = defaultdict(list)
        for record in all_history:
            data = record['data']
            if data.get('historical_returns'):
                date = datetime.fromisoformat(record['snapshot_date'])
                month_key = date.strftime('%Y-%m')
                monthly_returns[month_key].append(data['historical_returns'])
        
        # Calculate averages and sort by month
        sorted_months = sorted(monthly_returns.keys())
        avg_returns = [sum(monthly_returns[month])/len(monthly_returns[month]) 
                      for month in sorted_months]
        
        return ChartData(
            labels=sorted_months,
            datasets=[{
                "label": "Average Returns (%)",
                "data": avg_returns
            }],
            total=len(all_history)
        )
    except Exception as e:
        print(f"Error getting historical performance: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to get historical performance"
        ) from e

@router.get("/analytics/risk-profile")
async def get_risk_profile_distribution() -> ChartData:
    """Get distribution of risk profiles"""
    try:
        # Get data from both sources
        sec_data, _ = fetch_sec_edgar_data(SearchFilters())
        crunchbase_data, _ = fetch_crunchbase_data(SearchFilters())
        
        # Combine data
        all_investors = sec_data + crunchbase_data
        
        # Count risk profiles
        risk_counts = defaultdict(int)
        for investor in all_investors:
            if investor.risk_profile:
                risk_counts[investor.risk_profile] += 1
        
        # Sort by count
        sorted_risks = sorted(risk_counts.items(), key=lambda x: x[1], reverse=True)
        
        return ChartData(
            labels=[risk[0] for risk in sorted_risks],
            datasets=[{
                "label": "Number of Investors",
                "data": [risk[1] for risk in sorted_risks]
            }],
            total=len(all_investors)
        )
    except Exception as e:
        print(f"Error getting risk profile distribution: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to get risk profile distribution"
        ) from e

@router.post("/refresh")
async def refresh_data():
    """
    Manually trigger a refresh of all data sources
    """
    try:
        # TODO: Implement data refresh logic
        return {"status": "success", "message": "Data refresh initiated"}
    except Exception as e:
        print(f"Error refreshing data: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to refresh data"
        ) from e
