from typing import List, Optional
from pydantic import BaseModel
from fastapi import APIRouter
import databutton as db
import json

router = APIRouter()

class Reaction(BaseModel):
    message_id: str
    user_id: str
    emoji: str
    timestamp: str

class AddReactionRequest(BaseModel):
    message_id: str
    emoji: str
    user_id: str

class RemoveReactionRequest(BaseModel):
    message_id: str
    emoji: str
    user_id: str

class GetReactionsResponse(BaseModel):
    reactions: List[Reaction]

def get_reactions_store():
    try:
        reactions = db.storage.json.get("message_reactions")
    except FileNotFoundError:
        reactions = {}
        db.storage.json.put("message_reactions", reactions)
    return reactions

@router.post("/add-reaction")
def add_reaction(body: AddReactionRequest) -> Reaction:
    reactions = get_reactions_store()
    
    # Create unique key for message reactions
    message_key = f"{body.message_id}"
    if message_key not in reactions:
        reactions[message_key] = []
    
    # Check if user already reacted with this emoji
    existing_reaction = next(
        (r for r in reactions[message_key] 
         if r["user_id"] == body.user_id and r["emoji"] == body.emoji),
        None
    )
    
    if not existing_reaction:
        # Add new reaction
        reaction = {
            "message_id": body.message_id,
            "user_id": body.user_id,
            "emoji": body.emoji,
            "timestamp": str(db.utils.now())
        }
        reactions[message_key].append(reaction)
        db.storage.json.put("message_reactions", reactions)
        return Reaction(**reaction)
    
    return Reaction(**existing_reaction)

@router.post("/remove-reaction")
def remove_reaction(body: RemoveReactionRequest) -> dict:
    reactions = get_reactions_store()
    message_key = f"{body.message_id}"
    
    if message_key in reactions:
        # Remove the specific reaction
        reactions[message_key] = [
            r for r in reactions[message_key]
            if not (r["user_id"] == body.user_id and r["emoji"] == body.emoji)
        ]
        
        # Clean up empty message entries
        if not reactions[message_key]:
            del reactions[message_key]
            
        db.storage.json.put("message_reactions", reactions)
    
    return {"status": "success"}

@router.get("/get-reactions/{message_id}")
def get_reactions(message_id: str) -> GetReactionsResponse:
    reactions = get_reactions_store()
    message_reactions = reactions.get(message_id, [])
    return GetReactionsResponse(reactions=[Reaction(**r) for r in message_reactions])
