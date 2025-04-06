from typing import List, Optional, Dict
from pydantic import BaseModel
from fastapi import APIRouter, HTTPException
import databutton as db
from datetime import datetime, timedelta
from enum import Enum

router = APIRouter()

class TierLevel(str, Enum):
    BRONZE = "bronze"
    SILVER = "silver"
    GOLD = "gold"
    PLATINUM = "platinum"

class TierRequirement(BaseModel):
    tier_name: TierLevel
    min_referrals: int
    min_conversion_rate: float
    min_quality_score: float
    benefits: List[str]

class TierStatus(BaseModel):
    current_tier: TierLevel
    next_tier: Optional[TierLevel]
    progress: dict
    requirements_met: bool
    missing_requirements: List[str]

class TierProgressionRules(BaseModel):
    tiers: List[TierRequirement]
    cooldown_period: int  # Days between tier evaluations
    grace_period: int     # Days to maintain requirements before demotion

# Initialize default tier progression rules
DEFAULT_TIER_RULES = TierProgressionRules(
    tiers=[
        TierRequirement(
            tier_name=TierLevel.BRONZE,
            min_referrals=0,
            min_conversion_rate=0.0,
            min_quality_score=0.0,
            benefits=["Basic commission rates", "Standard support"]
        ),
        TierRequirement(
            tier_name=TierLevel.SILVER,
            min_referrals=5,
            min_conversion_rate=0.1,
            min_quality_score=70.0,
            benefits=["Increased commission rates", "Priority support", "Monthly training"]
        ),
        TierRequirement(
            tier_name=TierLevel.GOLD,
            min_referrals=20,
            min_conversion_rate=0.2,
            min_quality_score=80.0,
            benefits=["Premium commission rates", "Dedicated support", "Weekly training", "Early access to features"]
        ),
        TierRequirement(
            tier_name=TierLevel.PLATINUM,
            min_referrals=50,
            min_conversion_rate=0.3,
            min_quality_score=90.0,
            benefits=["Maximum commission rates", "VIP support", "Personal account manager", "Custom training", "Beta features access"]
        )
    ],
    cooldown_period=30,  # 30 days between tier evaluations
    grace_period=14      # 14 days to maintain requirements before demotion
)

def get_tier_rules() -> TierProgressionRules:
    """Get tier progression rules, either from storage or defaults"""
    try:
        stored_rules = db.storage.json.get("tier_progression_rules")
        return TierProgressionRules(**stored_rules)
    except Exception:
        return DEFAULT_TIER_RULES

def save_tier_rules(rules: TierProgressionRules):
    """Save tier progression rules to storage"""
    db.storage.json.put("tier_progression_rules", rules.dict())

@router.get("/tier-requirements")
def get_tier_requirements() -> List[TierRequirement]:
    """Get the requirements and benefits for each tier"""
    rules = get_tier_rules()
    return rules.tiers

@router.get("/tier-status/{user_id}")
def get_tier_status(user_id: str) -> TierStatus:
    """Get current tier status and progression for a user"""
    # Get tier rules
    rules = get_tier_rules()
    
    try:
        # Get user's performance metrics from storage
        try:
            metrics = db.storage.json.get(f"referral_stats/{user_id}")
        except Exception:
            metrics = {
                "total_referrals": 0,
                "conversion_rate": 0.0,
                "quality_score": 0.0
            }
        
        # Calculate current tier based on metrics
        current_tier = TierLevel.BRONZE  # Default tier
        next_tier = None
        progress = {}
        missing_requirements = []
        
        # Calculate metrics
        total_referrals = metrics.get("total_referrals", 0)
        conversion_rate = metrics.get("conversion_rate", 0.0)
        quality_score = metrics.get("quality_score", 0.0)
        
        # Track progress and requirements
        for i, tier in enumerate(rules.tiers):
            # Check if user meets this tier's requirements
            meets_referrals = total_referrals >= tier.min_referrals
            meets_conversion = conversion_rate >= tier.min_conversion_rate
            meets_quality = quality_score >= tier.min_quality_score
            
            # Calculate progress percentages
            progress[tier.tier_name] = {
                "referrals": min(100, (total_referrals / tier.min_referrals * 100) if tier.min_referrals > 0 else 100),
                "conversion": min(100, (conversion_rate / tier.min_conversion_rate * 100) if tier.min_conversion_rate > 0 else 100),
                "quality": min(100, (quality_score / tier.min_quality_score * 100) if tier.min_quality_score > 0 else 100)
            }
            
            # Track missing requirements
            if not meets_referrals:
                missing_requirements.append(f"Need {tier.min_referrals - total_referrals} more referrals for {tier.tier_name}")
            if not meets_conversion:
                missing_requirements.append(f"Need {(tier.min_conversion_rate - conversion_rate) * 100:.1f}% higher conversion rate for {tier.tier_name}")
            if not meets_quality:
                missing_requirements.append(f"Need {tier.min_quality_score - quality_score:.1f} higher quality score for {tier.tier_name}")
            
            # If user meets all requirements, this is their current tier
            if meets_referrals and meets_conversion and meets_quality:
                current_tier = tier.tier_name
                # Set next tier if there is one
                if i < len(rules.tiers) - 1:
                    next_tier = rules.tiers[i + 1].tier_name
        
        return TierStatus(
            current_tier=current_tier,
            next_tier=next_tier,
            progress=progress,
            requirements_met=len(missing_requirements) == 0,
            missing_requirements=missing_requirements
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating tier status: {str(e)}") from e

@router.post("/calculate-tier/{user_id}")
def calculate_tier(user_id: str) -> TierStatus:
    """Calculate and update user's tier based on their performance"""
    try:
        # Get tier rules
        rules = get_tier_rules()
        
        # Get user's performance metrics
        try:
            metrics = db.storage.json.get(f"referral_stats/{user_id}")
        except Exception:
            metrics = {
                "total_referrals": 0,
                "conversion_rate": 0.0,
                "quality_score": 0.0,
                "last_tier_update": None
            }
        
        # Check cooldown period
        last_update = metrics.get("last_tier_update")
        if last_update:
            last_update = datetime.fromisoformat(last_update)
            if (datetime.utcnow() - last_update).days < rules.cooldown_period:
                # Return current status without updating
                return get_tier_status(user_id)
        
        # Calculate new tier
        new_status = get_tier_status(user_id)
        
        # Check if requirements are met for current tier
        if not new_status.requirements_met:
            # Check grace period before demoting
            grace_start = metrics.get("grace_period_start")
            if grace_start:
                grace_start = datetime.fromisoformat(grace_start)
                if (datetime.utcnow() - grace_start).days > rules.grace_period:
                    # Demote to previous tier
                    for i, tier in enumerate(rules.tiers):
                        if tier.tier_name == new_status.current_tier and i > 0:
                            new_status.current_tier = rules.tiers[i-1].tier_name
                            break
            else:
                # Start grace period
                metrics["grace_period_start"] = datetime.utcnow().isoformat()
        else:
            # Clear grace period if requirements are met
            metrics.pop("grace_period_start", None)
        
        # Update metrics
        metrics["last_tier_update"] = datetime.utcnow().isoformat()
        metrics["current_tier"] = new_status.current_tier
        db.storage.json.put(f"referral_stats/{user_id}", metrics)
        
        return new_status
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating tier: {str(e)}") from e
