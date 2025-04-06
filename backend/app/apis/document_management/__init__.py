from typing import List, Optional, Dict, Set
from datetime import datetime
from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from app.apis.audit import AuditLogger
from pydantic import BaseModel, Field, validator
import databutton as db
from cryptography.fernet import Fernet
import base64
import json
import hashlib
import mimetypes  # Using built-in mimetypes for file type detection
from enum import Enum
from ratelimit import limits, sleep_and_retry
import asyncio
from concurrent.futures import ThreadPoolExecutor

router = APIRouter()

def create_router() -> APIRouter:
    return router
    
# Initialize thread pool for background tasks
thread_pool = ThreadPoolExecutor(max_workers=4)

async def _scan_document(document_id: str, content: bytes):
    """Scan document for security threats
    This is a placeholder implementation. In a production environment,
    you would integrate with a proper antivirus/malware scanning service.
    """
    try:
        # Update scan status to scanning
        metadata = _get_document_metadata(document_id)
        if not metadata:
            return
        
        metadata.scan_status = "scanning"
        _store_document_metadata(metadata)
        
        # Simulate scanning process
        await asyncio.sleep(2)
        
        # Perform basic checks (example implementation)
        # 1. Check file signature
        if not _verify_file_signature(content, metadata.file_type):
            metadata.scan_status = "infected"
            _store_document_metadata(metadata)
            return
        
        # 2. Check for suspicious patterns (placeholder)
        if _contains_suspicious_patterns(content):
            metadata.scan_status = "infected"
            _store_document_metadata(metadata)
            return
        
        # Mark as clean if all checks pass
        metadata.scan_status = "clean"
        _store_document_metadata(metadata)
        
    except Exception as e:
        print(f"Error scanning document {document_id}: {str(e)}")
        # Mark as infected on error to be safe
        if metadata:
            metadata.scan_status = "infected"
            _store_document_metadata(metadata)

def _verify_file_signature(content: bytes, claimed_type: str) -> bool:
    """Verify if the file content matches its claimed type
    Basic implementation checking file signatures/magic numbers
    """
    signatures = {
        'application/pdf': b'%PDF',
        'image/jpeg': b'\xFF\xD8\xFF',
        'image/png': b'\x89PNG\r\n\x1a\n',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': b'PK\x03\x04',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': b'PK\x03\x04',
    }
    
    if claimed_type not in signatures:
        # For types we don't have signatures for, return True
        return True
        
    return content.startswith(signatures[claimed_type])

def _contains_suspicious_patterns(content: bytes) -> bool:
    """Check for suspicious patterns in file content
    This is a basic implementation. In production, you would use more
    sophisticated malware detection techniques.
    """
    suspicious_patterns = [
        b"X5O!P%@AP[4\PZX54(P^)7CC)7",  # EICAR test signature
        b"<script",  # Basic XSS check
        b"#!/",     # Shebang (executable scripts)
    ]
    
    content_lower = content.lower()
    return any(pattern.lower() in content_lower for pattern in suspicious_patterns)

# Models
class DocumentType(str, Enum):
    """Supported document types"""
    PDF = "application/pdf"
    DOCX = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    XLSX = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    CSV = "text/csv"
    TXT = "text/plain"
    PNG = "image/png"
    JPEG = "image/jpeg"

class DocumentMetadata(BaseModel):
    """Model for document metadata"""
    document_id: str
    filename: str
    file_type: str
    size_bytes: int
    uploaded_by: str
    upload_date: datetime
    last_modified: datetime
    is_encrypted: bool = True
    shared_with: List[str] = []
    version: int = 1
    tags: List[str] = []
    checksum: str
    scan_status: str = "pending"  # pending, scanning, clean, infected
    previous_versions: List[str] = []  # List of previous version IDs
    retention_period: Optional[int] = None  # Days to retain the document
    download_count: int = 0
    last_accessed: Optional[datetime] = None
    
    @validator('file_type')
    def validate_file_type(cls, v):
        try:
            DocumentType(v)
            return v
        except ValueError:
            raise ValueError(f"Unsupported file type: {v}")

class DocumentPermission(BaseModel):
    """Model for document permissions"""
    document_id: str
    user_id: str
    can_view: bool = True
    can_edit: bool = False
    can_share: bool = False
    expiry_date: Optional[datetime] = None

# Helper functions
def _get_encryption_key() -> bytes:
    """Get or create encryption key for documents"""
    key = db.secrets.get("DOCUMENT_ENCRYPTION_KEY")
    if not key:
        # Generate new key if not exists
        key = Fernet.generate_key().decode()
        db.secrets.put("DOCUMENT_ENCRYPTION_KEY", key)
    return key.encode()

def _get_fernet() -> Fernet:
    """Get Fernet instance for encryption/decryption"""
    return Fernet(_get_encryption_key())

# File size limits per type (in bytes)
FILE_SIZE_LIMITS = {
    DocumentType.PDF: 10 * 1024 * 1024,  # 10MB
    DocumentType.DOCX: 5 * 1024 * 1024,  # 5MB
    DocumentType.XLSX: 5 * 1024 * 1024,  # 5MB
    DocumentType.CSV: 2 * 1024 * 1024,   # 2MB
    DocumentType.TXT: 1 * 1024 * 1024,   # 1MB
    DocumentType.PNG: 5 * 1024 * 1024,   # 5MB
    DocumentType.JPEG: 5 * 1024 * 1024,  # 5MB
}

# Quota limits per subscription tier (in bytes)
QUOTA_LIMITS = {
    "free": 100 * 1024 * 1024,      # 100MB
    "basic": 1024 * 1024 * 1024,    # 1GB
    "professional": 5 * 1024 * 1024 * 1024,  # 5GB
    "enterprise": 20 * 1024 * 1024 * 1024,  # 20GB
}

def _get_user_subscription_tier(user_id: str) -> str:
    """Get user's subscription tier"""
    # Get user's subscription from storage
    subscriptions = db.storage.json.get("user_subscriptions", default={})
    user_sub = subscriptions.get(user_id, {})
    return user_sub.get("tier", "free")

def _get_user_quota(user_id: str) -> dict:
    """Get user's document storage quota and usage"""
    quota_key = f"document_quota_{user_id}"
    tier = _get_user_subscription_tier(user_id)
    
    default_quota = {
        "max_bytes": QUOTA_LIMITS[tier],
        "used_bytes": 0,
        "document_count": 0,
        "quota_per_type": {doc_type.value: 0 for doc_type in DocumentType}
    }
    return db.storage.json.get(quota_key, default=default_quota)

def _update_user_quota(user_id: str, added_bytes: int = 0, removed_bytes: int = 0):
    """Update user's storage quota usage"""
    quota_key = f"document_quota_{user_id}"
    quota = _get_user_quota(user_id)
    quota["used_bytes"] = max(0, quota["used_bytes"] + added_bytes - removed_bytes)
    db.storage.json.put(quota_key, quota)

def _store_document_metadata(metadata: DocumentMetadata):
    """Store document metadata"""
    metadata_key = f"document_metadata_{metadata.document_id}"
    db.storage.json.put(metadata_key, metadata.dict())

def _get_document_metadata(document_id: str) -> Optional[DocumentMetadata]:
    """Get document metadata"""
    metadata_key = f"document_metadata_{document_id}"
    data = db.storage.json.get(metadata_key)
    return DocumentMetadata(**data) if data else None

# Endpoints
@router.post("/documents/upload")
@sleep_and_retry
@limits(calls=10, period=60)  # Rate limit: 10 uploads per minute
async def upload_document(
    file: UploadFile = File(...),
    user_id: Optional[str] = None,
    tags: Optional[List[str]] = None,
    background_tasks: BackgroundTasks = None,
) -> DocumentMetadata:
    """Upload a new document"""
    
    if not user_id:
        raise HTTPException(status_code=401, detail="User ID required")
    
    # Detect file type using mimetypes
    file_content = await file.read()
    file_size = len(file_content)
    mime_type, _ = mimetypes.guess_type(file.filename) or (None, None)
    
    if not mime_type:
        raise HTTPException(status_code=400, detail="Could not determine file type")
    
    # Validate file type
    try:
        doc_type = DocumentType(mime_type)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {mime_type}")
    
    # Check file size limit for type
    if file_size > FILE_SIZE_LIMITS[doc_type]:
        raise HTTPException(
            status_code=400,
            detail=f"File size exceeds limit for {doc_type.name}. Maximum size: {FILE_SIZE_LIMITS[doc_type] / (1024*1024)}MB"
        )
    
    # Check quota
    quota = _get_user_quota(user_id)
    if quota["used_bytes"] + file_size > quota["max_bytes"]:
        raise HTTPException(status_code=400, detail="Storage quota exceeded")
        
    # Calculate file checksum
    file_hash = hashlib.sha256(file_content).hexdigest()
    
    # Generate document ID and encrypt content
    document_id = f"doc_{base64.urlsafe_b64encode(str(datetime.utcnow().timestamp()).encode()).decode()}"
    fernet = _get_fernet()
    encrypted_content = fernet.encrypt(file_content)
    
    # Create metadata
    metadata = DocumentMetadata(
        document_id=document_id,
        filename=file.filename,
        file_type=mime_type,
        size_bytes=file_size,
        uploaded_by=user_id,
        upload_date=datetime.utcnow(),
        last_modified=datetime.utcnow(),
        tags=tags or [],
        checksum=file_hash,
        scan_status="pending"
    )
    
    # Check if this is an update to existing document
    existing_doc = _get_document_metadata(document_id)
    if existing_doc:
        # Create new version
        old_version_id = f"{document_id}_v{existing_doc.version}"
        db.storage.binary.put(f"document_{old_version_id}", 
                             db.storage.binary.get(f"document_{document_id}"))
        metadata.version = existing_doc.version + 1
        metadata.previous_versions = existing_doc.previous_versions + [old_version_id]
    
    # Store encrypted document
    db.storage.binary.put(f"document_{document_id}", encrypted_content)
    
    # Log the document event
    AuditLogger.log_document_event(
        user_id=user_id,
        document_id=document_id,
        operation="upload",
        details={
            "filename": file.filename,
            "size": file_size,
            "version": metadata.version
        },
        version=str(metadata.version)
    )
    
    # Store metadata
    
    # Add background task for virus scanning
    if background_tasks:
        background_tasks.add_task(_scan_document, document_id, file_content)
    _store_document_metadata(metadata)
    
    # Update quota
    _update_user_quota(user_id, added_bytes=file_size)
    
    return metadata

@router.get("/documents/{document_id}")
@sleep_and_retry
@limits(calls=30, period=60)  # Rate limit: 30 downloads per minute
async def get_document(document_id: str, user_id: str = None) -> bytes:
    """Download a document"""
    try:
        # Authentication check
        if not user_id:
            raise HTTPException(
                status_code=401,
                detail="Authentication required. Please provide a valid user ID"
            )
        
        # Validate document_id format
        if not document_id.startswith("doc_"):
            raise HTTPException(
                status_code=400,
                detail="Invalid document ID format. Document ID must start with 'doc_'"
            )
        
        try:
            # Attempt to decode the base64 part of the document_id
            base64_part = document_id[4:]  # Skip 'doc_' prefix
            base64.urlsafe_b64decode(base64_part)
        except Exception:
            raise HTTPException(
                status_code=400,
                detail="Invalid document ID format. Document ID contains invalid characters"
            )
        
        # Get metadata and verify access
        metadata = _get_document_metadata(document_id)
        if not metadata:
            raise HTTPException(
                status_code=404,
                detail="Document not found or has been deleted"
            )
        
        # Access control check
        if user_id != metadata.uploaded_by and user_id not in metadata.shared_with:
            raise HTTPException(
                status_code=403,
                detail="You don't have permission to access this document"
            )
        
        # Enhanced scan status checks
        if metadata.scan_status == "infected":
            raise HTTPException(
                status_code=403,
                detail="This document has been flagged for security concerns and cannot be downloaded"
            )
        elif metadata.scan_status == "pending":
            raise HTTPException(
                status_code=400,
                detail="Document security scan is pending. Please try again in a few moments"
            )
        elif metadata.scan_status == "scanning":
            raise HTTPException(
                status_code=400,
                detail="Document is being scanned for security. Please try again shortly"
            )
        
        # Get encrypted document
        encrypted_content = db.storage.binary.get(f"document_{document_id}")
        if not encrypted_content:
            raise HTTPException(
                status_code=404,
                detail="Document content not found. The document might have been deleted"
            )
        
        # Update access metadata
        metadata.download_count += 1
        metadata.last_accessed = datetime.utcnow()
        _store_document_metadata(metadata)
        
        # Log the document access
        AuditLogger.log_document_event(
            user_id=user_id,
            document_id=document_id,
            operation="download",
            details={
                "filename": metadata.filename,
                "version": metadata.version
            },
            access_type="view",
            version=str(metadata.version)
        )
        
        # Decrypt document with error handling
        try:
            fernet = _get_fernet()
            return fernet.decrypt(encrypted_content)
        except Exception as e:
            print(f"Error decrypting document {document_id}: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail="Unable to process document. Please contact support if this persists"
            )
            
    except HTTPException:
        # Re-raise HTTP exceptions as they contain proper status codes
        raise
    except Exception as e:
        # Log unexpected errors and return a safe message
        print(f"Unexpected error in get_document: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred. Please try again later"
        )

@router.delete("/documents/{document_id}")
async def delete_document(document_id: str, user_id: str = None):
    """Delete a document"""
    if not user_id:
        raise HTTPException(status_code=401, detail="User ID required")
    
    # Get metadata and verify ownership
    metadata = _get_document_metadata(document_id)
    if not metadata:
        raise HTTPException(status_code=404, detail="Document not found")
    
    if user_id != metadata.uploaded_by:
        raise HTTPException(status_code=403, detail="Only document owner can delete")
    
    # Archive document versions instead of deleting
    archive_prefix = f"archived_document_{document_id}"
    db.storage.binary.put(f"{archive_prefix}", db.storage.binary.get(f"document_{document_id}"))
    db.storage.json.put(f"{archive_prefix}_metadata", metadata.dict())
    
    # Delete active document and metadata
    db.storage.binary.delete(f"document_{document_id}")
    db.storage.json.delete(f"document_metadata_{document_id}")
    
    # Log the document deletion
    AuditLogger.log_document_event(
        user_id=user_id,
        document_id=document_id,
        operation="delete",
        details={
            "filename": metadata.filename,
            "archived": True
        },
        version=str(metadata.version)
    )
    
    # Update quota
    _update_user_quota(user_id, removed_bytes=metadata.size_bytes)
    
    return {"status": "success", "message": "Document deleted"}

@router.post("/documents/{document_id}/share")
async def share_document(
    document_id: str,
    shared_with: List[str],
    user_id: str = None
):
    """Share document with other users"""
    if not user_id:
        raise HTTPException(status_code=401, detail="User ID required")
    
    # Get metadata and verify ownership
    metadata = _get_document_metadata(document_id)
    if not metadata:
        raise HTTPException(status_code=404, detail="Document not found")
    
    if user_id != metadata.uploaded_by:
        raise HTTPException(status_code=403, detail="Only document owner can share")
    
    # Update shared users
    metadata.shared_with = list(set(metadata.shared_with + shared_with))
    _store_document_metadata(metadata)
    
    # Log the share event
    AuditLogger.log_document_event(
        user_id=user_id,
        document_id=document_id,
        operation="share",
        details={
            "shared_with": shared_with
        },
        access_type="share",
        version=str(metadata.version)
    )
    
    return {"status": "success", "shared_with": metadata.shared_with}

@router.get("/documents")
async def list_documents(user_id: str = None) -> List[DocumentMetadata]:
    """List all documents accessible to user"""
    if not user_id:
        raise HTTPException(status_code=401, detail="User ID required")
    
    # Get all document metadata
    all_docs = []
    metadata_prefix = "document_metadata_"
    
    # List all documents in storage
    for entry in db.storage.json.list():
        key = entry.name
        if key.startswith(metadata_prefix):
            metadata = db.storage.json.get(key)
            if metadata:
                doc_metadata = DocumentMetadata(**metadata)
                # Include if user is owner or has access
                if user_id == doc_metadata.uploaded_by or user_id in doc_metadata.shared_with:
                    all_docs.append(doc_metadata)
    
    return all_docs

@router.get("/documents/{document_id}/versions/{version}")
async def get_document_version(document_id: str, version: int, user_id: str = None) -> bytes:
    """Get a specific version of a document"""
    if not user_id:
        raise HTTPException(status_code=401, detail="User ID required")
    
    # Get current document metadata
    current_metadata = _get_document_metadata(document_id)
    if not current_metadata:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Check access
    if user_id != current_metadata.uploaded_by and user_id not in current_metadata.shared_with:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # If requesting current version
    if version == current_metadata.version:
        doc_key = f"document_{document_id}"
    else:
        # Find the version in previous versions
        version_id = f"{document_id}_v{version}"
        if version_id not in current_metadata.previous_versions:
            raise HTTPException(status_code=404, detail="Version not found")
        doc_key = f"document_{version_id}"
    
    # Get and decrypt document
    encrypted_content = db.storage.binary.get(doc_key)
    if not encrypted_content:
        raise HTTPException(status_code=404, detail="Document content not found")
    
    fernet = _get_fernet()
    
    # Log the version access
    AuditLogger.log_document_event(
        user_id=user_id,
        document_id=document_id,
        operation="get_version",
        details={"version": version},
        access_type="view",
        version=str(version)
    )
    
    return fernet.decrypt(encrypted_content)

@router.get("/documents/{document_id}/versions")
async def get_document_versions(document_id: str, user_id: str = None) -> List[DocumentMetadata]:
    """Get all versions of a document"""
    if not user_id:
        raise HTTPException(status_code=401, detail="User ID required")
    
    # Get current document metadata
    current_metadata = _get_document_metadata(document_id)
    if not current_metadata:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Check access
    if user_id != current_metadata.uploaded_by and user_id not in current_metadata.shared_with:
        raise HTTPException(status_code=403, detail="Access denied")
    
    versions = [current_metadata]
    
    # Get previous versions
    for version_id in current_metadata.previous_versions:
        version_metadata = _get_document_metadata(version_id)
        if version_metadata:
            versions.append(version_metadata)
    
    # Sort by version number descending
    versions.sort(key=lambda x: x.version, reverse=True)
    
    # Log the versions access
    AuditLogger.log_document_event(
        user_id=user_id,
        document_id=document_id,
        operation="list_versions",
        details={"version_count": len(versions)},
        access_type="view"
    )
    
    return versions

@router.post("/documents/{document_id}/restore/{version}")
async def restore_document_version(document_id: str, version: int, user_id: str = None):
    """Restore a document to a previous version"""
    if not user_id:
        raise HTTPException(status_code=401, detail="User ID required")
    
    # Get current document metadata
    current_metadata = _get_document_metadata(document_id)
    if not current_metadata:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Check ownership
    if user_id != current_metadata.uploaded_by:
        raise HTTPException(status_code=403, detail="Only document owner can restore versions")
    
    # Validate version exists
    if version >= current_metadata.version:
        raise HTTPException(status_code=400, detail="Cannot restore to current or future version")
    
    version_id = f"{document_id}_v{version}"
    if version_id not in current_metadata.previous_versions:
        raise HTTPException(status_code=404, detail="Version not found")
    
    # Get version content
    version_content = db.storage.binary.get(f"document_{version_id}")
    if not version_content:
        raise HTTPException(status_code=404, detail="Version content not found")
    
    # Store current version as a new previous version
    old_version_id = f"{document_id}_v{current_metadata.version}"
    current_content = db.storage.binary.get(f"document_{document_id}")
    db.storage.binary.put(f"document_{old_version_id}", current_content)
    
    # Update metadata
    current_metadata.previous_versions.append(old_version_id)
    current_metadata.version += 1
    current_metadata.last_modified = datetime.utcnow()
    
    # Restore version content as current
    db.storage.binary.put(f"document_{document_id}", version_content)
    _store_document_metadata(current_metadata)
    
    # Log the restore event
    AuditLogger.log_document_event(
        user_id=user_id,
        document_id=document_id,
        operation="restore",
        details={
            "restored_from_version": version,
            "new_version": current_metadata.version
        },
        version=str(current_metadata.version)
    )
    
    return current_metadata

@router.get("/quota")
async def get_quota(user_id: str = None):
    """Get user's storage quota and usage"""
    if not user_id:
        raise HTTPException(status_code=401, detail="User ID required")
    
    return _get_user_quota(user_id)