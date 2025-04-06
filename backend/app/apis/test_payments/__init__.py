from datetime import datetime
from typing import Optional, Dict, List, Tuple
from enum import Enum
from pydantic import BaseModel, Field
from fastapi import APIRouter, HTTPException
import databutton as db

router = APIRouter()

class PaymentStatus(str, Enum):
    PENDING = "pending"
    SUCCEEDED = "succeeded"
    FAILED = "failed"

class PaymentMethod(str, Enum):
    CARD = "card"
    BANK_TRANSFER = "bank_transfer"

class TestCard(BaseModel):
    number: str = "4242424242424242"  # Test card number
    exp_month: int = 12
    exp_year: int = 2024
    cvc: str = "123"

class CreateTestPaymentRequest(BaseModel):
    amount: float
    currency: str = "usd"
    payment_method: PaymentMethod
    description: Optional[str] = None
    metadata: Optional[Dict] = None
    # For card payments
    card: Optional[TestCard] = None
    # For bank transfers
    bank_account: Optional[Dict] = None

class TestPaymentResponse(BaseModel):
    payment_id: str
    amount: float
    currency: str
    status: PaymentStatus
    created_at: datetime
    payment_method: PaymentMethod
    description: Optional[str] = None
    metadata: Optional[Dict] = None
    error: Optional[str] = None

def get_test_payments() -> Dict[str, dict]:
    """Get all test payments from storage"""
    return db.storage.json.get('test_payments', default={})

def save_test_payments(payments: Dict[str, dict]) -> None:
    """Save test payments to storage"""
    # Convert datetime to ISO format for storage
    serializable_payments = {}
    for payment_id, payment in payments.items():
        payment_dict = payment.copy()
        if isinstance(payment_dict['created_at'], datetime):
            payment_dict['created_at'] = payment_dict['created_at'].isoformat()
        serializable_payments[payment_id] = payment_dict
    db.storage.json.put('test_payments', serializable_payments)

def validate_test_card(card: TestCard) -> None:
    """Validate test card details"""
    valid_test_cards = {
        "4242424242424242": "Always succeeds",
        "4000000000000002": "Always declined",
        "4000000000009995": "Insufficient funds decline",
        "4000000000000127": "Stolen card decline",
        "4000000000000069": "Expired card decline",
        "4000000000000119": "Processing error decline",
    }
    
    if card.number not in valid_test_cards:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid test card number. Must be one of: {list(valid_test_cards.keys())}"
        )

def simulate_card_payment(card: TestCard, amount: float) -> Tuple[bool, Optional[str]]:
    """Simulate card payment with different test cards and amounts"""
    # First check card behavior
    card_behaviors = {
        "4242424242424242": (True, None),
        "4000000000000002": (False, "Card declined"),
        "4000000000009995": (False, "Insufficient funds"),
        "4000000000000127": (False, "Stolen card"),
        "4000000000000069": (False, "Expired card"),
        "4000000000000119": (False, "Processing error"),
    }
    
    success, error = card_behaviors.get(card.number, (False, "Invalid card number"))
    
    # Then check amount-specific rules
    if success:
        if amount > 99999.99:  # Arbitrary limit for test payments
            return False, "Amount exceeds maximum allowed"
        if amount < 0.50:  # Minimum amount
            return False, "Amount below minimum allowed"
    
    return success, error

@router.post("/test-payments/create", response_model=TestPaymentResponse)
def create_test_payment(request: CreateTestPaymentRequest):
    """Create a test payment
    
    This endpoint simulates payment processing with different test cards and scenarios.
    Use specific test card numbers to trigger different payment outcomes.
    """
    try:
        # Validate amount
        if request.amount <= 0:
            raise HTTPException(
                status_code=400,
                detail="Amount must be greater than 0"
            )
        
        # Validate currency
        request.currency = request.currency.lower()
        if request.currency not in {"usd", "eur", "gbp"}:
            raise HTTPException(
                status_code=400,
                detail="Currency must be one of: usd, eur, gbp"
            )
        
        # Process based on payment method
        success = True
        error = None
        
        if request.payment_method == PaymentMethod.CARD:
            if not request.card:
                raise HTTPException(
                    status_code=400,
                    detail="Card details required for card payment"
                )
            validate_test_card(request.card)
            success, error = simulate_card_payment(request.card, request.amount)
        
        elif request.payment_method == PaymentMethod.BANK_TRANSFER:
            if not request.bank_account:
                raise HTTPException(
                    status_code=400,
                    detail="Bank account details required for bank transfer"
                )
                        # Validate bank account
            if not request.bank_account.get('account_number'):
                raise HTTPException(
                    status_code=400,
                    detail="Bank account number is required"
                )
            
            # Simulate different bank transfer scenarios
            account_number = request.bank_account['account_number']
            if account_number == "000000000":
                success, error = False, "Invalid account number"
            elif account_number == "111111111":
                success, error = False, "Insufficient funds"
            elif account_number == "222222222":
                success, error = False, "Account closed"
            else:
                success, error = True, None
        
        # Create payment record
        payment = TestPaymentResponse(
            payment_id=f"test_payment_{int(datetime.utcnow().timestamp())}",
            amount=request.amount,
            currency=request.currency,
            status=PaymentStatus.SUCCEEDED if success else PaymentStatus.FAILED,
            created_at=datetime.utcnow(),
            payment_method=request.payment_method,
            description=request.description,
            metadata=request.metadata,
            error=error
        )
        
        # Store payment
        payments = get_test_payments()
        payment_dict = {
            'payment_id': payment.payment_id,
            'amount': payment.amount,
            'currency': payment.currency,
            'status': payment.status,
            'created_at': payment.created_at,
            'payment_method': payment.payment_method,
            'description': payment.description,
            'metadata': payment.metadata,
            'error': payment.error
        }
        payments[payment.payment_id] = payment_dict
        save_test_payments(payments)
        
        return payment
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Failed to create test payment: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e)) from e

@router.get("/test-payments/{payment_id}", response_model=TestPaymentResponse)
def get_test_payment(payment_id: str):
    """Get a specific test payment"""
    try:
        payments = get_test_payments()
        if payment_id not in payments:
            raise HTTPException(status_code=404, detail="Payment not found")
        
        payment = payments[payment_id]
        return TestPaymentResponse(
            **{**payment, 'created_at': datetime.fromisoformat(payment['created_at'])}
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Failed to get test payment: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e)) from e

@router.get("/test-payments", response_model=List[TestPaymentResponse])
def list_test_payments():
    """List all test payments"""
    try:
        payments = get_test_payments()
        # Convert stored dict back to TestPaymentResponse
        return [
            TestPaymentResponse(
                **{**payment, 'created_at': datetime.fromisoformat(payment['created_at'])}
            )
            for payment in payments.values()
        ]
        
    except Exception as e:
        print(f"[ERROR] Failed to list test payments: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e)) from e