from fastapi import APIRouter

router = APIRouter()
# from typing import Optional, List, Dict
# from fastapi import APIRouter, HTTPException, Response, Depends, Request
# from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
# from pydantic import BaseModel, Field, constr, conint
# import stripe
# import databutton as db
# import json
# try:
#     from models import Transaction, Invoice, TransactionItem, AuditLog
#     print('[INFO] Successfully imported models in payment.py')
# except ImportError as e:
#     print(f'[ERROR] Failed to import models in payment.py: {str(e)}')
#     print('[ERROR] This might be due to incorrect Python path or missing models.py')
#     raise ImportError(f'Failed to import required models: {str(e)}') from e
# except Exception as e:
#     print(f'[ERROR] Unexpected error importing models in payment.py: {str(e)}')
#     import traceback
#     print(f'[ERROR] Traceback: {traceback.format_exc()}')
#     raise
# from datetime import datetime, timedelta
# from fpdf import FPDF
# from cryptography.fernet import Fernet
# from time import time
# from collections import defaultdict

# # Security setup
# security = HTTPBearer()

# # Initialize encryption key
# ENCRYPTION_KEY = db.secrets.get("ENCRYPTION_KEY")
# if not ENCRYPTION_KEY:
#     ENCRYPTION_KEY = Fernet.generate_key()
#     db.secrets.put("ENCRYPTION_KEY", ENCRYPTION_KEY)
# fernet = Fernet(ENCRYPTION_KEY)

# # Rate limiting setup
# REQUEST_LIMIT = 100  # requests
# TIME_WINDOW = 3600   # seconds (1 hour)
# request_history = defaultdict(list)

# def rate_limit(request: Request):
#     """Rate limiting middleware"""
#     now = time()
#     client_ip = request.client.host
    
#     # Clean old requests
#     request_history[client_ip] = [t for t in request_history[client_ip] if now - t < TIME_WINDOW]
    
#     # Check rate limit
#     if len(request_history[client_ip]) >= REQUEST_LIMIT:
#         raise HTTPException(status_code=429, detail="Too many requests")
    
#     # Add current request
#     request_history[client_ip].append(now)
#     return True

# def get_risk_score(amount: int, customer_id: Optional[str], payment_method_id: Optional[str], ip_address: Optional[str] = None, device_fingerprint: Optional[str] = None, location: Optional[str] = None) -> float:
#     """Calculate risk score for a transaction with enhanced fraud detection
    
#     Returns a score between 0 and 1, where:
#     - 0-0.3: Low risk
#     - 0.3-0.6: Medium risk
#     - 0.6-1.0: High risk
#     """
#     # Calculate risk score based on various risk factors
#     score = 0.0
    
#     # Load transaction history
#     transactions = db.storage.json.get("payment_transactions", default={})
    
#     # Check for velocity (multiple transactions in short time)
#     if customer_id:
#         recent_transactions = []
#         for txns in transactions.values():
#             for txn in txns:
#                 if txn.get('customer_id') == customer_id:
#                     txn_date = datetime.fromisoformat(txn['created_at'])
#                     if datetime.now() - txn_date <= timedelta(hours=24):
#                         recent_transactions.append(txn)
        
#         if len(recent_transactions) > 5:  # More than 5 transactions in 24 hours
#             score += 0.3
    
#     # Check for unusual amount patterns
#     if customer_id:
#         customer_transactions = []
#         for txns in transactions.values():
#             for txn in txns:
#                 if txn.get('customer_id') == customer_id:
#                     customer_transactions.append(txn['amount'])
        
#         if customer_transactions:
#             avg_amount = sum(customer_transactions) / len(customer_transactions)
#             if amount > avg_amount * 3:  # Transaction amount > 3x average
#                 score += 0.2
    
    
#     # Device fingerprinting check
#     if device_fingerprint:
#         device_transactions = []
#         for txns in transactions.values():
#             for txn in txns:
#                 if txn.get('device_fingerprint') == device_fingerprint:
#                     txn_date = datetime.fromisoformat(txn['created_at'])
#                     if datetime.now() - txn_date <= timedelta(hours=24):
#                         device_transactions.append(txn)
        
#         if len(device_transactions) > 5:  # More than 5 transactions from same device in 24h
#             score += 0.3
    
#     # Location-based risk assessment
#     if location:
#         location_transactions = []
#         for txns in transactions.values():
#             for txn in txns:
#                 if txn.get('location') == location:
#                     txn_date = datetime.fromisoformat(txn['created_at'])
#                     if datetime.now() - txn_date <= timedelta(minutes=30):
#                         location_transactions.append(txn)
        
#         if len(location_transactions) > 3:  # More than 3 transactions from same location in 30min
#             score += 0.2
    
#     # Payment method velocity check
#     if payment_method_id:
#         method_transactions = []
#         for txns in transactions.values():
#             for txn in txns:
#                 if txn.get('payment_method_id') == payment_method_id:
#                     txn_date = datetime.fromisoformat(txn['created_at'])
#                     if datetime.now() - txn_date <= timedelta(hours=24):
#                         method_transactions.append(txn)
        
#         if len(method_transactions) > 10:  # More than 10 transactions with same payment method in 24h
#             score += 0.4
    
#     # IP-based fraud detection
#     if ip_address:
#         ip_transactions = []
#         for txns in transactions.values():
#             for txn in txns:
#                 if txn.get('ip_address') == ip_address:
#                     txn_date = datetime.fromisoformat(txn['created_at'])
#                     if datetime.now() - txn_date <= timedelta(hours=1):
#                         ip_transactions.append(txn)
        
#         if len(ip_transactions) > 10:  # More than 10 transactions from same IP in 1 hour
#             score += 0.4
    
#     # High amount transactions are riskier
#     if amount > 1000000:  # $10,000
#         score += 0.3
#     elif amount > 500000:  # $5,000
#         score += 0.2
    
#     # New customers are riskier
#     if not customer_id:
#         score += 0.2
    
#     # New payment methods are riskier
#     if not payment_method_id:
#         score += 0.1
    
#     return score

# def encrypt_sensitive_data(data: dict) -> dict:
#     """Encrypt sensitive fields in data"""
#     sensitive_fields = ["card_number", "cvv", "account_number"]
#     for field in sensitive_fields:
#         if field in data:
#             data[field] = fernet.encrypt(str(data[field]).encode()).decode()
#     return data

# def mask_sensitive_data(data: dict) -> dict:
#     """Mask sensitive fields in data for display"""
#     if "card_number" in data:
#         data["card_number"] = f"****{data['card_number'][-4:]}" if data["card_number"] else None
#     return data

# # Initialize Stripe with the secret key
# stripe.api_key = db.secrets.get("STRIPE_SECRET_KEY")

# router = APIRouter()

# class CreateCustomerRequest(BaseModel):
#     email: str = Field(..., pattern=r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
#     name: str = Field(..., min_length=1, max_length=100)

# class CreatePaymentIntentRequest(BaseModel):
#     amount: int  # Amount in cents
#     currency: str = "usd"
#     payment_method_id: Optional[str] = None
#     customer_id: Optional[str] = None

# class SetupIntentRequest(BaseModel):
#     customer_id: Optional[str] = None
#     payment_method_types: list[str] = ["card"]

# @router.post("/create-customer")
# async def create_customer(
#     request: CreateCustomerRequest,
#     credentials: HTTPAuthorizationCredentials = Depends(security),
#     _: bool = Depends(rate_limit)
# ):
#     """Create a new Stripe customer"""
#     try:
#         customer = stripe.Customer.create(
#             email=request.email,
#             name=request.name,
#             metadata={"created_at": datetime.now().isoformat()}
#         )
#         return {"customer_id": customer.id}
#     except stripe.error.CardError as err:
#         # Handle card errors (e.g., insufficient funds)
#         log_audit_event(
#             "payment_card_error",
#             request.customer_id or "unknown",
#             {"error": str(err), "code": err.code},
#             "error"
#         )
#         raise HTTPException(status_code=400, detail="Card payment failed") from err
#     except stripe.error.InvalidRequestError as err:
#         # Handle invalid parameters
#         log_audit_event(
#             "payment_invalid_request",
#             request.customer_id or "unknown",
#             {"error": str(err)},
#             "error"
#         )
#         raise HTTPException(status_code=400, detail="Invalid payment request") from err
#     except stripe.error.AuthenticationError as err:
#         # Handle authentication errors
#         log_audit_event(
#             "payment_auth_error",
#             request.customer_id or "unknown",
#             {"error": str(err)},
#             "error"
#         )
#         raise HTTPException(status_code=401, detail="Payment authentication failed") from err
#     except stripe.error.APIConnectionError as err:
#         # Handle API connection errors
#         log_audit_event(
#             "payment_connection_error",
#             request.customer_id or "unknown",
#             {"error": str(err)},
#             "error"
#         )
#         raise HTTPException(status_code=503, detail="Payment service unavailable") from err
#     except stripe.error.StripeError as err:
#         # Handle all other Stripe errors
#         log_audit_event(
#             "payment_stripe_error",
#             request.customer_id or "unknown",
#             {"error": str(err)},
#             "error"
#         )
#         raise HTTPException(status_code=400, detail="Payment processing failed") from err
#     except Exception as err:
#         # Handle unexpected errors
#         log_audit_event(
#             "payment_unexpected_error",
#             request.customer_id or "unknown",
#             {"error": str(err)},
#             "error"
#         )
#         raise HTTPException(status_code=500, detail="An unexpected error occurred") from err

# # Transaction limits per user per day
# DAILY_TRANSACTION_LIMIT = 50000000  # $500 in cents

# @router.post("/create-payment-intent")
# async def create_payment_intent(
#     request: CreatePaymentIntentRequest,
#     credentials: HTTPAuthorizationCredentials = Depends(security),
#     _: bool = Depends(rate_limit)
# ):
#     """Create a PaymentIntent for processing a payment"""
#     try:
#         intent_data = {
#             "amount": request.amount,
#             "currency": request.currency,
#             "automatic_payment_methods": {"enabled": True}
#         }

#         if request.customer_id:
#             # Check daily transaction limit
#             transactions = db.storage.json.get("payment_transactions", default={})
#             user_transactions = transactions.get(request.customer_id, [])
#             today = datetime.now().date()
#             daily_total = sum(
#                 txn["amount"] 
#                 for txn in user_transactions 
#                 if datetime.fromisoformat(txn["created_at"]).date() == today
#             )
            
#             if daily_total + request.amount > DAILY_TRANSACTION_LIMIT:
#                 raise HTTPException(
#                     status_code=400, 
#                     detail="Daily transaction limit exceeded"
#                 )
                
#             intent_data["customer"] = request.customer_id

#         if request.payment_method_id:
#             intent_data["payment_method"] = request.payment_method_id
#             intent_data["confirm"] = True

#         # Calculate risk score
#         risk_score = get_risk_score(request.amount, request.customer_id, request.payment_method_id)
        
#         # Add risk score to metadata
#         intent_data["metadata"] = {
#             "risk_score": str(risk_score),
#             "ip_address": request.client.host if hasattr(request, 'client') else None
#         }
        
#         # High-risk transactions require additional verification
#         if risk_score > 0.6:
#             intent_data["capture_method"] = "manual"
#             # Add additional verification requirements
#             intent_data["metadata"]["requires_verification"] = "true"
#             intent_data["metadata"]["verification_type"] = "identity_document"
#         elif risk_score > 0.3:
#             # Medium risk transactions get flagged for review
#             intent_data["metadata"]["requires_review"] = "true"
        
#         payment_intent = stripe.PaymentIntent.create(**intent_data)
        
#         return {
#             "client_secret": payment_intent.client_secret,
#             "payment_intent_id": payment_intent.id
#         }
#     except stripe.error.StripeError as e:
#         raise HTTPException(status_code=400, detail=str(e))

# @router.post("/create-setup-intent")
# async def create_setup_intent(request: SetupIntentRequest):
#     """Create a SetupIntent for saving a payment method"""
#     try:
#         setup_intent = stripe.SetupIntent.create(
#             customer=request.customer_id,
#             payment_method_types=request.payment_method_types
#         )
#         return {"client_secret": setup_intent.client_secret}
#     except stripe.error.StripeError as e:
#         raise HTTPException(status_code=400, detail=str(e))

# @router.post("/attach-payment-method")
# async def attach_payment_method(payment_method_id: str, customer_id: str):
#     """Attach a payment method to a customer"""
#     try:
#         payment_method = stripe.PaymentMethod.attach(
#             payment_method_id,
#             customer=customer_id
#         )
#         return {"payment_method": payment_method}
#     except stripe.error.StripeError as e:
#         raise HTTPException(status_code=400, detail=str(e))

# @router.get("/payment-methods/{customer_id}")
# async def list_payment_methods(customer_id: str):
#     """List all payment methods for a customer"""
#     try:
#         payment_methods = stripe.PaymentMethod.list(
#             customer=customer_id,
#             type="card"
#         )
#         return {"payment_methods": payment_methods.data}
#     except stripe.error.StripeError as e:
#         raise HTTPException(status_code=400, detail=str(e))

# @router.delete("/payment-methods/{payment_method_id}")
# async def detach_payment_method(payment_method_id: str):
#     """Detach a payment method from a customer"""
#     try:
#         payment_method = stripe.PaymentMethod.detach(payment_method_id)
#         return {"payment_method": payment_method}
#     except stripe.error.StripeError as e:
#         raise HTTPException(status_code=400, detail=str(e))

# @router.get("/transactions/{user_id}")
# async def get_transactions(user_id: str):
#     """Get payment transaction history for a user"""
#     try:
#         # Get transactions from storage
#         transactions = db.storage.json.get("payment_transactions", default={})
#         user_transactions = transactions.get(user_id, [])
        
#         # Sort by created_at in descending order
#         user_transactions.sort(key=lambda x: x["created_at"], reverse=True)
        
#         return user_transactions
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

# @router.get("/invoices/{user_id}")
# async def get_invoices(user_id: str):
#     """Get invoice history for a user"""
#     try:
#         # Get invoices from storage
#         invoices = db.storage.json.get("invoices", default={})
#         user_invoices = invoices.get(user_id, [])
        
#         # Sort by created_at in descending order
#         user_invoices.sort(key=lambda x: x["created_at"], reverse=True)
        
#         return user_invoices
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

# @router.post("/export-receipt/{transaction_id}")
# async def export_receipt(transaction_id: str, format: str = "pdf"):
#     """Export a receipt for a specific transaction"""
#     try:
#         # Get all transactions
#         transactions = db.storage.json.get("payment_transactions", default={})
        
#         # Find the specific transaction
#         transaction = None
#         for user_transactions in transactions.values():
#             for t in user_transactions:
#                 if t["id"] == transaction_id:
#                     transaction = t
#                     break
#             if transaction:
#                 break
        
#         if not transaction:
#             raise HTTPException(status_code=404, detail="Transaction not found")
        
#         if format == "pdf":
#             # Create PDF receipt
#             pdf = FPDF()
#             pdf.add_page()
            
#             # Add receipt content
#             pdf.set_font("Arial", "B", 16)
#             pdf.cell(0, 10, "Receipt", ln=True, align="C")
            
#             pdf.set_font("Arial", size=12)
#             pdf.cell(0, 10, f"Transaction ID: {transaction['id']}", ln=True)
#             pdf.cell(0, 10, f"Date: {transaction['created_at']}", ln=True)
#             pdf.cell(0, 10, f"Amount: {transaction['currency'].upper()} {transaction['amount']/100:.2f}", ln=True)
#             pdf.cell(0, 10, f"Status: {transaction['status']}", ln=True)
            
#             # Return PDF
#             return Response(
#                 content=pdf.output(dest="S").encode("latin1"),
#                 media_type="application/pdf",
#                 headers={"Content-Disposition": f"attachment; filename=receipt_{transaction_id}.pdf"}
#             )
#         else:
#             # Return JSON format
#             return transaction
            
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

# import psutil

# def log_audit_event(event_type: str, user_id: str, details: dict, severity: str = "info", metadata: Optional[Dict[str, str]] = None):
#     """Log audit events for security tracking with enhanced details"""
#     try:
#         audit_logs = db.storage.json.get("payment_audit_logs", default=[])
#         # Add system health metrics
#         system_metrics = {
#             "memory_usage": psutil.Process().memory_info().rss / 1024 / 1024,  # MB
#             "cpu_percent": psutil.Process().cpu_percent(),
#             "timestamp": datetime.now().isoformat()
#         }
        
#         # Create structured log entry
#         log_entry = AuditLog(
#             timestamp=datetime.now().isoformat(),
#             event_type=event_type,
#             user_id=user_id,
#             details={
#                 **system_metrics,
#                 **(metadata or {}),
#                 "transaction_metadata": {
#                     "payment_processor": "stripe",
#                     "api_version": stripe.api_version,
#                     "environment": "production" if not stripe.api_key.startswith("sk_test_") else "test"
#                 },
#                 **details,
#                 "severity": severity,
#                 "source_ip": details.get("ip_address", "unknown"),
#                 "user_agent": details.get("user_agent", "unknown"),
#                 "session_id": details.get("session_id", "unknown")
#             }
#         ).dict()
#         db.storage.json.put("payment_audit_logs", audit_logs)
#     except Exception as e:
#         print(f"Error logging audit event: {str(e)}")

# @router.post("/webhook")
# async def handle_webhook(
#     request: Request,
#     payload: dict,
#     stripe_signature: str,
#     rate_limited: bool = Depends(rate_limit)
# ):
#     """Handle Stripe webhooks"""
#     try:
#         webhook_secret = db.secrets.get("STRIPE_WEBHOOK_SECRET")
#         if not webhook_secret:
#             raise HTTPException(status_code=500, detail="Webhook secret not configured")
        
#         event = stripe.Webhook.construct_event(
#             payload,
#             stripe_signature,
#             webhook_secret
#         )
        
#         # Handle specific event types
#         if event.type == "payment_intent.succeeded":
#             payment_intent = event.data.object
#             # Create transaction record
#             transaction = Transaction(
#                 id=payment_intent.id,
#                 user_id=payment_intent.metadata.get("user_id"),
#                 amount=payment_intent.amount,
#                 currency=payment_intent.currency,
#                 status="completed",
#                 description=payment_intent.description or "Payment",
#                 created_at=datetime.fromtimestamp(payment_intent.created).isoformat(),
#                 items=[TransactionItem(description=payment_intent.description or "Payment", amount=payment_intent.amount)],
#                 payment_method_id=payment_intent.payment_method
#             )
            
#             # Store transaction
#             transactions = db.storage.json.get("payment_transactions", default={})
#             if transaction.user_id not in transactions:
#                 transactions[transaction.user_id] = []
#             # Encrypt and mask sensitive data before storing
#             transaction_data = transaction.dict()
#             transaction_data = encrypt_sensitive_data(transaction_data)
#             transaction_data = mask_sensitive_data(transaction_data)
#             transactions[transaction.user_id].append(transaction_data)
#             db.storage.json.put("payment_transactions", transactions)
            
#             log_audit_event(
#                 "payment_success",
#                 payment_intent.metadata.get("user_id", "unknown"),
#                 {
#                     "payment_intent_id": payment_intent.id,
#                     "amount": payment_intent.amount,
#                     "risk_score": payment_intent.metadata.get("risk_score", "unknown"),
#                     "ip_address": payment_intent.metadata.get("ip_address", "unknown")
#                 },
#                 "info"
#             )
            
#         elif event.type == "payment_intent.payment_failed":
#             payment_intent = event.data.object
#             # Create failed transaction record
#             transaction = Transaction(
#                 id=payment_intent.id,
#                 user_id=payment_intent.metadata.get("user_id"),
#                 amount=payment_intent.amount,
#                 currency=payment_intent.currency,
#                 status="failed",
#                 description=payment_intent.description or "Failed payment",
#                 created_at=datetime.fromtimestamp(payment_intent.created).isoformat(),
#                 items=[TransactionItem(description=payment_intent.description or "Failed payment", amount=payment_intent.amount)],
#                 payment_method_id=payment_intent.payment_method
#             )
            
#             # Store failed transaction
#             transactions = db.storage.json.get("payment_transactions", default={})
#             if transaction.user_id not in transactions:
#                 transactions[transaction.user_id] = []
#             transactions[transaction.user_id].append(transaction.dict())
#             db.storage.json.put("payment_transactions", transactions)
            
#             log_audit_event(
#                 "payment_failed",
#                 payment_intent.metadata.get("user_id", "unknown"),
#                 {
#                     "payment_intent_id": payment_intent.id,
#                     "amount": payment_intent.amount,
#                     "error": payment_intent.last_payment_error.message if payment_intent.last_payment_error else "Unknown error",
#                     "risk_score": payment_intent.metadata.get("risk_score", "unknown"),
#                     "ip_address": payment_intent.metadata.get("ip_address", "unknown")
#                 },
#                 "error"
#             )
            
#         return {"status": "success"}
#     except stripe.error.StripeError as e:
#         raise HTTPException(status_code=400, detail=str(e))
