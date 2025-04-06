from typing import Dict, List
import json
import databutton as db
from pydantic import BaseModel, Field
from fastapi import APIRouter, HTTPException, status
from app.apis.auth_utils import get_firebase_admin, get_role_verifier
from app.apis.audit import AuditLogger
from app.apis.models import UserRole, TokenRequest, RolePermissionsResponse, UpdateRolePermissionsRequest

router = APIRouter()

@router.post("/update", response_model=RolePermissionsResponse)
def update_role_permissions(request: UpdateRolePermissionsRequest) -> RolePermissionsResponse:
    firebase = get_firebase_admin()
    role_verifier = get_role_verifier(firebase)

    try:
        # Only super admins can modify permissions
        admin_uid = role_verifier.verify_admin(request.token, UserRole.SUPER_ADMIN)
        
        # Update permissions in storage
        permissions_key = "role_permissions"
        current_permissions = json.loads(db.storage.text.get(permissions_key) or "{}")
        
        # Update permissions for the specified role
        current_permissions[request.role] = request.permissions
        
        # Save updated permissions
        db.storage.text.put(permissions_key, json.dumps(current_permissions))
        
        # Log the action
        AuditLogger.log_event(
            admin_uid=admin_uid,
            action="update_permissions",
            target_uid="system",
            details={
                "role": request.role,
                "new_permissions": request.permissions
            }
        )
        
        return RolePermissionsResponse(
            success=True,
            message=f"Permissions updated successfully for {request.role}",
            permissions=current_permissions
        )
        
    except Exception as e:
        print(f"Error updating permissions: {e}")
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update permissions: {str(e)}"
        ) from e

@router.get("/list", response_model=RolePermissionsResponse)
def get_role_permissions(token: TokenRequest) -> RolePermissionsResponse:
    firebase = get_firebase_admin()
    role_verifier = get_role_verifier(firebase)

    try:
        # Verify admin access (any admin role can view permissions)
        role_verifier.verify_admin(token, UserRole.MODERATOR)
        
        # Get current permissions
        permissions_key = "role_permissions"
        current_permissions = json.loads(db.storage.text.get(permissions_key) or "{}")
        
        return RolePermissionsResponse(
            success=True,
            message="Permissions retrieved successfully",
            permissions=current_permissions
        )
        
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve permissions: {str(e)}"
        ) from e
