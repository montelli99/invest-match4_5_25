from typing import List, Optional, Dict
from pydantic import BaseModel
from fastapi import APIRouter, HTTPException, Depends
from firebase_admin import auth
import databutton as db
import json
from datetime import datetime

def get_current_user(authorization: str = Depends(lambda: None)) -> Dict:
    """Get the current user from Firebase token"""
    if not authorization or not authorization.startswith('Bearer '):
        raise HTTPException(status_code=401, detail='Missing or invalid token')
    
    try:
        token = authorization.split(' ')[1]
        return auth.verify_id_token(token)
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

router = APIRouter()

class FeedbackRating(BaseModel):
    page: str
    overall_rating: int
    usability_rating: str
    feature_ratings: dict
    improvement_suggestions: str
    user_id: Optional[str] = None
    timestamp: Optional[str] = None

class FeedbackResponse(BaseModel):
    success: bool
    message: str

@router.post("/submit-feedback")
def submit_feedback(feedback: FeedbackRating, current_user: Dict = Depends(get_current_user)) -> FeedbackResponse:
    """Submit user feedback for a page"""
    try:
        # Add user ID and timestamp
        feedback.user_id = current_user['uid']
        if not feedback.timestamp:
            feedback.timestamp = datetime.utcnow().isoformat()

        # Load existing feedback or create new list
        try:
            feedback_data = db.storage.json.get("page_feedback", default=[])
        except Exception:
            feedback_data = []

        # Add new feedback
        feedback_data.append(feedback.dict())

        # Save updated feedback
        db.storage.json.put("page_feedback", feedback_data)

        return FeedbackResponse(
            success=True,
            message="Feedback submitted successfully"
        )
    except Exception as e:
        print(f"Error saving feedback: {str(e)}")
        return FeedbackResponse(
            success=False,
            message="Failed to save feedback"
        )

@router.get("/feedback-analytics")
def get_feedback_analytics(current_user: Dict = Depends(get_current_user)) -> dict:
    """Get analytics for collected feedback"""
    try:
        feedback_data = db.storage.json.get("page_feedback", default=[])

        # Calculate analytics
        total_feedback = len(feedback_data)
        if total_feedback == 0:
            return {
                "total_feedback": 0,
                "average_rating": 0,
                "usability_breakdown": {},
                "feature_ratings": {},
                "recent_suggestions": []
            }

        # Calculate averages and breakdowns
        total_rating = 0
        usability_counts = {}
        feature_ratings_sum = {}
        feature_ratings_count = {}

        for feedback in feedback_data:
            # Overall rating
            total_rating += feedback["overall_rating"]

            # Usability breakdown
            usability = feedback["usability_rating"]
            usability_counts[usability] = usability_counts.get(usability, 0) + 1

            # Feature ratings
            for feature, rating in feedback["feature_ratings"].items():
                feature_ratings_sum[feature] = feature_ratings_sum.get(feature, 0) + rating
                feature_ratings_count[feature] = feature_ratings_count.get(feature, 0) + 1

        # Calculate averages
        average_rating = total_rating / total_feedback
        feature_averages = {
            feature: feature_ratings_sum[feature] / feature_ratings_count[feature]
            for feature in feature_ratings_sum
        }

        # Get recent suggestions (last 5)
        recent_suggestions = [
            {
                "suggestion": f["improvement_suggestions"],
                "timestamp": f["timestamp"]
            }
            for f in sorted(feedback_data, key=lambda x: x["timestamp"], reverse=True)[:5]
            if f["improvement_suggestions"]
        ]

        return {
            "total_feedback": total_feedback,
            "average_rating": round(average_rating, 2),
            "usability_breakdown": usability_counts,
            "feature_ratings": feature_averages,
            "recent_suggestions": recent_suggestions
        }
    except Exception as e:
        print(f"Error getting feedback analytics: {str(e)}")
        return {
            "error": "Failed to retrieve feedback analytics"
        }
