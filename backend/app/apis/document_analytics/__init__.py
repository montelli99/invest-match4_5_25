from typing import List, Dict, Optional, Any, Union
from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
import databutton as db
import json
from enum import Enum
import uuid
import hashlib
import time
import re

router = APIRouter()

class AnalyticsEventType(str, Enum):
    """Types of document analytics events"""
    VIEW = "view"              # Document was viewed
    DOWNLOAD = "download"      # Document was downloaded
    SECTION_VIEW = "section_view"  # A specific section was viewed
    TIME_SPENT = "time_spent"  # Time spent on document
    SCROLL_DEPTH = "scroll_depth"  # How far user scrolled
    LINK_CLICK = "link_click"  # User clicked a link in document
    SHARE = "share"            # Document was shared

class DocumentType(str, Enum):
    """Document types with special tracking"""
    PITCH_DECK = "pitch_deck"
    DATA_ROOM = "data_room"
    FINANCIAL_REPORT = "financial_report"
    REGULAR = "regular"

class SourceType(str, Enum):
    """Source of document access"""
    EMAIL = "email"
    MESSAGE = "message"
    DIRECT = "direct"
    EXTERNAL = "external"
    OTHER = "other"

class TrackingParams(BaseModel):
    """Parameters for tracking document access"""
    source: Optional[SourceType] = None
    medium: Optional[str] = None
    campaign: Optional[str] = None
    term: Optional[str] = None
    content: Optional[str] = None
    referrer: Optional[str] = None

class DocumentSection(BaseModel):
    """Represents a section in a document for analytics"""
    section_id: str
    title: str
    page: Optional[int] = None
    type: Optional[str] = None  # e.g., "executive_summary", "financials", etc.

class DocumentAnalyticsEvent(BaseModel):
    """Model for document analytics events"""
    event_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    document_id: str
    user_id: str
    event_type: AnalyticsEventType
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    tracking_params: Optional[TrackingParams] = None
    section_id: Optional[str] = None
    duration_seconds: Optional[int] = None
    scroll_percentage: Optional[int] = None
    device_info: Optional[Dict[str, Any]] = None
    ip_address: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class DocumentAnalytics(BaseModel):
    """Aggregated analytics for a document"""
    document_id: str
    total_views: int = 0
    unique_viewers: int = 0
    total_downloads: int = 0
    total_shares: int = 0
    avg_time_spent_seconds: float = 0
    popular_sections: List[Dict[str, Any]] = []
    access_over_time: Dict[str, int] = {}
    sources: Dict[str, int] = {}

class TrackableLinkInfo(BaseModel):
    """Information about a trackable link"""
    link_id: str
    document_id: str
    created_by: str
    created_at: datetime
    expires_at: Optional[datetime] = None
    tracking_params: TrackingParams
    times_accessed: int = 0
    last_accessed: Optional[datetime] = None
    is_active: bool = True

class CreateTrackableLinkRequest(BaseModel):
    """Request to create a trackable link"""
    document_id: str
    user_id: str
    tracking_params: TrackingParams
    expires_in_days: Optional[int] = None

class TrackableLinkResponse(BaseModel):
    """Response with trackable link info"""
    link_info: TrackableLinkInfo
    tracking_url: str

class DocumentSectionRequest(BaseModel):
    """Request to register document sections for tracking"""
    document_id: str
    user_id: str
    sections: List[DocumentSection]

class RecordEventRequest(BaseModel):
    """Request to record an analytics event"""
    document_id: str
    user_id: str
    event_type: AnalyticsEventType
    tracking_id: Optional[str] = None
    section_id: Optional[str] = None
    duration_seconds: Optional[int] = None
    scroll_percentage: Optional[int] = None
    device_info: Optional[Dict[str, Any]] = None
    ip_address: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

# Helper functions
def _get_document_type(document_id: str) -> DocumentType:
    """Determine the document type based on metadata"""
    try:
        metadata_key = f"document_metadata_{document_id}"
        metadata = db.storage.json.get(metadata_key, default={})
        
        if not metadata:
            return DocumentType.REGULAR
        
        # Check filename and tags to determine type
        filename = metadata.get("filename", "").lower()
        tags = metadata.get("tags", [])
        
        if "pitch_deck" in tags or "pitch deck" in filename or "pitchdeck" in filename:
            return DocumentType.PITCH_DECK
        elif "data_room" in tags or "data room" in filename or "dataroom" in filename:
            return DocumentType.DATA_ROOM
        elif "financial" in tags or "financial" in filename or "report" in filename:
            return DocumentType.FINANCIAL_REPORT
        else:
            return DocumentType.REGULAR
    except Exception as e:
        print(f"Error determining document type: {str(e)}")
        return DocumentType.REGULAR

def _store_analytics_event(event: DocumentAnalyticsEvent):
    """Store a document analytics event"""
    # Store event in time-series format for efficient querying
    # Use year-month-day format for keys to easily aggregate by time period
    date_key = event.timestamp.strftime("%Y-%m-%d")
    events_key = f"doc_analytics_events_{date_key}"
    
    # Get existing events for this day
    daily_events = db.storage.json.get(events_key, default=[])
    daily_events.append(event.dict())
    
    # Store updated events
    db.storage.json.put(events_key, daily_events)
    
    # Also store per-document events for quicker access
    doc_events_key = f"doc_events_{event.document_id}"
    doc_events = db.storage.json.get(doc_events_key, default=[])
    doc_events.append(event.dict())
    
    # Limit stored events per document to prevent excessive growth
    if len(doc_events) > 10000:  # Arbitrary limit, adjust as needed
        doc_events = doc_events[-10000:]  # Keep most recent 10000 events
        
    db.storage.json.put(doc_events_key, doc_events)

def _update_document_analytics(document_id: str, event: DocumentAnalyticsEvent):
    """Update aggregated analytics for a document"""
    analytics_key = f"doc_analytics_{document_id}"
    analytics = db.storage.json.get(analytics_key, default=None)
    
    if analytics:
        analytics = DocumentAnalytics(**analytics)
    else:
        analytics = DocumentAnalytics(document_id=document_id)
    
    # Update metrics based on event type
    if event.event_type == AnalyticsEventType.VIEW:
        analytics.total_views += 1
        
        # Track unique viewers
        viewers_key = f"doc_viewers_{document_id}"
        unique_viewers = db.storage.json.get(viewers_key, default=set())
        # Convert to list and back because JSON doesn't support sets
        unique_viewers = set(unique_viewers) 
        unique_viewers.add(event.user_id)
        analytics.unique_viewers = len(unique_viewers)
        db.storage.json.put(viewers_key, list(unique_viewers))
        
        # Update access over time
        date_str = event.timestamp.strftime("%Y-%m-%d")
        analytics.access_over_time[date_str] = analytics.access_over_time.get(date_str, 0) + 1
        
        # Update sources
        if event.tracking_params and event.tracking_params.source:
            source = event.tracking_params.source.value
            analytics.sources[source] = analytics.sources.get(source, 0) + 1
            
    elif event.event_type == AnalyticsEventType.DOWNLOAD:
        analytics.total_downloads += 1
        
    elif event.event_type == AnalyticsEventType.SHARE:
        analytics.total_shares += 1
        
    elif event.event_type == AnalyticsEventType.TIME_SPENT and event.duration_seconds:
        # Update average time spent
        current_total = analytics.avg_time_spent_seconds * (analytics.total_views - 1)
        new_total = current_total + event.duration_seconds
        analytics.avg_time_spent_seconds = new_total / analytics.total_views if analytics.total_views > 0 else 0
        
    elif event.event_type == AnalyticsEventType.SECTION_VIEW and event.section_id:
        # Get section info
        sections_key = f"doc_sections_{document_id}"
        all_sections = db.storage.json.get(sections_key, default=[])
        section_info = next((s for s in all_sections if s["section_id"] == event.section_id), None)
        
        # Update popular sections
        popular_sections = {s["section_id"]: s for s in analytics.popular_sections}
        
        if event.section_id in popular_sections:
            popular_sections[event.section_id]["view_count"] = popular_sections[event.section_id].get("view_count", 0) + 1
        elif section_info:
            popular_sections[event.section_id] = {
                "section_id": event.section_id,
                "title": section_info.get("title", "Unknown Section"),
                "view_count": 1
            }
            
        # Sort by view count and keep top 10
        analytics.popular_sections = sorted(
            popular_sections.values(),
            key=lambda x: x.get("view_count", 0),
            reverse=True
        )[:10]
    
    # Store updated analytics
    db.storage.json.put(analytics_key, analytics.dict())

def _generate_tracking_id(document_id: str, user_id: str, params: Optional[TrackingParams] = None) -> str:
    """Generate a unique tracking ID for a document access link"""
    timestamp = str(time.time())
    unique_str = f"{document_id}_{user_id}_{timestamp}"
    
    if params:
        param_str = json.dumps(params.dict(), sort_keys=True)
        unique_str += f"_{param_str}"
    
    # Create hash of the string for a shorter ID
    tracking_hash = hashlib.sha256(unique_str.encode()).hexdigest()[:12]
    return tracking_hash

def _create_trackable_link(info: TrackableLinkInfo) -> str:
    """Store trackable link info and return the tracking URL"""
    # Store link info
    links_key = f"trackable_links"
    all_links = db.storage.json.get(links_key, default={})
    all_links[info.link_id] = info.dict()
    db.storage.json.put(links_key, all_links)
    
    # Also store in document links for quick access
    doc_links_key = f"doc_links_{info.document_id}"
    doc_links = db.storage.json.get(doc_links_key, default=[])
    doc_links.append(info.dict())
    db.storage.json.put(doc_links_key, doc_links)
    
    # Create tracking URL with parameters
    params = info.tracking_params.dict(exclude_none=True)
    param_str = "&".join([f"{k}={v}" for k, v in params.items() if v])
    
    base_url = "/view-document"
    tracking_url = f"{base_url}?id={info.document_id}&tid={info.link_id}"
    
    if param_str:
        tracking_url += f"&{param_str}"
        
    return tracking_url

def _get_link_info(link_id: str) -> Optional[TrackableLinkInfo]:
    """Get information about a trackable link"""
    links_key = "trackable_links"
    all_links = db.storage.json.get(links_key, default={})
    link_data = all_links.get(link_id)
    
    if not link_data:
        return None
        
    return TrackableLinkInfo(**link_data)

def _record_link_access(link_id: str):
    """Record an access to a trackable link"""
    link_info = _get_link_info(link_id)
    if not link_info:
        return
        
    # Update access count and timestamp
    link_info.times_accessed += 1
    link_info.last_accessed = datetime.utcnow()
    
    # Update in storage
    links_key = "trackable_links"
    all_links = db.storage.json.get(links_key, default={})
    all_links[link_id] = link_info.dict()
    db.storage.json.put(links_key, all_links)
    
    # Also update in document links
    doc_links_key = f"doc_links_{link_info.document_id}"
    doc_links = db.storage.json.get(doc_links_key, default=[])
    
    for i, link in enumerate(doc_links):
        if link.get("link_id") == link_id:
            doc_links[i] = link_info.dict()
            break
            
    db.storage.json.put(doc_links_key, doc_links)

@router.post("/documents/tracking/links/create")
async def create_trackable_link(request: CreateTrackableLinkRequest) -> TrackableLinkResponse:
    """Create a trackable link for a document"""
    if not request.document_id or not request.user_id:
        raise HTTPException(status_code=400, detail="Document ID and user ID are required")
    
    # Generate tracking ID
    tracking_id = _generate_tracking_id(request.document_id, request.user_id, request.tracking_params)
    
    # Set expiration date if specified
    expires_at = None
    if request.expires_in_days:
        expires_at = datetime.utcnow() + timedelta(days=request.expires_in_days)
    
    # Create link info
    link_info = TrackableLinkInfo(
        link_id=tracking_id,
        document_id=request.document_id,
        created_by=request.user_id,
        created_at=datetime.utcnow(),
        expires_at=expires_at,
        tracking_params=request.tracking_params
    )
    
    # Create and store trackable link
    tracking_url = _create_trackable_link(link_info)
    
    return TrackableLinkResponse(
        link_info=link_info,
        tracking_url=tracking_url
    )

@router.post("/documents/tracking/sections")
async def register_document_sections(request: DocumentSectionRequest):
    """Register sections of a document for tracking"""
    if not request.document_id or not request.user_id:
        raise HTTPException(status_code=400, detail="Document ID and user ID are required")
    
    if not request.sections:
        raise HTTPException(status_code=400, detail="At least one section must be provided")
    
    # Store document sections
    sections_key = f"doc_sections_{request.document_id}"
    db.storage.json.put(sections_key, [s.dict() for s in request.sections])
    
    return {"status": "success", "message": f"Registered {len(request.sections)} sections for tracking"}

@router.post("/documents/tracking/events")
async def record_analytics_event(request: RecordEventRequest):
    """Record a document analytics event"""
    if not request.document_id or not request.user_id:
        raise HTTPException(status_code=400, detail="Document ID and user ID are required")
    
    # Get tracking params if tracking ID is provided
    tracking_params = None
    if request.tracking_id:
        link_info = _get_link_info(request.tracking_id)
        if link_info:
            tracking_params = link_info.tracking_params
            _record_link_access(request.tracking_id)
    
    # Create event
    event = DocumentAnalyticsEvent(
        document_id=request.document_id,
        user_id=request.user_id,
        event_type=request.event_type,
        tracking_params=tracking_params,
        section_id=request.section_id,
        duration_seconds=request.duration_seconds,
        scroll_percentage=request.scroll_percentage,
        device_info=request.device_info,
        ip_address=request.ip_address,
        metadata=request.metadata
    )
    
    # Store event and update analytics
    _store_analytics_event(event)
    _update_document_analytics(request.document_id, event)
    
    return {"status": "success", "event_id": event.event_id}

@router.get("/documents/{document_id}/analytics")
async def get_document_analytics(document_id: str, user_id: str = None):
    """Get analytics for a document"""
    if not document_id or not user_id:
        raise HTTPException(status_code=400, detail="Document ID and user ID are required")
    
    # Get document analytics
    analytics_key = f"doc_analytics_{document_id}"
    analytics = db.storage.json.get(analytics_key)
    
    if not analytics:
        # Return empty analytics if none exist
        return DocumentAnalytics(document_id=document_id)
    
    return analytics

@router.get("/documents/{document_id}/links")
async def get_document_links(document_id: str, user_id: str = None):
    """Get all trackable links for a document"""
    if not document_id or not user_id:
        raise HTTPException(status_code=400, detail="Document ID and user ID are required")
    
    # Get document links
    doc_links_key = f"doc_links_{document_id}"
    doc_links = db.storage.json.get(doc_links_key, default=[])
    
    # Convert to TrackableLinkInfo objects
    links = [TrackableLinkInfo(**link) for link in doc_links]
    
    # Filter out expired links
    current_time = datetime.utcnow()
    active_links = [link for link in links if not link.expires_at or link.expires_at > current_time]
    
    return active_links

@router.get("/documents/{document_id}/sections")
async def get_document_sections(document_id: str, user_id: str = None):
    """Get all registered sections for a document"""
    if not document_id or not user_id:
        raise HTTPException(status_code=400, detail="Document ID and user ID are required")
    
    # Get document sections
    sections_key = f"doc_sections_{document_id}"
    sections = db.storage.json.get(sections_key, default=[])
    
    # Convert to DocumentSection objects
    return [DocumentSection(**section) for section in sections]

@router.get("/documents/analytics/summary")
async def get_analytics_summary(user_id: str = None, document_type: Optional[DocumentType] = None):
    """Get summary analytics for all documents of a user"""
    if not user_id:
        raise HTTPException(status_code=400, detail="User ID is required")
    
    # Get all documents for user
    from app.apis.document_management import list_documents
    user_docs = await list_documents(user_id=user_id)
    
    # Filter by document type if specified
    if document_type:
        filtered_docs = []
        for doc in user_docs:
            doc_type = _get_document_type(doc.document_id)
            if doc_type == document_type:
                filtered_docs.append(doc)
        user_docs = filtered_docs
    
    # Gather analytics for all documents
    all_analytics = []
    for doc in user_docs:
        analytics_key = f"doc_analytics_{doc.document_id}"
        analytics = db.storage.json.get(analytics_key)
        if analytics:
            all_analytics.append(analytics)
    
    # Calculate summary metrics
    total_views = sum(a.get("total_views", 0) for a in all_analytics)
    total_downloads = sum(a.get("total_downloads", 0) for a in all_analytics)
    total_shares = sum(a.get("total_shares", 0) for a in all_analytics)
    
    # Average time spent (weighted by views)
    total_time_weighted = sum(a.get("avg_time_spent_seconds", 0) * a.get("total_views", 0) for a in all_analytics)
    avg_time_overall = total_time_weighted / total_views if total_views > 0 else 0
    
    # Most viewed documents
    sorted_by_views = sorted(all_analytics, key=lambda x: x.get("total_views", 0), reverse=True)
    top_documents = [{
        "document_id": a.get("document_id"),
        "views": a.get("total_views", 0),
        "downloads": a.get("total_downloads", 0)
    } for a in sorted_by_views[:5]]
    
    # Combine access over time across all documents
    access_over_time = {}
    for analytics in all_analytics:
        doc_access = analytics.get("access_over_time", {})
        for date, count in doc_access.items():
            access_over_time[date] = access_over_time.get(date, 0) + count
    
    # Sort by date
    sorted_access = dict(sorted(access_over_time.items()))
    
    return {
        "total_documents": len(user_docs),
        "total_views": total_views,
        "total_downloads": total_downloads,
        "total_shares": total_shares,
        "avg_time_spent_seconds": avg_time_overall,
        "top_documents": top_documents,
        "access_over_time": sorted_access
    }
