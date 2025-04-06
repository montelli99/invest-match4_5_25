from typing import Dict, List, Optional
from datetime import datetime
import json
import databutton as db
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

router = APIRouter()

class AuditLog(BaseModel):
    """Represents an audit log entry"""
    timestamp: str = Field(..., description="When the action occurred")
    action: str = Field(..., description="The action that was performed")
    performed_by: str = Field(..., description="ID of the user who performed the action")
    target_user: str = Field(..., description="ID of the user affected by the action")
    details: Dict = Field(..., description="Additional details about the action")

class DocumentAuditLog(AuditLog):
    """Document-specific audit log entry"""
    document_id: str = Field(..., description="ID of the document involved")
    operation: str = Field(..., description="Operation performed on document")
    access_type: Optional[str] = Field(None, description="Type of access (view/edit/share)")
    version: Optional[str] = Field(None, description="Document version if applicable")

class AuditLogger:
    """Service class for audit logging"""
    STORAGE_KEY = "admin_audit_logs"
    MAX_LOGS = 1000

    @classmethod
    def log_event(cls, admin_uid: str, action: str, target_uid: str, details: Dict):
        """Log an audit event to storage"""
        try:
            # Get existing audit logs
            audit_logs = cls._get_existing_logs()

            # Create new audit log entry
            new_log = AuditLog(
                timestamp=datetime.utcnow().isoformat(),
                action=action,
                performed_by=admin_uid,
                target_user=target_uid,
                details=details
            ).dict()

            # Add to beginning of list and maintain size limit
            audit_logs.insert(0, new_log)
            audit_logs = audit_logs[:cls.MAX_LOGS]

            # Save back to storage
            cls._save_logs(audit_logs)
        except Exception as e:
            print(f"Error logging audit event: {e}")
    
    @classmethod
    def get_logs(cls, limit: int = 100) -> List[Dict]:
        """Get audit logs with limit"""
        audit_logs = cls._get_existing_logs()
        return audit_logs[:limit]
    
    @classmethod
    def _get_existing_logs(cls) -> List[Dict]:
        """Get existing audit logs from storage"""
        try:
            return json.loads(db.storage.text.get(cls.STORAGE_KEY) or "[]")
        except Exception:
            return []
    
    @classmethod
    def log_document_event(cls, user_id: str, document_id: str, operation: str, details: Dict, 
                          access_type: Optional[str] = None, version: Optional[str] = None):
        """Log a document-related event"""
        try:
            # Get existing audit logs
            audit_logs = cls._get_existing_logs()

            # Create new document audit log entry
            new_log = DocumentAuditLog(
                timestamp=datetime.utcnow().isoformat(),
                action="document_operation",
                performed_by=user_id,
                target_user=user_id,  # For document operations, target is same as performer
                document_id=document_id,
                operation=operation,
                access_type=access_type,
                version=version,
                details=details
            ).dict()

            # Add to beginning of list and maintain size limit
            audit_logs.insert(0, new_log)
            audit_logs = audit_logs[:cls.MAX_LOGS]

            # Save back to storage
            cls._save_logs(audit_logs)
        except Exception as e:
            print(f"Error logging document audit event: {e}")

    @classmethod
    def _save_logs(cls, logs: List[Dict]):
        """Save audit logs to storage"""
        db.storage.text.put(cls.STORAGE_KEY, json.dumps(logs))

@router.get("/audit/logs")
def get_audit_logs(limit: int = 100):
    """Get audit logs with optional limit"""
    return AuditLogger.get_logs(limit)

@router.get("/audit/logs/document/{document_id}")
def get_document_audit_logs(document_id: str):
    """Get audit logs for a specific document"""
    all_logs = AuditLogger.get_logs()
    document_logs = [
        log for log in all_logs 
        if isinstance(log, dict) and 
        log.get("document_id") == document_id
    ]
    return document_logs