from datetime import datetime, timedelta
from typing import List, Optional, Dict
from pydantic import BaseModel
from app.apis.models import (
    RelationshipStrength, NetworkStrength,
    StrengthFactors, StrengthScore,
    TokenRequest
)
from fastapi import APIRouter, HTTPException
import databutton as db

router = APIRouter()

def calculate_response_time_score(avg_response_time: Optional[float]) -> float:
    """Calculate score based on average response time
    
    Args:
        avg_response_time: Average response time in hours
        
    Returns:
        Score between 0-100, higher is better
    """
    if not avg_response_time:
        return 50  # Neutral score if no data
        
    # Score decreases as response time increases
    # 24h -> 75, 48h -> 50, 72h -> 25
    if avg_response_time <= 24:
        return 75 + (25 * (24 - avg_response_time) / 24)
    elif avg_response_time <= 48:
        return 50 + (25 * (48 - avg_response_time) / 24)
    elif avg_response_time <= 72:
        return 25 + (25 * (72 - avg_response_time) / 24)
    else:
        return max(0, 25 - ((avg_response_time - 72) / 24) * 5)

def calculate_interaction_score(interactions: List[Dict]) -> float:
    """Calculate score based on interaction frequency
    
    Args:
        interactions: List of interaction records with timestamps
        
    Returns:
        Score between 0-100, higher means more frequent interaction
    """
    if not interactions:
        return 0
        
    now = datetime.utcnow()
    
    # Count interactions in different time periods
    last_week = 0
    last_month = 0
    last_quarter = 0
    
    for interaction in interactions:
        timestamp = datetime.fromisoformat(interaction['timestamp'])
        age = now - timestamp
        
        if age <= timedelta(days=7):
            last_week += 1
        if age <= timedelta(days=30):
            last_month += 1
        if age <= timedelta(days=90):
            last_quarter += 1
    
    # Weight recent interactions more heavily
    weighted_score = (
        last_week * 4 +  # Most important
        last_month * 2 +  # Important
        last_quarter  # Less important
    )
    
    # Normalize to 0-100
    # Assuming ideal frequency is 2 interactions per week
    max_score = (8 * 4) + (8 * 2) + 24  # 8 weekly + 8 monthly + 24 quarterly
    return min(100, (weighted_score / max_score) * 100)

def get_cached_strength(user1_id: str, user2_id: str) -> Optional[StrengthScore]:
    """Get cached relationship strength if available and recent"""
    try:
        cache_key = f"relationship_strength_{min(user1_id, user2_id)}_{max(user1_id, user2_id)}"
        cached = db.storage.json.get(cache_key)
        
        if not cached:
            return None
            
        # Check if cache is recent (less than 24h old)
        last_updated = datetime.fromisoformat(cached['last_updated'])
        if datetime.utcnow() - last_updated > timedelta(hours=24):
            return None
            
        return StrengthScore(**cached)
        
    except Exception as e:
        print(f"[ERROR] Failed to get cached strength: {str(e)}")
        return None

def store_strength_score(user1_id: str, user2_id: str, score: StrengthScore):
    """Store relationship strength score in cache"""
    try:
        cache_key = f"relationship_strength_{min(user1_id, user2_id)}_{max(user1_id, user2_id)}"
        db.storage.json.put(cache_key, score.dict())
    except Exception as e:
        print(f"[ERROR] Failed to store strength score: {str(e)}")

@router.get("/strength/calculate/{user1_id}/{user2_id}")
def calculate_relationship_strength(user1_id: str, user2_id: str) -> StrengthScore:
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
        # Check cache first
        cached = get_cached_strength(user1_id, user2_id)
        if cached:
            return cached
            
        # Get introduction history
        introductions = db.storage.json.get('introductions', default=[])
        relevant_intros = [i for i in introductions 
                          if (i['requester_id'] in [user1_id, user2_id] and 
                              i['target_id'] in [user1_id, user2_id])]        
        
        # Calculate successful introductions
        successful = len([i for i in relevant_intros if i['status'] == 'completed'])
        
        # Calculate average response time
        response_times = []
        for intro in relevant_intros:
            if 'created_at' in intro and 'responded_at' in intro:
                created = datetime.fromisoformat(intro['created_at'])
                responded = datetime.fromisoformat(intro['responded_at'])
                hours = (responded - created).total_seconds() / 3600
                response_times.append(hours)
        avg_response_time = sum(response_times) / len(response_times) if response_times else None
        
        # Get quality scores from feedback
        feedback = db.storage.json.get('introduction_feedback', default=[])
        relevant_feedback = [f for f in feedback 
                           if f['introduction_id'] in [i['id'] for i in relevant_intros]]
        quality_score = sum(f['rating'] for f in relevant_feedback) / len(relevant_feedback) if relevant_feedback else 50
        
        # Get interaction history
        interactions = db.storage.json.get('user_interactions', default=[])
        relevant_interactions = [i for i in interactions
                               if (i['user1_id'] in [user1_id, user2_id] and
                                   i['user2_id'] in [user1_id, user2_id])]
        
        # Calculate scores
        response_score = calculate_response_time_score(avg_response_time)
        interaction_score = calculate_interaction_score(relevant_interactions)
        
        # Calculate overall score
        # Weights: Successful intros (30%), Response time (20%), Quality (30%), Interaction (20%)
        overall_score = (
            min(100, successful * 20) * 0.3 +  # Up to 5 successful intros for max score
            response_score * 0.2 +
            quality_score * 0.3 +
            interaction_score * 0.2
        )
        
        # Create strength score object
        score = StrengthScore(
            overall_score=overall_score,
            factors=StrengthFactors(
                successful_introductions=successful,
                avg_response_time=avg_response_time,
                quality_score=quality_score,
                interaction_frequency=interaction_score
            ),
            last_updated=datetime.utcnow().isoformat(),
            history=[{"timestamp": datetime.utcnow().isoformat(), "score": overall_score}]
        )
        
        # Update cache
        store_strength_score(user1_id, user2_id, score)
        
        return score
        
    except Exception as e:
        print(f"[ERROR] Failed to calculate relationship strength: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/strength/network/{user_id}")
def calculate_network_strength(user_id: str) -> Dict[str, float]:
    """Get relationship strength scores for user's entire network
    
    Returns:
        Dict mapping user_ids to strength scores
    """
    try:
        # Get user's network
        network = db.storage.json.get('user_network', default={})
        connections = network.get(user_id, [])
        
        # Calculate strength for each connection
        strengths = {}
        for connection_id in connections:
            try:
                strength = calculate_relationship_strength(user_id, connection_id)
                strengths[connection_id] = strength.overall_score
            except Exception as e:
                print(f"[WARNING] Failed to get strength for {connection_id}: {str(e)}")
                continue
                
        return strengths
        
    except Exception as e:
        print(f"[ERROR] Failed to get network strength: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
