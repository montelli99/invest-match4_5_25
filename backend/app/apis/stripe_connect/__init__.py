from datetime import datetime
from typing import Optional, Dict, List
from enum import Enum
from pydantic import BaseModel, Field
from fastapi import APIRouter, HTTPException
import databutton as db
import stripe
from app.apis.stripe_connect_utils import (
    validate_currency,
    validate_country,
    mock_create_connect_account,
    generate_mock_onboarding_url,
    validate_payout_amount
)

router = APIRouter()

class ConnectAccountStatus(str, Enum):
    PENDING = "pending"
    ENABLED = "enabled"
    DISABLED = "disabled"
    REJECTED = "rejected"

class ConnectAccountType(str, Enum):
    STANDARD = "standard"  # Standard Connect account type for most use cases
    EXPRESS = "express"   # Simplified onboarding with Stripe hosted UI
    CUSTOM = "custom"     # Fully customizable but requires additional verification

    @classmethod
    def validate(cls, value: str) -> str:
        """Validate and normalize account type"""
        try:
            return cls(value.lower())
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid account type: {value}. Must be one of {[e.value for e in cls]}"
            )

class ConnectAccount(BaseModel):
    id: str
    user_id: str
    stripe_id: str
    account_type: ConnectAccountType
    status: ConnectAccountStatus
    created_at: datetime
    enabled_at: Optional[datetime] = None
    disabled_at: Optional[datetime] = None
    country: str
    default_currency: str
    payouts_enabled: bool = False
    requirements: Optional[Dict] = None
    metadata: Optional[Dict] = None

class CreateConnectAccountRequest(BaseModel):
    user_id: str
    account_type: ConnectAccountType = ConnectAccountType.EXPRESS
    country: str = "US"
    default_currency: str = "usd"
    metadata: Optional[Dict] = None

class ConnectAccountResponse(BaseModel):
    account: ConnectAccount
    onboarding_url: Optional[str] = None

class PayoutRequest(BaseModel):
    connect_account_id: str
    amount: float
    currency: str = "usd"
    metadata: Optional[Dict] = None

class PayoutResponse(BaseModel):
    payout_id: str
    amount: float
    currency: str
    status: str

# Initialize Stripe when we have the API key
# stripe.api_key = db.secrets.get("STRIPE_SECRET_KEY")

def get_connect_accounts() -> Dict[str, ConnectAccount]:
    """Get all Connect accounts from storage"""
    return db.storage.json.get('stripe_connect_accounts', default={})

def save_connect_accounts(accounts: Dict[str, ConnectAccount]) -> None:
    """Save Connect accounts to storage"""
    db.storage.json.put('stripe_connect_accounts', accounts)

@router.post("/stripe/connect/create-account", response_model=ConnectAccountResponse)
def create_connect_account(request: CreateConnectAccountRequest):
    """Create a new Stripe Connect account
    
    This endpoint will:
    1. Create a Connect account in Stripe
    2. Store the account details locally
    3. Generate an onboarding URL if needed
    4. Return the account details and onboarding URL
    """
    try:
        # Validate inputs
        account_type = ConnectAccountType.validate(request.account_type)
        country = validate_country(request.country)
        currency = validate_currency(request.default_currency)
        
        # Check if user already has an account
        accounts = get_connect_accounts()
        for acc in accounts.values():
            if acc['user_id'] == request.user_id:
                if acc['status'] not in [ConnectAccountStatus.DISABLED, ConnectAccountStatus.REJECTED]:
                    raise HTTPException(
                        status_code=400,
                        detail="User already has an active Connect account"
                    )
        
        # Create mock Stripe account for now
        stripe_account = mock_create_connect_account(
            user_id=request.user_id,
            account_type=account_type,
            country=country,
            currency=currency
        )
        
        # Create local account record
        account = ConnectAccount(
            id=stripe_account['id'],
            user_id=request.user_id,
            stripe_id=stripe_account['id'],
            account_type=account_type,
            status=ConnectAccountStatus.PENDING,
            created_at=datetime.utcnow(),
            country=country,
            default_currency=currency,
            metadata=request.metadata,
            requirements=stripe_account['requirements']
        )
        
        # Store the account
        accounts = get_connect_accounts()
        accounts[account.id] = account.dict()
        save_connect_accounts(accounts)
        
        return ConnectAccountResponse(
            account=account,
            onboarding_url="https://example.com/onboarding"
        )
        
    except Exception as e:
        print(f"[ERROR] Failed to create Connect account: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e)) from e

@router.get("/stripe/connect/account/{account_id}", response_model=ConnectAccount)
def get_connect_account(account_id: str):
    """Get a specific Connect account"""
    try:
        accounts = get_connect_accounts()
        if account_id not in accounts:
            raise HTTPException(status_code=404, detail="Connect account not found")
            
        return accounts[account_id]
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Failed to get Connect account: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e)) from e

@router.get("/stripe/connect/accounts/user/{user_id}", response_model=List[ConnectAccount])
def get_user_connect_accounts(user_id: str):
    """Get all Connect accounts for a user"""
    try:
        accounts = get_connect_accounts()
        user_accounts = []
        
        for account in accounts.values():
            if account['user_id'] == user_id:
                user_accounts.append(account)
                
        return user_accounts
        
    except Exception as e:
        print(f"[ERROR] Failed to get user Connect accounts: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e)) from e

@router.post("/stripe/connect/payout", response_model=PayoutResponse)
def create_payout(request: PayoutRequest):
    """Create a payout to a Connect account
    
    This endpoint will:
    1. Verify the Connect account exists and is enabled
    2. Create a payout in Stripe
    3. Return the payout details
    """
    try:
        # Get the Connect account
        accounts = get_connect_accounts()
        if request.connect_account_id not in accounts:
            raise HTTPException(status_code=404, detail="Connect account not found")
            
        account = accounts[request.connect_account_id]
        if account['status'] != ConnectAccountStatus.ENABLED:
            raise HTTPException(
                status_code=400,
                detail=f"Connect account status is {account['status']}"
            )
            
        if not account['payouts_enabled']:
            raise HTTPException(
                status_code=400,
                detail="Payouts are not enabled for this account"
            )
        
        # Validate amount and currency
        amount_in_cents, currency = validate_payout_amount(
            amount=request.amount,
            currency=request.currency
        )
        
        # Mock payout creation
        mock_payout = {
            "id": f"mock_po_{int(datetime.utcnow().timestamp())}",
            "object": "payout",
            "amount": amount_in_cents,
            "arrival_date": int((datetime.utcnow().timestamp() + 86400)),  # +24h
            "currency": currency,
            "description": None,
            "destination": f"ba_mock_{request.connect_account_id}",
            "failure_code": None,
            "failure_message": None,
            "method": "standard",
            "source_type": "card",
            "status": "pending",
            "type": "bank_account"
        }
        
        return PayoutResponse(
            payout_id=mock_payout['id'],
            amount=request.amount,  # Return original amount
            currency=currency,
            status=mock_payout['status']
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Failed to create payout: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e)) from e
