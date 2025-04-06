from fastapi import APIRouter, HTTPException, Request, status
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import databutton as db
import json
from datetime import datetime
import random

router = APIRouter(prefix="/contact-matching")

class ContactMatchSettings(BaseModel):
    enable_global_matching: bool = Field(default=False, description="Enable global matching of all contacts")
    auto_share_matches: bool = Field(default=False, description="Automatically share matched contacts with connection")
    minimum_match_score: int = Field(default=70, description="Minimum match score percentage", ge=0, le=100)
    match_across_all_users: bool = Field(default=False, description="Allow matching with all users instead of just connections")

class ContactMatchResponse(BaseModel):
    settings: ContactMatchSettings
    message: str = "Contact matching settings updated successfully"

class Contact(BaseModel):
    id: str
    name: str
    email: str
    company: Optional[str] = None
    role: Optional[str] = None
    phone: Optional[str] = None
    owner_id: str
    owner_name: str
    owner_email: Optional[str] = None
    owner_phone: Optional[str] = None
    ownership_date: str
    last_updated: str
    match_score: Optional[int] = None

class ContactMatchResult(BaseModel):
    contact: Contact
    match_score: int
    matched_fields: Dict[str, Any]

class ContactMatchListResponse(BaseModel):
    matches: List[ContactMatchResult]
    total: int

@router.get("/settings")
async def get_matching_settings(request: Request):
    """Get user's contact matching settings"""
    user_id = request.headers.get("user-id", "demo-user")
    
    # Get stored settings or use defaults
    try:
        settings_json = db.storage.text.get(f"contact_matching_settings_{user_id}", default=None)
        if settings_json:
            settings = ContactMatchSettings.model_validate_json(settings_json)
        else:
            settings = ContactMatchSettings()
    except Exception as e:
        settings = ContactMatchSettings()
    
    return ContactMatchResponse(settings=settings)

@router.post("/settings")
async def update_matching_settings(settings: ContactMatchSettings, request: Request):
    """Update user's contact matching settings"""
    user_id = request.headers.get("user-id", "demo-user")
    
    # Store settings
    db.storage.text.put(f"contact_matching_settings_{user_id}", settings.model_dump_json())
    
    return ContactMatchResponse(settings=settings)

@router.get("/global-matches")
async def get_global_matches(request: Request):
    """Get globally matched contacts for a user's contacts"""
    user_id = request.headers.get("user-id", "demo-user")
    
    # Get user settings
    try:
        settings_json = db.storage.text.get(f"contact_matching_settings_{user_id}", default=None)
        if settings_json:
            settings = ContactMatchSettings.model_validate_json(settings_json)
        else:
            settings = ContactMatchSettings()
    except Exception:
        settings = ContactMatchSettings()
    
    # Check if global matching is enabled
    if not settings.enable_global_matching:
        return ContactMatchListResponse(matches=[], total=0)
    
    # Get user's contacts
    try:
        contacts_json = db.storage.text.get(f"contacts_{user_id}", default=None)
        if not contacts_json:
            return ContactMatchListResponse(matches=[], total=0)
        
        user_contacts = json.loads(contacts_json)
    except Exception:
        return ContactMatchListResponse(matches=[], total=0)
    
    # Get all contacts from all users if match_across_all_users is enabled
    # Otherwise, just get contacts from user's connections
    all_contacts = []
    
    if settings.match_across_all_users:
        # List all contact files
        contact_files = db.storage.text.list()
        for file in contact_files:
            if file.name.startswith("contacts_") and file.name != f"contacts_{user_id}":
                try:
                    other_contacts = json.loads(db.storage.text.get(file.name))
                    all_contacts.extend(other_contacts)
                except Exception:
                    continue
    else:
        # Get user's connections
        try:
            connections_json = db.storage.text.get(f"connections_{user_id}", default=None)
            if connections_json:
                connections = json.loads(connections_json)
                for connection in connections:
                    connection_id = connection.get("id")
                    if connection_id:
                        try:
                            connection_contacts = json.loads(db.storage.text.get(f"contacts_{connection_id}", default="[]"))
                            all_contacts.extend(connection_contacts)
                        except Exception:
                            continue
        except Exception:
            pass
    
    # Calculate matches
    matches = []
    
    for user_contact in user_contacts:
        for other_contact in all_contacts:
            # Skip if same contact (by email)
            if user_contact.get("email") == other_contact.get("email"):
                continue
                
            match_score = calculate_match_score(user_contact, other_contact)
            
            # Only include matches above minimum threshold
            if match_score >= settings.minimum_match_score:
                # Create match result
                contact_obj = Contact(
                    id=other_contact.get("id"),
                    name=other_contact.get("name"),
                    email=other_contact.get("email"),
                    company=other_contact.get("company", ""),
                    role=other_contact.get("role", ""),
                    phone=other_contact.get("phone", ""),
                    owner_id=other_contact.get("owner_id", ""),
                    owner_name=other_contact.get("owner_name", ""),
                    owner_email=other_contact.get("owner_email", ""),
                    owner_phone=other_contact.get("owner_phone", ""),
                    ownership_date=other_contact.get("ownership_date", datetime.now().isoformat()),
                    last_updated=other_contact.get("last_updated", datetime.now().isoformat()),
                    match_score=match_score
                )
                
                matched_fields = {
                    "company": other_contact.get("company") == user_contact.get("company") and user_contact.get("company"),
                    "role": other_contact.get("role") == user_contact.get("role") and user_contact.get("role"),
                    "industry": other_contact.get("industry") == user_contact.get("industry") and user_contact.get("industry")
                }
                
                match_result = ContactMatchResult(
                    contact=contact_obj,
                    match_score=match_score,
                    matched_fields=matched_fields
                )
                
                matches.append(match_result)
    
    # Sort by match score (highest first)
    matches = sorted(matches, key=lambda x: x.match_score, reverse=True)
    
    return ContactMatchListResponse(matches=matches, total=len(matches))

def calculate_match_score(contact1: Dict[str, Any], contact2: Dict[str, Any]) -> int:
    """Calculate a match score between two contacts"""
    score = 0
    total_possible = 0
    
    # Company match (30 points)
    if contact1.get("company") and contact2.get("company"):
        total_possible += 30
        if contact1.get("company").lower() == contact2.get("company").lower():
            score += 30
    
    # Role/position match (20 points) with Fund of Funds compatibility
    if contact1.get("role") and contact2.get("role"):
        total_possible += 20
        
        # Exact role match
        if contact1.get("role").lower() == contact2.get("role").lower():
            score += 20
        # Fund of Funds to Fund Manager compatibility
        elif (contact1.get("role").lower() == "fund_of_funds" and contact2.get("role").lower() == "fund_manager") or \
             (contact1.get("role").lower() == "fund_manager" and contact2.get("role").lower() == "fund_of_funds"):
            score += 18  # High compatibility but not perfect
    
    # Industry match (25 points)
    if contact1.get("industry") and contact2.get("industry"):
        total_possible += 25
        if contact1.get("industry").lower() == contact2.get("industry").lower():
            score += 25
    
    # Location match (15 points)
    if contact1.get("location") and contact2.get("location"):
        total_possible += 15
        if contact1.get("location").lower() == contact2.get("location").lower():
            score += 15
    
    # Interests match (10 points)
    if contact1.get("interests") and contact2.get("interests"):
        total_possible += 10
        # Check if there's at least one common interest
        interests1 = [i.lower() for i in contact1.get("interests", [])]
        interests2 = [i.lower() for i in contact2.get("interests", [])]
        if set(interests1) & set(interests2):
            score += 10
    
    # If no fields to compare, assign a random score between 60-80
    if total_possible == 0:
        return random.randint(60, 80)
    
    # Calculate percentage score
    return int((score / total_possible) * 100)
