from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from fastapi import APIRouter, HTTPException
import databutton as db
from datetime import datetime, timedelta
from uuid import uuid4
import stripe
from app.apis.models import SubscriptionTier, FeatureAccess, UserSubscription

# Initialize Stripe
stripe.api_key = db.secrets.get("STRIPE_SECRET_KEY")

router = APIRouter()

class SubscriptionFeature(BaseModel):
    """Definition of a feature and its access level per tier"""
    name: str
    description: str
    access_levels: Dict[SubscriptionTier, FeatureAccess]
    
    model_config = {"arbitrary_types_allowed": True}

class SubscriptionPlan(BaseModel):
    """Subscription plan details"""
    tier: SubscriptionTier
    name: str
    description: str
    price_monthly: float
    price_annual: float
    features: Dict[str, FeatureAccess]
    max_contacts: int
    max_matches_per_month: int
    profile_visibility_level: str
    support_level: str
    trial_periods_available: List[float] = [0.5, 3, 6, 9]  # Available trial periods in months (0.5 = 14 days)
    
    model_config = {"arbitrary_types_allowed": True}

# Define the feature set
SUBSCRIPTION_FEATURES = {
    'contact_import': SubscriptionFeature(
        name='Contact Import',
        description='Import and manage external contacts',
        access_levels={
            SubscriptionTier.FREE: FeatureAccess.LIMITED,
            SubscriptionTier.BASIC: FeatureAccess.FULL,
            SubscriptionTier.PROFESSIONAL: FeatureAccess.FULL,
            SubscriptionTier.ENTERPRISE: FeatureAccess.FULL
        }
    ),
    'matching': SubscriptionFeature(
        name='Matching',
        description='Access to matching algorithm and recommendations',
        access_levels={
            SubscriptionTier.FREE: FeatureAccess.LIMITED,
            SubscriptionTier.BASIC: FeatureAccess.FULL,
            SubscriptionTier.PROFESSIONAL: FeatureAccess.FULL,
            SubscriptionTier.ENTERPRISE: FeatureAccess.FULL
        }
    ),
    'messaging': SubscriptionFeature(
        name='Messaging',
        description='Direct messaging with matches',
        access_levels={
            SubscriptionTier.FREE: FeatureAccess.LIMITED,
            SubscriptionTier.BASIC: FeatureAccess.FULL,
            SubscriptionTier.PROFESSIONAL: FeatureAccess.FULL,
            SubscriptionTier.ENTERPRISE: FeatureAccess.FULL
        }
    ),
    'analytics': SubscriptionFeature(
        name='Analytics',
        description='Access to analytics and reporting',
        access_levels={
            SubscriptionTier.FREE: FeatureAccess.NONE,
            SubscriptionTier.BASIC: FeatureAccess.LIMITED,
            SubscriptionTier.PROFESSIONAL: FeatureAccess.FULL,
            SubscriptionTier.ENTERPRISE: FeatureAccess.FULL
        }
    ),
    'profile_visibility': SubscriptionFeature(
        name='Profile Visibility',
        description='Control over profile visibility',
        access_levels={
            SubscriptionTier.FREE: FeatureAccess.LIMITED,
            SubscriptionTier.BASIC: FeatureAccess.FULL,
            SubscriptionTier.PROFESSIONAL: FeatureAccess.FULL,
            SubscriptionTier.ENTERPRISE: FeatureAccess.FULL
        }
    ),
    'export_data': SubscriptionFeature(
        name='Data Export',
        description='Export matching and contact data',
        access_levels={
            SubscriptionTier.FREE: FeatureAccess.NONE,
            SubscriptionTier.BASIC: FeatureAccess.LIMITED,
            SubscriptionTier.PROFESSIONAL: FeatureAccess.FULL,
            SubscriptionTier.ENTERPRISE: FeatureAccess.FULL
        }
    )
}

# Define the subscription plans
SUBSCRIPTION_PLANS = {
    SubscriptionTier.FREE: SubscriptionPlan(
        tier=SubscriptionTier.FREE,
        name='Free',
        description='Basic access to essential features',
        price_monthly=0,
        price_annual=0,
        features={
            feature: data.access_levels[SubscriptionTier.FREE]
            for feature, data in SUBSCRIPTION_FEATURES.items()
        },
        max_contacts=50,
        max_matches_per_month=20,
        profile_visibility_level='basic',
        support_level='community'
    ),
    SubscriptionTier.BASIC: SubscriptionPlan(
        tier=SubscriptionTier.BASIC,
        name='Basic',
        description='Enhanced features for growing networks',
        price_monthly=49.99,
        price_annual=499.99,
        features={
            feature: data.access_levels[SubscriptionTier.BASIC]
            for feature, data in SUBSCRIPTION_FEATURES.items()
        },
        max_contacts=200,
        max_matches_per_month=100,
        profile_visibility_level='enhanced',
        support_level='email'
    ),
    SubscriptionTier.PROFESSIONAL: SubscriptionPlan(
        tier=SubscriptionTier.PROFESSIONAL,
        name='Professional',
        description='Advanced features for professional networkers',
        price_monthly=99.99,
        price_annual=999.99,
        features={
            feature: data.access_levels[SubscriptionTier.PROFESSIONAL]
            for feature, data in SUBSCRIPTION_FEATURES.items()
        },
        max_contacts=1000,
        max_matches_per_month=500,
        profile_visibility_level='full',
        support_level='priority'
    ),
    SubscriptionTier.ENTERPRISE: SubscriptionPlan(
        tier=SubscriptionTier.ENTERPRISE,
        name='Enterprise',
        description='Complete solution for large organizations',
        price_monthly=299.99,
        price_annual=2999.99,
        features={
            feature: data.access_levels[SubscriptionTier.ENTERPRISE]
            for feature, data in SUBSCRIPTION_FEATURES.items()
        },
        max_contacts=5000,
        max_matches_per_month=2000,
        profile_visibility_level='custom',
        support_level='dedicated'
    )
}

class PaymentMethod(BaseModel):
    """Payment method details"""
    id: str
    type: str  # 'credit_card', 'bank_account'
    last_four: str
    expiry_date: Optional[str] = None  # For credit cards
    is_default: bool = False
    created_at: str  # ISO format date string
    
    model_config = {"arbitrary_types_allowed": True}

class PaymentTransaction(BaseModel):
    """Payment transaction details"""
    id: str
    user_id: str
    amount: float
    currency: str = 'USD'
    status: str  # 'pending', 'completed', 'failed'
    payment_method_id: str
    description: str
    created_at: str  # ISO format date string
    subscription_period_start: str  # ISO format date string
    subscription_period_end: str  # ISO format date string
    
    model_config = {"arbitrary_types_allowed": True}

class Invoice(BaseModel):
    """Invoice details"""
    id: str
    user_id: str
    transaction_id: str
    amount: float
    currency: str = 'USD'
    status: str  # 'pending', 'paid', 'overdue'
    due_date: str  # ISO format date string
    items: List[Dict[str, Any]]
    created_at: str  # ISO format date string
    
    model_config = {"arbitrary_types_allowed": True}

class TrialCode(BaseModel):
    """Trial code details"""
    code: str
    trial_period: float  # Trial period in months
    tier: SubscriptionTier
    expiry_date: str  # ISO format date string
    max_uses: int
    current_uses: int = 0
    is_active: bool = True
    
    model_config = {"arbitrary_types_allowed": True}

class StartTrialRequest(BaseModel):
    """Request to start a free trial"""
    user_id: str
    trial_code: str
    
    model_config = {"arbitrary_types_allowed": True}

class SubscriptionUpdate(BaseModel):
    """Subscription update request"""
    new_tier: SubscriptionTier
    payment_method_id: str
    is_annual: bool = False
    
    model_config = {"arbitrary_types_allowed": True}



@router.get('/subscription-plans', response_model=Dict[str, SubscriptionPlan])
async def get_subscription_plans():
    """Get all available subscription plans"""
    return {tier.value: plan for tier, plan in SUBSCRIPTION_PLANS.items()}

def validate_trial_code(code: str) -> tuple[bool, Optional[TrialCode], str]:
    """Validate if the trial code is valid and available"""
    trial_codes = db.storage.json.get('trial_codes', default={})
    trial_code = trial_codes.get(code)
    
    if not trial_code:
        return False, None, 'Invalid trial code'
        
    trial_code = TrialCode(**trial_code)
    
    if not trial_code.is_active:
        return False, None, 'Trial code is inactive'
        
    if trial_code.current_uses >= trial_code.max_uses:
        return False, None, 'Trial code has reached maximum uses'
        
    if datetime.now() > datetime.fromisoformat(trial_code.expiry_date):
        return False, None, 'Trial code has expired'
        
    return True, trial_code, ''

def check_trial_eligibility(user_id: str) -> tuple[bool, str]:
    """Check if a user is eligible for a trial"""
    subscriptions = db.storage.json.get('user_subscriptions', default={})
    user_subscription = subscriptions.get(user_id)
    
    if not user_subscription:
        return True, ''
        
    # Check if user has had a trial before
    if user_subscription.get('trial_status') in ['expired', 'converted']:
        return False, 'User has already used their trial period'
        
    # Check if user has an active trial
    if user_subscription.get('is_trial') and user_subscription.get('trial_status') == 'active':
        return False, 'User already has an active trial'
        
    return True, ''

def check_trial_expiration(subscription: dict) -> bool:
    """Check if a trial subscription has expired"""
    if not subscription.get('is_trial') or subscription.get('trial_status') != 'active':
        return False
        
    trial_end = datetime.fromisoformat(subscription['trial_end_date'])
    return datetime.now() > trial_end

@router.post('/start-trial', operation_id='start_trial')
async def start_trial(request: StartTrialRequest):
    """Start a free trial subscription using a trial code"""
    try:
        # Validate trial code
        is_valid, trial_code, error_message = validate_trial_code(request.trial_code)
        if not is_valid:
            raise HTTPException(
                status_code=400,
                detail=error_message
            )
        
        # Check trial eligibility
        is_eligible, message = check_trial_eligibility(request.user_id)
        if not is_eligible:
            raise HTTPException(
                status_code=400,
                detail=message
            )
        
        # Get or create subscription record
        subscriptions = db.storage.json.get('user_subscriptions', default={})
        
        # Calculate trial dates
        trial_start = datetime.now()
        days = 14 if trial_code.trial_period == 0.5 else int(30 * trial_code.trial_period)
        trial_end = trial_start + timedelta(days=days)
        
        # Update trial code usage
        trial_codes = db.storage.json.get('trial_codes', default={})
        trial_code_dict = trial_codes[request.trial_code]
        trial_code_dict['current_uses'] += 1
        trial_codes[request.trial_code] = trial_code_dict
        db.storage.json.put('trial_codes', trial_codes)
        
        # Create trial subscription
        subscription = UserSubscription(
            user_id=request.user_id,
            tier=trial_code.tier,
            start_date=trial_start.isoformat(),
            end_date=trial_end.isoformat(),
            is_trial=True,
            trial_period=trial_code.trial_period,
            trial_start_date=trial_start.isoformat(),
            trial_end_date=trial_end.isoformat(),
            trial_status='active',
            post_trial_plan=trial_code.tier,
            auto_renew=True,
            payment_status='trial'
        )
        
        # Save subscription
        subscriptions[request.user_id] = subscription.model_dump()
        db.storage.json.put('user_subscriptions', subscriptions)
        
        return {
            'status': 'success',
            'message': f'Trial started successfully. Trial ends on {trial_end.date()}',
            'subscription': subscription
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f'Error starting trial: {str(e)}'
        ) from e

@router.get('/subscription-features', response_model=Dict[str, SubscriptionFeature])
async def get_subscription_features():
    """Get all subscription features and their access levels"""
    return SUBSCRIPTION_FEATURES

@router.get('/user-subscription/{user_id}', response_model=UserSubscription)
async def get_user_subscription(user_id: str):
    """Get subscription details for a user"""
    try:
        subscriptions = db.storage.json.get('user_subscriptions', default={})
        subscription = subscriptions.get(user_id)
        
        if not subscription:
            # Create a free tier subscription for new users
            subscription = UserSubscription(
                user_id=user_id,
                tier=SubscriptionTier.FREE,
                start_date=datetime.now().isoformat(),
                is_trial=False
            )
            subscriptions[user_id] = subscription.model_dump()
            db.storage.json.put('user_subscriptions', subscriptions)
            return subscription
        
        # Check for trial expiration
        if check_trial_expiration(subscription):
            # Update subscription to post-trial plan or free tier
            post_trial_plan = subscription.get('post_trial_plan', SubscriptionTier.FREE)
            subscription.update({
                'is_trial': False,
                'trial_status': 'expired',
                'tier': post_trial_plan,
                'payment_status': 'pending' if post_trial_plan != SubscriptionTier.FREE else 'active'
            })
            
            # Save updated subscription
            subscriptions[user_id] = subscription
            db.storage.json.put('user_subscriptions', subscriptions)
            
            # If converting to a paid plan, we should notify the user
            if post_trial_plan != SubscriptionTier.FREE:
                print(f'[INFO] Trial expired for user {user_id}. Converting to {post_trial_plan} plan.')
                # Here we could trigger a notification to the user
        
        return UserSubscription(**subscription if isinstance(subscription, dict) else subscription.model_dump())
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f'Error retrieving user subscription: {str(e)}'
        ) from e

def check_feature_access(user_id: str, feature_name: str) -> FeatureAccess:
    """Check a user's access level for a specific feature"""
    try:
        subscriptions = db.storage.json.get('user_subscriptions', default={})
        subscription = subscriptions.get(user_id)
        
        if not subscription:
            return FeatureAccess.NONE
            
        user_tier = subscription['tier']
        feature = SUBSCRIPTION_FEATURES.get(feature_name)
        
        if not feature:
            return FeatureAccess.NONE
            
        return feature.access_levels[user_tier]
    except Exception:
        return FeatureAccess.NONE

def create_payment_transaction(user_id: str, amount: float, payment_method_id: str, description: str, period_start: datetime, period_end: datetime) -> PaymentTransaction:
    """Create a new payment transaction"""
    transaction = PaymentTransaction(
        id=str(uuid4()),
        user_id=user_id,
        amount=amount,
        payment_method_id=payment_method_id,
        status='pending',
        description=description,
        created_at=datetime.now().isoformat(),
        subscription_period_start=period_start.isoformat(),
        subscription_period_end=period_end.isoformat()
    )
    
    # Store transaction
    transactions = db.storage.json.get('payment_transactions', default={})
    transactions[transaction.id] = transaction.model_dump()
    db.storage.json.put('payment_transactions', transactions)
    
    return transaction

def create_invoice(transaction: PaymentTransaction, items: List[Dict[str, any]]) -> Invoice:
    """Create a new invoice for a transaction"""
    invoice = Invoice(
        id=str(uuid4()),
        user_id=transaction.user_id,
        transaction_id=transaction.id,
        amount=transaction.amount,
        currency=transaction.currency,
        status='pending',
        due_date=(datetime.now() + timedelta(days=30)).isoformat(),
        items=items,
        created_at=datetime.now().isoformat()
    )
    
    # Store invoice
    invoices = db.storage.json.get('invoices', default={})
    invoices[invoice.id] = invoice.model_dump()
    db.storage.json.put('invoices', invoices)
    
    return invoice

@router.post('/payment-methods/{user_id}')
async def add_payment_method(user_id: str, payment_type: str, last_four: str, expiry_date: Optional[str] = None):
    """Add a new payment method for a user"""
    try:
        payment_method = PaymentMethod(
            id=str(uuid4()),
            type=payment_type,
            last_four=last_four,
            expiry_date=expiry_date,
            created_at=datetime.now().isoformat()
        )
        
        # Store payment method
        payment_methods = db.storage.json.get('payment_methods', default={})
        user_methods = payment_methods.get(user_id, [])
        
        # Set as default if it's the first payment method
        if not user_methods:
            payment_method.is_default = True
            
        user_methods.append(payment_method.model_dump())
        payment_methods[user_id] = user_methods
        db.storage.json.put('payment_methods', payment_methods)
        
        return payment_method
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get('/payment-methods/{user_id}')
async def get_payment_methods(user_id: str):
    """Get all payment methods for a user"""
    try:
        payment_methods = db.storage.json.get('payment_methods', default={})
        return payment_methods.get(user_id, [])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post('/subscriptions/{user_id}/update')
async def update_subscription(user_id: str, update: SubscriptionUpdate):
    """Update a user's subscription using Stripe for payment processing"""
    """Update a user's subscription"""
    try:
        # Get current subscription
        subscriptions = db.storage.json.get('user_subscriptions', default={})
        current_subscription = subscriptions.get(user_id)
        
        if not current_subscription:
            raise HTTPException(status_code=404, detail='Subscription not found')
            
        # Get plan details
        new_plan = SUBSCRIPTION_PLANS[update.new_tier]
        price = new_plan.price_annual if update.is_annual else new_plan.price_monthly
        period_months = 12 if update.is_annual else 1
        
        # Create Stripe payment intent
        try:
            payment_intent = stripe.PaymentIntent.create(
                amount=int(price * 100),  # Convert to cents
                currency='usd',
                customer=user_id,  # Assuming user_id is the Stripe customer ID
                payment_method=update.payment_method_id,
                confirm=True,
                description=f'{new_plan.name} Subscription - {"Annual" if update.is_annual else "Monthly"}'
            )
            
            if payment_intent.status != 'succeeded':
                raise HTTPException(
                    status_code=400,
                    detail='Payment failed. Please try again.'
                )
                
            # Create internal transaction record
            period_start = datetime.now()
            period_end = period_start + timedelta(days=30*period_months)
            
            transaction = create_payment_transaction(
                user_id=user_id,
                amount=price,
                payment_method_id=update.payment_method_id,
                description=f'{new_plan.name} Subscription - {"Annual" if update.is_annual else "Monthly"}',
                period_start=period_start,
                period_end=period_end
            )
            
            # Update transaction status based on Stripe payment
            transactions = db.storage.json.get('payment_transactions', default={})
            transaction_dict = transactions[transaction.id]
            transaction_dict['status'] = 'completed'
            transaction_dict['stripe_payment_intent_id'] = payment_intent.id
            transactions[transaction.id] = transaction_dict
            db.storage.json.put('payment_transactions', transactions)
            
        except stripe.error.CardError as e:
            # Handle failed payment
            raise HTTPException(
                status_code=400,
                detail=f'Payment failed: {str(e)}'
            ) from e
        except stripe.error.StripeError as e:
            raise HTTPException(
                status_code=500,
                detail=f'Payment processing error: {str(e)}'
            ) from e
        
        # Create invoice
        items = [{
            'description': f'{new_plan.name} Subscription',
            'period': f'{period_start.date()} to {period_end.date()}',
            'amount': price
        }]
        invoice = create_invoice(transaction, items)
        
        # Update subscription
        subscription = UserSubscription(
            user_id=user_id,
            tier=update.new_tier,
            start_date=period_start.isoformat(),
            end_date=period_end.isoformat(),
            is_trial=False,
            auto_renew=True,
            payment_status='active',
            last_payment_date=period_start.isoformat(),
            next_payment_date=period_end.isoformat()
        )
        
        subscriptions[user_id] = subscription.dict()
        db.storage.json.put('user_subscriptions', subscriptions)
        
        return {
            'subscription': subscription,
            'transaction': transaction,
            'invoice': invoice
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get('/transactions/{user_id}')
async def get_transactions(user_id: str):
    """Get payment transaction history for a user"""
    try:
        transactions = db.storage.json.get('payment_transactions', default={})
        user_transactions = [
            trans for trans in transactions.values()
            if trans['user_id'] == user_id
        ]
        return sorted(user_transactions, key=lambda x: x['created_at'], reverse=True)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get('/invoices/{user_id}')
async def get_invoices(user_id: str):
    """Get invoice history for a user"""
    try:
        invoices = db.storage.json.get('invoices', default={})
        user_invoices = [
            inv for inv in invoices.values()
            if inv['user_id'] == user_id
        ]
        return sorted(user_invoices, key=lambda x: x['created_at'], reverse=True)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class CreateTrialCodeRequest(BaseModel):
    """Request to create a trial code"""
    trial_period: float  # Trial period in months
    tier: SubscriptionTier
    expiry_date: str  # ISO format date string
    max_uses: int
    code: Optional[str] = None  # Optional custom code
    
    model_config = {"arbitrary_types_allowed": True}

@router.post('/admin/trial-codes')
async def create_trial_code(request: CreateTrialCodeRequest):
    """Create a new trial code (admin only)"""
    try:
        trial_codes = db.storage.json.get('trial_codes', default={})
        
        # Generate a unique code if not provided
        code = request.code or str(uuid4())[:8].upper()
        
        # Check if code already exists
        if code in trial_codes:
            raise HTTPException(
                status_code=400,
                detail='Trial code already exists'
            )
        
        # Create trial code
        trial_code = TrialCode(
            code=code,
            trial_period=request.trial_period,
            tier=request.tier,
            expiry_date=request.expiry_date,
            max_uses=request.max_uses
        )
        
        # Save trial code
        trial_codes[code] = trial_code.model_dump()
        db.storage.json.put('trial_codes', trial_codes)
        
        return trial_code
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f'Error creating trial code: {str(e)}'
        ) from e

@router.get('/admin/trial-codes')
async def list_trial_codes():
    """List all trial codes (admin only)"""
    try:
        trial_codes = db.storage.json.get('trial_codes', default={})
        return list(trial_codes.values())
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f'Error listing trial codes: {str(e)}'
        ) from e

@router.put('/admin/trial-codes/{code}/deactivate')
async def deactivate_trial_code(code: str):
    """Deactivate a trial code (admin only)"""
    try:
        trial_codes = db.storage.json.get('trial_codes', default={})
        
        if code not in trial_codes:
            raise HTTPException(
                status_code=404,
                detail='Trial code not found'
            )
        
        trial_codes[code]['is_active'] = False
        db.storage.json.put('trial_codes', trial_codes)
        
        return {'status': 'success', 'message': 'Trial code deactivated'}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f'Error deactivating trial code: {str(e)}'
        ) from e

@router.get('/check-feature-access/{user_id}/{feature_name}')
async def get_feature_access(user_id: str, feature_name: str):
    """Check if a user has access to a specific feature"""
    access_level = check_feature_access(user_id, feature_name)
    return {
        'feature': feature_name,
        'access_level': access_level,
        'has_access': access_level != FeatureAccess.NONE
    }
