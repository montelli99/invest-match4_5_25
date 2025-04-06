from datetime import datetime
from typing import List, Optional, Dict, Any
from enum import Enum
from pydantic import BaseModel, Field
from fastapi import APIRouter, HTTPException
import databutton as db
import uuid

router = APIRouter()

class AffiliateSettingsModel(BaseModel):
    """Settings for affiliate account

    This model stores user preferences for their affiliate account including
    payment settings, notification preferences, and visibility options.

    Fields:
        user_id: ID of the affiliate
        payment_method: Preferred payment method (stripe, paypal, bank)
        payout_threshold: Minimum amount required for payout
        email_notifications: Configuration for email notifications
        profile_visibility: Settings for what information is publicly visible
        auto_approval: Settings for automatic referral approval
        created_at: When these settings were created
        updated_at: When these settings were last updated
    """
    user_id: str
    payment_method: str
    payout_threshold: float
    email_notifications: Dict[str, bool]
    profile_visibility: Dict[str, bool]
    auto_approval: Dict[str, Any]
    created_at: datetime
    updated_at: datetime

def get_affiliate_settings(user_id: str) -> AffiliateSettingsModel:
    """Get affiliate settings for a user

    Args:
        user_id: ID of the user

    Returns:
        AffiliateSettings object with user's preferences

    Raises:
        HTTPException: If settings cannot be retrieved
    """
    try:
        settings = db.storage.json.get('affiliate_settings', default={})
        if user_id not in settings:
            # Create default settings
            now = datetime.utcnow()
            default_settings = AffiliateSettingsModel(
                user_id=user_id,
                payment_method='stripe',
                payout_threshold=100.0,
                email_notifications={
                    'newReferrals': True,
                    'conversions': True,
                    'payments': True
                },
                profile_visibility={
                    'showEarnings': False,
                    'showReferralCount': True,
                    'showTier': True
                },
                auto_approval={
                    'enabled': False,
                    'minTrustScore': 70
                },
                created_at=now,
                updated_at=now
            )
            settings[user_id] = default_settings.dict()
            db.storage.json.put('affiliate_settings', settings)
            return default_settings

        return AffiliateSettingsModel(**settings[user_id])

    except Exception as e:
        print(f"[ERROR] Failed to get affiliate settings: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to retrieve affiliate settings"
        ) from e

def initialize_storage():
    """Initialize all required storage for the referral system

    This function ensures all required storage exists and is properly initialized.
    It should be called before any operation that requires storage access.
    """
    try:
        # Initialize all required storage with empty dictionaries if they don't exist
        storage_keys = [
            'referral_codes',
            'referral_links',
            'referral_tracking',
            'referral_relationships',
            'affiliate_status',
            'commission_payments'
        ]

        for key in storage_keys:
            if not db.storage.json.exists(key):
                print(f"[INFO] Initializing {key} storage")
                db.storage.json.put(key, {})

    except Exception as e:
        print(f"[ERROR] Failed to initialize storage: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to initialize referral system storage"
        ) from e

def validate_relationship(referrer_id: str, referred_id: str) -> bool:
    """Validate a referral relationship between two users

    Args:
        referrer_id: ID of the referring user
        referred_id: ID of the referred user

    Returns:
        bool: True if the relationship is valid, False otherwise

    Raises:
        HTTPException: If validation fails due to system error
    """
    try:
        # Prevent self-referrals
        if referrer_id == referred_id:
            return False

        # Check if relationship already exists
        relationships = db.storage.json.get('referral_relationships', default={})
        for rel in relationships.values():
            if (
                rel['referrer_id'] == referrer_id 
                and rel['referred_id'] == referred_id
                and rel['is_active']
            ):
                return False

        return True

    except Exception as e:
        print(f"[ERROR] Failed to validate relationship: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to validate referral relationship"
        ) from e

def cleanup_expired_data():
    """Clean up expired or invalid referral data

    This function removes:
    - Expired referral codes
    - Invalid relationships
    - Old tracking entries
    """
    try:
        # Get current time
        now = datetime.utcnow()

        # Clean up expired referral codes (older than 30 days)
        codes = db.storage.json.get('referral_codes', default={})
        active_codes = {}
        for code, data in codes.items():
            created_at = datetime.fromisoformat(data['created_at'])
            if (now - created_at).days <= 30:
                active_codes[code] = data
        db.storage.json.put('referral_codes', active_codes)

        # Clean up invalid relationships (where either user is inactive)
        relationships = db.storage.json.get('referral_relationships', default={})
        active_relationships = {}
        for rel_id, rel in relationships.items():
            if rel['is_active']:
                active_relationships[rel_id] = rel
        db.storage.json.put('referral_relationships', active_relationships)

        # Clean up old tracking entries (keep last 90 days)
        trackings = db.storage.json.get('referral_tracking', default={})
        active_trackings = {}
        for tracking_id, tracking in trackings.items():
            created_at = datetime.fromisoformat(tracking['created_at'])
            if (now - created_at).days <= 90:
                active_trackings[tracking_id] = tracking
        db.storage.json.put('referral_tracking', active_trackings)

        print("[INFO] Completed cleanup of expired referral data")

    except Exception as e:
        print(f"[ERROR] Failed to cleanup expired data: {str(e)}")
        # Don't raise exception as this is a cleanup task


class ReferralCode(BaseModel):
    code: str
    user_id: str
    created_at: datetime
    is_active: bool = True

class ReferralLink(BaseModel):
    id: str
    user_id: str
    code: str
    created_at: datetime
    visits: int = 0
    last_visited: Optional[datetime] = None
    is_active: bool = True

class ReferralLinkResponse(BaseModel):
    links: List[ReferralLink]

class ReferralStatus(str, Enum):
    PENDING = "pending"
    CONVERTED = "converted"
    EXPIRED = "expired"
    REJECTED = "rejected"

class ReferralType(str, Enum):
    DIRECT = "direct"  # User directly referred by another user
    INDIRECT = "indirect"  # User referred through a chain of referrals

class ReferralTracking(BaseModel):
    """Tracks individual referral events and their outcomes

    This model serves as the core tracking mechanism for the referral system.
    It records all referral attempts, successful conversions, and commission payments.

    Fields:
        id: Unique identifier for the referral tracking entry
        referrer_id: ID of the user who made the referral
        referral_code: The code used for this referral
        referred_user_id: ID of the user who was referred (set after conversion)
        status: Current status of the referral (pending, converted, expired, rejected)
        referral_type: Type of referral (direct or indirect)
        created_at: When the referral was initiated
        converted_at: When the referral was successfully converted
        commission_amount: Amount of commission earned for this referral
        commission_paid: Whether the commission has been paid
        commission_paid_at: When the commission was paid
        notes: Additional notes about the referral
        source: Source of the referral (website, mobile app, email, etc.)
        utm_source: UTM source if applicable
        utm_medium: UTM medium if applicable
        utm_campaign: UTM campaign if applicable
        conversion_value: Monetary value of the conversion if applicable
        referral_metadata: Additional metadata about the referral
    """
    id: str
    referrer_id: str
    referral_code: str
    referred_user_id: Optional[str] = None
    status: ReferralStatus = ReferralStatus.PENDING
    referral_type: ReferralType = ReferralType.DIRECT
    created_at: datetime
    converted_at: Optional[datetime] = None
    commission_amount: Optional[float] = None
    commission_paid: bool = False
    commission_paid_at: Optional[datetime] = None
    notes: Optional[str] = None
    source: Optional[str] = None
    utm_source: Optional[str] = None
    utm_medium: Optional[str] = None
    utm_campaign: Optional[str] = None
    conversion_value: Optional[float] = None
    referral_metadata: Optional[Dict] = None

class ReferralRelationship(BaseModel):
    """Tracks relationships between referrers and referred users

    This model maintains the network of relationships created through referrals.
    It helps track the strength and activity of these relationships over time.

    Fields:
        id: Unique identifier for the relationship
        referrer_id: ID of the referring user
        referred_id: ID of the referred user
        relationship_type: Type of referral relationship
        created_at: When the relationship was established
        referral_tracking_id: Link to the original referral tracking entry
        is_active: Whether the relationship is currently active
        relationship_strength: Score indicating the strength of the relationship
        last_interaction: When the last interaction occurred
        total_interactions: Total number of interactions between users
        interaction_history: History of interactions between users
        relationship_metadata: Additional metadata about the relationship
    """
    id: str
    referrer_id: str
    referred_id: str
    relationship_type: ReferralType
    created_at: datetime
    referral_tracking_id: str  # Link to the original referral tracking entry
    is_active: bool = True  # Can be used to mark relationships as inactive
    relationship_strength: float = 0.0
    last_interaction: Optional[datetime] = None
    total_interactions: int = 0
    interaction_history: Optional[List[Dict]] = None
    relationship_metadata: Optional[Dict] = None

from enum import Enum

class TierLevel(str, Enum):
    BRONZE = "bronze"
    SILVER = "silver"
    GOLD = "gold"
    PLATINUM = "platinum"

class TierRequirements:
    COMMISSION_RATES = {
        TierLevel.BRONZE: 0.10,
        TierLevel.SILVER: 0.15,
        TierLevel.GOLD: 0.20,
        TierLevel.PLATINUM: 0.25
    }

class CommissionPayment(BaseModel):
    id: str
    affiliate_id: str
    amount: float
    payment_method: str
    status: str  # pending, completed, failed
    created_at: datetime
    completed_at: Optional[datetime] = None
    tracking_ids: List[str]  # List of referral tracking IDs included in this payment
    transaction_id: Optional[str] = None  # External payment system reference
    notes: Optional[str] = None

class AffiliateStatus(BaseModel):
    """Tracks the status and performance metrics of affiliates

    This model maintains the current state and historical performance of affiliates.
    It includes various metrics used for tier calculation and commission tracking.

    Fields:
        user_id: Unique identifier of the affiliate
        is_active: Whether the affiliate account is currently active
        tier: Current tier level of the affiliate
        commission_rate: Current commission rate based on tier
        total_successful_referrals: Total number of successful referrals
        monthly_successful_referrals: Number of successful referrals this month
        last_tier_update: When the tier was last updated
        lifetime_earnings: Total earnings since becoming an affiliate
        pending_earnings: Current unpaid earnings
        last_payout: When the last payout was made
        created_at: When the affiliate account was created
        stripe_connect_id: ID for Stripe Connect integration
        payment_method: Preferred payment method for commissions
        payment_details: Additional payment method details
        average_conversion_rate: Average conversion rate of referrals
        total_conversion_value: Total monetary value of conversions
        activity_score: Score based on recent activity and performance
        last_referral_at: When the last referral was made
        total_paid_out: Total amount paid out to date
        performance_metrics: Additional performance metrics
    """
    user_id: str
    is_active: bool = False
    tier: TierLevel = TierLevel.BRONZE
    commission_rate: float = 0.1  # Will be calculated based on tier
    total_successful_referrals: int = 0
    monthly_successful_referrals: int = 0
    last_tier_update: Optional[datetime] = None
    lifetime_earnings: float = 0
    pending_earnings: float = 0
    last_payout: Optional[datetime] = None
    created_at: datetime
    stripe_connect_id: Optional[str] = None
    payment_method: Optional[str] = None  # Preferred payment method for commissions
    payment_details: Optional[dict] = None  # Payment method specific details
    average_conversion_rate: float = 0.0
    total_conversion_value: float = 0.0
    activity_score: float = 0.0
    last_referral_at: Optional[datetime] = None
    total_paid_out: float = 0.0
    performance_metrics: Optional[Dict] = None

def generate_referral_code(user_id: str) -> str:
    """Generate a unique referral code for a user"""
    # Create a unique code using uuid4 and take first 8 chars
    unique_part = str(uuid.uuid4())[:8]
    # Combine with user identifier
    return f"{user_id[:4]}-{unique_part}".upper()

@router.post("/referral/create-code")
def create_referral_code(user_id: str):
    # Initialize storage
    initialize_storage()
    """Create a referral code for a user"""
    try:
        # Get existing codes
        codes = db.storage.json.get('referral_codes', default={})

        # Check if user already has an active code
        for code_data in codes.values():
            if code_data['user_id'] == user_id and code_data['is_active']:
                # Create referral link if it doesn't exist
                links = db.storage.json.get('referral_links', default={})
                link_exists = False
                for link in links.values():
                    if link['code'] == code_data['code']:
                        link_exists = True
                        break

                if not link_exists:
                    link_id = str(uuid.uuid4())
                    link = ReferralLink(
                        id=link_id,
                        user_id=user_id,
                        code=code_data['code'],
                        created_at=datetime.utcnow()
                    )
                    links[link_id] = link.dict()
                    db.storage.json.put('referral_links', links)

                return {"code": code_data['code']}

        # Generate new code
        code = generate_referral_code(user_id)

        # Store the code
        new_code = ReferralCode(
            code=code,
            user_id=user_id,
            created_at=datetime.utcnow()
        )

        codes[code] = new_code.dict()
        db.storage.json.put('referral_codes', codes)

        # Create referral link
        link_id = str(uuid.uuid4())
        link = ReferralLink(
            id=link_id,
            user_id=user_id,
            code=code,
            created_at=datetime.utcnow()
        )

        links = db.storage.json.get('referral_links', default={})
        links[link_id] = link.dict()
        db.storage.json.put('referral_links', links)

        return {"code": code}

    except Exception as e:
        print(f"[ERROR] Failed to create referral code: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.get("/referral/get-links/{user_id}")
def get_referral_links(user_id: str) -> ReferralLinkResponse:
    """Get all referral links for a user"""
    try:
        links = db.storage.json.get('referral_links', default={})
        user_links = []
        for link in links.values():
            if link['user_id'] == user_id:
                user_links.append(link)
        return ReferralLinkResponse(links=user_links)
    except Exception as e:
        print(f"[ERROR] Failed to get referral links: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e)) from e

@router.post("/referral/track-visit")
def track_referral_visit(referral_code: str):
    """Track a visit to a referral link"""
    try:
        # Validate referral code
        codes = db.storage.json.get('referral_codes', default={})
        if referral_code not in codes or not codes[referral_code]['is_active']:
            raise HTTPException(status_code=400, detail="Invalid referral code")

        # Update link visits
        links = db.storage.json.get('referral_links', default={})
        for link_id, link in links.items():
            if link['code'] == referral_code:
                link['visits'] += 1
                link['last_visited'] = datetime.utcnow().isoformat()
                links[link_id] = link
                db.storage.json.put('referral_links', links)
                break

        return {"status": "success"}
    except Exception as e:
        print(f"[ERROR] Failed to track referral visit: {str(e)}")
        if isinstance(e, HTTPException):
            raise
        raise HTTPException(status_code=500, detail=str(e)) from e

@router.post("/referral/process-commission-payment/{affiliate_id}")
async def process_commission_payment(affiliate_id: str, payment_method: str):
    """Process commission payment for an affiliate"""
    try:
        # Get affiliate status
        affiliates = db.storage.json.get('affiliate_status', default={})
        if affiliate_id not in affiliates:
            raise HTTPException(status_code=404, detail="Affiliate not found")

        affiliate = affiliates[affiliate_id]
        if not affiliate['is_active']:
            raise HTTPException(status_code=400, detail="Affiliate is not active")

        if affiliate['pending_earnings'] <= 0:
            raise HTTPException(status_code=400, detail="No pending earnings to process")

        # Get unpaid referrals
        trackings = db.storage.json.get('referral_tracking', default={})
        unpaid_trackings = []
        for tracking in trackings.values():
            if (
                tracking['referrer_id'] == affiliate_id 
                and tracking['status'] == ReferralStatus.CONVERTED
                and tracking.get('commission_amount')
                and not tracking.get('commission_paid')
            ):
                unpaid_trackings.append(tracking)

        if not unpaid_trackings:
            raise HTTPException(status_code=400, detail="No unpaid commissions found")

        # Create commission payment record
        payment_id = str(uuid.uuid4())
        payment = CommissionPayment(
            id=payment_id,
            affiliate_id=affiliate_id,
            amount=affiliate['pending_earnings'],
            payment_method=payment_method,
            status='pending',
            created_at=datetime.utcnow(),
            tracking_ids=[t['id'] for t in unpaid_trackings]
        )

        # Store payment record
        payments = db.storage.json.get('commission_payments', default={})
        payments[payment_id] = payment.dict()
        db.storage.json.put('commission_payments', payments)

        # Update referral tracking records
        now = datetime.utcnow()
        for tracking in unpaid_trackings:
            tracking['commission_paid'] = True
            tracking['commission_paid_at'] = now.isoformat()
            trackings[tracking['id']] = tracking

        db.storage.json.put('referral_tracking', trackings)

        # Update affiliate status
        affiliate['lifetime_earnings'] += affiliate['pending_earnings']
        affiliate['pending_earnings'] = 0
        affiliate['last_payout'] = now.isoformat()

        affiliates[affiliate_id] = affiliate
        db.storage.json.put('affiliate_status', affiliates)

        return {
            "payment_id": payment_id,
            "amount": payment.amount,
            "tracking_ids": payment.tracking_ids
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Failed to process commission payment: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e)) from e

@router.get("/referral/get-commission-payments/{affiliate_id}")
def get_commission_payments(affiliate_id: str):
    """Get commission payment history for an affiliate"""
    try:
        payments = db.storage.json.get('commission_payments', default={})
        affiliate_payments = []

        for payment in payments.values():
            if payment['affiliate_id'] == affiliate_id:
                affiliate_payments.append(payment)

        return {
            "payments": sorted(
                affiliate_payments,
                key=lambda x: x['created_at'],
                reverse=True
            )
        }

    except Exception as e:
        print(f"[ERROR] Failed to get commission payments: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e)) from e



@router.post("/referral/track-referral")
def track_referral(referral_code: str):
    try:
        # Validate referral code
        codes = db.storage.json.get('referral_codes', default={})
        if referral_code not in codes or not codes[referral_code]['is_active']:
            raise HTTPException(status_code=400, detail="Invalid referral code")

        # Create tracking entry
        tracking_id = str(uuid.uuid4())
        tracking = ReferralTracking(
            id=tracking_id,
            referrer_id=codes[referral_code]['user_id'],
            referral_code=referral_code,
            created_at=datetime.utcnow()
        )

        # Store tracking
        trackings = db.storage.json.get('referral_tracking', default={})
        trackings[tracking_id] = tracking.dict()
        db.storage.json.put('referral_tracking', trackings)

        return {"tracking_id": tracking_id}

    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Failed to track referral: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e)) from e

@router.post("/referral/convert-referral/{tracking_id}")
async def convert_referral(tracking_id: str, referred_user_id: str):
    try:
        # Initialize storage
        initialize_storage()

        # Validate relationship
        trackings = db.storage.json.get('referral_tracking', default={})
        if tracking_id not in trackings:
            raise HTTPException(status_code=404, detail="Tracking ID not found")

        tracking = trackings[tracking_id]
        if not validate_relationship(tracking['referrer_id'], referred_user_id):
            raise HTTPException(status_code=400, detail="Invalid referral relationship")
        # Get tracking entry
        trackings = db.storage.json.get('referral_tracking', default={})
        if tracking_id not in trackings:
            raise HTTPException(status_code=404, detail="Tracking ID not found")

        tracking = trackings[tracking_id]
        if tracking['status'] != ReferralStatus.PENDING:
            raise HTTPException(status_code=400, detail="Referral already processed")

        # Check for existing relationship
        relationships = db.storage.json.get('referral_relationships', default={})
        for rel in relationships.values():
            if rel['referrer_id'] == tracking['referrer_id'] and rel['referred_id'] == referred_user_id:
                raise HTTPException(status_code=400, detail="Relationship already exists")

        # Update tracking
        tracking['status'] = ReferralStatus.CONVERTED
        tracking['referred_user_id'] = referred_user_id
        tracking['converted_at'] = datetime.utcnow().isoformat()

        # Calculate commission amount based on affiliate tier
        affiliates = db.storage.json.get('affiliate_status', default={})
        if tracking['referrer_id'] in affiliates:
            affiliate = affiliates[tracking['referrer_id']]
            # For example, 100 USD per referral multiplied by commission rate
            base_commission = 100
            tracking['commission_amount'] = base_commission * affiliate['commission_rate']

        # Store updated tracking
        trackings[tracking_id] = tracking
        db.storage.json.put('referral_tracking', trackings)

        # Create referral relationship
        relationship_id = str(uuid.uuid4())
        relationship = ReferralRelationship(
            id=relationship_id,
            referrer_id=tracking['referrer_id'],
            referred_id=referred_user_id,
            relationship_type=ReferralType.DIRECT,
            created_at=datetime.utcnow(),
            referral_tracking_id=tracking_id
        )

        relationships[relationship_id] = relationship.dict()
        db.storage.json.put('referral_relationships', relationships)

        # Update affiliate stats and tier
        if tracking['referrer_id'] in affiliates:
            affiliate = affiliates[tracking['referrer_id']]
            affiliate['total_successful_referrals'] += 1
            affiliate['monthly_successful_referrals'] += 1
            affiliate['pending_earnings'] = affiliate.get('pending_earnings', 0) + tracking['commission_amount']

            # Store updated affiliate status
            affiliates[tracking['referrer_id']] = affiliate
            db.storage.json.put('affiliate_status', affiliates)

            # Calculate new tier
            # Tier calculation is now handled locally
            try:
                metrics = db.storage.json.get(f"referral_stats/{tracking['referrer_id']}")
                current_tier = metrics.get("current_tier", TierLevel.BRONZE)
            except Exception:
                current_tier = TierLevel.BRONZE

        return {
            "status": "success",
            "relationship_id": relationship_id,
            "commission_amount": tracking['commission_amount']
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Failed to convert referral: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e)) from e

@router.post("/referral/activate-affiliate")
def activate_affiliate(user_id: str):
    # Initialize storage
    initialize_storage()
    try:
        # Get affiliate statuses
        affiliates = db.storage.json.get('affiliate_status', default={})

        # Check if already an affiliate
        if user_id in affiliates:
            if affiliates[user_id]['is_active']:
                return {"status": "already_active"}
            else:
                # Reactivate
                affiliates[user_id]['is_active'] = True
        else:
            # Create new affiliate status
            status = AffiliateStatus(
                user_id=user_id,
                is_active=True,
                created_at=datetime.utcnow(),
                tier=TierLevel.BRONZE,
                commission_rate=TierRequirements.COMMISSION_RATES[TierLevel.BRONZE]
            )
            affiliates[user_id] = status.dict()

        # Store updated affiliate status
        db.storage.json.put('affiliate_status', affiliates)

        return {"status": "activated"}

    except Exception as e:
        print(f"[ERROR] Failed to activate affiliate: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e)) from e

@router.get("/referral/get-affiliate-status/{user_id}")
def get_affiliate_status_endpoint(user_id: str):
    """Get affiliate status for a user

    Args:
        user_id: ID of the user

    Returns:
        Current affiliate status
    """
    return get_affiliate_status(user_id)

@router.post("/referral/update-settings/{user_id}")
def update_affiliate_settings(user_id: str, settings: Dict):
    """Update affiliate settings for a user

    Args:
        user_id: ID of the user
        settings: New settings to apply

    Returns:
        Updated settings

    Raises:
        HTTPException: If settings cannot be updated
    """
    try:
        # Validate user is an affiliate
        affiliates = db.storage.json.get('affiliate_status', default={})
        if user_id not in affiliates:
            raise HTTPException(
                status_code=400,
                detail="User is not an affiliate"
            )

        # Get current settings
        all_settings = db.storage.json.get('affiliate_settings', default={})

        # Update settings
        current = all_settings.get(user_id, {})
        current.update(settings)
        current['updated_at'] = datetime.utcnow().isoformat()

        # Store updated settings
        all_settings[user_id] = current
        db.storage.json.put('affiliate_settings', all_settings)

        return {"status": "success", "settings": current}

    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Failed to update affiliate settings: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to update affiliate settings"
        ) from e

@router.get("/referral/get-settings/{user_id}")
def get_affiliate_settings_endpoint(user_id: str):
    """Get affiliate settings for a user

    Args:
        user_id: ID of the user

    Returns:
        Current affiliate settings
    """
    settings = get_affiliate_settings(user_id)
    return {"settings": settings.dict()}

def get_affiliate_status(user_id: str):
    try:
        affiliates = db.storage.json.get('affiliate_status', default={})
        status = affiliates.get(user_id)

        if not status:
            return {
                "is_affiliate": False,
                "status": None
            }

        return {
            "is_affiliate": True,
            "status": status
        }

    except Exception as e:
        print(f"[ERROR] Failed to get affiliate status: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e)) from e

# Tier requirements are now handled by tier_progression.py

# Tier calculation is now handled by tier_progression.py

@router.get("/referral/get-relationships/{user_id}")
def get_relationships(user_id: str):
    """Get all referral relationships for a user"""
    try:
        relationships = db.storage.json.get('referral_relationships', default={})
        user_relationships = []

        # Get relationships where user is either referrer or referred
        for rel in relationships.values():
            if rel['referrer_id'] == user_id or rel['referred_id'] == user_id:
                user_relationships.append(rel)

        return {
            "relationships": user_relationships
        }

    except Exception as e:
        print(f"[ERROR] Failed to get relationships: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e)) from e

@router.get("/referral/get-referral-stats/{user_id}")
def get_referral_stats(user_id: str):
    try:
        # Get all tracking entries
        trackings = db.storage.json.get('referral_tracking', default={})

        # Filter and count referrals for this user
        total_referrals = 0
        converted_referrals = 0
        pending_referrals = 0

        for tracking in trackings.values():
            if tracking['referrer_id'] == user_id:
                total_referrals += 1
                if tracking['status'] == 'converted':
                    converted_referrals += 1
                elif tracking['status'] == 'pending':
                    pending_referrals += 1

        return {
            "total_referrals": total_referrals,
            "converted_referrals": converted_referrals,
            "pending_referrals": pending_referrals
        }

    except Exception as e:
        print(f"[ERROR] Failed to get referral stats: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e)) from e
