from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import re
from typing import List, Optional

router = APIRouter()

class PatternTestRequest(BaseModel):
    pattern: str
    content: str
    threshold: float = 0.7

class PatternTestResult(BaseModel):
    is_valid: bool
    matches_found: bool
    score: float
    match_count: int
    match_text: List[str]

@router.post("/test-pattern")
def test_moderation_pattern(body: PatternTestRequest) -> PatternTestResult:
    """Test a regex pattern against provided content"""
    try:
        # Validate the regex pattern
        is_valid = True
        try:
            pattern = re.compile(body.pattern, re.IGNORECASE)
        except re.error:
            is_valid = False
            return PatternTestResult(
                is_valid=False,
                matches_found=False,
                score=0.0,
                match_count=0,
                match_text=[]
            )
        
        # Find all matches
        matches = pattern.findall(body.content)
        match_count = len(matches)
        
        # Calculate score based on matches and content length
        # Simple scoring: ratio of matched words to total words
        total_words = len(body.content.split())
        matched_words = sum(len(match.split()) for match in matches) if matches else 0
        
        # Avoid division by zero
        score = min(matched_words / max(total_words, 1), 1.0) if total_words > 0 else 0.0
        
        # Return results
        return PatternTestResult(
            is_valid=is_valid,
            matches_found=match_count > 0,
            score=score,
            match_count=match_count,
            match_text=matches
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error testing pattern: {str(e)}")
