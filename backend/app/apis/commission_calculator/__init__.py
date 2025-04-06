from datetime import datetime
from typing import Dict, List, Optional, Union
from enum import Enum
from pydantic import BaseModel, Field, validator
from fastapi import APIRouter, HTTPException
import databutton as db

router = APIRouter()

class CommissionType(str, Enum):
    """Types of commissions available
    
    STANDARD: Regular commission rate based on tier
    PERFORMANCE: Additional commission based on performance metrics
    CAMPAIGN: Special rates for specific promotional campaigns
    VOLUME: Adjusted rates based on total volume
    """
    STANDARD = "standard"
    PERFORMANCE = "performance"
    CAMPAIGN = "campaign"
    VOLUME = "volume"

class PerformanceMetrics(BaseModel):
    """Performance metrics used for commission calculations
    
    Fields:
        conversion_rate: Percentage of referrals that convert
        response_time: Average time to respond to referrals (hours)
        quality_score: Score based on referral quality (0-100)
        activity_level: Score based on regular platform activity (0-100)
    """
    conversion_rate: float = Field(ge=0, le=100)
    response_time: float = Field(ge=0)
    quality_score: float = Field(ge=0, le=100)
    activity_level: float = Field(ge=0, le=100)

class CampaignRules(BaseModel):
    """Rules for special commission campaigns
    
    Fields:
        campaign_id: Unique identifier for the campaign
        start_date: When the campaign starts
        end_date: When the campaign ends
        base_rate: Base commission rate for the campaign
        bonus_rate: Additional bonus rate if conditions are met
        min_referrals: Minimum referrals needed for bonus
        max_commission: Maximum commission allowed
    """
    campaign_id: str
    start_date: datetime
    end_date: datetime
    base_rate: float = Field(ge=0, le=100)
    bonus_rate: float = Field(ge=0, le=50)
    min_referrals: int = Field(ge=0)
    max_commission: float = Field(ge=0)

    @validator('end_date')
    def end_date_must_be_after_start(cls, v, values):
        if 'start_date' in values and v <= values['start_date']:
            raise ValueError('end_date must be after start_date')
        return v

class VolumeThreshold(BaseModel):
    """Volume-based commission thresholds
    
    Fields:
        min_volume: Minimum volume for this threshold
        rate: Commission rate for this threshold
        is_cumulative: Whether rate applies to all volume or just increment
    """
    min_volume: float = Field(ge=0)
    rate: float = Field(ge=0, le=100)
    is_cumulative: bool = True

class CommissionStructure(BaseModel):
    """Complete commission structure configuration
    
    Fields:
        structure_id: Unique identifier for this structure
        name: Name of the commission structure
        description: Detailed description
        base_rate: Default commission rate
        performance_multiplier: Multiplier based on performance (0-2)
        campaign_rules: Optional campaign-specific rules
        volume_thresholds: Volume-based rate adjustments
        max_commission: Maximum commission allowed
        min_commission: Minimum commission to be paid
        is_active: Whether this structure is currently active
    """
    structure_id: str
    name: str
    description: str
    base_rate: float = Field(ge=0, le=100)
    performance_multiplier: float = Field(ge=0, le=2)
    campaign_rules: Optional[CampaignRules] = None
    volume_thresholds: List[VolumeThreshold] = []
    max_commission: float = Field(ge=0)
    min_commission: float = Field(ge=0)
    is_active: bool = True

    @validator('volume_thresholds')
    def validate_volume_thresholds(cls, v):
        if len(v) > 0:
            # Ensure thresholds are in ascending order
            for i in range(1, len(v)):
                if v[i].min_volume <= v[i-1].min_volume:
                    raise ValueError('Volume thresholds must be in ascending order')
        return v

class CommissionCalculation(BaseModel):
    """Result of a commission calculation
    
    Fields:
        base_amount: Base commission amount
        performance_bonus: Additional amount from performance
        campaign_bonus: Additional amount from campaigns
        volume_adjustment: Adjustment based on volume
        final_amount: Final commission amount after all calculations
        calculation_breakdown: Detailed breakdown of calculation
        applied_rules: List of rules that were applied
    """
    base_amount: float
    performance_bonus: float = 0
    campaign_bonus: float = 0
    volume_adjustment: float = 0
    final_amount: float
    calculation_breakdown: Dict[str, float]
    applied_rules: List[str]

def get_commission_structures() -> Dict[str, CommissionStructure]:
    """Get all commission structures from storage"""
    return db.storage.json.get('commission_structures', default={})

def save_commission_structures(structures: Dict[str, CommissionStructure]) -> None:
    """Save commission structures to storage"""
    db.storage.json.put('commission_structures', 
                       {k: v.dict() for k, v in structures.items()})

def calculate_performance_multiplier(metrics: PerformanceMetrics) -> float:
    """Calculate performance multiplier based on metrics
    
    Args:
        metrics: Performance metrics to evaluate
        
    Returns:
        float: Performance multiplier between 0 and 2
    """
    # Weight different metrics
    weights = {
        'conversion_rate': 0.4,
        'quality_score': 0.3,
        'activity_level': 0.2,
        'response_time': 0.1
    }
    
    # Calculate normalized score for each metric
    scores = {
        'conversion_rate': metrics.conversion_rate / 100,
        'quality_score': metrics.quality_score / 100,
        'activity_level': metrics.activity_level / 100,
        # Response time is inverse - faster is better
        'response_time': max(0, 1 - (metrics.response_time / 48))  # Normalize to 48 hours
    }
    
    # Calculate weighted average
    multiplier = sum(weights[k] * scores[k] for k in weights)
    
    # Scale to 0-2 range
    return min(2.0, max(0.0, multiplier * 2))

def calculate_volume_adjustment(volume: float, thresholds: List[VolumeThreshold]) -> float:
    """Calculate commission adjustment based on volume
    
    Args:
        volume: Total volume to calculate adjustment for
        thresholds: List of volume thresholds and rates
        
    Returns:
        float: Volume-based commission adjustment
    """
    if not thresholds:
        return 0.0
        
    adjustment = 0.0
    remaining_volume = volume
    
    # Sort thresholds by minimum volume
    sorted_thresholds = sorted(thresholds, key=lambda x: x.min_volume)
    
    for i, threshold in enumerate(sorted_thresholds):
        if volume < threshold.min_volume:
            break
            
        # Calculate volume for this threshold
        if i < len(sorted_thresholds) - 1:
            threshold_volume = min(
                remaining_volume,
                sorted_thresholds[i + 1].min_volume - threshold.min_volume
            )
        else:
            threshold_volume = remaining_volume
            
        if threshold.is_cumulative:
            adjustment += threshold_volume * (threshold.rate / 100)
        else:
            adjustment = threshold_volume * (threshold.rate / 100)
            
        remaining_volume -= threshold_volume
        
    return adjustment

@router.post("/commission/calculate")
async def calculate_commission(
    structure_id: str,
    base_amount: float,
    metrics: Optional[PerformanceMetrics] = None,
    volume: Optional[float] = None
) -> CommissionCalculation:
    """Calculate commission based on structure and inputs
    
    Args:
        structure_id: ID of commission structure to use
        base_amount: Base amount to calculate commission on
        metrics: Optional performance metrics
        volume: Optional volume for volume-based calculations
        
    Returns:
        CommissionCalculation with detailed breakdown
        
    Raises:
        HTTPException: If structure not found or calculation fails
    """
    try:
        # Get commission structure
        structures = get_commission_structures()
        if structure_id not in structures:
            raise HTTPException(
                status_code=404,
                detail="Commission structure not found"
            )
            
        structure = CommissionStructure(**structures[structure_id])
        if not structure.is_active:
            raise HTTPException(
                status_code=400,
                detail="Commission structure is not active"
            )
            
        # Initialize calculation
        calculation = CommissionCalculation(
            base_amount=base_amount * (structure.base_rate / 100),
            calculation_breakdown={'base_rate': structure.base_rate},
            applied_rules=['base_rate']
        )
        
        # Apply performance multiplier if metrics provided
        if metrics:
            multiplier = calculate_performance_multiplier(metrics)
            calculation.performance_bonus = (
                calculation.base_amount * 
                (multiplier - 1) * 
                structure.performance_multiplier
            )
            calculation.calculation_breakdown['performance_multiplier'] = multiplier
            calculation.applied_rules.append('performance_multiplier')
        
        # Apply campaign bonus if active campaign exists
        if structure.campaign_rules:
            now = datetime.utcnow()
            if (
                structure.campaign_rules.start_date <= now <= 
                structure.campaign_rules.end_date
            ):
                campaign_bonus = base_amount * (structure.campaign_rules.bonus_rate / 100)
                calculation.campaign_bonus = min(
                    campaign_bonus,
                    structure.campaign_rules.max_commission
                )
                calculation.calculation_breakdown['campaign_bonus'] = \
                    structure.campaign_rules.bonus_rate
                calculation.applied_rules.append('campaign_bonus')
        
        # Apply volume adjustment if volume provided
        if volume is not None and structure.volume_thresholds:
            calculation.volume_adjustment = calculate_volume_adjustment(
                volume,
                structure.volume_thresholds
            )
            calculation.calculation_breakdown['volume_adjustment'] = \
                calculation.volume_adjustment
            calculation.applied_rules.append('volume_adjustment')
        
        # Calculate final amount
        calculation.final_amount = (
            calculation.base_amount +
            calculation.performance_bonus +
            calculation.campaign_bonus +
            calculation.volume_adjustment
        )
        
        # Apply min/max bounds
        calculation.final_amount = min(
            structure.max_commission,
            max(structure.min_commission, calculation.final_amount)
        )
        
        return calculation
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Failed to calculate commission: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to calculate commission: {str(e)}"
        ) from e

@router.post("/commission/structures/create")
async def create_commission_structure(
    structure: CommissionStructure
) -> CommissionStructure:
    """Create a new commission structure
    
    Args:
        structure: Commission structure to create
        
    Returns:
        Created commission structure
        
    Raises:
        HTTPException: If creation fails
    """
    try:
        structures = get_commission_structures()
        
        # Validate structure ID is unique
        if structure.structure_id in structures:
            raise HTTPException(
                status_code=400,
                detail="Structure ID already exists"
            )
            
        # Store new structure
        structures[structure.structure_id] = structure
        save_commission_structures(structures)
        
        return structure
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Failed to create commission structure: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create commission structure: {str(e)}"
        ) from e

@router.get("/commission/structures/{structure_id}")
async def get_commission_structure(
    structure_id: str
) -> CommissionStructure:
    """Get a specific commission structure
    
    Args:
        structure_id: ID of structure to retrieve
        
    Returns:
        Commission structure
        
    Raises:
        HTTPException: If structure not found
    """
    try:
        structures = get_commission_structures()
        if structure_id not in structures:
            raise HTTPException(
                status_code=404,
                detail="Commission structure not found"
            )
            
        return CommissionStructure(**structures[structure_id])
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Failed to get commission structure: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get commission structure: {str(e)}"
        ) from e

@router.get("/commission/structures")
async def list_commission_structures(
    include_inactive: bool = False
) -> List[CommissionStructure]:
    """List all commission structures
    
    Args:
        include_inactive: Whether to include inactive structures
        
    Returns:
        List of commission structures
    """
    try:
        structures = get_commission_structures()
        result = [CommissionStructure(**s) for s in structures.values()]
        
        if not include_inactive:
            result = [s for s in result if s.is_active]
            
        return result
        
    except Exception as e:
        print(f"[ERROR] Failed to list commission structures: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to list commission structures: {str(e)}"
        ) from e

@router.put("/commission/structures/{structure_id}")
async def update_commission_structure(
    structure_id: str,
    updates: CommissionStructure
) -> CommissionStructure:
    """Update an existing commission structure
    
    Args:
        structure_id: ID of structure to update
        updates: Updated commission structure
        
    Returns:
        Updated commission structure
        
    Raises:
        HTTPException: If update fails
    """
    try:
        structures = get_commission_structures()
        
        # Validate structure exists
        if structure_id not in structures:
            raise HTTPException(
                status_code=404,
                detail="Commission structure not found"
            )
            
        # Update structure
        structures[structure_id] = updates
        save_commission_structures(structures)
        
        return updates
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Failed to update commission structure: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update commission structure: {str(e)}"
        ) from e