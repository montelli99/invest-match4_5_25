from typing import List, Dict, Optional
from functools import lru_cache
import firebase_admin
from firebase_admin import auth

from app.apis.auth_utils import FirebaseError, RoleError
from pydantic import BaseModel, Field
from fastapi import APIRouter, HTTPException
import databutton as db
import json
from datetime import datetime

# Import shared utilities
from app.apis.auth_utils import get_firebase_admin, get_role_verifier

# Import models
from app.apis.models import UserAction, UserRole

# Enhanced role definitions with hierarchical permissions
ROLE_PERMISSIONS = {
    'super_admin': [
        'manage_admins',
        'manage_roles',
        'manage_permissions',
        'view_audit_logs',
        'manage_users',
        'moderate_content',
        'view_reports',
        'manage_settings'
    ],
    'admin': [
        'manage_users',
        'moderate_content',
        'view_reports',
        'manage_settings'
    ],
    'moderator': [
        'moderate_content',
        'view_reports'
    ]
}

router = APIRouter()

# Pydantic models with enhanced validation and documentation
class UserRoleInfo(BaseModel):
    """Information about a user's role and associated permissions"""
    role: UserRole = Field(..., description="The role assigned to the user")
    permissions: List[str] = Field(..., description="List of permissions associated with the role")

class AdminUser(BaseModel):
    """Represents an admin user in the system"""
    uid: str = Field(..., description="Unique identifier for the user")
    email: str = Field(..., description="User's email address")
    roles: List[UserRoleInfo] = Field(..., description="List of roles assigned to the user")
    is_active: bool = Field(..., description="Whether the user account is active")

class UpdateUserStatusRequest(BaseModel):
    """Request model for updating user status"""
    user_ids: List[str] = Field(..., description="IDs of the users to update")
    action: UserAction = Field(..., description="Whether to activate or deactivate the users")
    token: dict = Field(..., description="Authentication token")

class UpdateUserRoleRequest(BaseModel):
    """Request model for updating user roles"""
    user_id: str = Field(..., description="ID of the user to update")
    role: UserRole = Field(..., description="Role to assign or remove")
    action: UserAction = Field(..., description="Whether to add or remove the role")
    token: dict = Field(..., description="Authentication token")

from app.apis.audit import AuditLog

class ListAdminUsersResponse(BaseModel):
    """Response model for listing admin users"""
    users: List[AdminUser] = Field(..., description="List of admin users")

class AdminActionResponse(BaseModel):
    """Response model for admin actions"""
    success: bool = Field(..., description="Whether the action was successful")
    message: str = Field(..., description="Description of the action result")


@router.post("/admin/users/role", response_model=AdminActionResponse)
def update_user_role(request: UpdateUserRoleRequest) -> AdminActionResponse:
    firebase = get_firebase_admin()
    role_verifier = get_role_verifier(firebase)

    """Update user role (add or remove admin/moderator role)"""
    try:
        # Check if this is the first super admin being set up
        page = firebase.list_users()
        has_super_admin = False
        for user in page.users:
            claims = user.custom_claims or {}
            if claims.get('super_admin'):
                has_super_admin = True
                break

        if not has_super_admin and request.role == UserRole.SUPER_ADMIN:
            # Allow setting up first super admin without authentication
            admin_uid = request.user_id
        else:
            # Verify admin has appropriate permissions
            required_role = UserRole.SUPER_ADMIN if request.role == UserRole.SUPER_ADMIN else UserRole.ADMIN
            admin_uid = role_verifier.verify_admin(request.token, required_role)
        
        # Get user and current claims
        user = firebase.get_user(request.user_id)
        current_claims = user.custom_claims or {}
        
        # Update claims based on action
        if request.action == UserAction.ADD:
            current_claims[request.role] = True
            current_claims[f"{request.role}_permissions"] = ROLE_PERMISSIONS[request.role]
        else:  # REMOVE
            current_claims[request.role] = False
            current_claims.pop(f"{request.role}_permissions", None)
        
        # Update user claims
        firebase.update_user_claims(request.user_id, current_claims)
        
        # Log the action
        AuditLogger.log_event(
            admin_uid=admin_uid,
            action=f"{request.action}_role",
            target_uid=request.user_id,
            details={
                "role": request.role,
                "new_claims": current_claims
            }
        )
        
        # Return success response
        action_text = "added to" if request.action == UserAction.ADD else "removed from"
        return AdminActionResponse(
            success=True,
            message=f"User {request.user_id} {action_text} {request.role} role successfully"
        )
        
    except FirebaseError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e
    except RoleError as e:
        raise HTTPException(status_code=403, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e

@router.post("/admin/users/status")
def update_user_status(request: UpdateUserStatusRequest) -> AdminActionResponse:
    firebase = get_firebase_admin()
    role_verifier = get_role_verifier(firebase)

    """Update user status (activate/deactivate)"""
    try:
        # Verify admin has appropriate permissions
        admin_uid = role_verifier.verify_admin(request.token, UserRole.ADMIN)
        
        # Update each user's status
        for user_id in request.user_ids:
            try:
                # Get user
                user = firebase.get_user(user_id)
                
                # Update disabled status based on action
                auth.update_user(
                    user_id,
                    disabled=(request.action == UserAction.DEACTIVATE)
                )
                
                # Log the action
                AuditLogger.log_event(
                    admin_uid=admin_uid,
                    action=f"{request.action}_user",
                    target_uid=user_id,
                    details={
                        "action": request.action,
                        "email": user.email
                    }
                )
            except Exception as e:
                print(f"Error updating user {user_id}: {e}")
        
        # Return success response
        action_text = "activated" if request.action == UserAction.ACTIVATE else "deactivated"
        return AdminActionResponse(
            success=True,
            message=f"{len(request.user_ids)} users {action_text} successfully"
        )
        
    except FirebaseError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e
    except RoleError as e:
        raise HTTPException(status_code=403, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e

@router.post("/admin/users/list", response_model=ListAdminUsersResponse)
def list_admin_users(token: dict) -> ListAdminUsersResponse:
    firebase = get_firebase_admin()
    role_verifier = get_role_verifier(firebase)

    """List all users with admin or moderator roles"""
    try:
        # Allow moderators to view the list
        role_verifier.verify_admin(token, UserRole.MODERATOR)
        
        users = []
        page = firebase.list_users()
        
        for user in page.users:
            claims = user.custom_claims or {}
            roles = []
            
            # Check each possible role
            for role in UserRole:
                if claims.get(role):
                    roles.append(UserRoleInfo(
                        role=role,
                        permissions=claims.get(f"{role}_permissions", ROLE_PERMISSIONS[role])
                    ))
            
            if roles:  # Only include users with admin/moderator roles
                users.append(AdminUser(
                    uid=user.uid,
                    email=user.email,
                    roles=roles,
                    is_active=not user.disabled
                ))
        
        return ListAdminUsersResponse(users=users)
        
    except FirebaseError as e:
        raise HTTPException(status_code=500, detail=str(e)) from e
    except RoleError as e:
        raise HTTPException(status_code=403, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e

from app.apis.audit import AuditLogger

@router.get("/permissions")
def get_admin_role_permissions(token: dict):
    role_verifier = get_role_verifier(get_firebase_admin())

    """Get permissions for all roles"""
    try:
        # Only admins and super admins can view permissions
        role_verifier.verify_admin(token, UserRole.ADMIN)
        
        return {"permissions": ROLE_PERMISSIONS}
        
    except RoleError as e:
        raise HTTPException(status_code=403, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e

@router.get("/admin/audit-logs")
def get_admin_audit_logs(token: dict, limit: int = 100):
    role_verifier = get_role_verifier(get_firebase_admin())

    """Get audit logs for role changes"""
    try:
        # Only admins and super admins can view audit logs
        role_verifier.verify_admin(token, UserRole.ADMIN)
        
        # Get audit logs with limit
        logs = AuditLogger.get_logs(limit)
        return {"logs": logs}
        
    except RoleError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
