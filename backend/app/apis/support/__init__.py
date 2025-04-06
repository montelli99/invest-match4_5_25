from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from firebase_admin import auth
import databutton as db
import json
import re
import requests

API_URL = "http://localhost:8000/api"

def get_current_user(authorization: str) -> Dict[str, Any]:
    """Get the current user from Firebase token"""
    if not authorization or not authorization.startswith('Bearer '):
        raise HTTPException(status_code=401, detail='Missing or invalid token')
    
    try:
        token = authorization.split(' ')[1]
        return auth.verify_id_token(token)
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e)) from e

def is_admin(user: Dict[str, Any]) -> bool:
    """Check if user has admin role"""
    try:
        claims = user.get('claims', {})
        return claims.get('admin', False)
    except Exception:
        return False

router = APIRouter(prefix="/support", tags=["support"])

def sanitize_storage_key(key: str) -> str:
    """Sanitize storage key to only allow alphanumeric and ._- symbols"""
    return re.sub(r'[^a-zA-Z0-9._-]', '', key)

class TicketPriority(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"
    urgent = "urgent"

class TicketStatus(str, Enum):
    open = "open"
    in_progress = "in_progress"
    resolved = "resolved"
    closed = "closed"

class TicketCategory(BaseModel):
    id: str
    name: str
    description: Optional[str] = None

class Attachment(BaseModel):
    id: str
    filename: str
    content_type: str
    size: int
    url: str
    uploaded_at: datetime
    uploaded_by: str

class TicketRequest(BaseModel):
    title: str
    description: str
    category_id: str
    priority: TicketPriority = TicketPriority.medium
    attachments: Optional[List[str]] = None

class HistoryEntry(BaseModel):
    field: str
    old_value: str
    new_value: str
    timestamp: datetime
    user_id: str

class Ticket(BaseModel):
    id: str
    title: str
    description: str
    category_id: str
    user_id: str
    priority: TicketPriority
    status: TicketStatus
    created_at: datetime
    updated_at: datetime
    attachments: Optional[List[Attachment]] = None
    assigned_to: Optional[str] = None
    resolution: Optional[str] = None
    history: Optional[List[HistoryEntry]] = None

class TicketComment(BaseModel):
    id: str
    ticket_id: str
    user_id: str
    content: str
    created_at: datetime
    attachments: Optional[List[Attachment]] = None

class KnowledgeBaseArticle(BaseModel):
    id: str
    title: str
    content: str
    category_id: str
    tags: List[str]
    created_at: datetime
    updated_at: datetime
    author_id: str

class HowToGuide(BaseModel):
    id: str
    title: str
    content: str
    feature: str
    steps: List[str]
    created_at: datetime
    updated_at: datetime
    author_id: str

def initialize_storage():
    """Initialize storage with empty data if not exists"""
    try:
        if not db.storage.json.exists('tickets'):
            db.storage.json.put('tickets', [])
    except Exception as err:
        print(f"Error initializing storage: {err}")
        raise HTTPException(status_code=500, detail="Failed to initialize storage") from err

def get_tickets() -> List[Ticket]:
    """Get all tickets from storage"""
    try:
        initialize_storage()
        tickets = db.storage.json.get('tickets', default=[])
        return [Ticket(**ticket) for ticket in tickets]
    except Exception as err:
        print(f"Error getting tickets: {err}")
        # Return empty list for get operations instead of raising
        return []

def save_tickets(tickets: List[Ticket]):
    """Save tickets to storage"""
    try:
        # Use model_dump instead of dict() for Pydantic v2
        db.storage.json.put('tickets', [ticket.model_dump() for ticket in tickets])
    except Exception as err:
        print(f"Error saving tickets: {err}")
        raise HTTPException(
            status_code=500, 
            detail="Failed to save ticket data"
        ) from err

class TicketWithSuggestions(BaseModel):
    ticket: Ticket
    suggested_articles: List[KnowledgeBaseArticle]

@router.post("/tickets")
def create_ticket(request: TicketRequest, current_user: Dict[str, Any]) -> TicketWithSuggestions:
    """Create a new support ticket"""
    user_id = current_user['uid']

    tickets = get_tickets()
    
    # Create new ticket
    new_ticket = Ticket(
        id=f"ticket_{len(tickets) + 1}",
        title=request.title,
        description=request.description,
        category_id=request.category_id,
        user_id=user_id,
        priority=request.priority,
        status=TicketStatus.open,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
        attachments=[],
    )
    
    tickets.append(new_ticket)
    save_tickets(tickets)
    
    # Search for relevant articles based on ticket title and description
    search_query = f"{request.title} {request.description}"
    suggested_articles = search_kb_articles(search_query)
    
    return TicketWithSuggestions(
        ticket=new_ticket,
        suggested_articles=suggested_articles
    )

@router.get("/tickets")
def list_tickets(current_user: Dict[str, Any], status: Optional[TicketStatus] = None) -> List[Ticket]:
    """List all tickets or filter by status"""
    user_id = current_user['uid']

    tickets = get_tickets()
    
    # Filter by user and status if provided
    filtered_tickets = [
        ticket for ticket in tickets 
        if ticket.user_id == user_id 
        and (status is None or ticket.status == status)
    ]
    
    return filtered_tickets

@router.get("/tickets/{ticket_id}")
def get_ticket(ticket_id: str, current_user: Dict[str, Any]) -> Ticket:
    """Get a specific ticket"""
    user_id = current_user['uid']

    tickets = get_tickets()
    ticket = next((t for t in tickets if t.id == ticket_id), None)
    
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    if ticket.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to view this ticket")
    
    return ticket

@router.put("/tickets/{ticket_id}")
def update_ticket(ticket_id: str, updates: Dict[str, Any], current_user: Dict[str, Any]) -> Ticket:
    """Update a ticket"""
    user_id = current_user['uid']

    tickets = get_tickets()
    ticket_index = next((i for i, t in enumerate(tickets) if t.id == ticket_id), None)
    
    if ticket_index is None:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    ticket = tickets[ticket_index]
    
    # Only allow updates by ticket owner or admin
    if ticket.user_id != user_id and not is_admin(current_user):
        raise HTTPException(status_code=403, detail="Not authorized to update this ticket")
    
    # Update allowed fields and track history
    allowed_fields = {"status", "priority", "resolution", "assigned_to"}
    now = datetime.utcnow()
    
    # Initialize history if not exists
    if not ticket.history:
        ticket.history = []
    
    for field, value in updates.items():
        if field in allowed_fields:
            old_value = getattr(ticket, field)
            if old_value != value:  # Only track if value actually changed
                setattr(ticket, field, value)
                # Add history entry
                ticket.history.append(HistoryEntry(
                    field=field,
                    old_value=str(old_value) if old_value else "",
                    new_value=str(value),
                    timestamp=now,
                    user_id=user_id
                ))
    
    ticket.updated_at = datetime.utcnow()
    tickets[ticket_index] = ticket
    save_tickets(tickets)
    
    return ticket

@router.post("/tickets/{ticket_id}/attachments")
def add_attachment(ticket_id: str, file: str, current_user: Dict[str, Any]) -> Ticket:
    """Add an attachment to a ticket
    
    Args:
        ticket_id: ID of the ticket to attach file to
        file: Base64 encoded file content
        token: Authentication token
        
    Returns:
        Updated ticket with new attachment
        
    Raises:
        HTTPException: If file is invalid or too large
    """
    user_id = current_user['uid']

    tickets = get_tickets()
    ticket_index = next((i for i, t in enumerate(tickets) if t.id == ticket_id), None)
    
    if ticket_index is None:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    ticket = tickets[ticket_index]
    
    if ticket.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to update this ticket")
    
    # Process and store the attachment
    try:
        # Validate file input
        if not file:
            raise ValueError("File is required")
            
        attachment_id = f"attachment_{len(ticket.attachments or []) + 1}"
        
        # Decode base64 file content
        import base64
        import mimetypes
        from io import BytesIO
        
        # Split base64 string if it contains data URI scheme
        if ',' in file:
            file = file.split(',')[1]
        
        file_data = base64.b64decode(file)
        file_size = len(file_data)
        
        # Validate file size (5MB limit)
        MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB in bytes
        if file_size > MAX_FILE_SIZE:
            raise ValueError(f"File too large. Maximum size is {MAX_FILE_SIZE/1024/1024}MB")
        
        # Detect content type
        _ = BytesIO(file_data)  # Create buffer to validate file data
        content_type, _ = mimetypes.guess_type(attachment_id)
        if not content_type:
            content_type = "application/octet-stream"
            
        # Store file securely
        storage_key = sanitize_storage_key(f"ticket_attachments/{ticket_id}/{attachment_id}")
        db.storage.binary.put(storage_key, file_data)
        
        # Create attachment record
        attachment = Attachment(
            id=attachment_id,
            filename=attachment_id,  # We'll update this when we add proper filename handling
            content_type=content_type,
            size=file_size,
            url=f"/api/support/attachments/{ticket_id}/{attachment_id}",
            uploaded_at=datetime.utcnow(),
            uploaded_by=user_id
        )
        
        if ticket.attachments is None:
            ticket.attachments = []
        ticket.attachments.append(attachment)
        
        tickets[ticket_index] = ticket
        save_tickets(tickets)
        
        return ticket
    except ValueError as err:
        raise HTTPException(status_code=400, detail=str(err)) from err
    except Exception as err:
        print(f"Error adding attachment: {err}")
        raise HTTPException(
            status_code=500, 
            detail="Failed to process attachment"
        ) from err

# Knowledge Base endpoints

def get_kb_articles() -> List[KnowledgeBaseArticle]:
    """Get all knowledge base articles from storage"""
    try:
        articles = db.storage.json.get('kb_articles', default=[])
        return [KnowledgeBaseArticle(**article) for article in articles]
    except Exception as e:
        print(f"Error getting KB articles: {e}")
        return []

def search_kb_articles(query: str) -> List[KnowledgeBaseArticle]:
    """Search knowledge base articles based on query"""
    try:
        # Call the knowledge base API's search endpoint
        response = requests.get(f"{API_URL}/kb/search/{query}")
        if response.status_code == 200:
            return [KnowledgeBaseArticle(**article) for article in response.json()]
        return []
    except Exception as e:
        print(f"Error searching KB articles: {e}")
        return []

