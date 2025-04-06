from typing import List, Optional
from datetime import datetime
from enum import Enum
from pydantic import BaseModel
from fastapi import APIRouter, HTTPException
import databutton as db

router = APIRouter()

class IntroductionStatus(str, Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    DECLINED = "declined"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class IntroductionRequest(BaseModel):
    id: Optional[str] = None
    requester_id: str
    target_id: str
    intermediary_id: str
    message: str
    created_at: Optional[datetime] = None
    status: Optional[IntroductionStatus] = IntroductionStatus.PENDING
    notes: Optional[str] = None

class IntroductionResponse(BaseModel):
    id: str
    requester_id: str
    target_id: str
    intermediary_id: str
    message: str
    created_at: datetime
    status: IntroductionStatus
    notes: Optional[str] = None

class IntroductionUpdate(BaseModel):
    status: IntroductionStatus
    notes: Optional[str] = None

def generate_introduction_id() -> str:
    """Generate a unique ID for an introduction"""
    import uuid
    return f"intro_{uuid.uuid4().hex[:12]}"

def get_introduction_key(intro_id: str) -> str:
    """Generate a storage key for an introduction"""
    return f"introductions/{intro_id}"

def get_user_introductions_key(user_id: str) -> str:
    """Generate a storage key for a user's introduction list"""
    return f"user_introductions/{user_id}"

@router.post("/introductions", response_model=IntroductionResponse)
def create_introduction(request: IntroductionRequest) -> IntroductionResponse:
    """Create a new introduction request"""
    try:
        # Generate ID and set creation time
        intro_id = generate_introduction_id()
        request.id = intro_id
        request.created_at = datetime.utcnow()
        
        # Store the introduction
        intro_data = request.dict()
        db.storage.json.put(get_introduction_key(intro_id), intro_data)
        
        # Update user introduction lists
        for user_id in [request.requester_id, request.target_id, request.intermediary_id]:
            user_intros_key = get_user_introductions_key(user_id)
            try:
                user_intros = db.storage.json.get(user_intros_key)
            except Exception:
                user_intros = []
            user_intros.append(intro_id)
            db.storage.json.put(user_intros_key, user_intros)
        
        return IntroductionResponse(**intro_data)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create introduction: {str(e)}") from e

@router.get("/introductions/{intro_id}", response_model=IntroductionResponse)
def get_introduction(intro_id: str) -> IntroductionResponse:
    """Get details of a specific introduction"""
    try:
        intro_data = db.storage.json.get(get_introduction_key(intro_id))
        return IntroductionResponse(**intro_data)
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Introduction not found: {intro_id}") from e

@router.get("/users/{user_id}/introductions", response_model=List[IntroductionResponse])
def list_user_introductions(user_id: str) -> List[IntroductionResponse]:
    """List all introductions for a user"""
    try:
        # Get user's introduction IDs
        try:
            intro_ids = db.storage.json.get(get_user_introductions_key(user_id))
        except Exception:
            return []
        
        # Fetch each introduction
        introductions = []
        for intro_id in intro_ids:
            try:
                intro_data = db.storage.json.get(get_introduction_key(intro_id))
                introductions.append(IntroductionResponse(**intro_data))
            except Exception:
                continue  # Skip invalid introductions
        
        return introductions
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list introductions: {str(e)}") from e

@router.patch("/introductions/{intro_id}", response_model=IntroductionResponse)
def update_introduction_status(intro_id: str, update: IntroductionUpdate) -> IntroductionResponse:
    """Update the status of an introduction"""
    try:
        # Get existing introduction
        intro_data = db.storage.json.get(get_introduction_key(intro_id))
        
        # Update status and notes
        intro_data["status"] = update.status
        if update.notes:
            intro_data["notes"] = update.notes
        
        # Save updated introduction
        db.storage.json.put(get_introduction_key(intro_id), intro_data)
        
        return IntroductionResponse(**intro_data)
    
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Introduction not found: {intro_id}") from e

@router.get("/introductions/{intro_id}/status")
def get_introduction_status(intro_id: str) -> dict:
    """Get just the status of an introduction"""
    try:
        intro_data = db.storage.json.get(get_introduction_key(intro_id))
        return {
            "status": intro_data["status"],
            "notes": intro_data.get("notes")
        }
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Introduction not found: {intro_id}") from e