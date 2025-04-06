from datetime import datetime
from typing import Optional, Dict, Tuple
from fastapi import APIRouter, HTTPException

router = APIRouter()
import databutton as db

# Test mode configuration
TEST_MODE_ENABLED = True  # Can be controlled via environment variable
TEST_ACCOUNT_STATES = {
    'pending': {
        'charges_enabled': False,
        'payouts_enabled': False,
        'details_submitted': False,
        'requirements_status': 'pending'
    },
    'verified': {
        'charges_enabled': True,
        'payouts_enabled': True,
        'details_submitted': True,
        'requirements_status': 'verified'
    },
    'restricted': {
        'charges_enabled': True,
        'payouts_enabled': False,
        'details_submitted': True,
        'requirements_status': 'restricted'
    }
}

def get_test_account_state(account_id: str) -> Dict:
    """Get the current state of a test account
    
    In test mode, accounts cycle through different states to simulate
    the verification process.
    """
    if not TEST_MODE_ENABLED:
        raise HTTPException(
            status_code=400,
            detail="Test mode is not enabled"
        )
        
    # Get stored state or default to pending
    states = db.storage.json.get('stripe_test_states', default={})
    return states.get(account_id, TEST_ACCOUNT_STATES['pending'])

def update_test_account_state(account_id: str, new_state: str) -> Dict:
    """Update the state of a test account
    
    Args:
        account_id: The ID of the test account
        new_state: The new state to set (pending, verified, restricted)
        
    Returns:
        Dict containing the new account state
    """
    if new_state not in TEST_ACCOUNT_STATES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid state {new_state}. Must be one of {list(TEST_ACCOUNT_STATES.keys())}"
        )
        
    states = db.storage.json.get('stripe_test_states', default={})
    states[account_id] = TEST_ACCOUNT_STATES[new_state]
    db.storage.json.put('stripe_test_states', states)
    
    return states[account_id]

def validate_currency(currency: str) -> str:
    """Validate and normalize currency code"""
    currency = currency.lower()
    supported_currencies = {'usd', 'eur', 'gbp', 'aud', 'cad'}
    if currency not in supported_currencies:
        raise HTTPException(
            status_code=400,
            detail=f"Currency {currency} not supported. Must be one of {supported_currencies}"
        )
    return currency

def validate_country(country: str) -> str:
    """Validate and normalize country code"""
    country = country.upper()
    supported_countries = {'US', 'GB', 'CA', 'AU', 'FR', 'DE', 'ES', 'IT', 'NL', 'BE', 'IE'}
    if country not in supported_countries:
        raise HTTPException(
            status_code=400,
            detail=f"Country {country} not supported. Must be one of {supported_countries}"
        )
    return country

def get_mock_requirements(account_type: str) -> Dict:
    """Get mock requirements for different account types"""
    base_requirements = {
        "currently_due": [
            "external_account",
            "business_profile.url",
            "business_profile.mcc",
        ],
        "eventually_due": [
            "external_account",
            "business_profile.url",
            "business_profile.mcc",
        ],
        "current_deadline": None,
        "disabled_reason": None,
        "past_due": [],
        "pending_verification": []
    }
    
    if account_type == "custom":
        base_requirements["currently_due"].extend([
            "business_profile.product_description",
            "business_profile.support_phone",
            "company.address.city",
            "company.address.line1",
            "company.address.postal_code",
            "company.address.state",
            "company.name",
            "company.phone",
            "company.tax_id",
            "representative.first_name",
            "representative.last_name",
            "representative.email",
            "representative.phone",
            "representative.dob.day",
            "representative.dob.month",
            "representative.dob.year",
            "representative.address.city",
            "representative.address.line1",
            "representative.address.postal_code",
            "representative.address.state",
            "representative.ssn_last_4"
        ])
        base_requirements["eventually_due"].extend([
            "business_profile.product_description",
            "business_profile.support_phone",
            "company.address.city",
            "company.address.line1",
            "company.address.postal_code",
            "company.address.state",
            "company.name",
            "company.phone",
            "company.tax_id",
            "representative.first_name",
            "representative.last_name",
            "representative.email",
            "representative.phone",
            "representative.dob.day",
            "representative.dob.month",
            "representative.dob.year",
            "representative.address.city",
            "representative.address.line1",
            "representative.address.postal_code",
            "representative.address.state",
            "representative.ssn_last_4"
        ])
    
    return base_requirements

def generate_mock_onboarding_url(account_id: str, account_type: str) -> str:
    """Generate a mock onboarding URL"""
    base_url = "https://connect.stripe.com/setup/s/mock"
    return f"{base_url}/{account_type}/{account_id}"

def validate_payout_amount(amount: float, currency: str) -> Tuple[int, str]:
    """Validate and convert payout amount to smallest currency unit"""
    if amount <= 0:
        raise HTTPException(
            status_code=400,
            detail="Amount must be greater than 0"
        )
    
    # Convert to smallest currency unit (e.g., cents for USD)
    currency = currency.lower()
    if currency in {'usd', 'eur', 'gbp', 'aud', 'cad'}:
        amount_in_cents = int(amount * 100)
        if amount_in_cents < 100:  # Minimum 1 USD/EUR/etc
            raise HTTPException(
                status_code=400,
                detail=f"Minimum payout amount is 1 {currency.upper()}"
            )
        return amount_in_cents, currency
    
    raise HTTPException(
        status_code=400,
        detail=f"Currency {currency} not supported"
    )

def mock_create_connect_account(user_id: str, account_type: str, country: str, currency: str, test_state: str = 'pending') -> Dict:
    """Create a mock Connect account with realistic test data
    
    Args:
        user_id: The ID of the user creating the account
        account_type: The type of account (standard, express, custom)
        country: The country code for the account
        currency: The default currency for the account
        test_state: Initial test state (pending, verified, restricted)
        
    Returns:
        Dict containing the mock account data
    """
    # Validate and normalize inputs
    country = validate_country(country)
    currency = validate_currency(currency)
    
    # Create mock account ID
    mock_id = f"mock_acct_{user_id}_{int(datetime.utcnow().timestamp())}"
    
    # Set initial test state
    account_state = update_test_account_state(mock_id, test_state)
    # Store account in test accounts
    test_accounts = db.storage.json.get('stripe_test_accounts', default={})
    
    account_data = {
        "id": mock_id,
        "object": "account",
        "business_type": "individual",
        "capabilities": {
            "card_payments": "inactive",
            "transfers": "inactive"
        },
        "charges_enabled": False,
        "country": country,
        "default_currency": currency,
        "details_submitted": False,
        "email": None,
        "payouts_enabled": False,
        "requirements": get_mock_requirements(account_type),
        "settings": {
            "branding": {
                "icon": None,
                "logo": None,
                "primary_color": None
            },
            "card_payments": {
                "statement_descriptor_prefix": None
            },
            "payments": {
                "statement_descriptor": None,
                "statement_descriptor_kana": None,
                "statement_descriptor_kanji": None
            },
            "payouts": {
                "debit_negative_balances": True,
                "schedule": {
                    "delay_days": 2,
                    "interval": "daily"
                },
                "statement_descriptor": None
            }
        },
        "type": account_type,
        "created": int(datetime.utcnow().timestamp())
    }
    
    # Store account data
    test_accounts[mock_id] = account_data
    db.storage.json.put('stripe_test_accounts', test_accounts)
    
    return account_data
