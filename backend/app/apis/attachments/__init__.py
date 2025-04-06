from typing import Optional
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from datetime import datetime, timedelta
import uuid
import base64
import mimetypes
import databutton as db
from app.apis.auth_utils import TokenRequest, get_user_id

router = APIRouter(prefix="/attachments")

def cleanup_old_attachments():
    """Cleanup attachments older than 30 days"""
    try:
        attachments = get_attachments_store()
        current_time = datetime.utcnow()
        
        # Find attachments to delete
        to_delete = [
            att_id for att_id, att in attachments.items()
            if current_time - datetime.fromisoformat(att['created_at']) > timedelta(days=30)
        ]
        
        # Delete files and metadata
        for att_id in to_delete:
            att = attachments[att_id]
            file_key = f"attachments/{att_id}/{att['filename']}"
            try:
                db.storage.binary.delete(file_key)
            except Exception:
                pass  # Ignore errors if file doesn't exist
            del attachments[att_id]
            
        if to_delete:
            db.storage.json.put("ticket_attachments", attachments)
            print(f"Cleaned up {len(to_delete)} old attachments")
            
    except Exception as e:
        print(f"Error during attachment cleanup: {str(e)}")
        # Continue execution

def validate_file_type(content_type: str) -> bool:
    """Validate file type against allowed types"""
    ALLOWED_TYPES = [
        # Documents
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        # Images
        'image/jpeg',
        'image/png',
        'image/gif',
        # Spreadsheets
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        # Presentations
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ]
    return content_type in ALLOWED_TYPES

def encrypt_file(content: bytes) -> bytes:
    """Encrypt file content using Fernet encryption"""
    try:
        from cryptography.fernet import Fernet
        key = db.secrets.get("DOCUMENT_ENCRYPTION_KEY")
        if not key:
            print("Warning: DOCUMENT_ENCRYPTION_KEY not set, using fallback encryption")
            key = Fernet.generate_key()
        f = Fernet(key)
        return f.encrypt(content)
    except Exception as e:
        print(f"Error encrypting file: {str(e)}")
        return content

def detect_content_type(filename: str, content: bytes) -> str:
    """Detect content type from filename and content"""
    # Try to detect from filename first
    content_type, _ = mimetypes.guess_type(filename)
    if content_type:
        return content_type
        
    # Fallback to basic detection from content
    if content.startswith(b'%PDF'):
        return 'application/pdf'
    elif content.startswith(b'\x89PNG\r\n\x1a\n'):
        return 'image/png'
    elif content.startswith(b'\xff\xd8'):
        return 'image/jpeg'
    elif content.startswith(b'GIF87a') or content.startswith(b'GIF89a'):
        return 'image/gif'
        
    return 'application/octet-stream'



class AttachmentResponse(BaseModel):
    id: str
    filename: str
    content_type: str
    size: int
    url: str
    created_at: datetime
    user_id: str

def get_attachments_store() -> dict:
    """Get or initialize the attachments storage"""
    try:
        attachments = db.storage.json.get("ticket_attachments")
    except FileNotFoundError:
        attachments = {}
        db.storage.json.put("ticket_attachments", attachments)
    return attachments

class UploadAttachmentRequest(BaseModel):
    file: str  # base64 encoded file content

@router.post("/upload", response_model=AttachmentResponse)
def upload_attachment(
    body: UploadAttachmentRequest,
    token: TokenRequest
) -> AttachmentResponse:
    """Upload a file attachment with improved validation and error handling"""
    # Get current user ID
    user_id = get_user_id(token.token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Authentication failed")
    
    # Run cleanup periodically
    cleanup_old_attachments()
    
    try:
        # Decode base64 content
        try:
            content = base64.b64decode(body.file)
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail="Invalid file content: Not a valid base64 string"
            ) from e
        
        # Validate file size (10MB limit)
        if len(content) > 10 * 1024 * 1024:
            raise HTTPException(
                status_code=400,
                detail={
                    "message": "File too large",
                    "max_size": "10MB"
                }
            )
            
        if not content:
            raise HTTPException(status_code=400, detail="Empty file provided")
        
        # Generate unique ID and filename
        file_id = f"att_{uuid.uuid4().hex}"
        filename = f"attachment_{file_id}"
        
        # Detect content type
        content_type = detect_content_type(filename, content)
        
        # Validate file type
        if not validate_file_type(content_type):
            raise HTTPException(
                status_code=400,
                detail={
                    "message": "File type not allowed",
                    "allowed_types": [
                        "PDF", "Word", "Excel", "PowerPoint",
                        "Text", "JPEG", "PNG"
                    ]
                }
            )
        
        # Store the file
        file_key = f"attachments/{file_id}/{filename}"
        encrypted_content = encrypt_file(content)
        db.storage.binary.put(file_key, encrypted_content)
        
        # Create attachment record
        attachment = {
            "id": file_id,
            "filename": filename,
            "content_type": content_type,
            "size": len(content),
            "url": f"/api/attachments/{file_id}/download",
            "created_at": datetime.utcnow().isoformat(),
            "user_id": user_id
        }
        
        # Store attachment metadata
        attachments = get_attachments_store()
        attachments[file_id] = attachment
        db.storage.json.put("ticket_attachments", attachments)
        
        print(f"Successfully uploaded attachment {file_id} of type {content_type}")
        return AttachmentResponse(**attachment)
        
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Error uploading attachment: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error uploading attachment: {str(e)}"
        ) from e

@router.get("/{attachment_id}/download", response_model=bytes)
def download_attachment(
    attachment_id: str,
    token: TokenRequest
) -> bytes:
    """Download a file attachment"""
    # Validate token
    user_id = get_user_id(token.token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Authentication failed")
    
    # Get attachment metadata
    attachments = get_attachments_store()
    if attachment_id not in attachments:
        raise HTTPException(status_code=404, detail="Attachment not found")
    
    attachment = attachments[attachment_id]
    file_key = f"attachments/{attachment_id}/{attachment['filename']}"
    
    try:
        content = db.storage.binary.get(file_key)
        return content
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail="Attachment file not found") from e
