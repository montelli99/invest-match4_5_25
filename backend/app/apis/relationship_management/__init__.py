from datetime import datetime
from typing import Dict, List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import databutton as db

from app.apis.models import (
    RelationshipType, RelationshipStatus, InteractionType,
    Interaction, RelationshipMetrics, RelationshipHistory, Relationship,
    RelationshipStrength, NetworkStrength, RelationshipResponse,
    TokenRequest
)

router = APIRouter(prefix="/relationship", tags=["relationships"])

def sanitize_key(key: str) -> str:
    """Sanitize storage key to only allow alphanumeric and ._- symbols"""
    import re
    return re.sub(r'[^a-zA-Z0-9._-]', '_', key)

def get_relationship_key(relationship_id: str) -> str:
    """Generate storage key for a relationship"""
    return sanitize_key(f"relationships.{relationship_id}")

def get_relationship_by_users_key(user1_id: str, user2_id: str) -> str:
    """Generate a consistent storage key for a relationship between two users"""
    # Sort IDs to ensure consistent key regardless of order
    sorted_ids = sorted([user1_id, user2_id])
    return sanitize_key(f"relationships.{sorted_ids[0]}_{sorted_ids[1]}")

def calculate_strength_score(metrics: RelationshipMetrics) -> float:
    """Calculate relationship strength score based on metrics"""
    weights = {
        'introduction_success_rate': 0.3,
        'response_time': 0.2,
        'quality': 0.3,
        'frequency': 0.2
    }
    
    # Calculate introduction success rate
    intro_rate = (metrics.successful_introductions / metrics.total_introductions * 100) \
        if metrics.total_introductions > 0 else 50.0
    
    # Normalize response time (0-100, lower is better)
    response_score = 100 - min(100, (metrics.avg_response_time or 48) / 48 * 100) \
        if metrics.avg_response_time is not None else 50.0
    
    # Quality score is already 0-100
    quality_score = metrics.quality_score
    
    # Frequency score is already 0-100
    frequency_score = metrics.interaction_frequency
    
    # Calculate weighted average
    total_score = (
        intro_rate * weights['introduction_success_rate'] +
        response_score * weights['response_time'] +
        quality_score * weights['quality'] +
        frequency_score * weights['frequency']
    )
    
    return round(total_score, 2)

def get_user_relationships_key(user_id: str) -> str:
    """Generate storage key for a user's relationships index"""
    return sanitize_key(f"user_relationships.{user_id}")

@router.get("/get-user-relationships/{user_id}")
def get_user_relationships(user_id: str) -> List[Relationship]:
    """Get all relationships for a user"""
    try:
        # Get user's relationship index
        index_key = get_user_relationships_key(user_id)
        if not db.storage.json.get(index_key):
            return {"relationships": [], "total": 0}
            
        relationship_ids = db.storage.json.get(index_key)
        relationships = []
        
        # Get each relationship
        for rel_id in relationship_ids:
            rel_key = get_relationship_key(rel_id)
            if db.storage.json.exists(rel_key):
                rel_data = db.storage.json.get(rel_key)
                relationships.append(rel_data)
                
        return {
            "relationships": relationships,
            "total": len(relationships)
        }
        
    except Exception as err:
        print(f"[ERROR] Failed to get user relationships: {str(err)}")
        raise HTTPException(status_code=500, detail=str(err)) from err

@router.get("/get-relationship/{relationship_id}")
def get_relationship(relationship_id: str) -> Relationship:
    """Get details of a specific relationship"""
    try:
        storage_key = get_relationship_key(relationship_id)
        if not db.storage.json.exists(storage_key):
            raise HTTPException(
                status_code=404,
                detail="Relationship not found"
            )
            
        relationship = db.storage.json.get(storage_key)
        return relationship
        
    except Exception as err:
        print(f"[ERROR] Failed to get relationship: {str(err)}")
        if isinstance(err, HTTPException):
            raise
        raise HTTPException(status_code=500, detail=str(err)) from err

@router.post("/create-relationship")
def create_relationship(
    relationship: Relationship
) -> RelationshipResponse:
    """Create a new relationship between users"""
    try:
        # Check if relationship already exists
        storage_key = get_relationship_key(relationship.relationship_id)
        if db.storage.json.exists(storage_key):
            raise HTTPException(
                status_code=400,
                detail="Relationship already exists"
            )
            
        # Set timestamps
        now = datetime.utcnow().isoformat()
        relationship.created_at = now
        relationship.updated_at = now
        
        # Store relationship
        db.storage.json.put(storage_key, relationship.dict())
        
        # Update user indices
        for user_id in [relationship.user1_id, relationship.user2_id]:
            index_key = get_user_relationships_key(user_id)
            user_relationships = db.storage.json.get(index_key, default=[])
            if relationship.relationship_id not in user_relationships:
                user_relationships.append(relationship.relationship_id)
                db.storage.json.put(index_key, user_relationships)
        
        return {
            "status": "success",
            "relationship_id": relationship.relationship_id
        }
        
    except Exception as err:
        print(f"[ERROR] Failed to create relationship: {str(err)}")
        if isinstance(err, HTTPException):
            raise
        raise HTTPException(status_code=500, detail=str(err)) from err

@router.put("/update-relationship-status/{relationship_id}")
def update_relationship_status(
    relationship_id: str,
    status: RelationshipStatus
) -> RelationshipResponse:
    """Update the status of a relationship"""
    try:
        storage_key = get_relationship_key(relationship_id)
        if not db.storage.json.exists(storage_key):
            raise HTTPException(
                status_code=404,
                detail="Relationship not found"
            )
            
        # Get current relationship
        relationship = db.storage.json.get(storage_key)
        
        # Update status
        now = datetime.utcnow().isoformat()
        relationship["status"] = status
        relationship["updated_at"] = now
        
        # Add to history
        history_entry = RelationshipHistory(
            timestamp=now,
            event_type="status_update",
            details={
                "status": status,
                "type": relationship["type"],
                "strength_score": str(relationship["metrics"]["quality_score"])
            }
        ).dict()
        
        relationship["history"].append(history_entry)
        
        # Store updated relationship
        db.storage.json.put(storage_key, relationship)
        
        return {
            "status": "success",
            "relationship_id": relationship_id
        }
        
    except Exception as err:
        print(f"[ERROR] Failed to update relationship status: {str(err)}")
        if isinstance(err, HTTPException):
            raise
        raise HTTPException(status_code=500, detail=str(err)) from err

@router.get("/get-relationship-strength/{user1_id}/{user2_id}")
async def get_relationship_strength_v1(user1_id: str, user2_id: str) -> RelationshipStrength:
    """Calculate relationship strength between two users
    
    Factors considered:
    - Number of successful introductions
    - Average response time to introduction requests
    - Quality score based on feedback
    - Frequency of interactions
    
    Returns:
        StrengthScore with overall score and breakdown
    """
    try:
        # Get relationship data
        rel_key = get_relationship_by_users_key(user1_id, user2_id)
        if not db.storage.json.exists(rel_key):
            return {
                "overall_score": 0,
                "metrics": {
                    "successful_introductions": 0,
                    "total_introductions": 0,
                    "avg_response_time": None,
                    "quality_score": 50.0,
                    "interaction_frequency": 0.0,
                    "last_interaction": None
                },
                "status": "no_relationship"
            }
        
        relationship_data = db.storage.json.get(rel_key)
        relationship = Relationship(**relationship_data)
        
        # Calculate overall strength score
        strength_score = calculate_strength_score(relationship.metrics)
        
        return RelationshipStrength(
            overall_score=strength_score,
            metrics=relationship.metrics.dict(),
            interaction_frequency=relationship.metrics.interaction_frequency,
            quality_score=relationship.metrics.quality_score,
            response_rate=relationship.metrics.avg_response_time or 0.0,
            successful_introductions=relationship.metrics.successful_introductions,
            last_interaction=relationship.last_interaction.isoformat() if relationship.last_interaction else None
        ).dict()
        
    except Exception as err:
        print(f"[ERROR] Failed to get relationship strength: {str(err)}")
        raise HTTPException(status_code=500, detail=str(err)) from err

@router.get("/get-network-strength/{user_id}")
async def get_network_strength(user_id: str) -> NetworkStrength:
    """Get relationship strength scores for user's entire network
    
    Returns:
        Dict mapping user_ids to strength scores
    """
    try:
        # List all relationships involving user
        all_relationships = []
        for key in db.storage.json.list("relationships/"):
            if user_id in key:
                rel = Relationship(**db.storage.json.get(key))
                if rel.status != RelationshipStatus.BLOCKED:
                    all_relationships.append(rel)
        
        # Calculate strength scores
        network_scores = {}
        for rel in all_relationships:
            other_id = rel.user2_id if rel.user1_id == user_id else rel.user1_id
            network_scores[other_id] = {
                "score": calculate_strength_score(rel.metrics),
                "type": rel.type,
                "status": rel.status,
                "last_interaction": rel.last_interaction.isoformat() if rel.last_interaction else None
            }
        
        # Calculate network metrics
        total_connections = len(network_scores)
        active_connections = sum(1 for s in network_scores.values() 
                               if s["status"] == RelationshipStatus.ACTIVE)
        avg_strength = sum(s["score"] for s in network_scores.values()) / total_connections \
            if total_connections > 0 else 0
        
        return {
            "network_scores": network_scores,
            "metrics": {
                "total_connections": total_connections,
                "active_connections": active_connections,
                "avg_strength": round(avg_strength, 2)
            }
        }
        
    except Exception as err:
        print(f"[ERROR] Failed to get network strength: {str(err)}")
        raise HTTPException(status_code=500, detail=str(err)) from err

@router.post("/record-interaction/{relationship_id}")
def record_interaction(
    relationship_id: str,
    interaction: Interaction
) -> RelationshipResponse:
    """Record a new interaction in a relationship"""
    try:
        storage_key = get_relationship_key(relationship_id)
        if not db.storage.json.exists(storage_key):
            raise HTTPException(
                status_code=404,
                detail="Relationship not found"
            )
            
        # Get current relationship
        relationship = db.storage.json.get(storage_key)
        
        # Update metrics based on interaction
        metrics = relationship["metrics"]
        
        if interaction.type == "introduction":
            metrics["total_introductions"] += 1
            if interaction.success:
                metrics["successful_introductions"] += 1
                
        # Update last interaction
        relationship["last_interaction"] = interaction.timestamp
        relationship["updated_at"] = datetime.utcnow().isoformat()
        
        # Store updated relationship
        db.storage.json.put(storage_key, relationship)
        
        return {
            "status": "success",
            "relationship_id": relationship_id
        }
        
    except Exception as err:
        print(f"[ERROR] Failed to record interaction: {str(err)}")
        if isinstance(err, HTTPException):
            raise
        raise HTTPException(status_code=500, detail=str(err)) from err
