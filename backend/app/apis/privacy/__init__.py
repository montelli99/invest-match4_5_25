from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional
import hashlib
import re
import databutton as db

router = APIRouter()

class AnonymizationRule(BaseModel):
    """Model for configuring anonymization rules"""
    field_name: str
    method: str  # hash, mask, redact
    pattern: Optional[str] = None  # Regex pattern for identifying data
    mask_char: Optional[str] = '*'
    preserve_length: Optional[bool] = True

class AnonymizationConfig(BaseModel):
    """Configuration for data anonymization"""
    rules: List[AnonymizationRule]
    user_id: str

class AnonymizedData(BaseModel):
    """Response model for anonymized data"""
    data: Dict
    applied_rules: List[str]

def hash_value(value: str) -> str:
    """Hash a value using SHA-256"""
    return hashlib.sha256(str(value).encode()).hexdigest()

def mask_value(value: str, mask_char: str = '*', preserve_length: bool = True) -> str:
    """Mask a value with the specified character"""
    if not value:
        return value
    
    if preserve_length:
        return mask_char * len(str(value))
    return mask_char * 8  # Default masked length

def apply_anonymization(data: Dict, rules: List[AnonymizationRule]) -> Dict:
    """Apply anonymization rules to data"""
    anonymized = data.copy()
    applied_rules = []
    
    for rule in rules:
        if rule.field_name in anonymized:
            value = str(anonymized[rule.field_name])
            
            if rule.method == 'hash':
                anonymized[rule.field_name] = hash_value(value)
            elif rule.method == 'mask':
                anonymized[rule.field_name] = mask_value(
                    value, 
                    rule.mask_char or '*',
                    rule.preserve_length if rule.preserve_length is not None else True
                )
            elif rule.method == 'redact':
                anonymized[rule.field_name] = '[REDACTED]'
            
            applied_rules.append(f"{rule.field_name}:{rule.method}")
    
    return anonymized, applied_rules

@router.post("/anonymize-data")
def anonymize_data(data: Dict, config: AnonymizationConfig) -> AnonymizedData:
    """
    Anonymize data according to specified rules
    
    Args:
        data: The data to anonymize
        config: Anonymization configuration including rules
    
    Returns:
        AnonymizedData containing the anonymized data and list of applied rules
    """
    try:
        anonymized_data, applied_rules = apply_anonymization(data, config.rules)
        return AnonymizedData(
            data=anonymized_data,
            applied_rules=applied_rules
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/default-rules")
def get_default_rules() -> List[AnonymizationRule]:
    """Get default anonymization rules for common data types"""
    return [
        # Financial data rules
        AnonymizationRule(
            field_name="account_number",
            method="mask",
            pattern=r'^\d{8,17}$',  # Common bank account number lengths
            preserve_length=True,
            mask_char='#'
        ),
        AnonymizationRule(
            field_name="credit_card",
            method="mask",
            pattern=r'^\d{16}$',  # Standard credit card number length
            preserve_length=True,
            mask_char='#'
        ),
        AnonymizationRule(
            field_name="investment_amount",
            method="mask",
            pattern=r'^\d+(\.\d{1,2})?$',  # Currency amounts
            preserve_length=False,
            mask_char='$'
        ),
        AnonymizationRule(
            field_name="portfolio_value",
            method="mask",
            pattern=r'^\d+(\.\d{1,2})?$',
            preserve_length=False,
            mask_char='$'
        ),
        AnonymizationRule(
            field_name="email",
            method="mask",
            pattern=r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$',
            preserve_length=True
        ),
        AnonymizationRule(
            field_name="phone",
            method="mask",
            pattern=r'^\+?\d{10,15}$',
            preserve_length=True,
            mask_char='#'
        ),
        AnonymizationRule(
            field_name="address",
            method="redact"
        ),
        AnonymizationRule(
            field_name="ssn",
            method="hash"
        )
    ]

# Store user's anonymization preferences
@router.post("/save-preferences")
def save_anonymization_preferences(config: AnonymizationConfig):
    """Save user's anonymization preferences"""
    try:
        preferences_key = f"anonymization_preferences_{config.user_id}"
        db.storage.json.put(preferences_key, config.dict())
        return {"message": "Preferences saved successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/get-preferences/{user_id}")
def get_anonymization_preferences(user_id: str) -> AnonymizationConfig:
    """Get user's saved anonymization preferences"""
    try:
        preferences_key = f"anonymization_preferences_{user_id}"
        preferences = db.storage.json.get(preferences_key)
        if not preferences:
            # Return default config if no preferences are saved
            return AnonymizationConfig(
                user_id=user_id,
                rules=get_default_rules()
            )
        return AnonymizationConfig(**preferences)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
