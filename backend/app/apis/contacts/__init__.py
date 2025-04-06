from typing import List, Optional, Dict, Tuple, Any
from datetime import datetime
from app.apis.models import Contact, ContactMatch, TokenRequest, ExtendedUserProfile, ContactOwnershipHistory
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import databutton as db
import uuid

router = APIRouter(tags=["contacts"])

class TransferOwnershipRequest(BaseModel):
    """Request model for transferring contact ownership"""
    contact_id: str
    new_owner_id: str
    reason: Optional[str] = None
    token: dict

class TransferOwnershipResponse(BaseModel):
    """Response model for ownership transfer"""
    status: str
    message: str
    contact: Contact

class ImportContactsRequest(BaseModel):
    """Request model for importing contacts"""
    contacts: List[Contact]
    token: dict

class ImportContactsResponse(BaseModel):
    """Response model for import contacts operation"""
    status: str
    imported: int


class IntroductionRequest(BaseModel):
    """Request model for requesting an introduction"""
    contact_email: str
    message: Optional[str] = None
    token: dict

class IntroductionResponse(BaseModel):
    """Response model for introduction request"""
    status: str
    message: str


@router.post("/contacts/import", response_model=ImportContactsResponse)
def import_contacts(body: ImportContactsRequest):
    """Import contacts and automatically assign the uploader as lead owner"""
    try:
        user_id = body.token.get('uid')  # Get user ID from token
        if not user_id:
            raise HTTPException(status_code=401, detail="Unauthorized")

        # Get user profile for owner details
        user_profiles = db.storage.json.get('user_profiles', default={})
        owner_profile = user_profiles.get(user_id)
        if not owner_profile:
            raise HTTPException(status_code=404, detail="Owner profile not found")

        # Get existing contacts or initialize empty dict
        all_contacts = db.storage.json.get('user_contacts', default={})
        user_contacts = all_contacts.get(user_id, [])
        
        # Add new contacts
        imported_count = 0
        current_time = datetime.utcnow().isoformat()
        
        for contact in body.contacts:
            contact_dict = contact.dict()
            
            # Check if contact already exists in user's list
            existing_contact = next(
                (c for c in user_contacts if c.get('email') == contact_dict['email']), 
                None
            )
            
            if existing_contact:
                # Update existing contact
                existing_contact.update(contact_dict)
                existing_contact['last_updated'] = current_time
            else:
                # Initialize new contact with ownership info
                contact_dict['id'] = str(uuid.uuid4())
                contact_dict['owner_id'] = user_id
                contact_dict['owner_name'] = owner_profile.get('name', '')
                contact_dict['owner_email'] = owner_profile.get('email')
                contact_dict['owner_phone'] = owner_profile.get('phone')
                contact_dict['ownership_date'] = current_time
                contact_dict['last_updated'] = current_time
                contact_dict['ownership_history'] = [{
                    'contact_id': contact_dict['id'],
                    'new_owner_id': user_id,
                    'change_date': current_time,
                    'changed_by_id': user_id
                }]
                contact_dict['introduction_requests'] = []
                contact_dict['matches'] = []  # Store matches here
                user_contacts.append(contact_dict)
                imported_count += 1
            
            # Find matches among fund managers
            for profile_id, profile in user_profiles.items():
                if profile.get('role') in ['fund_manager', 'capital_raiser']:
                    match_score, matching_criteria = calculate_match_score(contact_dict, profile)
                    if match_score > 0.3:  # Lower threshold for more matches
                        match_info = {
                            'user_id': profile_id,
                            'score': match_score,
                            'criteria': matching_criteria,
                            'matched_at': datetime.utcnow().isoformat()
                        }
                        if existing_contact:
                            if 'matches' not in existing_contact:
                                existing_contact['matches'] = []
                            existing_contact['matches'].append(match_info)
                        else:
                            contact_dict['matches'].append(match_info)

        # Save updated contacts
        all_contacts[user_id] = user_contacts
        db.storage.json.put('user_contacts', all_contacts)

        return ImportContactsResponse(status="success", imported=imported_count)
    except Exception as err:
        raise HTTPException(status_code=500, detail=str(err)) from err

@router.get("/contacts/list", response_model=List[Contact])
def list_contacts(token: TokenRequest):
    try:
        user_id = token.token.get('uid')
        if not user_id:
            raise HTTPException(status_code=401, detail="Unauthorized")

        # Get user's contacts
        all_contacts = db.storage.json.get('user_contacts', default={})
        user_contacts = all_contacts.get(user_id, [])
        
        # Sort contacts by last_updated
        user_contacts.sort(key=lambda x: x.get('last_updated', ''), reverse=True)
        
        return user_contacts
    except Exception as err:
        raise HTTPException(status_code=500, detail=str(err)) from err


@router.post("/contact-matches", response_model=List[ContactMatch], operation_id="get_contact_matches")
def get_contact_matches(body: TokenRequest):
    try:
        user_id = body.token.get('uid')
        if not user_id:
            raise HTTPException(status_code=401, detail="Unauthorized")

        # Get user's contacts with their matches
        all_contacts = db.storage.json.get('user_contacts', default={})
        user_contacts = all_contacts.get(user_id, [])
        
        # Get all profiles for enriching match data
        user_profiles = db.storage.json.get('user_profiles', default={})
        
        # Format matches for response
        matches = []
        for contact in user_contacts:
            for match in contact.get('matches', []):
                profile = user_profiles.get(match['user_id'])
                if profile:  # Only include if profile still exists
                    matches.append({
                        "contact": contact,
                        "match": profile,
                        "score": match['score'],
                        "matching_criteria": match['criteria']
                    })

        return matches
    except Exception as err:
        raise HTTPException(status_code=500, detail=str(err)) from err

@router.post("/request-introduction", response_model=IntroductionResponse)
def request_introduction(body: IntroductionRequest):
    """Request an introduction to a contact"""
    try:
        user_id = body.token.get('uid')
        if not user_id:
            raise HTTPException(status_code=401, detail="Unauthorized")

        # Get all contacts
        all_contacts = db.storage.json.get('user_contacts', default={})
        
        # Get user profiles to find the contact owner
        user_profiles = db.storage.json.get('user_profiles', default={})
        
        # Find the contact and its owner
        contact_found = False
        for owner_id, contacts in all_contacts.items():
            for contact in contacts:
                if contact['email'] == body.contact_email:
                    contact_found = True
                    
                    # Check if user is already in introduction requests
                    if user_id in contact.get('introduction_requests', []):
                        return IntroductionResponse(
                            status="error",
                            message="Introduction already requested"
                        )
                    
                    # Check if there's a match between the user and the contact
                    matches = contact.get('matches', [])
                    user_match = next((m for m in matches if m['user_id'] == user_id), None)
                    
                    if not user_match:
                        return IntroductionResponse(
                            status="error",
                            message="You must have a match with this contact to request an introduction"
                        )
                    
                    # Add the introduction request with match score
                    if 'introduction_requests' not in contact:
                        contact['introduction_requests'] = []
                    
                    request_info = {
                        'user_id': user_id,
                        'message': body.message,
                        'requested_at': datetime.utcnow().isoformat(),
                        'match_score': user_match['score']
                    }
                    contact['introduction_requests'].append(request_info)
                    
                    # Save the updated contacts
                    db.storage.json.put('user_contacts', all_contacts)
                    
                    return IntroductionResponse(
                        status="success",
                        message="Introduction request sent successfully"
                    )
        
        if not contact_found:
            return IntroductionResponse(
                status="error",
                message="Contact not found"
            )
            
    except Exception as err:
        raise HTTPException(status_code=500, detail=str(err)) from err

@router.post("/contacts/transfer-ownership", response_model=TransferOwnershipResponse)
def transfer_ownership(body: TransferOwnershipRequest):
    """Transfer ownership of a contact to another user"""
    try:
        user_id = body.token.get('uid')
        if not user_id:
            raise HTTPException(status_code=401, detail="Unauthorized")

        # Get user profiles
        user_profiles = db.storage.json.get('user_profiles', default={})
        new_owner = user_profiles.get(body.new_owner_id)
        if not new_owner:
            raise HTTPException(status_code=404, detail="New owner not found")

        # Get all contacts
        all_contacts = db.storage.json.get('user_contacts', default={})
        user_contacts = all_contacts.get(user_id, [])

        # Find the contact
        contact = next((c for c in user_contacts if c.get('id') == body.contact_id), None)
        if not contact:
            raise HTTPException(status_code=404, detail="Contact not found")

        # Create ownership history entry
        current_time = datetime.utcnow().isoformat()
        history_entry = ContactOwnershipHistory(
            contact_id=body.contact_id,
            previous_owner_id=user_id,
            new_owner_id=body.new_owner_id,
            change_date=current_time,
            reason=body.reason,
            changed_by_id=user_id
        ).dict()

        # Update contact ownership
        contact['owner_id'] = body.new_owner_id
        contact['owner_name'] = new_owner.get('name', '')
        contact['owner_email'] = new_owner.get('email')
        contact['owner_phone'] = new_owner.get('phone')
        contact['ownership_date'] = current_time
        contact['last_updated'] = current_time
        contact['ownership_history'].append(history_entry)

        # Move contact to new owner's list
        user_contacts.remove(contact)
        if body.new_owner_id not in all_contacts:
            all_contacts[body.new_owner_id] = []
        all_contacts[body.new_owner_id].append(contact)

        # Save changes
        db.storage.json.put('user_contacts', all_contacts)

        return TransferOwnershipResponse(
            status="success",
            message=f"Contact ownership transferred to {new_owner.get('name')}",
            contact=Contact(**contact)
        )

    except Exception as err:
        raise HTTPException(status_code=500, detail=str(err)) from err

def calculate_match_score(contact: dict, profile: dict) -> Tuple[float, Dict[str, bool]]:
    """Calculate match score between a contact and a profile.
    Returns a tuple of (score, matching_criteria)"""
    score = 0.0
    weights = {
        "role": 0.15,
        "fund_type": 0.15,
        "investment_focus": 0.15,
        "fund_size": 0.15,
        "investment_horizon": 0.10,
        "risk_profile": 0.10,
        "sectors": 0.10,
        "experience": 0.10
    }
    
    matching_criteria = {
        "role_match": False,
        "fund_type_match": False,
        "investment_focus_match": False,
        "fund_size_match": False,
        "investment_horizon_match": False,
        "risk_profile_match": False,
        "sectors_match": False,
        "experience_match": False
    }

    # Compare roles
    if contact.get("role") == profile.get("role"):
        score += weights["role"]
        matching_criteria["role_match"] = True

    # Compare fund types
    if profile.get("fund_type") and contact.get("fund_type") == profile.get("fund_type"):
        score += weights["fund_type"]
        matching_criteria["fund_type_match"] = True

    # Compare investment focus
    contact_focus = set(contact.get("investment_focus", []))
    profile_focus = set(profile.get("investment_focus", []))
    if contact_focus and profile_focus:
        overlap = len(contact_focus.intersection(profile_focus))
        if overlap > 0:
            focus_score = (overlap / max(len(contact_focus), len(profile_focus))) * weights["investment_focus"]
            score += focus_score
            matching_criteria["investment_focus_match"] = True

    # Compare fund size
    contact_size = contact.get("fund_size")
    profile_size = profile.get("fund_size")
    if contact_size and profile_size:
        # Consider it a match if within 20% range
        size_diff = abs(contact_size - profile_size) / max(contact_size, profile_size)
        if size_diff <= 0.2:
            score += weights["fund_size"]
            matching_criteria["fund_size_match"] = True

    # Compare investment horizon
    contact_horizon = contact.get("investment_horizon")
    profile_horizon = profile.get("investment_horizon")
    if contact_horizon and profile_horizon:
        # Consider it a match if within 2 years difference
        if abs(contact_horizon - profile_horizon) <= 2:
            score += weights["investment_horizon"]
            matching_criteria["investment_horizon_match"] = True

    # Compare risk profile
    contact_risk = contact.get("risk_profile")
    profile_risk = profile.get("risk_profile")
    if contact_risk and profile_risk:
        # Exact match for risk profile
        if contact_risk == profile_risk:
            score += weights["risk_profile"]
            matching_criteria["risk_profile_match"] = True

    # Compare sectors
    contact_sectors = set(contact.get("sectors", []))
    profile_sectors = set(profile.get("sectors", []))
    if contact_sectors and profile_sectors:
        overlap = len(contact_sectors.intersection(profile_sectors))
        if overlap > 0:
            sectors_score = (overlap / max(len(contact_sectors), len(profile_sectors))) * weights["sectors"]
            score += sectors_score
            matching_criteria["sectors_match"] = True

    # Compare experience
    contact_exp = contact.get("years_experience")
    profile_exp = profile.get("years_experience")
    if contact_exp and profile_exp:
        # Consider it a match if within 3 years difference
        if abs(contact_exp - profile_exp) <= 3:
            score += weights["experience"]
            matching_criteria["experience_match"] = True

    return score, matching_criteria