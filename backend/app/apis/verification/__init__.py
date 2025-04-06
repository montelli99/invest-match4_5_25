from typing import List, Optional, Dict, Any
from datetime import datetime
from fastapi import APIRouter, HTTPException, Body, File, UploadFile, Form
from pydantic import BaseModel, Field
import databutton as db
import re
import json
from io import BytesIO
try:
    from app.apis.models import (
        VerificationDocument,
        VerificationRequest,
        VerificationResponse,
        ReviewRequest,
        DocumentType,
        VerificationStatus,
        VerificationLevel
    )
    print('[INFO] Successfully imported models in verification.py')
except ImportError as e:
    print(f'[ERROR] Failed to import models in verification.py: {str(e)}')
    print('[ERROR] This might be due to incorrect Python path or missing models.py')
    
    # Define fallback classes to prevent complete API failure
    class VerificationStatus:
        PENDING = "pending"
        APPROVED = "approved"
        REJECTED = "rejected"
        EXPIRED = "expired"
    
    class VerificationLevel:
        DOCUMENT = "document"
        IDENTITY = "identity"
        ADVANCED = "advanced"
    
    class DocumentType:
        ID_CARD = "id_card"
        PASSPORT = "passport"
        DRIVING_LICENSE = "driving_license"
        BUSINESS_LICENSE = "business_license"
        FUND_CREDENTIALS = "fund_credentials"
        ACCREDITATION = "accreditation"
    
    class VerificationDocument(BaseModel):
        id: str
        user_id: str
        document_type: str
        file_name: Optional[str] = None
        file_size: Optional[int] = None
        mime_type: Optional[str] = None
        file_url: Optional[str] = None
        file_key: Optional[str] = None
        upload_date: Any
        expiry_date: Optional[Any] = None
        verification_status: str = VerificationStatus.PENDING
        reviewer_id: Optional[str] = None
        review_date: Optional[Any] = None
        review_notes: Optional[str] = None
        verification_level: str = VerificationLevel.DOCUMENT
        status: Optional[str] = None
    
    class VerificationRequest(BaseModel):
        user_id: str
        document_type: str
        file_url: str
        expiry_date: Optional[str] = None
    
    class VerificationResponse(BaseModel):
        verification_id: Optional[str] = None
        request_id: Optional[str] = None
        status: str
        message: str
        level: Optional[str] = None
        document_types: Optional[List[str]] = None
    
    class ReviewRequest(BaseModel):
        document_id: str
        reviewer_id: str
        status: str
        notes: Optional[str] = None
    
    print('[INFO] Created fallback model classes for verification API')
except Exception as e:
    print(f'[ERROR] Unexpected error importing models in verification.py: {str(e)}')
    import traceback
    print(f'[ERROR] Traceback: {traceback.format_exc()}')
    raise

router = APIRouter()

# Cache for verification documents with 5-minute TTL
_doc_cache = {}
_last_doc_cache_update = None
_doc_cache_ttl = 300

# MIME type whitelist for document security
ALLOWED_MIME_TYPES = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/tiff",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]

# Max file size (10MB)
MAX_FILE_SIZE = 10 * 1024 * 1024

def sanitize_storage_key(key: str) -> str:
    """Sanitize storage key to only allow alphanumeric and ._- symbols"""
    return re.sub(r'[^a-zA-Z0-9._-]', '', key)

def _get_cached_documents() -> Dict:
    """Get verification documents from cache or storage with TTL"""
    global _last_doc_cache_update, _doc_cache
    
    current_time = datetime.now()
    
    if (_last_doc_cache_update is None or 
        (current_time - _last_doc_cache_update).total_seconds() > _doc_cache_ttl):
        try:
            _doc_cache = db.storage.json.get("verification_documents", default={})
            _last_doc_cache_update = current_time
            print("[DEBUG] Document cache refreshed successfully")
        except Exception as e:
            print(f"[ERROR] Failed to refresh document cache: {str(e)}")
            # Return empty dict if cache refresh fails
            return {}
    
    return _doc_cache


def get_required_documents(user_role: str) -> List[str]:
    """Get list of required documents based on user role"""
    base_documents = [DocumentType.ID_CARD]
    
    role_specific_documents = {
        "fund_manager": [DocumentType.FUND_CREDENTIALS, DocumentType.ACCREDITATION],
        "limited_partner": [DocumentType.ACCREDITATION],
        "capital_raiser": [DocumentType.BUSINESS_LICENSE]
    }
    
    return base_documents + role_specific_documents.get(user_role, [])

def validate_document_type(user_role: str, document_type: str) -> bool:
    """Validate if the document type is required for the user role"""
    required_documents = get_required_documents(user_role)
    return document_type in required_documents

@router.post("/submit-verification", response_model=VerificationResponse)
def submit_verification(request: VerificationRequest) -> VerificationResponse:
    """Submit a document for verification"""
    try:
        # Get user profile
        profiles = db.storage.json.get("user_profiles", default={})
        user_profile = profiles.get(request.user_id)
        
        if not user_profile:
            raise HTTPException(status_code=404, detail="User profile not found")
        
        # Validate document type
        if not validate_document_type(user_profile.get("role"), request.document_type):
            raise HTTPException(
                status_code=400,
                detail=f"Document type {request.document_type} not required for role {user_profile.get('role')}"
            )
        
        # Create verification document
        document = VerificationDocument(
            id=f"doc_{datetime.now().timestamp()}",
            user_id=request.user_id,
            document_type=request.document_type,
            file_url=request.file_url,
            upload_date=datetime.now(),
            expiry_date=datetime.fromisoformat(request.expiry_date) if request.expiry_date else None,
            verification_status=VerificationStatus.PENDING
        )
        
        # Store document
        documents = db.storage.json.get("verification_documents", default={})
        # Convert datetime objects to ISO format strings for JSON serialization
        doc_dict = document.model_dump()
        doc_dict['upload_date'] = doc_dict['upload_date'].isoformat()
        if doc_dict.get('expiry_date'):
            doc_dict['expiry_date'] = doc_dict['expiry_date'].isoformat()
        documents[document.id] = doc_dict
        db.storage.json.put("verification_documents", documents)
        
        return VerificationResponse(
            request_id=document.id,
            status=VerificationStatus.PENDING,
            message="Document submitted successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing verification: {str(e)}") from e

@router.get("/verification-status/{user_id}", response_model=dict)
def get_verification_status(user_id: str) -> dict:
    """Get verification status for a user with both document status and profile completion"""
    try:
        # Get user profile
        try:
            profiles = db.storage.json.get("user_profiles", default={})
            user_profile = profiles.get(user_id)
            
            if not user_profile:
                raise HTTPException(status_code=404, detail="User profile not found")
        except Exception as e:
            if isinstance(e, HTTPException):
                raise
            print(f"[ERROR] Error retrieving user profile: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail="Error retrieving user profile. Please try again later."
            ) from e
        
        # Get required documents
        try:
            required_documents = get_required_documents(user_profile.get("role"))
        except Exception as e:
            print(f"[ERROR] Error getting required documents: {str(e)}")
            required_documents = [] # Fallback to empty list
        
        # Get submitted documents
        try:
            documents = db.storage.json.get("verification_documents", default={})
            user_documents = {
                doc_id: doc for doc_id, doc in documents.items()
                if doc.get("user_id") == user_id
            }
        except Exception as e:
            print(f"[ERROR] Error retrieving verification documents: {str(e)}")
            user_documents = {} # Fallback to empty dict
        
        # Check status for each required document
        status = {}
        for doc_type in required_documents:
            try:
                matching_docs = [
                    doc for doc in user_documents.values()
                    if doc.get("document_type") == doc_type
                ]
                
                if not matching_docs:
                    status[doc_type] = {
                        "status": "missing",
                        "message": "Document not submitted"
                    }
                else:
                    # Get most recent document - with error handling
                    try:
                        latest_doc = max(
                            matching_docs,
                            key=lambda x: datetime.fromisoformat(x.get("upload_date", "1970-01-01T00:00:00")) 
                            if isinstance(x.get("upload_date"), str) else datetime.min
                        )
                        status[doc_type] = {
                            "status": latest_doc.get("verification_status", "unknown"),
                            "upload_date": latest_doc.get("upload_date"),
                            "expiry_date": latest_doc.get("expiry_date"),
                            "review_notes": latest_doc.get("review_notes")
                        }
                    except (ValueError, KeyError) as e:
                        print(f"[ERROR] Error processing document dates: {str(e)}")
                        status[doc_type] = {
                            "status": "error",
                            "message": "Error processing document information"
                        }
            except Exception as e:
                print(f"[ERROR] Error processing document type {doc_type}: {str(e)}")
                status[doc_type] = {
                    "status": "error",
                    "message": "Error processing document status"
                }
        
        # Also include any optional documents submitted by the user
        optional_documents = set()
        try:
            for doc in user_documents.values():
                doc_type = doc.get("document_type")
                if doc_type and doc_type not in required_documents and doc_type not in status:
                    optional_documents.add(doc_type)
            
            for doc_type in optional_documents:
                matching_docs = [
                    doc for doc in user_documents.values()
                    if doc.get("document_type") == doc_type
                ]
                
                try:
                    latest_doc = max(
                        matching_docs,
                        key=lambda x: datetime.fromisoformat(x.get("upload_date", "1970-01-01T00:00:00")) 
                        if isinstance(x.get("upload_date"), str) else datetime.min
                    )
                    status[doc_type] = {
                        "status": latest_doc.get("verification_status", "unknown"),
                        "upload_date": latest_doc.get("upload_date"),
                        "expiry_date": latest_doc.get("expiry_date"),
                        "review_notes": latest_doc.get("review_notes"),
                        "is_optional": True
                    }
                except (ValueError, KeyError) as e:
                    print(f"[ERROR] Error processing optional document dates: {str(e)}")
                    status[doc_type] = {
                        "status": "error",
                        "message": "Error processing document information",
                        "is_optional": True
                    }
        except Exception as e:
            print(f"[ERROR] Error processing optional documents: {str(e)}")
        
        # Get verification settings
        try:
            verification_settings = db.storage.json.get("verification_settings", default={
                "require_documents": True,
                "profile_completion_threshold": 90.0,
                "auto_verify_trusted_users": False,
                "verification_message": "Complete your profile and upload required documents to get verified"
            })
        except Exception as e:
            print(f"[ERROR] Error retrieving verification settings: {str(e)}")
            verification_settings = {
                "require_documents": True,
                "profile_completion_threshold": 90.0,
                "auto_verify_trusted_users": False,
                "verification_message": "Complete your profile and upload required documents to get verified"
            }
        
        # Get profile completeness and check if it meets verification threshold
        profile_completeness = user_profile.get("completeness", 0)
        threshold = verification_settings.get("profile_completion_threshold", 90.0)
        completion_meets_threshold = profile_completeness >= threshold
        
        # Check if document verification is required based on admin settings
        require_document_verification = verification_settings.get("require_documents", True)
        
        # Check if user is from a trusted organization and auto-verification is enabled
        auto_verify_trusted = verification_settings.get("auto_verify_trusted_users", False)
        is_trusted_org = user_profile.get("is_trusted_organization", False)
        
        # Set verification status based on profile completeness and document requirements
        if auto_verify_trusted and is_trusted_org:
            # Auto-verify users from trusted organizations regardless of other criteria
            verification_status = "verified"
        elif completion_meets_threshold:
            if require_document_verification:
                # Both profile completion and document verification required
                verification_status = "verified" if all(status.get(doc_type, {}).get("status") == "approved" 
                                   for doc_type in required_documents) else "pending"
            else:
                # Only profile completion required, documents are optional
                verification_status = "verified"
        else:
            # Profile completion threshold not met
            verification_status = "incomplete"
        
        return {
            "user_id": user_id,
            "role": user_profile.get("role"),
            "documents": status,
            "required_documents": required_documents,
            "profile_completeness": profile_completeness,
            "profile_completion_threshold": threshold,
            "completion_meets_threshold": completion_meets_threshold,
            "require_document_verification": require_document_verification,
            "auto_verify_trusted_users": auto_verify_trusted,
            "is_trusted_organization": is_trusted_org,
            "verification_status": verification_status,
            "verification_complete": verification_status == "verified",
            "verification_message": verification_settings.get("verification_message", "")
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Error retrieving verification status: {str(e)}")
        import traceback
        print(f"[ERROR] Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Error retrieving verification status: {str(e)}") from e

@router.post("/review-document", response_model=VerificationResponse)
def review_document(request: ReviewRequest) -> VerificationResponse:
    """Review a verification document"""
    try:
        # Get document
        documents = db.storage.json.get("verification_documents", default={})
        document = documents.get(request.document_id)
        
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        
        # Update document status
        document["verification_status"] = request.status
        document["reviewer_id"] = request.reviewer_id
        document["review_date"] = datetime.now().isoformat()
        document["review_notes"] = request.notes
        
        # Store updated document
        documents[request.document_id] = document
        db.storage.json.put("verification_documents", documents)
        
        return VerificationResponse(
            request_id=request.document_id,
            status=request.status,
            message="Document review completed"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reviewing document: {str(e)}") from e

@router.get("/pending-verifications", response_model=List[VerificationDocument])
def get_pending_verifications() -> List[VerificationDocument]:
    """Get all pending verification documents"""
    try:
        documents = db.storage.json.get("verification_documents", default={})
        
        # Filter pending documents
        pending_docs = [
            VerificationDocument(**doc)
            for doc in documents.values()
            if doc["verification_status"] == VerificationStatus.PENDING
        ]
        
        return pending_docs
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving pending verifications: {str(e)}") from e


class FlexibleDocumentUploadRequest(BaseModel):
    user_id: str
    document_type: str
    verification_level: str = VerificationLevel.DOCUMENT
    expiry_date: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)
    # This flags whether the document is required or optional
    is_required: bool = True
    
    model_config = {"arbitrary_types_allowed": True}


@router.post("/upload-verification-document", response_model=VerificationResponse)
async def upload_verification_document(
    user_id: str = Form(...),
    document_type: str = Form(...),
    file: UploadFile = File(...),
    expiry_date: Optional[str] = Form(None),
    metadata: Optional[str] = Form(None),
    is_required: bool = Form(True),
    verification_level: Optional[str] = Form(None)
) -> VerificationResponse:
    """
    Upload a document for verification with flexible requirements based on settings
    
    This endpoint will check verification settings to determine if document verification
    is required or if profile completeness is sufficient for verification.
    """
    """Upload a document for verification with flexible requirements
    
    This endpoint allows documents to be marked as required or optional,
    and accepts custom metadata for different document types.
    """
    try:
        # Validate file size
        try:
            file_content = await file.read()
            if len(file_content) > MAX_FILE_SIZE:
                raise HTTPException(
                    status_code=413,
                    detail=f"File size exceeds maximum allowed size of {MAX_FILE_SIZE/1024/1024}MB"
                )
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Error reading file content: {str(e)}"
            ) from e
        
        # Validate MIME type
        content_type = file.content_type
        if content_type not in ALLOWED_MIME_TYPES:
            raise HTTPException(
                status_code=415,
                detail=f"Unsupported file type: {content_type}. Allowed types: {', '.join(ALLOWED_MIME_TYPES)}"
            )
            
        # Get user profile
        try:
            profiles = db.storage.json.get("user_profiles", default={})
            user_profile = profiles.get(user_id)
            
            if not user_profile:
                raise HTTPException(status_code=404, detail="User profile not found")
        except Exception as e:
            if isinstance(e, HTTPException):
                raise
            print(f"[ERROR] Error retrieving user profile: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail="Error retrieving user profile. Please try again later."
            ) from e
        
        # Check verification settings
        try:
            verification_settings = db.storage.json.get("verification_settings", default={
                "require_documents": True,
                "profile_completion_threshold": 90.0,
                "auto_verify_trusted_users": False,
                "verification_message": "Complete your profile and upload required documents to get verified"
            })
        except Exception as e:
            print(f"[ERROR] Error retrieving verification settings: {str(e)}")
            verification_settings = {
                "require_documents": True,
                "profile_completion_threshold": 90.0,
                "auto_verify_trusted_users": False,
                "verification_message": "Complete your profile and upload required documents to get verified"
            }
            
        # Only validate document type if it's marked as required AND document verification is enabled
        if is_required and verification_settings.get("require_documents", True) and not validate_document_type(user_profile.get("role"), document_type):
            if user_profile.get("role") is None:
                raise HTTPException(
                    status_code=400,
                    detail=f"User role is not defined. Cannot validate document type {document_type}"
                )
            raise HTTPException(
                status_code=400,
                detail=f"Document type {document_type} not required for role {user_profile.get('role')}"
            )
        
        # Parse metadata if provided
        parsed_metadata = {}
        if metadata:
            try:
                parsed_metadata = json.loads(metadata)
            except json.JSONDecodeError as e:
                raise HTTPException(status_code=400, detail="Invalid metadata format. Must be valid JSON.") from e
        
        # Generate a unique document ID
        doc_id = f"doc_{user_id}_{document_type}_{datetime.now().timestamp()}"
        doc_id = sanitize_storage_key(doc_id)
        
        # Store the file
        file_key = f"verification_docs/{doc_id}"
        file_key = sanitize_storage_key(file_key)
        try:
            db.storage.binary.put(file_key, file_content)
        except Exception as e:
            print(f"[ERROR] Failed to store document file: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail="Failed to store document file. Please try again later."
            ) from e
        
        # Create verification document record
        try:
            document = VerificationDocument(
                id=doc_id,
                user_id=user_id,
                document_type=document_type,
                file_name=file.filename,
                file_size=len(file_content),
                mime_type=content_type,
                upload_date=datetime.now().isoformat(),
                status=VerificationStatus.PENDING,
                expiry_date=expiry_date,
                verification_level=verification_level or VerificationLevel.DOCUMENT
            )
            
            # Store document metadata
            doc_dict = document.model_dump()
            doc_dict['metadata'] = parsed_metadata
            doc_dict['is_required'] = is_required
            doc_dict['file_key'] = file_key
        except Exception as e:
            print(f"[ERROR] Error creating document record: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail="Error creating document record. Please try again later."
            ) from e
        
        # Add to verification documents store
        try:
            documents = db.storage.json.get("verification_documents", default={})
            documents[doc_id] = doc_dict
            db.storage.json.put("verification_documents", documents)
        except Exception as e:
            print(f"[ERROR] Error storing document metadata: {str(e)}")
            # Try to clean up the stored file
            try:
                # Clean up the file since we couldn't store the metadata
                db.storage.binary.delete(file_key)
            except Exception as clean_up_error:
                print(f"[ERROR] Failed to clean up file after metadata storage failure: {str(clean_up_error)}")
            raise HTTPException(
                status_code=500,
                detail="Error storing document information. Please try again later."
            ) from e
        
        # Construct and return response
        try:
            return VerificationResponse(
                verification_id=doc_id,
                status=VerificationStatus.PENDING,
                message="Document uploaded successfully",
                level=verification_level or VerificationLevel.DOCUMENT,
                document_types=[document_type]
            )
        except Exception as e:
            print(f"[ERROR] Error constructing response: {str(e)}")
            return {
                "verification_id": doc_id,
                "status": VerificationStatus.PENDING,
                "message": "Document uploaded successfully",
                "level": verification_level or VerificationLevel.DOCUMENT,
                "document_types": [document_type]
            }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Document upload failed: {str(e)}")
        import traceback
        print(f"[ERROR] Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Error uploading document: {str(e)}") from e


@router.get("/download-document/{document_id}")
def download_document(document_id: str) -> bytes:
    """Download a verification document by ID"""
    try:
        # Get document metadata
        documents = db.storage.json.get("verification_documents", default={})
        document = documents.get(document_id)
        
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        
        # Get file content
        file_key = document.get('file_key')
        if not file_key:
            raise HTTPException(status_code=404, detail="Document file reference not found")
        
        try:
            file_content = db.storage.binary.get(file_key)
        except Exception as e:
            raise HTTPException(status_code=404, detail=f"Document file not found: {str(e)}") from e
        
        return file_content
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error downloading document: {str(e)}") from e
