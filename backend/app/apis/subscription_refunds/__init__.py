from typing import List, Optional
from fastapi import APIRouter, HTTPException
from datetime import datetime, timezone
import databutton as db
from app.apis.models import RefundRequest, RefundResponse, CancellationRequest, CancellationResponse

router = APIRouter()

def calculate_prorated_refund(subscription_data: dict) -> float:
    """Calculate the prorated refund amount based on unused subscription time"""
    # Get the end date of the subscription period
    end_date = datetime.fromisoformat(subscription_data['end_date'])
    current_date = datetime.now(timezone.utc)
    
    # Calculate total days in subscription period
    start_date = datetime.fromisoformat(subscription_data['start_date'])
    total_days = (end_date - start_date).days
    
    # Calculate unused days
    unused_days = (end_date - current_date).days
    
    # Calculate prorated refund
    if total_days <= 0 or unused_days <= 0:
        return 0.0
    
    original_amount = subscription_data['amount']
    prorated_refund = (unused_days / total_days) * original_amount
    
    return round(prorated_refund, 2)

@router.post("/request-refund", response_model=RefundResponse)
def request_refund(request: RefundRequest) -> RefundResponse:
    """Request a refund for a subscription payment"""
    try:
        # Load existing refunds
        refunds = db.storage.json.get("refunds", default={})
        
        # Generate a unique refund ID
        refund_id = f"ref_{datetime.now().strftime('%Y%m%d%H%M%S')}_{request.user_id}"
        
        # Create refund record
        refund_record = {
            "refund_id": refund_id,
            "subscription_id": request.subscription_id,
            "user_id": request.user_id,
            "amount": request.amount,
            "reason": request.reason,
            "request_date": request.request_date,
            "status": "pending",
            "processing_date": None,
            "notes": None
        }
        
        # Store the refund request
        refunds[refund_id] = refund_record
        db.storage.json.put("refunds", refunds)
        
        return RefundResponse(
            refund_id=refund_id,
            status="pending",
            amount=request.amount
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing refund request: {str(e)}") from e

@router.post("/cancel-subscription", response_model=CancellationResponse)
def cancel_subscription(request: CancellationRequest) -> CancellationResponse:
    """Cancel a subscription with optional immediate cancellation"""
    try:
        # Load subscriptions
        subscriptions = db.storage.json.get("user_subscriptions", default={})
        subscription = subscriptions.get(request.subscription_id)
        
        if not subscription:
            raise HTTPException(status_code=404, detail="Subscription not found")
        
        # Generate cancellation ID
        cancellation_id = f"can_{datetime.now().strftime('%Y%m%d%H%M%S')}_{request.user_id}"
        
        # Calculate effective date and prorated refund
        current_date = datetime.now(timezone.utc)
        if request.immediate:
            effective_date = current_date.isoformat()
            prorated_refund = calculate_prorated_refund(subscription)
        else:
            effective_date = subscription['end_date']
            prorated_refund = 0.0
        
        # Update subscription status
        subscription['status'] = 'cancelled'
        subscription['cancellation_date'] = current_date.isoformat()
        subscription['cancellation_reason'] = request.reason
        subscriptions[request.subscription_id] = subscription
        
        # Store updated subscription data
        db.storage.json.put("user_subscriptions", subscriptions)
        
        # Create cancellation record
        cancellations = db.storage.json.get("cancellations", default={})
        cancellation_record = {
            "cancellation_id": cancellation_id,
            "subscription_id": request.subscription_id,
            "user_id": request.user_id,
            "reason": request.reason,
            "request_date": current_date.isoformat(),
            "effective_date": effective_date,
            "immediate": request.immediate,
            "prorated_refund": prorated_refund,
            "status": "processed"
        }
        
        cancellations[cancellation_id] = cancellation_record
        db.storage.json.put("cancellations", cancellations)
        
        # If there's a prorated refund, create a refund request
        if prorated_refund > 0:
            refund_request = RefundRequest(
                subscription_id=request.subscription_id,
                user_id=request.user_id,
                amount=prorated_refund,
                reason=f"Prorated refund for immediate cancellation of subscription {request.subscription_id}",
                request_date=current_date.isoformat()
            )
            request_refund(refund_request)
        
        return CancellationResponse(
            cancellation_id=cancellation_id,
            status="processed",
            effective_date=effective_date,
            prorated_refund=prorated_refund,
            notes="Refund request created" if prorated_refund > 0 else None
        )
        
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Error processing cancellation request: {str(e)}") from e

@router.get("/refund-status/{refund_id}", response_model=RefundResponse)
def get_refund_status(refund_id: str) -> RefundResponse:
    """Get the status of a refund request"""
    try:
        refunds = db.storage.json.get("refunds", default={})
        refund = refunds.get(refund_id)
        
        if not refund:
            raise HTTPException(status_code=404, detail="Refund request not found")
        
        return RefundResponse(
            refund_id=refund['refund_id'],
            status=refund['status'],
            amount=refund['amount'],
            processing_date=refund['processing_date'],
            notes=refund['notes']
        )
        
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Error getting refund status: {str(e)}") from e

@router.get("/cancellation-status/{cancellation_id}", response_model=CancellationResponse)
def get_cancellation_status(cancellation_id: str) -> CancellationResponse:
    """Get the status of a cancellation request"""
    try:
        cancellations = db.storage.json.get("cancellations", default={})
        cancellation = cancellations.get(cancellation_id)
        
        if not cancellation:
            raise HTTPException(status_code=404, detail="Cancellation request not found")
        
        return CancellationResponse(
            cancellation_id=cancellation['cancellation_id'],
            status=cancellation['status'],
            effective_date=cancellation['effective_date'],
            prorated_refund=cancellation.get('prorated_refund'),
            notes=cancellation.get('notes')
        )
        
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Error getting cancellation status: {str(e)}") from e